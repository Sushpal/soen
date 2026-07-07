import { Routes, Route, Navigate } from 'react-router-dom'
import { useUserContext } from '../context/user.context'

import Login    from '../screens/Login'
import Register from '../screens/Register'
import Home     from '../screens/Home'
import Project  from '../screens/Project'

const ProtectedRoute = ({ children }) => {
    const { token, loading } = useUserContext()
    if (loading) return null
    return token ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
    const { token, loading } = useUserContext()
    if (loading) return null
    return !token ? children : <Navigate to="/" replace />
}

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public */}
            <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* Protected */}
            <Route path="/"         element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/project"  element={<ProtectedRoute><Project /></ProtectedRoute>} />

            {/* Default */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default AppRoutes
