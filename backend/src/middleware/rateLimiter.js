const rateLimit = require('express-rate-limit')


/**
 * Global rate limiter — applied to all routes
 * Protects server from DDoS attacks
 * 100 requests per 15 minutes per IP
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many requests, please try again after 15 minutes'
    }
})


/**
 * Auth rate limiter — applied to login and register routes
 * Protects from brute force password attacks
 * 10 attempts per 15 minutes per IP
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many login attempts, please try again after 15 minutes'
    }
})


/**
 * AI rate limiter — applied to AI routes
 * Protects from OpenAI API cost explosion
 * 20 requests per hour per IP
 */
const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'AI request limit reached, please try again after 1 hour'
    }
})


module.exports = {
    globalLimiter,
    authLimiter,
    aiLimiter
}