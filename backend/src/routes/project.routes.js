const express           = require('express')
const authMiddleware    = require('../middleware/auth.middleware')
const projectController = require('../controllers/project.controller')


const router = express.Router()


/* POST /api/projects/create */
router.post('/create',
    authMiddleware.authMiddleware,
    projectController.createProject
)

/* GET /api/projects/all */
router.get('/all',
    authMiddleware.authMiddleware,
    projectController.getAllProject
)

/* PUT /api/projects/add-user */
router.put('/add-user',
    authMiddleware.authMiddleware,
    projectController.addUserToProject
)

/* GET /api/projects/get-project/:projectId */
router.get('/get-project/:projectId',
    authMiddleware.authMiddleware,
    projectController.getProjectById
)

/* PUT /api/projects/update-file-tree */
router.put('/update-file-tree',
    authMiddleware.authMiddleware,
    projectController.updateFileTree
)


module.exports = router