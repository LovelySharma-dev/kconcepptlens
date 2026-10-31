import React, { useEffect, useState } from 'react';
import { PYQ } from '@conceptlens/shared';
import { PlayCircle, Search } from 'lucide-react';

interface PYQDrawerProps { onLoadPYQ: (pyq: PYQ) => void }

export const PYQDrawer: React.FC<PYQDrawerProps> = ({ onLoadPYQ }) => {
  const [items, setItems] = useState<PYQ[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [board, setBoard] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Loading question bank…');
  const selected = items.find((item) => item.id === selectedId) || items[0];

  useEffect(() => {
    const query = new URLSearchParams();
    if (board !== 'all') query.set('board', board);
    if (difficulty !== 'all') query.set('difficulty', difficulty);
    if (search.trim()) query.set('search', search.trim());
    const controller = new AbortController();
    setStatus('Loading question bank…');
    fetch(`/api/pyqs?${query.toString()}`, { signal: controller.signal })
      .then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Could not load the question bank.'); return result.data as PYQ[]; })
      .then((results) => { setItems(results); setSelectedId((current) => results.some((item) => item.id === current) ? current : results[0]?.id || ''); setStatus(results.length ? '' : 'No questions match those filters.'); })
      .catch((error) => { if (error.name !== 'AbortError') setStatus(error.message); });
    return () => controller.abort();
  }, [board, difficulty, search]);

  return <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px,1fr) minmax(360px,1.6fr)', gap: '1.5rem' }}>
    <section className="glass-panel" aria-label="Question bank filters and results">
      <h2 style={{ fontSize: '1.15rem', marginBottom: '.75rem' }}>Previous Year Questions</h2>
      <label style={{ display: 'flex', gap: '.5rem', marginBottom: '.6rem' }}><Search size={18} /><input aria-label="Search question bank" placeholder="Search questions and concepts" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem' }}>
        <select aria-label="Filter board" value={board} onChange={(event) => setBoard(event.target.value)}><option value="all">All boards</option><option value="ISC">ISC</option><option value="CBSE">CBSE</option><option value="Anna University">Anna University</option></select>
        <select aria-label="Filter difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="all">All difficulty</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
      </div>
      {status && <p role={items.length ? 'status' : 'alert'}>{status}</p>}
      <div style={{ display: 'grid', gap: '.65rem' }}>{items.map((pyq) => <button key={pyq.id} type="button" onClick={() => setSelectedId(pyq.id)} aria-pressed={selected?.id === pyq.id} style={{ textAlign: 'left', padding: '.85rem', background: selected?.id === pyq.id ? 'rgba(56,189,248,.12)' : 'rgba(255,255,255,.03)', border: `1px solid ${selected?.id === pyq.id ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`, borderRadius: 'var(--radius-md)', color: 'inherit', cursor: 'pointer' }}>
        <span style={{ fontSize: '.72rem', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>{pyq.exam.boardOrUniversity} · {pyq.exam.year} · {pyq.difficulty}</span><h3 style={{ fontSize: '.95rem', margin: '.25rem 0' }}>{pyq.title}</h3><span style={{ color: 'var(--text-secondary)', fontSize: '.8rem' }}>{pyq.conceptTag}</span>
      </button>)}</div>
    </section>
    {selected ? <section className="glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'start' }}><div><span style={{ color: 'var(--accent-cyan)', fontSize: '.8rem' }}>{selected.exam.boardOrUniversity} · {selected.exam.year} · Q{selected.exam.questionNumber}</span><h2 style={{ fontSize: '1.2rem', margin: '.25rem 0 1rem' }}>{selected.title}</h2></div><button className="btn-primary" onClick={() => onLoadPYQ(selected)} type="button"><PlayCircle size={18} /> Send to Sandbox</button></div>
      <p style={{ lineHeight: 1.65, padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(2,6,23,.6)' }}>{selected.problemStatement}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(200px,.8fr)', gap: '1rem' }}>
        <div><h3 style={{ fontSize: '.85rem' }}>Original paper source</h3><a href={selected.exam.sourcePaperUrl} target="_blank" rel="noreferrer">Open official {selected.exam.subjectName} paper · {selected.exam.subjectCode}</a><p style={{ fontSize: '.78rem', color: 'var(--text-secondary)' }}>Question crop coordinates: x {selected.exam.cropBoundingBox.x}, y {selected.exam.cropBoundingBox.y}, {selected.exam.cropBoundingBox.width} × {selected.exam.cropBoundingBox.height}</p><iframe src={`${selected.exam.sourcePaperUrl}#page=1`} title={`Source paper for ${selected.title}`} style={{ width: '100%', height: 240, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }} /></div>
        <div><h3 style={{ fontSize: '.85rem' }}>Marking scheme points</h3><ul style={{ paddingLeft: '1.2rem', lineHeight: 1.6 }}>{selected.markingSchemeKeyPoints.map((point, index) => <li key={index}>{point}</li>)}</ul><p style={{ fontSize: '.78rem', color: 'var(--text-secondary)' }}>{selected.exam.marks} marks · {selected.conceptTag}</p></div>
      </div>
    </section> : <section className="glass-panel" role="status">Choose filters or wait for questions to load.</section>}
  </div>;
};
