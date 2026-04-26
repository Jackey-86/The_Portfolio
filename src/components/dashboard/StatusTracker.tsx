import React, { useState, useEffect, useRef } from 'react';
import { ClientRequest, STATUS_STEPS, RequestStatus, ChatMessage } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface StatusTrackerProps { request: ClientRequest; }

const statusColors: Record<RequestStatus, { color: string; bg: string; border: string }> = {
  submitted:   { color: '#8A9BB0', bg: 'rgba(138,155,176,0.08)', border: 'rgba(138,155,176,0.3)' },
  reviewing:   { color: '#FFB800', bg: 'rgba(255,184,0,0.08)',   border: 'rgba(255,184,0,0.3)'   },
  quoted:      { color: '#00C9FF', bg: 'rgba(0,201,255,0.08)',   border: 'rgba(0,201,255,0.3)'   },
  in_progress: { color: '#00FF88', bg: 'rgba(0,255,136,0.08)',   border: 'rgba(0,255,136,0.3)'   },
  review:      { color: '#FFB800', bg: 'rgba(255,184,0,0.08)',   border: 'rgba(255,184,0,0.3)'   },
  completed:   { color: '#00FF88', bg: 'rgba(0,255,136,0.08)',   border: 'rgba(0,255,136,0.3)'   },
  cancelled:   { color: '#FF4B4B', bg: 'rgba(255,75,75,0.08)',   border: 'rgba(255,75,75,0.3)'   },
};

function useCountdown(deadline: string | null) {
  const calc = () => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    const s = Math.floor(diff / 1000);
    return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60, expired: false };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    if (!deadline) return;
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [deadline]);
  return time;
}

/* ── Toast notification ── */
const Toast: React.FC<{ text: string; onDone: () => void }> = ({ text, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 3000, background: 'var(--bg2)', border: '1px solid var(--green)', borderRadius: 6, padding: '0.75rem 1.25rem', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.72rem', color: 'var(--green)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)', animation: 'fadeUp 0.3s ease', maxWidth: 320 }}>
      💬 {text}
    </div>
  );
};

