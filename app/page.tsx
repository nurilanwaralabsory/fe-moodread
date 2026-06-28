"use client";
import { useState, useRef, useEffect } from "react";

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

const EMOTION_META: Record<
     string,
     {
          label: string;
          emoji: string;
          accent: string;
          glow: string;
          gradFrom: string;
          gradTo: string;
     }
> = {
     sadness: {
          label: "Sedih",
          emoji: "😢",
          accent: "#6366f1",
          glow: "#6366f122",
          gradFrom: "#1e1b4b",
          gradTo: "#312e81",
     },
     happy: {
          label: "Bahagia",
          emoji: "😊",
          accent: "#f59e0b",
          glow: "#f59e0b22",
          gradFrom: "#78350f",
          gradTo: "#92400e",
     },
     joy: {
          label: "Gembira",
          emoji: "😄",
          accent: "#fbbf24",
          glow: "#fbbf2422",
          gradFrom: "#78350f",
          gradTo: "#92400e",
     },
     love: {
          label: "Cinta",
          emoji: "❤️",
          accent: "#f43f5e",
          glow: "#f43f5e22",
          gradFrom: "#4c0519",
          gradTo: "#881337",
     },
     anger: {
          label: "Marah",
          emoji: "😤",
          accent: "#ef4444",
          glow: "#ef444422",
          gradFrom: "#450a0a",
          gradTo: "#7f1d1d",
     },
     fear: {
          label: "Takut",
          emoji: "😨",
          accent: "#a855f7",
          glow: "#a855f722",
          gradFrom: "#3b0764",
          gradTo: "#581c87",
     },
     surprise: {
          label: "Terkejut",
          emoji: "😲",
          accent: "#06b6d4",
          glow: "#06b6d422",
          gradFrom: "#083344",
          gradTo: "#164e63",
     },
     neutral: {
          label: "Netral",
          emoji: "😐",
          accent: "#94a3b8",
          glow: "#94a3b822",
          gradFrom: "#0f172a",
          gradTo: "#1e293b",
     },
};

const GENRE_COLOR: Record<string, string> = {
     romance: "#f43f5e",
     fiksi_sastra: "#8b5cf6",
     novel: "#3b82f6",
     adventure: "#f97316",
     thriller: "#475569",
     horor: "#dc2626",
     mystery: "#7c3aed",
     fiksi_ilmiah: "#0ea5e9",
     fantasi: "#a855f7",
     pengembangan_diri: "#10b981",
     cerpen: "#ec4899",
};

const SAMPLE_MOODS = [
     "Aku sangat sedih karena putus sama pacar...",
     "Hari ini aku merasa bahagia sekali!",
     "Aku takut menghadapi ujian besok...",
     "Aku marah dengan sikap teman kerjaku",
];

