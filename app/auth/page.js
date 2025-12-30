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

  const { login, register, loginWithGoogle } = useAuth();
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

  const handleGoogleLogin = async () => {
    setError('');
    
    // Note: OAuth redirects, so loading state might persist until page unload
    // But we check for errors just in case popup blocked or immediate failure
    try {
        const result = await loginWithGoogle();
        if (!result.success) {
            setError(result.error || 'Google Login failed');
        }
    } catch (err) {
        setError('An unexpected error occurred during Google Login');
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

              <div className="divider">
                <span>OR</span>
              </div>

              <button 
                type="button" 
                className="google-btn" 
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="google-icon" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.799 L -6.734 42.379 C -8.804 40.439 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                  </g>
                </svg>
                Sign in with Google
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
