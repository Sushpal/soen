import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginAPI, registerAPI, logoutAPI } from '../api/user.api'
import { useUserContext } from '../context/user.context'

const useAuth = () => {

    const { login, logout } = useUserContext()
    const navigate          = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError]     = useState(null)

    const register = async (email, password) => {
        setLoading(true)
        setError(null)
        try {
            const res = await registerAPI({ email, password })
            // Backend returns { data: { user, token } } — same as LedgerX shape
            login(res.data.data.user, res.data.data.token)
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    const handleLogin = async (email, password) => {
        setLoading(true)
        setError(null)
        try {
            const res = await loginAPI({ email, password })
            login(res.data.data.user, res.data.data.token)
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logoutAPI()
        } catch {
            // Even if API fails, clear local session
        } finally {
            logout()
            navigate('/login')
            setLoading(false)
        }
    }

    return { register, handleLogin, handleLogout, loading, error }
}

export default useAuth