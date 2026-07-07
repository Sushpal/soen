const express          = require('express')
const authMiddleware   = require('../middleware/auth.middleware')
const githubController = require('../controllers/github.controller')


const router = express.Router()


/* POST /api/github/user */
router.post('/user',
    authMiddleware.authMiddleware,
    githubController.getGitHubUser
)

/* POST /api/github/create-repo */
router.post('/create-repo',
    authMiddleware.authMiddleware,
    githubController.createRepo
)

/* POST /api/github/push-file */
router.post('/push-file',
    authMiddleware.authMiddleware,
    githubController.pushFile
)


module.exports = router