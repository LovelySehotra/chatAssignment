import React, { useState } from 'react';
import { conversationApi } from '../api/conversationApi';
import { ApiResponse } from '../components/ApiResponse';

export const ConversationsPage: React.FC = () => {
  const [directPid, setDirectPid] = useState('');
  const [dL, setDL] = useState(false);
  const [dE, setDE] = useState<any>(null);
  const [dD, setDD] = useState<any>(null);

  const [gPids, setGPids] = useState('');
  const [gName, setGName] = useState('');
  const [gDesc, setGDesc] = useState('');
  const [gL, setGL] = useState(false);
  const [gE, setGE] = useState<any>(null);
  const [gD, setGD] = useState<any>(null);

  const [aL, setAL] = useState(false);
  const [aE, setAE] = useState<any>(null);
  const [aD, setAD] = useState<any>(null);

  const [bid, setBid] = useState('');
  const [bL, setBL] = useState(false);
  const [bE, setBE] = useState<any>(null);
  const [bD, setBD] = useState<any>(null);

  const createDirect = async () => {
    setDL(true); setDE(null); setDD(null);
    try { const r = await conversationApi.createDirect({ type: 'direct', participantIds: [directPid.trim()] }); setDD(r.data); }
    catch (e: any) { setDE(e.data || e); } finally { setDL(false); }
  };
  const createGroup = async () => {
    setGL(true); setGE(null); setGD(null);
    try {
      const ids = gPids.split(',').map(s => s.trim()).filter(Boolean);
      const r = await conversationApi.createGroup({ type: 'group', participantIds: ids, name: gName, description: gDesc || undefined });
      setGD(r.data);
    } catch (e: any) { setGE(e.data || e); } finally { setGL(false); }
  };
  const getAll = async () => {
    setAL(true); setAE(null); setAD(null);
    try { const r = await conversationApi.getAll(); setAD(r.data); }
    catch (e: any) { setAE(e.data || e); } finally { setAL(false); }
  };
  const getById = async () => {
    setBL(true); setBE(null); setBD(null);
    try { const r = await conversationApi.getById(bid.trim()); setBD(r.data); }
    catch (e: any) { setBE(e.data || e); } finally { setBL(false); }
  };

  return (
    <div className="page">
      <h2>💬 Conversations</h2>
      <p className="page-desc">All conversation endpoints require authentication.</p>
      <div className="card-grid">
        <div className="card">
          <h3>POST /api/conversations/direct</h3>
          <div className="form-group"><label>Other User ID *</label><input value={directPid} onChange={e => setDirectPid(e.target.value)} placeholder="ObjectId" /></div>
          <button className="btn btn-primary" onClick={createDirect} disabled={dL}>{dL ? 'Creating...' : 'Create Direct'}</button>
          <ApiResponse label="Response" loading={dL} error={dE} data={dD} />
        </div>
        <div className="card">
          <h3>POST /api/conversations/group</h3>
          <div className="form-group"><label>Participant IDs * (comma-separated)</label><input value={gPids} onChange={e => setGPids(e.target.value)} placeholder="id1,id2" /></div>
          <div className="form-group"><label>Group Name *</label><input value={gName} onChange={e => setGName(e.target.value)} placeholder="My Group" /></div>
          <div className="form-group"><label>Description</label><input value={gDesc} onChange={e => setGDesc(e.target.value)} placeholder="optional" /></div>
          <button className="btn btn-primary" onClick={createGroup} disabled={gL}>{gL ? 'Creating...' : 'Create Group'}</button>
          <ApiResponse label="Response" loading={gL} error={gE} data={gD} />
        </div>
        <div className="card">
          <h3>GET /api/conversations</h3>
          <button className="btn btn-primary" onClick={getAll} disabled={aL}>{aL ? 'Loading...' : 'Get My Conversations'}</button>
          <ApiResponse label="Response" loading={aL} error={aE} data={aD} />
        </div>
        <div className="card">
          <h3>GET /api/conversations/:id</h3>
          <div className="form-group"><label>Conversation ID *</label><input value={bid} onChange={e => setBid(e.target.value)} placeholder="ObjectId" /></div>
          <button className="btn btn-primary" onClick={getById} disabled={bL}>{bL ? 'Loading...' : 'Get Conversation'}</button>
          <ApiResponse label="Response" loading={bL} error={bE} data={bD} />
        </div>
      </div>
      <div className="card" style={{ marginTop: '1rem' }}><h3>🧪 Test Cases</h3><ul>
        <li>Create direct between same two users twice → returns existing</li>
        <li>Get conversation where not participant → 403</li>
        <li>Invalid ID → 400 CastError</li>
        <li>Non-existent ID → 404</li>
      </ul></div>
    </div>
  );
};
