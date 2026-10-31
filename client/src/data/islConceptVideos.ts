/**
 * Authentic Indian Sign Language (ISL) Video & Dictionary Resource Catalog
 * Source: Indian Sign Language Research and Training Centre (ISLRTC),
 * Department of Empowerment of Persons with Disabilities, MoSJE, Government of India
 * Official Portal: https://islrtc.nic.in/
 */

export type ISLSubjectCategory = 'science' | 'mathematics';
export type ISLStandard = 'Class VI' | 'Class VII' | 'Class VIII';

export interface ISLConceptVideo {
  id: string;
  youtubeId: string;
  title: string;
  subject: ISLSubjectCategory;
  standard: ISLStandard;
  chapter: string;
  keywords: string[];
}

export interface ISLDictionaryLink {
  srNo: number;
  label: string;
  folderUrl: string;
}

export const ISL_MASTER_DRIVE_FOLDER = 'https://drive.google.com/drive/folders/1A1T72ZbXaNJAKBZmwJtU0nQpIZAIYdeC';

export const ISL_DICTIONARY_FOLDERS: ISLDictionaryLink[] = [
  { srNo: 1, label: 'All Dictionary Videos', folderUrl: 'https://drive.google.com/drive/folders/1U-Pr4r1-cupgNOOq9NH_uTsQnPSVEKco' },
  { srNo: 2, label: 'Letter A', folderUrl: 'https://drive.google.com/drive/folders/1nkI7lddegUWDvmGsmn68QkB5ikp5_3kt?usp=drive_link' },
  { srNo: 3, label: 'Letter B', folderUrl: 'https://drive.google.com/drive/folders/1S-G5qoWth0aI9fLzKs8Myv2LyMrq8jUh?usp=drive_link' },
  { srNo: 4, label: 'Letter C', folderUrl: 'https://drive.google.com/drive/folders/1iZvUpDh5gtzoRmQKWAVfCOe8iWEjzS2S?usp=drive_link' },
  { srNo: 5, label: 'Letter D', folderUrl: 'https://drive.google.com/drive/folders/1aQywSGpfHXOdM1pfs2rfqU3Y_ScLXRjh?usp=drive_link' },
  { srNo: 6, label: 'Letter E', folderUrl: 'https://drive.google.com/drive/folders/13pJC91P8ligEXJh7ZcVbdOdBv8OM7ugw?usp=drive_link' },
  { srNo: 7, label: 'Letter F', folderUrl: 'https://drive.google.com/drive/folders/1uwjIG-hYqxYTURtWMEpmCc9NzV13uz-S?usp=drive_link' },
  { srNo: 8, label: 'Letter G', folderUrl: 'https://drive.google.com/drive/folders/1_jxELuDPMQb67NM6woqcdcn5QWd2mVeC?usp=drive_link' },
  { srNo: 9, label: 'Letter H', folderUrl: 'https://drive.google.com/drive/folders/1BL9C7zyFAcRQg-DsM-CiIjsoFMbSvTCt?usp=drive_link' },
  { srNo: 10, label: 'Letter I', folderUrl: 'https://drive.google.com/drive/folders/1K6eUYZLdCRh21Ecxx9wcsAJ3HP7jd4CI?usp=drive_link' },
  { srNo: 11, label: 'Letter J', folderUrl: 'https://drive.google.com/drive/folders/198cCQXlwdAwmxabGVvXMZKQ-lnDclO37?usp=drive_link' },
  { srNo: 12, label: 'Letter K', folderUrl: 'https://drive.google.com/drive/folders/1rXKlSTKyWJNqDL6-lupJuufMUZW7Zunc?usp=drive_link' },
  { srNo: 13, label: 'Letter L', folderUrl: 'https://drive.google.com/drive/folders/1MbKLv9fBdLUPE4-PrSbSGBCnudtuKRTg?usp=drive_link' },
  { srNo: 14, label: 'Letter M', folderUrl: 'https://drive.google.com/drive/folders/1qDHOYx4Eijrgo3cZHucMIlPRKgcK__8Z?usp=drive_link' },
  { srNo: 15, label: 'Letter N', folderUrl: 'https://drive.google.com/drive/folders/1UUeBYdHraz86n9wgJG2HR4-gfMuO6o8e?usp=drive_link' },
  { srNo: 16, label: 'Letter O', folderUrl: 'https://drive.google.com/drive/folders/1FZVV2snPZAR9_Zcy-XEo15cKgcVbMiUM?usp=drive_link' },
  { srNo: 17, label: 'Letter P', folderUrl: 'https://drive.google.com/drive/folders/1hR6GnLjEj8_I5UPDJg3ZE0oQDzCnzXFy?usp=drive_link' },
  { srNo: 18, label: 'Letter Q', folderUrl: 'https://drive.google.com/drive/folders/1Q6BYTJRyUElN6XCKrU9RXW2YzHGICPUA?usp=drive_link' },
  { srNo: 19, label: 'Letter R', folderUrl: 'https://drive.google.com/drive/folders/1Zkr_CW-PmeGFjmJRmjA-lYubIVnFyb7o?usp=drive_link' },
  { srNo: 20, label: 'Letter S', folderUrl: 'https://drive.google.com/drive/folders/1EQaicx76vWxgQwSosFQcAbrzgePEwPYN?usp=drive_link' },
  { srNo: 21, label: 'Letter T', folderUrl: 'https://drive.google.com/drive/folders/1QcM74V2Q4OGRzDhZrP_ULHd5W4XgzmPw?usp=drive_link' },
  { srNo: 22, label: 'Letter U', folderUrl: 'https://drive.google.com/drive/folders/1g9DxvHVMcoID1PhbvR8kJ5Mhq921hDcM?usp=drive_link' },
  { srNo: 23, label: 'Letter V', folderUrl: 'https://drive.google.com/drive/folders/1hdhswMEW2FbBhi4GPgYsTBrhThpuSoNK?usp=drive_link' },
  { srNo: 24, label: 'Letter W', folderUrl: 'https://drive.google.com/drive/folders/1JMWkAryDQ074isVeD0_umJfFHOhb3f6t?usp=drive_link' },
  { srNo: 25, label: 'Letter X', folderUrl: 'https://drive.google.com/drive/folders/1t4mOWrTel2OXS76RX7b9X2Gf-6MqmrFp?usp=drive_link' },
  { srNo: 26, label: 'Letter Y', folderUrl: 'https://drive.google.com/drive/folders/1wiWGUBD_R_KobXRAE3Erpp7XUZrUuYNb?usp=drive_link' },
  { srNo: 27, label: 'Letter Z', folderUrl: 'https://drive.google.com/drive/folders/1cTyPjYRqrBTG2cEHQNXd4oRGkp9HtY4M?usp=drive_link' },
  { srNo: 28, label: 'Numbers (0-9)', folderUrl: 'https://drive.google.com/drive/folders/1QBiSSz2zyV0CvaPRZo4V2jkn8FI2-jsT?usp=drive_link' }
];

