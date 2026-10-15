import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router'
import Home from './components/Home'
import { BottomBar } from './components/BottomBar'
import Insight from './components/Insight'
import ScanProduct from './components/ScanProduct'
import AIChat from './components/AIChat'
import Profile from './components/Profile'

function App() {
 return(
  <Router>
    <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/insight' element={<Insight/>}/>
        <Route path='/scan' element={<ScanProduct/>}/>
        <Route path='/ai-consultant' element={<AIChat/>}/>
        <Route path='/profile' element={<Profile/>}/>
    </Routes>
    <BottomBar/>
  </Router>
 )
}

export default App
