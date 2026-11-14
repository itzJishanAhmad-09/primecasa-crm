'use client';
import { today } from '@/lib/crm-store';
import { Due, StageTag } from './LeadsView';

export default function FollowUps({ leads, onOpen, onDone }) {
  const t = today();
  const group = (test) => leads.filter((l) => l.next && test(l.next)).sort((a, b) => (a.next < b.next ? -1 : 1));
  const Section = ({ title, items }) => (
    <div className="crm-card">
      <h2>{title} <em>{items.length}</em></h2>
      {items.length === 0 && <p className="crm-mute">Nothing here.</p>}
      {items.map((l) => (
        <div className="crm-task" key={l.id}>
          <div><b>{l.name}</b> <StageTag s={l.stage} /><div className="crm-mute">{l.phone} · {l.owner || 'Unassigned'}</div></div>
          <Due d={l.next} />
          <a className="crm-btn sm" href={`tel:${l.phone}`}>Call</a>
          <button className="crm-btn sm" onClick={() => onOpen(l.id)}>Log call</button>
          <button className="crm-btn sm" onClick={() => onDone(l.id)}>Done</button>
        </div>
      ))}
    </div>
  );
  return (<>
    <Section title="Overdue" items={group((d) => d < t)} />
    <Section title="Today" items={group((d) => d === t)} />
    <Section title="Upcoming" items={group((d) => d > t)} />
  </>);
}
