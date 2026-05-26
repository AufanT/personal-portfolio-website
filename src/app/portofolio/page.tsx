'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ExternalLink, Github, Terminal, X, ArrowRight } from 'lucide-react';
import RippleSection from '@/components/RippleSection';
import { supabaseClient } from '@/lib/supabase';

interface Project {
  id: string;
  title: string;
  category: string;
  category_slug: string;
  description: string;
  image_url: string | null;
  status: string;
  demo_url: string | null;
  github_url: string | null;
  details: string | null;
  is_featured: boolean;
}

export default function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabaseClient
          .from('projects')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProjects(data || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const categoryFilters = [
    { name: 'All Projects', slug: 'all' },
    ...Array.from(new Set(projects.map((p) => p.category_slug))).map((slug) => ({
      name: projects.find((p) => p.category_slug === slug)?.category || slug,
      slug,
    })),
  ];

  const filteredProjects = activeFilter === 'all'
    ? projects
    : projects.filter((p) => p.category_slug === activeFilter);

  return (
    <div className="flex flex-col">
      {/* Header — full-width ripple background */}
      <RippleSection className="pt-24 md:pt-28">
        <div className="border-l-4 border-primary-container pl-4 md:pl-5 py-4 md:py-6">
          <span className="font-mono text-[10px] md:text-xs tracking-[0.25em] text-primary-container uppercase">PROJECTS</span>
          <h1 className="font-mono text-2xl md:text-3xl lg:text-4xl text-on-surface mt-2 leading-tight tracking-tight">
            Collection
          </h1>
        </div>
      </RippleSection>

      <div className="w-full max-w-container-max pl-[36px] md:pl-[88px] pr-margin-mobile md:pr-margin-desktop pt-2 pb-12 flex flex-col gap-10">
      {/* Filter Bar */}
      {!loading && categoryFilters.length > 1 && (
        <section className="flex flex-wrap gap-3">
          {categoryFilters.map((filter) => (
            <button
              key={filter.slug}
              onClick={() => setActiveFilter(filter.slug)}
              className={`px-4 py-2 font-mono text-xs transition-all duration-300 rounded border ${
                activeFilter === filter.slug
                  ? 'bg-primary-container/10 text-primary-container border-primary-container shadow-neon'
                  : 'bg-surface-container text-on-surface-variant border-outline-variant hover:border-primary-container/50 hover:text-primary-container'
              }`}
            >
              {activeFilter === filter.slug && <span className="text-primary-container mr-1">&gt;</span>}
              {filter.name}
            </button>
          ))}
        </section>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Terminal className="w-8 h-8 text-primary-container animate-pulse" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-outline-variant/20 rounded-xl">
          <p className="font-mono text-on-surface-variant">NO_PROJECTS_FOUND</p>
        </div>
      ) : (
        /* Project Grid */
        <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter mt-2">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => {
              const isFeatured = project.is_featured;
              const spanClass = isFeatured ? 'md:col-span-8' : 'md:col-span-4';

              return (
                <motion.article
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`col-span-1 ${spanClass} bg-surface-container/50 backdrop-blur-xl border border-outline-variant/30 rounded-lg overflow-hidden group hover:border-primary-container/50 transition-all duration-300 flex flex-col ${
                    isFeatured ? 'md:flex-row min-h-[380px]' : 'flex-col'
                  }`}
                >
                  {/* Image side */}
                  {project.image_url ? (
                    <div className={`relative bg-surface-container-lowest border-outline-variant/20 overflow-hidden ${
                      isFeatured ? 'w-full md:w-1/2 min-h-[220px] md:border-r' : 'w-full h-48 border-b'
                    }`}>
                      <Image
                        src={project.image_url}
                        alt={project.title}
                        fill
                        className="object-cover object-top opacity-60 group-hover:opacity-85 transition-opacity duration-300 mix-blend-luminosity hover:mix-blend-normal"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
                    </div>
                  ) : (
                    isFeatured && <div className="hidden md:block w-1/2 bg-surface-container-lowest border-r border-outline-variant/20 relative" />
                  )}

                  {/* Content side */}
                  <div className={`p-6 md:p-8 flex flex-col justify-between flex-grow ${
                    isFeatured && project.image_url ? 'w-full md:w-1/2' : 'w-full'
                  }`}>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="inline-block px-2.5 py-1 bg-primary-container/10 border border-primary-container/30 text-primary-container font-mono text-[10px] rounded">
                          &gt; {project.category}
                        </span>
                        <span className="font-mono text-[10px] text-outline tracking-wider">
                          {project.status}
                        </span>
                      </div>

                      <h2 className="font-mono text-lg md:text-xl text-on-surface group-hover:text-primary-container transition-colors font-bold mt-1">
                        {project.title}
                      </h2>

                      <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedProject(project)}
                      className="self-start px-5 py-2 mt-6 bg-transparent border border-primary-container text-primary-container font-mono text-xs rounded hover:bg-primary-container/10 shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </section>
      )}

      {/* Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-surface-container border border-primary-container/30 rounded-lg shadow-[0_0_50px_rgba(57,255,20,0.15)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Header */}
              {selectedProject.image_url && (
                <div className="relative w-full h-56 md:h-64 bg-surface-container-lowest border-b border-outline-variant/20">
                  <Image
                    src={selectedProject.image_url}
                    alt={selectedProject.title}
                    fill
                    className="object-cover opacity-75"
                    sizes="700px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent"></div>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 p-2 bg-background/60 hover:bg-background border border-outline-variant/30 hover:border-primary-container text-on-surface-variant hover:text-primary-container rounded-full z-10 transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Content */}
              <div className="p-6 md:p-8 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-primary-container/10 border border-primary-container/30 text-primary-container font-mono text-xs rounded">
                    &gt; {selectedProject.category}
                  </span>
                  <span className="font-mono text-xs text-outline">
                    SYSTEM_STATUS: {selectedProject.status}
                  </span>
                </div>

                <h3 className="font-mono text-xl md:text-2xl text-on-surface font-bold">
                  {selectedProject.title}
                </h3>

                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  {selectedProject.description}
                </p>

                {selectedProject.details && (
                  <div className="border-t border-outline-variant/20 pt-4 mt-2">
                    <p className="font-mono text-[10px] text-outline tracking-wider uppercase mb-1">// Details</p>
                    <p className="font-sans text-xs text-on-surface-variant/80 leading-relaxed italic bg-surface-container-low p-3 rounded border border-outline-variant/10">
                      {selectedProject.details}
                    </p>
                  </div>
                )}

                {/* Footer buttons */}
                <div className="flex justify-end gap-3 mt-6">
                  {selectedProject.github_url && (
                    <a
                      href={selectedProject.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 border border-outline-variant text-on-background font-mono text-xs rounded hover:border-primary-container hover:text-primary-container transition-colors flex items-center gap-1.5"
                    >
                      <Github className="w-4 h-4" />
                      <span>Repository</span>
                    </a>
                  )}
                  {selectedProject.demo_url && selectedProject.demo_url !== '#' && (
                    <a
                      href={selectedProject.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-neon flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Live Demo</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
}
