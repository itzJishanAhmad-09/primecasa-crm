'use client';
import { useState } from 'react';
import './login.css';

export default function Login() {
  const [f, setF] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault(); 
    setErr('');
    setLoading(true);
    
    const r = await fetch('/api/auth/login', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(f) 
    });
    
    if (r.ok) {
      window.location.href = '/crm';
    } else {
      const d = await r.json().catch(() => ({}));
      setErr(d.error || 'Login failed');
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div style={{ fontWeight: 600, fontSize: '1.2rem' }}>Prime Casa CRM</div>
        <div>
          <h1>Welcome back to your pipeline.</h1>
          <p>Call leads, follow up and book site visits from one place.</p>
        </div>
        <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Built for real estate sales teams</div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <h2>Sign in</h2>
          <p className="sub">Welcome back. Enter your details to continue.</p>

          {err && <div style={{ color: '#b31b1b', background: '#fde8ec', padding: 10, borderRadius: 6, marginBottom: 15, fontSize: '0.9rem' }}>{err}</div>}

          <form onSubmit={submit}>
            <label>Email or phone</label>
            <input 
              type="text" 
              placeholder="you@company.com" 
              value={f.email} 
              onChange={(e) => setF({ ...f, email: e.target.value })} 
              required 
            />

            <label>Password</label>
            <input 
              type="password" 
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" 
              value={f.password} 
              onChange={(e) => setF({ ...f, password: e.target.value })} 
              required 
            />

            <div className="row-between">
              <label className="checkbox-row" style={{ margin: 0, fontWeight: 'normal' }}>
                <input 
                  type="checkbox" 
                  checked={remember} 
                  onChange={(e) => setRemember(e.target.checked)} 
                />
                Remember me
              </label>
              <a href="#" className="forgot-link" onClick={(e) => { e.preventDefault(); alert('Password reset coming soon.'); }}>
                Forgot password?
              </a>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            
            <button 
              type="button" 
              className="otp-btn" 
              onClick={() => alert('Phone OTP login coming soon.')}
            >
              Sign in with phone OTP
            </button>
          </form>

          <div className="bottom-link">
            New here? <a href="/register">Create an account</a>
          </div>
        </div>
      </div>
    </div>
  );
}