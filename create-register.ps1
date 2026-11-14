function Write-File {
  param([string]$Path, [string]$Content)
  $full = Join-Path $PSScriptRoot $Path
  $dir  = Split-Path $full -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  [System.IO.File]::WriteAllText($full, $Content, (New-Object System.Text.UTF8Encoding($false)))
  Write-Host "  OK    $Path" -ForegroundColor Green
}

Write-Host "Creating Register Page files..." -ForegroundColor Cyan
Write-Host ""

Write-File "app\api\auth\register\route.js" @'
import { prisma } from '@/lib/db';
import { handle, HttpError, hashPassword, startSession } from '@/lib/auth';

export const POST = handle(async (req) => {
  const { name, email, password, companyName, phone, teamSize } = await req.json();
  
  if (!name || !email || String(password || '').length < 8) {
    throw new HttpError(400, 'Name, email and an 8+ character password are required');
  }
  
  if (await prisma.user.findUnique({ where: { email: email.toLowerCase() } })) {
    throw new HttpError(409, 'Email already in use');
  }

  const u = await prisma.user.create({ 
    data: { 
      name, 
      email: email.toLowerCase(), 
      passwordHash: await hashPassword(password), 
      role: 'ADMIN',
      companyName: companyName || null,
      phone: phone || null,
      teamSize: teamSize || null
    } 
  });
  
  await startSession(u);
  return Response.json({ name: u.name, role: u.role }, { status: 201 });
});
'@

Write-File "app\register\register.css" @'
.auth-container { display: flex; min-height: 100vh; font-family: system-ui, -apple-system, sans-serif; }
.auth-left { flex: 1; background-color: #b31b1b; color: white; padding: 40px; display: flex; flex-direction: column; justify-content: space-between; }
.auth-left h1 { font-size: 2.5rem; margin-bottom: 1rem; line-height: 1.2; font-weight: 500; }
.auth-left p { font-size: 1rem; opacity: 0.9; }
.auth-right { flex: 1; background-color: #fafafa; display: flex; align-items: center; justify-content: center; padding: 40px; }
.auth-form-box { width: 100%; max-width: 420px; }
.auth-form-box h2 { font-size: 2rem; margin-bottom: 0.3rem; color: #111; font-weight: 500; }
.auth-form-box p.sub { color: #666; margin-bottom: 2rem; font-size: 0.9rem; }
.auth-form-box label { display: block; font-size: 0.85rem; font-weight: 600; color: #333; margin-bottom: 0.3rem; margin-top: 1rem; }
.auth-form-box input, .auth-form-box select { width: 100%; padding: 10px 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 0.95rem; background: white; }
.auth-form-box input:focus, .auth-form-box select:focus { outline: none; border-color: #b31b1b; }
.auth-form-box .checkbox-row { display: flex; align-items: center; gap: 8px; margin-top: 1.5rem; font-size: 0.85rem; color: #555; }
.auth-form-box .checkbox-row input { width: auto; margin: 0; }
.auth-form-box button { width: 100%; background: #b31b1b; color: white; border: none; padding: 12px; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer; margin-top: 1.5rem; }
.auth-form-box button:hover { background: #9a1515; }
.auth-form-box button:disabled { opacity: 0.7; cursor: not-allowed; }
.auth-form-box .login-link { text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: #555; }
.auth-form-box .login-link a { color: #b31b1b; text-decoration: none; font-weight: 600; }
@media (max-width: 768px) { .auth-container { flex-direction: column; } .auth-left { display: none; } }
'@

Write-File "app\register\page.jsx" @'
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
'@

Write-Host ""
Write-Host "Done. Go to http://localhost:3002/register" -ForegroundColor Yellow