import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router'
import Homepage from './pages/HomePage/HomePage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import Header from './components/Header/Header'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router>
        <Header/>

        <Routes>
          <Route path='/' element={<Homepage />}/>
          <Route path='/profile' element={<ProfilePage />}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
