import React, { useState } from 'react';
import { authApi } from '../api/authApi';
import type { SignupPayload, LoginPayload } from '../api/authApi';
import { tokenStorage } from '../utils/tokenStorage';
import { ApiResponse } from '../components/ApiResponse';

interface AuthPageProps {
  onAuthChange: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthChange }) => {
  // Signup state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupAvatar, setSignupAvatar] = useState('');
  const [signupBio, setSignupBio] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<any>(null);
  const [signupData, setSignupData] = useState<any>(null);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<any>(null);
  const [loginData, setLoginData] = useState<any>(null);

  const handleSignup = async () => {
    setSignupLoading(true);
    setSignupError(null);
    setSignupData(null);
    try {
      const payload: SignupPayload = { email: signupEmail, password: signupPassword };
      if (signupAvatar) payload.avatar = signupAvatar;
      if (signupBio) payload.bio = signupBio;
      const res = await authApi.signup(payload);
      setSignupData(res.data);
      // Auto-store tokens
      if (res.data.accessToken) {
        tokenStorage.setAccessToken(res.data.accessToken);
        tokenStorage.setRefreshToken(res.data.refreshToken);
        tokenStorage.setUser(res.data);
        onAuthChange();
      }
    } catch (err: any) {
      setSignupError(err.data || err);
    } finally {
      setSignupLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError(null);
    setLoginData(null);
    try {
      const payload: LoginPayload = { email: loginEmail, password: loginPassword };
      const res = await authApi.login(payload);
      setLoginData(res.data);
      // Auto-store tokens
      if (res.data.accessToken) {
        tokenStorage.setAccessToken(res.data.accessToken);
        tokenStorage.setRefreshToken(res.data.refreshToken);
        tokenStorage.setUser(res.data);
        onAuthChange();
      }
    } catch (err: any) {
      setLoginError(err.data || err);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>🔐 Authentication</h2>
      <p className="page-desc">Test signup and login endpoints. Tokens are auto-saved on success.</p>

      <div className="card-grid">
        {/* Signup */}
        <div className="card">
          <h3>POST /api/users — Signup</h3>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
              placeholder="test@example.com" />
          </div>
          <div className="form-group">
            <label>Password * <span className="hint">(8+ chars, upper+lower+digit+special)</span></label>
            <input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)}
              placeholder="Test@1234" />
          </div>
          <div className="form-group">
            <label>Avatar URL (optional)</label>
            <input type="text" value={signupAvatar} onChange={e => setSignupAvatar(e.target.value)}
              placeholder="https://..." />
          </div>
          <div className="form-group">
            <label>Bio (optional)</label>
            <input type="text" value={signupBio} onChange={e => setSignupBio(e.target.value)}
              placeholder="A short bio..." />
          </div>
          <button className="btn btn-primary" onClick={handleSignup} disabled={signupLoading}>
            {signupLoading ? 'Signing up...' : 'Signup'}
          </button>
          <ApiResponse label="Signup Response" loading={signupLoading} error={signupError} data={signupData} />
        </div>

        {/* Login */}
        <div className="card">
          <h3>POST /api/users/login — Login</h3>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
              placeholder="test@example.com" />
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
              placeholder="Test@1234" />
          </div>
          <button className="btn btn-primary" onClick={handleLogin} disabled={loginLoading}>
            {loginLoading ? 'Logging in...' : 'Login'}
          </button>
          <ApiResponse label="Login Response" loading={loginLoading} error={loginError} data={loginData} />
        </div>
      </div>

      {/* Validation test section */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <h3>🧪 Validation Edge Cases</h3>
        <p>Test these by entering invalid data above:</p>
        <ul>
          <li>Empty email / password → should get 400 validation errors</li>
          <li>Invalid email format → should get validation error</li>
          <li>Password without uppercase/lowercase/digit/special → should fail signup</li>
          <li>Password less than 8 chars → should fail signup</li>
          <li>Duplicate email signup → should get 409 conflict</li>
          <li>Wrong password on login → should get 404 invalid credentials</li>
          <li>Non-existent email login → should get 404 user not found</li>
        </ul>
      </div>
    </div>
  );
};
