import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { validateLinkedListInvariants } from '../src/services/validationService';

type Fixture = { id?: string; graph: Parameters<typeof validateLinkedListInvariants>[0]; expectedValid?: boolean; expectedReview?: boolean; expectedValidationResult?: { valid: boolean } };
const fixtureDirectory = path.resolve(__dirname, '../../fixtures');
function findFixtures(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const resolved = path.join(directory, entry.name);
    return entry.isDirectory() ? findFixtures(resolved) : entry.name.endsWith('.json') ? [resolved] : [];
  });
}
const results: Array<{ fixture: string; latencyMs: number; valid: boolean; expectedValid?: boolean; review: boolean; recovered: boolean }> = [];
for (const filePath of findFixtures(fixtureDirectory)) {
  const file = path.relative(fixtureDirectory, filePath);
  const fixture = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Fixture;
  if (!fixture.graph?.nodes) continue;
  const start = performance.now();
  const output = validateLinkedListInvariants(fixture.graph);
  const latencyMs = performance.now() - start;
  const expectedValid = fixture.expectedValid ?? fixture.expectedValidationResult?.valid ?? !file.includes('malformed-cycle');
  const expectedReview = fixture.expectedReview ?? (file.includes('ambiguous-label') || file.includes('malformed-cycle'));
  results.push({ fixture: file, latencyMs, valid: output.isValid, expectedValid, review: output.needsHumanReview, recovered: expectedReview === output.needsHumanReview });
}
const labeled = results;
const precision = labeled.length ? labeled.filter((result) => result.valid === result.expectedValid).length / labeled.length : null;
const recovery = results.length ? results.filter((result) => result.recovered).length / results.length : 0;
const averageMs = results.length ? results.reduce((total, result) => total + result.latencyMs, 0) / results.length : 0;
const report = { fixtureCount: results.length, labeledPrecision: precision, recoveryRate: recovery, averageValidationLatencyMs: Number(averageMs.toFixed(3)), fixtures: results };
console.log(JSON.stringify(report, null, 2));
if (labeled.some((result) => result.valid !== result.expectedValid) || results.some((result) => !result.recovered)) process.exitCode = 1;
