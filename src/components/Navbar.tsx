'use client';

import React from 'react';
import { useTheme } from './ThemeContext';
import { Sun, Moon, LogOut } from 'lucide-react';

interface NavbarProps {
  onLogout: () => void;
}

export default function Navbar({ onLogout }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar glass">
      <div className="nav-container">
        <div className="nav-brand">
          <div className="logo">
            <span>S</span>
          </div>
          <div className="brand-text">
            <h1>Smart Task Manager</h1>
          </div>
        </div>

        <div className="nav-actions">
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <div className="user-profile">
            <button 
              onClick={onLogout} 
              className="logout-btn" 
              title="Đăng xuất"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          width: 100%;
          border-bottom: 1px solid var(--border-color);
          padding: 12px 24px;
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo {
          width: 40px;
          height: 40px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 20px;
          color: var(--text-primary);
        }

        .brand-text h1 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .brand-text span {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .nav-stats {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .icon-blue { color: var(--primary); }
        .icon-orange { color: var(--warning); }
        .icon-green { color: var(--success); }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .theme-toggle-btn {
          background: none;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          cursor: pointer;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .theme-toggle-btn:hover {
          background: var(--bg-primary);
          border-color: var(--text-muted);
        }

        .logout-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logout-btn:hover {
          color: var(--danger);
          background: rgba(239, 68, 68, 0.1);
        }
      `}</style>
    </nav>
  );
}
