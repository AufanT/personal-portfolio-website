'use client';

import Link from 'next/link';
import { ArrowRight, Github } from 'lucide-react';
import ScrambleText from '@/components/ScrambleText';

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string | null;
  demo_url: string | null;
  github_url: string | null;
}

interface PanelFeaturedProjectProps {
  project: Project;
}

export default function PanelFeaturedProject({ project }: PanelFeaturedProjectProps) {
  return (
    <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
      {/* Image — compact height on mobile, full height on desktop */}
      <div className="w-full h-[38vh] md:w-[60%] md:h-full overflow-hidden relative flex-shrink-0 order-1 md:order-2">
        <div
          className="absolute inset-0 w-full h-full parallax-image will-change-transform"
          style={{
            backgroundImage: `url(${project.image_url || '/images/onprogress.png'})`,
            backgroundSize: 'cover',
            backgroundPosition: '50% 50%',
            backgroundRepeat: 'no-repeat',
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 pointer-events-none z-[2] bg-black/25" />
        {/* Gradient fade to bottom on mobile so text reads cleanly */}
        <div
          className="absolute inset-0 pointer-events-none z-[2] md:hidden"
          style={{
            background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.65) 100%)',
          }}
        />
        {/* Vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-[2]"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%)',
          }}
        />
        {/* Viewfinder corner brackets */}
        <div className="absolute inset-[16px] pointer-events-none z-[4]">
          <div className="absolute top-0 left-0 w-8 h-8" style={{ borderTop: '2.5px solid rgba(57,255,20,0.4)', borderLeft: '2.5px solid rgba(57,255,20,0.4)' }} />
          <div className="absolute top-0 right-0 w-8 h-8" style={{ borderTop: '2.5px solid rgba(57,255,20,0.4)', borderRight: '2.5px solid rgba(57,255,20,0.4)' }} />
          <div className="absolute bottom-0 left-0 w-8 h-8" style={{ borderBottom: '2.5px solid rgba(57,255,20,0.4)', borderLeft: '2.5px solid rgba(57,255,20,0.4)' }} />
          <div className="absolute bottom-0 right-0 w-8 h-8" style={{ borderBottom: '2.5px solid rgba(57,255,20,0.4)', borderRight: '2.5px solid rgba(57,255,20,0.4)' }} />
        </div>
        {/* Center crosshair */}
        <div className="absolute inset-0 pointer-events-none z-[4] flex items-center justify-center">
          <div className="absolute top-1/2 left-1/2 w-12 h-0.5 bg-primary-container/25 -translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 h-12 w-0.5 bg-primary-container/25 -translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full border-[1.5px] border-primary-container/35 -translate-y-1/2 -translate-x-1/2" />
        </div>
        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-[3] opacity-[0.35]"
          style={{
            backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
            backgroundSize: '100% 4px',
          }}
        />
      </div>

      {/* Text — below image on mobile, left panel on desktop */}
      <div className="w-full flex-1 md:w-[40%] flex flex-col justify-center px-5 sm:px-8 md:px-10 lg:px-14 py-6 md:py-0 order-2 md:order-1">
        <span className="font-mono text-[10px] md:text-xs tracking-[0.25em] text-primary-container uppercase mb-2 md:mb-3">
          {project.category || 'Project'}
        </span>

        <h3 className="font-mono text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl text-on-surface font-bold leading-tight mb-3 md:mb-4">
          {project.title}
        </h3>

        <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed mb-5 line-clamp-4 md:line-clamp-5">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-3">
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon text-xs inline-flex items-center gap-2"
            >
              <span><ScrambleText>LIVE DEMO</ScrambleText></span>
              <ArrowRight className="w-3 h-3" />
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon-outline text-xs inline-flex items-center gap-2"
            >
              <Github className="w-3.5 h-3.5" />
              <span><ScrambleText>SOURCE</ScrambleText></span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
