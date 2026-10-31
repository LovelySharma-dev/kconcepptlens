import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LinkedListGraph } from '@conceptlens/shared';
import { InteractiveCanvas } from './InteractiveCanvas';

type LessonId = 'concept' | 'insert-head' | 'cycle';
type Cue = { start: number; end: number; text: string };
const lessons: Record<LessonId, { title: string; video: string; vtt: string }> = {
  concept: { title: 'Linked List Concept', video: '/media/isl/linked-list-concept.mp4', vtt: '/media/isl/linked-list-concept.vtt' },
  'insert-head': { title: 'Insertion at Head', video: '/media/isl/insertion-at-head.mp4', vtt: '/media/isl/insertion-at-head.vtt' },
  cycle: { title: 'Cycle Detection', video: '/media/isl/cycle-detection.mp4', vtt: '/media/isl/cycle-detection.vtt' }
};
function parseVtt(source: string): Cue[] {
  return source.replace(/^WEBVTT[^\n]*\n/, '').split(/\n\s*\n/).map((block) => {
    const lines = block.trim().split('\n'); const timing = lines.find((line) => line.includes('-->'));
    if (!timing) return null;
    const [from, to] = timing.split('-->').map((part) => part.trim().split(' ')[0]);
    const seconds = (value: string) => { const pieces = value.split(':').map(Number); return pieces.reduce((total, piece) => total * 60 + piece, 0); };
    return { start: seconds(from), end: seconds(to), text: lines.slice(lines.indexOf(timing) + 1).join(' ').replace(/<[^>]*>/g, '') };
  }).filter((cue): cue is Cue => Boolean(cue));
}

interface Props { graph: LinkedListGraph }
export const ISLPlayer: React.FC<Props> = ({ graph }) => {
  const [lesson, setLesson] = useState<LessonId>('concept');
  const [cues, setCues] = useState<Cue[]>([]);
  const [query, setQuery] = useState('');
  const [time, setTime] = useState(0);
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeCue = cues.find((cue) => time >= cue.start && time < cue.end);
  const filtered = useMemo(() => cues.map((cue, index) => ({ ...cue, index })).filter((cue) => cue.text.toLowerCase().includes(query.toLowerCase())), [cues, query]);
  const highlighted = useMemo(() => {
    if (!activeCue) return [];
    const text = activeCue.text.toLowerCase();
    const node = graph.nodes.find((candidate) => text.includes(String(candidate.value).toLowerCase())) || graph.nodes.find((candidate) => candidate.id === graph.headId);
    return node ? [node.id] : [];
  }, [activeCue, graph]);

  useEffect(() => { fetch(lessons[lesson].vtt).then((response) => { if (!response.ok) throw new Error('Transcript unavailable'); return response.text(); }).then((text) => setCues(parseVtt(text))).catch(() => setCues([])); setTime(0); setVideoUnavailable(false); if (videoRef.current) videoRef.current.currentTime = 0; }, [lesson]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => { if (event.key === '?' && !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName || '')) { event.preventDefault(); setHelpOpen((open) => !open); } else if (event.key === 'Escape') setHelpOpen(false); };
    window.addEventListener('keydown', keydown); return () => window.removeEventListener('keydown', keydown);
  }, []);
  useEffect(() => {
    document.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeCue?.start]);
  const seek = (cue: Cue) => { if (videoRef.current) { videoRef.current.currentTime = cue.start; void videoRef.current.play().catch(() => undefined); } setTime(cue.start); };

  return <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.35fr) minmax(300px,1fr)', gap: '1rem' }}>
    <section className="glass-panel"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}><div><h2>ISL lesson player</h2><p style={{ color: 'var(--text-secondary)' }}>Choose a lesson; captions and transcript seek together.</p></div><label>Lesson <select value={lesson} onChange={(event) => setLesson(event.target.value as LessonId)}>{Object.entries(lessons).map(([id, item]) => <option key={id} value={id}>{item.title}</option>)}</select></label></div>
      <video ref={videoRef} controls playsInline preload="metadata" onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)} onError={() => setVideoUnavailable(true)} onLoadedMetadata={(event) => { setVideoUnavailable(false); const tracks = event.currentTarget.textTracks; if (tracks[0]) tracks[0].mode = 'showing'; }} style={{ width: '100%', maxHeight: 380, background: '#020617', marginTop: '.75rem' }}><source src={lessons[lesson].video} type="video/mp4" /><track kind="captions" src={lessons[lesson].vtt} srcLang="en" label="English captions" default />Your browser does not support video.</video>
      <p role="status" style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>{videoUnavailable ? `Reviewed ISL video not installed for this lesson. Add ${lessons[lesson].video} from an approved lesson pack.` : activeCue ? `At ${Math.floor(activeCue.start)}s: ${activeCue.text}` : 'Choose a cue below to seek the lesson video.'}</p>
      <div style={{ marginTop: '.75rem' }}><h3 style={{ fontSize: '.9rem' }}>Caption synchronized diagram</h3><InteractiveCanvas graph={graph} activePointers={{ head: graph.headId }} highlightedNodeIds={highlighted} /></div>
      <p style={{ fontSize: '.8rem', color: 'var(--text-secondary)' }}>Keyboard: press ? for the shortcut guide. Only locally provided, reviewed ISL clips should be placed in the lesson media paths.</p>
    </section>
    <section className="glass-panel"><label style={{ display: 'block', marginBottom: '.75rem' }}>Search transcript <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="head, pointer, cycle…" /></label><div style={{ maxHeight: '65vh', overflowY: 'auto', display: 'grid', gap: '.5rem' }} aria-label="Searchable transcript">{filtered.map((cue) => <button key={`${cue.start}-${cue.index}`} type="button" onClick={() => seek(cue)} aria-current={activeCue?.start === cue.start ? 'true' : undefined} style={{ display: 'flex', gap: '.75rem', textAlign: 'left', padding: '.65rem', borderRadius: 'var(--radius-sm)', color: 'inherit', background: activeCue?.start === cue.start ? 'rgba(56,189,248,.16)' : 'rgba(255,255,255,.03)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}><time style={{ color: 'var(--accent-cyan)', minWidth: 45 }}>{Math.floor(cue.start / 60).toString().padStart(2, '0')}:{Math.floor(cue.start % 60).toString().padStart(2, '0')}</time><span>{cue.text}</span></button>)}</div>{!filtered.length && <p role="status">{cues.length ? 'No matching caption.' : 'Transcript is loading or unavailable.'}</p>}</section>
    {helpOpen && <div role="dialog" aria-modal="true" aria-labelledby="keyboard-guide" className="glass-panel" style={{ position: 'fixed', zIndex: 20, inset: '20% 25%', boxShadow: '0 0 0 100vmax rgba(0,0,0,.7)' }}><button type="button" onClick={() => setHelpOpen(false)} style={{ float: 'right' }} aria-label="Close keyboard guide">Close</button><h2 id="keyboard-guide">Keyboard guide</h2><ul><li>Tab moves between lesson, video controls, and transcript captions.</li><li>Enter or Space on a caption seeks the video to that time.</li><li>Press ? to open or close this guide; Escape closes it.</li><li>Use the video controls for pause, play, and seeking.</li></ul></div>}
  </div>;
};
