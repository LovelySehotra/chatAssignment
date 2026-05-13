import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket';

export const SocketTestPage: React.FC = () => {
  const { connected, socketId, logs, connect, disconnect, joinConversation, leaveConversation, sendMessage, markRead, clearLogs } = useSocket();
  const [convId, setConvId] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [mrConvId, setMrConvId] = useState('');
  const [mrMsgId, setMrMsgId] = useState('');

  const logColors: Record<string, string> = { 
    info: '#2196F3', 
    sent: '#4CAF50', 
    received: '#FF9800', 
    error: '#f44336', 
    ack: '#9C27B0',
    user_online: '#00E676',
    user_offline: '#FF1744'
  };

  return (
    <div className="page">
      <h2>🔌 Socket.IO Testing</h2>

      <div className="card">
        <h3>Connection</h3>
        <div style={{display:'flex',gap:'0.5rem',alignItems:'center',flexWrap:'wrap'}}>
          <button className="btn btn-primary" onClick={connect} disabled={connected}>Connect</button>
          <button className="btn btn-danger" onClick={disconnect} disabled={!connected}>Disconnect</button>
          <span style={{fontWeight:'bold',color: connected?'#4CAF50':'#f44336'}}>
            {connected ? `✅ Connected (${socketId})` : '❌ Disconnected'}
          </span>
        </div>
      </div>

      <div className="card-grid" style={{marginTop:'1rem'}}>
        <div className="card">
          <h3>Room Actions</h3>
          <div className="form-group"><label>Conversation ID</label><input value={convId} onChange={e=>setConvId(e.target.value)} placeholder="ObjectId" /></div>
          <div style={{display:'flex',gap:'0.5rem'}}>
            <button className="btn btn-primary" onClick={()=>joinConversation(convId)} disabled={!connected||!convId}>Join Room</button>
            <button className="btn btn-danger" onClick={()=>leaveConversation(convId)} disabled={!connected||!convId}>Leave Room</button>
          </div>
        </div>
        <div className="card">
          <h3>Send Message (Socket)</h3>
          <div className="form-group"><label>Conversation ID</label><input value={convId} onChange={e=>setConvId(e.target.value)} placeholder="ObjectId" /></div>
          <div className="form-group"><label>Content</label><input value={msgContent} onChange={e=>setMsgContent(e.target.value)} placeholder="Hello via socket!" /></div>
          <button className="btn btn-primary" onClick={()=>sendMessage(convId,msgContent)} disabled={!connected||!convId||!msgContent}>Send</button>
        </div>
        <div className="card">
          <h3>Mark Read (Socket)</h3>
          <div className="form-group"><label>Conversation ID</label><input value={mrConvId} onChange={e=>setMrConvId(e.target.value)} placeholder="ObjectId" /></div>
          <div className="form-group"><label>Message ID</label><input value={mrMsgId} onChange={e=>setMrMsgId(e.target.value)} placeholder="ObjectId" /></div>
          <button className="btn btn-primary" onClick={()=>markRead(mrConvId,mrMsgId)} disabled={!connected||!mrConvId||!mrMsgId}>Mark Read</button>
        </div>
      </div>

      <div className="card" style={{marginTop:'1rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3>Event Log ({logs.length})</h3>
          <button className="btn btn-sm" onClick={clearLogs}>Clear</button>
        </div>
        <div className="event-log">
          {logs.length === 0 && <div className="text-muted">No events yet. Connect to start.</div>}
          {logs.map((log, i) => (
            <div key={i} className="log-entry" style={{borderLeft:`3px solid ${logColors[log.type]||'#999'}`}}>
              <span className="log-time">[{log.time}]</span>
              <span className="log-type" style={{color:logColors[log.type]}}>[{log.type.toUpperCase()}]</span>
              <span className="log-event">{log.event}</span>
              {log.data && <pre className="log-data">{JSON.stringify(log.data, null, 2)}</pre>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
