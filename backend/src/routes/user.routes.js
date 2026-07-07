const express        = require('express')
const authMiddleware = require('../middleware/auth.middleware')
const userController = require('../controllers/user.controller')
const { authLimiter } = require('../middleware/rateLimiter')


const router = express.Router()


/* POST /api/users/register — strict rate limit */
router.post('/register', authLimiter, userController.createUserController)

/* POST /api/users/login — strict rate limit */
router.post('/login', authLimiter, userController.loginController)

/* GET /api/users/profile */
router.get('/profile', authMiddleware.authMiddleware, userController.profileController)

/* POST /api/users/logout */
router.post('/logout', authMiddleware.authMiddleware, userController.logoutController)

/* GET /api/users/all */
router.get('/all', authMiddleware.authMiddleware, userController.getAllUsersController)


module.exports = router