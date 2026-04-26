import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { ClientRequest, RequestStatus, ChatMessage, PortfolioProject } from '../types';

const STATUS_OPTIONS: RequestStatus[] = ['submitted', 'reviewing', 'quoted', 'in_progress', 'review', 'completed', 'cancelled'];
const statusColor: Record<RequestStatus, string> = {
  submitted: '#8A9BB0', reviewing: '#FFB800', quoted: '#00C9FF',
  in_progress: '#00FF88', review: '#FFB800', completed: '#00FF88', cancelled: '#FF4B4B',
};
const mono = "'JetBrains Mono',monospace";

/* ──────────────────────────────────────────
   ADMIN PAGE — tabs: Requests | Works
────────────────────────────────────────── */
const AdminPage: React.FC = () => {
  const [tab, setTab] = useState<'requests' | 'works'>('requests');

  return (
    <section style={{ padding: '2rem 3rem', maxWidth: 1100, margin: '0 auto' }}>
      <div className="section-label">admin_panel</div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem' }}>Admin</h1>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {([['requests', '📋 Requests'], ['works', '🖼 Works']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ fontFamily: mono, fontSize: '0.72rem', padding: '0.6rem 1.25rem', borderRadius: '4px 4px 0 0', border: '1px solid var(--border)', borderBottom: tab === key ? '1px solid var(--bg)' : '1px solid var(--border)', background: tab === key ? 'var(--bg)' : 'var(--bg2)', color: tab === key ? 'var(--green)' : 'var(--fg3)', cursor: 'pointer', marginBottom: '-1px', transition: 'all 0.2s' }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'requests' ? <RequestsTab /> : <WorksTab />}
    </section>
  );
};

