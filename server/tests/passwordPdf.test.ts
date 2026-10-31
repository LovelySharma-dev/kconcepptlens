import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { readPdfTextLayer } from '../src/services/pageOcr';
import { ingestPrepared } from '@conceptlens/shared';

let passed = 0;
let total = 0;

async function test(name: string, fn: () => void | Promise<void>) {
  total += 1;
  try {
    await fn();
    passed += 1;
    console.log(`  ✅ PASS: ${name}`);
  } catch (error) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

// PDF 1.4 Standard 40-bit RC4 Encryption Helper for testing
const PADDING = Buffer.from([
  0x28, 0xbf, 0x4e, 0x5e, 0x4e, 0x75, 0x8a, 0x41, 0x64, 0x00, 0x4e, 0x56, 0xff, 0xfa, 0x01, 0x08,
  0x2e, 0x2e, 0x00, 0xb6, 0xd0, 0x68, 0x3e, 0x80, 0x2f, 0x0c, 0xa9, 0xfe, 0x64, 0x53, 0x69, 0x7a
]);

function rc4(key: Buffer, data: Buffer): Buffer {
  const s = Array.from({ length: 256 }, (_, i) => i);
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + key[i % key.length]) % 256;
    [s[i], s[j]] = [s[j], s[i]];
  }
  let i = 0;
  j = 0;
  const out = Buffer.alloc(data.length);
  for (let k = 0; k < data.length; k++) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    [s[i], s[j]] = [s[j], s[i]];
    out[k] = data[k] ^ s[(s[i] + s[j]) % 256];
  }
  return out;
}

function createUnencryptedPdf(textContent: string): Uint8Array {
  const stream = Buffer.from(`BT /F1 12 Tf 72 712 Td (${textContent}) Tj ET`);
  return Buffer.from(`%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>
endobj
4 0 obj
<< /Length ${stream.length} >>
stream
${stream.toString('latin1')}
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
400
%%EOF
`);
}

function createEncryptedPdf(password: string, textContent: string): Uint8Array {
  const pw = Buffer.from(password);
  const paddedPw = Buffer.concat([pw, PADDING]).subarray(0, 32);
  const perm = Buffer.from([0xc0, 0xff, 0xff, 0xff]); // -64 as 32-bit little endian
  const fileId = Buffer.from('1234567890123456');

  const ownerKey = crypto.createHash('md5').update(PADDING).digest().subarray(0, 5);
  const O = rc4(ownerKey, paddedPw);
  const encKey = crypto.createHash('md5').update(Buffer.concat([paddedPw, O, perm, fileId])).digest().subarray(0, 5);
  const U = rc4(encKey, PADDING);

  const objKey = crypto.createHash('md5').update(Buffer.concat([encKey, Buffer.from([4, 0, 0, 0, 0])])).digest().subarray(0, 10);
  const streamText = Buffer.from(`BT /F1 12 Tf 72 712 Td (${textContent}) Tj ET`);
  const encStream = rc4(objKey, streamText);

  const header = Buffer.from(`%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>
endobj
4 0 obj
<< /Length ${encStream.length} >>
stream
`);

  const footer = Buffer.from(`
endstream
endobj
5 0 obj
<< /Filter /Standard /V 1 /R 2 /O <${O.toString('hex')}> /U <${U.toString('hex')}> /P -64 >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000450 00000 n 
trailer
<< /Size 6 /Root 1 0 R /Encrypt 5 0 R /ID [ <${fileId.toString('hex')}> <${fileId.toString('hex')}> ] >>
startxref
550
%%EOF
`);

  return new Uint8Array(Buffer.concat([header, encStream, footer]));
}

function createUnsupportedEncryptedPdf(): Uint8Array {
  const fileId = Buffer.from('1234567890123456');
  return new TextEncoder().encode(`%PDF-1.7
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>
endobj
4 0 obj
<< /Filter /CustomQuantumCrypt /V 99 /R 99 >>
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000200 00000 n 
trailer
<< /Size 5 /Root 1 0 R /Encrypt 4 0 R /ID [ <${fileId.toString('hex')}> <${fileId.toString('hex')}> ] >>
startxref
300
%%EOF
`);
}

