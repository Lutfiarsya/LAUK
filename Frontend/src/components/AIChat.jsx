import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";

const API_URL = "http://localhost:8000/api/chat";

const QUICK = [
  { icon: 'griddy-icons:muscle-flex', label: "Activity", prompt: "Aktivitas apa yang cocok untuk kondisiku?" },
  { icon: 'mdi:food-drumstick-outline', label: "Food", prompt: "Tolong sarankan makanan kemasan yang rendah gula." },
  { icon: 'andrsrxn:clock', label: "Progress", prompt: "Bagaimana progres asupan gulaku?" },
];

const SUGGESTED = [
  "Apakah produk ini aman untuk penderita diabetes?",
  "Kenapa produk ini mendapat grade tersebut?",
  "Ada alternatif yang lebih sehat?",
];

const SpeechRec =
  typeof window !== "undefined" &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22l-4-9-9-4 20-7z" />
  </svg>
);
const MicIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="3" width="6" height="12" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </svg>
);
const ClockBadge = () => (
  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fff1cc] text-[#f59300]">
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  </span>
);

const Avatar = ({ src, className = "" }) =>
  src ? (
    <img src={src} alt="" className={`shrink-0 rounded-full object-cover ${className}`} />
  ) : (
    <span
      aria-hidden="true"
      className={`shrink-0 rounded-full ${className}`}
      style={{
        background:
          "conic-gradient(#ff7a45, #ffcb3d, #7fd8a6, #5aa9ff, #c77dff, #ff7a45)",
      }}
    />
  );

const AIChat = ({ product = null, userName = "M. Taufik", avatarSrc = null }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const content = text.trim();
    if (!content || loading) return;

    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, product }),
      });
      if (!res.ok) throw new Error("Request gagal");
      const data = await res.json();
      setMessages([
        ...next,
        {
          role: "assistant",
          content: data.reply,
          tags: data.tags, 
          image: data.image, 
        },
      ]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: "Koneksi ke server gagal. Periksa jaringan lalu kirim ulang.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  const listen = () => {
    const rec = new SpeechRec();
    rec.lang = "id-ID";
    rec.onresult = (e) => setInput(e.results[0][0].transcript);
    rec.start();
  };

  const isWelcome = messages.length === 0;

  return (
    <section className="mx-auto flex h-[89vh] max-w-md flex-col bg-white font-['Poppins',sans-serif] text-[#1d1d1d]">
      {isWelcome ? (
        <div className="flex flex-1 flex-col overflow-y-auto px-6 pt-10">
          <div className="flex flex-col items-center text-center">
            <Avatar src={avatarSrc} className="h-24 w-24" />
            <h1 className="mt-6 text-xl font-semibold">Hi {userName},</h1>
            <h2 className="mt-1 text-xl font-semibold">Ada yang bisa dibantu?</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Apa target kamu selanjutnya?
            </p>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {QUICK.map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => send(q.prompt)}
                className="flex items-center text-[var(--Primary-color)] gap-2 rounded-full border border-[#f5b85c] bg-white px-5 py-2.5 text-sm font-medium hover:bg-[#fff8e1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f59300]"
              >
                <Icon icon={q.icon} fontSize={24}/>
                {q.label}
              </button>
            ))}
          </div>

          <p className="mt-8 text-sm text-neutral-500">Suggested for you</p>
          <div className="-mx-6 mt-3 flex gap-3 overflow-x-auto px-6 pb-2">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="flex w-44 shrink-0 flex-col items-start gap-3 rounded-lg border border-[#f3d9a8] bg-white p-3 text-left text-sm hover:bg-[#fff8e1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f59300]"
              >
                <ClockBadge />
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <header className="px-6 pb-3 pt-6 text-center">
            <h1 className="text-xl font-semibold">AI Assistant</h1>
            <p className="text-sm text-neutral-500">Selalu siap untuk kamu</p>
          </header>

          <div
            role="log"
            aria-live="polite"
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-3"
          >
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div
                  key={i}
                  className="ml-auto max-w-[80%] whitespace-pre-wrap rounded-lg bg-[#f59300] px-3 py-2.5 text-[13px] leading-snug text-white"
                >
                  {m.content}
                </div>
              ) : (
                <div key={i} className="flex items-end gap-2">
                  <Avatar src={avatarSrc} className="h-7 w-7" />
                  <div className="flex max-w-[80%] flex-col items-start gap-2">
                    <div
                      className={
                        "whitespace-pre-wrap rounded-lg border bg-white px-3 py-2.5 text-[13px] leading-snug " +
                        (m.error
                          ? "border-red-500 text-red-700"
                          : "border-[#f3d9a8]")
                      }
                    >
                      {m.content}
                    </div>
                    {m.image && (
                      <img
                        src={m.image}
                        alt="Produk"
                        className="h-28 w-40 rounded-lg border border-[#f3d9a8] object-cover"
                      />
                    )}
                    {m.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {m.tags.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => send(t)}
                            className="rounded-full border border-[#f5b85c] px-3 py-0.5 text-xs text-[#f59300] hover:bg-[#fff8e1]"
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}

            {loading && (
              <div className="flex items-end gap-2" aria-label="Sedang mengetik">
                <Avatar src={avatarSrc} className="h-7 w-7" />
                <div className="flex gap-1.5 rounded-lg border border-[#f3d9a8] px-4 py-3.5">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      style={{ animationDelay: `${d}ms` }}
                      className="h-2 w-2 animate-bounce rounded-full bg-[#f59300] motion-reduce:animate-none"
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </>
      )}

      <form onSubmit={onSubmit} className="flex items-center gap-3 px-6 py-4">
        <div className="flex flex-1 items-center rounded-full border border-[#f5b85c] pl-5 pr-3 focus-within:border-[#f59300]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type Your Message...."
            aria-label="Pesan"
            className="min-w-0 flex-1 bg-transparent py-3 text-sm placeholder:text-neutral-400 focus:outline-none"
          />
          {SpeechRec && (
            <button
              type="button"
              onClick={listen}
              aria-label="Bicara"
              className="rounded-full p-2 text-[#f59300] hover:bg-[#fff8e1]"
            >
              <MicIcon />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Kirim"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f59300] text-white hover:bg-[#e08500] disabled:cursor-not-allowed disabled:bg-[#ddd0b8]"
        >
          <SendIcon />
        </button>
      </form>
    </section>
  );
};

export default AIChat;