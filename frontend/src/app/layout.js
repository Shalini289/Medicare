"use client";

import Navbar from "@/components/Navbar";
import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />

        {/* Page content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>

        {/* Floating chat button */}
        <FloatingChat />
      </body>
    </html>
  );
}

// ── Floating chat button ──────────────────────────────────────────────────
function FloatingChat() {
  return (
    <>
      <style>{`
        .fab-wrap {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 1000;
        }

        /* Ripple rings */
        .fab-ring {
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          border: 1.5px solid rgba(79, 255, 176, 0.3);
          animation: fab-ripple 2.4s ease-out infinite;
        }
        .fab-ring:nth-child(2) { animation-delay: .8s; }
        .fab-ring:nth-child(3) { animation-delay: 1.6s; }
        @keyframes fab-ripple {
          0%   { transform: scale(1);   opacity: .6; }
          100% { transform: scale(1.9); opacity: 0;  }
        }

        /* Button */
        .fab {
          position: relative;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4fffb0, #00b4ff);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          text-decoration: none;
          box-shadow: 0 8px 32px rgba(79,255,176,0.35), 0 2px 8px rgba(0,0,0,0.4);
          transition: transform .25s cubic-bezier(.22,1,.36,1),
                      box-shadow .25s ease;
          cursor: pointer;
        }
        .fab::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255,255,255,0.3), transparent);
          pointer-events: none;
        }
        .fab:hover {
          transform: scale(1.12) translateY(-3px);
          box-shadow: 0 16px 48px rgba(79,255,176,0.45), 0 4px 12px rgba(0,0,0,0.4);
        }
        .fab:active {
          transform: scale(0.96);
        }

        /* Tooltip */
        .fab-tooltip {
          position: absolute;
          right: calc(100% + 14px);
          top: 50%;
          transform: translateY(-50%);
          background: rgba(13,17,28,0.92);
          border: 1px solid rgba(79,255,176,0.2);
          border-radius: 8px;
          padding: 7px 13px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: #e8ecf4;
          white-space: nowrap;
          backdrop-filter: blur(12px);
          opacity: 0;
          pointer-events: none;
          transition: opacity .2s, transform .2s;
          transform: translateY(-50%) translateX(6px);
        }
        .fab-tooltip::after {
          content: '';
          position: absolute;
          right: -5px;
          top: 50%;
          transform: translateY(-50%);
          border: 5px solid transparent;
          border-right: none;
          border-left-color: rgba(79,255,176,0.2);
        }
        .fab-wrap:hover .fab-tooltip {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }
      `}</style>

      <div className="fab-wrap">
        <span className="fab-ring" />
        <span className="fab-ring" />
        <span className="fab-ring" />
        <Link href="/chatbot" className="fab" aria-label="Open AI Health Assistant">
          🤖
        </Link>
        <div className="fab-tooltip">AI Health Assistant</div>
      </div>
    </>
  );
}