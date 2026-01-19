import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import PartnerForm from './pages/PartnerForm'
import AdminDashboard from './pages/AdminDashboard'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-brand">创新活动合作伙伴信息收集</Link>
            <div className="nav-links">
              <Link to="/admin">管理后台</Link>
            </div>
          </div>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<PartnerForm />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
