'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Section {
  id: string;
  label: string;
}

const SECTIONS: Section[] = [
  { id: 'tujuan', label: 'I. Tujuan Praktikum' },
  { id: 'dasar-teori', label: 'II. Dasar Teori' },
  { id: 'alat-bahan', label: 'III. Alat dan Bahan' },
  { id: 'langkah-kerja', label: 'IV. Langkah Kerja' },
  { id: 'latihan-tugas', label: 'V. Latihan dan Tugas' },
  { id: 'kesimpulan', label: 'VI. Kesimpulan' },
];

interface BlogTOCProps {
  availableSections?: string[];
}

export default function BlogTOC({ availableSections = [] }: BlogTOCProps) {
  const [activeId, setActiveId] = useState('');

  // Filter sections that are actually available in this blog post
  const visibleSections = availableSections.length > 0
    ? SECTIONS.filter((sec) => availableSections.includes(sec.id))
    : SECTIONS;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-10% 0px -50% 0px', // Trigger when section is in the upper middle part of viewport
        threshold: 0,
      }
    );

    visibleSections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => {
      visibleSections.forEach((section) => {
        const el = document.getElementById(section.id);
        if (el) observer.unobserve(el);
      });
    };
  }, [visibleSections]);

  return (
    <aside className="hidden lg:flex flex-col col-span-3 gap-6 sticky top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 scrollbar-cyber">
      {/* Return Button */}
      <Link
        href="/blog"
        className="group flex items-center gap-2 text-on-surface-variant hover:text-primary-container transition-colors w-fit p-3 rounded border border-outline-variant hover:border-primary-container/50 hover:bg-surface-container-low font-mono text-xs uppercase"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
        <span>RETURN_TO_DATABASE</span>
      </Link>

      {/* TOC Card */}
      <div className="bg-surface-container-low rounded-xl border border-outline-variant p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary-container"></div>
        <h3 className="font-mono text-sm font-bold text-primary-container mb-4 flex items-center gap-2 uppercase">
          Table of Contents
        </h3>
        <nav className="flex flex-col gap-3 font-mono text-xs text-on-surface-variant">
          {visibleSections.map((section) => {
            const isActive = activeId === section.id;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`hover:text-primary-container hover:pl-1 transition-all flex items-center gap-2 ${
                  isActive ? 'text-primary-container font-semibold' : ''
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    isActive
                      ? 'bg-primary-container toc-dot-active'
                      : 'bg-outline-variant'
                  }`}
                ></span>
                {section.label}
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
