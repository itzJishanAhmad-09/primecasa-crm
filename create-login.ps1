function Write-File {
  param([string]$Path, [string]$Content)
  $full = Join-Path $PSScriptRoot $Path
  $dir  = Split-Path $full -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  [System.IO.File]::WriteAllText($full, $Content, (New-Object System.Text.UTF8Encoding($false)))
  Write-Host "  OK    $Path" -ForegroundColor Green
}

Write-Host "Creating Login page files..." -ForegroundColor Cyan
Write-Host ""

Write-File "app\login\login.css" @'
.auth-container { display: flex; min-height: 100vh; font-family: system-ui, sans-serif; }
.auth-left { flex: 1; background-color: #b31b1b; color: white; padding: 40px; display: flex; flex-direction: column; justify-content: space-between; }
.auth-left h1 { font-size: 2.5rem; margin-bottom: 1rem; line-height: 1.2; }
.auth-left p { font-size: 1rem; opacity: 0.9; }
.auth-right { flex: 1; background-color: #fafafa; display: flex; align-items: center; justify-content: center; padding: 40px; }
.auth-form-box { width: 100%; max-width: 420px; }
.auth-form-box h2 { font-size: 1.8rem; margin-bottom: 0.5rem; color: #111; }
.auth-form-box p.sub { color: #666; margin-bottom: 2rem; font-size: 0.95rem; }
.auth-form-box label { display: block; font-size: 0.85rem; font-weight: 600; color: #333; margin-bottom: 0.3rem; margin-top: 1rem; }
.auth-form-box input { width: 100%; padding: 10px 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 0.95rem; }
.auth-form-box input:focus { outline: none; border-color: #b31b1b; }
.auth-form-box button { width: 100%; background: #b31b1b; color: white; border: none; padding: 12px; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer; margin-top: 1.5rem; }
.auth-form-box button:hover { background: #9a1515; }
.auth-form-box button.otp-btn { background: white; color: #333; border: 1px solid #ddd; margin-top: 0.8rem; }
.auth-form-box button.otp-btn:hover { background: #f0f0f0; }
.auth-form-box .row-between { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; font-size: 0.85rem; color: #555; }
.auth-form-box .checkbox-row { display: flex; align-items: center; gap: 8px; }
.auth-form-box .checkbox-row input { width: auto; margin: 0; }
.auth-form-box .forgot-link { color: #b31b1b; text-decoration: none; font-weight: 600; }
.auth-form-box .bottom-link { text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: #555; }
.auth-form-box .bottom-link a { color: #b31b1b; text-decoration: none; font-weight: 600; }
@media (max-width: 768px) { .auth-container { flex-direction: column; } .auth-left { display: none; } }
'@

Write-File "app\login\page.jsx" @'
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
              placeholder="••••••••" 
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
'@

Write-Host ""
Write-Host "Done. Go to http://localhost:3002/login" -ForegroundColor Yellow