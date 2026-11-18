'use client';
import { useState, useEffect } from 'react';

export default function Inbox({ leads, onSendMessage }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedLead) {
      fetch(`/api/messages/${selectedLead.id}`)
        .then(res => res.json())
        .then(setMessages);
    }
  }, [selectedLead]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedLead) return;
    setLoading(true);
    try {
      const sentMessage = await onSendMessage(selectedLead.id, newMessage);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
    } catch (err) {
      alert('Failed to send message. Check your WhatsApp API credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="crm-card">
      <div className="crm-row between">
        <h2>WhatsApp Inbox</h2>
      </div>
      <div style={{ display: 'flex', gap: 16, height: '65vh' }}>
        <div style={{ width: 280, overflowY: 'auto', borderRight: '1px solid #e5e5e8' }}>
          {leads.map(lead => (
            <div
              key={lead.id}
              onClick={() => setSelectedLead(lead)}
              style={{
                padding: 12,
                cursor: 'pointer',
                background: selectedLead?.id === lead.id ? '#fde8ec' : 'transparent',
                borderBottom: '1px solid #e5e5e8'
              }}
            >
              <b>{lead.name}</b>
              <div className="crm-mute">{lead.phone}</div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedLead ? (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                {messages.map(msg => (
                  <div key={msg.id} style={{ textAlign: msg.direction === 'inbound' ? 'left' : 'right', marginBottom: 8 }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '8px 12px',
                      borderRadius: 12,
                      background: msg.direction === 'inbound' ? '#f0f0f0' : '#b31b1b',
                      color: msg.direction === 'inbound' ? '#111' : '#fff',
                      maxWidth: '70%',
                      textAlign: 'left'
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {messages.length === 0 && <p className="crm-mute">No messages yet.</p>}
              </div>
              <div className="crm-row" style={{ padding: 12, borderTop: '1px solid #e5e5e8' }}>
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  style={{ flex: 1 }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button className="crm-btn pri" onClick={handleSend} disabled={loading}>
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </>
          ) : (
            <p className="crm-mute" style={{ padding: 24 }}>Select a conversation to start chatting.</p>
          )}
        </div>
      </div>
    </div>
  );
}