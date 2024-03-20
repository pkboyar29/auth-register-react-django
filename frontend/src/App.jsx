import { Routes, Route, Navigate } from 'react-router-dom';

// pages
import RegisterPage from './pages/RegisterPage';
import AuthPage from './pages/AuthPage';
import PersonalAccountPage from './pages/PersonalAccountPage';

function App() {

  return (
    <div className="App">

      <Routes>
        <Route path="/auth" element={<AuthPage />}></Route>
        <Route path="/register" element={<RegisterPage />}></Route>
        <Route path="/personal-account" element={<PersonalAccountPage />}></Route>
        <Route path="/" element={<Navigate to="/auth" />} />
        {/* comment */}
      </Routes>
    </div>
  );
}

export default App;