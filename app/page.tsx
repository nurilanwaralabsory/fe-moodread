"use client";
import { useState } from "react";

export default function Home() {
     const [text, setText] = useState("");
     const [result, setResult] = useState<any>(null);
     const [loading, setLoading] = useState(false);

     const analyze = async () => {
          setLoading(true);
          const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/detect-emotion`,
               {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text }),
               },
          );
          setResult(await res.json());
          setLoading(false);
     };

     return (
          <main className="p-8 max-w-xl mx-auto">
               <h1 className="text-2xl font-bold mb-4">📚 MoodRead</h1>
               <textarea
                    className="w-full border p-2 rounded"
                    rows={4}
                    placeholder="Ceritakan perasaanmu..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
               />
               <button
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={analyze}
                    disabled={loading}
               >
                    {loading ? "Menganalisis..." : "Deteksi Emosi"}
               </button>
               {result && (
                    <div className="mt-4 p-4 bg-gray-100 rounded">
                         <p>
                              <b>Emosi:</b> {result.primary_emotion} (
                              {(result.primary_score * 100).toFixed(1)}%)
                         </p>
                         <p>
                              <b>Genre Rekomendasi:</b>{" "}
                              {result.recommended_genres.join(", ")}
                         </p>
                    </div>
               )}
          </main>
     );
}
