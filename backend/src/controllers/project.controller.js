const projectService = require('../services/project.service')
const mongoose       = require('mongoose')


/**
 * Create a new project
 * POST /api/projects/create
 */
async function createProject(req, res) {

    const { name } = req.body

    if (!name || typeof name !== 'string') {
        return res.status(400).json({
            message: 'Project name is required'
        })
    }

    try {

        const newProject = await projectService.createProject({
            name,
            userId: req.user._id
        })

        return res.status(201).json({
            project: newProject
        })

    } catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
}

/**
 * Get all projects for logged-in user
 * GET /api/projects/all
 */
async function getAllProject(req, res) {
    try {

        const allUserProjects = await projectService.getAllProjectByUserId({
            userId: req.user._id
        })

        return res.status(200).json({
            projects: allUserProjects
        })

    } catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
}

/**
 * Add users to a project
 * PUT /api/projects/add-user
 */
async function addUserToProject(req, res) {

    const { projectId, users } = req.body

    if (!projectId) {
        return res.status(400).json({
            message: 'projectId is required'
        })
    }

    if (!users || !Array.isArray(users) || users.length === 0) {
        return res.status(400).json({
            message: 'users must be a non-empty array'
        })
    }

    try {

        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId: req.user._id
        })

        return res.status(200).json({
            project
        })

    } catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
}

/**
 * Get a project by ID
 * GET /api/projects/get-project/:projectId
 * 
 * FIX: ownership check added — only users who belong
 * to the project can fetch it
 */
async function getProjectById(req, res) {

    const { projectId } = req.params

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({
            message: 'Invalid projectId'
        })
    }

    try {

        const project = await projectService.getProjectById({ projectId })

        if (!project) {
            return res.status(404).json({
                message: 'Project not found'
            })
        }

        // Ownership check — user must be a member of the project
        const isMember = project.users.some(
            u => u._id.toString() === req.user._id.toString()
        )

        if (!isMember) {
            return res.status(403).json({
                message: 'Access denied — you are not a member of this project'
            })
        }

        return res.status(200).json({
            project
        })

    } catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
}

/**
 * Update file tree for a project
 * PUT /api/projects/update-file-tree
 */
async function updateFileTree(req, res) {

    const { projectId, fileTree } = req.body

    if (!projectId) {
        return res.status(400).json({
            message: 'projectId is required'
        })
    }

    if (!fileTree || typeof fileTree !== 'object') {
        return res.status(400).json({
            message: 'fileTree is required and must be an object'
        })
    }

    try {

        const project = await projectService.updateFileTree({
            projectId,
            fileTree,
            userId: req.user._id
        })

        return res.status(200).json({
            project
        })

    } catch (err) {
        return res.status(400).json({
            message: err.message
        })
    }
}


module.exports = {
    createProject,
    getAllProject,
    addUserToProject,
    getProjectById,
    updateFileTree
}