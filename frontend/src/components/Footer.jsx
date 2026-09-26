import React from 'react';
import { Film, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      background: 'var(--bg-secondary)',
      padding: '48px 0 32px',
      marginTop: 'auto'
    }}>
      <div className="container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Film size={20} color="#6366f1" />
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem' }}>
            Movie<span style={{ color: '#6366f1' }}>Mate</span>
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '500px' }}>
          Final Year B.Tech CSE Full-Stack Capstone Project.
          Powered by React, Node.js, Express, MongoDB, and TMDB API.
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-dim)',
          fontSize: '0.85rem'
        }}>
          Built with <Heart size={14} color="#e11d48" fill="#e11d48" /> for academic demonstration & evaluation.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
