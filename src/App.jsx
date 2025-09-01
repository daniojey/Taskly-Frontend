import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router'

import { api } from '../api'
import { AuthProvider } from './AuthContext'

import './App.css'

import Header from './components/Header/Header'

import Homepage from './pages/HomePage/HomePage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import LoginPage from './pages/LoginPage/LoginPage'
import ProtectedRoute from './ProtectedRoute'
import GroupsPage from './pages/GroupsPage/GroupsPage'


function App() {

  return (
    <>
      <Router>
        <AuthProvider>
          <Header />

          <Routes>
            <Route path='/' element={<Homepage />} />
            <Route path='/profile/' element={<ProfilePage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/groups/' element={
                <ProtectedRoute>
                  <GroupsPage/>
                </ProtectedRoute>
            } />
            <Route path='/groups/:groupId' element={
                <ProtectedRoute>
                  <GroupsPage/>
                </ProtectedRoute>
            } />

          </Routes>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
