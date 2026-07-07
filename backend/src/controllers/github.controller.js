const axios = require('axios')

/**
 * Proxy GitHub API calls through backend to avoid CORS issues
 * caused by Cross-Origin-Embedder-Policy header on frontend
 */

async function getGitHubUser(req, res) {
    try {
        const { token } = req.body

        const response = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json'
            }
        })

        return res.status(200).json({
            user: response.data
        })

    } catch (err) {
        return res.status(err.response?.status || 500).json({
            message: err.response?.data?.message || 'Invalid GitHub token'
        })
    }
}

async function createRepo(req, res) {
    try {
        const { token, repoName, isPrivate } = req.body

        const response = await axios.post(
            'https://api.github.com/user/repos',
            {
                name:        repoName,
                private:     isPrivate,
                description: 'Created with Soen — AI-powered collaborative coding platform',
                auto_init:   false
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github+json',
                    'Content-Type': 'application/json'
                }
            }
        )

        return res.status(201).json({
            repo: response.data
        })

    }  catch (err) {
    
        if (err.response?.status === 422) {
            return res.status(422).json({
            message: `Repository already exists on your GitHub account`
        })
        }
        return res.status(err.response?.status || 500).json({
        message: err.response?.data?.message || 'Failed to create repository'
    })
}}



async function pushFile(req, res) {
    try {
        const { token, username, repoName, filename, content } = req.body

        const response = await axios.put(
            `https://api.github.com/repos/${username}/${repoName}/contents/${filename}`,
            {
                message: `Add ${filename}`,
                content: content // already base64 encoded from frontend
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github+json',
                    'Content-Type': 'application/json'
                }
            }
        )

        return res.status(200).json({
            file: response.data
        })

    } catch (err) {
        return res.status(err.response?.status || 500).json({
            message: err.response?.data?.message || `Failed to push ${filename}`
        })
    }
}


module.exports = {
    getGitHubUser,
    createRepo,
    pushFile
}