'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Terminal,
  ArrowRight,
  Github,
  Mail,
  Phone,
  MapPin,
  Instagram,
  ShieldCheck,
  AlertCircle,
  Send,
} from 'lucide-react';
import { motion } from 'framer-motion';
import BackgroundRippleEffect from '@/components/ui/BackgroundRippleEffect';
import { supabaseClient } from '@/lib/supabase';
import HorizontalSection from '@/components/HorizontalSection';
import PanelAbout from '@/components/PanelAbout';
import PanelExperience from '@/components/PanelExperience';
import PanelSkills from '@/components/PanelSkills';
import PanelFeaturedWork from '@/components/PanelFeaturedWork';
import PanelFeaturedProject from '@/components/PanelFeaturedProject';

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string | null;
  demo_url: string | null;
  github_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
}

function TypingEffect() {
  const words = [
    'Backend Developer',
    'Frontend Developer',
    'AI Enthusiast',
    'UI/UX Designer',
    'Full Stack Developer',
    'Computer Science Student',
  ];
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    const currentWord = words[wordIndex];
    let typeTimer: NodeJS.Timeout;
    let delayTimer: NodeJS.Timeout;

    if (isDeleting) {
      if (charIndex > 0) {
        typeTimer = setTimeout(() => {
          setText(currentWord.substring(0, charIndex - 1));
          setCharIndex((prev) => prev - 1);
        }, 40);
      } else {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }
    } else {
      if (charIndex < currentWord.length) {
        typeTimer = setTimeout(() => {
          setText(currentWord.substring(0, charIndex + 1));
          setCharIndex((prev) => prev + 1);
        }, 80);
      } else {
        delayTimer = setTimeout(() => setIsDeleting(true), 2000);
      }
    }

    return () => {
      if (typeTimer) clearTimeout(typeTimer);
      if (delayTimer) clearTimeout(delayTimer);
    };
  }, [charIndex, isDeleting, wordIndex]);

  return (
    <span className="text-primary-container">
      {text}
      <span className="typing-cursor">|</span>
    </span>
  );
}

