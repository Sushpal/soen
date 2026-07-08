require('dotenv').config()
const http         = require('http')
const app          = require('./src/app')
const connectDB    = require('./src/config/db')
const { Server }   = require('socket.io')
const jwt          = require('jsonwebtoken')
const mongoose     = require('mongoose')
const userModel    = require('./src/models/user.model')
const projectModel = require('./src/models/project.model')
const { generateResult } = require('./src/services/ai.service')


connectDB()


const PORT   = process.env.PORT || 3000
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: [
            'http://localhost:5173',
            'https://soen-pink.vercel.app',
        ],
        credentials: true
    }
})


/**
 * Socket.io auth middleware
 * - Token check first (fail fast)
 * - Full DB lookup for socket.user — same as authMiddleware
 * - Then projectId validation + project lookup
 */
io.use(async (socket, next) => {
    try {

        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1]

        if (!token) {
            return next(new Error('Authentication error'))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (!decoded) {
            return next(new Error('Authentication error'))
        }

        // Full DB lookup — consistent with authMiddleware
        const user = await userModel.findById(decoded.userId)

        if (!user) {
            return next(new Error('Authentication error'))
        }

        socket.user = user

        const projectId = socket.handshake.query.projectId

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error('Invalid projectId'))
        }

        const project = await projectModel.findById(projectId)

        if (!project) {
            return next(new Error('Project not found'))
        }

        socket.project = project

        next()

    } catch (error) {
        next(error)
    }
})


io.on('connection', socket => {

    socket.roomId = socket.project._id.toString()

    console.log('a user connected')

    socket.join(socket.roomId)

    socket.on('project-message', async data => {

        const message              = data.message
        const aiIsPresentInMessage = message.includes('@ai')

        socket.broadcast.to(socket.roomId).emit('project-message', data)

        // Persist the human message so chat history survives page refresh
        try {
            await projectModel.findByIdAndUpdate(socket.project._id, {
                $push: {
                    messages: {
                        sender:  { _id: socket.user._id.toString(), email: socket.user.email },
                        message: data.message
                    }
                }
            })
        } catch (err) {
            console.log('Failed to save message:', err)
        }

        if (aiIsPresentInMessage) {

            const prompt = message.replace('@ai', '')

            const project     = await projectModel.findById(socket.project._id)
            const fileContext = Object.entries(project.fileTree || {})
                .map(([name, file]) => `File: ${name}\n${file.file.contents}`)
                .join('\n\n')

            const fullPrompt = fileContext
                ? `Existing codebase:\n${fileContext}\n\nUser request: ${prompt}`
                : prompt

            try {
                const result    = await generateResult(fullPrompt)
                const sanitized = result.replace(/listen\(\s*3000/g, 'listen(8080')

                JSON.parse(sanitized)

                const aiMessage = {
                    message: sanitized,
                    sender:  { _id: 'ai', email: 'AI' }
                }

                await projectModel.findByIdAndUpdate(socket.project._id, {
                    $push: { messages: aiMessage }
                })

                io.to(socket.roomId).emit('project-message', aiMessage)

            } catch (error) {

                const errorMessage = {
                    message: JSON.stringify({ text: 'AI generated invalid response. Please try again.' }),
                    sender:  { _id: 'ai', email: 'AI' }
                }

                await projectModel.findByIdAndUpdate(socket.project._id, {
                    $push: { messages: errorMessage }
                }).catch(err => console.log('Failed to save error message:', err))

                io.to(socket.roomId).emit('project-message', errorMessage)
            }

            return
        }
    })

    // Relay file edits to everyone else in the project room
    socket.on('file-tree-update', data => {
        socket.broadcast.to(socket.roomId).emit('file-tree-update', data)
    })

    socket.on('disconnect', () => {
        console.log('user disconnected')
        socket.leave(socket.roomId)
    })
})


server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})