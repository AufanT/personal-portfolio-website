import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import php from 'highlight.js/lib/languages/php';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import json from 'highlight.js/lib/languages/json';
import sql from 'highlight.js/lib/languages/sql';
import ini from 'highlight.js/lib/languages/ini';
import yaml from 'highlight.js/lib/languages/yaml';
import kotlin from 'highlight.js/lib/languages/kotlin';
import java from 'highlight.js/lib/languages/java';
import dart from 'highlight.js/lib/languages/dart';
import swift from 'highlight.js/lib/languages/swift';
import gradle from 'highlight.js/lib/languages/gradle';
import python from 'highlight.js/lib/languages/python';
import cpp from 'highlight.js/lib/languages/cpp';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import markdown from 'highlight.js/lib/languages/markdown';
import plaintext from 'highlight.js/lib/languages/plaintext';

/**
 * Syntax highlighting untuk blok kode laporan. SERVER-ONLY: hanya diimport
 * oleh Server Component, jadi highlight.js tidak pernah dikirim ke browser.
 * Bahasa yang didaftarkan harus sinkron dengan src/lib/code-languages.ts.
 */

const LANGUAGES = {
  bash, php, xml, css, javascript, typescript, json, sql, ini, yaml, kotlin,
  java, dart, swift, gradle, python, cpp, dockerfile, markdown, plaintext,
};

for (const [name, definition] of Object.entries(LANGUAGES)) {
  if (!hljs.getLanguage(name)) hljs.registerLanguage(name, definition);
}

const AUTO_SUBSET = Object.keys(LANGUAGES).filter((l) => l !== 'plaintext' && l !== 'markdown');

const SHELL_COMMAND = /^\s*(\$\s+)?(php artisan|composer|npm|npx|yarn|pnpm|git|cd|ls|mkdir|touch|rm|cp|mv|sudo|apt|brew|pip|python|flutter|dart|adb|\.\/gradlew|gradle|docker|curl|wget|node|echo|export|chmod|code)\b/;
const ENV_LINE = /^\s*(#.*|[A-Z][A-Z0-9_]*=.*)?\s*$/;

/**
 * Tebakan bahasa untuk blok kode tanpa pilihan bahasa (termasuk semua kode di
 * laporan lama). Pola yang umum di laporan praktikum dicek lebih dulu karena
 * deteksi otomatis highlight.js sering keliru untuk potongan pendek, misalnya
 * menganggap `php artisan migrate` sebagai PHP.
 */
function guessLanguage(code: string): string | null {
  const lines = code.split('\n').filter((l) => l.trim());
  if (lines.length === 0) return 'plaintext';
  if (/^\s*<\?php/.test(code)) return 'php';
  if (lines.every((l) => SHELL_COMMAND.test(l) || /^\s*#/.test(l))) return 'bash';
  if (lines.every((l) => ENV_LINE.test(l)) && lines.some((l) => /^[A-Z][A-Z0-9_]*=/.test(l))) return 'ini';
  if (/@(extends|section|yield|foreach|if|csrf)\b|\{\{.*\}\}/.test(code) && /<\/?[a-z]/i.test(code)) return 'xml';
  return null;
}

export interface HighlightResult {
  html: string;
  language: string;
}

export function highlightCode(code: string, language?: string | null): HighlightResult {
  const source = code.replace(/\r\n?/g, '\n').replace(/\s+$/, '');

  const chosen = language && language !== 'auto' && hljs.getLanguage(language) ? language : guessLanguage(source);

  if (chosen) {
    return {
      html: hljs.highlight(source, { language: chosen, ignoreIllegals: true }).value,
      language: chosen,
    };
  }

  const auto = hljs.highlightAuto(source, AUTO_SUBSET);
  // Relevansi rendah berarti tebakan asal; lebih jujur ditampilkan tanpa warna.
  if (!auto.language || auto.relevance < 5) {
    return { html: hljs.highlight(source, { language: 'plaintext' }).value, language: 'plaintext' };
  }
  return { html: auto.value, language: auto.language };
}
