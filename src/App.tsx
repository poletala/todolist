
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/authProvider/AuthProvider';
import { LoginPage } from './pages/loginPage/LoginPage'
import { MainPage } from './pages/mainPage/MainPage';
import { ProtectedRoute } from './components/protectedRoute/ProtectedRoute';


function App() {

  return (
    
      <Router>
        <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/tasks" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
          <Route path="*" element={<LoginPage />} />
        </Routes>
        </AuthProvider>
      </Router>
    
  )
}

export default App
