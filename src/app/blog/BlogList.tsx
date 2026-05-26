'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Blog {
  id: string;
  title: string;
  description: string;
  subject: string;
  cover_url: string;
  created_at: string;
  is_published: boolean;
  github_url?: string;
}

interface BlogListProps {
  initialBlogs: Blog[];
}

export default function BlogList({ initialBlogs }: BlogListProps) {
  const [visibleCount, setVisibleCount] = useState(8);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const visibleBlogs = initialBlogs.slice(0, visibleCount);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visibleCount < initialBlogs.length) {
          setVisibleCount((prev) => Math.min(prev + 8, initialBlogs.length));
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, initialBlogs.length]);

  return (
    <div className="w-full">
      {/* Blog Grid */}
      {initialBlogs.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-outline-variant/20 rounded-xl bg-surface-container-low/20">
          <p className="font-mono text-on-surface-variant">
            NO_RECORDS_FOUND matching the current query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleBlogs.map((blog, index) => (
            <motion.article
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="flex flex-col bg-surface-container-low/40 backdrop-blur-xl border border-outline-variant/30 rounded-xl overflow-hidden group hover:border-primary-container/60 hover:shadow-neon transition-all duration-300 ease-in-out cursor-pointer relative"
            >
              <Link href={`/blog/${blog.id}`} className="absolute inset-0 z-10" />
              {/* Image Header wrapper */}
              <div className="w-full h-48 relative overflow-hidden bg-surface-container-highest/50 border-b border-outline-variant/20">
                <Image
                  alt={blog.title}
                  src={blog.cover_url || '/images/onprogress.png'}
                  fill
                  className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (target.src !== '/images/onprogress.png') {
                      target.src = '/images/onprogress.png';
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60 pointer-events-none"></div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-grow relative z-20">
                <div className="flex items-center justify-between mb-3 border-b border-outline-variant/20 pb-2">
                  <span className="font-mono text-xs text-primary-container uppercase tracking-wider bg-primary-container/10 px-2 py-0.5 rounded border border-primary-container/20">
                    {blog.subject || 'Tutorial'}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(blog.created_at)}</span>
                  </div>
                </div>

                <h3 className="font-mono text-base font-bold text-on-surface mb-2 group-hover:text-primary-container transition-colors duration-200 line-clamp-2 text-left">
                  {blog.title}
                </h3>
                <p className="font-sans text-sm text-on-surface-variant mb-4 line-clamp-2 leading-relaxed text-left">
                  {blog.description || 'No description provided.'}
                </p>

                {/* Read Button at bottom */}
                <div className="mt-auto flex items-center gap-2 text-on-surface font-mono text-xs group-hover:text-primary-container transition-colors duration-200 font-semibold">
                  <span>READ_FILE</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      {visibleCount < initialBlogs.length && (
        <div ref={sentinelRef} className="h-10 w-full mt-8" />
      )}
    </div>
  );
}
