const express        = require('express')
const authMiddleware = require('../middleware/auth.middleware')
const aiController   = require('../controllers/ai.controller')
const { aiLimiter }  = require('../middleware/rateLimiter')


const router = express.Router()


/* GET /api/ai/get-result — AI rate limit */
router.get('/get-result',
    authMiddleware.authMiddleware,
    aiLimiter,
    aiController.getResult
)


module.exports = router