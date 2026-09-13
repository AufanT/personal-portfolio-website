import sanitizeHtml from 'sanitize-html';
import { toRichHtml, trimTrailingEmptyParagraphs } from '@/lib/rich-text';

/**
 * Menampilkan field teks laporan (HTML dari editor, atau teks biasa lama).
 *
 * Server Component: sanitasi berjalan di server sehingga sanitize-html tidak
 * ikut dikirim ke browser. HTML SELALU disaring lewat allowlist sebelum masuk
 * dangerouslySetInnerHTML — isinya berasal dari database, dan satu-satunya
 * penghalang script tersisip (misalnya lewat request API yang dimanipulasi)
 * adalah daftar tag di bawah ini.
 */

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'code', 'mark',
    'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'a', 'hr',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    p: ['style'],
    h3: ['style'],
    h4: ['style'],
  },
  // Hanya perataan teks dari extension TextAlign yang boleh lewat.
  allowedStyles: {
    '*': { 'text-align': [/^(left|right|center|justify)$/] },
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowProtocolRelative: false,
  transformTags: {
    // transformTags berjalan SEBELUM penyaringan skema URL. Tautan dengan tujuan
    // tidak aman (javascript:, data:, dll.) diubah jadi teks biasa di sini;
    // kalau tidak, href-nya memang dibuang tapi <a> kosong tetap tampil
    // bergaya link yang tidak bisa diklik.
    a: (_tagName, attribs): sanitizeHtml.Tag => {
      const href = (attribs.href ?? '').trim();
      if (!/^(https?:|mailto:)/i.test(href)) {
        return { tagName: 'span', attribs: {} };
      }
      return { tagName: 'a', attribs: { href, target: '_blank', rel: 'noopener noreferrer' } };
    },
  },
};

export function sanitizeRichText(value: string | null | undefined): string {
  // Paragraf kosong di akhir juga dibuang saat render, untuk data yang
  // tersimpan sebelum normalisasi ini ada.
  return trimTrailingEmptyParagraphs(sanitizeHtml(toRichHtml(value), SANITIZE_OPTIONS));
}

export default function RichText({
  value,
  className = '',
}: {
  value: string | null | undefined;
  className?: string;
}) {
  const html = sanitizeRichText(value);
  if (!html) return null;
  return <div className={`rich-text ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
