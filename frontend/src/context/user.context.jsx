import { createContext, useContext, useState, useEffect } from 'react'

const UserContext = createContext(null)

export const UserProvider = ({ children }) => {

    const [user, setUser]       = useState(null)
    const [token, setToken]     = useState(null)
    const [loading, setLoading] = useState(true)

    // Restore session on page refresh
    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        const storedUser  = localStorage.getItem('user')

        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
        }

        setLoading(false)
    }, [])

    const login = (userData, jwtToken) => {
        setUser(userData)
        setToken(jwtToken)
        localStorage.setItem('token', jwtToken)
        localStorage.setItem('user', JSON.stringify(userData))
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    return (
        <UserContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUserContext = () => {
    const context = useContext(UserContext)
    if (!context) {
        throw new Error('useUserContext must be used inside UserProvider')
    }
    return context
}

export { UserContext }