export default function Home() {
     const [text, setText] = useState("");
     const [result, setResult] = useState<EmotionResult | null>(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState("");
     const [charCount, setCharCount] = useState(0);
     const resultRef = useRef<HTMLDivElement>(null);

     const analyze = async () => {
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
     };

     useEffect(() => {
          if (result && resultRef.current) {
               setTimeout(
                    () =>
                         resultRef.current?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                         }),
                    100,
               );
          }
     }, [result]);

     const em = result
          ? (EMOTION_META[result.primary_emotion] ?? EMOTION_META.neutral)
          : null;

     return (
          <>
               <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #09090b; color: #fafafa; }

        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse  { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

        .fade-up   { animation: fadeUp .5s ease both; }
        .fade-up-2 { animation: fadeUp .5s .1s ease both; }
        .fade-up-3 { animation: fadeUp .5s .2s ease both; }

        .pill-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 99px; border: 1.5px solid #27272a;
          background: #18181b; color: #a1a1aa; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all .2s; font-family: inherit;
        }
        .pill-btn:hover { border-color: #52525b; color: #fafafa; background: #27272a; }

        .cta-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 14px; border: none;
          background: #fafafa; color: #09090b;
          font-size: 15px; font-weight: 700; cursor: pointer;
          transition: all .2s; font-family: inherit;
          box-shadow: 0 0 0 0 rgba(255,255,255,.3);
        }
        .cta-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(255,255,255,.15); }
        .cta-btn:disabled { opacity: .4; cursor: not-allowed; }
        .cta-btn.loading { background: #27272a; color: #a1a1aa; }

        .textarea-wrap { position: relative; }
        .textarea-wrap textarea {
          width: 100%; background: #18181b; border: 1.5px solid #27272a;
          border-radius: 16px; padding: 20px; color: #fafafa;
          font-size: 16px; font-family: inherit; line-height: 1.7;
          resize: none; outline: none; transition: border-color .2s;
        }
        .textarea-wrap textarea::placeholder { color: #52525b; }
        .textarea-wrap textarea:focus { border-color: #52525b; }

        .book-card {
          background: #18181b; border: 1.5px solid #27272a;
          border-radius: 20px; overflow: hidden;
          transition: transform .2s, box-shadow .2s, border-color .2s;
          display: flex; flex-direction: column;
        }
        .book-card:hover { transform: translateY(-4px); border-color: #3f3f46; box-shadow: 0 20px 40px rgba(0,0,0,.4); }

        .emotion-bar-track { height: 6px; background: #27272a; border-radius: 99px; overflow: hidden; }
        .emotion-bar-fill  { height: 100%; border-radius: 99px; transition: width .8s cubic-bezier(.16,1,.3,1); }

        .genre-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 14px; border-radius: 99px;
          font-size: 13px; font-weight: 600;
        }

        .result-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }

        .nav-link { color: #71717a; font-size: 14px; text-decoration: none; transition: color .15s; }
        .nav-link:hover { color: #fafafa; }
      `}</style>

               <div style={{ minHeight: "100vh", background: "#09090b" }}>
                    {/* ── Navbar ── */}
                    <nav
                         style={{
                              position: "fixed",
                              top: 0,
                              left: 0,
                              right: 0,
                              zIndex: 100,
                              padding: "0 32px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              height: 64,
                              background: "rgba(9,9,11,.8)",
                              backdropFilter: "blur(12px)",
                              borderBottom: "1px solid #18181b",
                         }}
                    >
                         <div
                              style={{
                                   display: "flex",
                                   alignItems: "center",
                                   gap: 10,
                              }}
                         >
                              <div
                                   style={{
                                        width: 34,
                                        height: 34,
                                        background: "#fafafa",
                                        borderRadius: 10,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 18,
                                   }}
                              >
                                   📚
                              </div>
                              <span
                                   style={{
                                        fontWeight: 800,
                                        fontSize: 17,
                                        letterSpacing: "-0.4px",
                                   }}
                              >
                                   MoodRead
                              </span>
                         </div>
                         <div style={{ display: "flex", gap: 28 }}>
                              <a href="#how" className="nav-link">
                                   Cara Kerja
                              </a>
                              <a href="#analyze" className="nav-link">
                                   Analisis
                              </a>
                         </div>
                    </nav>

                    {/* ── Hero Section ── */}
                    <section
                         style={{
                              minHeight: "100vh",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "100px 24px 60px",
                              position: "relative",
                              overflow: "hidden",
                              textAlign: "center",
                         }}
                    >
                         {/* Background glow blobs */}
                         <div
                              style={{
                                   position: "absolute",
                                   top: "15%",
                                   left: "20%",
                                   width: 500,
                                   height: 500,
                                   borderRadius: "50%",
                                   background:
                                        "radial-gradient(circle, #6366f130 0%, transparent 70%)",
                                   filter: "blur(60px)",
                                   pointerEvents: "none",
                              }}
                         />
                         <div
                              style={{
                                   position: "absolute",
                                   top: "30%",
                                   right: "15%",
                                   width: 400,
                                   height: 400,
                                   borderRadius: "50%",
                                   background:
                                        "radial-gradient(circle, #f43f5e20 0%, transparent 70%)",
                                   filter: "blur(60px)",
                                   pointerEvents: "none",
                              }}
                         />

                         {/* Badge */}
                         <div
                              className="fade-up"
                              style={{
                                   display: "inline-flex",
                                   alignItems: "center",
                                   gap: 8,
                                   padding: "6px 16px",
                                   borderRadius: 99,
                                   border: "1px solid #27272a",
                                   background: "#18181b",
                                   fontSize: 13,
                                   color: "#a1a1aa",
                                   marginBottom: 28,
                              }}
                         >
                              <span
                                   style={{
                                        width: 7,
                                        height: 7,
                                        borderRadius: "50%",
                                        background: "#22c55e",
                                        display: "inline-block",
                                        animation: "pulse 2s infinite",
                                   }}
                              />
                              Powered by RoBERTa · Sentence Transformer
                         </div>

                         {/* Headline */}
                         <h1
                              className="fade-up-2"
                              style={{
                                   fontSize: "clamp(40px, 6vw, 72px)",
                                   fontWeight: 800,
                                   lineHeight: 1.1,
                                   letterSpacing: "-2px",
                                   maxWidth: 780,
                                   marginBottom: 24,
                              }}
                         >
                              Buku yang tepat{" "}
                              <span
                                   style={{
                                        background:
                                             "linear-gradient(135deg, #6366f1, #f43f5e)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                   }}
                              >
                                   untuk perasaanmu
                              </span>
                         </h1>

                         <p
                              className="fade-up-3"
                              style={{
                                   fontSize: "clamp(16px, 2vw, 19px)",
                                   color: "#71717a",
                                   maxWidth: 520,
                                   lineHeight: 1.7,
                                   marginBottom: 48,
                              }}
                         >
                              Ceritakan apa yang kamu rasakan. AI kami
                              mendeteksi emosimu dan merekomendasikan buku yang
                              paling relevan untukmu.
                         </p>

                         {/* Floating emoji pills */}
                         <div
                              className="fade-up-3"
                              style={{
                                   display: "flex",
                                   gap: 10,
                                   flexWrap: "wrap",
                                   justifyContent: "center",
                                   marginBottom: 48,
                              }}
                         >
                              {[
                                   { e: "😢", l: "Sedih" },
                                   { e: "😊", l: "Bahagia" },
                                   { e: "❤️", l: "Cinta" },
                                   { e: "😤", l: "Marah" },
                                   { e: "😨", l: "Takut" },
                                   { e: "😲", l: "Terkejut" },
                              ].map(({ e, l }) => (
                                   <div
                                        key={l}
                                        style={{
                                             padding: "8px 18px",
                                             borderRadius: 99,
                                             border: "1px solid #27272a",
                                             background: "#18181b",
                                             fontSize: 14,
                                             display: "flex",
                                             alignItems: "center",
                                             gap: 7,
                                             color: "#a1a1aa",
                                        }}
                                   >
                                        <span>{e}</span>
                                        <span>{l}</span>
                                   </div>
                              ))}
                         </div>

                         {/* CTA */}
                         <a
                              href="#analyze"
                              className="fade-up-3"
                              style={{
                                   display: "inline-flex",
                                   alignItems: "center",
                                   gap: 8,
                                   padding: "14px 32px",
                                   borderRadius: 14,
                                   background: "#fafafa",
                                   color: "#09090b",
                                   fontWeight: 700,
                                   fontSize: 15,
                                   textDecoration: "none",
                                   transition: "all .2s",
                              }}
                              onMouseEnter={(e) => {
                                   (
                                        e.currentTarget as HTMLAnchorElement
                                   ).style.transform = "translateY(-2px)";
                                   (
                                        e.currentTarget as HTMLAnchorElement
                                   ).style.boxShadow =
                                        "0 12px 32px rgba(255,255,255,.15)";
                              }}
                              onMouseLeave={(e) => {
                                   (
                                        e.currentTarget as HTMLAnchorElement
                                   ).style.transform = "none";
                                   (
                                        e.currentTarget as HTMLAnchorElement
                                   ).style.boxShadow = "none";
                              }}
                         >
                              Mulai Analisis <span>↓</span>
                         </a>
                    </section>

                    {/* ── How it works ── */}
                    <section
                         id="how"
                         style={{
                              padding: "80px 24px",
                              maxWidth: 900,
                              margin: "0 auto",
                         }}
                    >
                         <p
                              style={{
                                   textAlign: "center",
                                   fontSize: 13,
                                   color: "#52525b",
                                   fontWeight: 600,
                                   letterSpacing: 2,
                                   marginBottom: 16,
                              }}
                         >
                              CARA KERJA
                         </p>
                         <h2
                              style={{
                                   textAlign: "center",
                                   fontSize: "clamp(24px, 3vw, 36px)",
                                   fontWeight: 800,
                                   letterSpacing: "-1px",
                                   marginBottom: 56,
                              }}
                         >
                              Tiga langkah sederhana
                         </h2>
                         <div
                              style={{
                                   display: "grid",
                                   gridTemplateColumns:
                                        "repeat(auto-fit, minmax(220px, 1fr))",
                                   gap: 20,
                              }}
                         >
                              {[
                                   {
                                        n: "01",
                                        icon: "✍️",
                                        title: "Ceritakan perasaanmu",
                                        desc: "Ketik apapun yang kamu rasakan saat ini, bebas dan jujur.",
                                   },
                                   {
                                        n: "02",
                                        icon: "🧠",
                                        title: "AI mendeteksi emosi",
                                        desc: "RoBERTa menganalisis teks dan mengidentifikasi emosi dominanmu.",
                                   },
                                   {
                                        n: "03",
                                        icon: "📚",
                                        title: "Dapatkan rekomendasi",
                                        desc: "Buku dipilih secara semantik agar paling relevan dengan curhatan kamu.",
                                   },
                              ].map((s) => (
                                   <div
                                        key={s.n}
                                        style={{
                                             background: "#18181b",
                                             border: "1.5px solid #27272a",
                                             borderRadius: 20,
                                             padding: "28px 24px",
                                        }}
                                   >
                                        <div
                                             style={{
                                                  fontSize: 28,
                                                  marginBottom: 16,
                                             }}
                                        >
                                             {s.icon}
                                        </div>
                                        <div
                                             style={{
                                                  fontSize: 11,
                                                  color: "#52525b",
                                                  fontWeight: 700,
                                                  letterSpacing: 2,
                                                  marginBottom: 8,
                                             }}
                                        >
                                             {s.n}
                                        </div>
                                        <h3
                                             style={{
                                                  fontSize: 16,
                                                  fontWeight: 700,
                                                  marginBottom: 8,
                                             }}
                                        >
                                             {s.title}
                                        </h3>
                                        <p
                                             style={{
                                                  fontSize: 14,
                                                  color: "#71717a",
                                                  lineHeight: 1.6,
                                             }}
                                        >
                                             {s.desc}
                                        </p>
                                   </div>
                              ))}
                         </div>
                    </section>

                    {/* ── Analyze Section ── */}
                    <section
                         id="analyze"
                         style={{
                              padding: "80px 24px",
                              maxWidth: 760,
                              margin: "0 auto",
                         }}
                    >
                         <p
                              style={{
                                   textAlign: "center",
                                   fontSize: 13,
                                   color: "#52525b",
                                   fontWeight: 600,
                                   letterSpacing: 2,
                                   marginBottom: 16,
                              }}
                         >
                              ANALISIS
                         </p>
                         <h2
                              style={{
                                   textAlign: "center",
                                   fontSize: "clamp(24px, 3vw, 36px)",
                                   fontWeight: 800,
                                   letterSpacing: "-1px",
                                   marginBottom: 8,
                              }}
                         >
                              Ceritakan perasaanmu
                         </h2>
                         <p
                              style={{
                                   textAlign: "center",
                                   color: "#71717a",
                                   fontSize: 15,
                                   marginBottom: 40,
                              }}
                         >
                              Tulis apapun — tidak ada yang salah
                         </p>

                         {/* Sample moods */}
                         <div
                              style={{
                                   display: "flex",
                                   gap: 8,
                                   flexWrap: "wrap",
                                   marginBottom: 16,
                              }}
                         >
                              {SAMPLE_MOODS.map((s) => (
                                   <button
                                        key={s}
                                        className="pill-btn"
                                        onClick={() => {
                                             setText(s);
                                             setCharCount(s.length);
                                        }}
                                   >
                                        {s.substring(0, 28)}…
                                   </button>
                              ))}
                         </div>

                         {/* Textarea */}
                         <div
                              className="textarea-wrap"
                              style={{ marginBottom: 16 }}
                         >
                              <textarea
                                   rows={5}
                                   placeholder="Contoh: Aku merasa sangat sedih karena kehilangan seseorang yang kusayang..."
                                   value={text}
                                   onChange={(e) => {
                                        setText(e.target.value);
                                        setCharCount(e.target.value.length);
                                   }}
                                   onKeyDown={(e) => {
                                        if (e.key === "Enter" && e.ctrlKey)
                                             analyze();
                                   }}
                              />
                         </div>

                         {/* Footer row */}
                         <div
                              style={{
                                   display: "flex",
                                   alignItems: "center",
                                   justifyContent: "space-between",
                                   marginBottom: 32,
                              }}
                         >
                              <span style={{ fontSize: 13, color: "#52525b" }}>
                                   {charCount} karakter · Ctrl+Enter untuk kirim
                              </span>
                              <button
                                   className={`cta-btn${loading ? " loading" : ""}`}
                                   onClick={analyze}
                                   disabled={loading || !text.trim()}
                              >
                                   {loading ? (
                                        <>
                                             <span
                                                  style={{
                                                       width: 16,
                                                       height: 16,
                                                       border: "2px solid #52525b",
                                                       borderTopColor:
                                                            "#a1a1aa",
                                                       borderRadius: "50%",
                                                       animation:
                                                            "spin .7s linear infinite",
                                                       display: "inline-block",
                                                  }}
                                             />
                                             Menganalisis...
                                        </>
                                   ) : (
                                        <>
                                             Deteksi Emosi <span>✨</span>
                                        </>
                                   )}
                              </button>
                         </div>

                         {error && (
                              <div
                                   style={{
                                        padding: "14px 18px",
                                        borderRadius: 12,
                                        background: "#450a0a",
                                        border: "1px solid #7f1d1d",
                                        color: "#fca5a5",
                                        fontSize: 14,
                                        marginBottom: 32,
                                   }}
                              >
                                   ⚠️ {error}
                              </div>
                         )}

                         {/* ── Results ── */}
                         {result && em && (
                              <div ref={resultRef}>
                                   {/* Emotion Hero Card */}
                                   <div
                                        style={{
                                             borderRadius: 24,
                                             background: `linear-gradient(135deg, ${em.gradFrom}, ${em.gradTo})`,
                                             border: `1.5px solid ${em.accent}30`,
                                             padding: "32px 28px",
                                             marginBottom: 20,
                                             position: "relative",
                                             overflow: "hidden",
                                        }}
                                   >
                                        {/* Glow */}
                                        <div
                                             style={{
                                                  position: "absolute",
                                                  top: -60,
                                                  right: -60,
                                                  width: 200,
                                                  height: 200,
                                                  borderRadius: "50%",
                                                  background: `radial-gradient(circle, ${em.accent}40, transparent 70%)`,
                                                  pointerEvents: "none",
                                             }}
                                        />

                                        <div
                                             style={{
                                                  display: "flex",
                                                  gap: 20,
                                                  alignItems: "flex-start",
                                                  flexWrap: "wrap",
                                             }}
                                        >
                                             {/* Big emoji */}
                                             <div
                                                  style={{
                                                       fontSize: 64,
                                                       lineHeight: 1,
                                                       filter: "drop-shadow(0 4px 12px rgba(0,0,0,.4))",
                                                       animation:
                                                            "float 3s ease-in-out infinite",
                                                  }}
                                             >
                                                  {em.emoji}
                                             </div>

                                             <div
                                                  style={{
                                                       flex: 1,
                                                       minWidth: 200,
                                                  }}
                                             >
                                                  <p
                                                       style={{
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            letterSpacing: 2,
                                                            color: `${em.accent}cc`,
                                                            marginBottom: 6,
                                                       }}
                                                  >
                                                       EMOSI TERDETEKSI
                                                  </p>
                                                  <h2
                                                       style={{
                                                            fontSize: 36,
                                                            fontWeight: 800,
                                                            letterSpacing:
                                                                 "-1px",
                                                            marginBottom: 16,
                                                       }}
                                                  >
                                                       {em.label}
                                                  </h2>
                                                  {/* Confidence bar */}
                                                  <div
                                                       style={{
                                                            marginBottom: 4,
                                                       }}
                                                  >
                                                       <div
                                                            style={{
                                                                 display: "flex",
                                                                 justifyContent:
                                                                      "space-between",
                                                                 marginBottom: 6,
                                                            }}
                                                       >
                                                            <span
                                                                 style={{
                                                                      fontSize: 13,
                                                                      color: "#a1a1aa",
                                                                 }}
                                                            >
                                                                 Tingkat
                                                                 keyakinan
                                                            </span>
                                                            <span
                                                                 style={{
                                                                      fontSize: 13,
                                                                      fontWeight: 700,
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
                                                       <div className="emotion-bar-track">
                                                            <div
                                                                 className="emotion-bar-fill"
                                                                 style={{
                                                                      width: `${(result.primary_score * 100).toFixed(0)}%`,
                                                                      background:
                                                                           em.accent,
                                                                 }}
                                                            />
                                                       </div>
                                                  </div>
                                             </div>

                                             {/* Top emotions breakdown */}
                                             <div
                                                  style={{
                                                       background:
                                                            "rgba(0,0,0,.25)",
                                                       borderRadius: 14,
                                                       padding: "14px 18px",
                                                       minWidth: 180,
                                                  }}
                                             >
                                                  <p
                                                       style={{
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            letterSpacing: 1.5,
                                                            color: "#71717a",
                                                            marginBottom: 12,
                                                       }}
                                                  >
                                                       DISTRIBUSI EMOSI
                                                  </p>
                                                  {result.top_emotions.map(
                                                       (e) => {
                                                            const m =
                                                                 EMOTION_META[
                                                                      e.emotion
                                                                 ] ??
                                                                 EMOTION_META.neutral;
                                                            const pct = (
                                                                 e.score * 100
                                                            ).toFixed(1);
                                                            return (
                                                                 <div
                                                                      key={
                                                                           e.emotion
                                                                      }
                                                                      style={{
                                                                           marginBottom: 10,
                                                                      }}
                                                                 >
                                                                      <div
                                                                           style={{
                                                                                display: "flex",
                                                                                justifyContent:
                                                                                     "space-between",
                                                                                marginBottom: 3,
                                                                                fontSize: 13,
                                                                           }}
                                                                      >
                                                                           <span
                                                                                style={{
                                                                                     display: "flex",
                                                                                     gap: 6,
                                                                                     alignItems:
                                                                                          "center",
                                                                                }}
                                                                           >
                                                                                <span>
                                                                                     {
                                                                                          m.emoji
                                                                                     }
                                                                                </span>
                                                                                <span
                                                                                     style={{
                                                                                          color: "#d4d4d8",
                                                                                     }}
                                                                                >
                                                                                     {
                                                                                          m.label
                                                                                     }
                                                                                </span>
                                                                           </span>
                                                                           <span
                                                                                style={{
                                                                                     color: "#71717a",
                                                                                }}
                                                                           >
                                                                                {
                                                                                     pct
                                                                                }
                                                                                %
                                                                           </span>
                                                                      </div>
                                                                      <div
                                                                           className="emotion-bar-track"
                                                                           style={{
                                                                                height: 4,
                                                                           }}
                                                                      >
                                                                           <div
                                                                                className="emotion-bar-fill"
                                                                                style={{
                                                                                     width: `${pct}%`,
                                                                                     background:
                                                                                          m.accent,
                                                                                }}
                                                                           />
                                                                      </div>
                                                                 </div>
                                                            );
                                                       },
                                                  )}
                                             </div>
                                        </div>
                                   </div>

                                   {/* Genre pills */}
                                   <div style={{ marginBottom: 32 }}>
                                        <p
                                             style={{
                                                  fontSize: 11,
                                                  fontWeight: 700,
                                                  letterSpacing: 2,
                                                  color: "#52525b",
                                                  marginBottom: 12,
                                             }}
                                        >
                                             GENRE YANG COCOK
                                        </p>
                                        <div
                                             style={{
                                                  display: "flex",
                                                  gap: 8,
                                                  flexWrap: "wrap",
                                             }}
                                        >
                                             {result.recommended_genres.map(
                                                  (g) => {
                                                       const c =
                                                            GENRE_COLOR[g] ??
                                                            "#71717a";
                                                       return (
                                                            <span
                                                                 key={g}
                                                                 className="genre-pill"
                                                                 style={{
                                                                      background: `${c}18`,
                                                                      color: c,
                                                                      border: `1.5px solid ${c}30`,
                                                                 }}
                                                            >
                                                                 <span
                                                                      style={{
                                                                           width: 6,
                                                                           height: 6,
                                                                           borderRadius:
                                                                                "50%",
                                                                           background:
                                                                                c,
                                                                           display: "inline-block",
                                                                      }}
                                                                 />
                                                                 {g.replace(
                                                                      /_/g,
                                                                      " ",
                                                                 )}
                                                            </span>
                                                       );
                                                  },
                                             )}
                                        </div>
                                   </div>

                                   {/* Book recommendations */}
                                   <div>
                                        <div
                                             style={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  justifyContent:
                                                       "space-between",
                                                  marginBottom: 20,
                                             }}
                                        >
                                             <div>
                                                  <h3
                                                       style={{
                                                            fontSize: 20,
                                                            fontWeight: 800,
                                                            letterSpacing:
                                                                 "-0.5px",
                                                       }}
                                                  >
                                                       Rekomendasi Buku
                                                  </h3>
                                                  <p
                                                       style={{
                                                            fontSize: 13,
                                                            color: "#71717a",
                                                            marginTop: 4,
                                                       }}
                                                  >
                                                       Dipilih berdasarkan
                                                       kesamaan makna dengan
                                                       curhatan kamu
                                                  </p>
                                             </div>
                                             <span
                                                  style={{
                                                       background: "#18181b",
                                                       border: "1px solid #27272a",
                                                       borderRadius: 99,
                                                       padding: "4px 12px",
                                                       fontSize: 13,
                                                       color: "#71717a",
                                                  }}
                                             >
                                                  {
                                                       result
                                                            .book_recommendations
                                                            .length
                                                  }{" "}
                                                  buku
                                             </span>
                                        </div>

                                        {result.book_recommendations.length >
                                        0 ? (
                                             <div className="result-grid">
                                                  {result.book_recommendations.map(
                                                       (book, i) => {
                                                            const gc =
                                                                 GENRE_COLOR[
                                                                      book.genre
                                                                 ] ?? "#71717a";
                                                            return (
                                                                 <div
                                                                      key={i}
                                                                      className="book-card"
                                                                 >
                                                                      {/* Top accent bar */}
                                                                      <div
                                                                           style={{
                                                                                height: 4,
                                                                                background: `linear-gradient(90deg, ${gc}, ${gc}88)`,
                                                                           }}
                                                                      />

                                                                      <div
                                                                           style={{
                                                                                padding: "20px 20px 22px",
                                                                                flex: 1,
                                                                                display: "flex",
                                                                                flexDirection:
                                                                                     "column",
                                                                           }}
                                                                      >
                                                                           {/* Genre */}
                                                                           <span
                                                                                style={{
                                                                                     display: "inline-block",
                                                                                     alignSelf:
                                                                                          "flex-start",
                                                                                     background: `${gc}15`,
                                                                                     color: gc,
                                                                                     border: `1px solid ${gc}30`,
                                                                                     borderRadius: 6,
                                                                                     padding: "2px 10px",
                                                                                     fontSize: 11,
                                                                                     fontWeight: 700,
                                                                                     marginBottom: 12,
                                                                                     textTransform:
                                                                                          "capitalize",
                                                                                }}
                                                                           >
                                                                                {book.genre?.replace(
                                                                                     /_/g,
                                                                                     " ",
                                                                                ) ??
                                                                                     "—"}
                                                                           </span>

                                                                           {/* Title */}
                                                                           <h4
                                                                                style={{
                                                                                     fontSize: 15,
                                                                                     fontWeight: 700,
                                                                                     lineHeight: 1.4,
                                                                                     marginBottom: 6,
                                                                                     color: "#fafafa",
                                                                                }}
                                                                           >
                                                                                {book.judul ??
                                                                                     "Judul tidak tersedia"}
                                                                           </h4>

                                                                           {/* Author */}
                                                                           {book.penulis && (
                                                                                <p
                                                                                     style={{
                                                                                          fontSize: 13,
                                                                                          color: "#71717a",
                                                                                          marginBottom: 10,
                                                                                     }}
                                                                                >
                                                                                     {
                                                                                          book.penulis
                                                                                     }
                                                                                     {book.tahun && (
                                                                                          <span
                                                                                               style={{
                                                                                                    color: "#3f3f46",
                                                                                               }}
                                                                                          >
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
                                                                                     style={{
                                                                                          fontSize: 13,
                                                                                          color: "#52525b",
                                                                                          lineHeight: 1.65,
                                                                                          marginTop:
                                                                                               "auto",
                                                                                          display: "-webkit-box",
                                                                                          WebkitLineClamp: 3,
                                                                                          WebkitBoxOrient:
                                                                                               "vertical",
                                                                                          overflow:
                                                                                               "hidden",
                                                                                     }}
                                                                                >
                                                                                     {
                                                                                          book.sinopsis
                                                                                     }
                                                                                </p>
                                                                           )}
                                                                      </div>
                                                                 </div>
                                                            );
                                                       },
                                                  )}
                                             </div>
                                        ) : (
                                             <div
                                                  style={{
                                                       textAlign: "center",
                                                       padding: "60px 24px",
                                                       background: "#18181b",
                                                       border: "1.5px solid #27272a",
                                                       borderRadius: 20,
                                                  }}
                                             >
                                                  <div
                                                       style={{
                                                            fontSize: 40,
                                                            marginBottom: 12,
                                                       }}
                                                  >
                                                       📭
                                                  </div>
                                                  <p
                                                       style={{
                                                            color: "#52525b",
                                                            fontSize: 15,
                                                       }}
                                                  >
                                                       Belum ada buku untuk
                                                       genre ini
                                                  </p>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         )}
                    </section>

                    {/* ── Footer ── */}
                    <footer
                         style={{
                              borderTop: "1px solid #18181b",
                              padding: "32px 24px",
                              textAlign: "center",
                              color: "#3f3f46",
                              fontSize: 14,
                         }}
                    >
                         <span style={{ fontWeight: 700, color: "#52525b" }}>
                              MoodRead
                         </span>{" "}
                         — Deteksi emosi berbasis RoBERTa Indonesia
                    </footer>
               </div>
          </>
     );
}
