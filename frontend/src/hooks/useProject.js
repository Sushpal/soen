import { useState, useCallback } from 'react'
import {
    createProjectAPI,
    getAllProjectsAPI,
    getProjectByIdAPI,
    addCollaboratorsAPI,
    updateFileTreeAPI
} from '../api/project.api'
import { getAllUsersAPI } from '../api/user.api'

const useProject = () => {

    const [loading, setLoading] = useState(false)
    const [error, setError]     = useState(null)

    const fetchProjects = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await getAllProjectsAPI()
            return res.data.projects || []
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch projects')
            return []
        } finally {
            setLoading(false)
        }
    }, [])

    const createProject = async (name) => {
        setLoading(true)
        setError(null)
        try {
            const res = await createProjectAPI({ name })
            return { success: true, project: res.data.project }
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to create project'
            setError(message)
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }

    const fetchProject = async (projectId) => {
        setLoading(true)
        setError(null)
        try {
            const res = await getProjectByIdAPI(projectId)
            return res.data.project
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch project')
            return null
        } finally {
            setLoading(false)
        }
    }

    const fetchUsers = async () => {
        try {
            const res = await getAllUsersAPI()
            return res.data.users || []
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch users')
            return []
        }
    }

    const addCollaborators = async (projectId, users) => {
        try {
            await addCollaboratorsAPI({ projectId, users })
            return { success: true }
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to add collaborators'
            setError(message)
            return { success: false, message }
        }
    }

    const saveFileTree = async (projectId, fileTree) => {
        try {
            await updateFileTreeAPI({ projectId, fileTree })
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save file')
        }
    }

    return {
        loading,
        error,
        fetchProjects,
        createProject,
        fetchProject,
        fetchUsers,
        addCollaborators,
        saveFileTree
    }
}

export default useProject