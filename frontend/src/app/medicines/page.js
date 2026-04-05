"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #06080f;
    --glass:   rgba(255,255,255,0.04);
    --border:  rgba(255,255,255,0.08);
    --accent:  #4fffb0;
    --accent2: #00b4ff;
    --text:    #e8ecf4;
    --muted:   rgba(232,236,244,0.45);
    --danger:  #ff6b6b;
  }

  body { background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;min-height:100vh; }

  .aurora { position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:0; }
  .aurora span {
    position:absolute;border-radius:50%;filter:blur(120px);opacity:0.13;
    animation:drift 17s ease-in-out infinite alternate;
  }
  .aurora span:nth-child(1){width:560px;height:560px;background:var(--accent);top:-180px;left:-100px;animation-delay:0s;}
  .aurora span:nth-child(2){width:500px;height:500px;background:var(--accent2);bottom:-140px;right:-100px;animation-delay:-8s;}
  .aurora span:nth-child(3){width:300px;height:300px;background:#a78bfa;top:42%;left:52%;animation-delay:-13s;}
  @keyframes drift{from{transform:translate(0,0) scale(1);}to{transform:translate(45px,60px) scale(1.1);}}

  .noise::after{
    content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  }

  /* Two-column layout: medicines grid + sticky cart sidebar */
  .page {
    position:relative;z-index:1;
    max-width:1100px;margin:0 auto;padding:60px 24px 80px;
    display:grid;
    grid-template-columns:1fr 320px;
    grid-template-rows:auto 1fr;
    gap:0 24px;
    align-items:start;
  }
  @media(max-width:780px){ .page{grid-template-columns:1fr;} }

  /* Header spans full width */
  .header { grid-column:1/-1;margin-bottom:40px; }
  .badge {
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(79,255,176,0.08);border:1px solid rgba(79,255,176,0.2);
    border-radius:100px;padding:6px 16px;
    font-size:11px;letter-spacing:.12em;text-transform:uppercase;
    color:var(--accent);font-weight:600;margin-bottom:20px;
  }
  .badge .dot { width:6px;height:6px;border-radius:50%;background:var(--accent);animation:pulse-dot 2s infinite; }
  @keyframes pulse-dot{0%,100%{box-shadow:0 0 0 0 rgba(79,255,176,0.6);}50%{box-shadow:0 0 0 6px rgba(79,255,176,0);}}
  h1.title {
    font-family:'Syne',sans-serif;
    font-size:clamp(30px,5vw,48px);font-weight:800;
    letter-spacing:-0.03em;line-height:1.06;
    background:linear-gradient(135deg,#fff 30%,var(--accent) 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    margin-bottom:8px;
  }
  .subtitle { color:var(--muted);font-size:14px;font-weight:300; }

  /* Section label */
  .section-lbl {
    font-family:'Syne',sans-serif;font-size:12px;font-weight:700;
    letter-spacing:.1em;text-transform:uppercase;color:var(--muted);
    margin-bottom:16px;display:flex;align-items:center;gap:10px;
  }
  .section-lbl .line{flex:1;height:1px;background:var(--border);}

  /* Medicine grid */
  .med-grid {
    display:grid;
    grid-template-columns:repeat(auto-fill,minmax(200px,1fr));
    gap:14px;align-content:start;
  }

  /* Medicine card */
  .med-card {
    background:var(--glass);border:1px solid var(--border);
    border-radius:18px;padding:20px;
    position:relative;overflow:hidden;
    display:flex;flex-direction:column;gap:10px;
    transition:border-color .25s,transform .2s;
  }
  .med-card::before{
    content:'';position:absolute;inset:0;border-radius:18px;
    background:linear-gradient(135deg,rgba(255,255,255,0.05) 0%,transparent 55%);
    pointer-events:none;
  }
  .med-card:hover{ border-color:rgba(79,255,176,0.25);transform:translateY(-2px); }

  .med-icon {
    width:42px;height:42px;border-radius:12px;flex-shrink:0;
    background:linear-gradient(135deg,rgba(79,255,176,0.18),rgba(0,180,255,0.14));
    border:1px solid rgba(79,255,176,0.2);
    display:flex;align-items:center;justify-content:center;font-size:20px;
  }
  .med-name { font-family:'Syne',sans-serif;font-size:14px;font-weight:700; }
  .med-price { font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:var(--accent); }
  .med-stock {
    font-size:11px;display:inline-block;
    border-radius:6px;padding:3px 8px;
  }
  .med-stock.in  { background:rgba(79,255,176,0.08);border:1px solid rgba(79,255,176,0.18);color:var(--accent); }
  .med-stock.low { background:rgba(255,200,0,0.08);border:1px solid rgba(255,200,0,0.18);color:#ffc800; }
  .med-stock.out { background:rgba(255,107,107,0.08);border:1px solid rgba(255,107,107,0.18);color:var(--danger); }

  button.btn-add {
    width:100%;margin-top:auto;
    background:rgba(79,255,176,0.1);border:1px solid rgba(79,255,176,0.25);
    border-radius:10px;padding:9px;
    font-family:'Syne',sans-serif;font-size:12px;font-weight:700;letter-spacing:.05em;
    color:var(--accent);cursor:pointer;
    transition:background .2s,border-color .2s,transform .2s;
  }
  button.btn-add:hover{
    background:rgba(79,255,176,0.18);border-color:var(--accent);
    transform:translateY(-1px);
  }
  button.btn-add:disabled{ opacity:.4;cursor:not-allowed; }

  /* Skeleton */
  .skeleton {
    height:180px;border-radius:18px;
    background:linear-gradient(90deg,rgba(255,255,255,0.03) 0%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.03) 100%);
    background-size:200% 100%;animation:shimmer 1.6s infinite;
  }
  @keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}

  /* ── CART SIDEBAR ── */
  .cart-sidebar {
    position:sticky;top:24px;
    grid-row:2;
    background:var(--glass);border:1px solid var(--border);
    border-radius:20px;padding:22px;
    backdrop-filter:blur(16px);
    display:flex;flex-direction:column;gap:0;
  }
  @media(max-width:780px){ .cart-sidebar{ position:static;grid-row:auto;margin-top:24px; } }
  .cart-sidebar::before{
    content:'';position:absolute;inset:0;border-radius:20px;
    background:linear-gradient(135deg,rgba(255,255,255,0.05) 0%,transparent 60%);
    pointer-events:none;
  }
  .cart-head {
    display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;
  }
  .cart-title { font-family:'Syne',sans-serif;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted); }
  .cart-count {
    background:rgba(79,255,176,0.1);border:1px solid rgba(79,255,176,0.2);
    border-radius:100px;padding:2px 10px;
    font-size:11px;color:var(--accent);font-weight:700;
  }

  /* Cart items */
  .cart-items { display:flex;flex-direction:column;gap:10px;margin-bottom:16px; }
  .cart-item {
    display:flex;align-items:center;gap:10px;
    background:rgba(255,255,255,0.03);border:1px solid var(--border);
    border-radius:12px;padding:10px 12px;
  }
  .cart-item-name { flex:1;font-size:13px;font-weight:500;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
  .qty-controls { display:flex;align-items:center;gap:6px;flex-shrink:0; }
  button.qty-btn {
    width:24px;height:24px;border-radius:6px;
    background:rgba(255,255,255,0.06);border:1px solid var(--border);
    color:var(--text);font-size:14px;line-height:1;cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    transition:background .2s,border-color .2s;
  }
  button.qty-btn:hover{ background:rgba(79,255,176,0.12);border-color:rgba(79,255,176,0.3);color:var(--accent); }
  .qty-val { font-family:'Syne',sans-serif;font-size:13px;font-weight:700;min-width:16px;text-align:center; }
  button.remove-btn {
    width:22px;height:22px;border-radius:6px;flex-shrink:0;
    background:rgba(255,107,107,0.08);border:1px solid rgba(255,107,107,0.18);
    color:var(--danger);font-size:12px;cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    transition:background .2s;
  }
  button.remove-btn:hover{ background:rgba(255,107,107,0.18); }

  /* Cart empty */
  .cart-empty { text-align:center;padding:24px 12px;color:var(--muted);font-size:13px; }

  /* Cart total */
  .cart-divider { height:1px;background:var(--border);margin-bottom:14px; }
  .cart-total-row { display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px; }
  .cart-total-label { font-size:12px;color:var(--muted);letter-spacing:.06em;text-transform:uppercase; }
  .cart-total-val { font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:var(--accent); }

  /* Order button */
  button.btn-order {
    width:100%;
    background:var(--accent);color:#06080f;
    border:none;border-radius:12px;padding:14px;
    font-family:'Syne',sans-serif;font-size:13px;font-weight:700;letter-spacing:.05em;
    cursor:pointer;position:relative;overflow:hidden;
    transition:transform .2s,box-shadow .2s;
  }
  button.btn-order:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(79,255,176,0.35);}
  button.btn-order:active{transform:translateY(0);}
  button.btn-order::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.22),transparent);pointer-events:none;}
  .btn-inner{display:inline-flex;align-items:center;justify-content:center;gap:8px;}
  .spinner{width:14px;height:14px;border:2px solid rgba(6,8,15,0.25);border-top-color:#06080f;border-radius:50%;animation:spin .7s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg);}}

  /* Success toast */
  .toast {
    position:fixed;bottom:32px;left:50%;transform:translateX(-50%);
    background:rgba(13,17,28,0.95);border:1px solid rgba(79,255,176,0.3);
    border-radius:12px;padding:12px 20px;
    display:flex;align-items:center;gap:10px;
    font-size:13px;color:var(--accent);font-weight:500;
    box-shadow:0 8px 32px rgba(0,0,0,0.5);
    white-space:nowrap;z-index:1000;
  }
`;

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.06 } } };
const fadeUp  = { hidden:{ opacity:0, y:20 }, show:{ opacity:1, y:0, transition:{ duration:0.5, ease:[0.22,1,0.36,1] } } };
const cardAnim = {
  hidden:{ opacity:0, y:20, scale:0.97 },
  show:(i)=>({ opacity:1, y:0, scale:1, transition:{ delay:i*0.06, duration:0.4, ease:[0.22,1,0.36,1] } }),
};
const cartItemAnim = {
  hidden:{ opacity:0, x:16, scale:0.97 },
  show:{ opacity:1, x:0, scale:1, transition:{ duration:0.3, ease:[0.22,1,0.36,1] } },
  exit:{ opacity:0, x:16, scale:0.95, transition:{ duration:0.2 } },
};

function stockMeta(stock) {
  if (stock <= 0)  return { cls:"out", label:"Out of stock" };
  if (stock <= 10) return { cls:"low", label:`Low · ${stock}` };
  return { cls:"in", label:`In stock · ${stock}` };
}

export default function MedicinesPage() {
  const [meds,      setMeds]      = useState([]);
  const [cart,      setCart]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [ordering,  setOrdering]  = useState(false);
  const [toast,     setToast]     = useState(false);

  useEffect(() => { fetchMedicines(); }, []);

  const fetchMedicines = async () => {
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/medicines`);
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        setMeds(data.data || []);
      } catch {
        console.error("Not JSON response 👉", text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (med) => {
    const existing = cart.find(item => item.medicineId === med._id);
    if (existing) {
      setCart(cart.map(item =>
        item.medicineId === med._id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { medicineId: med._id, name: med.name, price: med.price, quantity: 1 }]);
    }
  };

  const increaseQty = (id) =>
    setCart(cart.map(item => item.medicineId === id ? { ...item, quantity: item.quantity + 1 } : item));

  const decreaseQty = (id) =>
    setCart(cart.map(item => item.medicineId === id ? { ...item, quantity: item.quantity - 1 } : item)
               .filter(item => item.quantity > 0));

  const removeItem = (id) => setCart(cart.filter(item => item.medicineId !== id));

  const placeOrder = async () => {
    if (cart.length === 0) return;
    try {
      setOrdering(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?._id || "123", items: cart }),
      });
      const data = await res.json();
      if (data.success) {
        setCart([]);
        setToast(true);
        setTimeout(() => setToast(false), 3000);
      } else {
        alert("Order failed ❌");
      }
    } catch (err) {
      console.error(err);
      alert("Error placing order ❌");
    } finally {
      setOrdering(false);
    }
  };

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.reduce((s, i) => s + (i.price || 0) * i.quantity, 0);

  return (
    <>
      <style>{css}</style>
      <div className="aurora"><span /><span /><span /></div>
      <div className="noise" />

      <div className="page">

        {/* Header */}
        <motion.div className="header" variants={stagger} initial="hidden" animate="show">
          <motion.div className="badge" variants={fadeUp}><span className="dot" /> Pharmacy</motion.div>
          <motion.h1 className="title" variants={fadeUp}>Medicines</motion.h1>
          <motion.p className="subtitle" variants={fadeUp}>Browse and order medicines directly to your door.</motion.p>
        </motion.div>

        {/* Medicines */}
        <div>
          <div className="section-lbl">
            <span>Available Medicines</span><span className="line" />
          </div>
          <div className="med-grid">
            {loading && [1,2,3,4,5,6].map(i => (
              <motion.div key={i} className="skeleton"
                initial={{ opacity:0 }} animate={{ opacity:1 }}
                transition={{ delay:i*0.06 }} />
            ))}
            <AnimatePresence>
              {!loading && meds.map((m, i) => {
                const { cls, label } = stockMeta(m.stock);
                const inCart = cart.find(c => c.medicineId === m._id);
                return (
                  <motion.div key={m._id} className="med-card"
                    custom={i} variants={cardAnim} initial="hidden" animate="show"
                    whileHover={{ scale:1.02 }}>
                    <div className="med-icon">💊</div>
                    <div className="med-name">{m.name}</div>
                    <div className="med-price">₹{m.price}</div>
                    <span className={`med-stock ${cls}`}>{label}</span>
                    <motion.button className="btn-add"
                      disabled={m.stock <= 0}
                      onClick={() => addToCart(m)}
                      whileTap={{ scale:0.95 }}>
                      {inCart ? `In Cart (${inCart.quantity}) ✓` : "+ Add to Cart"}
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Cart sidebar */}
        <div className="cart-sidebar">
          <div className="cart-head">
            <span className="cart-title">🛒 Cart</span>
            {totalItems > 0 && <span className="cart-count">{totalItems} item{totalItems !== 1 ? "s" : ""}</span>}
          </div>

          {cart.length === 0 ? (
            <div className="cart-empty">
              <div style={{ fontSize:"32px", marginBottom:"8px" }}>🛒</div>
              Your cart is empty
            </div>
          ) : (
            <>
              <div className="cart-items">
                <AnimatePresence>
                  {cart.map(item => (
                    <motion.div key={item.medicineId} className="cart-item"
                      variants={cartItemAnim} initial="hidden" animate="show" exit="exit" layout>
                      <span className="cart-item-name">{item.name}</span>
                      <div className="qty-controls">
                        <motion.button className="qty-btn" onClick={() => decreaseQty(item.medicineId)} whileTap={{ scale:0.9 }}>−</motion.button>
                        <span className="qty-val">{item.quantity}</span>
                        <motion.button className="qty-btn" onClick={() => increaseQty(item.medicineId)} whileTap={{ scale:0.9 }}>+</motion.button>
                      </div>
                      <motion.button className="remove-btn" onClick={() => removeItem(item.medicineId)} whileTap={{ scale:0.9 }}>✕</motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="cart-divider" />
              <div className="cart-total-row">
                <span className="cart-total-label">Total</span>
                <span className="cart-total-val">₹{totalPrice.toFixed(2)}</span>
              </div>

              <motion.button className="btn-order" onClick={placeOrder}
                disabled={ordering} whileTap={{ scale:0.97 }}>
                <span className="btn-inner">
                  {ordering ? <><div className="spinner" />Placing Order…</> : <>Place Order →</>}
                </span>
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div className="toast"
            initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:24 }} transition={{ duration:0.3 }}>
            ✅ Order placed successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}