// --- 1. SCIENCE CONCEPT VIDEOS ---

const SCIENCE_CLASS_VI_IDS: string[] = [
  'NOW8jZ8tUmM', '37DUnw7VMHs', 'AUelwhztcDE', 'bztyJfp2Nag', 'vmTqTXjfbZc',
  'LPjEL6HT2fw', '0-doHSCaFCk', 'uejCh-UMIXA', 'VmwMhsgTupg', '4XBKThm8X30',
  'RwMPdWfh4ek', 'C4eyL6SNyfY', '0kw6nUYjhlc', 'HtEOscRvlwc', 'Hj94IXAj0Rw',
  '_9IYk9QpDXg', 'mICiQnmPr7A', 'hvUb3t9AP9g', 'ODgSLpeHzwM', 'sRI4PhgLbmo',
  'zdZkVtQChEc', 'kPSf6CSWLoQ', 'ZELR9dZ2Vc0', 'ZvI7smRpn64', 'z_EcOpWtedY',
  '882LhPhaWfQ', 'XbmSQV6iAm0', 'ZPiYNB-JZmA', 'v-sdUj7Kiio', 'HJz27uP2E78',
  'vd0NWtGl2W8', '5J5tcUEvjuE', 'OG9W8eLvhmw', 'rTbJJqnpka0', 'IGl6-dbol8Q',
  'Yc_53ykjKl0', 'TyFiTG9qYaA', 'dZDdBV5IrQY', 'kNAdnj_tgCU', 'cbv03t7Y9jA',
  'aV0yNg9Kg-s', 'nfXDNBcS_8I', 'R6F6gVDTLcw', '58YylhfX2sw', 'L2W1NfpzP4E',
  'fhoopb7Ns1M', 'Eq1zf2p7SUI', 'RTy8e2SW7-g'
];

