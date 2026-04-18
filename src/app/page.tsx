"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Typewriter component - paired Chinese/English with reflection
function TypewriterText({ lines, isDark = true }: { lines: string[]; isDark?: boolean }) {
  // Group lines into pairs: [0,1], [2,3], [4,5], etc.
  const pairedLines: [string, string][] = [];
  for (let i = 0; i < lines.length; i += 2) {
    pairedLines.push([lines[i] || "", lines[i + 1] || ""]);
  }

  const [displayedPairs, setDisplayedPairs] = useState<{ zh: string; en: string }[]>([]);
  const [currentPair, setCurrentPair] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [showEnglish, setShowEnglish] = useState(false);

  // Faster typing - target 2 seconds total for all text
  const estimatedCharsPerPair = pairedLines.slice(0, 4).reduce((acc, [zh, en]) => acc + zh.length + en.length, 0);
  const charDelay = Math.min(25, Math.max(10, (2000 / estimatedCharsPerPair)));

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (currentPair >= pairedLines.length) return;

    const [zhText, enText] = pairedLines[currentPair];
    const currentText = !showEnglish ? zhText : enText;
    const char = currentText[currentChar];
    const isPunctuation = char === "，" || char === "。" || char === "、" || char === "；" || char === "：" || char === "," || char === "." || char === ":";
    const delay = isPunctuation ? Math.max(50, charDelay * 2) : charDelay;

    const timeout = setTimeout(() => {
      if (currentChar < currentText.length) {
        setDisplayedPairs((prev) => {
          const newPairs = [...prev];
          const pairIndex = currentPair;
          if (!newPairs[pairIndex]) {
            newPairs[pairIndex] = { zh: "", en: "" };
          }
          if (!showEnglish) {
            newPairs[pairIndex].zh = zhText.slice(0, currentChar + 1);
          } else {
            newPairs[pairIndex].en = enText.slice(0, currentChar + 1);
          }
          return newPairs;
        });
        setCurrentChar((prev) => prev + 1);
      } else {
        // Current line complete
        if (!showEnglish) {
          // Switch to English
          setShowEnglish(true);
          setCurrentChar(0);
        } else {
          // Move to next pair
          setCurrentPair((prev) => prev + 1);
          setCurrentChar(0);
          setShowEnglish(false);
        }
      }
    }, currentChar === 0 && displayedPairs.length === currentPair ? 150 : delay);

    return () => clearTimeout(timeout);
  }, [currentPair, currentChar, pairedLines, showEnglish, displayedPairs.length, charDelay]);

  return (
    <div className="space-y-4">
      {displayedPairs.map((pair, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-1"
        >
          <p
            className="text-lg md:text-xl leading-relaxed"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: isDark ? 'var(--foreground)' : '#ffffff', textShadow: isDark ? 'none' : '0 1px 10px rgba(0,0,0,0.2)' }}
          >
            {pair.zh}
            {i === currentPair && !showEnglish && (
              <span
                className="inline-block w-2 h-5 ml-1 align-middle"
                style={{ backgroundColor: 'var(--primary)', opacity: showCursor ? 1 : 0 }}
              />
            )}
          </p>
          <p
            className="text-base md:text-lg leading-relaxed"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: isDark ? 'var(--muted)' : 'rgba(255,255,255,0.85)' }}
          >
            {pair.en}
            {i === currentPair && showEnglish && (
              <span
                className="inline-block w-2 h-4 ml-1 align-middle"
                style={{ backgroundColor: 'var(--primary)', opacity: showCursor ? 1 : 0 }}
              />
            )}
          </p>
        </motion.div>
      ))}
      {currentPair < pairedLines.length && (
        <span
          className="inline-block w-2 h-5 align-middle"
          style={{ backgroundColor: 'var(--primary)', opacity: showCursor ? 1 : 0 }}
        />
      )}
    </div>
  );
}

