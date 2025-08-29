import { useEffect, useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router'
import Homepage from './pages/HomePage/HomePage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import Header from './components/Header/Header'
import { api } from '../api'
import { AuthProvider } from './AuthContext'
import LoginPage from './pages/LoginPage/LoginPage'


function App() {

  return (
    <>
      <Router>
        <AuthProvider>
          <Header />

          <Routes>
            <Route path='/' element={<Homepage />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/login' element={<LoginPage />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