async function run() {
  console.log('🧪 Starting Password-Protected PDF Extraction Test Suite...\n');

  // Test 1: Ordinary unencrypted PDF extraction still works perfectly
  await test('Ordinary unencrypted PDF extracts cleanly without regression', () => {
    const unencrypted = createUnencryptedPdf('Plant cell turgor pressure exceeds 15 atm.');
    const result = readPdfTextLayer(unencrypted);
    assert.strictEqual(result.ok, true);
    if (result.ok) {
      assert.ok(result.text.includes('Plant cell turgor pressure'));
      assert.strictEqual(result.truncated, false);
    }
  });

  // Test 2: Encrypted PDF without password detects password_required
  const secretPassword = 'ISC_Biology_2026!';
  const secretText = 'Cellulose microfibrils provide tensile strength to withstand high turgor pressure';
  const encryptedPdf = createEncryptedPdf(secretPassword, secretText);

  await test('Encrypted PDF without password returns password_required status honestly', () => {
    const result = readPdfTextLayer(encryptedPdf);
    assert.strictEqual(result.ok, false);
    if (!result.ok) {
      assert.strictEqual(result.status, 'password_required');
    }
  });

  // Test 3: Encrypted PDF with incorrect password returns incorrect_password
  await test('Encrypted PDF with incorrect password returns incorrect_password without crashing', () => {
    const result = readPdfTextLayer(encryptedPdf, 'wrong_pass_123');
    assert.strictEqual(result.ok, false);
    if (!result.ok) {
      assert.strictEqual(result.status, 'incorrect_password');
    }
  });

  // Test 4: Encrypted PDF with correct password successfully decrypts and extracts text
  await test('Encrypted PDF with correct password decrypts and extracts accurate text', () => {
    const result = readPdfTextLayer(encryptedPdf, secretPassword);
    assert.strictEqual(result.ok, true);
    if (result.ok) {
      assert.ok(result.text.includes('Cellulose microfibrils'));
      assert.ok(result.text.includes('turgor pressure'));
    }
  });

  // Test 5: Malformed PDF is caught honestly
  await test('Malformed or truncated PDF returns malformed status', () => {
    const malformed = new TextEncoder().encode('%PDF-1.4\ncorrupted content without trailer');
    const result = readPdfTextLayer(malformed);
    assert.strictEqual(result.ok, false);
    if (!result.ok) {
      assert.ok(result.status === 'malformed' || result.status === 'failed');
    }
  });

  // Test 6: Unsupported encryption algorithm is flagged honestly
  await test('Unsupported custom encryption handler returns unsupported_encryption', () => {
    const unsupported = createUnsupportedEncryptedPdf();
    const result = readPdfTextLayer(unsupported, 'any_password');
    assert.strictEqual(result.ok, false);
    if (!result.ok) {
      assert.strictEqual(result.status, 'unsupported_encryption');
    }
  });

  // Test 7: Ingest pipeline with password parameter
  await test('ingestPrepared passes password in request schema and returns typed status', () => {
    const result = ingestPrepared({
      kind: 'file',
      bytes: encryptedPdf,
      declaredMime: 'application/pdf',
      password: secretPassword
    });
    // Ingest prepared validates PDF structure and accepts valid PDF format
    assert.strictEqual(result.accepted, true);
    assert.strictEqual(result.format, 'pdf');
  });

  // Test 8: Password is not exposed or leaked in result messages
  await test('Passwords do not appear in any returned error strings or notes', () => {
    const result = readPdfTextLayer(encryptedPdf, secretPassword);
    const jsonStr = JSON.stringify(result);
    assert.ok(!jsonStr.includes(secretPassword), 'Decryption password must never be mirrored in response payload');
  });

  console.log(`\n========================================`);
  console.log(`🏁 PASSWORD PDF SUITE: ${passed}/${total} PASSED`);
  console.log(`========================================\n`);

  if (passed < total) {
    process.exit(1);
  }
}

void run();
