'use client';
export default function Dashboard({ stats: s }) {
  const kpi = [['New leads today', s.newToday], ['Calls today', s.callsToday], ['Visits in next 7 days', s.visitsWeek], ['Bookings', s.booked], ['Hot leads', s.hot, true]];
  return (<>
    <div className="crm-kpis">{kpi.map(([l, v, hot]) => <div key={l} className={`crm-card kpi ${hot ? 'hot' : ''}`}><span>{l}</span><b>{v}</b></div>)}</div>
    <div className="crm-card">
      <h2>Pipeline <em>{s.total} leads</em></h2>
      {s.pipeline.map(([stage, n]) => (
        <div className="crm-fun" key={stage}>{stage}<u style={{ width: `${(n / Math.max(1, s.total)) * 100}%` }} /><b>{n}</b></div>
      ))}
    </div>
  </>);
}