'use client';
import { fmtDate } from '@/lib/crm-store';

export default function Bookings({ leads, onOpen }) {
  const booked = leads.filter(l => l.stage === 'Booked').sort((a,b) => (b.created || '').localeCompare(a.created || ''));

  function exportCsv() {
    const rows = [['Name','Phone','Project','Budget','Owner','Created','Notes']];
    booked.forEach(l => rows.push([l.name, l.phone, l.project, l.budget, l.owner, l.created, l.notes]));
    const csv = rows.map(r => r.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="crm-card">
      <div className="crm-row between">
        <h2>Bookings <em>{booked.length}</em></h2>
        <button className="crm-btn" onClick={exportCsv} disabled={booked.length === 0}>Export CSV</button>
      </div>
      <div className="crm-tbl">
        <table>
          <thead>
            <tr><th>Customer</th><th>Project</th><th>Budget</th><th>Owner</th><th>Booked on</th></tr>
          </thead>
          <tbody>
            {booked.map(l => (
              <tr key={l.id} className="click" onClick={() => onOpen(l.id)}>
                <td><b>{l.name}</b><div className="crm-mute">{l.phone}</div></td>
                <td>{l.project || '-'}</td>
                <td>{l.budget || '-'}</td>
                <td>{l.owner || 'Unassigned'}</td>
                <td>{fmtDate(l.created)}</td>
              </tr>
            ))}
            {booked.length === 0 && (
              <tr><td colSpan={5} className="crm-mute">No bookings yet. Move a lead to "Booked" stage to see it here.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}