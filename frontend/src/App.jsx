import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Home from './pages/Home';
import Movies from './pages/Movies';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Temporary placeholders for future phases
const DashboardPlaceholder = () => (
  <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
    <div className="glass-panel" style={{ padding: '48px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '12px' }}>User Dashboard</h2>
      <p style={{ color: 'var(--text-muted)' }}>
        User statistics and rating history arriving in Phase 5.
      </p>
    </div>
  </div>
);

const AdminPlaceholder = () => (
  <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
    <div className="glass-panel" style={{ padding: '48px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '12px' }}>Admin Dashboard</h2>
      <p style={{ color: 'var(--text-muted)' }}>
        System analytics, user moderation, and review management arriving in Phase 6.
      </p>
    </div>
  </div>
);

const WatchlistPlaceholder = () => (
  <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
    <div className="glass-panel" style={{ padding: '48px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '12px' }}>My Watchlist</h2>
      <p style={{ color: 'var(--text-muted)' }}>
        Watchlist management arriving in Phase 4.
      </p>
    </div>
  </div>
);

const RecommendationsPlaceholder = () => (
  <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
    <div className="glass-panel" style={{ padding: '48px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '12px' }}>Personalized Recommendations</h2>
      <p style={{ color: 'var(--text-muted)' }}>
        Content-based recommendation engine arriving in Phase 5.
      </p>
    </div>
  </div>
);

import MovieDetails from './pages/MovieDetails';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: 'var(--bg-primary)'
        }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/movies/:id" element={<MovieDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected User Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPlaceholder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/watchlist"
                element={
                  <ProtectedRoute>
                    <WatchlistPlaceholder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recommendations"
                element={
                  <ProtectedRoute>
                    <RecommendationsPlaceholder />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPlaceholder />
                  </AdminRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