// Particle background
function ParticleBackground() {
  // Pre-generate random values to avoid impure function calls during render
  const particles = useMemo(() => {
    return [...Array(50)].map(() => ({
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      endX1: Math.random() * 100,
      endY1: Math.random() * 100,
      endX2: Math.random() * 100,
      endY2: Math.random() * 100,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{ backgroundColor: 'var(--primary)', opacity: 0.3 }}
          initial={{
            x: `${p.initialX}%`,
            y: `${p.initialY}%`,
          }}
          animate={{
            x: [`${p.initialX}%`, `${p.endX1}%`, `${p.endX2}%`],
            y: [`${p.initialY}%`, `${p.endY1}%`, `${p.endY2}%`],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// Hero Section
function HeroSection({ isDark }: { isDark: boolean }) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 400], [1, 0.95]);

  const typewriterLines = [
    "你好，陌生人。",
    "Hello, stranger.",
    "代码六年，踩坑六年。",
    "Six years in coding, six years of navigating pitfalls.",
    "从 Java 到 AI，从后端到售前。",
    "From Java to AI, from backend to pre-sales.",
    "喜欢的歌手：加木、王愚、谟西、王义太。",
    "Favorite singers: Jiamu, Wang Yu, Moxi, Wang Yitai.",
    "最爱的剧：绝命毒师、格莫拉、进击的巨人。",
    "Favorite shows: Breaking Bad, Gomorrah, Attack on Titan.",
    "爱游泳，爱徒步。",
    "I love swimming and hiking.",
    "爱一个人坐着发呆。",
    "I love sitting alone and daydreaming.",
    "人生就是不断，升级、打怪、通关。",
    "Life is leveling up, fighting monsters, clearing stages.",
    "很高兴认识你。",
    "Nice to meet you.",
  ];

  return (
    <motion.section
      style={{ opacity, scale }}
      className="relative min-h-screen flex items-center px-6 md:px-24 overflow-hidden"
    >
      {/* Video Background */}
      <video
        key={isDark ? 'dark' : 'light'}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ filter: isDark ? 'brightness(0.6) contrast(1.1)' : 'brightness(0.9) contrast(1.05)' }}
      >
        <source src={isDark ? "/videos/dynamic.mp4" : "/videos/sea.mp4"} type="video/mp4" />
      </video>

      {/* Light overlay - just enough to make text readable */}
      <div className="absolute inset-0 z-[1]" style={{ background: 'var(--video-overlay)' }} />

      <ParticleBackground />

      <div className="relative z-30 flex flex-col md:flex-row items-center gap-8 md:gap-16 max-w-7xl mx-auto w-full">
        {/* Left: Big Name */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-shrink-0 text-center md:text-left"
        >
          <motion.h1
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold whitespace-nowrap tracking-wider"
            style={{ color: isDark ? 'var(--foreground)' : '#ffffff', textShadow: isDark ? 'none' : '0 2px 20px rgba(0,0,0,0.3)' }}
          >
            饶家兴
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg md:text-2xl mt-2"
            style={{ color: isDark ? 'var(--muted)' : 'rgba(255,255,255,0.9)' }}
          >
            Rao Jiaxing
          </motion.p>
        </motion.div>

        {/* Right: Typewriter */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          className="flex-1 max-w-2xl w-full"
        >
          <TypewriterText lines={typewriterLines} isDark={isDark} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 border-2 rounded-full flex items-start justify-center p-2"
          style={{ borderColor: 'var(--muted)' }}
        >
          <motion.div className="w-1 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

// About Section
function AboutSection() {
  const lifeTags = [
    { icon: "🏀", label: "库里信徒" },
    { icon: "🏊", label: "游泳" },
    { icon: "🚶", label: "徒步" },
    { icon: "🤿", label: "一个人畅想" },
    { icon: "🤖", label: "AI狂热爱好者" },
    { icon: "🧳", label: "向往自由，体验人间百态" },
  ];

  const gameTags = [
    { label: "王者荣耀 · 国标射手", color: "gold" },
    { label: "永劫无间 · 无双修罗", color: "gold" },
  ];

  return (
    <section className="py-24 px-6 md:px-12 lg:px-24" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-12 text-center"
          style={{ color: 'var(--foreground)' }}
        >
          <span style={{ color: 'var(--primary)' }}>#</span> 关于我
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-[#1E88E5]/20 to-[#FFD700]/20 rounded-2xl blur-xl" />
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#1E88E5]/30">
              <Image
                src="/images/111.jpg"
                alt="饶家兴"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* 个人标签 */}
            <div className="grid grid-cols-2 gap-4">
              {lifeTags.map((tag, i) => (
                <motion.div
                  key={tag.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors group"
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', borderWidth: 1 }}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {tag.icon}
                  </span>
                  <span className="text-sm transition-colors" style={{ color: 'var(--muted)' }}>
                    {tag.label}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* 游戏成就 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🏆</span>
                <span className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>游戏成就</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {gameTags.map((tag) => (
                  <motion.span
                    key={tag.label}
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 rounded-xl transition-shadow cursor-default"
                    style={{ backgroundColor: 'rgba(255,215,0,0.1)', color: 'var(--accent)', borderColor: 'rgba(255,215,0,0.3)', borderWidth: 1 }}
                  >
                    🎮 {tag.label}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-[#FFD700]/10 to-transparent rounded-xl blur-lg" />
              <p className="relative text-2xl md:text-3xl font-light leading-relaxed text-center py-8" style={{ color: 'var(--accent)' }}>
                <span>「</span>
                向着朝阳，我走过寒风冬夜
                <span>」</span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Idol Section - Horizontal Film Strip
function IdolSection() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const idolImages = [
    { src: "/images/kuli1.jpg", title: "Stephen Curry", subtitle: "三分神射手" },
    { src: "/images/kuli2.jpg", title: "Curry 30", subtitle: "永不放弃" },
    { src: "/images/kuli3.jpg", title: "勇士核心", subtitle: "冠军基因" },
    { src: "/images/kuli4.jpg", title: "三分传奇", subtitle: "历史第一" },
    { src: "/images/kuli5.jpg", title: "金州勇士", subtitle: "王朝建立" },
    { src: "/images/kuli6.png", title: "MVP", subtitle: "全票通过" },
    { src: "/images/kuli7.png", title: "超越伟大", subtitle: "继续前行" },
  ];

  const totalItems = idolImages.length;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage === null) return;
      if (e.key === "ArrowLeft") {
        setSelectedImage((prev) => (prev === null ? 0 : prev === 0 ? totalItems - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        setSelectedImage((prev) => (prev === null ? 0 : prev === totalItems - 1 ? 0 : prev + 1));
      } else if (e.key === "Escape") {
        setSelectedImage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, totalItems]);

  return (
    <section className="relative min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="pt-20 pb-6 md:pb-8 text-center z-10"
      >
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl"
          style={{ color: 'var(--primary)' }}
        >
          🏀
        </motion.span>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-1 md:mb-2 mt-1" style={{ color: 'var(--foreground)' }}>
          <span style={{ color: 'var(--primary)' }}>致敬偶像</span>
          <span> · 斯蒂芬·库里</span>
        </h2>
        <p className="text-sm md:text-lg" style={{ color: 'var(--muted)' }}>不只是偶像，是信仰</p>
      </motion.div>

      {/* Desktop: Horizontal Film Strip */}
      <div className="hidden md:flex flex-1 items-center relative overflow-hidden">
        {/* Gradient masks for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-20 pointer-events-none" style={{ background: `linear-gradient(to right, var(--background), transparent)` }} />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-20 pointer-events-none" style={{ background: `linear-gradient(to left, var(--background), transparent)` }} />

        {/* Center glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#1E88E5]/[0.03] via-transparent to-[#FFD700]/[0.03] rounded-full blur-[100px] pointer-events-none" />

        {/* Film Strip */}
        <div className="flex items-center gap-32 animate-film-scroll">
          {[...idolImages, ...idolImages].map((item, index) => (
            <motion.div
              key={`${item.src}-${index}`}
              className="relative flex-shrink-0 cursor-pointer group"
              whileHover={{ scale: 1.05, y: -10 }}
              onClick={() => setSelectedImage(index % totalItems)}
            >
              {/* Photo frame - 16:9 aspect ratio */}
              <div className="relative w-[400px] lg:w-[550px] aspect-video rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_50px_rgba(30,136,229,0.3)] transition-shadow duration-500">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="650px"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {/* Title overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-white font-bold text-xl">{item.title}</p>
                  <p className="text-[var(--primary)] text-sm mt-1">{item.subtitle}</p>
                </div>
              </div>
              {/* Frame border glow */}
              <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-[var(--primary)]/50 transition-colors duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile: Vertical Grid */}
      <div className="md:hidden flex-1 px-4 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {idolImages.map((item, index) => (
            <motion.div
              key={`mobile-${item.src}-${index}`}
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
              onClick={() => setSelectedImage(index)}
            >
              <Image src={item.src} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Hint */}
      <div className="pb-8 text-center">
        <p className="text-sm" style={{ color: 'var(--muted)', opacity: 0.5 }}>自动播放 · 点击放大</p>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-4xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src={idolImages[selectedImage].src}
                  alt={idolImages[selectedImage].title}
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>

            {/* Close */}
            <button
              className="absolute top-6 right-6 text-white/60 hover:text-white text-4xl transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {idolImages.map((_, i) => (
                <button
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i === selectedImage ? "w-6" : "w-2"
                  }`}
                  style={{ backgroundColor: i === selectedImage ? 'var(--primary)' : 'rgba(255,255,255,0.3)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(i);
                  }}
                />
              ))}
            </div>

            {/* Arrows */}
            <button
              className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-4 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage((prev) => (prev === null ? 0 : prev === 0 ? totalItems - 1 : prev - 1));
              }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-4 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage((prev) => (prev === null ? 0 : prev === totalItems - 1 ? 0 : prev + 1));
              }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// Timeline Section
function TimelineSection() {
  const timelineData = [
    {
      year: "2019",
      title: "入行",
      tags: ["Java", "MySQL", "刚入门"],
      description: "从 Java 开始踏入 IT，世界在眼前打开",
    },
    {
      year: "2020",
      title: "爬虫 & 后端",
      tags: ["Python", "Spring", "Redis", "爬虫"],
      description: "写了自己的第一个爬虫，体会到代码的力量",
    },
    {
      year: "2021",
      title: "中间件 & 分布式",
      tags: ["Kafka", "Dubbo", "微服务", "Redis"],
      description: "开始玩分布式，向架构师方向进化",
    },
    {
      year: "2022",
      title: "物联网 & 云原生",
      tags: ["InfluxDB", "Shell", "Nginx", "云服务器"],
      description: "跳进物联网，数据 Everywhere",
    },
    {
      year: "2023",
      title: "低代码 & 效率工具",
      tags: ["低代码", "xxL-Job", "自动化", "前端"],
      description: "用工具解放工具，开始思考效率",
    },
    {
      year: "2024",
      title: "AI 入场",
      tags: ["LLM", "RAG", "MCP", "Agent", "工作流"],
      description: "AI 大爆炸，躬身入局",
    },
    {
      year: "2025",
      title: "AI 售前",
      tags: ["OpenClaw", "Claude Code", "售前方案"],
      description: "从写代码到卖方案，Talk is cheap",
    },
  ];

  return (
    <section className="py-16 px-6 md:px-12 lg:px-24" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-4 text-center"
          style={{ color: 'var(--foreground)' }}
        >
          <span style={{ color: 'var(--primary)' }}>#</span> 成长时间轴
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-8"
          style={{ color: 'var(--muted)' }}
        >
          从代码到方案，一步一个脚印
        </motion.p>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-[#1E88E5] via-[#1E88E5] to-[#FFD700] opacity-30" />

          {/* Root node */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative flex justify-center mb-4"
          >
            <div className="absolute w-3 h-3 bg-[#1E88E5] rounded-full animate-pulse" />
            <div className="absolute w-6 h-6 bg-[#1E88E5]/20 rounded-full animate-ping" />
          </motion.div>

          {timelineData.map((item, index) => (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`relative flex items-center mb-6 ${
                index % 2 === 0 ? "flex-row" : "flex-row-reverse"
              }`}
            >
              {/* Spacer for alignment */}
              <div className="w-1/2" />

              {/* Center dot */}
              <div className="absolute left-1/2 -translate-x-1/2 z-10">
                <div className="w-3 h-3 bg-[#1E88E5] rounded-full border-2 border-[#0a0a0a] shadow-[0_0_15px_rgba(30,136,229,0.5)]" />
              </div>

              {/* Content card */}
              <div className="w-1/2 pl-6 pr-2">
                <div className="relative group">
                  {/* Glow effect */}
                  <div className="absolute -inset-3 bg-gradient-to-r from-[#1E88E5]/10 to-[#FFD700]/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative p-4 rounded-xl border transition-colors" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                    {/* Year with breathing effect */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                    >
                      <span className="text-3xl md:text-4xl font-bold transition-colors" style={{ color: 'var(--primary)', opacity: 0.3 }}>
                        {item.year}
                      </span>
                    </motion.div>

                    {/* Title */}
                    <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                      {item.title}
                    </h3>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs rounded-full transition-shadow"
                          style={{ backgroundColor: 'rgba(30,136,229,0.1)', color: 'var(--primary)', borderColor: 'rgba(30,136,229,0.3)', borderWidth: 1 }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Description */}
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Top node (final) */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative flex justify-center mt-4"
          >
            <div className="w-3 h-3 bg-[#FFD700] rounded-full shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Gallery Section - Responsive
function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const galleryItems = [
    { src: "/images/MTXX_MR20240414_204429191.jpg" },
    { src: "/images/MTXX_MR20240414_204757345.jpg" },
    { src: "/images/2196cbe6e1c507852d371bbb5480a1cf.jpg" },
    { src: "/images/5c8458e80e490aad0a7310ecd55c844a.jpg" },
    { src: "/images/7be3ecb9f722c9613c6cf9d19bd4b794.jpg" },
    { src: "/images/803ef9415ac7b8c5342d83ecc887f41a.jpg" },
    { src: "/images/e0affb1b95845e3083a15f21886fefd2.jpg" },
  ];

  const totalItems = galleryItems.length;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage === null) return;
      if (e.key === "ArrowLeft") {
        setSelectedImage((prev) => (prev === null ? 0 : prev === 0 ? totalItems - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        setSelectedImage((prev) => (prev === null ? 0 : prev === totalItems - 1 ? 0 : prev + 1));
      } else if (e.key === "Escape") {
        setSelectedImage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, totalItems]);

  return (
    <section className="relative min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="pt-20 pb-8 md:pb-12 text-center z-10"
      >
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          <span style={{ color: 'var(--primary)' }}>生</span>活
        </h2>
        <p className="text-base md:text-lg" style={{ color: 'var(--muted)' }}>这是我的日常</p>
      </motion.div>

      {/* Desktop: Horizontal Film Strip */}
      <div className="hidden md:flex flex-1 items-center relative overflow-hidden">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-20 pointer-events-none" style={{ background: `linear-gradient(to right, var(--background), transparent)` }} />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-20 pointer-events-none" style={{ background: `linear-gradient(to left, var(--background), transparent)` }} />

        {/* Center glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#1E88E5]/[0.03] via-transparent to-[#FFD700]/[0.03] rounded-full blur-[100px] pointer-events-none" />

        {/* Film Strip */}
        <div className="flex items-center gap-32 animate-film-scroll">
          {[...galleryItems, ...galleryItems].map((item, index) => (
            <motion.div
              key={`${item.src}-${index}`}
              className="relative flex-shrink-0 cursor-pointer group"
              whileHover={{ scale: 1.05, y: -10 }}
              onClick={() => setSelectedImage(index % totalItems)}
            >
              {/* Photo frame */}
              <div className="relative w-[300px] h-[400px] md:w-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_50px_rgba(30,136,229,0.3)] transition-shadow duration-500">
                <Image
                  src={item.src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="400px"
                />
              </div>
              {/* Frame border glow */}
              <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-[#1E88E5]/50 transition-colors duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile: Vertical Grid */}
      <div className="md:hidden flex-1 px-4 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {galleryItems.map((item, index) => (
            <motion.div
              key={`mobile-${item.src}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileTap={{ scale: 0.98 }}
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
              onClick={() => setSelectedImage(index)}
            >
              <Image
                src={item.src}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Hint */}
      <div className="hidden md:block pb-8 text-center">
        <p className="text-sm" style={{ color: 'var(--muted)', opacity: 0.5 }}>自动播放 · 点击放大</p>
      </div>
      <div className="md:hidden pb-4 text-center">
        <p className="text-xs" style={{ color: 'var(--muted)', opacity: 0.5 }}>点击图片放大</p>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-4xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src={galleryItems[selectedImage].src}
                  alt=""
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>

            {/* Close */}
            <button
              className="absolute top-6 right-6 text-white/60 hover:text-white text-4xl transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {galleryItems.map((_, i) => (
                <button
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i === selectedImage ? "w-6" : "w-2"
                  }`}
                  style={{ backgroundColor: i === selectedImage ? 'var(--primary)' : 'rgba(255,255,255,0.3)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(i);
                  }}
                />
              ))}
            </div>

            {/* Arrows */}
            <button
              className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-4 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage((prev) => (prev === null ? 0 : prev === 0 ? totalItems - 1 : prev - 1));
              }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-4 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage((prev) => (prev === null ? 0 : prev === totalItems - 1 ? 0 : prev + 1));
              }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// Contact Section
function ContactSection() {
  return (
    <section className="py-24 px-6 md:px-12 lg:px-24" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-12"
          style={{ color: 'var(--foreground)' }}
        >
          <span style={{ color: 'var(--primary)' }}>#</span> 联系方式
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <a
            href="mailto:r1256128692@163.com"
            className="flex items-center justify-center gap-4 p-6 rounded-2xl border transition-colors group"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">📧</span>
            <span className="text-lg transition-colors" style={{ color: 'var(--foreground)' }}>
              r1256128692@163.com
            </span>
          </a>

          <a
            href="https://blog.csdn.net/raojiaxing_"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-4 p-6 rounded-2xl border transition-colors group"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">📝</span>
            <span className="text-lg transition-colors" style={{ color: 'var(--foreground)' }}>
              CSDN 博客
            </span>
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12"
          style={{ color: 'var(--muted)' }}
        >
          © 2024 饶家兴. All rights reserved.
        </motion.p>
      </div>
    </section>
  );
}

// Main Page with Scroll Snap
export default function Home() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isDark, setIsDark] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const sections = [
    { id: "hero", num: "01", name: "首页" },
    { id: "about", num: "02", name: "关于" },
    { id: "timeline", num: "03", name: "成长" },
    { id: "gallery", num: "04", name: "生活" },
    { id: "idol", num: "05", name: "偶像" },
    { id: "contact", num: "06", name: "联系" },
  ];

  // Handle scroll to update current section
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollTop = containerRef.current.scrollTop;

      let newSection = 0;
      for (let i = 0; i < sectionRefs.current.length; i++) {
        const section = sectionRefs.current[i];
        if (section) {
          const offsetTop = section.offsetTop;
          if (scrollTop >= offsetTop - 100) {
            newSection = i;
          }
        }
      }
      setCurrentSection(newSection);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Scroll to section
  const scrollToSection = (index: number) => {
    setIsMobileMenuOpen(false);
    if (!containerRef.current) return;
    const section = sectionRefs.current[index];
    if (section) {
      containerRef.current.scrollTo({
        top: section.offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <main className={`relative ${isDark ? "" : "light"}`}>
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b" style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--card-border)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="text-lg md:text-xl font-bold" style={{ color: 'var(--foreground)' }}>
            <span style={{ color: 'var(--primary)' }}>R</span>ao Jiaxing
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(index)}
                className="text-sm transition-colors"
                style={{
                  color: currentSection === index ? 'var(--foreground)' : 'var(--muted)'
                }}
              >
                {section.name}
              </button>
            ))}
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="ml-2 w-9 h-9 rounded-full flex items-center justify-center transition-all border"
              style={{
                borderColor: 'var(--card-border)',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--foreground)'
              }}
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => setIsDark(!isDark)}
              className="w-9 h-9 rounded-full flex items-center justify-center border"
              style={{
                borderColor: 'var(--card-border)',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--foreground)'
              }}
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-9 h-9 flex flex-col items-center justify-center gap-1.5"
              style={{ color: 'var(--foreground)' }}
            >
              <span className={`w-5 h-0.5 transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} style={{ backgroundColor: 'currentColor' }} />
              <span className={`w-5 h-0.5 transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`} style={{ backgroundColor: 'currentColor' }} />
              <span className={`w-5 h-0.5 transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} style={{ backgroundColor: 'currentColor' }} />
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--nav-bg)' }}>
            <div className="px-4 py-3 space-y-2">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(index)}
                  className="block w-full text-left py-2 text-base transition-colors"
                  style={{
                    color: currentSection === index ? 'var(--foreground)' : 'var(--muted)'
                  }}
                >
                  <span className="mr-2 text-xs opacity-50">{section.num}</span>
                  {section.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Scroll Container */}
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none", backgroundColor: 'var(--background)', color: 'var(--foreground)' } as React.CSSProperties}
      >
        <div id="hero" ref={(el) => { sectionRefs.current[0] = el; }}><HeroSection isDark={isDark} /></div>
        <div id="about" ref={(el) => { sectionRefs.current[1] = el; }}><AboutSection /></div>
        <div id="timeline" ref={(el) => { sectionRefs.current[2] = el; }}><TimelineSection /></div>
        <div id="gallery" ref={(el) => { sectionRefs.current[3] = el; }}><GallerySection /></div>
        <div id="idol" ref={(el) => { sectionRefs.current[4] = el; }}><IdolSection /></div>
        <div id="contact" ref={(el) => { sectionRefs.current[5] = el; }}><ContactSection /></div>
      </div>

      {/* Side Progress Bar - Hidden on mobile */}
      <nav className="hidden md:flex fixed right-8 top-1/2 -translate-y-1/2 z-50 flex-col gap-4">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(index)}
            className="group flex items-center justify-end gap-3"
          >
            <span
              className="text-sm font-mono transition-all duration-300"
              style={{
                opacity: currentSection === index ? 1 : 0,
                color: 'var(--foreground)'
              }}
            >
              {section.num}
            </span>
            <div
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: currentSection === index ? 'var(--primary)' : 'var(--muted)',
                boxShadow: currentSection === index ? '0 0 10px var(--primary)' : 'none'
              }}
            />
          </button>
        ))}
      </nav>

      {/* Progress Line */}
      <div className="fixed right-[37px] top-1/2 -translate-y-1/2 w-px h-32 z-40" style={{ backgroundColor: 'var(--card-border)' }}>
        <motion.div
          className="rounded-full"
          style={{ backgroundColor: 'var(--primary)' }}
          initial={{ height: "0%" }}
          animate={{ height: `${((currentSection + 1) / sections.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </main>
  );
}
