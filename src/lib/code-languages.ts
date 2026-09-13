/**
 * Daftar bahasa untuk blok kode laporan. Dipakai dropdown editor (browser) dan
 * highlighter (server), jadi file ini tidak boleh mengimport highlight.js.
 * `value` harus sama dengan nama bahasa yang didaftarkan di src/lib/highlight.ts.
 */
export const CODE_LANGUAGES = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'bash', label: 'Terminal / Bash' },
  { value: 'php', label: 'PHP' },
  { value: 'xml', label: 'HTML / XML / Blade' },
  { value: 'css', label: 'CSS' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'json', label: 'JSON' },
  { value: 'sql', label: 'SQL' },
  { value: 'ini', label: '.env / INI' },
  { value: 'yaml', label: 'YAML' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'java', label: 'Java' },
  { value: 'dart', label: 'Dart / Flutter' },
  { value: 'swift', label: 'Swift' },
  { value: 'gradle', label: 'Gradle' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C / C++' },
  { value: 'dockerfile', label: 'Dockerfile' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'plaintext', label: 'Teks biasa' },
] as const;

export type CodeLanguage = (typeof CODE_LANGUAGES)[number]['value'];

const LABELS = new Map<string, string>(CODE_LANGUAGES.map((l) => [l.value, l.label]));

const BADGES: Record<string, string> = { xml: 'html', cpp: 'c++', ini: '.env', javascript: 'js', typescript: 'ts' };

/** Label singkat di pojok jendela kode, misalnya "php", "html", ".env". */
export function codeLanguageBadge(value: string): string {
  return BADGES[value] ?? value;
}

export function isKnownCodeLanguage(value: unknown): value is CodeLanguage {
  return typeof value === 'string' && LABELS.has(value);
}
