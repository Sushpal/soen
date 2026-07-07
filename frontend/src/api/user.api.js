import api from './axios'

export const registerAPI = (data) =>
    api.post('/api/users/register', data)

export const loginAPI = (data) =>
    api.post('/api/users/login', data)

export const logoutAPI = () =>
    api.post('/api/users/logout', {})

export const getProfileAPI = () =>
    api.get('/api/users/profile')

export const getAllUsersAPI = () =>
    api.get('/api/users/all')