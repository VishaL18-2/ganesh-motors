import React, { useState, Suspense, useEffect } from 'react'
import { MapPin, MessageCircle, ChevronRight, Settings, Droplet, Sparkles, X, Menu, ChevronUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../index.css'

gsap.registerPlugin(ScrollTrigger)

const API_BASE = import.meta.env.VITE_API_BASE || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : `http://${window.location.hostname}:5000`);

function LandingPage() {
  const [activeService, setActiveService] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', serviceType: 'All Car Service' });
  const [showTrack, setShowTrack] = useState(false);
  const [trackPhone, setTrackPhone] = useState('');
  const [trackResults, setTrackResults] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [reviewData, setReviewData] = useState({ name: '', comment: '', rating: 5 });
  const [gallery, setGallery] = useState([]);
  const [sliderPos, setSliderPos] = useState({}); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [services, setServices] = useState([]);

  useEffect(() => {
    // GSAP Animation for the new Car Image
    gsap.fromTo("#heroCar", 
      { scale: 1.1, y: 50, opacity: 0 },
      { 
        scale: 1, y: 0, opacity: 1, 
        duration: 2, 
        ease: "power4.out" 
      }
    );

    gsap.to("#heroCar", {
      scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
      },
      scale: 1.2,
      y: -100,
      ease: "none"
    });

    axios.get(`${API_BASE}/api/services`)
      .then(res => {
        setServices(res.data);
        if(res.data.length > 0) {
          setFormData(prev => ({...prev, serviceType: res.data[0].title}));
        }
      })
      .catch(err => console.log('Failed to fetch services', err));

    axios.get(`${API_BASE}/api/reviews`)
      .then(res => setReviews(res.data))
      .catch(err => console.log('Failed to fetch reviews', err));

    axios.get(`${API_BASE}/api/gallery`)
      .then(res => setGallery(res.data))
      .catch(err => console.log('Failed to fetch gallery', err));
  }, []);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/api/book`, formData);
      if (response.status === 201) {
        setBookingSuccess(true);
        setFormData({ name: '', phone: '', serviceType: services[0]?.title || 'All Car Service' });
      }
    } catch (error) {
      alert('Failed to book service. Please try again.');
      console.error(error);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/api/reviews`, reviewData);
      if (response.status === 201) {
        alert('Thank you for your feedback!');
        setShowReviewPopup(false);
        setReviewData({ name: '', comment: '', rating: 5 });
        // Refresh reviews
        axios.get(`${API_BASE}/api/reviews`).then(res => setReviews(res.data));
      }
    } catch (error) {
      alert('Failed to submit review');
    }
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    setTrackError('');
    setTrackResults(null);
    try {
      const res = await axios.get(`${API_BASE}/api/track/${trackPhone}`);
      setTrackResults(res.data);
    } catch (err) {
      setTrackError(err.response?.data?.error || 'No active service found for this number.');
    }
  };

  return (
    <>
      {/* Sidebar Drawer */}
      <div className={`sidebar-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header-drawer">
          <div className="sidebar-brand">
            <img 
              src="/ganesh_logo.png" 
              alt="Shree Ganesh" 
              className="sidebar-logo-img"
            />
            <div className="sidebar-brand-text">GANESH <span style={{ color: 'var(--primary-color)' }}>MOTORS</span></div>
          </div>
          <button className="close-sidebar-btn" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <div className="sidebar-links">
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo(0,0); setIsMobileMenuOpen(false); }}>HOME <ChevronRight size={16} /></a>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowServices(true); setIsMobileMenuOpen(false); }}>SERVICES <ChevronRight size={16} /></a>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowTrack(true); setIsMobileMenuOpen(false); }}>TRACK CAR <ChevronRight size={16} /></a>
          <a href="#reviews" onClick={(e) => { e.preventDefault(); document.getElementById('reviews-section').scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }}>REVIEWS <ChevronRight size={16} /></a>
          <a href="#gallery" onClick={(e) => { e.preventDefault(); document.getElementById('gallery-section').scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }}>GALLERY <ChevronRight size={16} /></a>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowContact(true); setIsMobileMenuOpen(false); }}>CONTACT <ChevronRight size={16} /></a>
          <Link to="/staff/login" className="admin-link-drawer" style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)', marginBottom: '0.5rem' }} onClick={() => setIsMobileMenuOpen(false)}>STAFF LOGIN <ChevronRight size={16} /></Link>
          <Link to="/admin/login" className="admin-link-drawer" onClick={() => setIsMobileMenuOpen(false)}>ADMIN <ChevronRight size={16} /></Link>
        </div>

        <div className="sidebar-footer-drawer">
          <button className="book-btn-drawer" onClick={() => { setShowPopup(true); setIsMobileMenuOpen(false); }}>BOOK SERVICE</button>
        </div>
      </div>

      {/* Top Navbar */}
      <nav className="navbar">
        <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img 
            src="/ganesh_logo.png" 
            alt="Shree Ganesh" 
            style={{ 
              height: '50px', 
              objectFit: 'contain', 
              filter: 'drop-shadow(0 0 5px var(--primary-color))',
              mixBlendMode: 'screen' 
            }} 
          />
          <div style={{ fontStyle: 'italic', fontSize: '1.8rem' }}>GANESH <span style={{ color: 'var(--primary-color)' }}>MOTORS</span></div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button className="book-btn desktop-only" onClick={() => setShowPopup(true)}>BOOK SERVICE</button>
          <button className="menu-trigger-btn" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={32} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="canvas-container">
        {/* Background Parallax Element */}
        <div className="parallax-wrapper">
          <div className="parallax-text" style={{ fontStyle: 'italic', fontWeight: 900 }}>GANESH MOTORS</div>
        </div>

        {/* Floating Icons on Left */}
        <div className="floating-icons-left">
          <div className="icon-circle" title="Engine"><Settings size={24} /></div>
          <div className="icon-circle" title="Oil"><Droplet size={24} /></div>
          <div className="icon-circle" title="Wash"><Sparkles size={24} /></div>
        </div>

        {/* Hero Car Image with GSAP Parallax */}
        <div className="car-hero-container">
          <img 
            src="/car.jpg" 
            alt="Luxury Car" 
            className="hero-car-image"
            id="heroCar"
          />
          <div className="car-glow"></div>
        </div>
      </div>

      {/* Premium Services Grid (Brotomotiv Style) */}
      <div id="services-section" className="services-grid-container">
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '4rem', fontStyle: 'italic', textTransform: 'uppercase', fontSize: '3.5rem' }}>
          CHOOSE FROM A RANGE OF <span style={{ color: 'var(--primary-color)' }}>PREMIUM SERVICES</span>
        </h2>
        <div className="services-grid">
          {services.map(srv => (
            <div 
              key={srv.id} 
              className="service-image-card"
              onClick={() => {
                setActiveService(srv.id);
                setShowPopup(true);
              }}
            >
              <div className="service-img-wrapper">
                <img 
                  src={`/services/${srv.id}.png`} 
                  alt={srv.title} 
                  onError={(e) => { e.target.src = '/car.jpg' }}
                />
              </div>
              <div className="service-info-footer">
                <h3 className="service-card-title">{srv.title}</h3>
                <ChevronRight size={20} className="arrow-icon" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable area to trigger GSAP parallax */}
      {/* Stats Section */}
      <div className="stats-section" style={{ 
        position: 'relative', 
        zIndex: 10, 
        padding: '5rem 10%', 
        background: 'linear-gradient(90deg, #111 0%, #000 100%)',
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '2rem',
        borderTop: '1px solid rgba(255, 204, 0, 0.1)',
        borderBottom: '1px solid rgba(255, 204, 0, 0.1)'
      }}>
        <div className="stat-item" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', color: 'var(--primary-color)', fontFamily: 'Oswald', fontStyle: 'italic' }}>10+</h2>
          <p style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>Years Experience</p>
        </div>
        <div className="stat-item" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', color: 'var(--primary-color)', fontFamily: 'Oswald', fontStyle: 'italic' }}>5000+</h2>
          <p style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>Cars Serviced</p>
        </div>
        <div className="stat-item" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', color: 'var(--primary-color)', fontFamily: 'Oswald', fontStyle: 'italic' }}>100%</h2>
          <p style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>Satisfaction</p>
        </div>
        <div className="stat-item" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', color: 'var(--primary-color)', fontFamily: 'Oswald', fontStyle: 'italic' }}>12/7</h2>
          <p style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>Support</p>
        </div>
      </div>



      {/* Transformation Gallery Section */}
      <div id="gallery-section" className="gallery-section">
        <h1 className="section-title">TRANSFORMATION <span style={{ color: 'var(--primary-color)' }}>GALLERY</span></h1>
        
        <div className="gallery-grid">
          <div className="transformation-card">
            <div className="transformation-img-container">
              <img src="/gallery/transformation1.png" alt="Car Exterior Restoration" />
              <div className="transformation-label before">BEFORE</div>
              <div className="transformation-label after">AFTER</div>
            </div>
            <div className="transformation-info">
              <h3>Ceramic Coating & Detailing</h3>
              <p>Full exterior restoration with premium glass-like finish.</p>
            </div>
          </div>

          <div className="transformation-card">
            <div className="transformation-img-container">
              <img src="/gallery/transformation2.png" alt="Car Interior Detailing" />
              <div className="transformation-label before">BEFORE</div>
              <div className="transformation-label after">AFTER</div>
            </div>
            <div className="transformation-info">
              <h3>Premium Interior Spa</h3>
              <p>Complete leather conditioning and deep upholstery cleaning.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div id="reviews-section" className="reviews-section">
        <div className="reviews-header">
          <h1 className="section-title">CUSTOMER <span style={{ color: 'var(--primary-color)' }}>REVIEW</span></h1>
          <button className="write-review-btn" onClick={() => setShowReviewPopup(true)}>WRITE A REVIEW</button>
        </div>
        
        <div className="reviews-scroll-container">
          {reviews.map(rev => (
            <div key={rev._id} className="premium-review-card">
              <div className="review-stars-row">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`star ${i < rev.rating ? 'active' : ''}`}>★</span>
                ))}
              </div>
              <p className="review-comment">
                {rev.comment}
                {rev.comment.length > 100 && <span className="read-more-text">Read More</span>}
              </p>
              <h4 className="review-customer-name">{rev.name}</h4>
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="empty-reviews">
              <p>Be the first to review our premium services!</p>
            </div>
          )}
        </div>
      </div>

      {/* Google Maps Section */}
      <div className="map-section">
        <div className="map-container-wrapper">
          <div className="map-info">
            <h2 className="section-title">Visit Our Workshop</h2>
            <p style={{ color: '#aaa', marginBottom: '2rem' }}>Experience premium car care at our state-of-the-art facility in Bilimora.</p>
            <div className="contact-item">
              <MapPin size={20} color="#ffcc00" />
              <span>DEVSAR, NEAR GRAM PANCHAYAT OFFICE, GANDEVI ROAD, BILIMORA.</span>
            </div>
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=Ganesh+Motors+Devsar+Gandevi+Road+Bilimora" 
              target="_blank" 
              rel="noreferrer" 
              className="submit-btn"
              style={{ display: 'inline-flex', width: 'auto', gap: '0.5rem', marginTop: '2rem', textDecoration: 'none' }}
            >
              GET DIRECTIONS
            </a>
          </div>
          <div className="map-iframe-container">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3731.2505562725455!2d72.9515664!3d20.7511475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be09405f6390823%3A0x67399c5658e0a3!2sGandevi%20Rd%2C%20Devsar%2C%20Bilimora%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1715425600000!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0, borderRadius: '16px' }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Booking Popup Overlay */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-btn" onClick={() => { setShowPopup(false); setBookingSuccess(false); }}><X size={24} /></button>
            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ background: 'var(--primary-color)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Sparkles color="black" size={32} />
                </div>
                <h2 style={{ color: 'white', marginBottom: '1rem', fontStyle: 'italic' }}>Booking Request Sent!</h2>
                <p style={{ color: '#aaa', marginBottom: '2rem' }}>Our team will contact you on WhatsApp soon to confirm your appointment.</p>
                <button className="submit-btn" onClick={() => { setShowPopup(false); setBookingSuccess(false); }}>CLOSE</button>
              </div>
            ) : (
              <>
                <h2>Book a Service</h2>
                <form onSubmit={handleBookSubmit}>
                  <div className="form-group">
                    <label>Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Service Type</label>
                    <select 
                      className="form-control" 
                      value={formData.serviceType} 
                      onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                    >
                      {services.map(srv => (
                        <option key={srv._id || srv.id} value={srv.title}>{srv.title}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="submit-btn">CONFIRM BOOKING</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Services Popup */}
      {showServices && (
        <div className="popup-overlay" onClick={() => setShowServices(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowServices(false)}><X size={24} /></button>
            <h2>Our Services</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '65vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {services.map(srv => (
                <div key={srv._id || srv.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--primary-color)' }}>
                  <h3 style={{ color: 'white', marginBottom: '0.3rem', fontStyle: 'italic' }}>{srv.title}</h3>
                  <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '1rem' }}>{srv.desc}</p>
                  {srv.staffName && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', padding: '0.75rem', borderRadius: '6px' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#888' }}>Assigned Expert</div>
                        <div style={{ color: '#fff', fontWeight: 'bold' }}>{srv.staffName}</div>
                      </div>
                      {srv.staffPhone && (
                        <a href={`https://wa.me/91${srv.staffPhone}`} target="_blank" rel="noreferrer" className="submit-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center', width: 'auto', margin: 0, background: '#25D366', textDecoration: 'none' }}>
                          <MessageCircle size={16} /> Contact
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contact Popup */}
      {showContact && (
        <div className="popup-overlay" onClick={() => setShowContact(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowContact(false)}><X size={24} /></button>
            <h2>Contact Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#ccc' }}>
              <p><strong style={{ color: 'white' }}>Garage Name:</strong> Ganesh Motors</p>
              <p><strong style={{ color: 'white' }}>Owner:</strong> Ganesh Bhai</p>
              <p><strong style={{ color: 'white' }}>Address:</strong> DEVSAR, NEAR GRAM PANCHAYAT OFFICE, GANDEVI ROAD, BILIMORA.</p>
              <p><strong style={{ color: 'white' }}>Timings:</strong> 9:00 AM - 8:00 PM (Mon-Sun)</p>
              <p><strong style={{ color: 'white' }}>Phone:</strong> 99099 56943</p>
              <a href="https://wa.me/919909956943" target="_blank" rel="noreferrer" className="submit-btn" style={{ textDecoration: 'none', textAlign: 'center', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <MessageCircle size={20} /> CHAT ON WHATSAPP
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Write Review Popup */}
      {showReviewPopup && (
        <div className="popup-overlay" onClick={() => setShowReviewPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowReviewPopup(false)}><X size={24} /></button>
            <h2>Write a Review</h2>
            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label>Your Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={reviewData.name} 
                  onChange={(e) => setReviewData({...reviewData, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Rating</label>
                <select 
                  className="form-control" 
                  value={reviewData.rating} 
                  onChange={(e) => setReviewData({...reviewData, rating: parseInt(e.target.value)})}
                >
                  <option value="5">5 Stars (Excellent)</option>
                  <option value="4">4 Stars (Good)</option>
                  <option value="3">3 Stars (Average)</option>
                  <option value="2">2 Stars (Poor)</option>
                  <option value="1">1 Star (Very Bad)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Your Comment</label>
                <textarea 
                  className="form-control" 
                  rows="4"
                  value={reviewData.comment} 
                  onChange={(e) => setReviewData({...reviewData, comment: e.target.value})} 
                  required 
                ></textarea>
              </div>
              <button type="submit" className="submit-btn">SUBMIT REVIEW</button>
            </form>
          </div>
        </div>
      )}

      {/* Tracking Popup */}
      {showTrack && (
        <div className="popup-overlay" onClick={() => { setShowTrack(false); setTrackResults(null); setTrackPhone(''); setTrackError(''); }}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => { setShowTrack(false); setTrackResults(null); setTrackPhone(''); setTrackError(''); }}><X size={24} /></button>
            <h2>Track Your Car</h2>
            <p style={{ color: '#aaa', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Enter your phone number to check service status.</p>
            <form onSubmit={handleTrackSubmit}>
              <div className="form-group">
                <input 
                  type="tel" 
                  className="form-control" 
                  placeholder="Enter Phone Number"
                  value={trackPhone} 
                  onChange={(e) => setTrackPhone(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="submit-btn">TRACK STATUS</button>
            </form>

            {trackError && <p style={{ color: '#E31E24', marginTop: '1rem', fontSize: '0.9rem' }}>{trackError}</p>}

            {trackResults && (
              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '40vh', overflowY: 'auto' }}>
                {trackResults.map(res => (
                  <div key={res._id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--primary-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'white', fontWeight: 'bold' }}>{res.serviceType}</span>
                      <span className={`status-badge ${res.status.toLowerCase()}`}>{res.status}</span>
                    </div>
                    <p style={{ color: '#888', fontSize: '0.8rem' }}>Date: {new Date(res.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Premium Footer Section */}
      <footer className="main-footer">
        <div className="footer-container">
          <div className="footer-col brand-col">
            <h3 className="footer-heading">GANESH MOTORS</h3>
            <p className="footer-address">
              GANESH MOTORS HQ<br />
              Devsar, Near Gram Panchayat Office,<br />
              Gandevi Road, Bilimora,<br />
              Gujarat 396321, India
            </p>
            <div className="footer-brand-logo">
              GANESH <span style={{ color: 'var(--primary-color)' }}>MOTORS</span>
            </div>
          </div>

          <div className="footer-col">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li><a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo(0,0); }}>Home</a></li>
              <li><a href="#services-section">About Us</a></li>
              <li><a href="#gallery-section">Our Gallery</a></li>
              <li><a href="#reviews-section">Reviews</a></li>
              <li><Link to="/staff/login">Staff Login</Link></li>
              <li><Link to="/admin/login">Admin Login</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-heading">Services</h3>
            <ul className="footer-links">
              {services.slice(0, 6).map(srv => (
                <li key={srv.id} onClick={() => { setActiveService(srv.id); setShowPopup(true); }} style={{ cursor: 'pointer' }}>{srv.title}</li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-heading">Contact Us</h3>
            <div className="footer-contact-item">
              <MessageCircle size={18} />
              <span>contact@ganeshmotors.in</span>
            </div>
            <div className="footer-contact-item">
              <MapPin size={18} />
              <span>+91 99099 56943</span>
            </div>
          </div>

          <div className="footer-col actions-col">
            <button className="footer-action-btn" onClick={() => setShowPopup(true)}>BOOK SERVICE</button>
            <div className="protect-restore-text">
              PROTECT & <span style={{ color: 'var(--primary-color)' }}>RESTORE</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="footer-bottom-content">
            <div className="footer-socials">
              <a href="#" className="social-icon" style={{ color: '#1877F2' }} title="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="social-icon" style={{ color: '#E1306C' }} title="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </div>
            <div className="footer-copyright">
              Copyright © 2026 <span style={{ color: 'var(--primary-color)' }}>Ganesh Motors</span>. All rights reserved.
            </div>
            <div className="footer-legal">
              <a href="#">Privacy Policy</a>
              <span>|</span>
              <a href="#">Terms and Conditions</a>
            </div>
            <button className="scroll-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <ChevronUp size={24} />
            </button>
          </div>
        </div>
      </footer>
    </>
  )
}

export default LandingPage
