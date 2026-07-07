const jwt        = require('jsonwebtoken')
const userModel  = require('../models/user.model')
const redisClient = require('../services/redis.service')


async function authMiddleware(req, res, next) {

    const token = req.cookies.token || req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({
            message: 'Unauthorized access, token is missing'
        })
    }

    const isBlacklisted = await redisClient.get(token)

    if (isBlacklisted) {
        res.cookie('token', '')
        return res.status(401).json({
            message: 'Unauthorized access, token is invalid'
        })
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Full DB lookup — same pattern as LedgerX
        // so req.user is always the complete user document, not just JWT payload
        const user = await userModel.findById(decoded.userId)

        if (!user) {
            return res.status(401).json({
                message: 'Unauthorized access, user not found'
            })
        }

        req.user = user

        return next()

    } catch (err) {

        return res.status(401).json({
            message: 'Unauthorized access, token is invalid'
        })
    }
}


module.exports = { authMiddleware }