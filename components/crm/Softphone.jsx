'use client';
import { useState, useRef } from 'react';
import { UserAgent, Inviter, SessionState, Registerer } from 'sip.js';

// âš ï¸ REPLACE THESE WITH YOUR FREE SIP.IO CREDENTIALS
const SIP_CONFIG = {
  uri: 'sip:your-username@sip.io', 
  transportOptions: { server: 'wss://sip.sip.io' },
  authorizationUsername: 'your-username',
  authorizationPassword: 'your-password'
};

export default function Softphone({ phone, onCallEnded }) {
  const [callState, setCallState] = useState('idle'); // idle, connecting, active, ended
  const userAgentRef = useRef(null);
  const inviterRef = useRef(null);

  const startCall = async () => {
    setCallState('connecting');
    try {
      // Initialize User Agent if not already done
      if (!userAgentRef.current) {
        const ua = new UserAgent({
          uri: SIP_CONFIG.uri,
          transportOptions: SIP_CONFIG.transportOptions,
          authorizationUsername: SIP_CONFIG.authorizationUsername,
          authorizationPassword: SIP_CONFIG.authorizationPassword,
          delegate: {
            onInvite(invitation) {
              invitation.reject(); // Reject incoming calls
            }
          }
        });
        await ua.start();
        userAgentRef.current = ua;
        
        const registerer = new Registerer(ua);
        await registerer.register();
      }

      // Create the call target (Assuming phone is a SIP URI or PSTN number)
      const target = UserAgent.makeURI(`sip:${phone}@sip.io`); 
      const inviter = new Inviter(userAgentRef.current, target);
      
      inviter.stateChange.addListener((state) => {
        if (state === SessionState.Established) setCallState('active');
        if (state === SessionState.Terminated) {
          setCallState('idle');
          if (onCallEnded) onCallEnded();
        }
      });

      await inviter.invite();
      inviterRef.current = inviter;
    } catch (error) {
      console.error('Call failed', error);
      alert('Call failed. Check your SIP credentials in Softphone.jsx');
      setCallState('idle');
    }
  };

  const endCall = async () => {
    if (inviterRef.current) {
      await inviterRef.current.hangup();
      inviterRef.current = null;
    }
    setCallState('idle');
  };

  if (callState === 'idle') {
    return (
      <button className="crm-btn sm pri" onClick={startCall}>
        ðŸ“ž Call {phone}
      </button>
    );
  }

  if (callState === 'connecting') {
    return (
      <button className="crm-btn sm" disabled>
        â³ Connecting...
      </button>
    );
  }

  if (callState === 'active') {
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <span style={{ color: 'green', fontWeight: 'bold', fontSize: 13, alignSelf: 'center' }}>ðŸ”´ Live</span>
        <button className="crm-btn sm dng" onClick={endCall}>
          â¹ Hang Up
        </button>
      </div>
    );
  }

  return null;
}