const SCIENCE_CLASS_VII_IDS: string[] = [
  'rsU8nx65_BA', 'O5a5vsUKvGc', 'ue126amRxUg', 'h0wEYQGgIiI', '_gxnnd8N2dQ',
  'mpXuo9Prqag', 'YfI2umZfFTc', 'FPUEz24Zp6s', 'i2-curPkLSE', 'GhRtvdNr63k',
  'paVxfIoJZRI', 'AQDoCYrzvlo', 'eL91CZU-T2U', 'Srnfsi5k0kw', 'kOde_JgUqrE',
  '4cFwMWuFyas', 'LOOP9vXqclw', 'sfKR-mfHPRI', 'ygwCi0-7oXQ', 'WiCo5MnkQvo',
  'tEkJolihrPk', 'iRTuiil6JKs', 'eMlpoZ0scPE', 'wjbmMmIv7tg', 'ciKIVfyPYRM',
  'e08gU2ooZCo', 'D3XWbyd-Ee8', 'xXrxIBqiZbs', 'nNXHc9c7t9Y', 'e466qPIVqMw'
];

const SCIENCE_CLASS_VIII_IDS: string[] = [
  'kAy-Bv5rhpI', 'WhdlqIoCmGc', 'Q8JtZV9v4es', 'kryO-MJDXfs', 'RIuvovZjQ18',
  'xjOYI8-H6WU', 'ag0czoeCSbY'
];

// --- 2. MATHEMATICS CONCEPT VIDEOS ---

const MATHS_CLASS_VI_IDS: string[] = [
  'v4Msfk4kDQo', 'cwA_q-hjCLw', '2lDwGej4mLg', 'BEWmCyst7Ig', 'AwmcIentZtI',
  'lY9btE3gK0c', 'SsOGclonK-M', 'vUylkFh1434', '2Fl-NkIbeMY', 'oKOt_zF5tdw',
  '61iTpizVGtU', 'h9hE1Dg7ZPE', 'hedrvGaqg0o', 'lTXtpu6-e0k', 'vC1ISCpkQiU',
  'mvIxvZZOc_E', 'QRg4_48-3IA', '_H_uQrmfznY', 'YhavZ4NHbuo', 'qoa6wJy2leY',
  'SHEu2uG2IEQ', 'YIgwqjUDsIU', 'qUjTbQACHwY', 'IHK0yFJ4abc', 's50rMfWwp5g',
  'YHD2xGhTGSg', 'q8ALKZicyw0', 'MMxJYMPWeK4', 'EscmxMYkGck', 'hBOP6CwqQfI',
  'w1iacJuIJ28', 'SXEU-UWmf7Q', 'EdVYlin6mQ8', 'xy2wnFr144Q', 'WitV1j5Rs8A',
  '1mbjTlMbBuA', '90XNPAq7YW0', 'FpK7WNxNM-c', '-ZBLpz-lTCg', 'Sq7IDTDYZwU',
  'RnIVGinR8aM', 'daKAXEvfYI0', 'tvjO_iA3NRU', 'R2Fewl8HMdw', 'FscMa_mRwAI',
  'l6DMZI6yRD4'
];

