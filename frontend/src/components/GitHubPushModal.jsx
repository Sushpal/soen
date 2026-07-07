import { useState } from 'react'

const GitHubPushModal = ({ isOpen, onClose, onPush, loading }) => {

    const [token, setToken]       = useState('')
    const [repoName, setRepoName] = useState('')
    const [isPrivate, setIsPrivate] = useState(false)
    const [error, setError]       = useState(null)

    if (!isOpen) return null

    const handleSubmit = (e) => {
        e.preventDefault()
        setError(null)

        if (!token.trim()) {
            setError('GitHub token is required')
            return
        }
        if (!repoName.trim()) {
            setError('Repository name is required')
            return
        }
        if (!/^[a-zA-Z0-9_.-]+$/.test(repoName.trim())) {
            setError('Repository name can only contain letters, numbers, hyphens, dots and underscores')
            return
        }

        onPush({ token: token.trim(), repoName: repoName.trim(), isPrivate })
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">

                <header className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                        <h2 className="text-lg font-semibold">Push to GitHub</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                    >
                        ×
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">
                            GitHub Personal Access Token
                        </label>
                        <input
                            type="password"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            required
                            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                            className="w-full p-2.5 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-400"
                        />
                        <p className="text-xs text-gray-500">
                            GitHub → Settings → Developer settings → Personal access tokens → Generate (select <strong>repo</strong> scope)
                        </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">
                            Repository Name
                        </label>
                        <input
                            type="text"
                            value={repoName}
                            onChange={(e) => setRepoName(e.target.value)}
                            required
                            placeholder="my-awesome-project"
                            className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isPrivate"
                            checked={isPrivate}
                            onChange={(e) => setIsPrivate(e.target.checked)}
                            className="w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="isPrivate" className="text-sm text-gray-700 cursor-pointer">
                            Private repository
                        </label>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                            {error}
                        </p>
                    )}

                    <div className="flex gap-3 mt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Pushing...
                                </>
                            ) : (
                                <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                                    </svg>
                                    Push to GitHub
                                </>
                            )}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    )
}

export default GitHubPushModal
