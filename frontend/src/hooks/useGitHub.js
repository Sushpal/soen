import { useState } from 'react'
import api from '../api/axios'

const useGitHub = () => {

    const [loading, setLoading] = useState(false)
    const [error, setError]     = useState(null)
    const [repoUrl, setRepoUrl] = useState(null)

    const pushToGitHub = async ({ token, repoName, isPrivate, fileTree }) => {
        setLoading(true)
        setError(null)
        setRepoUrl(null)

        try {

            // 1. Get authenticated GitHub user via backend proxy
            const userRes = await api.post('/api/github/user', { token })
            const username = userRes.data.user.login

            // 2. Create repository via backend proxy
            const repoRes = await api.post('/api/github/create-repo', {
                token,
                repoName,
                isPrivate
            })

            const repoHtmlUrl = repoRes.data.repo.html_url

            // 3. Push each file via backend proxy
            const files = Object.entries(fileTree)

            for (const [filename, fileData] of files) {
                const contents = fileData?.file?.contents || ''
                const encoded = btoa(unescape(encodeURIComponent(contents)))

                await api.post('/api/github/push-file', {
                    token,
                    username,
                    repoName,
                    filename,
                    content: encoded
                })
            }

            setRepoUrl(repoHtmlUrl)
            return { success: true, repoUrl: repoHtmlUrl }

        } catch (err) {
            const message = err.response?.data?.message || 'Failed to push to GitHub'
            setError(message)
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }

    const clearResult = () => {
        setError(null)
        setRepoUrl(null)
    }

    return {
        pushToGitHub,
        loading,
        error,
        repoUrl,
        clearResult
    }
}

export default useGitHub