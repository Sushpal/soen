import { BrowserRouter } from 'react-router-dom'
import { UserProvider }  from './context/user.context'
import AppRoutes         from './routes/AppRoutes'

const App = () => {
    return (
        <BrowserRouter>
            <UserProvider>
                <AppRoutes />
            </UserProvider>
        </BrowserRouter>
    )
}

export default App
