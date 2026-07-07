import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserContext } from '../context/user.context'
import useProject from '../hooks/useProject'
import useAuth from '../hooks/useAuth'

const Home = () => {

    const { user }                                 = useUserContext()
    const navigate                                 = useNavigate()
    const { fetchProjects, createProject,
            loading, error }                       = useProject()
    const { handleLogout, loading: logoutLoading } = useAuth()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [projectName, setProjectName] = useState('')
    const [projects, setProjects]       = useState([])
    const [createError, setCreateError] = useState(null)

    useEffect(() => {
        const loadProjects = async () => {
            const data = await fetchProjects()
            setProjects(data)
        }
        loadProjects()
    }, [fetchProjects])

    const handleCreateProject = async (e) => {
        e.preventDefault()
        setCreateError(null)

        const result = await createProject(projectName)

        if (result.success) {
            setProjects((prev) => [...prev, result.project])
            setIsModalOpen(false)
            setProjectName('')
        } else {
            setCreateError(result.message)
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col">

            {/* Navbar */}
            <header className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800">
                <span className="text-white font-semibold text-lg tracking-tight">
                    soen
                </span>

                <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">{user?.email}</span>
                    <button
                        onClick={handleLogout}
                        disabled={logoutLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 border border-gray-700 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {logoutLoading ? 'Signing out...' : 'Sign out'}
                    </button>
                </div>
            </header>

            {/* Main */}
            <main className="p-6 flex-grow">

                <div className="mb-6">
                    <h1 className="text-white text-xl font-semibold">Projects</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Select a project or create a new one
                    </p>
                </div>

                {/* Fix 4 — Loading state */}
                {loading && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <div className="w-4 h-4 border-2 border-gray-600 border-t-gray-300 rounded-full animate-spin" />
                        Loading projects...
                    </div>
                )}

                {/* Fix 5 — Error state */}
                {!loading && error && (
                    <div className="flex items-center justify-between bg-red-950 border border-red-800 rounded-lg px-4 py-3 mb-4">
                        <p className="text-sm text-red-400">{error}</p>
                        <button
                            onClick={() => fetchProjects().then(data => setProjects(data))}
                            className="text-xs text-red-400 hover:text-red-300 underline ml-4"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <div className="flex flex-wrap gap-3">

                        <button
                            onClick={() => { setIsModalOpen(true); setCreateError(null) }}
                            className="flex items-center gap-2 p-4 border border-dashed border-gray-700 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors min-w-52"
                        >
                            <i className="ri-add-line"></i>
                            New Project
                        </button>

                        {projects.length === 0 && (
                            <div className="flex items-center px-4 py-4">
                                <p className="text-gray-600 text-sm">
                                    No projects yet — create your first one!
                                </p>
                            </div>
                        )}

                        {projects.map((project) => (
                            <div
                                key={project._id}
                                onClick={() => navigate('/project', { state: { project } })}
                                className="flex flex-col gap-2 cursor-pointer p-4 border border-gray-800 rounded-lg min-w-52 hover:bg-gray-900 hover:border-gray-700 transition-colors"
                            >
                                <h2 className="text-white font-semibold">{project.name}</h2>
                                <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                                    <i className="ri-user-line text-xs"></i>
                                    <span>
                                        {project.users.length} collaborator{project.users.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        ))}

                    </div>
                )}

            </main>

            {/* Create Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
                    <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">

                        <h2 className="text-white text-lg font-semibold mb-5">
                            New Project
                        </h2>

                        <form onSubmit={handleCreateProject}>

                            <div className="mb-4">
                                <label className="block text-sm text-gray-400 mb-1.5">
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    required
                                    placeholder="my-awesome-app"
                                    className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-md text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-500"
                                />
                            </div>

                            {createError && (
                                <p className="text-sm text-red-400 mb-3">{createError}</p>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); setCreateError(null) }}
                                    className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 text-sm rounded-md hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Create'}
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            )}

        </div>
    )
}

export default Home
