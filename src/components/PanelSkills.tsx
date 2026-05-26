'use client';

import { Cpu } from 'lucide-react';

const capabilities = [
  {
    category: 'Languages',
    skills: ['JavaScript / TS', 'Python', 'HTML/CSS', 'C++', 'SQL'],
  },
  {
    category: 'Frameworks & Libraries',
    skills: ['React', 'Node.js', 'Tailwind CSS', 'Next.js', 'Express'],
  },
  {
    category: 'Tools & Systems',
    skills: ['Git / GitHub', 'Linux / Bash', 'Cybersecurity', 'Docker', 'Figma'],
  },
];

export default function PanelSkills() {
  return (
    <div className="w-full px-5 sm:px-8 md:px-margin-desktop max-w-container-max mx-auto">
      <div className="flex flex-col gap-6 md:gap-10 w-full">
        {/* Section Header */}
        <div className="border-l-4 border-primary-container pl-4 md:pl-6 py-2">
          <span className="font-mono text-[10px] md:text-xs tracking-[0.25em] text-primary-container uppercase">
            SKILLS
          </span>
          <h2 className="font-mono text-2xl md:text-4xl lg:text-5xl text-on-surface mt-2 leading-tight tracking-tight">
            System Capabilities <span className="text-primary-container animate-pulse">_</span>
          </h2>
        </div>

        {/* Skill cards — 1 col on mobile, 3 cols on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {capabilities.map((cap) => (
            <div
              key={cap.category}
              className="glass-panel p-5 md:p-7 flex flex-col gap-4 hover:border-primary-container/40 hover:shadow-neon transition-all duration-300"
            >
              {/* Card header */}
              <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-3">
                <Cpu className="w-4 h-4 md:w-5 md:h-5 text-primary-container shrink-0" />
                <h3 className="font-mono text-sm md:text-base text-on-background font-bold">
                  {cap.category}
                </h3>
              </div>

              {/* Skill tags — horizontal scroll on mobile, wrap on desktop */}
              <div className="flex flex-row md:flex-wrap gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                {cap.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 font-mono text-xs bg-surface-container-high border border-outline-variant hover:border-primary-container/50 hover:text-primary-container rounded transition-all duration-300 whitespace-nowrap shrink-0 md:shrink"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
