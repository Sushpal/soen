const projectModel = require('../models/project.model')
const mongoose     = require('mongoose')


async function createProject({ name, userId }) {

    if (!name) {
        throw new Error('Name is required')
    }
    if (!userId) {
        throw new Error('UserId is required')
    }

    let project
    try {
        project = await projectModel.create({
            name,
            users: [userId]
        })
    } catch (error) {
        if (error.code === 11000) {
            throw new Error('Project name already exists')
        }
        throw error
    }

    return project
}

async function getAllProjectByUserId({ userId }) {

    if (!userId) {
        throw new Error('UserId is required')
    }

    const allUserProjects = await projectModel.find({
        users: userId
    })

    return allUserProjects
}

async function addUsersToProject({ projectId, users, userId }) {

    if (!projectId) {
        throw new Error('projectId is required')
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid projectId')
    }

    if (!users || !Array.isArray(users)) {
        throw new Error('users array is required')
    }

    if (users.some(id => !mongoose.Types.ObjectId.isValid(id))) {
        throw new Error('Invalid userId(s) in users array')
    }

    if (!userId) {
        throw new Error('userId is required')
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid userId')
    }

    const project = await projectModel.findOne({
        _id:   projectId,
        users: userId
    })

    if (!project) {
        throw new Error('User does not belong to this project')
    }

    const updatedProject = await projectModel.findOneAndUpdate(
        { _id: projectId },
        { $addToSet: { users: { $each: users } } },
        { new: true }
    )

    return updatedProject
}

async function getProjectById({ projectId }) {

    if (!projectId) {
        throw new Error('projectId is required')
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid projectId')
    }

    const project = await projectModel.findOne({
        _id: projectId
    }).populate('users')

    return project
}

async function updateFileTree({ projectId, fileTree, userId }) {

    if (!projectId) {
        throw new Error('projectId is required')
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid projectId')
    }

    if (!userId) {
        throw new Error('userId is required')
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid userId')
    }

    if (!fileTree) {
        throw new Error('fileTree is required')
    }

    const project = await projectModel.findOneAndUpdate(
        {
            _id: projectId,
            users: userId
        },
        {
            fileTree
        },
        {
            new: true
        }
    )

    if (!project) {
        throw new Error('Project not found or you do not have permission to update it')
    }

    return project
}


module.exports = {
    createProject,
    getAllProjectByUserId,
    addUsersToProject,
    getProjectById,
    updateFileTree
}