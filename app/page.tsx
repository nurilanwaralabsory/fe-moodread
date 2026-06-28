"use client";
import { useState, useRef, useEffect, useCallback } from "react";

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface BookRecommendation {
     judul: string;
     penulis?: string;
     genre: string;
     sinopsis?: string;
     tahun?: number | string;
}
interface EmotionResult {
     primary_emotion: string;
     primary_score: number;
     top_emotions: { emotion: string; score: number }[];
     recommended_genres: string[];
     book_recommendations: BookRecommendation[];
}

/* ─── Data ───────────────────────────────────────────────────────────────── */
const EMOTION_META: Record<
     string,
     {
          label: string;
          emoji: string;
          accent: string;
          gradFrom: string;
          gradTo: string;
          ring: string;
     }
> = {
     sadness: {
          label: "Sedih",
          emoji: "😢",
          accent: "#818cf8",
          ring: "ring-indigo-500/30",
          gradFrom: "from-indigo-950",
          gradTo: "to-indigo-900",
     },
     happy: {
          label: "Bahagia",
          emoji: "😊",
          accent: "#fbbf24",
          ring: "ring-amber-500/30",
          gradFrom: "from-amber-950",
          gradTo: "to-amber-900",
     },
     joy: {
          label: "Gembira",
          emoji: "😄",
          accent: "#fbbf24",
          ring: "ring-amber-500/30",
          gradFrom: "from-amber-950",
          gradTo: "to-amber-900",
     },
     love: {
          label: "Cinta",
          emoji: "❤️",
          accent: "#fb7185",
          ring: "ring-rose-500/30",
          gradFrom: "from-rose-950",
          gradTo: "to-rose-900",
     },
     anger: {
          label: "Marah",
          emoji: "😤",
          accent: "#f87171",
          ring: "ring-red-500/30",
          gradFrom: "from-red-950",
          gradTo: "to-red-900",
     },
     fear: {
          label: "Takut",
          emoji: "😨",
          accent: "#c084fc",
          ring: "ring-purple-500/30",
          gradFrom: "from-purple-950",
          gradTo: "to-purple-900",
     },
     surprise: {
          label: "Terkejut",
          emoji: "😲",
          accent: "#22d3ee",
          ring: "ring-cyan-500/30",
          gradFrom: "from-cyan-950",
          gradTo: "to-cyan-900",
     },
     neutral: {
          label: "Netral",
          emoji: "😐",
          accent: "#94a3b8",
          ring: "ring-slate-500/30",
          gradFrom: "from-slate-900",
          gradTo: "to-slate-800",
     },
};

const GENRE_COLOR: Record<
     string,
     { text: string; bg: string; border: string; dot: string }
> = {
     romance: {
          text: "text-rose-400",
          bg: "bg-rose-400/10",
          border: "border-rose-400/20",
          dot: "bg-rose-400",
     },
     fiksi_sastra: {
          text: "text-violet-400",
          bg: "bg-violet-400/10",
          border: "border-violet-400/20",
          dot: "bg-violet-400",
     },
     novel: {
          text: "text-blue-400",
          bg: "bg-blue-400/10",
          border: "border-blue-400/20",
          dot: "bg-blue-400",
     },
     adventure: {
          text: "text-orange-400",
          bg: "bg-orange-400/10",
          border: "border-orange-400/20",
          dot: "bg-orange-400",
     },
     thriller: {
          text: "text-slate-300",
          bg: "bg-slate-700/30",
          border: "border-slate-600/30",
          dot: "bg-slate-400",
     },
     horor: {
          text: "text-red-400",
          bg: "bg-red-400/10",
          border: "border-red-400/20",
          dot: "bg-red-400",
     },
     mystery: {
          text: "text-purple-400",
          bg: "bg-purple-400/10",
          border: "border-purple-400/20",
          dot: "bg-purple-400",
     },
     fiksi_ilmiah: {
          text: "text-sky-400",
          bg: "bg-sky-400/10",
          border: "border-sky-400/20",
          dot: "bg-sky-400",
     },
     fantasi: {
          text: "text-fuchsia-400",
          bg: "bg-fuchsia-400/10",
          border: "border-fuchsia-400/20",
          dot: "bg-fuchsia-400",
     },
     pengembangan_diri: {
          text: "text-emerald-400",
          bg: "bg-emerald-400/10",
          border: "border-emerald-400/20",
          dot: "bg-emerald-400",
     },
     cerpen: {
          text: "text-pink-400",
          bg: "bg-pink-400/10",
          border: "border-pink-400/20",
          dot: "bg-pink-400",
     },
};
const DEFAULT_GENRE = {
     text: "text-zinc-400",
     bg: "bg-zinc-700/30",
     border: "border-zinc-600/30",
     dot: "bg-zinc-400",
};

