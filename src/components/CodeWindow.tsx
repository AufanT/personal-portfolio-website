import { highlightCode } from '@/lib/highlight';
import { codeLanguageBadge } from '@/lib/code-languages';
import CopyCodeButton from '@/components/CopyCodeButton';

/**
 * Blok kode bergaya carbon.now.sh: jendela gelap bersudut bulat dengan tiga
 * titik lampu lalu lintas, judul file opsional di tengah, bayangan dalam, dan
 * tema warna One Dark. Server Component — pewarnaan terjadi di server.
 *
 * Output highlight.js aman dimasukkan sebagai HTML: seluruh teks sumber sudah
 * di-escape, highlight.js hanya menambahkan <span class="hljs-...">.
 */
export default function CodeWindow({
  code,
  language,
  filename,
}: {
  code: string | null | undefined;
  language?: string | null;
  filename?: string | null;
}) {
  if (!code || !code.trim()) return null;

  const { html, language: detected } = highlightCode(code, language);
  const title = filename?.trim();

  return (
    <figure className="code-window">
      <div className="code-window-bar">
        <div className="code-window-dots" aria-hidden="true">
          <span className="bg-[#ff5f56]" />
          <span className="bg-[#ffbd2e]" />
          <span className="bg-[#27c93f]" />
        </div>
        <figcaption className="code-window-title">{title}</figcaption>
        <div className="code-window-actions">
          {detected !== 'plaintext' && <span className="code-window-lang">{codeLanguageBadge(detected)}</span>}
          <CopyCodeButton code={code} />
        </div>
      </div>
      <pre className="code-window-body scrollbar-cyber">
        <code className={`hljs language-${detected}`} dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </figure>
  );
}
