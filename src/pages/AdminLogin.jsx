import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import '../index.css';

const API_BASE = import.meta.env.VITE_API_BASE || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : `http://${window.location.hostname}:5000`);

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [viewMode, setViewMode] = useState('login'); // login, forgot, reset
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await axios.post(`${API_BASE}/api/admin/login`, { username, password });
      if (res.data.token) {
        localStorage.setItem('adminToken', res.data.token);
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await axios.post(`${API_BASE}/api/admin/forgot-password`, { username });
      setMessage(res.data.message);
      setViewMode('reset');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await axios.post(`${API_BASE}/api/admin/reset-password`, { username, otp, newPassword });
      setMessage(res.data.message);
      setTimeout(() => {
        setViewMode('login');
        setPassword('');
        setOtp('');
        setNewPassword('');
        setMessage('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    }
  };

  return (
    <div className="admin-login-container">
      <Link to="/" className="back-home-btn">
        <ArrowLeft size={24} />
        <span>Back to Home</span>
      </Link>
      <div className="login-box popup-content">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {viewMode === 'login' ? 'Admin Login' : viewMode === 'forgot' ? 'Forgot Password' : 'Reset Password'}
        </h2>
        {error && <p className="error-msg">{error}</p>}
        {message && <p className="success-msg" style={{ color: '#2ecc71', background: 'rgba(46, 204, 113, 0.1)', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center', fontSize: '0.9rem' }}>{message}</p>}
        
        {viewMode === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input type="text" className="form-control" value={username} onChange={(e)=>setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-control" 
                  value={password} 
                  onChange={(e)=>setPassword(e.target.value)} 
                  required 
                  style={{ paddingRight: '40px' }}
                />
                <span 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '15px' }}>
              <span onClick={() => { setViewMode('forgot'); setError(''); setMessage(''); }} style={{ color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.85rem' }}>Forgot Password?</span>
            </div>
            <button type="submit" className="submit-btn" style={{ marginTop: '1rem' }}>LOGIN</button>
          </form>
        )}

        {viewMode === 'forgot' && (
          <form onSubmit={handleForgotPassword}>
            <div className="form-group">
              <label>Enter Admin Username</label>
              <input type="text" className="form-control" value={username} onChange={(e)=>setUsername(e.target.value)} required />
            </div>
            <button type="submit" className="submit-btn" style={{ marginTop: '1rem' }}>SEND OTP</button>
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <span onClick={() => { setViewMode('login'); setError(''); setMessage(''); }} style={{ color: '#aaa', cursor: 'pointer', fontSize: '0.85rem' }}>Back to Login</span>
            </div>
          </form>
        )}

        {viewMode === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>Username</label>
              <input type="text" className="form-control" value={username} disabled />
            </div>
            <div className="form-group">
              <label>Enter 6-Digit OTP</label>
              <input type="text" className="form-control" value={otp} onChange={(e)=>setOtp(e.target.value)} required maxLength="6" />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-control" 
                  value={newPassword} 
                  onChange={(e)=>setNewPassword(e.target.value)} 
                  required 
                  style={{ paddingRight: '40px' }}
                />
                <span 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
            </div>
            <button type="submit" className="submit-btn" style={{ marginTop: '1rem' }}>RESET PASSWORD</button>
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <span onClick={() => { setViewMode('login'); setError(''); setMessage(''); }} style={{ color: '#aaa', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</span>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
