"use client";
import { useState } from "react";

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
     { label: string; emoji: string; color: string; bg: string }
> = {
     sadness: { label: "Sedih", emoji: "😢", color: "#4f6ef7", bg: "#eef1ff" },
     happy: { label: "Bahagia", emoji: "😊", color: "#f59e0b", bg: "#fffbeb" },
     joy: { label: "Gembira", emoji: "😄", color: "#f59e0b", bg: "#fffbeb" },
     love: { label: "Cinta", emoji: "❤️", color: "#ef4444", bg: "#fff1f2" },
     anger: { label: "Marah", emoji: "😤", color: "#dc2626", bg: "#fef2f2" },
     fear: { label: "Takut", emoji: "😨", color: "#7c3aed", bg: "#f5f3ff" },
     surprise: {
          label: "Terkejut",
          emoji: "😲",
          color: "#0891b2",
          bg: "#ecfeff",
     },
     neutral: { label: "Netral", emoji: "😐", color: "#6b7280", bg: "#f9fafb" },
};

const GENRE_BADGE: Record<string, string> = {
     romance: "#f43f5e",
     fiksi_sastra: "#8b5cf6",
     novel: "#3b82f6",
     adventure: "#f97316",
     thriller: "#1f2937",
     horor: "#dc2626",
     mystery: "#7c3aed",
     fiksi_ilmiah: "#0ea5e9",
     fantasi: "#a855f7",
};

