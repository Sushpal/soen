const express      = require('express')
const cookieParser = require('cookie-parser')
const cors         = require('cors')
const morgan       = require('morgan')

// Routes
const userRoutes    = require('./routes/user.routes')
const projectRoutes = require('./routes/project.routes')
const aiRoutes      = require('./routes/ai.routes')
const githubRoutes  = require('./routes/github.routes')

// Rate limiters
const { globalLimiter } = require('./middleware/rateLimiter')


const app = express()

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://soen.vercel.app'
    ],
    credentials: true
}))

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Apply global rate limiter to all routes
app.use(globalLimiter)

// use Routes
app.use('/api/users',    userRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/ai',       aiRoutes)
app.use('/api/github',   githubRoutes)


module.exports = app