'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Panel {
  id: string;
  content: ReactNode;
}

interface HorizontalSectionProps {
  panels: Panel[];
  mobilePanels?: Panel[];
}

export default function HorizontalSection({ panels, mobilePanels }: HorizontalSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useGSAP(() => {
    if (isMobile) return;

    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const total = panels.length;
    if (total < 2) return;

    const dimension = window.innerWidth;
    const scrollDistance = (total - 1) * dimension;

    container.style.height = `${scrollDistance + window.innerHeight}px`;

    const animProp = isMobile ? { y: -scrollDistance } : { x: -scrollDistance };

    gsap.to(track, {
      ...animProp,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: () => `+=${scrollDistance}`,
        scrub: true,
        snap: isMobile ? { snapTo: 1 / (total - 1), duration: 0.4, ease: 'power2.out' } : undefined,
        invalidateOnRefresh: true,
      },
    });

    // Parallax & blur on each .parallax-image
    const panelEls = Array.from(track.children);
    panelEls.forEach((panelEl, idx) => {
      const img = panelEl.querySelector<HTMLElement>('.parallax-image');
      if (!img) return;

      gsap.fromTo(img,
        { backgroundPosition: '50% 0%' },
        {
          backgroundPosition: '50% 100%',
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: () => `top+=${(idx - 0.24) * window.innerWidth} top`,
            end: () => `top+=${(idx + 1) * window.innerWidth} top`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );

      gsap.fromTo(img,
        { filter: 'blur(0px)' },
        {
          filter: 'blur(8px)',
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: () => `top+=${(idx + 0.8) * window.innerWidth} top`,
            end: () => `top+=${(idx + 1) * window.innerWidth} top`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    });

    const onResize = () => {
      const d = isMobile ? window.innerHeight : window.innerWidth;
      const sd = (total - 1) * d;
      container.style.height = `${sd + window.innerHeight}px`;
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', onResize);

    ScrollTrigger.refresh();

    return () => window.removeEventListener('resize', onResize);
  }, { dependencies: [isMobile, panels.length], scope: containerRef });

  const activeMobilePanels = mobilePanels ?? panels;

  if (isMobile && isClient) {
    return (
      <section className="w-full flex flex-col overflow-x-hidden">
        {activeMobilePanels.map((panel) => (
          <div key={panel.id} className="w-full flex flex-col justify-center py-6 md:py-10">
            {panel.content}
          </div>
        ))}
      </section>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="sticky top-0 h-screen overflow-hidden z-10">
        <div
          ref={trackRef}
          className="flex h-full"
          style={{ width: `${panels.length * 100}vw` }}
        >
          {panels.map((panel) => (
            <div
              key={panel.id}
              className="w-screen h-screen flex-shrink-0 overflow-hidden flex items-center"
            >
              {panel.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