export default function HomePage() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function fetchFeatured() {
      const { data, error } = await supabaseClient
        .from('projects')
        .select('*')
        .eq('is_featured', true)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setFeaturedProjects(data);
      }
    }
    fetchFeatured();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    agreement: false,
  });

  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'SYSTEM: Initializing transmission protocol...',
    'SYSTEM: Connection established on port 443.',
    'SYSTEM: Awaiting guest credentials...',
  ]);

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const addTerminalLog = (msg: string) => {
    setTerminalLogs((prev) => [...prev, msg]);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, agreement: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.message) {
      setStatus('error');
      setErrorMessage('INPUT_ERROR: All fields are required.');
      addTerminalLog('ERROR: Form validation failed. Missing required fields.');
      return;
    }

    if (!formData.agreement) {
      setStatus('error');
      setErrorMessage('INPUT_ERROR: Security agreement checkbox required.');
      addTerminalLog('ERROR: Security clearance rejected. Checkbox not verified.');
      return;
    }

    setStatus('submitting');
    addTerminalLog(`USER: ./submit_message.sh --author="${formData.name}" --subject="${formData.subject}"`);
    addTerminalLog('SYSTEM: Encrypting message payloads...');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      addTerminalLog('SYSTEM: Transferring bits to remote server...');
      await new Promise((resolve) => setTimeout(resolve, 800));
      addTerminalLog('SYSTEM: [OK] Message sent successfully. Handshake complete.');
      setStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        agreement: false,
      });
    } catch (err) {
      addTerminalLog('SYSTEM: [FAIL] Handshake interrupted. Packet loss detected.');
      setStatus('error');
      setErrorMessage('TRANSMISSION_ERROR: Connection timed out.');
    }
  };

  // Desktop: About + individual project parallax panels + view-all
  // Experience & Skills are placed BELOW as vertical full-screen sections on desktop
  const panels = useMemo(
    () => [
      { id: 'about', content: <PanelAbout /> },
      ...featuredProjects.map((p) => ({
        id: `project-${p.id}`,
        content: <PanelFeaturedProject key={p.id} project={p} />,
      })),
      {
        id: 'view-all',
        content: (
          <div className="relative w-full h-full flex flex-col items-center justify-center gap-6 px-margin-mobile md:px-margin-desktop overflow-hidden">
            <BackgroundRippleEffect onCellClick={() => {}} />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <span className="font-mono text-[10px] md:text-xs tracking-[0.25em] text-primary-container uppercase">
                EXPLORE MORE
              </span>
              <h2 className="font-mono text-2xl md:text-4xl lg:text-5xl text-on-surface text-center leading-tight tracking-tight">
                Want to see the full collection?
              </h2>
              <p className="font-sans text-sm md:text-base text-on-surface-variant text-center max-w-lg">
                Browse all projects, filter by category, and dive into the details.
              </p>
              <Link
                href="/portofolio"
                className="btn-neon inline-flex items-center gap-2 mt-4 text-sm md:text-base"
              >
                <span>VIEW ALL PROJECTS</span>
                <ArrowRight className="w-4 h-4" />
            </Link>
            </div>
          </div>
        ),
      },
    ],
    [featuredProjects]
  );

  // Mobile: all panels stacked — experience & skills included
  const mobilePanels = useMemo(
    () => [
      { id: 'about', content: <PanelAbout /> },
      { id: 'experience', content: <PanelExperience /> },
      { id: 'skills', content: <PanelSkills /> },
      {
        id: 'featured-work',
        content: <PanelFeaturedWork projects={featuredProjects} />,
      },
    ],
    [featuredProjects]
  );

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full min-h-screen relative flex flex-col justify-center items-center py-16 px-6 overflow-hidden bg-background">
        <BackgroundRippleEffect
          onCellClick={() => window.dispatchEvent(new CustomEvent('music:hero-play'))}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col items-center text-center gap-6 max-w-2xl px-2"
        >
          <h1 className="font-mono text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-on-background">
            Hi, I&apos;m{' '}
            <span className="text-primary-container drop-shadow-[0_0_15px_rgba(57,255,20,0.3)]">
              Aufan Taufiqurrahman
            </span>
          </h1>

          <h2 className="font-mono text-xl md:text-3xl text-on-surface-variant font-medium mt-2">
            I&apos;m a <TypingEffect />
          </h2>

          <p className="font-sans text-base md:text-lg text-outline max-w-2xl mt-4 leading-relaxed">
            Informatics Student, Web Developer, and Tech Enthusiast. Building performant, clean, and
            secure web applications with high-fidelity coding style.
          </p>

          <div className="flex flex-wrap gap-4 mt-8 justify-center">
            <a href="#contact" className="btn-neon flex items-center gap-2">
              <span>&gt; Hire me</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/AufanT"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon-outline flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              <span>View Source</span>
            </a>
          </div>
        </motion.div>
      </section>

      {/* Horizontal Scroll Section — About, Featured Projects */}
      <HorizontalSection key={featuredProjects.length} panels={panels} mobilePanels={mobilePanels} />

      {/* Experience Log — desktop only (≥1024px), vertical full-screen section below horizontal scroll */}
      <section className="hidden lg:flex w-full min-h-screen items-center bg-background">
        <PanelExperience />
      </section>

      {/* System Capabilities — desktop only (≥1024px), vertical full-screen section */}
      <section className="hidden lg:flex w-full min-h-screen items-center bg-background">
        <PanelSkills />
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="w-full max-w-container-max px-margin-mobile md:px-margin-desktop py-12 md:py-16 lg:py-20 flex flex-col gap-10 scroll-mt-20"
      >
        {/* Header */}
        <div className="border-l-4 border-primary-container pl-6 py-2">
          <h2 className="font-mono text-3xl md:text-4xl lg:text-5xl text-on-surface tracking-tight">
            Get in touch <span className="text-primary-container opacity-80 animate-pulse">_</span>
          </h2>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="glass-panel p-8 flex-grow flex flex-col border border-outline-variant/30 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-container/5 rounded-full blur-2xl pointer-events-none" />

              <h3 className="font-mono text-xl text-white mb-6 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary-container" />
                CONTACT_INFO
              </h3>

              <p className="font-sans text-sm md:text-base text-on-surface-variant mb-8 leading-relaxed">
                Punya pertanyaan atau penawaran kerjasama? Jangan ragu untuk menghubungi saya melalui
                kontak di bawah ini.
              </p>

              <div className="space-y-6 flex-grow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded border border-primary-container/20 bg-primary-container/5 flex items-center justify-center text-primary-container shadow-[0_0_10px_rgba(57,255,20,0.1)]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-mono text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                      Location
                    </h4>
                    <p className="font-sans text-sm text-white mt-0.5">
                      Padang, Sumatera Barat, Indonesia
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded border border-primary-container/20 bg-primary-container/5 flex items-center justify-center text-primary-container shadow-[0_0_10px_rgba(57,255,20,0.1)]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-mono text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                      Email
                    </h4>
                    <p className="font-sans text-sm text-white mt-0.5">
                      aufantaufiq08905@gmail.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded border border-primary-container/20 bg-primary-container/5 flex items-center justify-center text-primary-container shadow-[0_0_10px_rgba(57,255,20,0.1)]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-mono text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                      Phone / WhatsApp
                    </h4>
                    <p className="font-sans text-sm text-white mt-0.5">+62 895 0862 7517</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-6 border-t border-outline-variant/20">
                <h4 className="font-mono text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-4">
                  Follow Me
                </h4>
                <div className="flex gap-4">
                  <a
                    href="https://github.com/AufanT"
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded border border-outline-variant/30 hover:border-primary-container/50 hover:text-primary-container flex items-center justify-center transition-colors hover:shadow-[0_0_10px_rgba(57,255,20,0.2)]"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.instagram.com/aufant_/"
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded border border-outline-variant/30 hover:border-primary-container/50 hover:text-primary-container flex items-center justify-center transition-colors hover:shadow-[0_0_10px_rgba(57,255,20,0.2)]"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Terminal Form */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="glass-panel border border-outline-variant/30 overflow-hidden flex flex-col h-full"
            >
              <div className="bg-surface-container-high px-4 py-3 flex items-center justify-between border-b border-outline-variant/30">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                </div>
                <span className="font-mono text-xs text-on-surface-variant font-semibold">
                  contact@aufan: ~/send_message
                </span>
                <Terminal className="w-4 h-4 text-on-surface-variant/40" />
              </div>

              <div className="bg-black/80 px-6 py-4 font-mono text-xs text-on-surface-variant/90 border-b border-outline-variant/20 max-h-[160px] overflow-y-auto space-y-1.5 scrollbar-thin">
                {terminalLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={
                      log.includes('ERROR')
                        ? 'text-red-400'
                        : log.includes('[OK]')
                          ? 'text-primary-container'
                          : ''
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 flex-grow">
                {status === 'success' && (
                  <div className="border border-primary-container/30 bg-primary-container/5 rounded p-4 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-primary-container flex-shrink-0" />
                    <div>
                      <h4 className="font-mono text-sm text-primary-container font-bold">
                        TRANSMISSION_SUCCESS
                      </h4>
                      <p className="font-sans text-xs text-on-surface-variant/90 mt-1">
                        Pesan Anda berhasil dienkripsi dan dikirim ke server. Terima kasih!
                      </p>
                    </div>
                  </div>
                )}

                {status === 'error' && (
                  <div className="border border-red-500/30 bg-red-500/5 rounded p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div>
                      <h4 className="font-mono text-sm text-red-500 font-bold">
                        TRANSMISSION_ERROR
                      </h4>
                      <p className="font-sans text-xs text-on-surface-variant/90 mt-1">
                        {errorMessage}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your Name"
                      disabled={status === 'submitting'}
                      className="command-input"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Your Email"
                      disabled={status === 'submitting'}
                      className="command-input"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="phone"
                      className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block"
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone Number"
                      disabled={status === 'submitting'}
                      className="command-input"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      disabled={status === 'submitting'}
                      className="command-input appearance-none"
                      required
                    >
                      <option value="" disabled>
                        Select Subject
                      </option>
                      <option value="project">Tawaran Project</option>
                      <option value="collab">Kolaborasi</option>
                      <option value="hiring">Recruitment</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="font-mono text-xs text-on-surface-variant font-bold mb-1.5 block"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Leave a message..."
                    disabled={status === 'submitting'}
                    className="command-input min-h-[120px] resize-y"
                    required
                  />
                </div>

                <div className="flex items-start gap-2.5 pt-2">
                  <input
                    type="checkbox"
                    id="agreement"
                    checked={formData.agreement}
                    onChange={handleCheckboxChange}
                    disabled={status === 'submitting'}
                    className="mt-1 rounded bg-black border border-outline-variant focus:ring-primary-container/30 text-primary-container"
                    required
                  />
                  <label
                    htmlFor="agreement"
                    className="font-sans text-xs text-on-surface-variant leading-relaxed select-none cursor-pointer"
                  >
                    I verify that this request is secure and I agree to the terms and conditions.
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="btn-neon w-full py-3 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    {status === 'submitting' ? 'TRANSMITTING...' : 'SEND_MESSAGE'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl overflow-hidden border border-outline-variant/30 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.271891902886!2d100.35245807496515!3d-0.9482565990426181!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2fd4b942e2b117bb%3A0x5821721590e82877!2sUniversitas%20Andalas!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
            width="100%"
            height="400"
            style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(1.1)' }}
            allowFullScreen
            loading="lazy"
            title="Universitas Andalas Location Map"
          />
        </motion.div>
      </section>
    </div>
  );
}
