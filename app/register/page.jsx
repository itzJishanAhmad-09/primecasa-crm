'use client';
import { useState } from 'react';
import './register.css';

export default function Register() {
  const [f, setF] = useState({ 
    name: '', companyName: '', email: '', phone: '', teamSize: '1 to 5', password: '' 
  });
  const [err, setErr] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!agree) { setErr('You must agree to the Terms and Privacy Policy'); return; }
    setErr('');
    setLoading(true);
    
    const r = await fetch('/api/auth/register', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(f) 
    });
    
    if (r.ok) {
      window.location.href = '/crm';
    } else {
      const d = await r.json().catch(() => ({}));
      setErr(d.error || 'Registration failed');
      setLoading(false);
    }
  }

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div style={{ fontWeight: 600, fontSize: '1.2rem' }}>Prime Casa CRM</div>
        <div>
          <h1>Start closing more site visits.</h1>
          <p>Call leads, follow up and book site visits from one place.</p>
        </div>
        <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Built for real estate sales teams</div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <h2>Create your account</h2>
          <p className="sub">Set up your team in a few minutes.</p>

          {err && <div style={{ color: '#b31b1b', background: '#fde8ec', padding: 10, borderRadius: 6, marginBottom: 15, fontSize: '0.9rem' }}>{err}</div>}

          <form onSubmit={submit}>
            <label>Full name</label>
            <input type="text" value={f.name} onChange={set('name')} required />

            <label>Company name</label>
            <input type="text" value={f.companyName} onChange={set('companyName')} required />

            <label>Work email</label>
            <input type="email" placeholder="you@company.com" value={f.email} onChange={set('email')} required />

            <label>Phone number</label>
            <input type="tel" placeholder="+91" value={f.phone} onChange={set('phone')} required />

            <label>Team size</label>
            <select value={f.teamSize} onChange={set('teamSize')}>
              <option>1 to 5</option>
              <option>6 to 20</option>
              <option>21 to 50</option>
              <option>50+</option>
            </select>

            <label>Password</label>
            <input type="password" value={f.password} onChange={set('password')} required minLength={8} />

            <div className="checkbox-row">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>I agree to the Terms and Privacy Policy</span>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="login-link">
            Already have an account? <a href="/login">Sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
}