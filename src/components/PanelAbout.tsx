'use client';

import { useState, useEffect, useRef, type ComponentType } from 'react';
import { Code, Database, Brain, Shield } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

const BIO_TEXT =
  "Passionate about software development, with a strong foundation in backend architecture and frontend interfaces. Currently focusing on building robust, scalable applications and exploring the intersections of cybersecurity and modern web technologies. I thrive in command-line environments and believe in writing clean, modular, and performant code.";

const GLITCH_AVATARS = [
  { 
    url: '/images/avatar1.webp', 
    width: 420
  },
  { 
    url: '/images/avatar2.webp', 
    width: 420
  },
];

const CARDS: { Icon: ComponentType<{ className?: string }>; title: string; desc: string }[] = [
  { Icon: Code, title: 'Web Development', desc: 'Website responsif & cepat — HTML, CSS, Tailwind, React, Next.js.' },
  { Icon: Database, title: 'Backend System', desc: 'RESTful API, PostgreSQL, auth, Node.js, Supabase.' },
  { Icon: Brain, title: 'AI & ML Integration', desc: 'Data processing, ML models, AI API integration.' },
  { Icon: Shield, title: 'Cybersecurity', desc: 'Keamanan kode, audit celah keamanan, enkripsi data, dan optimalisasi.' },
];

