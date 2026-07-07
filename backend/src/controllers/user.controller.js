const userModel    = require('../models/user.model')
const userService  = require('../services/user.service')
const redisClient  = require('../services/redis.service')


/**
 * Register a new user
 * POST /api/users/register
 */
async function createUserController(req, res) {

    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({
            message: 'Email and password are required',
            status:  'failed'
        })
    }

    const isExists = await userModel.findOne({ email })

    if (isExists) {
        return res.status(422).json({
            message: 'Email already exists',
            status:  'failed'
        })
    }

    try {

        const user  = await userService.createUser({ email, password })
        const token = user.generateJWT()

        res.cookie('token', token)

        return res.status(201).json({
            message: 'User registered successfully',
            status:  'success',
            data: {
                user: {
                    _id:   user._id,
                    email: user.email
                },
                token
            }
        })

    } catch (err) {
        return res.status(400).json({
            message: err.message,
            status:  'failed'
        })
    }
}

/**
 * Login user
 * POST /api/users/login
 */
async function loginController(req, res) {

    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({
            message: 'Email and password are required',
            status:  'failed'
        })
    }

    try {

        const user = await userModel.findOne({ email }).select('+password')

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password',
                status:  'failed'
            })
        }

        const isMatch = await user.isValidPassword(password)

        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid email or password',
                status:  'failed'
            })
        }

        const token = user.generateJWT()

        res.cookie('token', token)

        return res.status(200).json({
            message: 'User logged in successfully',
            status:  'success',
            data: {
                user: {
                    _id:   user._id,
                    email: user.email
                },
                token
            }
        })

    } catch (err) {
        return res.status(400).json({
            message: err.message,
            status:  'failed'
        })
    }
}

/**
 * Get logged-in user profile
 * GET /api/users/profile
 */
async function profileController(req, res) {
    try {

        // req.user is the full user document from authMiddleware DB lookup
        return res.status(200).json({
            user: {
                _id:   req.user._id,
                email: req.user.email
            }
        })

    } catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
}

/**
 * Logout user — blacklist token in Redis
 * POST /api/users/logout
 */
async function logoutController(req, res) {
    try {

        const token = req.cookies.token || req.headers.authorization?.split(' ')[1]

        if (!token) {
            return res.status(200).json({
                message: 'User logged out successfully'
            })
        }

        await redisClient.set(token, 'logout', 'EX', 60 * 60 * 24)

        res.clearCookie('token')

        return res.status(200).json({
            message: 'User logged out successfully'
        })

    } catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
}

/**
 * Get all users except the logged-in user
 * GET /api/users/all
 */
async function getAllUsersController(req, res) {
    try {

        const allUsers = await userService.getAllUsers({ userId: req.user._id })

        return res.status(200).json({
            users: allUsers
        })

    } catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
}


module.exports = {
    createUserController,
    loginController,
    profileController,
    logoutController,
    getAllUsersController
}