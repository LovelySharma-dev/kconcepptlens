async function probe(name: string, url: string) {
  const res = await fetch(url, { headers: { Accept: 'image/avif,image/webp,image/png,*/*' }, redirect: 'follow' });
  const text = await res.text();
  console.log('---', name, res.status, res.headers.get('content-type'), text.slice(0, 300).replace(/\s+/g, ' '));
}

const dna =
  'https://res.cloudinary.com/demo/image/fetch/c_limit,w_800/f_auto/q_auto/https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/DNA_Structure%2BKey%2BLabelled.pn_NoBB.png/960px-DNA_Structure%2BKey%2BLabelled.pn_NoBB.png';
const neuron =
  'https://res.cloudinary.com/demo/image/fetch/c_limit,w_800/f_auto/q_auto/https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Complete_neuron_cell_diagram_en.svg/960px-Complete_neuron_cell_diagram_en.svg.png';
const dnaDirect =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/DNA_Structure%2BKey%2BLabelled.pn_NoBB.png/960px-DNA_Structure%2BKey%2BLabelled.pn_NoBB.png';
const neuronDirect =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Complete_neuron_cell_diagram_en.svg/960px-Complete_neuron_cell_diagram_en.svg.png';

async function main() {
  await probe('dna-single-encoded', dna);
  await probe('neuron-single-encoded', neuron);
  await probe('dna-wikimedia', dnaDirect);
  await probe('neuron-wikimedia', neuronDirect);
}

main();
