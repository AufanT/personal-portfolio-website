'use client';

const experience = {
  professional: [
    {
      role: 'Frontend Developer Intern',
      company: 'CyberCorp Inc.',
      period: '2023',
      bullets: [
        'Developed responsive UI components using React and Tailwind CSS.',
        'Optimized application performance and load times by 20%.',
        'Collaborated with backend teams on REST API integration.',
      ],
    },
  ],
  organizational: [
    {
      role: 'Head of Web Development',
      company: 'Informatics Student Union',
      period: '2022 - 2023',
      bullets: [
        'Led a team of 5 developers to rebuild the student union portal.',
        'Organized tech workshops for 100+ students covering HTML, CSS, and JS basics.',
      ],
    },
  ],
};

export default function PanelExperience() {
  return (
    <div className="w-full px-5 sm:px-8 md:px-margin-desktop max-w-container-max mx-auto">
      <div className="flex flex-col gap-6 md:gap-10 w-full">
        {/* Section Header */}
        <div className="border-l-4 border-primary-container pl-4 md:pl-6 py-2">
          <span className="font-mono text-[10px] md:text-xs tracking-[0.25em] text-primary-container uppercase">
            EXPERIENCE
          </span>
          <h2 className="font-mono text-2xl md:text-4xl lg:text-5xl text-on-surface mt-2 leading-tight tracking-tight">
            Experience Log <span className="text-primary-container animate-pulse">_</span>
          </h2>
        </div>

        {/* Experience Cards Grid — stack on mobile, side by side on md */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Professional */}
          <div className="glass-panel p-5 md:p-8">
            <h3 className="font-mono text-xs text-primary-container uppercase tracking-widest border-b border-outline-variant/10 pb-2 mb-4">
              // Professional
            </h3>
            <div className="flex flex-col gap-5">
              {experience.professional.map((exp) => (
                <div key={exp.role} className="flex flex-col gap-1">
                  <h4 className="font-mono text-sm md:text-base text-on-background font-bold leading-snug">
                    &gt; {exp.role}
                  </h4>
                  <p className="font-mono text-xs text-primary-container/80">
                    @ {exp.company} [{exp.period}]
                  </p>
                  <ul className="list-disc list-inside mt-2.5 text-sm text-on-surface-variant font-sans space-y-1.5 leading-relaxed">
                    {exp.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Organizational */}
          <div className="glass-panel p-5 md:p-8">
            <h3 className="font-mono text-xs text-primary-container uppercase tracking-widest border-b border-outline-variant/10 pb-2 mb-4">
              // Organizational
            </h3>
            <div className="flex flex-col gap-5">
              {experience.organizational.map((exp) => (
                <div key={exp.role} className="flex flex-col gap-1">
                  <h4 className="font-mono text-sm md:text-base text-on-background font-bold leading-snug">
                    &gt; {exp.role}
                  </h4>
                  <p className="font-mono text-xs text-primary-container/80">
                    @ {exp.company} [{exp.period}]
                  </p>
                  <ul className="list-disc list-inside mt-2.5 text-sm text-on-surface-variant font-sans space-y-1.5 leading-relaxed">
                    {exp.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