export default function Home() {
     const [text, setText] = useState("");
     const [result, setResult] = useState<EmotionResult | null>(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState("");

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

     const emotion = result
          ? (EMOTION_META[result.primary_emotion] ?? EMOTION_META.neutral)
          : null;

     return (
          <main
               style={{
                    minHeight: "100vh",
                    background: "#f8f7f4",
                    fontFamily: "'Inter', sans-serif",
               }}
          >
               {/* ── Header ── */}
               <header
                    style={{
                         background: "#1a1a2e",
                         padding: "20px 32px",
                         display: "flex",
                         alignItems: "center",
                         gap: 12,
                    }}
               >
                    <span style={{ fontSize: 28 }}>📚</span>
                    <div>
                         <h1
                              style={{
                                   margin: 0,
                                   color: "#fff",
                                   fontSize: 22,
                                   fontWeight: 700,
                                   letterSpacing: "-0.3px",
                              }}
                         >
                              MoodRead
                         </h1>
                         <p
                              style={{
                                   margin: 0,
                                   color: "#9ca3af",
                                   fontSize: 13,
                              }}
                         >
                              Deteksi emosi · Rekomendasi buku
                         </p>
                    </div>
               </header>

               <div
                    style={{
                         maxWidth: 760,
                         margin: "0 auto",
                         padding: "40px 20px",
                    }}
               >
                    {/* ── Input card ── */}
                    <div
                         style={{
                              background: "#fff",
                              borderRadius: 16,
                              padding: 28,
                              boxShadow: "0 1px 4px rgba(0,0,0,.08)",
                              marginBottom: 28,
                         }}
                    >
                         <label
                              style={{
                                   display: "block",
                                   fontWeight: 600,
                                   fontSize: 15,
                                   marginBottom: 10,
                                   color: "#111",
                              }}
                         >
                              Ceritakan perasaanmu sekarang
                         </label>
                         <textarea
                              rows={4}
                              placeholder="Contoh: Aku merasa sangat sedih karena kehilangan seseorang yang kusayang..."
                              value={text}
                              onChange={(e) => setText(e.target.value)}
                              onKeyDown={(e) => {
                                   if (e.key === "Enter" && e.ctrlKey)
                                        analyze();
                              }}
                              style={{
                                   width: "100%",
                                   border: "1.5px solid #e5e7eb",
                                   borderRadius: 10,
                                   padding: "12px 14px",
                                   fontSize: 15,
                                   resize: "vertical",
                                   outline: "none",
                                   fontFamily: "inherit",
                                   color: "#111",
                                   boxSizing: "border-box",
                                   lineHeight: 1.6,
                                   transition: "border-color .15s",
                              }}
                         />
                         <div
                              style={{
                                   display: "flex",
                                   justifyContent: "space-between",
                                   alignItems: "center",
                                   marginTop: 12,
                              }}
                         >
                              <span style={{ fontSize: 12, color: "#9ca3af" }}>
                                   Ctrl + Enter untuk analisis
                              </span>
                              <button
                                   onClick={analyze}
                                   disabled={loading || !text.trim()}
                                   style={{
                                        background:
                                             loading || !text.trim()
                                                  ? "#d1d5db"
                                                  : "#1a1a2e",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 8,
                                        padding: "10px 22px",
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor:
                                             loading || !text.trim()
                                                  ? "not-allowed"
                                                  : "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        transition: "background .15s",
                                   }}
                              >
                                   {loading ? (
                                        <>
                                             <span
                                                  style={{
                                                       display: "inline-block",
                                                       width: 14,
                                                       height: 14,
                                                       border: "2px solid #fff",
                                                       borderTopColor:
                                                            "transparent",
                                                       borderRadius: "50%",
                                                       animation:
                                                            "spin 0.7s linear infinite",
                                                  }}
                                             />
                                             Menganalisis...
                                        </>
                                   ) : (
                                        "Deteksi Emosi ✨"
                                   )}
                              </button>
                         </div>
                         {error && (
                              <p
                                   style={{
                                        margin: "12px 0 0",
                                        color: "#ef4444",
                                        fontSize: 13,
                                   }}
                              >
                                   ⚠️ {error}
                              </p>
                         )}
                    </div>

                    {/* ── Result section ── */}
                    {result && emotion && (
                         <>
                              {/* Emotion summary */}
                              <div
                                   style={{
                                        background: emotion.bg,
                                        border: `1.5px solid ${emotion.color}30`,
                                        borderRadius: 14,
                                        padding: "20px 24px",
                                        marginBottom: 24,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 20,
                                        flexWrap: "wrap",
                                   }}
                              >
                                   <div style={{ fontSize: 52, lineHeight: 1 }}>
                                        {emotion.emoji}
                                   </div>
                                   <div style={{ flex: 1 }}>
                                        <p
                                             style={{
                                                  margin: "0 0 4px",
                                                  fontSize: 13,
                                                  color: "#6b7280",
                                                  fontWeight: 500,
                                             }}
                                        >
                                             EMOSI TERDETEKSI
                                        </p>
                                        <h2
                                             style={{
                                                  margin: "0 0 6px",
                                                  fontSize: 26,
                                                  fontWeight: 700,
                                                  color: emotion.color,
                                             }}
                                        >
                                             {emotion.label}
                                        </h2>
                                        {/* Confidence bar */}
                                        <div
                                             style={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  gap: 10,
                                             }}
                                        >
                                             <div
                                                  style={{
                                                       flex: 1,
                                                       height: 7,
                                                       background: "#e5e7eb",
                                                       borderRadius: 99,
                                                       overflow: "hidden",
                                                  }}
                                             >
                                                  <div
                                                       style={{
                                                            width: `${(result.primary_score * 100).toFixed(0)}%`,
                                                            height: "100%",
                                                            background:
                                                                 emotion.color,
                                                            borderRadius: 99,
                                                            transition:
                                                                 "width .6s ease",
                                                       }}
                                                  />
                                             </div>
                                             <span
                                                  style={{
                                                       fontSize: 13,
                                                       fontWeight: 600,
                                                       color: emotion.color,
                                                       minWidth: 42,
                                                  }}
                                             >
                                                  {(
                                                       result.primary_score *
                                                       100
                                                  ).toFixed(1)}
                                                  %
                                             </span>
                                        </div>
                                   </div>

                                   {/* Top 3 emotions */}
                                   <div
                                        style={{
                                             display: "flex",
                                             flexDirection: "column",
                                             gap: 4,
                                             minWidth: 160,
                                        }}
                                   >
                                        {result.top_emotions.map((e) => {
                                             const m =
                                                  EMOTION_META[e.emotion] ??
                                                  EMOTION_META.neutral;
                                             return (
                                                  <div
                                                       key={e.emotion}
                                                       style={{
                                                            display: "flex",
                                                            alignItems:
                                                                 "center",
                                                            gap: 6,
                                                            fontSize: 13,
                                                       }}
                                                  >
                                                       <span>{m.emoji}</span>
                                                       <span
                                                            style={{
                                                                 color: "#374151",
                                                                 flex: 1,
                                                            }}
                                                       >
                                                            {m.label}
                                                       </span>
                                                       <span
                                                            style={{
                                                                 color: "#9ca3af",
                                                                 fontVariantNumeric:
                                                                      "tabular-nums",
                                                            }}
                                                       >
                                                            {(
                                                                 e.score * 100
                                                            ).toFixed(1)}
                                                            %
                                                       </span>
                                                  </div>
                                             );
                                        })}
                                   </div>
                              </div>

                              {/* Genre badges */}
                              <div style={{ marginBottom: 20 }}>
                                   <p
                                        style={{
                                             margin: "0 0 10px",
                                             fontSize: 13,
                                             color: "#6b7280",
                                             fontWeight: 500,
                                        }}
                                   >
                                        GENRE YANG COCOK UNTUKMU
                                   </p>
                                   <div
                                        style={{
                                             display: "flex",
                                             gap: 8,
                                             flexWrap: "wrap",
                                        }}
                                   >
                                        {result.recommended_genres.map((g) => (
                                             <span
                                                  key={g}
                                                  style={{
                                                       background:
                                                            GENRE_BADGE[g] ??
                                                            "#374151",
                                                       color: "#fff",
                                                       borderRadius: 99,
                                                       padding: "4px 14px",
                                                       fontSize: 13,
                                                       fontWeight: 600,
                                                       textTransform:
                                                            "capitalize",
                                                  }}
                                             >
                                                  {g.replace("_", " ")}
                                             </span>
                                        ))}
                                   </div>
                              </div>

                              {/* Book recommendations */}
                              {result.book_recommendations.length > 0 ? (
                                   <>
                                        <h3
                                             style={{
                                                  margin: "0 0 14px",
                                                  fontSize: 16,
                                                  fontWeight: 700,
                                                  color: "#111",
                                             }}
                                        >
                                             📖 Rekomendasi Buku untuk Kamu
                                        </h3>
                                        <div
                                             style={{
                                                  display: "grid",
                                                  gridTemplateColumns:
                                                       "repeat(auto-fill, minmax(220px, 1fr))",
                                                  gap: 16,
                                             }}
                                        >
                                             {result.book_recommendations.map(
                                                  (book, i) => {
                                                       const genreColor =
                                                            GENRE_BADGE[
                                                                 book.genre
                                                            ] ?? "#374151";
                                                       return (
                                                            <div
                                                                 key={i}
                                                                 style={{
                                                                      background:
                                                                           "#fff",
                                                                      borderRadius: 14,
                                                                      overflow:
                                                                           "hidden",
                                                                      boxShadow:
                                                                           "0 1px 4px rgba(0,0,0,.08)",
                                                                      display: "flex",
                                                                      flexDirection:
                                                                           "column",
                                                                      transition:
                                                                           "transform .15s, box-shadow .15s",
                                                                 }}
                                                                 onMouseEnter={(
                                                                      e,
                                                                 ) => {
                                                                      (
                                                                           e.currentTarget as HTMLDivElement
                                                                      ).style.transform =
                                                                           "translateY(-3px)";
                                                                      (
                                                                           e.currentTarget as HTMLDivElement
                                                                      ).style.boxShadow =
                                                                           "0 6px 20px rgba(0,0,0,.12)";
                                                                 }}
                                                                 onMouseLeave={(
                                                                      e,
                                                                 ) => {
                                                                      (
                                                                           e.currentTarget as HTMLDivElement
                                                                      ).style.transform =
                                                                           "none";
                                                                      (
                                                                           e.currentTarget as HTMLDivElement
                                                                      ).style.boxShadow =
                                                                           "0 1px 4px rgba(0,0,0,.08)";
                                                                 }}
                                                            >
                                                                 {/* Color strip */}
                                                                 <div
                                                                      style={{
                                                                           height: 6,
                                                                           background:
                                                                                genreColor,
                                                                      }}
                                                                 />

                                                                 <div
                                                                      style={{
                                                                           padding: "16px 16px 18px",
                                                                      }}
                                                                 >
                                                                      {/* Genre badge */}
                                                                      <span
                                                                           style={{
                                                                                display: "inline-block",
                                                                                background: `${genreColor}18`,
                                                                                color: genreColor,
                                                                                borderRadius: 6,
                                                                                padding: "2px 8px",
                                                                                fontSize: 11,
                                                                                fontWeight: 700,
                                                                                marginBottom: 10,
                                                                                textTransform:
                                                                                     "capitalize",
                                                                           }}
                                                                      >
                                                                           {book.genre?.replace(
                                                                                "_",
                                                                                " ",
                                                                           ) ??
                                                                                "—"}
                                                                      </span>

                                                                      {/* Judul */}
                                                                      <h4
                                                                           style={{
                                                                                margin: "0 0 6px",
                                                                                fontSize: 15,
                                                                                fontWeight: 700,
                                                                                color: "#111",
                                                                                lineHeight: 1.35,
                                                                           }}
                                                                      >
                                                                           {book.judul ??
                                                                                "Judul tidak tersedia"}
                                                                      </h4>

                                                                      {/* Penulis */}
                                                                      {book.penulis && (
                                                                           <p
                                                                                style={{
                                                                                     margin: "0 0 8px",
                                                                                     fontSize: 13,
                                                                                     color: "#6b7280",
                                                                                }}
                                                                           >
                                                                                {
                                                                                     book.penulis
                                                                                }
                                                                                {book.tahun && (
                                                                                     <span
                                                                                          style={{
                                                                                               color: "#d1d5db",
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

                                                                      {/* Sinopsis */}
                                                                      {book.sinopsis && (
                                                                           <p
                                                                                style={{
                                                                                     margin: 0,
                                                                                     fontSize: 13,
                                                                                     color: "#6b7280",
                                                                                     lineHeight: 1.6,
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
                                   </>
                              ) : (
                                   <div
                                        style={{
                                             textAlign: "center",
                                             padding: "40px 20px",
                                             background: "#fff",
                                             borderRadius: 14,
                                             color: "#9ca3af",
                                             fontSize: 14,
                                        }}
                                   >
                                        📭 Belum ada rekomendasi buku untuk
                                        genre ini.
                                   </div>
                              )}
                         </>
                    )}
               </div>

               <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea:focus { border-color: #1a1a2e !important; box-shadow: 0 0 0 3px rgba(26,26,46,.1); }
        * { box-sizing: border-box; }
      `}</style>
          </main>
     );
}