const SAMPLE_MOODS = [
     "Aku sangat sedih karena putus sama pacar...",
     "Hari ini aku merasa bahagia sekali!",
     "Aku takut menghadapi ujian besok...",
     "Aku marah dengan sikap teman kerjaku",
];

const HOW_STEPS = [
     {
          icon: "✍️",
          n: "01",
          title: "Ceritakan perasaanmu",
          desc: "Tulis apapun yang kamu rasakan saat ini, bebas dan jujur.",
     },
     {
          icon: "🧠",
          n: "02",
          title: "AI mendeteksi emosi",
          desc: "RoBERTa menganalisis teks dan mengidentifikasi emosi dominanmu.",
     },
     {
          icon: "📚",
          n: "03",
          title: "Dapatkan rekomendasi",
          desc: "Buku dipilih secara semantik agar paling relevan dengan curhatan kamu.",
     },
];

/* ─── Scroll-reveal hook ─────────────────────────────────────────────────── */
function useReveal(threshold = 0.15) {
     const ref = useRef<HTMLDivElement>(null);
     const [visible, setVisible] = useState(false);
     useEffect(() => {
          const el = ref.current;
          if (!el) return;
          const obs = new IntersectionObserver(
               ([entry]) => {
                    if (entry.isIntersecting) {
                         setVisible(true);
                         obs.disconnect();
                    }
               },
               { threshold },
          );
          obs.observe(el);
          return () => obs.disconnect();
     }, [threshold]);
     return { ref, visible };
}

/* ─── Reusable reveal wrapper ────────────────────────────────────────────── */
function Reveal({
     children,
     delay = 0,
     className = "",
}: {
     children: React.ReactNode;
     delay?: number;
     className?: string;
}) {
     const { ref, visible } = useReveal();
     return (
          <div
               ref={ref}
               className={className}
               style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(28px)",
                    transition: `opacity .6s ${delay}ms ease, transform .6s ${delay}ms ease`,
               }}
          >
               {children}
          </div>
     );
}

