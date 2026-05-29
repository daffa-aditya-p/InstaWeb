import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowUpRight,
  FiFacebook,
  FiInstagram,
  FiMail,
  FiPhone,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiStar,
  FiSend,
  FiCpu,
  FiLayers,
  FiSliders,
  FiShield,
  FiActivity,
  FiSmartphone,
  FiTrendingUp,
  FiDownload,
  FiAward,
  FiZap,
  FiPlay,
  FiMenu,
  FiX,
  FiMapPin,
  FiCalendar,
  FiUser,
  FiExternalLink,
  FiArrowRight,
} from "react-icons/fi";

import { getField } from "../../utils/fields";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80";

function imageUrl(section, slug, fallback = FALLBACK_IMAGE) {
  return getField(section, slug, fallback) || fallback;
}

// ----------------------------------------------------
// DYNAMIC STYLING CONFIGURATION UTILITY
// ----------------------------------------------------

export function getStyleConfig(section) {
  const bg = getField(section, "style_bg", "dark");
  const padding = getField(section, "style_padding", "cozy");
  const textColor = getField(section, "style_text_color", "brand-aqua");

  let bgClass = "bg-ink-950 text-white";
  let isLight = false;
  if (bg === "light") {
    bgClass = "bg-[#f6f3ed] text-ink-950 border-y border-black/5";
    isLight = true;
  } else if (bg === "gradient-teal") {
    bgClass = "bg-gradient-to-br from-black via-slate-900 to-teal-950/70 text-white";
  } else if (bg === "gradient-purple") {
    bgClass = "bg-gradient-to-br from-black via-slate-900 to-purple-950/70 text-white";
  } else if (bg === "brand-dark") {
    bgClass = "bg-[#0c0c0d] border-y border-white/10 text-white";
  }

  let padClass = "py-16";
  if (padding === "tight") {
    padClass = "py-8";
  } else if (padding === "cozy") {
    padClass = "py-16";
  } else if (padding === "spacing") {
    padClass = "py-24";
  } else if (padding === "tall") {
    padClass = "py-36";
  }

  const validColors = ["brand-aqua", "brand-rose", "brand-lime", "brand-amber"];
  const color = validColors.includes(textColor) ? textColor : "brand-aqua";
  const textHighlight = `text-${color}`;
  const bgHighlight = `bg-${color}`;
  const borderHighlight = `border-${color}/20`;
  const bgHighlightHover = `hover:bg-${color}`;
  const textHighlightHover = `group-hover:text-${color} hover:text-${color}`;
  const borderHighlightHover = `hover:border-${color}/30`;
  
  const subtextClass = isLight ? "text-ink-700" : "text-white/60";
  const subtextMutedClass = isLight ? "text-ink-600" : "text-white/50";
  const subtextLightClass = isLight ? "text-ink-800" : "text-white/70";
  const borderClass = isLight ? "border-black/10" : "border-white/10";
  const cardBgClass = isLight ? "bg-black/[0.03] hover:bg-black/[0.05]" : "bg-white/[0.02] hover:bg-white/[0.04]";
  const cardBorderClass = isLight ? "border-black/10 hover:border-black/20" : "border-white/10 hover:border-white/20";
  const inputBgClass = isLight ? "bg-black/[0.04] text-ink-950 focus:border-brand-aqua" : "bg-ink-900 text-white focus:border-brand-aqua";
  const bgSoftGlow = isLight ? "bg-black/5" : "bg-white/[0.01]";
  const bgHoverClass = isLight ? "hover:bg-black/5" : "hover:bg-white/[0.08]";
  const shadowGlowClass = isLight ? "shadow-md" : "shadow-glow";

  return {
    bgClass,
    padClass,
    isLight,
    textHighlight,
    bgHighlight,
    borderHighlight,
    bgHighlightHover,
    textHighlightHover,
    borderHighlightHover,
    subtextClass,
    subtextMutedClass,
    subtextLightClass,
    borderClass,
    cardBgClass,
    cardBorderClass,
    inputBgClass,
    bgSoftGlow,
    bgHoverClass,
    shadowGlowClass,
    color,
  };
}

// ----------------------------------------------------
// ORIGINAL 5 TEMPLATES
// ----------------------------------------------------

