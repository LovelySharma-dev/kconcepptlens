import React, { useState } from 'react';
import { LinkedListGraph } from '@conceptlens/shared';
import { InteractiveCanvas } from './InteractiveCanvas';

interface PracticeSandboxProps { graph: LinkedListGraph; pyqId?: string; onAnnouncement?: (message: string) => void }

export const PracticeSandbox: React.FC<PracticeSandboxProps> = ({ graph: startingGraph, pyqId = 'practice_reverse', onAnnouncement }) => {
  const [graph, setGraph] = useState<LinkedListGraph>(() => structuredClone(startingGraph));
  const [operation, setOperation] = useState('reverseList');
  const [source, setSource] = useState<string | null>(null);
  const [hint, setHint] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newValue, setNewValue] = useState('9');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const selectNode = (id: string) => {
    if (!source) { setSource(id); setFeedback(`Selected ${id}. Select where its next pointer should point.`); return; }
    setGraph((previous) => {
      const oldTarget = previous.nodes.find((node) => node.id === source)?.next;
      return { ...previous, nodes: previous.nodes.map((node) => {
        if (node.id === source) return { ...node, next: id === 'null' ? null : id };
        if (previous.structureType === 'doubly' && node.id === oldTarget && node.prev === source) return { ...node, prev: null };
        if (previous.structureType === 'doubly' && node.id === id) return { ...node, prev: source };
        return node;
      }) };
    });
    setFeedback(`${source}.next updated to ${id === 'null' ? 'NULL' : id}.`);
    setSource(null);
  };
  const changeHead = (id: string) => setGraph((previous) => ({ ...previous, headId: id === 'null' ? null : id }));
  const addNode = () => {
    const id = `student_${Date.now()}`;
    const value: string | number = newValue.trim() && Number.isFinite(Number(newValue)) ? Number(newValue) : newValue || 'new';
    setGraph((previous) => ({ ...previous, nodes: [...previous.nodes, { id, value, next: null, ...(previous.structureType === 'doubly' ? { prev: null } : {}), x: 80 + (previous.nodes.length % 4) * 180, y: 275 + Math.floor(previous.nodes.length / 4) * 100, confidence: 1 }] }));
    setSource(id); setFeedback(`Added ${id}. Select its next target.`);
  };
  const removeSelected = () => {
    if (!selectedNode) return;
    setGraph((previous) => {
      const removed = previous.nodes.find((node) => node.id === selectedNode);
      if (!removed) return previous;
      const nodes = previous.nodes.filter((node) => node.id !== selectedNode).map((node) => node.next === selectedNode ? { ...node, next: removed.next } : node).map((node) => previous.structureType === 'doubly' && node.id === removed.next ? { ...node, prev: removed.prev ?? null } : node);
      return { ...previous, headId: previous.headId === selectedNode ? removed.next : previous.headId, nodes };
    });
    setFeedback(`Removed ${selectedNode} and reconnected its predecessor.`); setSelectedNode(null);
  };
  const reset = () => { setGraph(structuredClone(startingGraph)); setSource(null); setSelectedNode(null); setHint(0); setFeedback('Practice reset.'); };
  const submit = async () => {
    setLoading(true); setFeedback('Checking your pointer rewires…');
    try {
      const response = await fetch('/api/practice/attempts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pyqId, solutionOperation: operation, baseGraph: startingGraph, studentGraphSubmission: graph }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Could not save attempt.');
      setFeedback(body.data.feedback); onAnnouncement?.(body.data.feedback);
      const history = await fetch(`/api/practice/attempts?pyqId=${encodeURIComponent(pyqId)}`).then((r) => r.json());
      if (history.success) setAttempts(history.data);
    } catch (error) { setFeedback(error instanceof Error ? error.message : 'Could not save attempt.'); }
    finally { setLoading(false); }
  };
  return <section className="glass-panel" style={{ marginTop: '1rem' }} aria-labelledby="practice-title">
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
      <div><h2 id="practice-title">Student Practice Mode</h2><p style={{ color: 'var(--text-secondary)' }}>Choose a node, then choose its new next target. Use NULL to end a chain.</p></div>
      <label>Challenge <select value={operation} onChange={(event) => { setOperation(event.target.value); setFeedback(''); }}><option value="reverseList">Reverse this list</option><option value="insertHead">Insert 9 at the head</option><option value="insertTail">Insert 9 at the tail</option><option value="deleteNode">Delete the middle node</option></select></label>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(220px,1fr)', gap: '1rem', marginTop: '.75rem' }}>
      <div><InteractiveCanvas graph={graph} activePointers={{ head: graph.headId }} highlightedNodeIds={source ? [source] : []} onSelectNode={(node) => selectNode(node.id)} />
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '.75rem' }}>
          <strong style={{ alignSelf: 'center' }}>Rewire:</strong>{graph.nodes.map((node) => <button key={node.id} className="btn-secondary" type="button" onClick={() => selectNode(node.id)} aria-pressed={source === node.id}>{node.id}.next</button>)}
          {source && <><span style={{ alignSelf: 'center' }}>→</span>{graph.nodes.map(({ id }) => <button key={`target-${id}`} className="btn-secondary" type="button" onClick={() => selectNode(id)}> {id} </button>)}<button className="btn-secondary" type="button" onClick={() => selectNode('null')}>NULL</button></>}
          <label style={{ marginLeft: 'auto' }}>Head <select value={graph.headId || 'null'} onChange={(event) => changeHead(event.target.value)}>{graph.nodes.map((node) => <option key={node.id} value={node.id}>{node.id}</option>)}<option value="null">NULL</option></select></label>
          <label>New node value <input value={newValue} onChange={(event) => setNewValue(event.target.value)} style={{ width: 70 }} /></label><button className="btn-secondary" type="button" onClick={addNode}>Add node</button>
          <label>Remove node <select value={selectedNode || ''} onChange={(event) => setSelectedNode(event.target.value || null)}><option value="">Choose node</option>{graph.nodes.map((node) => <option key={node.id} value={node.id}>{node.id} ({node.value})</option>)}</select></label><button className="btn-secondary" type="button" disabled={!selectedNode} onClick={removeSelected}>Remove selected</button>
        </div>
      </div>
      <aside style={{ background: 'rgba(2,6,23,.55)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
        <h3>Progressive hints</h3>
        {hint >= 1 && <p>Concept: {operation === 'reverseList' ? 'Each node must point to its predecessor, and head moves to the old tail.' : operation === 'insertHead' ? 'Connect the new node to the old head before changing head.' : 'The previous node should skip over the node being removed.'}</p>}
        {hint >= 2 && <pre style={{ whiteSpace: 'pre-wrap', color: 'var(--accent-cyan)' }}>{operation === 'reverseList' ? 'prev = NULL; current = head\nwhile current: save next; current.next = prev; advance' : operation === 'insertHead' ? 'newNode.next = head\nhead = newNode' : 'prev.next = target.next'}</pre>}
        {hint >= 3 && <p>Step-by-step reveal: {operation === 'reverseList' ? 'Start with prev = NULL and current = head. Save current.next, point current.next to prev, move prev to current, and move current to the saved next. Repeat until current is NULL, then set head = prev.' : operation === 'insertHead' ? 'Create the node. Set newNode.next = old head. Set head = newNode.' : operation === 'insertTail' ? 'Find the node whose next is NULL. Set its next to the new node; leave newNode.next as NULL.' : 'Find the node with the target value. Set its predecessor next pointer to target.next, then remove the target node.'}</p>}
        <button className="btn-secondary" type="button" disabled={hint >= 3} onClick={() => setHint((value) => Math.min(3, value + 1))}>Show next hint ({hint}/3)</button>
        <p role="status" style={{ minHeight: 48, marginTop: '.75rem' }}>{feedback}</p>
        <div style={{ display: 'flex', gap: '.5rem' }}><button className="btn-primary" type="button" disabled={loading} onClick={() => void submit()}>{loading ? 'Checking…' : 'Check & save attempt'}</button><button className="btn-secondary" type="button" onClick={reset}>Reset</button></div>
        <details style={{ marginTop: '.75rem' }}><summary>Attempt history ({attempts.length})</summary>{attempts.map((attempt) => <p key={attempt.id}>{new Date(attempt.timestamp).toLocaleString()} — {attempt.isCorrect ? 'Correct' : 'Try again'}</p>)}</details>
      </aside>
    </div>
  </section>;
};
