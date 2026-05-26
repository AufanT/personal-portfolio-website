import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer aria-label="Site footer" className="w-full border-t border-outline-variant/30 bg-surface-container-lowest/80 backdrop-blur-md py-8">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start gap-1">
          <p className="font-mono text-xs text-on-surface-variant">
            &gt; STATUS: ONLINE | CORE_SYSTEM_ACTIVE
          </p>
          <p className="font-mono text-sm text-outline">
            &copy; {currentYear} Aufan. All rights reserved.
          </p>
        </div>

        <div className="flex gap-6 font-mono text-sm">
          <a
            href="https://github.com/AufanT"
            target="_blank"
            rel="noopener noreferrer"
            className="text-on-surface-variant hover:text-primary-container transition-colors"
          >
            [GitHub]
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-on-surface-variant hover:text-primary-container transition-colors"
          >
            [LinkedIn]
          </a>
          <Link
            href="/admin"
            className="text-on-surface-variant hover:text-primary-container transition-colors"
          >
            [Admin]
          </Link>
        </div>
      </div>
    </footer>
  );
}
