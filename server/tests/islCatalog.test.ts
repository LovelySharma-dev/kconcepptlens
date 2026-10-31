import assert from 'assert';
import { ISLCatalogEntrySchema } from '@conceptlens/shared';
import {
  AUTHENTIC_ISL_CURRICULUM_CATALOG,
  filterISLCatalog,
  getISLCatalogEntryById
} from '../../client/src/data/islLessons';

async function runISLCatalogTestSuite() {
  console.log('🧪 Starting Authentic ISL Curriculum Catalog Test Suite...\n');
  let passed = 0;
  let total = 0;

  async function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      await fn();
      passed++;
      console.log(`  ✅ PASS: ${name}`);
    } catch (err: unknown) {
      console.error(`  ❌ FAIL: ${name}`);
      const msg = err instanceof Error ? (err.stack || err.message) : String(err);
      console.error(msg);
      process.exitCode = 1;
    }
  }

  // 1. DATA VALIDATION
  await test('Every catalog entry conforms strictly to ISLCatalogEntrySchema', () => {
    assert(AUTHENTIC_ISL_CURRICULUM_CATALOG.length >= 5, 'Catalog must contain curriculum entries');
    for (const entry of AUTHENTIC_ISL_CURRICULUM_CATALOG) {
      const parsed = ISLCatalogEntrySchema.parse(entry);
      assert.strictEqual(parsed.lessonId, entry.lessonId);
      assert(parsed.concept.length > 0);
      assert(parsed.title.length > 0);
      assert(parsed.learningObjectives.length > 0);
    }
  });

  // 2. PROVENANCE & ATTRIBUTION INVARIANTS
  await test('Every entry possesses authentic source organization, attribution, and license', () => {
    for (const entry of AUTHENTIC_ISL_CURRICULUM_CATALOG) {
      assert(entry.sourceOrganization.length > 3, `Source organization must be present for ${entry.lessonId}`);
      assert(entry.attribution.length > 10, `Attribution statement must be detailed for ${entry.lessonId}`);
      assert(entry.license.length > 5, `License statement must be specified for ${entry.lessonId}`);
      assert(entry.limitationsNote.length > 10, `Limitations note must be documented for ${entry.lessonId}`);
    }
  });

  // 3. HONEST AVAILABILITY & NO UNAUTHORIZED HOSTING
  await test('Catalog strictly distinguishes official external, pending, and unavailable states', () => {
    const states = new Set(AUTHENTIC_ISL_CURRICULUM_CATALOG.map((e) => e.availabilityState));
    assert(states.has('official_external'), 'Must have official external resources');
    assert(states.has('pending_review'), 'Must have pending review resources');
    assert(states.has('unavailable'), 'Must have unavailable resources honestly marked');

    for (const entry of AUTHENTIC_ISL_CURRICULUM_CATALOG) {
      if (entry.availabilityState === 'official_external') {
        assert(entry.externalUrl?.startsWith('https://islrtc.nic.in/'), `Official external entry ${entry.lessonId} must point to ISLRTC portal`);
      }
      if (entry.availabilityState === 'unavailable') {
        assert(!entry.mediaUrl, `Unavailable entry ${entry.lessonId} must not have playable mediaUrl`);
        assert(entry.limitationsNote.toLowerCase().includes('development') || entry.limitationsNote.toLowerCase().includes('not yet'),
          `Unavailable entry ${entry.lessonId} must state it is in development`);
      }
    }
  });

  // 4. CATEGORY FILTERING
  await test('filterISLCatalog filters by subject category correctly', () => {
    const bioEntries = filterISLCatalog({ category: 'biology' });
    assert(bioEntries.length >= 2, 'Should find biology entries');
    assert(bioEntries.every((e) => e.category === 'biology'));

    const csEntries = filterISLCatalog({ category: 'computer_science' });
    assert(csEntries.length >= 2, 'Should find CS entries');
    assert(csEntries.every((e) => e.category === 'computer_science'));

    const physicsEntries = filterISLCatalog({ category: 'physics' });
    assert(physicsEntries.length >= 1, 'Should find physics entries');
    assert(physicsEntries.every((e) => e.category === 'physics'));

    const mathEntries = filterISLCatalog({ category: 'mathematics' });
    assert(mathEntries.length >= 1, 'Should find math entries');
    assert(mathEntries.every((e) => e.category === 'mathematics'));
  });

  // 5. AVAILABILITY FILTERING
  await test('filterISLCatalog filters by availability state', () => {
    const official = filterISLCatalog({ availability: 'official_external' });
    assert(official.length > 0);
    assert(official.every((e) => e.availabilityState === 'official_external'));

    const pending = filterISLCatalog({ availability: 'pending_review' });
    assert(pending.length > 0);
    assert(pending.every((e) => e.availabilityState === 'pending_review'));

    const unavailable = filterISLCatalog({ availability: 'unavailable' });
    assert(unavailable.length > 0);
    assert(unavailable.every((e) => e.availabilityState === 'unavailable'));
  });

  // 6. SEARCH FILTERING
  await test('filterISLCatalog filters by search keywords across concept, title, and objectives', () => {
    const cellResults = filterISLCatalog({ searchQuery: 'animal cell' });
    assert(cellResults.length >= 1);
    assert.strictEqual(cellResults[0].lessonId, 'isl_animal_cell');

    const logicResults = filterISLCatalog({ searchQuery: 'logic' });
    assert(logicResults.length >= 1);
    assert.strictEqual(logicResults[0].lessonId, 'isl_binary_data');

    const emptyResults = filterISLCatalog({ searchQuery: 'xyznonexistentkeyword99' });
    assert.strictEqual(emptyResults.length, 0);
  });

  // 7. LOOKUP BY ID
  await test('getISLCatalogEntryById retrieves individual lesson by id and returns undefined for unknown', () => {
    const animalCell = getISLCatalogEntryById('isl_animal_cell');
    assert(animalCell !== undefined);
    assert.strictEqual(animalCell?.concept, 'Animal Cell and Organelles');

    const unknown = getISLCatalogEntryById('unknown_nonexistent_lesson');
    assert.strictEqual(unknown, undefined);
  });

  console.log(`\n========================================`);
  console.log(`🏁 ISL CATALOG RESULTS: ${passed}/${total} PASSED`);
  console.log(`========================================\n`);

  if (passed < total) {
    process.exit(1);
  }
}

runISLCatalogTestSuite().catch((err) => {
  console.error(err);
  process.exit(1);
});
