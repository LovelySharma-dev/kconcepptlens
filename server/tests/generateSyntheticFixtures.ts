import fs from 'node:fs';
import path from 'node:path';

const outputDirectory = path.resolve(__dirname, '../../fixtures/synthetic');
fs.mkdirSync(outputDirectory, { recursive: true });
const write = (name: string, title: string, graph: unknown, expectedValid: boolean, expectedReview = false) => {
  fs.writeFileSync(path.join(outputDirectory, `${name}.json`), JSON.stringify({ id: name, title, graph, expectedValid, expectedReview }, null, 2));
};
write('self-loop', 'Declared circular self-loop', { headId: 'n0', isCircular: true, structureType: 'circular', nodes: [{ id: 'n0', value: 1, next: 'n0', x: 80, y: 180 }] }, true);
write('dangling-pointer', 'Pointer to a missing node', { headId: 'n0', isCircular: false, nodes: [{ id: 'n0', value: 1, next: 'missing', x: 80, y: 180 }] }, false);
write('disconnected-subgraph', 'Reachable head with disconnected node', { headId: 'n0', isCircular: false, nodes: [{ id: 'n0', value: 1, next: null, x: 80, y: 180 }, { id: 'n1', value: 2, next: null, x: 260, y: 180 }, { id: 'n2', value: 3, next: 'n3', x: 440, y: 180 }, { id: 'n3', value: 4, next: null, x: 620, y: 180 }] }, true, true);
const chain = Array.from({ length: 24 }, (_, index) => ({ id: `n${index}`, value: index, next: index === 23 ? null : `n${index + 1}`, x: 80 + index * 180, y: 180 }));
write('long-chain-24', 'Twenty-four node chain', { headId: 'n0', isCircular: false, nodes: chain }, true);
