import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import {
  FiArrowRight, FiBarChart2, FiCheck, FiCode, FiCreditCard,
  FiGlobe, FiGrid, FiLayers, FiLayout, FiMail, FiMapPin,
  FiMenu, FiMonitor, FiMoon, FiSearch, FiStar, FiSun,
  FiUsers, FiX, FiZap, FiBox, FiCpu, FiDatabase,
  FiServer, FiShield, FiTerminal, FiPlay, FiChevronRight,
  FiClock, FiHeadphones
} from "react-icons/fi";

/* ═══════════════════════════════════════════════════
   THEME CONTEXT
   ═══════════════════════════════════════════════════ */
function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("lp-theme") || "dark";
    return "dark";
  });

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("lp-theme", next);
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    return () => document.documentElement.removeAttribute("data-theme");
  }, [theme]);

  return { theme, toggle };
}

/* ═══════════════════════════════════════════════════
   REUSABLE HELPERS
   ═══════════════════════════════════════════════════ */
function Section({ children, className = "", id, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.section
      ref={ref} id={id} className={`relative py-24 lg:py-36 ${className}`}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}

function SectionEyebrow({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.25em]"
      style={{ border: "1px solid var(--lp-border-strong)", color: "var(--lp-accent)", background: "var(--lp-bg-card)", backdropFilter: "blur(12px)" }}>
      {children}
    </span>
  );
}

function SectionTitle({ children, className = "" }) {
  return (
    <h2 className={`font-display mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[4rem] ${className}`}
      style={{ color: "var(--lp-text)" }}>
      {children}
    </h2>
  );
}

function SectionSub({ children }) {
  return (
    <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl"
      style={{ color: "var(--lp-text-secondary)" }}>
      {children}
    </p>
  );
}

/* ═══════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════ */
function Navbar({ theme, toggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Fitur", href: "#fitur" },
    { label: "Cara Kerja", href: "#cara-kerja" },
    { label: "Harga", href: "#harga" },
    { label: "Tentang", href: "#tentang" },
  ];

  return (
    <nav className="fixed inset-x-0 top-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "var(--lp-bg-nav)" : "transparent",
        backdropFilter: scrolled ? "blur(24px) saturate(1.8)" : "none",
        borderBottom: scrolled ? "1px solid var(--lp-border)" : "1px solid transparent",
      }}>
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-8">
        <a href="#" className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-white/10">
            <img src="/logo.png" alt="InstaWeb Logo" className="absolute inset-0 h-full w-full object-cover" 
                 onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'grid'; }} />
            <div className="hidden h-full w-full place-items-center bg-gradient-to-br from-[#59f0d9] to-[#b5f36d]">
               <FiGrid className="h-5 w-5 text-ink-950" />
            </div>
          </div>
          <span className="font-display text-2xl font-extrabold tracking-tight" style={{ color: "var(--lp-text)" }}>
            Insta<span className="gradient-text">Web</span>
          </span>
        </a>

        <div className="hidden items-center gap-2 lg:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}
              className="rounded-full px-5 py-2 text-sm font-semibold transition-all hover:bg-white/5"
              style={{ color: "var(--lp-text-secondary)" }}
              onMouseEnter={(e) => { e.target.style.color = "var(--lp-text)"; }}
              onMouseLeave={(e) => { e.target.style.color = "var(--lp-text-secondary)"; }}>
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          {/* Google Translate Element */}
          <div id="google_translate_element" className="h-8 flex items-center"></div>
          
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Ganti Tema">
            <div className="theme-toggle-thumb">
              {theme === "dark" ? <FiMoon className="h-3 w-3 text-ink-950" /> : <FiSun className="h-3 w-3 text-white" />}
            </div>
          </button>
          <Link to="/login" className="text-sm font-semibold transition hover:opacity-70" style={{ color: "var(--lp-text)" }}>
            Masuk
          </Link>
          <Link to="/register" className="btn-press rounded-full px-6 py-2.5 text-sm font-bold text-ink-950"
            style={{ background: `var(--lp-text)` }}>
            Mulai Gratis
          </Link>
        </div>

        <div className="flex items-center gap-4 lg:hidden">
          <div id="google_translate_element" className="hidden sm:block"></div>
          <button onClick={toggleTheme} className="theme-toggle"><div className="theme-toggle-thumb" /></button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="grid h-10 w-10 place-items-center" style={{ color: "var(--lp-text)" }}>
            {mobileOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="absolute top-[72px] inset-x-0 p-6 border-b shadow-xl" style={{ background: "var(--lp-bg-nav)", backdropFilter: "blur(24px)", borderColor: "var(--lp-border)" }}
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-lg font-bold" style={{ color: "var(--lp-text)" }} onClick={() => setMobileOpen(false)}>
                  {link.label}
                </a>
              ))}
              <hr style={{ borderColor: "var(--lp-border)" }} className="my-2" />
              <Link to="/login" className="text-lg font-bold" style={{ color: "var(--lp-text)" }}>Masuk</Link>
              <Link to="/register" className="mt-2 text-center rounded-xl py-3 font-bold text-ink-950" style={{ background: "var(--lp-accent)" }}>Mulai Gratis</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════
   HERO — INTERACTIVE 3D
   ═══════════════════════════════════════════════════ */