const MATHS_CLASS_VII_IDS: string[] = [
  'DxR6Ou6_wHQ', '2Ge_qUHMYPw', '7wgUCzJVixE', 'gHHBniSgoaE', 'XBRvw0BTWIk',
  'n2Ssz2G73xk', '4HFyL8irS4E', 'z1sjClA_1K8'
];

export const ALL_ISL_CONCEPT_VIDEOS: ISLConceptVideo[] = [
  // Science - Class VI
  ...SCIENCE_CLASS_VI_IDS.map((ytId, idx) => ({
    id: `sci_c6_${idx + 1}`,
    youtubeId: ytId,
    title: `Science Concept Video ${idx + 1}`,
    subject: 'science' as const,
    standard: 'Class VI' as const,
    chapter: `NCERT Class 6 Science Module ${idx + 1}`,
    keywords: ['science', 'matter', 'living', 'light', 'magnets', 'water', 'air', 'motion', 'distance']
  })),
  // Science - Class VII
  ...SCIENCE_CLASS_VII_IDS.map((ytId, idx) => ({
    id: `sci_c7_${idx + 1}`,
    youtubeId: ytId,
    title: `Science Concept Video ${idx + 1}`,
    subject: 'science' as const,
    standard: 'Class VII' as const,
    chapter: `NCERT Class 7 Science Module ${idx + 1}`,
    keywords: ['science', 'nutrition', 'heat', 'acids', 'bases', 'weather', 'respiration', 'circulation', 'light']
  })),
  // Science - Class VIII
  ...SCIENCE_CLASS_VIII_IDS.map((ytId, idx) => ({
    id: `sci_c8_${idx + 1}`,
    youtubeId: ytId,
    title: `Science Concept Video ${idx + 1}`,
    subject: 'science' as const,
    standard: 'Class VIII' as const,
    chapter: `NCERT Class 8 Science Module ${idx + 1}`,
    keywords: ['science', 'force', 'pressure', 'friction', 'sound', 'chemical effects', 'light', 'stars']
  })),
  // Maths - Class VI
  ...MATHS_CLASS_VI_IDS.map((ytId, idx) => ({
    id: `math_c6_${idx + 1}`,
    youtubeId: ytId,
    title: `Mathematics Concept Video ${idx + 1}`,
    subject: 'mathematics' as const,
    standard: 'Class VI' as const,
    chapter: `NCERT Class 6 Mathematics Module ${idx + 1}`,
    keywords: ['math', 'mathematics', 'numbers', 'integers', 'fractions', 'decimals', 'algebra', 'ratio', 'geometry']
  })),
  // Maths - Class VII
  ...MATHS_CLASS_VII_IDS.map((ytId, idx) => ({
    id: `math_c7_${idx + 1}`,
    youtubeId: ytId,
    title: `Mathematics Concept Video ${idx + 1}`,
    subject: 'mathematics' as const,
    standard: 'Class VII' as const,
    chapter: `NCERT Class 7 Mathematics Module ${idx + 1}`,
    keywords: ['math', 'mathematics', 'fractions', 'decimals', 'data handling', 'simple equations', 'lines and angles', 'triangles']
  }))
];

/**
 * Intelligent mapper to match a study topic to an authentic ISL video
 */
export function findMatchingISLVideo(topic: string, preferredSubject?: ISLSubjectCategory): ISLConceptVideo {
  const norm = topic.toLowerCase();
  const isMath = preferredSubject === 'mathematics' ||
    norm.includes('math') || norm.includes('algebra') || norm.includes('fraction') ||
    norm.includes('geometry') || norm.includes('number') || norm.includes('equation') ||
    norm.includes('ratio') || norm.includes('integer') || norm.includes('triangle');

  const targetSubject: ISLSubjectCategory = isMath ? 'mathematics' : 'science';
  const pool = ALL_ISL_CONCEPT_VIDEOS.filter((v) => v.subject === targetSubject);

  // Keyword match
  const match = pool.find((v) => v.keywords.some((k) => norm.includes(k)));
  return match || pool[0] || ALL_ISL_CONCEPT_VIDEOS[0];
}
