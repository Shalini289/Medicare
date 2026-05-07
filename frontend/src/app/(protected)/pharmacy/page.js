"use client";

import { useEffect, useMemo, useState } from "react";
import { getMedicines, placeOrder } from "@/services/pharmacyService";
import { createPaymentOrder } from "@/services/paymentService";
import MedicineCard from "@/components/MedicineCard";
import Cart from "@/components/Cart";

export default function Pharmacy() {
  const [data, setData] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");

  useEffect(() => {
    getMedicines().then(res =>
      setData(Array.isArray(res) ? res : [])
    );
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      const params = new URLSearchParams(window.location.search);
      const query = params.get("q");
      if (query) setSearch(query);
    });
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      const savedCart = localStorage.getItem("pharmacyCart");
      if (!savedCart) return;

      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(Array.isArray(parsedCart) ? parsedCart : []);
      } catch {
        localStorage.removeItem("pharmacyCart");
      }
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("pharmacyCart", JSON.stringify(cart));
  }, [cart]);

  const visibleMedicines = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? data.filter((med) =>
          [med.name, med.description, med.category]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(query))
        )
      : data;

    return [...filtered].sort((a, b) => {
      if (sort === "price-low") return Number(a.price || 0) - Number(b.price || 0);
      if (sort === "price-high") return Number(b.price || 0) - Number(a.price || 0);
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
  }, [data, search, sort]);

  const add = (med) => {
    setCart(prev => {
      const exists = prev.find(i => i._id === med._id);

      if (exists) {
        return prev.map(i =>
          i._id === med._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [...prev, { ...med, quantity: 1 }];
    });
  };

  const updateQuantity = (id, change) => {
    setCart(prev =>
      prev
        .map(item =>
          item._id === id
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const remove = (id) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const checkout = async () => {
    const orderItems = cart.map((item) => ({
      medicine: item._id,
      quantity: item.quantity,
    }));
    const total = cart.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0);

    try {
      const paymentOrder = await createPaymentOrder(total);
      const order = await placeOrder({
        items: orderItems,
        paymentId: paymentOrder.id,
      });

      alert(`Order placed. Payment order: ${paymentOrder.id}. Total: Rs ${order.total || 0}`);
      clearCart();
    } catch {
      alert("Order or payment failed. Please check stock and payment setup.");
    }
  };

  return (
    <div className="pharmacy-page">
      <h1>Pharmacy</h1>

      <div className="pharmacy-tools">
        <input
          type="search"
          placeholder="Search medicines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="name">Name</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      <div className="pharmacy-layout">
        <div className="pharmacy-grid">
          {visibleMedicines.map(m => (
            <MedicineCard key={m._id} med={m} add={add} />
          ))}

          {visibleMedicines.length === 0 && (
            <p className="empty">No medicines found</p>
          )}
        </div>

        <Cart
          cart={cart}
          checkout={checkout}
          updateQuantity={updateQuantity}
          remove={remove}
          clearCart={clearCart}
        />
      </div>
    </div>
  );
}
