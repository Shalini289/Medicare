"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 500;
    padding: 0 24px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(6, 8, 15, 0.75);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255,255,255,0.07);
    transition: background .3s;
  }
  .nav.scrolled {
    background: rgba(6, 8, 15, 0.92);
    border-bottom-color: rgba(255,255,255,0.1);
  }

  .nav-logo {
    font-family: 'Syne', sans-serif;
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -0.03em;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #e8ecf4;
  }
  .logo-icon {
    width: 32px; height: 32px;
    border-radius: 9px;
    background: linear-gradient(135deg, #4fffb0, #00b4ff);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    box-shadow: 0 4px 14px rgba(79,255,176,0.3);
    flex-shrink: 0;
  }
  .logo-text span { color: #4fffb0; }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 4px;
    list-style: none;
  }
  .nav-link {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: rgba(232,236,244,0.55);
    text-decoration: none;
    padding: 7px 14px;
    border-radius: 8px;
    transition: color .2s, background .2s;
    position: relative;
  }
  .nav-link:hover { color: #e8ecf4; background: rgba(255,255,255,0.06); }
  .nav-link.active { color: #4fffb0; background: rgba(79,255,176,0.08); }
  .nav-link.active::after {
    content: '';
    position: absolute;
    bottom: -1px; left: 50%;
    transform: translateX(-50%);
    width: 18px; height: 2px;
    border-radius: 2px;
    background: #4fffb0;
  }

  .nav-right { display: flex; align-items: center; gap: 10px; }

  .btn-ghost {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    color: rgba(232,236,244,0.6);
    background: none; border: none;
    padding: 7px 14px; border-radius: 8px;
    cursor: pointer; text-decoration: none;
    transition: color .2s, background .2s;
  }
  .btn-ghost:hover { color: #e8ecf4; background: rgba(255,255,255,0.06); }

  .btn-accent {
    font-family: 'Syne', sans-serif;
    font-size: 12px; font-weight: 700; letter-spacing: .05em;
    color: #06080f; background: #4fffb0;
    border: none; padding: 8px 18px; border-radius: 8px;
    cursor: pointer; text-decoration: none;
    transition: transform .2s, box-shadow .2s;
    display: inline-block;
  }
  .btn-accent:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(79,255,176,0.3); }
  .btn-accent:active { transform: translateY(0); }

  .btn-logout {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 600;
    color: rgba(255,107,107,0.8);
    background: rgba(255,107,107,0.08);
    border: 1px solid rgba(255,107,107,0.15);
    padding: 7px 14px; border-radius: 8px;
    cursor: pointer; transition: all .2s; letter-spacing: .03em;
  }
  .btn-logout:hover {
    background: rgba(255,107,107,0.15);
    border-color: rgba(255,107,107,0.3);
    color: #ff6b6b;
  }

  .nav-avatar {
    width: 30px; height: 30px; border-radius: 8px;
    background: linear-gradient(135deg,rgba(79,255,176,0.2),rgba(0,180,255,0.2));
    border: 1px solid rgba(79,255,176,0.25);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
  }

  .hamburger {
    display: none; flex-direction: column; gap: 5px;
    background: none; border: none; cursor: pointer; padding: 6px;
  }
  .hamburger span {
    display: block; width: 22px; height: 2px;
    background: rgba(232,236,244,0.7); border-radius: 2px;
    transition: all .25s;
  }
  .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .hamburger.open span:nth-child(2) { opacity: 0; }
  .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  .mobile-menu {
    position: fixed; top: 64px; left: 0; right: 0;
    background: rgba(6,8,15,0.97);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding: 16px 24px 24px; z-index: 499;
    backdrop-filter: blur(20px);
  }
  .mobile-menu .nav-link { display: block; padding: 12px 14px; font-size: 15px; }
  .mobile-menu .nav-link.active::after { display: none; }
  .mobile-actions { margin-top: 16px; display: flex; flex-direction: column; gap: 10px; }

  @media (max-width: 640px) {
    .nav-links, .nav-right { display: none; }
    .hamburger { display: flex; }
  }
  @media (min-width: 641px) { .mobile-menu { display: none !important; } }

  .nav-spacer { height: 64px; }

  /* FAB */
  .fab-wrap {
    position: fixed; bottom: 28px; right: 28px; z-index: 1000;
  }
  .fab-ring {
    position: absolute; inset: -10px; border-radius: 50%;
    border: 1.5px solid rgba(79,255,176,0.3);
    animation: fab-ripple 2.4s ease-out infinite;
  }
  .fab-ring:nth-child(2) { animation-delay: .8s; }
  .fab-ring:nth-child(3) { animation-delay: 1.6s; }
  @keyframes fab-ripple {
    0%   { transform: scale(1);   opacity: .6; }
    100% { transform: scale(1.9); opacity: 0;  }
  }
  .fab {
    position: relative; width: 58px; height: 58px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4fffb0, #00b4ff);
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; text-decoration: none;
    box-shadow: 0 8px 32px rgba(79,255,176,0.35), 0 2px 8px rgba(0,0,0,0.4);
    transition: transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s ease;
  }
  .fab::after {
    content: ''; position: absolute; inset: 0; border-radius: 50%;
    background: linear-gradient(135deg,rgba(255,255,255,0.3),transparent);
    pointer-events: none;
  }
  .fab:hover {
    transform: scale(1.12) translateY(-3px);
    box-shadow: 0 16px 48px rgba(79,255,176,0.45), 0 4px 12px rgba(0,0,0,0.4);
  }
  .fab:active { transform: scale(0.96); }
  .fab-tooltip {
    position: absolute; right: calc(100% + 14px); top: 50%;
    transform: translateY(-50%) translateX(6px);
    background: rgba(13,17,28,0.92);
    border: 1px solid rgba(79,255,176,0.2);
    border-radius: 8px; padding: 7px 13px;
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
    color: #e8ecf4; white-space: nowrap;
    backdrop-filter: blur(12px);
    opacity: 0; pointer-events: none;
    transition: opacity .2s, transform .2s;
  }
  .fab-tooltip::after {
    content: ''; position: absolute; right: -5px; top: 50%;
    transform: translateY(-50%);
    border: 5px solid transparent; border-right: none;
    border-left-color: rgba(79,255,176,0.2);
  }
  .fab-wrap:hover .fab-tooltip {
    opacity: 1; transform: translateY(-50%) translateX(0);
  }
`;

const NAV_LINKS = [
  { href: "/",          label: "Home"       },
  { href: "/dashboard", label: "My Bookings" },
  { href: "/admin",     label: "Admin"      },
];

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("token"));
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    router.push("/login");
  };

  const links = NAV_LINKS.map(({ href, label }) => (
    <li key={href}>
      <Link
        href={href}
        className={`nav-link ${pathname === href ? "active" : ""}`}
        onClick={() => setMenuOpen(false)}
      >
        {label}
      </Link>
    </li>
  ));

  return (
    <>
      <style>{css}</style>

      {/* ── Navbar ── */}
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <Link href="/" className="nav-logo">
          <div className="logo-icon">🩺</div>
          <span className="logo-text">Smart<span>Health</span></span>
        </Link>

        <ul className="nav-links">{links}</ul>

        <div className="nav-right">
          {loggedIn ? (
            <>
              <div className="nav-avatar">👤</div>
              <button className="btn-logout" onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login"    className="btn-ghost">Sign in</Link>
              <Link href="/register" className="btn-accent">Get started</Link>
            </>
          )}
        </div>

        <button
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="mobile-menu">
          <ul style={{ listStyle: "none" }}>{links}</ul>
          <div className="mobile-actions">
            {loggedIn ? (
              <button className="btn-logout" style={{ width: "100%", textAlign: "center" }} onClick={handleLogout}>
                Sign out
              </button>
            ) : (
              <>
                <Link href="/login"    className="btn-ghost" style={{ textAlign: "center", display: "block" }} onClick={() => setMenuOpen(false)}>Sign in</Link>
                <Link href="/register" className="btn-accent" style={{ textAlign: "center" }} onClick={() => setMenuOpen(false)}>Get started</Link>
              </>
            )}
          </div>
        </div>
      )}

      <div className="nav-spacer" />

      {/* ── Floating chat button ── */}
      <div className="fab-wrap">
        <span className="fab-ring" /><span className="fab-ring" /><span className="fab-ring" />
        <Link href="/chatbot" className="fab" aria-label="Open AI Health Assistant">🤖</Link>
        <div className="fab-tooltip">AI Health Assistant</div>
      </div>
    </>
  );
}