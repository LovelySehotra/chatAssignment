import React, { useState } from 'react';
import { messageApi } from '../api/messageApi';
import { ApiResponse } from '../components/ApiResponse';

export const MessagesPage: React.FC = () => {
  const [sConvId, setSConvId] = useState('');
  const [sContent, setSContent] = useState('');
  const [sL, setSL] = useState(false);
  const [sE, setSE] = useState<any>(null);
  const [sD, setSD] = useState<any>(null);

  const [mrConvId, setMrConvId] = useState('');
  const [mrMsgId, setMrMsgId] = useState('');
  const [mrL, setMrL] = useState(false);
  const [mrE, setMrE] = useState<any>(null);
  const [mrD, setMrD] = useState<any>(null);

  const [gConvId, setGConvId] = useState('');
  const [gCursor, setGCursor] = useState('');
  const [gLimit, setGLimit] = useState('20');
  const [gL, setGL] = useState(false);
  const [gE, setGE] = useState<any>(null);
  const [gD, setGD] = useState<any>(null);

  const [uConvId, setUConvId] = useState('');
  const [uL, setUL] = useState(false);
  const [uE, setUE] = useState<any>(null);
  const [uD, setUD] = useState<any>(null);

  const send = async () => {
    setSL(true); setSE(null); setSD(null);
    try { const r = await messageApi.send({ conversationId: sConvId, content: sContent }); setSD(r.data); }
    catch (e: any) { setSE(e.data || e); } finally { setSL(false); }
  };
  const markRead = async () => {
    setMrL(true); setMrE(null); setMrD(null);
    try { const r = await messageApi.markRead({ conversationId: mrConvId, messageId: mrMsgId }); setMrD(r.data); }
    catch (e: any) { setMrE(e.data || e); } finally { setMrL(false); }
  };
  const getMessages = async () => {
    setGL(true); setGE(null); setGD(null);
    try { const r = await messageApi.getByConversation(gConvId, gCursor||undefined, Number(gLimit)||20); setGD(r.data); }
    catch (e: any) { setGE(e.data || e); } finally { setGL(false); }
  };
  const getUnread = async () => {
    setUL(true); setUE(null); setUD(null);
    try { const r = await messageApi.getUnreadCount(uConvId); setUD(r.data); }
    catch (e: any) { setUE(e.data || e); } finally { setUL(false); }
  };

  return (
    <div className="page">
      <h2>✉️ Messages (HTTP)</h2>
      <div className="card-grid">
        <div className="card">
          <h3>POST /api/messages/send</h3>
          <div className="form-group"><label>Conversation ID *</label><input value={sConvId} onChange={e=>setSConvId(e.target.value)} placeholder="ObjectId" /></div>
          <div className="form-group"><label>Content *</label><input value={sContent} onChange={e=>setSContent(e.target.value)} placeholder="Hello!" /></div>
          <button className="btn btn-primary" onClick={send} disabled={sL}>{sL?'Sending...':'Send Message'}</button>
          <ApiResponse label="Response" loading={sL} error={sE} data={sD} />
        </div>
        <div className="card">
          <h3>POST /api/messages/mark-read</h3>
          <div className="form-group"><label>Conversation ID *</label><input value={mrConvId} onChange={e=>setMrConvId(e.target.value)} placeholder="ObjectId" /></div>
          <div className="form-group"><label>Message ID *</label><input value={mrMsgId} onChange={e=>setMrMsgId(e.target.value)} placeholder="ObjectId" /></div>
          <button className="btn btn-primary" onClick={markRead} disabled={mrL}>{mrL?'Marking...':'Mark Read'}</button>
          <ApiResponse label="Response" loading={mrL} error={mrE} data={mrD} />
        </div>
        <div className="card">
          <h3>GET /api/messages/:conversationId</h3>
          <div className="form-group"><label>Conversation ID *</label><input value={gConvId} onChange={e=>setGConvId(e.target.value)} placeholder="ObjectId" /></div>
          <div className="form-group"><label>Cursor (optional)</label><input value={gCursor} onChange={e=>setGCursor(e.target.value)} placeholder="last message id" /></div>
          <div className="form-group"><label>Limit</label><input type="number" value={gLimit} onChange={e=>setGLimit(e.target.value)} /></div>
          <button className="btn btn-primary" onClick={getMessages} disabled={gL}>{gL?'Loading...':'Get Messages'}</button>
          <ApiResponse label="Response" loading={gL} error={gE} data={gD} />
        </div>
        <div className="card">
          <h3>GET /api/messages/:id/unread-count</h3>
          <div className="form-group"><label>Conversation ID *</label><input value={uConvId} onChange={e=>setUConvId(e.target.value)} placeholder="ObjectId" /></div>
          <button className="btn btn-primary" onClick={getUnread} disabled={uL}>{uL?'Loading...':'Get Unread Count'}</button>
          <ApiResponse label="Response" loading={uL} error={uE} data={uD} />
        </div>
      </div>
    </div>
  );
};
