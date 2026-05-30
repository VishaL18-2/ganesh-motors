import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Eye, EyeOff, Shield } from 'lucide-react';
import '../index.css';

const API_BASE = import.meta.env.VITE_API_BASE || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : `http://${window.location.hostname}:5000`);

export default function StaffLogin() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/api/staff/login`, { phone, password });
      if (res.data.token) {
        localStorage.setItem('staffToken', res.data.token);
        localStorage.setItem('staffInfo', JSON.stringify(res.data.staff));
        navigate('/staff/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid phone number or password');
    }
  };

  return (
    <div className="admin-login-container">
      <Link to="/" className="back-home-btn">
        <ArrowLeft size={24} />
        <span>Back to Home</span>
      </Link>
      <div className="login-box popup-content">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: '#ffcc00' }}>
          <Shield size={48} />
        </div>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Staff Login</h2>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Registered Phone Number</label>
            <input 
              type="text" 
              className="form-control" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="e.g. 9876543210"
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-control" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
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
          <button type="submit" className="submit-btn" style={{ marginTop: '2rem' }}>LOGIN</button>
        </form>
      </div>
    </div>
  );
}