function Interactive3DHero() {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const { scrollY } = useScroll();
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [25, -25]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-25, 25]), { stiffness: 150, damping: 20 });
  const scrollY3D = useTransform(scrollY, [0, 1000], [0, -150]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x); mouseY.set(y);
  };

  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  return (
    <div ref={containerRef} className="scene-3d relative w-full h-[500px] flex items-center justify-center cursor-crosshair" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <motion.div className="iso-wrapper relative w-[360px] h-[360px]" style={{ rotateX, rotateY, rotateZ: -45, y: scrollY3D }}>
        <div className="iso-grid-floor" />
        <div className="block-3d absolute bottom-0 left-0 w-[280px] h-[280px]" style={{ "--depth": "12px" }}>
           <div className="absolute inset-4 border border-dashed opacity-20" style={{ borderColor: "var(--lp-text)" }} />
        </div>
        <motion.div className="block-3d absolute left-[20px] top-[40px] w-[140px] h-[90px]" style={{ "--depth": "6px", background: "var(--lp-bg-nav)" }} animate={{ z: [30, 45, 30] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
          <div className="p-3">
            <div className="flex gap-1.5 mb-3">
              <div className="h-2 w-2 rounded-full" style={{ background: "var(--lp-accent-3)" }} />
              <div className="h-2 w-2 rounded-full" style={{ background: "var(--lp-accent-4)" }} />
            </div>
            <div className="h-1.5 w-3/4 rounded mb-2" style={{ background: "var(--lp-border-strong)" }} />
            <div className="h-1.5 w-1/2 rounded" style={{ background: "var(--lp-border)" }} />
          </div>
        </motion.div>
        <motion.div className="block-3d absolute right-[20px] bottom-[20px] w-[200px] h-[160px] overflow-hidden" style={{ "--depth": "16px", background: "var(--lp-bg-card)" }} animate={{ z: [60, 75, 60] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
          <div className="h-6 border-b flex items-center px-3" style={{ borderColor: "var(--lp-border)", background: "var(--lp-bg-secondary)" }}>
            <span className="text-[8px] font-bold tracking-widest uppercase" style={{ color: "var(--lp-text-muted)" }}>Dasbor Utama</span>
          </div>
          <div className="p-3 grid gap-2">
            <div className="h-12 rounded-lg" style={{ background: "linear-gradient(135deg, var(--lp-accent) 0%, transparent 100%)", opacity: 0.3 }} />
            <div className="flex gap-2">
              <div className="h-8 flex-1 rounded-lg" style={{ background: "var(--lp-border-strong)" }} />
              <div className="h-8 flex-1 rounded-lg" style={{ background: "var(--lp-border-strong)" }} />
            </div>
          </div>
        </motion.div>
        <motion.div className="block-3d absolute right-[-20px] top-[10px] w-[120px] h-[120px] flex items-center justify-center" style={{ "--depth": "24px", background: "var(--lp-accent-3)" }} animate={{ z: [100, 110, 100], rotateZ: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
          <FiBarChart2 className="w-12 h-12" style={{ color: "var(--lp-text)" }} />
        </motion.div>
        <motion.div className="absolute left-[180px] top-[100px] w-4 h-4" style={{ background: "var(--lp-text)" }} animate={{ z: [150, 180, 150], rotateX: [0, 180], rotateY: [0, 180] }} transition={{ duration: 3, repeat: Infinity }} />
        <motion.div className="absolute left-[80px] top-[200px] w-3 h-3 rounded-full" style={{ background: "var(--lp-accent-2)" }} animate={{ z: [80, 120, 80] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} />
        
        {/* Extra Parallax Floating Elements */}
        <motion.div className="block-3d absolute right-[80px] top-[20px] w-[40px] h-[40px]" style={{ "--depth": "10px", background: "var(--lp-accent)" }} animate={{ z: [40, 90, 40], rotateX: [0, 360], rotateY: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} />
        <motion.div className="block-3d absolute left-[200px] bottom-[-20px] w-[60px] h-[60px] rounded-full" style={{ "--depth": "8px", background: "var(--lp-accent-4)" }} animate={{ z: [20, 50, 20], rotateZ: [0, 180] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} />
      </motion.div>
    </div>
  );
}

function Hero() {
  const { scrollY } = useScroll();
  const bgY1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const bgY2 = useTransform(scrollY, [0, 1000], [0, -200]);
  const textY = useTransform(scrollY, [0, 600], [0, 150]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section className="relative min-h-screen overflow-hidden pt-28 lg:pt-36 flex items-center">
      {/* Background Parallax Orbs */}
      <motion.div style={{ y: bgY1, opacity }} className="absolute -top-40 -right-40 w-96 h-96 bg-teal-400/20 blur-[120px] rounded-full pointer-events-none" />
      <motion.div style={{ y: bgY2, opacity }} className="absolute top-40 -left-40 w-96 h-96 bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 w-full">
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_1fr]">
          <motion.div className="max-w-2xl" style={{ y: textY, opacity }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <SectionEyebrow>Website Builder #1 Indonesia</SectionEyebrow>
            </motion.div>
            <motion.h1 
              className="font-display mt-8 text-[3rem] font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.5rem]"
              style={{ color: "var(--lp-text)" }}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            >
              Platform cerdas untuk tim <br/>
              <span className="gradient-text">super cepat.</span>
            </motion.h1>
            <motion.p 
              className="mt-6 text-lg sm:text-xl leading-relaxed" style={{ color: "var(--lp-text-secondary)" }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            >
              InstaWeb dirancang dengan standar arsitektur modern. Buat, kelola, dan luncurkan website profesional dalam hitungan menit. Tanpa perlu coding sama sekali.
            </motion.p>
            <motion.div 
              className="mt-10 flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            >
              <Link to="/register" className="btn-press flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold text-ink-950 transition-transform"
                style={{ background: "var(--lp-text)", boxShadow: "0 10px 30px var(--lp-shadow-glow)" }}>
                Mulai Membangun <FiArrowRight />
              </Link>
              <a href="#fitur" className="btn-press flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold transition-all hover:bg-white/5"
                style={{ border: "1px solid var(--lp-border-strong)", color: "var(--lp-text)" }}>
                Lihat Semua Fitur
              </a>
            </motion.div>
          </motion.div>
          <motion.div style={{ opacity }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }}>
            <Interactive3DHero />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   MEDIA PARTNERS MARQUEE
   ═══════════════════════════════════════════════════ */
const PARTNERS = [ "Kompas", "TechInAsia", "Detik", "DailySocial", "StartupStudio", "AWS", "Google Cloud", "Midtrans" ];

function Marquee() {
  return (
    <div className="py-10 border-y overflow-hidden relative" style={{ borderColor: "var(--lp-border)", background: "var(--lp-bg-card)" }}>
      <div className="absolute inset-y-0 left-0 w-32 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg, var(--lp-bg-card), transparent)" }} />
      <div className="absolute inset-y-0 right-0 w-32 z-10 pointer-events-none" style={{ background: "linear-gradient(270deg, var(--lp-bg-card), transparent)" }} />
      <div className="marquee-track">
        {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((p, i) => (
          <div key={i} className="mx-12 font-display text-xl font-bold tracking-tight opacity-40 hover:opacity-100 transition-opacity" style={{ color: "var(--lp-text)" }}>
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   BENTO GRID — 6 FEATURES
   ═══════════════════════════════════════════════════ */
const FEATURES = [
  { icon: FiLayout, title: "Visual Editor Super Ringan", desc: "Bangun halaman dengan editor visual drag-and-drop yang sangat cepat dan intuitif. Tanpa menulis kode sebaris pun.", span: "col-span-1 md:col-span-2", color: "var(--lp-accent)" },
  { icon: FiLayers, title: "22+ Template Premium", desc: "Mulai proyek Anda menggunakan koleksi template berdesain profesional yang 100% responsif.", span: "col-span-1", color: "var(--lp-accent-3)" },
  { icon: FiBarChart2, title: "Dasbor Analitik Mendalam", desc: "Pantau pengunjung aktif, durasi sesi, dan performa halaman langsung dari satu dasbor canggih.", span: "col-span-1", color: "var(--lp-accent-4)" },
  { icon: FiUsers, title: "Kolaborasi Tim Real-time", desc: "Undang anggota tim dan bangun website bersama dalam satu ruang kerja kolaboratif secara instan.", span: "col-span-1 md:col-span-2", color: "var(--lp-accent-2)" },
  { icon: FiSearch, title: "Otomasi SEO Tingkat Lanjut", desc: "Meta tags, peta situs (sitemap), dan microdata langsung dikonfigurasi untuk mesin pencari.", span: "col-span-1", color: "var(--lp-accent)" },
  { icon: FiCreditCard, title: "Pembayaran Midtrans Terintegrasi", desc: "Terima pembayaran QRIS, e-Wallet, dan Virtual Account langsung tanpa setup plugin yang merepotkan.", span: "col-span-1 md:col-span-2", color: "var(--lp-accent-3)" },
];

function FeaturesBentoGrid() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [150, -150]);
  const y3 = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const parallax = [y1, y2, y3, y2, y1, y3];

  return (
    <Section id="fitur">
      <div ref={ref} className="mx-auto max-w-7xl px-6 relative">
        <div className="text-center max-w-2xl mx-auto relative z-10">
          <SectionEyebrow><FiZap className="inline mr-2" /> Modul & Fitur Unggulan</SectionEyebrow>
          <SectionTitle>Bukan sekadar <br/><span className="gradient-text">drag & drop.</span></SectionTitle>
          <SectionSub>InstaWeb menyatukan seluruh infrastruktur yang Anda butuhkan untuk membangun, mempublikasikan, dan mengembangkan bisnis online dalam satu tempat.</SectionSub>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} className={`glass-plaque p-8 ${f.span}`}
                style={{ y: parallax[i] }}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8 }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: `color-mix(in srgb, ${f.color} 15%, transparent)` }}>
                   <Icon className="w-6 h-6" style={{ color: f.color }} />
                </div>
                <h3 className="font-display text-2xl font-bold mb-3">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--lp-text-secondary)" }}>{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════
   HOW IT WORKS — 3D PIPELINE
   ═══════════════════════════════════════════════════ */
function WorkflowPipeline() {
  const steps = [
    { num: "01", title: "Daftar Akun", desc: "Buat ruang kerja baru tanpa perlu setup server.", icon: FiUsers },
    { num: "02", title: "Rancang Desain", desc: "Gunakan editor visual dan template premium kami.", icon: FiLayout },
    { num: "03", title: "Publikasi Global", desc: "Satu klik untuk mengudara di jaringan tepi (Edge) kami.", icon: FiGlobe }
  ];

  return (
    <Section id="cara-kerja" className="bg-black/20 border-y" style={{ borderColor: "var(--lp-border)" }}>
      <div className="mx-auto max-w-7xl px-6 text-center">
        <SectionEyebrow>Alur Kerja</SectionEyebrow>
        <SectionTitle>Dirancang untuk <span className="gradient-text">Kecepatan</span></SectionTitle>
        <SectionSub>Proses launching website terpangkas dari hitungan minggu menjadi beberapa menit saja.</SectionSub>
        
        <div className="mt-20 grid md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[1px]" style={{ background: "var(--lp-border-strong)" }}>
             <motion.div className="h-full" style={{ background: "var(--lp-accent)" }}
               initial={{ width: "0%" }} whileInView={{ width: "100%" }} transition={{ duration: 1.5, ease: "easeInOut" }} viewport={{ once: true }} />
          </div>

          {steps.map((s, i) => (
            <motion.div key={i} className="relative z-10 flex flex-col items-center" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i*0.2 }}>
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-xl" style={{ background: "var(--lp-bg-card)", border: "1px solid var(--lp-border)", boxShadow: "0 20px 40px var(--lp-shadow)" }}>
                <s.icon className="w-10 h-10" style={{ color: "var(--lp-text)" }} />
              </div>
              <span className="font-mono text-xs mb-3 font-bold tracking-widest" style={{ color: "var(--lp-text-muted)" }}>LANGKAH {s.num}</span>
              <h3 className="text-xl font-bold font-display mb-2" style={{ color: "var(--lp-text)" }}>{s.title}</h3>
              <p className="text-sm max-w-[200px]" style={{ color: "var(--lp-text-secondary)" }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════
   COMPARISON SECTION (REDESIGNED: PROFESSIONAL & DETAILED)
   ═══════════════════════════════════════════════════ */
const COMPARISONS = [
  { 
    icon: FiClock, title: "Kecepatan Setup", 
    us: "Siap dalam hitungan menit.", 
    them: "Butuh berhari-hari instalasi." 
  },
  { 
    icon: FiCreditCard, title: "Sistem Pembayaran", 
    us: "Otomatis terhubung Midtrans.", 
    them: "Harus install plugin & API rumit." 
  },
  { 
    icon: FiServer, title: "Hosting & Server", 
    us: "Cloud Managed & Cepat (Otomatis).", 
    them: "Beli terpisah & maintenance mandiri." 
  },
  { 
    icon: FiShield, title: "Keamanan & SSL", 
    us: "Otomatis HTTPS Terenkripsi.", 
    them: "Sertifikat harus diurus manual." 
  },
  { 
    icon: FiHeadphones, title: "Dukungan (Support)", 
    us: "Tim ahli lokal yang responsif.", 
    them: "Hanya lewat forum komunitas luas." 
  },
];

function Compare() {
  return (
    <Section className="border-t" style={{ borderColor: "var(--lp-border)" }}>
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <SectionEyebrow>Kenapa InstaWeb?</SectionEyebrow>
          <SectionTitle>Era baru pembuatan <span className="gradient-text">Website.</span></SectionTitle>
          <SectionSub>Tinggalkan cara lama yang penuh konfigurasi membingungkan. InstaWeb memberikan fondasi kuat kelas enterprise yang langsung siap digunakan tanpa beban teknis.</SectionSub>
        </div>

        <div className="glass-plaque overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-6 font-display text-lg opacity-60 w-1/3 border-b" style={{ borderColor: "var(--lp-border)" }}>Fitur / Kelebihan</th>
                  <th className="p-6 font-display text-xl font-bold border-b relative" style={{ borderColor: "var(--lp-border)", background: "color-mix(in srgb, var(--lp-accent) 5%, transparent)" }}>
                    <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "var(--lp-accent)" }} />
                    <div className="flex items-center gap-2"><FiCheck className="w-5 h-5" style={{ color: "var(--lp-accent)" }} /> InstaWeb</div>
                  </th>
                  <th className="p-6 font-display text-lg opacity-60 border-b" style={{ borderColor: "var(--lp-border)" }}>WordPress / Wix</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--lp-border)" }}>
                {COMPARISONS.map((item, idx) => (
                  <tr key={idx} className="group transition-colors hover:bg-white/[0.02]">
                    <td className="p-6">
                      <div className="flex items-center gap-3 font-bold">
                        <item.icon className="w-5 h-5" style={{ color: "var(--lp-text-muted)" }} />
                        {item.title}
                      </div>
                    </td>
                    <td className="p-6 font-medium relative" style={{ background: "color-mix(in srgb, var(--lp-accent) 2%, transparent)" }}>
                      <div className="absolute inset-y-0 left-0 w-[1px]" style={{ background: "var(--lp-accent)", opacity: 0.2 }} />
                      <div className="absolute inset-y-0 right-0 w-[1px]" style={{ background: "var(--lp-accent)", opacity: 0.2 }} />
                      <span style={{ color: "var(--lp-text)" }}>{item.us}</span>
                    </td>
                    <td className="p-6 text-sm" style={{ color: "var(--lp-text-muted)" }}>
                      {item.them}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════
   PRICING
   ═══════════════════════════════════════════════════ */
function Pricing() {
  return (
    <Section id="harga" className="bg-black/20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto">
          <SectionEyebrow>Paket & Harga</SectionEyebrow>
          <SectionTitle>Harga transparan, tanpa <span className="gradient-text-rose">kejutan.</span></SectionTitle>
        </div>

        <div className="mt-20 grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto scene-3d">
          
          <div className="glass-plaque p-8 flex flex-col justify-between">
            <div>
              <h3 className="font-display text-xl font-bold mb-2">Pemula (Gratis)</h3>
              <p className="text-sm mb-6" style={{ color: "var(--lp-text-secondary)" }}>Mulai bangun website pertama Anda tanpa biaya apapun.</p>
              <div className="text-4xl font-extrabold font-display tracking-tight mb-8">Rp 0</div>
              <ul className="space-y-4 mb-8 text-sm">
                <li className="flex items-center gap-3 font-medium"><FiCheck style={{ color: "var(--lp-accent)" }} /> 5 Halaman Maksimal</li>
                <li className="flex items-center gap-3 font-medium"><FiCheck style={{ color: "var(--lp-accent)" }} /> 22+ Template Modern</li>
                <li className="flex items-center gap-3 font-medium"><FiCheck style={{ color: "var(--lp-accent)" }} /> Subdomain InstaWeb</li>
              </ul>
            </div>
            <Link to="/register" className="btn-press w-full py-4 text-center rounded-xl text-sm font-bold border transition-colors hover:bg-white/5" style={{ borderColor: "var(--lp-border-strong)", color: "var(--lp-text)" }}>Mulai Gratis</Link>
          </div>

          <div className="glass-plaque p-8 flex flex-col justify-between relative overflow-hidden" style={{ borderColor: "var(--lp-accent)" }}>
            <div className="absolute top-0 right-0 p-4"><span className="text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full" style={{ background: "var(--lp-text)", color: "var(--lp-bg)" }}>Populer</span></div>
            <div>
              <h3 className="font-display text-xl font-bold mb-2">Kreator (Plus)</h3>
              <p className="text-sm mb-6" style={{ color: "var(--lp-text-secondary)" }}>Pilihan tepat untuk portofolio dan bisnis skala kecil.</p>
              <div className="text-4xl font-extrabold font-display tracking-tight mb-2 flex items-baseline">
                Rp 150<span className="text-xl ml-1" style={{ color: "var(--lp-text-muted)" }}>rb</span>
              </div>
              <div className="text-xs uppercase tracking-widest mb-8 font-bold" style={{ color: "var(--lp-text-muted)" }}>Per Bulan</div>
              <ul className="space-y-4 mb-8 text-sm">
                <li className="flex items-center gap-3 font-medium"><FiCheck style={{ color: "var(--lp-accent)" }} /> Halaman Tak Terbatas</li>
                <li className="flex items-center gap-3 font-medium"><FiCheck style={{ color: "var(--lp-accent)" }} /> Domain Kustom (.com/.id)</li>
                <li className="flex items-center gap-3 font-medium"><FiCheck style={{ color: "var(--lp-accent)" }} /> Laporan Analitik Lengkap</li>
              </ul>
            </div>
            <Link to="/pricing" className="btn-press w-full py-4 text-center rounded-xl text-sm font-bold text-ink-950" style={{ background: "var(--lp-accent)" }}>Tingkatkan ke Plus</Link>
          </div>

          <div className="glass-plaque p-8 flex flex-col justify-between">
            <div>
              <h3 className="font-display text-xl font-bold mb-2">Bisnis (Pro+)</h3>
              <p className="text-sm mb-6" style={{ color: "var(--lp-text-secondary)" }}>Infrastruktur handal untuk perusahaan dan tim besar.</p>
              <div className="text-4xl font-extrabold font-display tracking-tight mb-2 flex items-baseline">
                Rp 450<span className="text-xl ml-1" style={{ color: "var(--lp-text-muted)" }}>rb</span>
              </div>
              <div className="text-xs uppercase tracking-widest mb-8 font-bold" style={{ color: "var(--lp-text-muted)" }}>Per Bulan</div>
              <ul className="space-y-4 mb-8 text-sm">
                <li className="flex items-center gap-3 font-medium"><FiCheck style={{ color: "var(--lp-accent-3)" }} /> Semua Kelebihan Paket Plus</li>
                <li className="flex items-center gap-3 font-medium"><FiCheck style={{ color: "var(--lp-accent-3)" }} /> Akses Kolaborasi Banyak Tim</li>
                <li className="flex items-center gap-3 font-medium"><FiCheck style={{ color: "var(--lp-accent-3)" }} /> Otomatis Integrasi Midtrans</li>
              </ul>
            </div>
            <Link to="/pricing" className="btn-press w-full py-4 text-center rounded-xl text-sm font-bold border transition-colors hover:bg-white/5" style={{ borderColor: "var(--lp-border-strong)", color: "var(--lp-text)" }}>Tingkatkan ke Pro+</Link>
          </div>

        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════
   TESTIMONIALS
   ═══════════════════════════════════════════════════ */
const TESTIMONIALS = [
  { name: "Rina Setiawan", role: "Pemilik Toko Online", text: "InstaWeb mengubah total cara saya membangun website. Dulu butuh berminggu-minggu dengan WordPress, sekarang toko online saya siap dalam satu jam!", avatar: "RS", color: "var(--lp-accent)" },
  { name: "Budi Hartono", role: "Freelance Designer", text: "Kualitas template-nya sangat luar biasa dan editor visual drag-and-drop ini bikin saya kerja 3x lebih cepat. Klien saya pun sangat puas.", avatar: "BH", color: "var(--lp-accent-3)" },
  { name: "Siti Nurhaliza", role: "Content Creator", text: "Dashboard statistiknya gampang banget dimengerti. Saya bisa melihat dari mana saja asal pengunjung blog saya secara real-time. Sangat direkomendasikan!", avatar: "SN", color: "var(--lp-accent-2)" },
];

function Testimonials() {
  return (
    <Section>
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <SectionEyebrow>Testimoni</SectionEyebrow>
          <SectionTitle>Dipercaya oleh Para <span className="gradient-text">Kreator.</span></SectionTitle>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
           {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} className="glass-plaque p-8" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="flex gap-1 mb-6 text-yellow-400">
                  {[1,2,3,4,5].map(s => <FiStar key={s} className="fill-current w-4 h-4" />)}
                </div>
                <p className="text-sm italic mb-8" style={{ color: "var(--lp-text-secondary)" }}>"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-ink-950" style={{ background: t.color }}>{t.avatar}</div>
                  <div>
                    <div className="font-bold text-sm" style={{ color: "var(--lp-text)" }}>{t.name}</div>
                    <div className="text-xs" style={{ color: "var(--lp-text-muted)" }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
           ))}
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════
   FOOTER (COMPREHENSIVE)
   ═══════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer id="tentang" className="border-t pt-20 pb-10" style={{ borderColor: "var(--lp-border)", background: "var(--lp-bg-secondary)" }}>
      <div className="mx-auto max-w-7xl px-6 grid gap-12 lg:grid-cols-[1.2fr_1fr_1.5fr]">
        
        {/* Brand & Team Info */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <FiGrid className="w-8 h-8" style={{ color: "var(--lp-text)" }} />
            <span className="font-display text-2xl font-bold">Insta<span className="gradient-text">Web</span></span>
          </div>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--lp-text-secondary)" }}>
            Platform website builder modern kebanggaan Indonesia. Super cepat, sangat tangguh, dan mudah digunakan oleh siapa saja.
          </p>
          <div className="glass-plaque p-6">
            <h4 className="font-bold text-sm uppercase tracking-widest mb-4" style={{ color: "var(--lp-accent)" }}>Kelompok 2</h4>
            <ul className="space-y-3 text-sm font-medium" style={{ color: "var(--lp-text)" }}>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--lp-text)" }}/> Daffa Aditya Pratama</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--lp-text)" }}/> Ammar Rabbani</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--lp-text)" }}/> Hilma Hafidzatul Maulina</li>
            </ul>
          </div>
        </div>

        {/* Contact & Links */}
        <div>
          <h4 className="font-bold text-sm uppercase tracking-widest mb-6" style={{ color: "var(--lp-text-muted)" }}>Hubungi Kami</h4>
          {/* Modern Email Box */}
          <a href="mailto:daffaaditya@daffadev.my.id" className="group block glass-plaque p-5 hover:border-[#59f0d9] transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ background: "var(--lp-border-strong)", color: "var(--lp-text)" }}>
                <FiMail />
              </div>
              <span className="font-bold text-sm">Kirim Pesan</span>
            </div>
            <p className="text-xs break-all mt-2" style={{ color: "var(--lp-text-secondary)" }}>daffaaditya@daffadev.my.id</p>
          </a>
          
          <h4 className="font-bold text-sm uppercase tracking-widest mt-10 mb-6" style={{ color: "var(--lp-text-muted)" }}>Tautan Cepat</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#fitur" className="transition-colors hover:text-[#59f0d9]" style={{ color: "var(--lp-text-secondary)" }}>Semua Fitur</a></li>
            <li><a href="#harga" className="transition-colors hover:text-[#59f0d9]" style={{ color: "var(--lp-text-secondary)" }}>Paket Berlangganan</a></li>
            <li><Link to="/login" className="transition-colors hover:text-[#59f0d9]" style={{ color: "var(--lp-text-secondary)" }}>Masuk Akun</Link></li>
          </ul>
        </div>

        {/* Location / Google Maps */}
        <div>
          <h4 className="font-bold text-sm uppercase tracking-widest mb-6" style={{ color: "var(--lp-text-muted)" }}>Pusat Operasional</h4>
          <div className="glass-plaque p-2 overflow-hidden" style={{ height: "300px" }}>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4771.822674976486!2d106.89149872289728!3d-6.1949353505681986!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f49532b5b715%3A0xa4012b68ec698d4e!2sSMK%20Negeri%2026%20Jakarta!5e0!3m2!1sid!2sid!4v1781335023256!5m2!1sid!2sid" 
              width="100%" height="100%" style={{ border: 0, borderRadius: "12px" }} 
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs" style={{ color: "var(--lp-text-secondary)" }}>
            <FiMapPin style={{ color: "var(--lp-accent)" }} /> SMK Negeri 26 Jakarta — Sistem Informasi Jaringan & Aplikasi
          </div>
        </div>

      </div>

      <div className="mx-auto max-w-7xl px-6 mt-16 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs" style={{ borderColor: "var(--lp-border)", color: "var(--lp-text-muted)" }}>
        <p>© 2026 InstaWeb Nusantara. Dibangun dengan React & Tailwind.</p>
        <p>Proyek Akhir — Kelompok 2.</p>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════ */
export default function LandingPage() {
  const { theme, toggle } = useTheme();

  return (
    <div className="relative min-h-screen">
      {/* SaaS Global Overlays */}
      <div className="saas-noise" />
      <div className="mesh-bg" />

      <Navbar theme={theme} toggleTheme={toggle} />
      
      <main className="relative z-10">
        <Hero />
        <Marquee />
        <FeaturesBentoGrid />
        <WorkflowPipeline />
        <Compare />
        <Pricing />
        <Testimonials />
      </main>

      <Footer />
    </div>
  );
}
