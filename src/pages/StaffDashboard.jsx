import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Phone, MessageCircle, LogOut, CheckCircle, Clock, Play, User } from 'lucide-react';
import '../index.css';

const API_BASE = import.meta.env.VITE_API_BASE || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : `http://${window.location.hostname}:5000`);

export default function StaffDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [staffInfo, setStaffInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    const info = localStorage.getItem('staffInfo');
    if (!token || !info) {
      navigate('/staff/login');
      return;
    }
    setStaffInfo(JSON.parse(info));
    fetchAssignedBookings();
  }, []);

  const fetchAssignedBookings = async () => {
    try {
      const token = localStorage.getItem('staffToken');
      const res = await axios.get(`${API_BASE}/api/staff/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch assigned bookings');
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('staffToken');
      await axios.put(`${API_BASE}/api/staff/bookings/${bookingId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh list
      fetchAssignedBookings();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffInfo');
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0a', color: 'white' }}>
        <h2>Loading Assigned Tasks...</h2>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-layout" style={{ background: '#0f0f0f', minHeight: '100vh', color: 'white', padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#ffcc00', color: 'black', padding: '10px', borderRadius: '50%' }}>
            <User size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Ganesh Motors Staff</h1>
            <p style={{ color: '#aaa', margin: '4px 0 0 0' }}>Welcome, <strong style={{ color: '#ffcc00' }}>{staffInfo?.name}</strong> ({staffInfo?.role})</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <main>
        <h2 style={{ marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px', borderLeft: '4px solid #ffcc00', paddingLeft: '10px' }}>Your Assigned Bookings ({bookings.length})</h2>
        
        {error && <p className="error-msg" style={{ maxWidth: '500px' }}>{error}</p>}

        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#161616', borderRadius: '8px', border: '1px dashed #333' }}>
            <h3 style={{ color: '#888' }}>No bookings assigned to you currently.</h3>
            <p style={{ color: '#555', marginTop: '8px' }}>Please contact the Admin if you think this is a mistake.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {bookings.map(b => (
              <div key={b._id} style={{ background: '#161616', borderRadius: '10px', border: '1px solid #252525', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', margin: 0, color: '#ffcc00' }}>{b.name}</h3>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#aaa' }}>{b.serviceType}</p>
                  </div>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '4px', 
                    fontSize: '0.8rem', 
                    fontWeight: 'bold', 
                    textTransform: 'uppercase',
                    background: b.status === 'Completed' ? 'rgba(46, 204, 113, 0.2)' : b.status === 'In-Progress' ? 'rgba(52, 152, 219, 0.2)' : 'rgba(241, 196, 15, 0.2)',
                    color: b.status === 'Completed' ? '#2ecc71' : b.status === 'In-Progress' ? '#3498db' : '#f1c40f',
                    border: `1px solid ${b.status === 'Completed' ? '#2ecc71' : b.status === 'In-Progress' ? '#3498db' : '#f1c40f'}`
                  }}>
                    {b.status}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <a href={`tel:${b.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#222', padding: '8px 12px', borderRadius: '5px', color: 'white', textDecoration: 'none', fontSize: '0.85rem' }}>
                    <Phone size={14} /> {b.phone}
                  </a>
                  <a 
                    href={`https://wa.me/91${b.phone}?text=${encodeURIComponent(
                      `Hi ${b.name}, this is ${staffInfo?.name} from Ganesh Motors regarding your booking for "${b.serviceType}".`
                    )}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#25D366', padding: '8px 12px', borderRadius: '5px', color: 'white', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }}
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                </div>

                <div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#888', fontWeight: 'bold' }}>UPDATE STATUS:</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => handleStatusChange(b._id, 'Pending')}
                      disabled={b.status === 'Pending'}
                      style={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '4px', 
                        padding: '10px', 
                        borderRadius: '5px', 
                        border: '1px solid #f1c40f', 
                        background: b.status === 'Pending' ? '#f1c40f' : 'transparent', 
                        color: b.status === 'Pending' ? 'black' : '#f1c40f', 
                        cursor: b.status === 'Pending' ? 'default' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}
                    >
                      <Clock size={14} /> Pending
                    </button>
                    
                    <button 
                      onClick={() => handleStatusChange(b._id, 'In-Progress')}
                      disabled={b.status === 'In-Progress'}
                      style={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '4px', 
                        padding: '10px', 
                        borderRadius: '5px', 
                        border: '1px solid #3498db', 
                        background: b.status === 'In-Progress' ? '#3498db' : 'transparent', 
                        color: b.status === 'In-Progress' ? 'white' : '#3498db', 
                        cursor: b.status === 'In-Progress' ? 'default' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}
                    >
                      <Play size={14} /> In-Progress
                    </button>
                    
                    <button 
                      onClick={() => handleStatusChange(b._id, 'Completed')}
                      disabled={b.status === 'Completed'}
                      style={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '4px', 
                        padding: '10px', 
                        borderRadius: '5px', 
                        border: '1px solid #2ecc71', 
                        background: b.status === 'Completed' ? '#2ecc71' : 'transparent', 
                        color: b.status === 'Completed' ? 'white' : '#2ecc71', 
                        cursor: b.status === 'Completed' ? 'default' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}
                    >
                      <CheckCircle size={14} /> Completed
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
