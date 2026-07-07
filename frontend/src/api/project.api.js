import api from './axios'

export const createProjectAPI = (data) =>
    api.post('/api/projects/create', data)

export const getAllProjectsAPI = () =>
    api.get('/api/projects/all')

export const getProjectByIdAPI = (projectId) =>
    api.get(`/api/projects/get-project/${projectId}`)

export const addCollaboratorsAPI = (data) =>
    api.put('/api/projects/add-user', data)

export const updateFileTreeAPI = (data) =>
    api.put('/api/projects/update-file-tree', data)