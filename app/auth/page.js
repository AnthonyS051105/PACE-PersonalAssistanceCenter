'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import './auth.css';

export default function AuthPage() {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(loginEmail, loginPassword);
      if (result.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await register(registerEmail, registerPassword, registerUsername);
      if (result.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const togglePanel = () => {
    setError('');
    setIsRightPanelActive(!isRightPanelActive);
  };

  return (
    <div className="auth-page">
      <div className={`auth-container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
        {/* Forms Container */}
        <div className="forms-container">
          {/* Login Form */}
          <div className="form-panel login">
            <form className="auth-form" onSubmit={handleLogin}>
              <h2>Sign In</h2>
              
              {error && !isRightPanelActive && (
                <div className="error-message">{error}</div>
              )}

              <div className="input-group">
                <input
                  type="email"
                  id="login-email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
                <i className="bx bx-envelope"></i>
              </div>

              <div className="input-group">
                <input
                  type="password"
                  id="login-password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <i className="bx bx-lock-alt"></i>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading && !isRightPanelActive ? (
                  <>
                    <span className="loading-spinner"></span>
                    Signing In...
                  </>
                ) : (
                  'Login'
                )}
              </button>

              <p className="form-footer">
                Don't have an account?{' '}
                <a onClick={togglePanel}>Sign Up</a>
              </p>
            </form>
          </div>

          {/* Register Form */}
          <div className="form-panel register">
            <form className="auth-form" onSubmit={handleRegister}>
              <h2>Create Account</h2>

              {error && isRightPanelActive && (
                <div className="error-message">{error}</div>
              )}

              <div className="input-group">
                <input
                  type="text"
                  id="register-username"
                  placeholder="Username"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  required
                />
                <i className="bx bx-user"></i>
              </div>

              <div className="input-group">
                <input
                  type="email"
                  id="register-email"
                  placeholder="Email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
                <i className="bx bx-envelope"></i>
              </div>

              <div className="input-group">
                <input
                  type="password"
                  id="register-password"
                  placeholder="Password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                />
                <i className="bx bx-lock-alt"></i>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading && isRightPanelActive ? (
                  <>
                    <span className="loading-spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  'Register'
                )}
              </button>

              <p className="form-footer">
                Already have an account?{' '}
                <a onClick={togglePanel}>Sign In</a>
              </p>
            </form>
          </div>
        </div>

        {/* Overlay Container */}
        <div className="overlay-container">
          <div className="overlay">
            {/* Left Overlay Panel - shown when register is active */}
            <div className="overlay-panel left">
              <h3>Welcome Back!</h3>
              <p>Already have an account? Sign in to continue your journey with PACE.</p>
              <button className="ghost-btn" onClick={togglePanel}>
                Sign In
              </button>
            </div>

            {/* Right Overlay Panel - shown when login is active */}
            <div className="overlay-panel right">
              <h3>Hello, Friend!</h3>
              <p>Enter your personal details and start your journey with PACE today.</p>
              <button className="ghost-btn" onClick={togglePanel}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
