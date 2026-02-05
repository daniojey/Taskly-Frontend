import { BrowserRouter as Router, Routes, Route } from 'react-router'

import { AuthProvider } from './AuthContext'

import './App.css'

import Header from './components/Header/Header'

import Homepage from './pages/HomePage/HomePage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import LoginPage from './pages/LoginPage/LoginPage'
import RegistrationPage from './pages/RegistrationPage/RegistrationPage'
import ProtectedRoute from './ProtectedRoute'
import GroupsPage from './pages/GroupsPage/GroupsPage'
import GroupPageDetail from './pages/GroupPageDetail/GroupPageDetail'
import ProjectBasePage from './pages/ProjectBasePage/ProjectBasePage'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import Notification from './components/Notification/Notification'
import NotificationPage from './pages/NotificationPage/NotificationPage'
import GroupLogsPage from './pages/GroupLogsPage/GroupLogsPage'
import { OneTimerProvider } from './OneTimerContext'

const queryClient = new QueryClient()

function App() {

  return (
    <>
      <Router>
        <AuthProvider>
          <OneTimerProvider>
          <QueryClientProvider client={queryClient}>

            <Notification/>
            <Header />

            <Routes>
              <Route path='/' element={<Homepage />} />
              <Route path='/profile/' element={<ProfilePage />} />
              <Route path='/register/' element={<RegistrationPage />}/>
              <Route path='/login' element={<LoginPage />} />
              <Route path='/groups/' element={
                  <ProtectedRoute>
                    <GroupsPage/>
                  </ProtectedRoute>
              } />
              <Route path='/groups/:groupId' element={
                  <ProtectedRoute>
                    <GroupPageDetail/>
                  </ProtectedRoute>
              } />

              <Route path='/group/:groupId/logs' element={
                <ProtectedRoute>
                  <GroupLogsPage />
                </ProtectedRoute>
              }/>

              <Route path='/projects/:projectId/group/:groupId/' element={
                <ProtectedRoute>
                  <ProjectBasePage/>
                </ProtectedRoute>
              }/>

              <Route path='/profile/:username/notification/' element={
                <ProtectedRoute>
                  <NotificationPage/>
                </ProtectedRoute>
              }/>
              
            </Routes>
          </QueryClientProvider>
          </OneTimerProvider>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
