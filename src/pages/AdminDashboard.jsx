import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Phone, MessageCircle, Trash2, Edit2, LogOut, Calendar, Settings, LayoutDashboard, Users, Clock, CheckCircle, Image, ChevronRight } from 'lucide-react';
import '../index.css';

const API_BASE = import.meta.env.VITE_API_BASE || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : `http://${window.location.hostname}:5000`);

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ id: '', title: '', desc: '', staffName: '', staffPhone: '' });
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [bookingFilter, setBookingFilter] = useState('All');
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ name: '', comment: '', rating: 5 });
  const [gallery, setGallery] = useState([]);
  const [newGalleryItem, setNewGalleryItem] = useState({ title: '', beforeImage: null, afterImage: null });
  const [staff, setStaff] = useState([]);
  const [newStaff, setNewStaff] = useState({ name: '', phone: '', password: '', role: 'Mechanic' });
  const [editingStaffId, setEditingStaffId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchBookings();
    fetchServices();
    fetchReviews();
    fetchGallery();
    fetchStaff();
  }, []);

  const fetchGallery = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_BASE}/api/admin/gallery`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGallery(res.data);
    } catch (error) {
      console.log('Failed to fetch gallery items');
    }
  };

  const handleAddGallery = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('title', newGalleryItem.title);
      formData.append('beforeImage', newGalleryItem.beforeImage);
      formData.append('afterImage', newGalleryItem.afterImage);

      await axios.post(`${API_BASE}/api/admin/gallery`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setNewGalleryItem({ title: '', beforeImage: null, afterImage: null });
      fetchGallery();
      alert('Gallery item added successfully');
    } catch (error) {
      alert('Failed to add gallery item');
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm('Delete this gallery item?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_BASE}/api/admin/gallery/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGallery();
    } catch (error) {
      alert('Failed to delete gallery item');
    }
  };

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_BASE}/api/admin/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(res.data);
    } catch (error) {
      console.log('Failed to fetch reviews');
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${API_BASE}/api/admin/reviews`, newReview, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewReview({ name: '', comment: '', rating: 5 });
      fetchReviews();
      alert('Review added successfully');
    } catch (error) {
      alert('Failed to add review');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_BASE}/api/admin/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReviews();
    } catch (error) {
      alert('Failed to delete review');
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_BASE}/api/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/services`);
      setServices(res.data);
    } catch (error) {
      console.log('Failed to fetch services');
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      if (editingServiceId) {
        await axios.put(`${API_BASE}/api/admin/services/${editingServiceId}`, newService, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Service updated successfully');
      } else {
        await axios.post(`${API_BASE}/api/admin/services`, newService, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Service added successfully');
      }
      setNewService({ id: '', title: '', desc: '', staffName: '', staffPhone: '' });
      setEditingServiceId(null);
      fetchServices();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save service');
    }
  };

  const handleEditService = (srv) => {
    setNewService({ id: srv.id, title: srv.title, desc: srv.desc, staffName: srv.staffName || '', staffPhone: srv.staffPhone || '' });
    setEditingServiceId(srv._id);
  };

  const handleDeleteService = async (id) => {
    if(!window.confirm('Delete this service?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_BASE}/api/admin/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchServices();
    } catch (error) {
      alert('Failed to delete service');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${API_BASE}/api/admin/bookings/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBookings();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleDeleteBooking = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Immediate local state update for better UX
      setBookings(prev => prev.filter(b => (b._id !== id && b.id !== id)));
      
      await axios.delete(`${API_BASE}/api/admin/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh to ensure sync with server
      fetchBookings();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete booking. Please try again.');
      // Re-fetch in case of error to restore UI
      fetchBookings();
    }
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_BASE}/api/admin/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaff(res.data);
    } catch (error) {
      console.log('Failed to fetch staff list');
    }
  };

  const assignStaff = async (bookingId, staffId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${API_BASE}/api/admin/bookings/${bookingId}/assign`, { staffId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBookings();
    } catch (error) {
      alert('Failed to assign staff');
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      if (editingStaffId) {
        // For updates, password is only sent if the user typed something in it
        const payload = { ...newStaff };
        if (!payload.password) delete payload.password;

        await axios.put(`${API_BASE}/api/admin/staff/${editingStaffId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Staff member updated successfully');
        setEditingStaffId(null);
      } else {
        await axios.post(`${API_BASE}/api/admin/staff`, newStaff, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Staff member added successfully');
      }
      setNewStaff({ name: '', phone: '', password: '', role: 'Mechanic' });
      fetchStaff();
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save staff member');
    }
  };

  const handleEditStaff = (s) => {
    setNewStaff({ name: s.name, phone: s.phone, password: '', role: s.role });
    setEditingStaffId(s._id);
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Delete this staff member?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_BASE}/api/admin/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStaff();
      fetchBookings();
    } catch (error) {
      alert('Failed to delete staff member');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'Pending').length,
    completedBookings: bookings.filter(b => b.status === 'Completed').length,
    totalServices: services.length
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 style={{ fontStyle: 'italic' }}>GANESH <span style={{ color: 'var(--primary-color)' }}>ADMIN</span></h2>
        </div>
        <ul className="sidebar-menu">
          <li className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={20} /> Dashboard
          </li>
          <li className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>
            <Calendar size={20} /> Bookings
          </li>
          <li className={activeTab === 'services' ? 'active' : ''} onClick={() => setActiveTab('services')}>
            <Settings size={20} /> Services
          </li>
          <li className={activeTab === 'staff' ? 'active' : ''} onClick={() => setActiveTab('staff')}>
            <Users size={20} /> Staff / Mechanics
          </li>
          <li className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>
            <MessageCircle size={20} /> Reviews
          </li>
          <li className={activeTab === 'gallery' ? 'active' : ''} onClick={() => setActiveTab('gallery')}>
            <Image size={20} /> Gallery
          </li>
        </ul>
        <div className="sidebar-footer">
          <button className="logout-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h2>{activeTab === 'overview' ? 'Dashboard Overview' : activeTab === 'bookings' ? 'Recent Bookings' : activeTab === 'services' ? 'Manage Services' : activeTab === 'staff' ? 'Staff / Mechanics' : activeTab === 'reviews' ? 'Customer Reviews' : 'Before/After Gallery'}</h2>
        </header>

        <div className="dashboard-inner">
          <div className="stats-grid">
            <div className="stat-card clickable" onClick={() => { setActiveTab('bookings'); setBookingFilter('All'); }}>
              <div className="stat-icon" style={{ background: 'rgba(255, 204, 0, 0.1)', color: 'var(--primary-color)' }}>
                <Users size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats.totalBookings}</h3>
                <p>Total Bookings</p>
              </div>
            </div>
            <div className="stat-card clickable" onClick={() => { setActiveTab('bookings'); setBookingFilter('Pending'); }}>
              <div className="stat-icon" style={{ background: 'rgba(243, 156, 18, 0.1)', color: '#f39c12' }}>
                <Clock size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats.pendingBookings}</h3>
                <p>Pending</p>
              </div>
            </div>
            <div className="stat-card clickable" onClick={() => { setActiveTab('bookings'); setBookingFilter('Completed'); }}>
              <div className="stat-icon" style={{ background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71' }}>
                <CheckCircle size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats.completedBookings}</h3>
                <p>Completed</p>
              </div>
            </div>
            <div className="stat-card clickable" onClick={() => setActiveTab('services')}>
              <div className="stat-icon" style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498db' }}>
                <Settings size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats.totalServices}</h3>
                <p>Services</p>
              </div>
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="overview-container">
              <div className="overview-section">
                <h3>Recent Activity</h3>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Service</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 5).map(b => (
                        <tr key={b._id}>
                          <td className="fw-600">{b.name}</td>
                          <td>{b.serviceType}</td>
                          <td><span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bookings-view">
              <div className="filter-bar" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ color: '#888', fontSize: '0.9rem' }}>Filter by Status:</span>
                {['All', 'Pending', 'In-Progress', 'Completed'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setBookingFilter(f)}
                    className={`filter-tag ${bookingFilter === f ? 'active' : ''}`}
                    style={{
                      background: bookingFilter === f ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                      color: bookingFilter === f ? 'black' : '#ccc',
                      border: 'none',
                      padding: '0.4rem 1rem',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      transition: 'all 0.3s'
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Name</th>
                      <th>Service Type</th>
                      <th>Phone</th>
                      <th>Assigned Staff</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings
                      .filter(b => bookingFilter === 'All' || b.status === bookingFilter)
                      .map(b => (
                        <tr key={b._id}>
                          <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                          <td className="fw-600">{b.name}</td>
                          <td style={{textTransform: 'capitalize'}}>{b.serviceType}</td>
                          <td>
                            <div className="phone-actions">
                              {b.phone}
                              <a href={`tel:${b.phone}`} className="action-icon call-icon" title="Call"><Phone size={16} /></a>
                                <a 
                                  href={`https://wa.me/91${b.phone}?text=${encodeURIComponent(
                                    `Hello ${b.name}, your booking for ${b.serviceType} at Ganesh Motors is confirmed! \n\nनमस्ते ${b.name}, गणेश मोटर्स में आपकी "${b.serviceType}" की बुकिंग कन्फर्म हो गई है।`
                                  )}`} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="action-icon wa-icon" 
                                  title="Confirm on WhatsApp"
                                  style={{ background: '#25D366', color: 'white', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '4px', textDecoration: 'none', fontSize: '11px', fontWeight: 'bold', width: 'auto', height: 'auto' }}
                                >
                                  <MessageCircle size={14} /> Confirm
                                </a>
                                <a 
                                  href={`https://wa.me/91${b.phone}?text=${encodeURIComponent(
                                    b.status === 'Completed' 
                                    ? `Hi ${b.name}, Great news! Your car service for "${b.serviceType}" at Ganesh Motors is completed and ready for pickup. Thank you! \n\nनमस्ते ${b.name}, खुशखबरी! गणेश मोटर्स में आपकी गाड़ी की सर्विस ("${b.serviceType}") पूरी हो गई है और गाड़ी तैयार है। धन्यवाद!` 
                                    : b.status === 'In-Progress'
                                    ? `Hi ${b.name}, Your car is currently being serviced ("${b.serviceType}") at Ganesh Motors. We will notify you once it is ready. \n\nनमस्ते ${b.name}, आपकी गाड़ी की सर्विस ("${b.serviceType}") गणेश मोटर्स में शुरू हो गई है। काम पूरा होते ही हम आपको सूचित करेंगे।`
                                    : `Hi ${b.name}, Your booking for "${b.serviceType}" at Ganesh Motors is confirmed. We will update you on the progress soon. \n\nनमस्ते ${b.name}, गणेश मोटर्स में आपकी "${b.serviceType}" की बुकिंग कन्फर्म हो गई है। हम जल्द ही आपको आगे की जानकारी देंगे।`
                                  )}`} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="action-icon wa-icon" 
                                  title="Status Update on WhatsApp"
                                  style={{ border: '1px solid #25D366', color: '#25D366', background: 'transparent', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '4px', textDecoration: 'none', fontSize: '11px', fontWeight: 'bold', width: 'auto', height: 'auto' }}
                                >
                                  <MessageCircle size={14} /> Update
                                </a>
                            </div>
                          </td>
                          <td>
                            <select 
                              className="status-select pending"
                              value={b.assignedStaff?._id || ''} 
                              onChange={(e) => assignStaff(b._id, e.target.value)}
                              style={{ width: '100%', minWidth: '140px', background: '#222', border: '1px solid #333', color: '#ffcc00' }}
                            >
                              <option value="">Not Assigned</option>
                              {staff.map(s => (
                                <option key={s._id} value={s._id}>{s.name} ({s.role})</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select 
                              className={`status-select ${b.status.toLowerCase()}`}
                              value={b.status} 
                              onChange={(e) => updateStatus(b._id, e.target.value)}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In-Progress">In-Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div 
                              className="delete-btn" 
                              onClick={() => handleDeleteBooking(b._id || b.id)} 
                              title="Delete Booking"
                            >
                              <Trash2 size={18} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    {bookings.filter(b => bookingFilter === 'All' || b.status === bookingFilter).length === 0 && (
                      <tr><td colSpan="7" style={{textAlign:'center', padding: '2rem'}}>No {bookingFilter !== 'All' ? bookingFilter.toLowerCase() : ''} bookings found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              
              {/* Add Service Form */}
              <div style={{ flex: '1', minWidth: '300px', background: '#1a1a1a', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', height: 'fit-content' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>{editingServiceId ? 'Edit Service' : 'Add New Service'}</h4>
                <form onSubmit={handleAddService}>
                  <div className="form-group">
                    <label>Service ID (e.g., 'oil_change')</label>
                    <input type="text" className="form-control" value={newService.id} onChange={e=>setNewService({...newService, id: e.target.value})} disabled={!!editingServiceId} required />
                  </div>
                  <div className="form-group">
                    <label>Service Title</label>
                    <input type="text" className="form-control" value={newService.title} onChange={e=>setNewService({...newService, title: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea className="form-control" value={newService.desc} onChange={e=>setNewService({...newService, desc: e.target.value})} required rows="3"></textarea>
                  </div>
                  <div className="form-group">
                    <label>Quick Select Registered Staff</label>
                    <select 
                      className="form-control"
                      value=""
                      onChange={e => {
                        const selected = staff.find(s => s._id === e.target.value);
                        if (selected) {
                          setNewService({
                            ...newService,
                            staffName: selected.name,
                            staffPhone: selected.phone
                          });
                        }
                      }}
                      style={{ background: '#222', border: '1px solid #333', color: 'white' }}
                    >
                      <option value="">-- Select Registered Staff --</option>
                      {staff.map(s => (
                        <option key={s._id} value={s._id}>{s.name} ({s.role})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Assigned Staff Name</label>
                    <input type="text" className="form-control" value={newService.staffName} onChange={e=>setNewService({...newService, staffName: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Staff Phone Number</label>
                    <input type="tel" className="form-control" value={newService.staffPhone} onChange={e=>setNewService({...newService, staffPhone: e.target.value})} required />
                  </div>
                  <button type="submit" className="submit-btn">{editingServiceId ? 'UPDATE SERVICE' : 'ADD SERVICE'}</button>
                  {editingServiceId && (
                    <button type="button" className="submit-btn" style={{ background: '#333', marginTop: '0.5rem' }} onClick={() => { setEditingServiceId(null); setNewService({ id: '', title: '', desc: '', staffName: '', staffPhone: '' }); }}>CANCEL EDIT</button>
                  )}
                </form>
              </div>

              {/* List of Services */}
              <div style={{ flex: '2', minWidth: '400px' }}>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Staff</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map(s => (
                        <tr key={s._id}>
                          <td className="fw-600">{s.title}</td>
                          <td><small>{s.desc}</small></td>
                          <td>
                            <div style={{ fontSize: '0.85rem' }}>
                              <div><strong>{s.staffName || 'Not Assigned'}</strong></div>
                              <div style={{ color: '#aaa' }}>{s.staffPhone || 'No Phone'}</div>
                            </div>
                          </td>
                          <td>
                            <button 
                              type="button"
                              className="edit-btn" 
                              onClick={() => handleEditService(s)} 
                              title="Edit Service"
                              style={{ marginRight: '0.5rem' }}
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              type="button"
                              className="delete-btn" 
                              onClick={() => handleDeleteService(s._id)} 
                              title="Delete Service"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {services.length === 0 && (
                        <tr><td colSpan="4" style={{textAlign:'center', padding: '2rem'}}>No services found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {/* Add Review Form */}
              <div style={{ flex: '1', minWidth: '300px', background: '#1a1a1a', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', height: 'fit-content' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Add Customer Review</h4>
                <form onSubmit={handleAddReview}>
                  <div className="form-group">
                    <label>Customer Name</label>
                    <input type="text" className="form-control" value={newReview.name} onChange={e=>setNewReview({...newReview, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Rating (1-5)</label>
                    <input type="number" min="1" max="5" className="form-control" value={newReview.rating} onChange={e=>setNewReview({...newReview, rating: parseInt(e.target.value)})} required />
                  </div>
                  <div className="form-group">
                    <label>Comment</label>
                    <textarea className="form-control" value={newReview.comment} onChange={e=>setNewReview({...newReview, comment: e.target.value})} required rows="3"></textarea>
                  </div>
                  <button type="submit" className="submit-btn">ADD REVIEW</button>
                </form>
              </div>

              {/* List of Reviews */}
              <div style={{ flex: '2', minWidth: '400px' }}>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Rating</th>
                        <th>Comment</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map(r => (
                        <tr key={r._id}>
                          <td className="fw-600">{r.name}</td>
                          <td><span style={{ color: '#f1c40f' }}>{'★'.repeat(r.rating)}</span></td>
                          <td><small>{r.comment}</small></td>
                          <td>
                            <button 
                              type="button"
                              className="delete-btn" 
                              onClick={() => handleDeleteReview(r._id)} 
                              title="Delete Review"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {reviews.length === 0 && (
                        <tr><td colSpan="4" style={{textAlign:'center', padding: '2rem'}}>No reviews found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {/* Add Gallery Form */}
              <div style={{ flex: '1', minWidth: '300px', background: '#1a1a1a', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', height: 'fit-content' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Add Before/After Photo</h4>
                <form onSubmit={handleAddGallery}>
                  <div className="form-group">
                    <label>Title (e.g. Engine Wash)</label>
                    <input type="text" className="form-control" value={newGalleryItem.title} onChange={e=>setNewGalleryItem({...newGalleryItem, title: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Before Image</label>
                    <input type="file" className="form-control" onChange={e=>setNewGalleryItem({...newGalleryItem, beforeImage: e.target.files[0]})} required />
                  </div>
                  <div className="form-group">
                    <label>After Image</label>
                    <input type="file" className="form-control" onChange={e=>setNewGalleryItem({...newGalleryItem, afterImage: e.target.files[0]})} required />
                  </div>
                  <button type="submit" className="submit-btn">ADD TO GALLERY</button>
                </form>
              </div>

              {/* List of Gallery Items */}
              <div style={{ flex: '2', minWidth: '400px' }}>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Work Title</th>
                        <th>Before / After</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gallery.map(g => (
                        <tr key={g._id}>
                          <td className="fw-600">{g.title}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <img src={`${API_BASE}${g.beforeImage}`} alt="before" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                              <img src={`${API_BASE}${g.afterImage}`} alt="after" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                            </div>
                          </td>
                          <td>
                            <button 
                              type="button"
                              className="delete-btn" 
                              onClick={() => handleDeleteGallery(g._id)} 
                              title="Delete Item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {gallery.length === 0 && (
                        <tr><td colSpan="3" style={{textAlign:'center', padding: '2rem'}}>No gallery items found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'staff' && (
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {/* Add/Edit Staff Form */}
              <div style={{ flex: '1', minWidth: '300px', background: '#1a1a1a', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', height: 'fit-content' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>{editingStaffId ? 'Edit Staff Member' : 'Add New Staff Member'}</h4>
                <form onSubmit={handleAddStaff}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={newStaff.name} 
                      onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={newStaff.phone} 
                      onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Password {editingStaffId && '(Leave blank to keep current)'}</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      value={newStaff.password} 
                      onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })} 
                      required={!editingStaffId} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select 
                      className="form-control" 
                      value={newStaff.role} 
                      onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                      style={{ background: '#222', border: '1px solid #333', color: 'white' }}
                    >
                      <option value="Mechanic">Mechanic</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Helper">Helper</option>
                    </select>
                  </div>
                  <button type="submit" className="submit-btn" style={{ marginTop: '1.5rem', width: '100%' }}>{editingStaffId ? 'UPDATE STAFF' : 'ADD STAFF'}</button>
                  {editingStaffId && (
                    <button 
                      type="button" 
                      className="submit-btn" 
                      style={{ background: '#333', marginTop: '0.5rem', width: '100%' }} 
                      onClick={() => { 
                        setEditingStaffId(null); 
                        setNewStaff({ name: '', phone: '', password: '', role: 'Mechanic' }); 
                      }}
                    >
                      CANCEL EDIT
                    </button>
                  )}
                </form>
              </div>

              {/* Staff List */}
              <div style={{ flex: '2', minWidth: '400px' }}>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.map(s => (
                        <tr key={s._id}>
                          <td className="fw-600">{s.name}</td>
                          <td>{s.phone}</td>
                          <td><span className="status-badge pending" style={{ background: 'rgba(255,204,0,0.1)', color: '#ffcc00' }}>{s.role}</span></td>
                          <td style={{ textAlign: 'center' }}>
                            <button 
                              type="button"
                              className="edit-btn" 
                              onClick={() => handleEditStaff(s)} 
                              title="Edit Staff"
                              style={{ marginRight: '0.5rem', display: 'inline-flex' }}
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              type="button"
                              className="delete-btn" 
                              onClick={() => handleDeleteStaff(s._id)} 
                              title="Delete Staff"
                              style={{ display: 'inline-flex' }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {staff.length === 0 && (
                        <tr><td colSpan="4" style={{textAlign:'center', padding: '2rem'}}>No staff members registered.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
