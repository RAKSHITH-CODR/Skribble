import { useState } from 'react'
import { BrowserRouter, Routes, Route} from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoutes from './components/ProtectedRoutes'
import DashBoard from './pages/DashBoard'

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        
         <Route path='/' element={<ProtectedRoutes><DashBoard /></ProtectedRoutes>} />
         <Route path='/dashboard' element={<ProtectedRoutes><DashBoard /></ProtectedRoutes>} />
         {/* Add other protected routes here */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