const StatusTracker: React.FC<StatusTrackerProps> = ({ request: initialRequest }) => {
  const { user } = useAuth();
  const [request, setRequest] = useState(initialRequest);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatOpenRef = useRef(chatOpen);
  chatOpenRef.current = chatOpen;

  const countdown = useCountdown(
    ['quoted', 'in_progress', 'review'].includes(request.status) ? request.quoted_deadline : null
  );

  /* Live status */
  useEffect(() => {
    const ch = supabase.channel(`req-${request.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'client_requests', filter: `id=eq.${request.id}` },
        p => setRequest(prev => ({ ...prev, ...(p.new as ClientRequest) })))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [request.id]);

  /* Load + realtime chat — always subscribed so notifications work even when panel is closed */
  useEffect(() => {
    supabase.from('project_messages').select('*').eq('request_id', request.id).order('created_at')
      .then(({ data }) => { if (data) setMessages(data as ChatMessage[]); });

    const ch = supabase.channel(`chat-client-${request.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'project_messages', filter: `request_id=eq.${request.id}` },
        payload => {
          const msg = payload.new as ChatMessage;
          setMessages(prev => {
            // avoid duplicate (optimistic already added)
            if (prev.find(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          // notify if message is from admin and chat panel is closed
          if (msg.sender_role === 'admin' && !chatOpenRef.current) {
            setUnread(n => n + 1);
            setToast(`New message from Enoch: "${msg.message.slice(0, 60)}${msg.message.length > 60 ? '…' : ''}"`);
          }
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [request.id]);

  useEffect(() => {
    if (chatOpen) {
      setUnread(0);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }
  }, [chatOpen, messages]);

  const sendMessage = async () => {
    if (!msgText.trim() || sending || !user) return;
    setSending(true);
    const optimistic: ChatMessage = {
      id: `opt-${Date.now()}`,
      request_id: request.id,
      sender_role: 'client',
      sender_name: request.full_name,
      message: msgText.trim(),
      is_checkpoint: false,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setMsgText('');
    const { data } = await supabase.from('project_messages').insert([{
      request_id: request.id,
      sender_role: 'client',
      sender_name: request.full_name,
      message: optimistic.message,
      is_checkpoint: false,
    }]).select().single();
    // replace optimistic with real
    if (data) setMessages(prev => prev.map(m => m.id === optimistic.id ? data as ChatMessage : m));
    setSending(false);
  };

  const currentIdx = STATUS_STEPS.findIndex(s => s.key === request.status);
  const sc = statusColors[request.status] || statusColors.submitted;
  const mono = "'JetBrains Mono',monospace";

  return (
    <>
      {toast && <Toast text={toast} onDone={() => setToast(null)} />}

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: '0.62rem', color: 'var(--fg3)', marginBottom: '0.25rem' }}>#{request.id.slice(0, 8).toUpperCase()}</div>
            <div style={{ fontSize: '1rem', fontWeight: 700 }}>{request.service_name}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', borderRadius: 3, border: `1px solid ${sc.border}`, background: sc.bg, fontFamily: mono, fontSize: '0.68rem', color: sc.color, fontWeight: 600 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.color, animation: request.status === 'in_progress' ? 'blink 1.5s infinite' : 'none', display: 'inline-block' }} />
              {request.status.replace('_', ' ')}
            </div>
            <button onClick={() => setChatOpen(o => !o)}
              style={{ position: 'relative', fontFamily: mono, fontSize: '0.65rem', padding: '0.35rem 0.85rem', borderRadius: 3, border: `1px solid ${unread > 0 ? 'var(--green)' : 'var(--border2)'}`, background: chatOpen ? 'var(--green)' : unread > 0 ? 'rgba(0,255,136,0.08)' : 'var(--bg3)', color: chatOpen ? '#080B0F' : unread > 0 ? 'var(--green)' : 'var(--fg2)', cursor: 'pointer', transition: 'all 0.2s' }}>
              {chatOpen ? '✕ close' : '💬 messages'}
              {unread > 0 && !chatOpen && (
                <span style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: 'var(--green)', color: '#080B0F', fontSize: '0.55rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>
              )}
            </button>
          </div>
        </div>

        {/* Progress stepper */}
        {request.status !== 'cancelled' && (
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: 14, left: 14, right: 14, height: 2, background: 'var(--border)', borderRadius: 2 }} />
              <div style={{ position: 'absolute', top: 14, left: 14, height: 2, borderRadius: 2, background: 'linear-gradient(90deg, var(--green), var(--cyan))', width: currentIdx === 0 ? 0 : `calc(${(currentIdx / (STATUS_STEPS.length - 1)) * 100}% - 28px)`, transition: 'width 0.5s ease' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                {STATUS_STEPS.map((step, i) => {
                  const done = i < currentIdx; const active = i === currentIdx;
                  return (
                    <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'var(--green)' : active ? 'var(--bg)' : 'var(--bg3)', border: `2px solid ${done || active ? 'var(--green)' : 'var(--border2)'}`, boxShadow: active ? '0 0 12px rgba(0,255,136,0.4)' : 'none', transition: 'all 0.3s', zIndex: 1, position: 'relative', marginBottom: '0.6rem' }}>
                        {done ? <span style={{ fontSize: '0.65rem', color: '#080B0F', fontWeight: 700 }}>✓</span>
                          : active ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'block', animation: 'blink 1.5s infinite' }} />
                            : <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--border2)', display: 'block' }} />}
                      </div>
                      <div style={{ fontFamily: mono, fontSize: '0.58rem', color: active ? 'var(--green)' : done ? 'var(--fg2)' : 'var(--fg3)', textAlign: 'center', lineHeight: 1.3, maxWidth: 70 }}>{step.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            {STATUS_STEPS[currentIdx] && (
              <div style={{ marginTop: '1.25rem', padding: '0.65rem 1rem', background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.12)', borderRadius: 3, fontFamily: mono, fontSize: '0.7rem', color: 'var(--fg2)' }}>
                <span style={{ color: 'var(--green)' }}>→ </span>{STATUS_STEPS[currentIdx].description}
              </div>
            )}
          </div>
        )}

        {/* Countdown */}
        {countdown && request.quoted_deadline && (
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(0,201,255,0.03)' }}>
            <div style={{ fontFamily: mono, fontSize: '0.6rem', color: 'var(--cyan)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>// delivery_countdown</div>
            {countdown.expired ? (
              <div style={{ fontFamily: mono, fontSize: '0.78rem', color: 'var(--amber)' }}>⚠ Deadline passed — follow up on progress</div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {([['days', countdown.days], ['hours', countdown.hours], ['mins', countdown.minutes], ['secs', countdown.seconds]] as const).map(([label, val]) => (
                  <div key={label} style={{ textAlign: 'center', minWidth: 52, padding: '0.6rem 0.75rem', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4 }}>
                    <div style={{ fontFamily: mono, fontSize: '1.4rem', fontWeight: 700, color: 'var(--cyan)', lineHeight: 1 }}>{String(val).padStart(2, '0')}</div>
                    <div style={{ fontFamily: mono, fontSize: '0.55rem', color: 'var(--fg3)', marginTop: '0.3rem', letterSpacing: '0.1em' }}>{label}</div>
                  </div>
                ))}
                <div style={{ fontFamily: mono, fontSize: '0.68rem', color: 'var(--fg3)' }}>
                  due {new Date(request.quoted_deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Details */}
        <div style={{ padding: '1rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 2rem', borderBottom: chatOpen ? '1px solid var(--border)' : 'none' }}>
          <Detail label="submitted" value={new Date(request.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} />
          <Detail label="budget" value={request.budget_range || '—'} />
          {request.quoted_price != null && <Detail label="quoted_price" value={`${request.quoted_currency || 'GHC'} ${request.quoted_price.toLocaleString()}`} color="var(--green)" />}
          {request.admin_notes && <div style={{ gridColumn: '1 / -1' }}><Detail label="note_from_enoch" value={request.admin_notes} color="var(--amber)" /></div>}
        </div>

        {/* Chat */}
        {chatOpen && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ maxHeight: 340, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {messages.length === 0 && (
                <div style={{ fontFamily: mono, fontSize: '0.68rem', color: 'var(--fg3)', textAlign: 'center', padding: '1.5rem 0' }}>
                  // no messages yet — send a question or progress update below
                </div>
              )}
              {messages.map(m => (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender_role === 'client' ? 'flex-end' : 'flex-start' }}>
                  {m.is_checkpoint ? (
                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.25rem 0' }}>
                      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.85rem', background: 'rgba(0,255,136,0.07)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 20, fontFamily: mono, fontSize: '0.65rem', color: 'var(--green)', whiteSpace: 'nowrap' }}>
                        🏁 {m.message}
                      </div>
                      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    </div>
                  ) : (
                    <div style={{ maxWidth: '75%' }}>
                      <div style={{ fontFamily: mono, fontSize: '0.58rem', color: 'var(--fg3)', marginBottom: '0.2rem', textAlign: m.sender_role === 'client' ? 'right' : 'left' }}>
                        {m.sender_role === 'admin' ? 'Enoch' : 'You'} · {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ padding: '0.6rem 0.9rem', borderRadius: m.sender_role === 'client' ? '8px 8px 2px 8px' : '8px 8px 8px 2px', background: m.sender_role === 'client' ? 'var(--green)' : 'var(--bg3)', color: m.sender_role === 'client' ? '#080B0F' : 'var(--fg)', fontFamily: mono, fontSize: '0.72rem', lineHeight: 1.6, border: m.sender_role === 'admin' ? '1px solid var(--border2)' : 'none', opacity: m.id.startsWith('opt-') ? 0.6 : 1 }}>
                        {m.message}
                        {m.id.startsWith('opt-') && <span style={{ marginLeft: '0.5rem', fontSize: '0.6rem' }}>⏳</span>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: '0.85rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', background: 'var(--bg3)' }}>
              <input value={msgText} onChange={e => setMsgText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="// ask a question or request a progress update..."
                style={{ flex: 1, background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 3, padding: '0.55rem 0.85rem', fontFamily: mono, fontSize: '0.72rem', color: 'var(--fg)', outline: 'none' }} />
              <button onClick={sendMessage} disabled={sending || !msgText.trim()} className="btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.7rem', minWidth: 72 }}>
                {sending ? <span style={{ animation: 'blink 1s infinite' }}>⏳</span> : 'send →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const Detail: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div>
    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: 'var(--fg3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{label}</div>
    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem', color: color || 'var(--fg)' }}>{value}</div>
  </div>
);

export default StatusTracker;