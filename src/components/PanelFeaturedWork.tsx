'use client';

import Link from 'next/link';
import { ArrowRight, Github, ExternalLink, Layers } from 'lucide-react';
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

interface PanelFeaturedWorkProps {
  projects: Project[];
}

export default function PanelFeaturedWork({ projects }: PanelFeaturedWorkProps) {
  return (
    <div className="w-full px-5 sm:px-8 md:px-margin-desktop max-w-container-max mx-auto">
      <div className="flex flex-col gap-6 md:gap-8 w-full">
        {/* Section Header */}
        <div className="flex items-end justify-between gap-4">
          <div className="border-l-4 border-primary-container pl-4 md:pl-6 py-2">
            <span className="font-mono text-[10px] md:text-xs tracking-[0.25em] text-primary-container uppercase">
              PROJECTS
            </span>
            <h2 className="font-mono text-2xl md:text-4xl lg:text-5xl text-on-surface mt-2 leading-tight tracking-tight">
              Featured Work <span className="text-primary-container animate-pulse">_</span>
            </h2>
          </div>
          <Link
            href="/portofolio"
            className="btn-neon-outline text-xs inline-flex items-center gap-2 shrink-0 mb-2"
          >
            <span><ScrambleText>VIEW ALL</ScrambleText></span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Project Cards Grid — "Explore More" card always last */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="glass-panel overflow-hidden flex flex-col group hover:border-primary-container/40 hover:shadow-neon transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="relative w-full h-40 sm:h-44 overflow-hidden shrink-0">
                <div
                  className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${project.image_url || '/images/onprogress.png'})`,
                  }}
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 transition-all duration-300" />
                {/* Viewfinder corners */}
                <div className="absolute inset-[10px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-0 left-0 w-5 h-5" style={{ borderTop: '2px solid rgba(57,255,20,0.6)', borderLeft: '2px solid rgba(57,255,20,0.6)' }} />
                  <div className="absolute top-0 right-0 w-5 h-5" style={{ borderTop: '2px solid rgba(57,255,20,0.6)', borderRight: '2px solid rgba(57,255,20,0.6)' }} />
                  <div className="absolute bottom-0 left-0 w-5 h-5" style={{ borderBottom: '2px solid rgba(57,255,20,0.6)', borderLeft: '2px solid rgba(57,255,20,0.6)' }} />
                  <div className="absolute bottom-0 right-0 w-5 h-5" style={{ borderBottom: '2px solid rgba(57,255,20,0.6)', borderRight: '2px solid rgba(57,255,20,0.6)' }} />
                </div>
                {/* Category badge */}
                <span className="absolute top-3 left-3 font-mono text-[10px] tracking-widest text-primary-container uppercase bg-black/60 border border-primary-container/30 px-2 py-0.5 rounded">
                  {project.category || 'Project'}
                </span>
              </div>

              {/* Card body */}
              <div className="flex flex-col gap-2.5 p-4 flex-1">
                <h3 className="font-mono text-sm md:text-base text-on-background font-bold leading-snug line-clamp-2">
                  {project.title}
                </h3>
                <p className="font-sans text-xs text-on-surface-variant leading-relaxed line-clamp-3 flex-1">
                  {project.description}
                </p>

                {/* Action links */}
                <div className="flex items-center gap-2.5 pt-1 border-t border-outline-variant/20 mt-1">
                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] text-primary-container hover:underline flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      DEMO
                    </a>
                  )}
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] text-on-surface-variant hover:text-primary-container flex items-center gap-1 transition-colors"
                    >
                      <Github className="w-3 h-3" />
                      SOURCE
                    </a>
                  )}
                  <div className="flex-1" />
                  <Link
                    href="/portofolio"
                    className="font-mono text-[10px] text-on-surface-variant/50 hover:text-primary-container flex items-center gap-1 transition-colors"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Explore More — always the last card */}
          <Link
            href="/portofolio"
            className="glass-panel group flex flex-col items-center justify-center gap-4 p-6 min-h-[220px] hover:border-primary-container/50 hover:shadow-neon transition-all duration-300 cursor-pointer text-center"
          >
            <div className="w-12 h-12 rounded-full border border-primary-container/30 bg-primary-container/5 flex items-center justify-center text-primary-container group-hover:bg-primary-container/15 group-hover:shadow-neon transition-all duration-300">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] tracking-[0.25em] text-primary-container uppercase">
                <ScrambleText>EXPLORE MORE</ScrambleText>
              </span>
              <p className="font-mono text-sm text-on-background font-bold leading-snug">
                View Full Collection
              </p>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Browse all projects &amp; filter by category.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-primary-container group-hover:gap-3 transition-all duration-300">
              <span><ScrambleText>VIEW ALL</ScrambleText></span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