/* ──────────────────────────────────────────
   REQUESTS TAB
────────────────────────────────────────── */
const RequestsTab: React.FC = () => {
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RequestStatus | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('client_requests').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setRequests(data as ClientRequest[]); })
      .finally(() => setLoading(false));

    const channel = supabase.channel('admin-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'client_requests' }, () => {
        supabase.from('client_requests').select('*').order('created_at', { ascending: false })
          .then(({ data }) => { if (data) setRequests(data as ClientRequest[]); });
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateRequest = async (id: string, patch: Partial<ClientRequest>) => {
    await supabase.from('client_requests').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id);
    setRequests(rs => rs.map(r => r.id === id ? { ...r, ...patch } : r));
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  return (
    <>
      {/* Filter bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {(['all', ...STATUS_OPTIONS] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ fontFamily: mono, fontSize: '0.63rem', padding: '0.3rem 0.8rem', borderRadius: 3, border: '1px solid var(--border2)', cursor: 'pointer', background: filter === s ? 'var(--green)' : 'var(--bg2)', color: filter === s ? '#080B0F' : 'var(--fg3)', transition: 'all 0.2s' }}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ fontFamily: mono, fontSize: '0.72rem', color: 'var(--fg3)' }}>▮ loading...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
          {filtered.map(r => (
            <RequestRow
              key={r.id}
              request={r}
              expanded={expanded === r.id}
              onToggle={() => setExpanded(expanded === r.id ? null : r.id)}
              onUpdate={patch => updateRequest(r.id, patch)}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', fontFamily: mono, fontSize: '0.72rem', color: 'var(--fg3)' }}>// no requests</div>
          )}
        </div>
      )}
    </>
  );
};

/* ── Individual request row + expandable editor ── */
const RequestRow: React.FC<{
  request: ClientRequest;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<ClientRequest>) => void;
}> = ({ request, expanded, onToggle, onUpdate }) => {
  const [form, setForm] = useState({
    status: request.status,
    quoted_price: request.quoted_price?.toString() || '',
    quoted_currency: request.quoted_currency || 'GHC',
    quoted_deadline: request.quoted_deadline?.slice(0, 10) || '',
    admin_notes: request.admin_notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLoaded, setChatLoaded] = useState(false);
  const [newMsg, setNewMsg] = useState('');
  const [isCheckpoint, setIsCheckpoint] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded || chatLoaded) return;
    supabase.from('project_messages').select('*').eq('request_id', request.id).order('created_at')
      .then(({ data }) => { if (data) setMessages(data as ChatMessage[]); setChatLoaded(true); });

    const channel = supabase.channel(`admin-chat-${request.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'project_messages', filter: `request_id=eq.${request.id}` },
        payload => setMessages(prev => [...prev, payload.new as ChatMessage]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [expanded, request.id, chatLoaded]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const save = async () => {
    setSaving(true);
    const patch: Partial<ClientRequest> = {
      status: form.status as RequestStatus,
      quoted_price: form.quoted_price ? parseFloat(form.quoted_price) : null,
      quoted_currency: form.quoted_currency,
      quoted_deadline: form.quoted_deadline ? new Date(form.quoted_deadline).toISOString() : null,
      admin_notes: form.admin_notes || null,
    };
    await onUpdate(patch);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sendMsg = async () => {
    if (!newMsg.trim() || sendingMsg) return;
    setSendingMsg(true);
    await supabase.from('project_messages').insert([{
      request_id: request.id,
      sender_role: 'admin',
      sender_name: 'Enoch',
      message: newMsg.trim(),
      is_checkpoint: isCheckpoint,
    }]);
    setNewMsg(''); setIsCheckpoint(false); setSendingMsg(false);
  };

  return (
    <div style={{ background: 'var(--bg2)' }}>
      {/* Summary row */}
      <div onClick={onToggle} style={{ padding: '1.1rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s' }}
        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--bg3)'}
        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
        <div>
          <div style={{ fontFamily: mono, fontSize: '0.58rem', color: 'var(--fg3)', marginBottom: '0.15rem' }}>#{request.id.slice(0, 8).toUpperCase()}</div>
          <div style={{ fontWeight: 700, marginBottom: '0.15rem' }}>{request.full_name} — <span style={{ color: 'var(--cyan)' }}>{request.service_name}</span></div>
          <div style={{ fontFamily: mono, fontSize: '0.62rem', color: 'var(--fg3)' }}>{request.email} · {new Date(request.created_at).toLocaleDateString()}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontFamily: mono, fontSize: '0.65rem', padding: '0.25rem 0.6rem', borderRadius: 3, border: `1px solid ${statusColor[request.status]}33`, color: statusColor[request.status], background: `${statusColor[request.status]}11` }}>
            {request.status}
          </span>
          <span style={{ color: 'var(--fg3)', fontSize: '0.8rem' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'var(--bg3)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

          {/* LEFT — Controls */}
          <div>
            <div style={{ fontFamily: mono, fontSize: '0.6rem', color: 'var(--green)', letterSpacing: '0.2em', marginBottom: '1rem' }}>// update_request</div>

            <div className="form-group">
              <label>status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as RequestStatus }))}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label>currency</label>
                <select value={form.quoted_currency} onChange={e => setForm(f => ({ ...f, quoted_currency: e.target.value }))}>
                  {['GHC', 'USD', 'EUR', 'GBP'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>quoted price</label>
                <input type="number" value={form.quoted_price} onChange={e => setForm(f => ({ ...f, quoted_price: e.target.value }))} placeholder="0.00" />
              </div>
            </div>

            <div className="form-group">
              <label>delivery deadline (starts countdown)</label>
              <input type="date" value={form.quoted_deadline} onChange={e => setForm(f => ({ ...f, quoted_deadline: e.target.value }))} />
            </div>

            <div className="form-group">
              <label>note to client</label>
              <textarea value={form.admin_notes} onChange={e => setForm(f => ({ ...f, admin_notes: e.target.value }))} placeholder="// visible on client dashboard..." style={{ minHeight: 70 }} />
            </div>

            <button onClick={save} disabled={saving} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {saving ? 'saving...' : saved ? '✓ saved!' : 'save changes →'}
            </button>

            {/* Client details */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4 }}>
              <div style={{ fontFamily: mono, fontSize: '0.6rem', color: 'var(--fg3)', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>CLIENT DETAILS</div>
              {[['email', request.email], ['phone', request.phone || '—'], ['budget', request.budget_range || '—']].map(([k, v]) => (
                <div key={k} style={{ marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: mono, fontSize: '0.6rem', color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{k}: </span>
                  <span style={{ fontFamily: mono, fontSize: '0.7rem', color: 'var(--fg)' }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: '0.75rem', fontFamily: mono, fontSize: '0.65rem', color: 'var(--fg2)', lineHeight: 1.7 }}>
                {request.project_details}
              </div>
            </div>
          </div>

          {/* RIGHT — Chat */}
          <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem 1rem', background: 'var(--bg3)', borderBottom: '1px solid var(--border)', fontFamily: mono, fontSize: '0.6rem', color: 'var(--green)', letterSpacing: '0.2em' }}>
              // project_messages
            </div>
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: 280, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {messages.length === 0 && (
                <div style={{ fontFamily: mono, fontSize: '0.65rem', color: 'var(--fg3)', textAlign: 'center', padding: '1.5rem 0' }}>// no messages yet</div>
              )}
              {messages.map(m => (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender_role === 'admin' ? 'flex-end' : 'flex-start' }}>
                  {m.is_checkpoint ? (
                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                      <div style={{ padding: '0.25rem 0.7rem', background: 'rgba(0,255,136,0.07)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 20, fontFamily: mono, fontSize: '0.62rem', color: 'var(--green)' }}>
                        🏁 {m.message}
                      </div>
                      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    </div>
                  ) : (
                    <div style={{ maxWidth: '80%' }}>
                      <div style={{ fontFamily: mono, fontSize: '0.57rem', color: 'var(--fg3)', marginBottom: '0.15rem', textAlign: m.sender_role === 'admin' ? 'right' : 'left' }}>
                        {m.sender_role === 'admin' ? 'You' : m.sender_name} · {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ padding: '0.5rem 0.8rem', borderRadius: m.sender_role === 'admin' ? '8px 8px 2px 8px' : '8px 8px 8px 2px', background: m.sender_role === 'admin' ? 'var(--green)' : 'var(--bg3)', color: m.sender_role === 'admin' ? '#080B0F' : 'var(--fg)', fontFamily: mono, fontSize: '0.7rem', lineHeight: 1.5, border: m.sender_role === 'client' ? '1px solid var(--border2)' : 'none' }}>
                        {m.message}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Checkpoint toggle */}
            <div style={{ padding: '0.5rem 0.85rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg3)' }}>
              <button onClick={() => setIsCheckpoint(c => !c)}
                style={{ fontFamily: mono, fontSize: '0.6rem', padding: '0.25rem 0.65rem', borderRadius: 3, border: `1px solid ${isCheckpoint ? 'var(--green)' : 'var(--border2)'}`, background: isCheckpoint ? 'rgba(0,255,136,0.1)' : 'transparent', color: isCheckpoint ? 'var(--green)' : 'var(--fg3)', cursor: 'pointer', transition: 'all 0.2s' }}>
                🏁 {isCheckpoint ? 'checkpoint ON' : 'checkpoint OFF'}
              </button>
              <span style={{ fontFamily: mono, fontSize: '0.58rem', color: 'var(--fg3)' }}>· checkpoints appear as milestones on client timeline</span>
            </div>
            <div style={{ padding: '0.65rem 0.85rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem', background: 'var(--bg2)' }}>
              <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendMsg(); }}
                placeholder={isCheckpoint ? '// milestone label...' : '// message to client...'}
                style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 3, padding: '0.45rem 0.75rem', fontFamily: mono, fontSize: '0.68rem', color: 'var(--fg)', outline: 'none' }}
              />
              <button onClick={sendMsg} disabled={sendingMsg || !newMsg.trim()} className="btn-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.65rem' }}>
                {sendingMsg ? '...' : 'send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ──────────────────────────────────────────
   WORKS TAB
────────────────────────────────────────── */
const WorksTab: React.FC = () => {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null); // id or 'new'
  const [form, setForm] = useState<Partial<PortfolioProject>>({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchProjects = () =>
    supabase.from('portfolio_projects').select('*').order('sort_order')
      .then(({ data }) => { if (data) setProjects(data as PortfolioProject[]); setLoading(false); });

  useEffect(() => { fetchProjects(); }, []);

  const startNew = () => {
    setForm({ name: '', category: '', year: new Date().getFullYear().toString(), description: '', tags: [], images: [], status: 'delivered', sort_order: projects.length });
    setEditing('new');
  };

  const startEdit = (p: PortfolioProject) => { setForm({ ...p }); setEditing(p.id); };

  const uploadImages = async (files: FileList) => {
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const path = `portfolio/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('portfolio-images').upload(path, file, { cacheControl: '3600', upsert: false });
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('portfolio-images').getPublicUrl(path);
        urls.push(publicUrl);
      }
    }
    setForm(f => ({ ...f, images: [...(f.images || []), ...urls] }));
    setUploading(false);
  };

  const removeImage = (idx: number) =>
    setForm(f => ({ ...f, images: (f.images || []).filter((_, i) => i !== idx) }));

  const save = async () => {
    if (!form.name) return;
    setSaving(true);
    const payload = {
      name: form.name,
      category: form.category || '',
      year: form.year || '',
      description: form.description || '',
      tags: form.tags || [],
      images: form.images || [],
      project_url: form.project_url || null,
      status: form.status || 'delivered',
      sort_order: form.sort_order ?? 0,
    };
    if (editing === 'new') {
      await supabase.from('portfolio_projects').insert([payload]);
    } else {
      await supabase.from('portfolio_projects').update(payload).eq('id', editing);
    }
    await fetchProjects();
    setEditing(null);
    setSaving(false);
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await supabase.from('portfolio_projects').delete().eq('id', id);
    setProjects(ps => ps.filter(p => p.id !== id));
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
        <button className="btn-primary" onClick={startNew}>+ add project →</button>
      </div>

      {/* Editor panel */}
      {editing && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--green)', borderRadius: 6, padding: '1.75rem', marginBottom: '2rem', animation: 'fadeUp 0.2s ease' }}>
          <div style={{ fontFamily: mono, fontSize: '0.6rem', color: 'var(--green)', letterSpacing: '0.2em', marginBottom: '1.25rem' }}>
            // {editing === 'new' ? 'new_project' : 'edit_project'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>project name *</label>
              <input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Korantema Ventures" />
            </div>
            <div className="form-group">
              <label>category</label>
              <input value={form.category || ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Brand Identity" />
            </div>
            <div className="form-group">
              <label>year</label>
              <input value={form.year || ''} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="2024" />
            </div>
            <div className="form-group">
              <label>status</label>
              <select value={form.status || 'delivered'} onChange={e => setForm(f => ({ ...f, status: e.target.value as PortfolioProject['status'] }))}>
                <option value="delivered">delivered</option>
                <option value="in_progress">in_progress</option>
                <option value="archived">archived</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>description</label>
              <textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="// describe the project..." style={{ minHeight: 80 }} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>tags (comma separated)</label>
              <input
                defaultValue={(form.tags || []).join(', ')}
                key={editing ?? 'tags'}
                onBlur={e => setForm(f => ({ ...f, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                placeholder="react, supabase, ui/ux"
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>live project url (optional)</label>
              <input
                value={form.project_url || ''}
                onChange={e => setForm(f => ({ ...f, project_url: e.target.value || null }))}
                placeholder="https://yourproject.com"
              />
            </div>
          </div>

          {/* Image uploader */}
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ fontFamily: mono, fontSize: '0.6rem', color: 'var(--fg3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>project images (landscape recommended)</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
              {(form.images || []).map((url, i) => (
                <div key={i} style={{ position: 'relative', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border2)', aspectRatio: '16/9' }}>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => removeImage(i)}
                    style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,75,75,0.9)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ✕
                  </button>
                </div>
              ))}

              <button onClick={() => fileRef.current?.click()}
                style={{ aspectRatio: '16/9', border: '2px dashed var(--border2)', borderRadius: 4, background: 'var(--bg3)', color: 'var(--fg3)', cursor: 'pointer', fontFamily: mono, fontSize: '0.68rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--green)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border2)'}>
                {uploading ? '⏳ uploading...' : <><span style={{ fontSize: '1.2rem' }}>+</span> add images</>}
              </button>
            </div>

            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
              onChange={e => e.target.files && uploadImages(e.target.files)} />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button onClick={save} disabled={saving || !form.name} className="btn-primary">
              {saving ? 'saving...' : editing === 'new' ? 'publish project →' : 'save changes →'}
            </button>
            <button onClick={() => setEditing(null)} className="btn-secondary">cancel</button>
          </div>
        </div>
      )}

      {/* Projects list */}
      {loading ? (
        <div style={{ fontFamily: mono, fontSize: '0.72rem', color: 'var(--fg3)' }}>▮ loading projects...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
          {projects.map(p => (
            <div key={p.id} style={{ background: 'var(--bg2)', padding: '1rem 1.5rem', display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: '1rem', alignItems: 'center' }}>
              {/* Thumbnail */}
              <div style={{ width: 56, height: 38, borderRadius: 3, overflow: 'hidden', background: 'var(--bg3)', border: '1px solid var(--border)', flexShrink: 0 }}>
                {p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontSize: '0.55rem', color: 'var(--fg3)' }}>no img</div>}
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: '0.15rem' }}>{p.name}</div>
                <div style={{ fontFamily: mono, fontSize: '0.62rem', color: 'var(--fg3)' }}>{p.category} · {p.year} · {p.images?.length || 0} images</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => startEdit(p)} className="btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.65rem' }}>edit</button>
                <button onClick={() => deleteProject(p.id)} style={{ padding: '0.3rem 0.75rem', fontSize: '0.65rem', fontFamily: mono, borderRadius: 3, border: '1px solid rgba(255,75,75,0.3)', background: 'rgba(255,75,75,0.06)', color: 'var(--red)', cursor: 'pointer' }}>delete</button>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', fontFamily: mono, fontSize: '0.72rem', color: 'var(--fg3)' }}>// no projects yet — add one above</div>
          )}
        </div>
      )}
    </>
  );
};

export default AdminPage;
