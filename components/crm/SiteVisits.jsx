'use client';
import { today, addDays } from '@/lib/crm-store';
import { Due, StageTag } from './LeadsView';

export default function SiteVisits({ leads, onOpen, onMarkVisited }) {
  const t = today(), wk = addDays(7);
  const wv = leads.filter(l => l.visit);
  const pending = wv.filter(l => !l.visited);
  const done = wv.filter(l => l.visited).sort((a,b) => b.visit.localeCompare(a.visit)).slice(0,20);
  const group = (test) => pending.filter(l => test(l.visit)).sort((a,b) => a.visit.localeCompare(b.visit));

  const Row = ({ l }) => (
    <div className="crm-task">
      <div>
        <b>{l.name}</b> <StageTag s={l.stage} />
        <div className="crm-mute">{l.phone} | {l.project || 'No project'} | {l.owner || 'Unassigned'}</div>
      </div>
      <Due d={l.visit} />
      <a className="crm-btn sm" href={`tel:${l.phone}`}>Call</a>
      <button className="crm-btn sm" onClick={() => onOpen(l.id)}>Open</button>
      {!l.visited && <button className="crm-btn sm" onClick={() => onMarkVisited(l.id)}>Mark visited</button>}
    </div>
  );

  const Section = ({ title, items }) => (
    <div className="crm-card">
      <h2>{title} <em>{items.length}</em></h2>
      {items.length === 0 && <p className="crm-mute">Nothing here.</p>}
      {items.map(l => <Row key={l.id} l={l} />)}
    </div>
  );

  return (
    <>
      <Section title="Overdue" items={group(d => d < t)} />
      <Section title="Today" items={group(d => d === t)} />
      <Section title="Next 7 days" items={group(d => d > t && d <= wk)} />
      <Section title="Later" items={group(d => d > wk)} />
      {done.length > 0 && <Section title="Recently visited" items={done} />}
    </>
  );
}