'use client';
import { useState } from 'react';

export default function Settings({ properties, users, onAddProperty, onRemoveProperty, onAddAgent }) {
  const [prop, setProp] = useState({ n: '', t: '', p: '', u: '' });
  const [agent, setAgent] = useState({ name: '', email: '', password: '', role: 'AGENT' });
  const [err, setErr] = useState('');

  async function addProp(e) {
    e.preventDefault(); setErr('');
    try { await onAddProperty(prop); setProp({ n: '', t: '', p: '', u: '' }); }
    catch (e) { setErr(e.message || 'Failed to add project'); }
  }

  async function addAgent(e) {
    e.preventDefault(); setErr('');
    try { await onAddAgent(agent); setAgent({ name: '', email: '', password: '', role: 'AGENT' }); }
    catch (e) { setErr(e.message || 'Failed to add user'); }
  }

  return (
    <div>
      {err && <div className="crm-card" style={{ color: '#c8102e' }}>{err}</div>}

      <div className="crm-card">
        <h2>Projects <em>{properties.length}</em></h2>
        <div className="crm-tbl">
          <table>
            <thead><tr><th>Name</th><th>Type</th><th>Price</th><th>Units</th><th></th></tr></thead>
            <tbody>
              {properties.map((p, i) => (
                <tr key={p.id}>
                  <td>{p.n}</td><td>{p.t}</td><td>{p.p}</td><td>{p.u}</td>
                  <td>
                    <button className="crm-btn sm dng" onClick={() => { if (confirm(`Delete "${p.n}"?`)) onRemoveProperty(i); }}>Delete</button>
                  </td>
                </tr>
              ))}
              {properties.length === 0 && <tr><td colSpan={5} className="crm-mute">No projects yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <form onSubmit={addProp} className="crm-row" style={{ marginTop: 12 }}>
          <input placeholder="Name" value={prop.n} onChange={e => setProp({ ...prop, n: e.target.value })} required />
          <input placeholder="Type (e.g. 2 and 3 BHK)" value={prop.t} onChange={e => setProp({ ...prop, t: e.target.value })} />
          <input placeholder="Price (e.g. 55L-95L)" value={prop.p} onChange={e => setProp({ ...prop, p: e.target.value })} />
          <input type="number" placeholder="Units" value={prop.u} onChange={e => setProp({ ...prop, u: e.target.value })} style={{ width: 90 }} />
          <button className="crm-btn pri" type="submit">Add project</button>
        </form>
      </div>

      <div className="crm-card">
        <h2>Users <em>{users.length}</em></h2>
        <div className="crm-tbl">
          <table>
            <thead><tr><th>Name</th><th>Role</th></tr></thead>
            <tbody>
              {users.map(u => <tr key={u.id}><td>{u.name}</td><td>{u.role}</td></tr>)}
              {users.length === 0 && <tr><td colSpan={2} className="crm-mute">No users yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <form onSubmit={addAgent} className="crm-row" style={{ marginTop: 12 }}>
          <input placeholder="Name" value={agent.name} onChange={e => setAgent({ ...agent, name: e.target.value })} required />
          <input type="email" placeholder="Email" value={agent.email} onChange={e => setAgent({ ...agent, email: e.target.value })} required />
          <input type="password" placeholder="Password (8+)" value={agent.password} onChange={e => setAgent({ ...agent, password: e.target.value })} required minLength={8} />
          <select value={agent.role} onChange={e => setAgent({ ...agent, role: e.target.value })}>
            <option value="AGENT">Agent</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button className="crm-btn pri" type="submit">Add user</button>
        </form>
      </div>
    </div>
  );
}