function SkillCard({ Icon, title, desc }: { Icon: ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="glass-panel p-3 sm:p-4 lg:p-5 flex flex-col gap-1.5 sm:gap-2 lg:gap-3 hover:border-primary-container/40 hover:shadow-neon transition-all duration-300">
      <div className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-primary-container/10 border border-primary-container/30 rounded flex items-center justify-center text-primary-container shrink-0">
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
      </div>
      <div className="flex flex-col gap-0.5 sm:gap-1">
        <h4 className="font-mono text-[11px] sm:text-xs lg:text-sm text-on-background font-bold">{title}</h4>
        <p className="font-sans text-[10px] sm:text-[11px] lg:text-xs text-outline leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function PanelAbout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  // Glitch states
  const [activeIndex, setActiveIndex] = useState(0);
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0, skew: 0 });
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Periodic Glitch Loop (mount once, cycle automatically)
  useEffect(() => {
    const mainInterval = setInterval(() => {
      setIsGlitching(true);
      
      let step = 0;
      const glitchSequence = setInterval(() => {
        const tempIndex = Math.floor(Math.random() * GLITCH_AVATARS.length);
        setActiveIndex(tempIndex);
        
        setGlitchOffset({
          x: Math.floor(Math.random() * 12) - 6,
          y: Math.floor(Math.random() * 8) - 4,
          skew: Math.floor(Math.random() * 10) - 5,
        });

        step++;
        if (step >= 4) {
          clearInterval(glitchSequence);
          setIsGlitching(false);
          
          // Settle on the next index
          setActiveIndex((current) => {
            return (current + 1) % GLITCH_AVATARS.length;
          });
          setGlitchOffset({ x: 0, y: 0, skew: 0 });
        }
      }, 70);

    }, 4000);

    return () => clearInterval(mainInterval);
  }, []);

  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  return (
    <div className="w-full px-5 sm:px-8 md:px-10 lg:px-12 max-w-container-max mx-auto pt-6 pb-6 lg:pb-0 relative overflow-hidden">
      
      {/* Custom Styles for Background Marquee Scroll */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-scroll {
          animation: marqueeScroll 35s linear infinite;
        }
      `}} />

      {/* Main Content Wrapper */}
      <div className="flex flex-col lg:flex-row lg:flex-wrap items-center justify-center gap-0 lg:gap-y-0 lg:gap-x-5 xl:gap-x-8 mx-auto w-full relative z-10">

        {/* Avatar — Full width first on mobile, center column on desktop */}
        <div className="flex justify-center items-center w-full lg:w-[360px] xl:w-[420px] lg:shrink-0 select-none order-1 lg:order-2 relative">
          
          {/* Infinite Scrolling Watermark Background */}
          <div 
            className="absolute pointer-events-none overflow-hidden z-0 flex items-center select-none"
            style={{
              left: '50%',
              width: '100vw',
              transform: 'translateX(-50%)',
              height: '100%',
            }}
          >
            <div className="flex whitespace-nowrap animate-marquee-scroll">
              <span className="font-mono text-[5rem] sm:text-[8rem] md:text-[10rem] lg:text-[13rem] font-extrabold tracking-[0.2em] text-[#39FF14]/[0.03] uppercase leading-none">
                AUFAN TAUFIQURRAHMAN &bull; AUFAN &bull;&nbsp;
              </span>
              <span className="font-mono text-[5rem] sm:text-[8rem] md:text-[10rem] lg:text-[13rem] font-extrabold tracking-[0.2em] text-[#39FF14]/[0.03] uppercase leading-none">
                AUFAN TAUFIQURRAHMAN &bull; AUFAN &bull;&nbsp;
              </span>
            </div>
          </div>

          <div 
            className="relative overflow-visible flex items-center justify-center z-10 w-[400px] sm:w-[600px] md:w-[740px] lg:w-[360px] xl:w-[420px] h-[480px] sm:h-[680px] md:h-[840px] lg:h-[410px] xl:h-[470px] max-w-full"
            style={{ 
              maskImage: 'linear-gradient(to bottom, black 55%, transparent 85%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 85%)',
              transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Skew/Jitter Wrapper */}
            <div
              className="w-full h-full relative"
              style={{
                transform: `translate(${glitchOffset.x}px, ${glitchOffset.y}px) skewX(${glitchOffset.skew}deg)`,
              }}
            >
              {/* RGB Split Glitch Layers */}
              {isGlitching && (
                <>
                  <img
                    src={GLITCH_AVATARS[activeIndex].url}
                    alt="glitch-layer-1"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-70"
                    style={{
                      transform: 'translate(-4px, 2px)',
                      filter: 'drop-shadow(0 0 5px rgba(57,255,20,0.85)) hue-rotate(45deg) saturate(1.5)',
                    }}
                  />
                  <img
                    src={GLITCH_AVATARS[activeIndex].url}
                    alt="glitch-layer-2"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-60"
                    style={{
                      transform: 'translate(4px, -2px)',
                      filter: 'drop-shadow(0 0 5px rgba(0,255,255,0.75)) hue-rotate(180deg)',
                    }}
                  />
                </>
              )}

              {/* Main Avatar Image */}
              <img
                src={GLITCH_AVATARS[activeIndex].url}
                alt="Avatar"
                className={`w-full h-full object-contain transition-all ${
                  isGlitching 
                    ? 'filter brightness-125 contrast-125' 
                    : 'filter drop-shadow(0 0 8px rgba(57,255,20,0.25))'
                }`}
                style={{
                  transition: 'filter 0.2s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Bio Text — below avatar on mobile, below all cards on desktop */}
        <div ref={containerRef} className="w-full text-justify lg:text-center max-w-[760px] mx-auto font-sans text-sm md:text-base text-on-surface-variant leading-relaxed select-text relative z-20 order-2 lg:order-4 -mt-28 sm:-mt-40 md:-mt-48 lg:-mt-16 xl:-mt-20 mb-4 sm:mb-6 lg:mb-0">
          {!isClient ? (
            <p className="m-0">{BIO_TEXT}</p>
          ) : (
            <motion.p
              className="m-0"
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {BIO_TEXT}
            </motion.p>
          )}
        </div>

        {/* Desktop: Left Column — 2 Cards (hidden on mobile) */}
        <div className="hidden lg:flex flex-col gap-4 w-[290px] xl:w-[340px] lg:shrink-0 order-1 relative z-10">
          {CARDS.slice(0, 2).map((card) => (
            <SkillCard key={card.title} {...card} />
          ))}
        </div>

        {/* Desktop: Right Column — 2 Cards (hidden on mobile) */}
        <div className="hidden lg:flex flex-col gap-4 w-[290px] xl:w-[340px] lg:shrink-0 order-3 relative z-10">
          {CARDS.slice(2, 4).map((card) => (
            <SkillCard key={card.title} {...card} />
          ))}
        </div>

        {/* Mobile: Cards stacked vertically (hidden on lg+) */}
        <div className="lg:hidden flex flex-col gap-3 w-full order-3">
          {CARDS.map((card) => (
            <SkillCard key={card.title} {...card} />
          ))}
        </div>

      </div>
    </div>
  );
}
