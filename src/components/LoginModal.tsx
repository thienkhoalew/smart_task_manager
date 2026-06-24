'use client';

import React, { useState } from 'react';

interface LoginModalProps {
  onLogin: () => void;
}

export default function LoginModal({ onLogin }: LoginModalProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin();
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-card glass">
        <div className="login-header">
          <div className="login-logo">
            <span>S</span>
          </div>
          <h2>Smart Task Manager</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">
              Tên người dùng
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên của bạn..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              required
            />
          </div>

          <button type="submit" className="login-btn glow-btn">
            Đăng nhập
          </button>
        </form>
      </div>

      <style jsx>{`
        .login-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(9, 13, 22, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(8px);
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 40px;
          border-radius: var(--card-radius);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .login-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .login-logo {
          width: 56px;
          height: 56px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 28px;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        h2 {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        input {
          padding: 12px 16px;
          border-radius: var(--button-radius);
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-family: var(--font-family);
          font-size: 15px;
        }

        input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-glow);
        }

        .login-btn {
          margin-top: 8px;
          padding: 14px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: var(--button-radius);
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 10px var(--primary-glow);
        }

        .login-btn:hover {
          background: var(--primary-hover);
        }
      `}</style>
    </div>
  );
}
