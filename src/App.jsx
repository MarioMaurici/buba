import React, { useState, useEffect, useRef, useMemo } from "react";
import { Heart, Camera } from "lucide-react";
import fotoBuba from "./assets/buba.jpg";


// Foto padrão exibida no cantinho da carta (pode ser trocada clicando nela)
const DEFAULT_PHOTO = fotoBuba;
export default function CartaDeAmor() {
  const [stage, setStage] = useState("closed"); // closed -> opening -> open
  const [flipped, setFlipped] = useState(false); // folheou para a página do coração?
  const [showNotice, setShowNotice] = useState(false);
  const [shake, setShake] = useState(false);
  const [photo, setPhoto] = useState(DEFAULT_PHOTO);
  const fileInputRef = useRef(null);
  const noticeTimer = useRef(null);
  const shakeTimer = useRef(null);
  const resetTimer = useRef(null);

  // opening -> open (depois da animação do envelope)
  useEffect(() => {
    if (stage === "opening") {
      const t = setTimeout(() => setStage("open"), 900);
      return () => clearTimeout(t);
    }
  }, [stage]);

  // ao entrar em "open", conta 15s até liberar o próximo clique (folhear)
  useEffect(() => {
    if (stage === "open" && !flipped) {
      setShowNotice(false);
      noticeTimer.current = setTimeout(() => setShowNotice(true), 5000);
    }
    return () => clearTimeout(noticeTimer.current);
  }, [stage, flipped]);

  const ambientHearts = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => ({
        id: i,
        left: Math.round(Math.random() * 100),
        delay: (Math.random() * 12).toFixed(2),
        duration: (11 + Math.random() * 9).toFixed(2),
        size: Math.round(10 + Math.random() * 16),
        opacity: (0.12 + Math.random() * 0.28).toFixed(2),
      })),
    []
  );

  const handleRootClick = () => {
    if (stage === "closed") {
      setStage("opening");
    } else if (stage === "open" && !flipped) {
      if (showNotice) {
        setFlipped(true);
      } else {
        setShake(true);
        clearTimeout(shakeTimer.current);
        shakeTimer.current = setTimeout(() => setShake(false), 420);
      }
    }
  };

  const handlePhotoClick = (e) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleReset = (e) => {
    e.stopPropagation();
    setFlipped(false);
    setShowNotice(false);
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      setStage("closed");
      setPhoto(DEFAULT_PHOTO);
    }, 900);
  };

  const showEnvelope = stage === "closed" || stage === "opening";
  const showNotebook = stage === "opening" || stage === "open";
  const isClickable = stage === "closed" || (stage === "open" && !flipped && showNotice);

  return (
    <div
      onClick={handleRootClick}
      className={`stage-root ${isClickable ? "is-clickable" : ""}`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,400&family=Caveat:wght@500;600;700&display=swap');

        :root {
          --bg-deep: #170a10;
          --bg-deep2: #2c1019;
          --paper: #f8f2e2;
          --paper2: #efe4c8;
          --gold: #c9a15c;
          --gold-light: #e6cd97;
          --gold-dark: #9c7a3f;
          --rose: #d1495b;
          --rose-light: #ff9fb2;
          --ink: #28345c;
        }

        * { box-sizing: border-box; }

        .stage-root {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          background: radial-gradient(circle at 50% 30%, var(--bg-deep2) 0%, var(--bg-deep) 62%, #0c0509 100%);
          font-family: 'Cormorant Garamond', serif;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: default;
          -webkit-tap-highlight-color: transparent;
        }
        .stage-root.is-clickable { cursor: pointer; }

        /* ---------- corações ambiente ---------- */
        .ambient-layer { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .ambient-heart {
          position: absolute;
          bottom: -40px;
          color: var(--rose-light);
          animation: floatUp linear infinite;
          filter: drop-shadow(0 0 6px rgba(255,159,178,0.25));
        }
        @keyframes floatUp {
          0%   { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translateY(-115vh) translateX(18px) rotate(25deg); opacity: 0; }
        }

        .scene {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 2rem 1.25rem;
        }

        /* ---------- envelope ---------- */
        .envelope-box {
          position: relative;
          width: min(58vw, 230px);
          height: min(40vw, 155px);
          animation: bob 3.6s ease-in-out infinite;
        }
        .envelope-scene.is-opening .envelope-box { animation: none; }
        .envelope-body {
          position: absolute; inset: 0; border-radius: 8px;
          background: linear-gradient(150deg, var(--gold-light), var(--gold) 55%, var(--gold-dark));
          box-shadow: 0 22px 46px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset;
        }
        .envelope-letter {
          position: absolute; left: 8%; top: 26%; width: 84%; height: 62%;
          background: linear-gradient(180deg, var(--paper), var(--paper2));
          border-radius: 4px; box-shadow: 0 6px 14px rgba(0,0,0,0.35);
        }
        .envelope-flap {
          position: absolute; top: 0; left: 0; width: 100%; height: 58%;
          background: linear-gradient(165deg, var(--gold), var(--gold-dark));
          clip-path: polygon(0 0, 100% 0, 50% 96%);
          transform-origin: top center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.25);
        }
        .envelope-scene.is-opening .envelope-flap { animation: flapOpen 0.7s ease-in forwards; }
        .envelope-scene.is-opening .envelope-letter { animation: letterPeek 0.7s 0.12s ease-out forwards; }
        .envelope-scene.is-opening .envelope-box { animation: envelopeSettle 0.85s ease-in forwards; }
        @keyframes flapOpen { to { transform: translateY(-16px) rotateZ(-4deg); opacity: 0; } }
        @keyframes letterPeek { from { transform: translateY(6px); opacity: 0.9; } to { transform: translateY(-46px); opacity: 1; } }
        @keyframes envelopeSettle { to { transform: scale(0.94); opacity: 0; } }
        .wax-seal {
          position: absolute; left: 50%; top: 54%; width: 38px; height: 38px;
          transform: translate(-50%, -50%); border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, var(--rose-light), var(--rose) 60%, #8f2d3b);
          box-shadow: 0 6px 14px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,255,255,0.12) inset;
          display: flex; align-items: center; justify-content: center;
          color: var(--paper); z-index: 2;
        }
        @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
        .hint-text {
          margin-top: 1.6rem; color: var(--gold-light); font-size: 1.02rem;
          letter-spacing: 0.14em; text-transform: lowercase; opacity: 0.85;
          animation: hintFade 2.4s ease-in-out infinite;
        }
        @keyframes hintFade { 0%, 100% { opacity: 0.45; } 50% { opacity: 0.95; } }

        /* ---------- caderno (duas paginas) ---------- */
        .notebook-wrap { pointer-events: none; }
        .notebook-wrap .notebook-stage { pointer-events: auto; }
        .notebook-stage {
          position: relative;
          width: min(90vw, 380px);
          height: clamp(440px, 74vh, 540px);
          perspective: 1800px;
          opacity: 0;
          transform: scale(0.85) translateY(10px);
        }
        .notebook-wrap.is-opening .notebook-stage,
        .notebook-wrap.is-open .notebook-stage {
          animation: cardIn 0.85s 0.1s cubic-bezier(.2,.8,.25,1) forwards;
        }
        @keyframes cardIn { to { opacity: 1; transform: scale(1) translateY(0); } }

        /* folha de caderno arrancada: bordas retas + lateral esquerda serrilhada */
        .page {
          position: absolute;
          inset: 0;
          background:
            repeating-linear-gradient(180deg, transparent 0 27px, rgba(90,120,170,0.28) 27px 28px),
            linear-gradient(175deg, var(--paper), var(--paper2));
          clip-path: polygon(
            0% 0%, 100% 0%, 100% 100%, 0% 100%,
            3% 96%, 0% 92%, 3% 88%, 0% 84%, 3% 80%, 0% 76%,
            3% 72%, 0% 68%, 3% 64%, 0% 60%, 3% 56%, 0% 52%,
            3% 48%, 0% 44%, 3% 40%, 0% 36%, 3% 32%, 0% 28%,
            3% 24%, 0% 20%, 3% 16%, 0% 12%, 3% 8%, 0% 4%
          );
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
          padding: 2.6rem 1.6rem 1.6rem 2.5rem;
          backface-visibility: hidden;
        }
        .page::before {
          content: '';
          position: absolute; top: 0; bottom: 0; left: 17%;
          width: 1.5px; background: rgba(196, 78, 90, 0.35);
        }
        .page-back {
          z-index: 1;
          transform: translate(7px, 9px) rotate(1.4deg);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .page-front {
          z-index: 2;
          transform-origin: left center;
          transform: rotateY(0deg);
          transition: transform 1s cubic-bezier(.45,.05,.2,1);
        }
        .page-front.is-flipped { transform: rotateY(-178deg); pointer-events: none; }
        .page-front.is-shaking { animation: cardShake 0.4s ease-in-out; }
        @keyframes cardShake {
          0%, 100% { transform: translateX(0) rotateY(0deg); }
          25% { transform: translateX(-6px) rotate(-0.6deg); }
          75% { transform: translateX(6px) rotate(0.6deg); }
        }

        .photo-frame {
          position: relative; float: right; shape-outside: margin-box;
          width: 96px; height: 112px; margin: -4px -4px 14px 16px;
          background: #fffdf8; padding: 6px 6px 18px; border-radius: 2px;
          box-shadow: 0 12px 22px rgba(0,0,0,0.4); transform: rotate(7deg); cursor: pointer;
        }
        .photo-frame .tape {
          position: absolute; top: -10px; left: 50%; width: 46px; height: 18px;
          transform: translateX(-50%) rotate(-5deg);
          background: rgba(230, 205, 151, 0.55); box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }
        .photo-frame .inner {
          width: 100%; height: 100%; border: 1.5px dashed var(--gold-dark); border-radius: 2px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 4px; color: var(--gold-dark); background: #fbf6ea; overflow: hidden;
        }
        .photo-frame img { width: 100%; height: 100%; object-fit: cover; border-radius: 1px; }
        .photo-frame .inner span { font-size: 0.6rem; letter-spacing: 0.05em; text-align: center; line-height: 1.15; }

        .card-eyebrow {
          margin: 0 0 0.7rem;
          font-family: 'Caveat', cursive; font-weight: 700;
          font-size: 1.9rem; color: var(--rose); transform: rotate(-1.5deg);
        }
        .card-message {
          margin: 0; color: var(--ink);
          font-family: 'Caveat', cursive; font-weight: 600;
          font-size: 1.55rem; line-height: 1.55;
        }

        .card-footer { margin-top: 1.6rem; padding-top: 0.9rem; border-top: 1px dashed rgba(40,52,92,0.25); }
        .notice {
          display: block; text-align: center; font-size: 0.95rem;
          font-family: 'Caveat', cursive; letter-spacing: 0.02em; color: var(--gold-dark);
        }
        .notice.notice-visible {
          color: var(--rose); font-weight: 700;
          animation: noticePulse 1.6s ease-in-out infinite;
        }
        @keyframes noticePulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .timer-track { margin-top: 0.6rem; height: 3px; width: 100%; background: rgba(40,52,92,0.12); border-radius: 2px; overflow: hidden; }
        .timer-fill { height: 100%; width: 0%; background: linear-gradient(90deg, var(--gold), var(--rose)); animation: fillBar 5s linear forwards; }
        @keyframes fillBar { to { width: 100%; } }

        /* ---------- coração desenhado a mao (pagina de tras) ---------- */
        .hand-heart-wrap {
          position: relative;
          width: clamp(170px, 42vw, 230px);
          margin-bottom: 1.4rem;
          animation: heartbeat 2.2s ease-in-out infinite;
        }
        .hand-heart-wrap svg { width: 100%; height: 100%; overflow: visible; }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1) rotate(-1deg); }
          50% { transform: scale(1.035) rotate(-1deg); }
        }
        .hand-heart-text {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%) rotate(-4deg);
          font-family: 'Caveat', cursive; font-weight: 700;
          font-size: clamp(1.5rem, 6.5vw, 2rem);
          color: #23305a;
          white-space: nowrap;
        }
        .page-back-caption {
          font-family: 'Caveat', cursive; font-size: 1rem; color: var(--gold-dark);
          margin-bottom: 0.4rem; letter-spacing: 0.02em;
        }
        .reset-btn {
          margin-top: 1.6rem; background: none; border: none; color: var(--gold-dark);
          font-family: 'Caveat', cursive; font-size: 1.15rem; letter-spacing: 0.02em;
          cursor: pointer; opacity: 0.8; text-decoration: underline; text-underline-offset: 4px;
        }
        .reset-btn:hover { opacity: 1; }

        @media (prefers-reduced-motion: reduce) {
          .ambient-heart, .envelope-box, .hint-text, .notice.notice-visible,
          .hand-heart-wrap, .notebook-stage, .page-front { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <div className="ambient-layer">
        {ambientHearts.map((h) => (
          <Heart
            key={h.id}
            fill="currentColor"
            strokeWidth={0}
            className="ambient-heart"
            style={{
              left: `${h.left}%`,
              width: h.size,
              height: h.size,
              opacity: h.opacity,
              animationDelay: `${h.delay}s`,
              animationDuration: `${h.duration}s`,
            }}
          />
        ))}
      </div>

      {showEnvelope && (
        <div className={`scene envelope-scene ${stage === "opening" ? "is-opening" : ""}`}>
          <div className="envelope-box">
            <div className="envelope-letter" />
            <div className="envelope-body" />
            <div className="envelope-flap" />
            <div className="wax-seal">
              <Heart size={16} fill="currentColor" strokeWidth={0} />
            </div>
          </div>
          {stage === "closed" && <p className="hint-text">toque na tela para abrir</p>}
        </div>
      )}

      {showNotebook && (
        <div className={`scene notebook-wrap ${stage === "opening" ? "is-opening" : "is-open"}`}>
          <div className="notebook-stage">
            {/* pagina de tras: so aparece de verdade depois que a da frente folheia */}
            <div className="page page-back">
              <span className="page-back-caption">pra você guardar</span>
              <div className="hand-heart-wrap">
                <svg viewBox="0 0 100 100">
                  <defs>
                    <filter id="roughPaper" x="-25%" y="-25%" width="150%" height="150%">
                      <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="3" seed="7" result="noise" />
                      <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
                    </filter>
                    <pattern id="crayonHatch" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                      <rect width="6" height="6" fill="#f2657c" />
                      <line x1="0" y1="0" x2="0" y2="6" stroke="#c9364f" strokeWidth="2" opacity="0.55" />
                    </pattern>
                  </defs>
                  <path
                    d="M50 90 C 18 66, 6 40, 14 22 C 20 8, 40 6, 50 24 C 60 4, 82 7, 88 21 C 97 39, 84 67, 50 90 Z"
                    fill="url(#crayonHatch)"
                    stroke="#7a2030"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    filter="url(#roughPaper)"
                  />
                </svg>
                <span className="hand-heart-text">eu te amo</span>
              </div>
              <button className="reset-btn" onClick={handleReset}>
                reviver este momento
              </button>
            </div>

            {/* pagina da frente: a cartinha, que folheia ao ser clicada */}
            <div
              className={`page page-front ${flipped ? "is-flipped" : ""} ${shake ? "is-shaking" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="photo-frame" onClick={handlePhotoClick}>
                <div className="tape" />
                <div className="inner">
                  {photo ? (
                    <img src={photo} alt="Foto especial" />
                  ) : (
                    <>
                      <Camera size={20} strokeWidth={1.4} />
                      <span>toque para
adicionar foto</span>
                    </>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                style={{ display: "none" }}
              />

              <p className="card-eyebrow">Uma cartinha para você</p>
              <p className="card-message">
                Para você, que transforma dias comuns em lembranças que eu quero guardar com carinho.
                Não vejo a hora de poder estar ao seu lado e viver boas memórias com você.
              </p>

              <div className="card-footer">
                <span className={`notice ${showNotice ? "notice-visible" : ""}`}>
                  {showNotice ? "Clique na tela novamente" : "aguarde..."}
                </span>
                <div className="timer-track">
                  <div
                    className="timer-fill"
                    style={{ animationPlayState: stage === "open" && !flipped ? "running" : "paused" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
