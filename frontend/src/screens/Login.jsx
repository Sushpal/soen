import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const Login = () => {

    const [email, setEmail]       = useState('')
    const [password, setPassword] = useState('')
    const { handleLogin, loading, error } = useAuth()

    const onSubmit = (e) => {
        e.preventDefault()
        handleLogin(email, password)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">

                <h2 className="text-2xl font-bold text-white mb-6">Login</h2>

                <form onSubmit={onSubmit}>

                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-400 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-400 bg-red-900/20 border border-red-500/25 rounded-lg px-3 py-2 mb-4">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full p-3 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Signing in...' : 'Login'}
                    </button>

                </form>

                <p className="text-gray-400 mt-4">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-500 hover:underline">
                        Create one
                    </Link>
                </p>

            </div>
        </div>
    )
}

export default Login
