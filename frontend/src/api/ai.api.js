import api from './axios'

export const getAiResultAPI = (prompt) =>
    api.get('/api/ai/get-result', {
        params: { prompt }
    })