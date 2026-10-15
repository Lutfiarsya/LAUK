import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router'
import Home from './components/Home'
import { BottomBar } from './components/BottomBar'
import Insight from './components/Insight'
import ScanProduct from './components/ScanProduct'
import AIChat from './components/AIChat'
import Profile from './components/Profile'
import DetailGizi from './components/DetailGizi'

const NO_BOTTOM_BAR = ['/scan']

function AppRoutes() {
  const { pathname } = useLocation() // aman, sudah di dalam <Router>
  const hideBottomBar = NO_BOTTOM_BAR.some((p) => pathname.startsWith(p))

  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/insight' element={<Insight />} />
        <Route path='/scan' element={<ScanProduct />} />
        <Route path='/ai-consultant' element={<AIChat />} />
        <Route path='/profile' element={<Profile />} />
        <Route path="/detail-gizi" element={<DetailGizi />}/>
      </Routes>
      {!hideBottomBar && <BottomBar />}
    </>
  )
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}

export default App