/* ─── Confidence bar ─────────────────────────────────────────────────────── */
function Bar({
     pct,
     color,
     height = 6,
}: {
     pct: number;
     color: string;
     height?: number;
}) {
     const [w, setW] = useState(0);
     useEffect(() => {
          const t = setTimeout(() => setW(pct), 80);
          return () => clearTimeout(t);
     }, [pct]);
     return (
          <div
               className="w-full rounded-full bg-zinc-800 overflow-hidden"
               style={{ height }}
          >
               <div
                    className="h-full rounded-full"
                    style={{
                         width: `${w}%`,
                         background: color,
                         transition: "width .8s cubic-bezier(.16,1,.3,1)",
                    }}
               />
          </div>
     );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Home() {
     const [text, setText] = useState("");
     const [result, setResult] = useState<EmotionResult | null>(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState("");
     const resultRef = useRef<HTMLDivElement>(null);

     const analyze = useCallback(async () => {
          if (!text.trim()) return;
          setLoading(true);
          setError("");
          setResult(null);
          try {
               const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/detect-emotion`,
                    {
                         method: "POST",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify({ text }),
                    },
               );
               if (!res.ok) throw new Error("Gagal menghubungi server.");
               setResult(await res.json());
          } catch (e: any) {
               setError(e.message || "Terjadi kesalahan.");
          } finally {
               setLoading(false);
          }
     }, [text]);

     useEffect(() => {
          if (result && resultRef.current) {
               setTimeout(
                    () =>
                         resultRef.current?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                         }),
                    120,
               );
          }
     }, [result]);

     const em = result
          ? (EMOTION_META[result.primary_emotion] ?? EMOTION_META.neutral)
          : null;

     return (
          <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
               {/* ── Global keyframes ─────────────────────────────────────────────── */}
               <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse-dot { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-20px) scale(1.05)} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,25px) scale(1.08)} }
        .animate-spin-slow { animation: spin .7s linear infinite; }
        .animate-float     { animation: float 3s ease-in-out infinite; }
        .animate-pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
        .animate-blob1     { animation: blob1 8s ease-in-out infinite; }
        .animate-blob2     { animation: blob2 10s ease-in-out infinite; }
        textarea:focus { outline: none; }
        textarea::placeholder { color: #52525b; }
        html { scroll-behavior: smooth; }
      `}</style>

               {/* ══ NAVBAR ══════════════════════════════════════════════════════════ */}
               <nav
                    className="fixed top-0 inset-x-0 z-50 h-16 flex items-center justify-between px-6 md:px-10
                      bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900"
               >
                    <div className="flex items-center gap-2.5">
                         <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-base select-none">
                              📚
                         </div>
                         <span className="font-extrabold text-base tracking-tight">
                              MoodRead
                         </span>
                    </div>
                    <div className="hidden sm:flex gap-8 text-sm text-zinc-500">
                         <a
                              href="#how"
                              className="hover:text-zinc-100 transition-colors duration-150"
                         >
                              Cara Kerja
                         </a>
                         <a
                              href="#analyze"
                              className="hover:text-zinc-100 transition-colors duration-150"
                         >
                              Analisis
                         </a>
                    </div>
               </nav>

               {/* ══ HERO ════════════════════════════════════════════════════════════ */}
               <section
                    className="relative min-h-screen flex flex-col items-center justify-center
                          text-center px-6 pt-20 pb-16 overflow-hidden"
               >
                    {/* Glow blobs */}
                    <div
                         className="animate-blob1 pointer-events-none absolute top-1/4 left-1/4 w-96 h-96 rounded-full
                        bg-indigo-600/20 blur-[80px]"
                    />
                    <div
                         className="animate-blob2 pointer-events-none absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full
                        bg-rose-600/15 blur-[80px]"
                    />

                    {/* Badge */}
                    <div
                         className="relative mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                        border border-zinc-800 bg-zinc-900 text-zinc-400 text-xs font-medium"
                    >
                         <span className="animate-pulse-dot w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                         Powered by RoBERTa · Sentence Transformer
                    </div>

                    {/* Headline */}
                    <h1
                         className="relative font-extrabold tracking-tighter leading-[1.08]
                       text-4xl sm:text-6xl lg:text-7xl max-w-3xl mb-6"
                    >
                         Buku yang tepat{" "}
                         <span
                              className="bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400
                           bg-clip-text text-transparent"
                         >
                              untuk perasaanmu
                         </span>
                    </h1>

                    <p className="relative text-zinc-400 text-base sm:text-lg max-w-md leading-relaxed mb-10">
                         Ceritakan apa yang kamu rasakan. AI kami mendeteksi
                         emosimu dan merekomendasikan buku yang paling relevan.
                    </p>

                    {/* Emotion pills */}
                    <div className="relative flex flex-wrap gap-2 justify-center mb-12">
                         {Object.entries(EMOTION_META).map(([, m]) => (
                              <div
                                   key={m.label}
                                   className="flex items-center gap-1.5 px-4 py-1.5 rounded-full
                         border border-zinc-800 bg-zinc-900/60 text-zinc-400 text-sm"
                              >
                                   <span>{m.emoji}</span>
                                   <span>{m.label}</span>
                              </div>
                         ))}
                    </div>

                    {/* CTA */}
                    <a
                         href="#analyze"
                         className="relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl
                     bg-white text-zinc-950 font-bold text-sm
                     hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(255,255,255,.12)]
                     transition-all duration-200"
                    >
                         Mulai Analisis <span className="text-base">↓</span>
                    </a>
               </section>

               {/* ══ HOW IT WORKS ════════════════════════════════════════════════════ */}
               <section id="how" className="px-6 py-24 max-w-4xl mx-auto">
                    <Reveal>
                         <p className="text-center text-xs font-bold tracking-[0.2em] text-zinc-600 uppercase mb-3">
                              Cara Kerja
                         </p>
                         <h2 className="text-center font-extrabold tracking-tight text-3xl sm:text-4xl mb-14">
                              Tiga langkah sederhana
                         </h2>
                    </Reveal>

                    <div className="grid sm:grid-cols-3 gap-4">
                         {HOW_STEPS.map((s, i) => (
                              <Reveal key={s.n} delay={i * 100}>
                                   <div
                                        className="h-full rounded-2xl border border-zinc-800 bg-zinc-900 p-7
                              hover:border-zinc-700 transition-colors duration-200"
                                   >
                                        <div className="text-3xl mb-5">
                                             {s.icon}
                                        </div>
                                        <div className="text-[10px] font-bold tracking-[0.2em] text-zinc-600 mb-2">
                                             {s.n}
                                        </div>
                                        <h3 className="font-bold text-base mb-2">
                                             {s.title}
                                        </h3>
                                        <p className="text-sm text-zinc-500 leading-relaxed">
                                             {s.desc}
                                        </p>
                                   </div>
                              </Reveal>
                         ))}
                    </div>
               </section>

               {/* ══ ANALYZE SECTION ═════════════════════════════════════════════════ */}
               <section id="analyze" className="px-6 py-24 max-w-3xl mx-auto">
                    <Reveal>
                         <p className="text-center text-xs font-bold tracking-[0.2em] text-zinc-600 uppercase mb-3">
                              Analisis
                         </p>
                         <h2 className="text-center font-extrabold tracking-tight text-3xl sm:text-4xl mb-2">
                              Ceritakan perasaanmu
                         </h2>
                         <p className="text-center text-zinc-500 text-sm mb-10">
                              Tulis apapun — tidak ada yang salah
                         </p>
                    </Reveal>

                    <Reveal delay={80}>
                         {/* Sample mood pills */}
                         <div className="flex flex-wrap gap-2 mb-4">
                              {SAMPLE_MOODS.map((s) => (
                                   <button
                                        key={s}
                                        onClick={() => setText(s)}
                                        className="px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900
                           text-zinc-500 text-xs font-medium cursor-pointer
                           hover:border-zinc-600 hover:text-zinc-200 transition-all duration-150"
                                   >
                                        {s.substring(0, 30)}…
                                   </button>
                              ))}
                         </div>

                         {/* Textarea */}
                         <textarea
                              rows={5}
                              value={text}
                              onChange={(e) => setText(e.target.value)}
                              onKeyDown={(e) => {
                                   if (e.key === "Enter" && e.ctrlKey)
                                        analyze();
                              }}
                              placeholder="Contoh: Aku merasa sangat sedih karena kehilangan seseorang yang kusayang..."
                              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4
                       text-zinc-100 text-base leading-relaxed resize-none
                       focus:border-zinc-600 focus:ring-2 focus:ring-zinc-700
                       transition-all duration-200 mb-3"
                         />

                         {/* Bottom row */}
                         <div className="flex items-center justify-between mb-8">
                              <span className="text-xs text-zinc-600">
                                   {text.length} karakter · Ctrl+Enter untuk
                                   kirim
                              </span>
                              <button
                                   onClick={analyze}
                                   disabled={loading || !text.trim()}
                                   className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm
                          transition-all duration-200
                          ${
                               loading || !text.trim()
                                    ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                    : "bg-white text-zinc-950 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,255,255,.12)]"
                          }`}
                              >
                                   {loading ? (
                                        <>
                                             <span className="animate-spin-slow w-4 h-4 rounded-full border-2 border-zinc-600 border-t-zinc-300" />
                                             Menganalisis...
                                        </>
                                   ) : (
                                        <>Deteksi Emosi ✨</>
                                   )}
                              </button>
                         </div>

                         {error && (
                              <div className="mb-8 px-4 py-3 rounded-xl bg-red-950/60 border border-red-900 text-red-400 text-sm">
                                   ⚠️ {error}
                              </div>
                         )}
                    </Reveal>

                    {/* ══ RESULTS ════════════════════════════════════════════════════ */}
                    {result && em && (
                         <div ref={resultRef} className="space-y-6">
                              {/* ── Emotion Card ── */}
                              <Reveal>
                                   <div
                                        className={`relative rounded-3xl bg-gradient-to-br ${em.gradFrom} ${em.gradTo}
                               border ring-2 ${em.ring} border-white/5 p-7 overflow-hidden`}
                                   >
                                        {/* Glow orb */}
                                        <div
                                             className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-40"
                                             style={{ background: em.accent }}
                                        />

                                        <div className="relative flex flex-wrap gap-6 items-start">
                                             {/* Emoji */}
                                             <div className="animate-float text-7xl leading-none drop-shadow-xl select-none">
                                                  {em.emoji}
                                             </div>

                                             {/* Label + bar */}
                                             <div className="flex-1 min-w-[180px]">
                                                  <p
                                                       className="text-[10px] font-bold tracking-[0.2em] mb-1.5"
                                                       style={{
                                                            color:
                                                                 em.accent +
                                                                 "bb",
                                                       }}
                                                  >
                                                       EMOSI TERDETEKSI
                                                  </p>
                                                  <h2 className="font-extrabold tracking-tight text-4xl mb-5">
                                                       {em.label}
                                                  </h2>
                                                  <div className="flex justify-between text-xs mb-1.5">
                                                       <span className="text-zinc-400">
                                                            Tingkat keyakinan
                                                       </span>
                                                       <span
                                                            className="font-bold"
                                                            style={{
                                                                 color: em.accent,
                                                            }}
                                                       >
                                                            {(
                                                                 result.primary_score *
                                                                 100
                                                            ).toFixed(1)}
                                                            %
                                                       </span>
                                                  </div>
                                                  <Bar
                                                       pct={
                                                            result.primary_score *
                                                            100
                                                       }
                                                       color={em.accent}
                                                       height={6}
                                                  />
                                             </div>

                                             {/* Distribution */}
                                             <div className="rounded-2xl bg-black/25 px-5 py-4 min-w-[170px] space-y-3">
                                                  <p className="text-[10px] font-bold tracking-[0.18em] text-zinc-500 mb-3">
                                                       DISTRIBUSI EMOSI
                                                  </p>
                                                  {result.top_emotions.map(
                                                       (e) => {
                                                            const m =
                                                                 EMOTION_META[
                                                                      e.emotion
                                                                 ] ??
                                                                 EMOTION_META.neutral;
                                                            const pct =
                                                                 e.score * 100;
                                                            return (
                                                                 <div
                                                                      key={
                                                                           e.emotion
                                                                      }
                                                                 >
                                                                      <div className="flex justify-between text-xs mb-1">
                                                                           <span className="flex items-center gap-1.5 text-zinc-300">
                                                                                <span>
                                                                                     {
                                                                                          m.emoji
                                                                                     }
                                                                                </span>
                                                                                {
                                                                                     m.label
                                                                                }
                                                                           </span>
                                                                           <span className="text-zinc-500 tabular-nums">
                                                                                {pct.toFixed(
                                                                                     1,
                                                                                )}
                                                                                %
                                                                           </span>
                                                                      </div>
                                                                      <Bar
                                                                           pct={
                                                                                pct
                                                                           }
                                                                           color={
                                                                                m.accent
                                                                           }
                                                                           height={
                                                                                4
                                                                           }
                                                                      />
                                                                 </div>
                                                            );
                                                       },
                                                  )}
                                             </div>
                                        </div>
                                   </div>
                              </Reveal>

                              {/* ── Genre Pills ── */}
                              <Reveal delay={60}>
                                   <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-600 uppercase mb-3">
                                        Genre yang cocok
                                   </p>
                                   <div className="flex flex-wrap gap-2">
                                        {result.recommended_genres.map((g) => {
                                             const gc =
                                                  GENRE_COLOR[g] ??
                                                  DEFAULT_GENRE;
                                             return (
                                                  <span
                                                       key={g}
                                                       className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full
                                  border text-sm font-semibold capitalize
                                  ${gc.text} ${gc.bg} ${gc.border}`}
                                                  >
                                                       <span
                                                            className={`w-1.5 h-1.5 rounded-full ${gc.dot}`}
                                                       />
                                                       {g.replace(/_/g, " ")}
                                                  </span>
                                             );
                                        })}
                                   </div>
                              </Reveal>

                              {/* ── Book Recommendations ── */}
                              <Reveal delay={120}>
                                   <div className="flex items-end justify-between mb-5">
                                        <div>
                                             <h3 className="font-extrabold tracking-tight text-xl">
                                                  Rekomendasi Buku
                                             </h3>
                                             <p className="text-xs text-zinc-500 mt-1">
                                                  Dipilih berdasarkan kesamaan
                                                  makna dengan curhatan kamu
                                             </p>
                                        </div>
                                        <span
                                             className="px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900
                                 text-xs text-zinc-500"
                                        >
                                             {
                                                  result.book_recommendations
                                                       .length
                                             }{" "}
                                             buku
                                        </span>
                                   </div>

                                   {result.book_recommendations.length > 0 ? (
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                             {result.book_recommendations.map(
                                                  (book, i) => {
                                                       const gc =
                                                            GENRE_COLOR[
                                                                 book.genre
                                                            ] ?? DEFAULT_GENRE;
                                                       return (
                                                            <Reveal
                                                                 key={i}
                                                                 delay={i * 60}
                                                            >
                                                                 <div
                                                                      className="group h-full flex flex-col rounded-2xl border border-zinc-800
                                        bg-zinc-900 overflow-hidden
                                        hover:-translate-y-1 hover:border-zinc-700
                                        hover:shadow-[0_20px_40px_rgba(0,0,0,.5)]
                                        transition-all duration-200"
                                                                 >
                                                                      {/* Accent top bar */}
                                                                      <div
                                                                           className={`h-1 w-full ${gc.dot}`}
                                                                      />

                                                                      <div className="flex flex-col flex-1 p-5">
                                                                           {/* Genre tag */}
                                                                           <span
                                                                                className={`self-start inline-flex items-center gap-1 px-2.5 py-0.5
                                              rounded-md border text-[11px] font-bold uppercase
                                              tracking-wide capitalize mb-3
                                              ${gc.text} ${gc.bg} ${gc.border}`}
                                                                           >
                                                                                {book.genre?.replace(
                                                                                     /_/g,
                                                                                     " ",
                                                                                ) ??
                                                                                     "—"}
                                                                           </span>

                                                                           {/* Title */}
                                                                           <h4
                                                                                className="font-bold text-sm leading-snug mb-1.5 text-zinc-100
                                           group-hover:text-white transition-colors"
                                                                           >
                                                                                {book.judul ??
                                                                                     "Judul tidak tersedia"}
                                                                           </h4>

                                                                           {/* Author */}
                                                                           {book.penulis && (
                                                                                <p className="text-xs text-zinc-500 mb-3">
                                                                                     {
                                                                                          book.penulis
                                                                                     }
                                                                                     {book.tahun && (
                                                                                          <span className="text-zinc-700">
                                                                                               {" "}
                                                                                               ·{" "}
                                                                                               {
                                                                                                    book.tahun
                                                                                               }
                                                                                          </span>
                                                                                     )}
                                                                                </p>
                                                                           )}

                                                                           {/* Synopsis */}
                                                                           {book.sinopsis && (
                                                                                <p
                                                                                     className="mt-auto text-xs text-zinc-600 leading-relaxed
                                            line-clamp-3"
                                                                                >
                                                                                     {
                                                                                          book.sinopsis
                                                                                     }
                                                                                </p>
                                                                           )}
                                                                      </div>
                                                                 </div>
                                                            </Reveal>
                                                       );
                                                  },
                                             )}
                                        </div>
                                   ) : (
                                        <div
                                             className="flex flex-col items-center justify-center py-16
                                rounded-2xl border border-zinc-800 bg-zinc-900 text-center"
                                        >
                                             <span className="text-4xl mb-3">
                                                  📭
                                             </span>
                                             <p className="text-zinc-500 text-sm">
                                                  Belum ada buku untuk genre ini
                                             </p>
                                        </div>
                                   )}
                              </Reveal>
                         </div>
                    )}
               </section>

               {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
               <footer className="border-t border-zinc-900 py-8 text-center text-xs text-zinc-700">
                    <span className="font-bold text-zinc-600">MoodRead</span> —
                    Deteksi emosi berbasis RoBERTa Indonesia
               </footer>
          </div>
     );
}