function HeroSection({ section }) {
  const title = getField(section, "title", "Build a site that feels ready today");
  const subtitle = getField(
    section,
    "subtitle",
    "Compose polished pages from reusable sections and keep every update structured.",
  );
  const background = imageUrl(section, "background_image");
  const { bgClass, padClass, textHighlight, color } = getStyleConfig(section);

  return (
    <section className={`relative isolate min-h-[520px] overflow-hidden ${bgClass}`}>
      <img src={background} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/88 via-black/58 to-black/22" />
      <div className={`relative mx-auto flex min-h-[520px] max-w-6xl items-end px-6 ${padClass} sm:px-10`}>
        <div className="max-w-3xl">
          <p className={`eyebrow mb-4 ${textHighlight}`}>InstaWeb page</p>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#contact"
              className={`inline-flex h-11 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-ink-950 transition hover:bg-${color}`}
            >
              Start a conversation
              <FiArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href="#services"
              className="inline-flex h-11 items-center rounded-lg border border-white/[0.15] bg-white/[0.08] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.13]"
            >
              View services
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection({ section }) {
  const { bgClass, padClass, textHighlight, borderClass, subtextLightClass } = getStyleConfig(section);
  return (
    <section className={`border-y px-6 sm:px-10 ${bgClass} ${borderClass} ${padClass}`}>
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className={`text-xs font-bold uppercase tracking-[0.18em] ${textHighlight}`}>
            About Us
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">
            {getField(section, "heading", "A calmer way to launch better pages")}
          </h2>
          <p className={`mt-5 text-base leading-8 ${subtextLightClass}`}>
            {getField(
              section,
              "description",
              "Keep your content inside reusable sections, then publish pages without managing code, plugins, or brittle page copies.",
            )}
          </p>
        </div>
        <div className={`overflow-hidden rounded-xl border bg-ink-900 shadow-glow ${borderClass}`}>
          <img
            src={imageUrl(section, "image")}
            alt=""
            className="h-[360px] w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      </div>
    </section>
  );
}

function ServicesSection({ section }) {
  const services = [1, 2, 3].map((index) => ({
    name: getField(section, `service_${index}_name`, `Service ${index}`),
    icon: imageUrl(section, `service_${index}_icon`),
  }));
  const { bgClass, padClass, textHighlight, color, borderClass, subtextMutedClass, cardBgClass } = getStyleConfig(section);

  return (
    <section id="services" className={`border-b px-6 sm:px-10 ${bgClass} ${borderClass} ${padClass}`}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className={`eyebrow ${textHighlight}`}>Services</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold sm:text-5xl">
              Modular offers for pages that need to move quickly.
            </h2>
          </div>
          <p className={`max-w-sm text-sm leading-6 ${subtextMutedClass}`}>
            Every item is stored as field values, then rendered through the selected template.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {services.map((service, index) => (
            <article
              className={`group rounded-xl border p-5 shadow-soft transition hover:border-${color}/30 ${borderClass} ${cardBgClass}`}
              key={service.name + index}
            >
              <div className="overflow-hidden rounded-lg">
                <img
                  src={service.icon}
                  alt=""
                  className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="mt-5 flex items-center justify-between gap-4">
                <h3 className={`text-xl font-semibold group-hover:text-${color} transition`}>
                  {service.name}
                </h3>
                <span className={`grid h-9 w-9 place-items-center rounded-lg border text-xs font-bold group-hover:text-${color} transition ${borderClass} ${cardBgClass}`}>
                  0{index + 1}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection({ section }) {
  const { bgClass, padClass, textHighlight, borderClass, subtextLightClass, cardBgClass } = getStyleConfig(section);
  return (
    <section id="contact" className={`px-6 sm:px-10 ${bgClass} ${padClass}`}>
      <div className={`mx-auto grid max-w-6xl overflow-hidden rounded-xl border shadow-glow lg:grid-cols-2 ${borderClass} ${cardBgClass}`}>
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <p className={`text-xs font-bold uppercase tracking-[0.18em] ${textHighlight}`}>
            Contact
          </p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-5xl">
            {getField(section, "title", "Tell us what you are building")}
          </h2>
          <div className={`mt-8 space-y-4 text-sm font-medium ${subtextLightClass}`}>
            <a className="flex items-center gap-3 hover:opacity-80 transition" href={`mailto:${getField(section, "email")}`}>
              <FiMail className={`h-4 w-4 ${textHighlight}`} />
              {getField(section, "email", "hello@example.com")}
            </a>
            <a className="flex items-center gap-3 hover:opacity-80 transition" href={`tel:${getField(section, "phone")}`}>
              <FiPhone className={`h-4 w-4 ${textHighlight}`} />
              {getField(section, "phone", "+62 812 0000 0000")}
            </a>
          </div>
        </div>
        <div className="overflow-hidden h-full min-h-80">
          <img
            src={imageUrl(section, "map_image")}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      </div>
    </section>
  );
}

function FooterSection({ section }) {
  const logoUrl = getField(section, "logo_url");
  const { bgClass, borderClass, subtextMutedClass, bgHoverClass } = getStyleConfig(section);
  return (
    <footer className={`border-t px-6 py-12 sm:px-10 ${bgClass} ${borderClass}`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-9 max-w-[140px] rounded object-contain" />
          ) : (
            <div className="grid h-9 w-9 place-items-center rounded-lg text-sm font-black shadow-glow bg-white text-black">
              IW
            </div>
          )}
          <p className={`text-sm ${subtextMutedClass}`}>
            {getField(section, "copyright_text", "© 2026 InstaWeb. All rights reserved.")}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            className={`grid h-10 w-10 place-items-center rounded-lg border transition ${borderClass} ${subtextMutedClass} ${bgHoverClass}`}
            href={getField(section, "instagram_link", "#")}
            aria-label="Instagram"
          >
            <FiInstagram className="h-4 w-4" />
          </a>
          <a
            className={`grid h-10 w-10 place-items-center rounded-lg border transition ${borderClass} ${subtextMutedClass} ${bgHoverClass}`}
            href={getField(section, "facebook_link", "#")}
            aria-label="Facebook"
          >
            <FiFacebook className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}

// ----------------------------------------------------
// 22 NEW PREMIUM TEMPLATES
// ----------------------------------------------------

// 1. navbar
function NavbarComponent({ section }) {
  const [isOpen, setIsOpen] = useState(false);
  const logoText = getField(section, "logo_text") || "InstaWeb";
  const logoUrl = getField(section, "logo_url");
  const link1Text = getField(section, "link_1_text") || "Features";
  const link1Url = getField(section, "link_1_url") || "#features";
  const link2Text = getField(section, "link_2_text") || "Pricing";
  const link2Url = getField(section, "link_2_url") || "#pricing";
  const link3Text = getField(section, "link_3_text") || "FAQ";
  const link3Url = getField(section, "link_3_url") || "#faq";
  const link4Text = getField(section, "link_4_text") || "Contact";
  const link4Url = getField(section, "link_4_url") || "#contact";
  const ctaText = getField(section, "cta_text") || "Get Started";
  const ctaUrl = getField(section, "cta_url") || "#contact";

  const { color, isLight, borderClass } = getStyleConfig(section);

  const navBg = isLight ? "bg-[#f6f3ed]/80 text-ink-950" : "bg-ink-950/70 text-white";
  const textMenu = isLight ? "text-ink-950/70 hover:text-ink-950" : "text-white/70 hover:text-white";
  const ctaBtn = isLight ? "bg-ink-950 text-white" : "bg-white text-ink-950";

  return (
    <header className="sticky top-4 z-50 mx-auto max-w-6xl px-4">
      <nav className={`rounded-full border py-2.5 px-6 shadow-glow backdrop-blur-xl flex items-center justify-between ${borderClass} ${navBg}`}>
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-8 max-w-[120px] object-contain" />
          ) : (
            <div className="flex items-center gap-2">
              <span className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-black shadow-glow bg-${color} text-ink-950`}>
                IW
              </span>
              <span className="font-bold tracking-tight">{logoText}</span>
            </div>
          )}
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href={link1Url} className={`${textMenu} transition`}>{link1Text}</a>
          <a href={link2Url} className={`${textMenu} transition`}>{link2Text}</a>
          <a href={link3Url} className={`${textMenu} transition`}>{link3Text}</a>
          <a href={link4Url} className={`${textMenu} transition`}>{link4Text}</a>
        </div>

        <div className="hidden md:block">
          <a
            href={ctaUrl}
            className={`inline-flex h-9 items-center justify-center rounded-full px-5 text-xs font-bold shadow-glow hover:scale-102 transition ${ctaBtn} hover:bg-${color}`}
          >
            {ctaText}
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden grid h-9 w-9 place-items-center rounded-full border text-current hover:opacity-80"
          aria-label="Toggle Menu"
        >
          {isOpen ? <FiX className="h-4.5 w-4.5" /> : <FiMenu className="h-4.5 w-4.5" />}
        </button>
      </nav>

      {/* Mobile nav expand */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`md:hidden mt-2 p-5 rounded-2xl border shadow-glow backdrop-blur-xl flex flex-col gap-4 text-center text-sm font-medium ${borderClass} ${navBg}`}
          >
            <a href={link1Url} onClick={() => setIsOpen(false)} className={`hover:text-${color} py-2`}>{link1Text}</a>
            <a href={link2Url} onClick={() => setIsOpen(false)} className={`hover:text-${color} py-2`}>{link2Text}</a>
            <a href={link3Url} onClick={() => setIsOpen(false)} className={`hover:text-${color} py-2`}>{link3Text}</a>
            <a href={link4Url} onClick={() => setIsOpen(false)} className={`hover:text-${color} py-2`}>{link4Text}</a>
            <a
              href={ctaUrl}
              onClick={() => setIsOpen(false)}
              className={`mt-2 inline-flex h-10 items-center justify-center rounded-full px-6 text-xs font-bold ${ctaBtn} hover:bg-${color}`}
            >
              {ctaText}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// 2. hero_variant
function HeroVariantComponent({ section }) {
  const badgeText = getField(section, "badge_text") || "NEW RELEASE · V2.0";
  const title = getField(section, "title") || getField(section, "heading") || "Page Building at the Speed of Light";
  const subtitle = getField(
    section,
    "subtitle",
  ) || getField(section, "description") || "Assemble premium websites from highly polished, modern blocks. Fully decoupled static content delivered instantly via edge CDN.";
  const primaryCtaText = getField(section, "primary_cta_text") || "Start Building";
  const primaryCtaUrl = getField(section, "primary_cta_url") || "#contact";
  const secondaryCtaText = getField(section, "secondary_cta_text") || "Watch Demo";
  const secondaryCtaUrl = getField(section, "secondary_cta_url") || "#";
  const image = imageUrl(
    section,
    "image_url",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  );

  const { bgClass, padClass, color, borderClass, subtextLightClass } = getStyleConfig(section);

  return (
    <section className={`px-6 sm:px-10 overflow-hidden relative ${bgClass} ${padClass}`}>
      {/* Background soft ambient glows */}
      <div className={`absolute -top-40 right-10 h-[400px] w-[400px] rounded-full opacity-10 blur-[100px] pointer-events-none bg-${color}`} />
      <div className="absolute bottom-10 left-10 h-[300px] w-[300px] rounded-full bg-brand-rose/5 blur-[80px] pointer-events-none" />

      <div className="mx-auto max-w-6xl grid items-center gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide bg-${color}/5 border-${color}/30 text-${color}`}>
            <FiZap className="h-3.5 w-3.5 animate-pulse" />
            {badgeText}
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold leading-[1.1] tracking-tight">
            {title}
          </h1>
          <p className={`text-base sm:text-lg leading-8 max-w-lg ${subtextLightClass}`}>
            {subtitle}
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href={primaryCtaUrl}
              className={`inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-semibold shadow-glow transition duration-200 bg-white text-ink-950 hover:bg-${color}`}
            >
              {primaryCtaText}
            </a>
            <a
              href={secondaryCtaUrl}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-5 text-sm font-semibold transition duration-200 ${borderClass} bg-white/[0.04] text-current hover:bg-white/[0.08]`}
            >
              <FiPlay className="h-3.5 w-3.5 opacity-60" />
              {secondaryCtaText}
            </a>
          </div>
        </div>

        <div className="relative group">
          <div className={`absolute inset-0 rounded-2xl opacity-10 blur-xl group-hover:opacity-15 transition duration-500 bg-${color}`} />
          <div className={`relative overflow-hidden rounded-2xl border bg-ink-900 shadow-glow p-2 ${borderClass}`}>
            <img
              src={image}
              alt=""
              className="h-[360px] sm:h-[420px] w-full rounded-xl object-cover transition-transform duration-700 group-hover:scale-103"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// 3. feature_grid
function FeatureGridComponent({ section }) {
  const title = getField(section, "title") || getField(section, "heading") || "Designed for modern creators";
  const subtitle = getField(section, "subtitle") || getField(section, "description") || "Everything you need to compile, edit, and publish high-performance interfaces.";
  
  const { bgClass, padClass, color, borderClass, subtextClass, cardBgClass, cardBorderClass } = getStyleConfig(section);

  const features = [
    {
      title: getField(section, "feature_1_title") || "Extreme Performance",
      desc: getField(section, "feature_1_desc") || getField(section, "feature_1_description") || "Statically pre-rendered React pages achieve perfect 100 Lighthouse scores automatically.",
      icon: FiZap,
      color: `text-${color} border-${color}/20 bg-${color}/5`,
    },
    {
      title: getField(section, "feature_2_title") || "Decoupled Data",
      desc: getField(section, "feature_2_desc") || getField(section, "feature_2_description") || "Content sits safely in custom database fields, never hardcoded inside brittle HTML tables.",
      icon: FiCpu,
      color: "text-brand-rose border-brand-rose/20 bg-brand-rose/5",
    },
    {
      title: getField(section, "feature_3_title") || "Bento Aesthetics",
      desc: getField(section, "feature_3_desc") || getField(section, "feature_3_description") || "Premium, minimal glassmorphism designs inspired by Linear, Raycast, and Apple interfaces.",
      icon: FiLayers,
      color: "text-brand-lime border-brand-lime/20 bg-brand-lime/5",
    },
    {
      title: getField(section, "feature_4_title") || "Zero Maintenance",
      desc: getField(section, "feature_4_desc") || getField(section, "feature_4_description") || "No server setups, dependencies, plugin upgrades, or security updates. It just runs forever.",
      icon: FiShield,
      color: "text-brand-amber border-brand-amber/20 bg-brand-amber/5",
    },
  ];

  return (
    <section id="features" className={`px-6 sm:px-10 border-t ${bgClass} ${borderClass} ${padClass}`}>
      <div className="mx-auto max-w-6xl">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <p className={`text-xs font-bold uppercase tracking-[0.18em] text-${color}`}>Capabilities</p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">{title}</h2>
          <p className={`text-sm sm:text-base leading-7 ${subtextClass}`}>{subtitle}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`group rounded-xl border p-6 shadow-soft transition duration-300 ${cardBorderClass} ${cardBgClass}`}
            >
              <div className="space-y-4">
                <div className={`grid h-10 w-10 place-items-center rounded-lg border ${feature.color}`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className={`text-lg font-semibold group-hover:text-${color} transition`}>
                  {feature.title}
                </h3>
                <p className={`text-sm leading-6 ${subtextClass}`}>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 4. stats
function StatsComponent({ section }) {
  const title = getField(section, "title") || getField(section, "heading") || "Scale without boundaries";
  const subtitle = getField(section, "subtitle") || getField(section, "description") || "Highly optimized pages built to convert at massive traffic levels.";
  const stats = [
    { value: getField(section, "stat_1_value") || "99.99%", label: getField(section, "stat_1_label") || "Edge CDN Uptime" },
    { value: getField(section, "stat_2_value") || "< 50ms", label: getField(section, "stat_2_label") || "Global TTFB" },
    { value: getField(section, "stat_3_value") || "240k+", label: getField(section, "stat_3_label") || "Active Projects" },
    { value: getField(section, "stat_4_value") || "2.1B+", label: getField(section, "stat_4_label") || "Monthly Requests" },
  ];

  const { bgClass, padClass, color, borderClass, subtextClass, cardBgClass, cardBorderClass } = getStyleConfig(section);

  return (
    <section className={`px-6 sm:px-10 border-t relative ${bgClass} ${borderClass} ${padClass}`}>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full opacity-5 blur-[120px] pointer-events-none bg-${color}`} />
      <div className="mx-auto max-w-6xl relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h2>
          <p className={`text-sm leading-6 ${subtextClass}`}>{subtitle}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center p-6 rounded-xl border transition duration-300 shadow-glow ${cardBorderClass} ${cardBgClass}`}
            >
              <div className={`text-4xl sm:text-5xl font-black tracking-tight text-${color}`}>{stat.value}</div>
              <div className={`mt-3 text-xs font-bold uppercase tracking-widest ${subtextClass}`}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 5. logo_cloud
function LogoCloudComponent({ section }) {
  const title = getField(section, "title") || getField(section, "heading") || "POWERING PAGES FOR INDUSTRY LEADERS";
  const brands = ["Vercel", "Linear", "Framer", "Stripe", "Raycast", "Supabase"];

  const { bgClass, color, borderClass, subtextMutedClass } = getStyleConfig(section);

  return (
    <section className={`py-16 px-6 border-y overflow-hidden ${bgClass} ${borderClass}`}>
      <div className="mx-auto max-w-6xl text-center space-y-8">
        <p className={`text-xs font-bold uppercase tracking-[0.2em] ${subtextMutedClass}`}>{title}</p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {brands.map((brand, i) => (
            <div
              key={i}
              className={`font-display text-2xl font-black transition duration-300 cursor-pointer select-none filter drop-shadow-[0_0_12px_rgba(255,255,255,0.03)] opacity-40 hover:opacity-100 hover:text-${color}`}
            >
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 6. testimonials
function TestimonialsComponent({ section }) {
  const title = getField(section, "title") || getField(section, "heading") || "What top builders are saying";
  const subtitle = getField(section, "subtitle") || getField(section, "description") || "Here is why teams are leaving heavy CMS builders for InstaWeb.";
  const t1_quote = getField(section, "testimonial_1_quote") || "We shipped our marketing site in less than a day. The bento blocks and stats elements look incredibly premium out-of-the-box.";
  const t1_author = getField(section, "testimonial_1_author") || "Alex Rivera";
  const t1_role = getField(section, "testimonial_1_role") || "Founder, Nova Studio";
  const t1_avatar = imageUrl(section, "testimonial_1_avatar", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80");
  const t2_quote = getField(section, "testimonial_2_quote") || "Decoupled content keeps our pages totally bulletproof. Our marketers can make edits easily without breaking the React architecture.";
  const t2_author = getField(section, "testimonial_2_author") || "Sarah Chen";
  const t2_role = getField(section, "testimonial_2_role") || "CTO, Horizon Systems";
  const t2_avatar = imageUrl(section, "testimonial_2_avatar", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80");

  const { bgClass, padClass, color, borderClass, subtextClass, cardBgClass, cardBorderClass, subtextMutedClass, subtextLightClass } = getStyleConfig(section);

  const cards = [
    { quote: t1_quote, author: t1_author, role: t1_role, avatar: t1_avatar },
    { quote: t2_quote, author: t2_author, role: t2_role, avatar: t2_avatar },
  ];

  return (
    <section className={`px-6 sm:px-10 border-t relative ${bgClass} ${borderClass} ${padClass}`}>
      <div className="mx-auto max-w-6xl">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <p className={`text-xs font-bold uppercase tracking-[0.18em] text-${color}`}>Social Proof</p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">{title}</h2>
          <p className={`text-sm leading-6 ${subtextClass}`}>{subtitle}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className={`relative p-8 rounded-2xl border transition duration-300 shadow-glow flex flex-col justify-between ${cardBorderClass} ${cardBgClass}`}
            >
              <div className="space-y-6">
                <div className="flex gap-1 text-brand-amber">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="h-4.5 w-4.5 fill-current" />
                  ))}
                </div>
                <blockquote className={`text-base sm:text-lg leading-8 italic font-medium ${subtextLightClass}`}>
                  "{card.quote}"
                </blockquote>
              </div>
              <div className={`mt-8 flex items-center gap-4 border-t pt-6 ${borderClass}`}>
                <img src={card.avatar} alt="" className={`h-11 w-11 rounded-full object-cover border shadow-soft ${borderClass}`} />
                <div>
                  <div className="text-sm font-bold">{card.author}</div>
                  <div className={`text-xs mt-0.5 ${subtextMutedClass}`}>{card.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 7. pricing
function PricingComponent({ section }) {
  const title = getField(section, "title") || getField(section, "heading") || "Simple, transparent plans";
  const subtitle = getField(section, "subtitle") || getField(section, "description") || "Every plan includes edge delivery, unlimited bandwidth, and premium styling.";

  const plan1Name = getField(section, "plan_1_name") || "Starter";
  const plan1Price = getField(section, "plan_1_price") || "$0";
  const plan1Features = getField(section, "plan_1_features") || "1 active site, Standard blocks, InstaWeb subdomain, Global CDN";

  const plan2Name = getField(section, "plan_2_name") || "Pro";
  const plan2Price = getField(section, "plan_2_price") || "$29";
  const plan2Features = getField(section, "plan_2_features") || "Unlimited sites, All 22+ premium blocks, Custom domain SSL, Priority support, 100% Code export";
  const plan2Popular = getField(section, "plan_2_popular") || "true";

  const plan3Name = getField(section, "plan_3_name") || "Enterprise";
  const plan3Price = getField(section, "plan_3_price") || "$149";
  const plan3Features = getField(section, "plan_3_features") || "Custom block schemas, Dedicated engineer, SLA 99.99% uptime, Custom integrations";

  const { bgClass, padClass, color, borderClass, subtextClass, cardBgClass, cardBorderClass } = getStyleConfig(section);

  const plans = [
    { name: plan1Name, price: plan1Price, features: plan1Features.split(",").map(f => f.trim()), popular: false },
    { name: plan2Name, price: plan2Price, features: plan2Features.split(",").map(f => f.trim()), popular: plan2Popular === "true" },
    { name: plan3Name, price: plan3Price, features: plan3Features.split(",").map(f => f.trim()), popular: false },
  ];

  return (
    <section id="pricing" className={`px-6 sm:px-10 border-t relative ${bgClass} ${borderClass} ${padClass}`}>
      <div className="mx-auto max-w-6xl">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <p className={`text-xs font-bold uppercase tracking-[0.18em] text-${color}`}>Pricing</p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">{title}</h2>
          <p className={`text-sm leading-6 ${subtextClass}`}>{subtitle}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl border p-8 flex flex-col justify-between transition-all duration-300 ${
                plan.popular
                  ? `border-${color} bg-white/[0.04] shadow-glow scale-102 z-10`
                  : `${cardBorderClass} ${cardBgClass}`
              }`}
            >
              {plan.popular && (
                <span className={`absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold tracking-wide shadow-glow bg-${color} text-ink-950`}>
                  MOST POPULAR
                </span>
              )}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight">{plan.price}</span>
                    <span className="ml-1.5 text-sm opacity-50">/month</span>
                  </div>
                </div>

                <ul className={`space-y-3.5 border-t pt-6 text-sm ${subtextClass} ${borderClass}`}>
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <FiCheck className={`h-4.5 w-4.5 shrink-0 mt-0.5 text-${color}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <a
                  href="#contact"
                  className={`flex h-11 w-full items-center justify-center rounded-lg text-sm font-semibold transition ${
                    plan.popular
                      ? `bg-${color} text-ink-950 shadow-glow hover:bg-white`
                      : `border bg-white/[0.03] hover:bg-white/[0.08] ${borderClass}`
                  }`}
                >
                  Choose {plan.name}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 8. faq
function FAQComponent({ section }) {
  const [openIndex, setOpenIndex] = useState(null);
  const title = getField(section, "title") || getField(section, "heading") || "Frequently Asked Questions";

  const { bgClass, padClass, color, borderClass, subtextClass, cardBgClass, cardBorderClass } = getStyleConfig(section);

  const faqs = [
    {
      q: getField(section, "faq_1_question") || getField(section, "faq_1_q") || "How is content structured in InstaWeb?",
      a: getField(section, "faq_1_answer") || getField(section, "faq_1_a") || "Rather than saving raw HTML blobs, InstaWeb stores content inside neat database fields. This ensures your content remains decoupled and reusable.",
    },
    {
      q: getField(section, "faq_2_question") || getField(section, "faq_2_q") || "Can I connect my own domain?",
      a: getField(section, "faq_2_answer") || getField(section, "faq_2_a") || "Yes! You can connect any custom domain or subdomain. SSL certificates are generated automatically.",
    },
    {
      q: getField(section, "faq_3_question") || getField(section, "faq_3_q") || "Is the CDN hosting included?",
      a: getField(section, "faq_3_answer") || getField(section, "faq_3_a") || "Yes, premium edge CDN hosting is included in every page. Compiled HTML/React bundles are cached instantly globally.",
    },
    {
      q: getField(section, "faq_4_question") || getField(section, "faq_4_q") || "Can I export my project?",
      a: getField(section, "faq_4_answer") || getField(section, "faq_4_a") || "Yes, you can export your sections and fields as a raw JSON schema or react project files at any time.",
    },
  ];

  return (
    <section id="faq" className={`px-6 sm:px-10 border-t ${bgClass} ${borderClass} ${padClass}`}>
      <div className="mx-auto max-w-4xl">
        <div className="text-center space-y-4 mb-16">
          <p className={`text-xs font-bold uppercase tracking-[0.18em] text-${color}`}>Support</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border overflow-hidden transition ${cardBorderClass} ${cardBgClass}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className={`flex w-full items-center justify-between p-5 text-left font-semibold text-base sm:text-lg transition hover:text-${color}`}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <FiChevronUp className="h-5 w-5 shrink-0" /> : <FiChevronDown className="h-5 w-5 shrink-0" />}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className={`border-t p-5 text-sm sm:text-base leading-7 ${borderClass} ${subtextClass}`}>
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// 9. cta
function CTAComponent({ section }) {
  const title = getField(section, "title") || getField(section, "heading") || "Build a website that feels ready today";
  const subtitle = getField(section, "subtitle") || getField(section, "description") || "Unlock visual editing, premium bento grids, and lightning-fast CDN rendering.";
  const primaryCtaText = getField(section, "primary_cta_text") || "Start Building Free";
  const primaryCtaUrl = getField(section, "primary_cta_url") || "#contact";
  const secondaryCtaText = getField(section, "secondary_cta_text") || "Watch Features";
  const secondaryCtaUrl = getField(section, "secondary_cta_url") || "#";

  const { bgClass, padClass, color, borderClass, subtextLightClass } = getStyleConfig(section);

  return (
    <section className={`relative overflow-hidden border-t ${bgClass} ${borderClass} ${padClass} px-6 sm:px-10`}>
      {/* Mesh gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-tr from-${color}/20 via-brand-rose/5 to-black pointer-events-none opacity-80`} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full opacity-10 blur-[140px] pointer-events-none bg-${color}`} />

      <div className="relative mx-auto max-w-4xl text-center space-y-8 z-10">
        <h2 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.1]">
          {title}
        </h2>
        <p className={`text-base sm:text-xl max-w-2xl mx-auto leading-8 font-light ${subtextLightClass}`}>
          {subtitle}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a
            href={primaryCtaUrl}
            className={`inline-flex h-12 items-center justify-center rounded-lg px-6 text-sm font-semibold shadow-glow transition bg-white text-ink-950 hover:bg-${color}`}
          >
            {primaryCtaText}
          </a>
          <a
            href={secondaryCtaUrl}
            className={`inline-flex h-12 items-center justify-center rounded-lg border bg-white/[0.03] px-6 text-sm font-semibold transition hover:bg-white/[0.08] ${borderClass}`}
          >
            {secondaryCtaText}
          </a>
        </div>
      </div>
    </section>
  );
}

// 10. newsletter
function NewsletterComponent({ section }) {
  const title = getField(section, "title") || getField(section, "heading") || "Subscribe to our design dispatch";
  const subtitle = getField(section, "subtitle") || getField(section, "description") || "Get periodic updates on web architecture, premium Figma systems, and static page optimizations.";
  const placeholder = getField(section, "placeholder_text") || getField(section, "placeholder") || "Enter your email address";
  const buttonText = getField(section, "button_text") || "Subscribe Now";

  const { bgClass, padClass, color, borderClass, subtextClass, cardBgClass, cardBorderClass, inputBgClass } = getStyleConfig(section);

  return (
    <section className={`px-6 sm:px-10 border-t relative ${bgClass} ${borderClass} ${padClass}`}>
      <div className="mx-auto max-w-4xl relative z-10">
        <div className={`rounded-2xl border p-8 sm:p-12 shadow-glow text-center space-y-6 relative overflow-hidden ${cardBorderClass} ${cardBgClass}`}>
          <div className={`absolute -top-40 right-10 h-80 w-80 rounded-full opacity-5 blur-[80px] bg-${color}`} />
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h2>
          <p className={`text-sm sm:text-base leading-7 max-w-xl mx-auto ${subtextClass}`}>{subtitle}</p>

          <form onSubmit={(e) => e.preventDefault()} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              placeholder={placeholder}
              className={`h-11 w-full rounded-lg border px-4 text-sm focus:outline-none transition shadow-inner ${borderClass} ${inputBgClass} focus:border-${color}`}
              required
            />
            <button
              type="submit"
              className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-ink-950 transition hover:bg-${color}`}
            >
              <FiSend className="h-4 w-4" />
              {buttonText}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

// 11. portfolio
function PortfolioComponent({ section }) {
  const title = getField(section, "title") || getField(section, "heading") || "Curated Interfaces";
  const projects = [
    {
      title: getField(section, "project_1_title") || "Nova Dashboard",
      category: getField(section, "project_1_category") || "SaaS Product",
      image: imageUrl(section, "project_1_image", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80"),
      url: getField(section, "project_1_url") || "#",
    },
    {
      title: getField(section, "project_2_title") || "Helios Identity",
      category: getField(section, "project_2_category") || "Brand System",
      image: imageUrl(section, "project_2_image", "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80"),
      url: getField(section, "project_2_url") || "#",
    },
    {
      title: getField(section, "project_3_title") || "Aura Mobile App",
      category: getField(section, "project_3_category") || "iOS UX",
      image: imageUrl(section, "project_3_image", "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80"),
      url: getField(section, "project_3_url") || "#",
    },
  ];

  const { bgClass, padClass, color, borderClass, subtextClass, cardBgClass, cardBorderClass } = getStyleConfig(section);

  return (
    <section className={`px-6 sm:px-10 border-t ${bgClass} ${borderClass} ${padClass}`}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between items-start gap-4 mb-16 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <p className={`text-xs font-bold uppercase tracking-[0.18em] text-${color}`}>Portfolio</p>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">{title}</h2>
          </div>
          <span className={`text-sm ${subtextClass}`}>Curated design archives</span>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {projects.map((proj, idx) => (
            <a
              href={proj.url}
              key={idx}
              className={`group block rounded-2xl border overflow-hidden transition-all duration-300 shadow-soft ${cardBorderClass} ${cardBgClass}`}
            >
              <div className="overflow-hidden h-64 relative">
                <img
                  src={proj.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                  <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 text-${color}`}>
                    View Project <FiArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-1">
                <span className={`text-xs font-semibold text-${color}`}>{proj.category}</span>
                <h3 className={`text-xl font-bold group-hover:text-${color} transition`}>
                  {proj.title}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// 12. gallery
function GalleryComponent({ section }) {
  const title = getField(section, "title") || getField(section, "heading") || "Atmosphere at the studio";
  const images = [
    imageUrl(section, "image_1", "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=600&q=80"),
    imageUrl(section, "image_2", "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=600&q=80"),
    imageUrl(section, "image_3", "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=600&q=80"),
    imageUrl(section, "image_4", "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80"),
    imageUrl(section, "image_5", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80"),
    imageUrl(section, "image_6", "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80"),
  ];

  const { bgClass, padClass, borderClass } = getStyleConfig(section);

  return (
    <section className={`px-6 sm:px-10 border-t ${bgClass} ${borderClass} ${padClass}`}>
      <div className="mx-auto max-w-6xl space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`overflow-hidden rounded-xl border bg-ink-900 group shadow-soft ${borderClass}`}
            >
              <img
                src={img}
                alt=""
                className="h-60 w-full object-cover transition duration-500 filter brightness-90 group-hover:brightness-105 group-hover:scale-103"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 13. team
function TeamComponent({ section }) {
  const title = getField(section, "title") || getField(section, "heading") || "Meet the core team";
  const members = [
    {
      name: getField(section, "member_1_name") || "Julian Vance",
      role: getField(section, "member_1_role") || "Founder & Lead Designer",
      avatar: imageUrl(section, "member_1_avatar", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"),
    },
    {
      name: getField(section, "member_2_name") || "Sophia Sato",
      role: getField(section, "member_2_role") || "Core Infrastructure",
      avatar: imageUrl(section, "member_2_avatar", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"),
    },
    {
      name: getField(section, "member_3_name") || "Kenji Martinez",
      role: getField(section, "member_3_role") || "Lead Engineer",
      avatar: imageUrl(section, "member_3_avatar", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"),
    },
    {
      name: getField(section, "member_4_name") || "Alisha Hughes",
      role: getField(section, "member_4_role") || "Community & Growth",
      avatar: imageUrl(section, "member_4_avatar", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"),
    },
  ];

  const { bgClass, padClass, color, borderClass, subtextMutedClass, cardBgClass, cardBorderClass } = getStyleConfig(section);

  return (
    <section className={`px-6 sm:px-10 border-t ${bgClass} ${borderClass} ${padClass}`}>
      <div className="mx-auto max-w-6xl">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <p className={`text-xs font-bold uppercase tracking-[0.18em] text-${color}`}>Our Team</p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">{title}</h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member, idx) => (
            <div
              key={idx}
              className={`group p-5 rounded-2xl border text-center transition-all duration-300 shadow-soft hover:border-${color}/30 ${cardBorderClass} ${cardBgClass}`}
            >
              <div className={`mx-auto h-24 w-24 overflow-hidden rounded-full border shadow-soft relative ${borderClass}`}>
                <img src={member.avatar} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <h3 className={`mt-5 text-lg font-bold group-hover:text-${color} transition`}>{member.name}</h3>
              <p className={`text-xs mt-1 ${subtextMutedClass}`}>{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 14. timeline
function TimelineComponent({ section }) {
  const title = getField(section, "title") || getField(section, "heading") || "Our core milestones";
  const events = [
    {
      year: getField(section, "event_1_year") || "2024",
      title: getField(section, "event_1_title") || "The Genesis",
      desc: getField(section, "event_1_desc") || "Built as a modular library to compile fast websites with rigid templates.",
    },
    {
      year: getField(section, "event_2_year") || "2025",
      title: getField(section, "event_2_title") || "Going Decoupled",
      desc: getField(section, "event_2_desc") || "Transitioned all templates and sections to database-backed schemas.",
    },
    {
      year: getField(section, "event_3_year") || "2026",
      title: getField(section, "event_3_title") || "InstaWeb V2.0",
      desc: getField(section, "event_3_desc") || "Shipped the brand new 22 bento templates and live preview system.",
    },
  ];

  const { bgClass, padClass, color, borderClass, subtextClass } = getStyleConfig(section);

  return (
    <section className={`px-6 sm:px-10 border-t ${bgClass} ${borderClass} ${padClass}`}>
      <div className="mx-auto max-w-4xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h2>
        </div>

        <div className={`relative border-l pl-6 sm:pl-10 space-y-12 ${borderClass}`}>
          {events.map((event, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline marker */}
              <div className={`absolute -left-[31px] sm:-left-[47px] top-1.5 grid h-4 w-4 place-items-center rounded-full border bg-ink-950 transition group-hover:border-${color} group-hover:bg-${color} shadow-glow ${borderClass}`} />

              <div className="space-y-2">
                <span className={`inline-block text-xs font-bold uppercase tracking-widest text-${color}`}>{event.year}</span>
                <h3 className={`text-xl font-bold group-hover:text-${color} transition`}>{event.title}</h3>
                <p className={`text-sm leading-7 max-w-2xl ${subtextClass}`}>{event.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 15. process_steps
function ProcessStepsComponent({ section }) {
  const title = getField(section, "title") || getField(section, "heading") || "Designed to be pain-free";
  const steps = [
    {
      title: getField(section, "step_1_title") || "Pick a layout template",
      desc: getField(section, "step_1_desc") || getField(section, "step_1_description") || "Select from our 22+ premium, responsive section schemas.",
    },
    {
      title: getField(section, "step_2_title") || "Input schema content",
      desc: getField(section, "step_2_desc") || getField(section, "step_2_description") || "Enter text, links, and image links directly inside the field editor.",
    },
    {
      title: getField(section, "step_3_title") || "Deploy instantly",
      desc: getField(section, "step_3_desc") || getField(section, "step_3_description") || "Hit publish to compile static HTML/React bundles onto the global CDN.",
    },
  ];

  const { bgClass, padClass, color, borderClass, subtextClass, cardBgClass, cardBorderClass } = getStyleConfig(section);

  return (
    <section className={`px-6 sm:px-10 border-t relative ${bgClass} ${borderClass} ${padClass}`}>
      <div className="mx-auto max-w-6xl">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <p className={`text-xs font-bold uppercase tracking-[0.18em] text-${color}`}>Workflow</p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">{title}</h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`relative p-8 rounded-2xl border transition-all duration-300 shadow-soft flex flex-col justify-between ${cardBorderClass} ${cardBgClass}`}
            >
              <div className="space-y-4 relative">
                {/* Large Background number */}
                <div className="text-6xl sm:text-7xl font-black opacity-5 absolute -top-8 -left-4 select-none pointer-events-none">
                  0{idx + 1}
                </div>
                <h3 className="text-lg font-bold tracking-tight relative z-10 pt-4">
                  {step.title}
                </h3>
                <p className={`text-sm leading-6 relative z-10 ${subtextClass}`}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 16. blog_preview
function BlogPreviewComponent({ section }) {
  const title = getField(section, "title") || getField(section, "heading") || "Inside our engineering journal";
  const posts = [
    {
      title: getField(section, "post_1_title") || "Decoupled Content vs Raw HTML Blobs",
      excerpt: getField(section, "post_1_excerpt") || "Traditional page editors save chaotic code. Decoupling data in database fields provides ultimate styling safety.",
      image: imageUrl(section, "post_1_image", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80"),
      date: getField(section, "post_1_date") || "May 12, 2026",
    },
    {
      title: getField(section, "post_2_title") || "Building a high-performance bento layout",
      excerpt: getField(section, "post_2_excerpt") || "An in-depth look at grid spans, hover micro-interactions, and visual contrast schemas.",
      image: imageUrl(section, "post_2_image", "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=400&q=80"),
      date: getField(section, "post_2_date") || "May 04, 2026",
    },
    {
      title: getField(section, "post_3_title") || "Edge loading CDN latency optimizations",
      excerpt: getField(section, "post_3_excerpt") || "Under the hood of InstaWeb's automatic static builds delivering under 50ms responses globally.",
      image: imageUrl(section, "post_3_image", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80"),
      date: getField(section, "post_3_date") || "Apr 28, 2026",
    },
  ];

  const { bgClass, padClass, color, borderClass, subtextClass, cardBgClass, cardBorderClass, subtextMutedClass } = getStyleConfig(section);

  return (
    <section className={`px-6 sm:px-10 border-t ${bgClass} ${borderClass} ${padClass}`}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between items-start gap-4 mb-16 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <p className={`text-xs font-bold uppercase tracking-[0.18em] text-${color}`}>Journal</p>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">{title}</h2>
          </div>
          <span className={`text-sm ${subtextClass}`}>Updated twice monthly</span>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {posts.map((post, idx) => (
            <article
              key={idx}
              className={`group block rounded-2xl border overflow-hidden transition-all duration-300 shadow-soft ${cardBorderClass} ${cardBgClass}`}
            >
              <div className="overflow-hidden h-48 relative">
                <img
                  src={post.image}
                  alt=""
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-103"
                />
              </div>
              <div className="p-6 space-y-4">
                <div className={`flex items-center gap-2 text-xs ${subtextMutedClass}`}>
                  <FiCalendar className={`h-3.5 w-3.5 text-${color}`} />
                  <span>{post.date}</span>
                </div>
                <h3 className={`text-lg font-bold group-hover:text-${color} transition leading-tight`}>
                  {post.title}
                </h3>
                <p className={`text-sm leading-6 line-clamp-2 ${subtextClass}`}>
                  {post.excerpt}
                </p>
                <div className={`pt-2 flex items-center gap-1 text-xs font-bold text-${color}`}>
                  <span>Read Article</span>
                  <FiArrowRight className="h-3 w-3 group-hover:translate-x-1 transition duration-200" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// 17. comparison_table
function ComparisonTableComponent({ section }) {
  const title = getField(section, "title") || getField(section, "heading") || "How we compare";
  const col1 = getField(section, "col_1") || "InstaWeb";
  const col2 = getField(section, "col_2") || "WordPress / Wix";

  const rows = [
    {
      name: getField(section, "row_1_name") || "Page Load Speed",
      val1: getField(section, "row_1_val_1") || "Sub-100ms average",
      val2: getField(section, "row_1_val_2") || "2.4 seconds average",
    },
    {
      name: getField(section, "row_2_name") || "Content Reusability",
      val1: getField(section, "row_2_val_1") || "Decoupled database fields",
      val2: getField(section, "row_2_val_2") || "Hardcoded HTML elements",
    },
    {
      name: getField(section, "row_3_name") || "Dependency Maintenance",
      val1: getField(section, "row_3_val_1") || "Zero setups needed",
      val2: getField(section, "row_3_val_2") || "Frequent plugin updates",
    },
  ];

  const { bgClass, padClass, color, borderClass, subtextClass, cardBgClass, cardBorderClass } = getStyleConfig(section);

  return (
    <section className={`px-6 sm:px-10 border-t ${bgClass} ${borderClass} ${padClass}`}>
      <div className="mx-auto max-w-4xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h2>
        </div>

        <div className={`overflow-x-auto rounded-2xl border shadow-glow ${borderClass} ${cardBgClass}`}>
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className={`border-b bg-white/[0.03] ${borderClass}`}>
                <th className="p-5 text-sm font-bold">Capability</th>
                <th className={`p-5 text-sm font-bold text-${color}`}>{col1}</th>
                <th className={`p-5 text-sm font-bold opacity-50`}>{col2}</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-sm ${borderClass}`}>
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition">
                  <td className="p-5 font-medium">{row.name}</td>
                  <td className={`p-5 font-semibold text-${color}`}>{row.val1}</td>
                  <td className={`p-5 ${subtextClass}`}>{row.val2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// 18. bento_grid
function BentoGridComponent({ section }) {
  const title = getField(section, "title") || getField(section, "heading") || "Asymmetric, high-contrast engineering";

  const card1Title = getField(section, "card_1_title") || "Instant Edge CDNs";
  const card1Desc = getField(section, "card_1_desc") || "Statically precompiled React sections deployed directly on global edge servers.";
  const card1Image = imageUrl(section, "card_1_image", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80");

  const card2Title = getField(section, "card_2_title") || "Decoupled Schemas";
  const card2Desc = getField(section, "card_2_desc") || "Content stays separate from layouts.";
  const card2Image = imageUrl(section, "card_2_image", "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80");

  const card3Title = getField(section, "card_3_title") || "Automatic SEO";
  const card3Desc = getField(section, "card_3_desc") || "Pre-optimized meta templates.";
  const card3Image = imageUrl(section, "card_3_image", "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80");

  const card4Title = getField(section, "card_4_title") || "100% Exportable";
  const card4Desc = getField(section, "card_4_desc") || "No lock-in. Export raw React bundles.";
  const card4Image = imageUrl(section, "card_4_image", "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=600&q=80");

  const { bgClass, padClass, color, borderClass, subtextClass, cardBgClass, cardBorderClass } = getStyleConfig(section);

  return (
    <section className={`px-6 sm:px-10 border-t ${bgClass} ${borderClass} ${padClass}`}>
      <div className="mx-auto max-w-6xl space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <p className={`text-xs font-bold uppercase tracking-[0.18em] text-${color}`}>Bento Block</p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">{title}</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Asymmetric block 1: Span 2 */}
          <div className={`md:col-span-2 relative group rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between overflow-hidden shadow-soft ${cardBorderClass} ${cardBgClass}`}>
            <div className="space-y-2 max-w-lg z-10">
              <h3 className={`text-xl font-bold group-hover:text-${color} transition`}>{card1Title}</h3>
              <p className={`text-sm leading-6 ${subtextClass}`}>{card1Desc}</p>
            </div>
            <div className={`mt-8 overflow-hidden rounded-xl h-48 border relative z-10 shadow-soft ${borderClass}`}>
              <img src={card1Image} alt="" className="h-full w-full object-cover" />
            </div>
          </div>

          {/* Block 2 */}
          <div className={`relative group rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between overflow-hidden shadow-soft ${cardBorderClass} ${cardBgClass}`}>
            <div className="space-y-2 z-10">
              <h3 className={`text-xl font-bold group-hover:text-${color} transition`}>{card2Title}</h3>
              <p className={`text-sm leading-6 ${subtextClass}`}>{card2Desc}</p>
            </div>
            <div className={`mt-8 overflow-hidden rounded-xl h-36 border relative z-10 shadow-soft ${borderClass}`}>
              <img src={card2Image} alt="" className="h-full w-full object-cover" />
            </div>
          </div>

          {/* Block 3 */}
          <div className={`relative group rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between overflow-hidden shadow-soft ${cardBorderClass} ${cardBgClass}`}>
            <div className="space-y-2 z-10">
              <h3 className={`text-xl font-bold group-hover:text-${color} transition`}>{card3Title}</h3>
              <p className={`text-sm leading-6 ${subtextClass}`}>{card3Desc}</p>
            </div>
            <div className={`mt-8 overflow-hidden rounded-xl h-36 border relative z-10 shadow-soft ${borderClass}`}>
              <img src={card3Image} alt="" className="h-full w-full object-cover" />
            </div>
          </div>

          {/* Asymmetric block 4: Span 2 */}
          <div className={`md:col-span-2 relative group rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between overflow-hidden shadow-soft ${cardBorderClass} ${cardBgClass}`}>
            <div className="space-y-2 max-w-lg z-10">
              <h3 className={`text-xl font-bold group-hover:text-${color} transition`}>{card4Title}</h3>
              <p className={`text-sm leading-6 ${subtextClass}`}>{card4Desc}</p>
            </div>
            <div className={`mt-8 overflow-hidden rounded-xl h-48 border relative z-10 shadow-soft ${borderClass}`}>
              <img src={card4Image} alt="" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// 19. product_showcase
function ProductShowcaseComponent({ section }) {
  const title = getField(section, "title") || getField(section, "heading") || "A canvas built for speed";
  const desc = getField(section, "description") || "InstaWeb's page builder isolates visual content, enabling real-time edits inside a secure desktop or mobile dashboard.";
  const image = imageUrl(section, "image", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80");
  const badge = getField(section, "badge") || getField(section, "badge_text") || "Visual Editor";

  const { bgClass, padClass, color, borderClass, subtextLightClass } = getStyleConfig(section);

  return (
    <section className={`px-6 sm:px-10 border-t relative ${bgClass} ${borderClass} ${padClass}`}>
      <div className={`absolute top-10 left-10 h-80 w-80 rounded-full opacity-5 blur-[100px] pointer-events-none bg-${color}`} />
      <div className="mx-auto max-w-5xl space-y-10 text-center relative z-10">
        <div className="space-y-4 max-w-2xl mx-auto">
          <span className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border bg-${color}/5 border-${color}/20 text-${color}`}>{badge}</span>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">{title}</h2>
          <p className={`text-sm sm:text-base leading-7 ${subtextLightClass}`}>{desc}</p>
        </div>

        <div className={`relative group mx-auto max-w-4xl p-2 rounded-2xl border shadow-glow overflow-hidden ${borderClass} bg-ink-900`}>
          <div className={`absolute inset-0 opacity-5 blur-xl group-hover:opacity-10 transition duration-500 bg-gradient-to-tr from-${color} to-brand-rose`} />
          <img src={image} alt="" className="w-full h-auto rounded-xl object-contain relative z-10 shadow-soft" />
        </div>
      </div>
    </section>
  );
}

// 20. app_download
function AppDownloadComponent({ section }) {
  const title = getField(section, "title") || getField(section, "heading") || "Control your site on the move";
  const desc = getField(section, "description") || "Download the official mobile app to edit content, publish instant sections updates, and check analytics from anywhere.";
  const image = imageUrl(section, "image", "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80");
  const appStoreUrl = getField(section, "app_store_url") || getField(section, "ios_url") || "#";
  const playStoreUrl = getField(section, "play_store_url") || getField(section, "android_url") || "#";

  const { bgClass, padClass, color, borderClass, subtextClass } = getStyleConfig(section);

  return (
    <section className={`px-6 sm:px-10 border-t overflow-hidden ${bgClass} ${borderClass} ${padClass}`}>
      <div className="mx-auto max-w-6xl grid items-center gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <p className={`text-xs font-bold uppercase tracking-[0.18em] text-${color}`}>App Download</p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">{title}</h2>
          <p className={`text-sm sm:text-base leading-7 ${subtextClass}`}>{desc}</p>

          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href={appStoreUrl}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-5 text-sm font-semibold hover:bg-white/[0.08] shadow-soft transition bg-white/[0.04] text-current ${borderClass}`}
            >
              <FiSmartphone className={`h-4 w-4 text-${color}`} />
              <span>App Store</span>
            </a>
            <a
              href={playStoreUrl}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-5 text-sm font-semibold hover:bg-white/[0.08] shadow-soft transition bg-white/[0.04] text-current ${borderClass}`}
            >
              <FiDownload className={`h-4 w-4 text-${color}`} />
              <span>Google Play</span>
            </a>
          </div>
        </div>

        <div className="relative group">
          <div className={`absolute inset-0 opacity-10 blur-xl group-hover:opacity-15 transition bg-gradient-to-r from-brand-rose to-${color}`} />
          <div className={`relative overflow-hidden rounded-2xl border bg-ink-900 shadow-glow p-2 max-w-md mx-auto ${borderClass}`}>
            <img src={image} alt="" className="h-80 sm:h-[400px] w-full rounded-xl object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}

// 21. case_studies
function CaseStudiesComponent({ section }) {
  const title = getField(section, "title") || getField(section, "heading") || "Real conversion impact";

  const case1Stat = getField(section, "case_1_stat") || getField(section, "case_1_num") || "140%";
  const case1Label = getField(section, "case_1_label") || getField(section, "case_1_lbl") || "Conversion Lift";
  const case1Quote = getField(section, "case_1_quote") || "Migrating our landing pages to InstaWeb gave our marketing team the independence to launch updates immediately. Conversions rose overnight.";
  const case1Author = getField(section, "case_1_author") || "Sarah Rivers, Velo SaaS";

  const case2Stat = getField(section, "case_2_stat") || getField(section, "case_2_num") || "80%";
  const case2Label = getField(section, "case_2_label") || getField(section, "case_2_lbl") || "Time Saved";
  const case2Quote = getField(section, "case_2_quote") || "No more waiting for software releases to edit text. Our copywriting team manages everything directly in structured fields.";
  const case2Author = getField(section, "case_2_author") || "Kenji Sato, Tokyo Hub";

  const { bgClass, padClass, color, borderClass, subtextClass, cardBgClass, cardBorderClass, subtextMutedClass } = getStyleConfig(section);

  const cases = [
    { stat: case1Stat, label: case1Label, quote: case1Quote, author: case1Author },
    { stat: case2Stat, label: case2Label, quote: case2Quote, author: case2Author },
  ];

  return (
    <section className={`px-6 sm:px-10 border-t ${bgClass} ${borderClass} ${padClass}`}>
      <div className="mx-auto max-w-6xl">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <p className={`text-xs font-bold uppercase tracking-[0.18em] text-${color}`}>Case Studies</p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">{title}</h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {cases.map((cs, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-2xl border transition-all duration-300 shadow-glow flex flex-col justify-between ${cardBorderClass} ${cardBgClass}`}
            >
              <div className="space-y-6">
                <div>
                  <div className={`text-5xl sm:text-6xl font-black tracking-tight text-${color}`}>{cs.stat}</div>
                  <div className={`mt-2 text-xs font-bold uppercase tracking-widest ${subtextMutedClass}`}>{cs.label}</div>
                </div>
                <blockquote className={`text-sm sm:text-base leading-7 italic ${subtextClass}`}>
                  "{cs.quote}"
                </blockquote>
              </div>
              <div className={`mt-8 border-t pt-5 text-xs font-semibold ${borderClass} ${subtextMutedClass}`}>
                {cs.author}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 22. contact_variant
function ContactVariantComponent({ section }) {
  const title = getField(section, "title") || getField(section, "heading") || "Connect with our hubs";
  const subtitle = getField(section, "subtitle") || "We have offices around the world and a digital support system available 24/7.";

  const office1Name = getField(section, "office_1_name") || "San Francisco";
  const office1Address = getField(section, "office_1_address") || getField(section, "office_1_addr") || "440 Mission St, San Francisco, CA 94103";
  const office1Phone = getField(section, "office_1_phone") || "+1 (415) 555-0188";

  const office2Name = getField(section, "office_2_name") || "London";
  const office2Address = getField(section, "office_2_address") || getField(section, "office_2_addr") || "22 Bishopsgate, London EC2N 4AJ";
  const office2Phone = getField(section, "office_2_phone") || "+44 20 7946 0192";

  const formTitle = getField(section, "form_title") || "Submit a direct inquiry";
  const formButtonText = getField(section, "form_button_text") || getField(section, "form_btn_text") || "Send Message";

  const { bgClass, padClass, color, borderClass, subtextClass, cardBgClass, cardBorderClass, inputBgClass } = getStyleConfig(section);

  return (
    <section className={`px-6 sm:px-10 border-t relative ${bgClass} ${borderClass} ${padClass}`}>
      <div className="mx-auto max-w-6xl">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <p className={`text-xs font-bold uppercase tracking-[0.18em] text-${color}`}>Contact Channels</p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">{title}</h2>
          <p className={`text-sm leading-6 ${subtextClass}`}>{subtitle}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Office listings */}
          <div className="space-y-6">
            <div className={`p-6 rounded-xl border transition space-y-3 ${cardBorderClass} ${cardBgClass}`}>
              <span className={`text-xs font-bold uppercase tracking-wider text-${color}`}>{office1Name} HQ</span>
              <div className={`space-y-2 text-sm ${subtextClass}`}>
                <div className="flex items-center gap-2"><FiMapPin className="h-4 w-4 opacity-40" /><span>{office1Address}</span></div>
                <div className="flex items-center gap-2"><FiPhone className="h-4 w-4 opacity-40" /><span>{office1Phone}</span></div>
              </div>
            </div>

            <div className={`p-6 rounded-xl border transition space-y-3 ${cardBorderClass} ${cardBgClass}`}>
              <span className={`text-xs font-bold uppercase tracking-wider text-${color}`}>{office2Name} Hub</span>
              <div className={`space-y-2 text-sm ${subtextClass}`}>
                <div className="flex items-center gap-2"><FiMapPin className="h-4 w-4 opacity-40" /><span>{office2Address}</span></div>
                <div className="flex items-center gap-2"><FiPhone className="h-4 w-4 opacity-40" /><span>{office2Phone}</span></div>
              </div>
            </div>
          </div>

          {/* Sleek Form */}
          <div className={`p-8 rounded-2xl border shadow-glow space-y-6 ${cardBorderClass} ${cardBgClass}`}>
            <h3 className="text-lg font-bold tracking-tight">{formTitle}</h3>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="First name"
                  className={`h-10 w-full rounded-lg border px-3 text-xs focus:outline-none transition shadow-inner ${borderClass} ${inputBgClass} focus:border-${color}`}
                  required
                />
                <input
                  type="email"
                  placeholder="Email address"
                  className={`h-10 w-full rounded-lg border px-3 text-xs focus:outline-none transition shadow-inner ${borderClass} ${inputBgClass} focus:border-${color}`}
                  required
                />
              </div>
              <textarea
                rows={4}
                placeholder="How can we help?"
                className={`w-full rounded-lg border p-3 text-xs focus:outline-none transition shadow-inner resize-none ${borderClass} ${inputBgClass} focus:border-${color}`}
                required
              />
              <button
                type="submit"
                className={`w-full inline-flex h-11 items-center justify-center rounded-lg bg-white text-xs font-bold text-ink-950 hover:bg-${color} transition shadow-soft`}
              >
                {formButtonText}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------
// UNKNOWN TEMPLATE FALLBACK
// ----------------------------------------------------

function UnknownSection({ section }) {
  const { bgClass, padClass, color, borderClass } = getStyleConfig(section);
  return (
    <section className={`px-6 text-white border-t ${bgClass} ${borderClass} ${padClass}`}>
      <div className={`mx-auto max-w-4xl rounded-lg border p-8 bg-white/[0.06] ${borderClass}`}>
        <p className="eyebrow text-brand-aqua">Unknown Template</p>
        <h2 className="mt-3 text-3xl font-semibold">{section?.template?.name}</h2>
        <div className="mt-6 grid gap-3">
          {section?.fields?.map((field) => (
            <div className={`rounded-lg border p-3 ${borderClass}`} key={field.id}>
              <div className="text-xs uppercase tracking-wide opacity-40">{field.name}</div>
              <div className="mt-1 opacity-80">{field.value || "Empty"}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------
// SECTION RENDERER ROUTER
// ----------------------------------------------------

export function SectionRenderer({ section }) {
  const slug = section?.template?.slug;
  const Component =
    {
      hero: HeroSection,
      about: AboutSection,
      services: ServicesSection,
      contact: ContactSection,
      footer: FooterSection,
      navbar: NavbarComponent,
      hero_variant: HeroVariantComponent,
      feature_grid: FeatureGridComponent,
      stats: StatsComponent,
      logo_cloud: LogoCloudComponent,
      testimonials: TestimonialsComponent,
      pricing: PricingComponent,
      faq: FAQComponent,
      cta: CTAComponent,
      newsletter: NewsletterComponent,
      portfolio: PortfolioComponent,
      gallery: GalleryComponent,
      team: TeamComponent,
      timeline: TimelineComponent,
      process_steps: ProcessStepsComponent,
      blog_preview: BlogPreviewComponent,
      comparison_table: ComparisonTableComponent,
      bento_grid: BentoGridComponent,
      product_showcase: ProductShowcaseComponent,
      app_download: AppDownloadComponent,
      case_studies: CaseStudiesComponent,
      contact_variant: ContactVariantComponent,
    }[slug] || UnknownSection;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Component section={section} />
    </motion.div>
  );
}

export function WebsiteRenderer({ sections = [], emptyState = null }) {
  if (!sections.length) {
    return emptyState;
  }
  return (
    <div className="overflow-hidden bg-black space-y-4">
      {sections.map((section) => (
        <SectionRenderer section={section} key={section.id} />
      ))}
    </div>
  );
}
