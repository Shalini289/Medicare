"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createMedicine,
  deleteMedicine,
  getMedicineByBarcode,
  getMedicines,
  getPharmacyAlerts,
  getPharmacyOrders,
  placeOrder,
  updateMedicine,
  updatePharmacyOrderStatus,
} from "@/services/pharmacyService";
import { createPaymentOrder } from "@/services/paymentService";
import { getCurrentUser } from "@/utils/auth";
import MedicineCard from "@/components/MedicineCard";
import Cart from "@/components/Cart";
import "@/styles/pharmacy.css";

const blankMedicine = {
  name: "",
  price: "",
  stock: "",
  category: "",
  supplier: "",
  reorderLevel: "10",
  barcode: "",
  batchNumber: "",
  expiryDate: "",
  description: "",
  image: "",
};

export default function Pharmacy() {
  const [data, setData] = useState([]);
  const [alerts, setAlerts] = useState({ lowStock: [], expiringSoon: [] });
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [barcode, setBarcode] = useState("");
  const [sort, setSort] = useState("name");
  const [message, setMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [medicineForm, setMedicineForm] = useState(blankMedicine);
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);

  const isPharmacyStaff = ["pharmacy", "admin"].includes(currentUser?.role);

  const loadPharmacyData = async (staffMode = false) => {
    const [res, alertData, orderData] = await Promise.all([
      getMedicines(),
      getPharmacyAlerts().catch(() => ({ lowStock: [], expiringSoon: [] })),
      staffMode ? getPharmacyOrders().catch(() => []) : Promise.resolve([]),
    ]);

    setData(Array.isArray(res) ? res : []);
    setAlerts(alertData || { lowStock: [], expiringSoon: [] });
    setOrders(Array.isArray(orderData) ? orderData : []);
  };

  useEffect(() => {
    queueMicrotask(() => {
      setCurrentUser(getCurrentUser());
    });
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    loadPharmacyData(["pharmacy", "admin"].includes(currentUser.role)).catch(() => {
      setMessage("Pharmacy data could not be loaded right now.");
    });
  }, [currentUser]);

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
          [med.name, med.description, med.category, med.barcode, med.batchNumber, med.supplier]
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

  const updateMedicineField = (field, value) => {
    setMedicineForm((current) => ({ ...current, [field]: value }));
  };

  const startEditingMedicine = (medicine) => {
    setEditingId(medicine._id);
    setMedicineForm({
      name: medicine.name || "",
      price: medicine.price ?? "",
      stock: medicine.stock ?? "",
      category: medicine.category || "",
      supplier: medicine.supplier || "",
      reorderLevel: medicine.reorderLevel ?? "10",
      barcode: medicine.barcode || "",
      batchNumber: medicine.batchNumber || "",
      expiryDate: medicine.expiryDate ? new Date(medicine.expiryDate).toISOString().slice(0, 10) : "",
      description: medicine.description || "",
      image: medicine.image || "",
    });
    setMessage(`Editing ${medicine.name}`);
  };

  const resetMedicineForm = () => {
    setEditingId("");
    setMedicineForm(blankMedicine);
  };

  const saveMedicine = async (event) => {
    event.preventDefault();

    if (!medicineForm.name.trim()) {
      setMessage("Medicine name is required.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...medicineForm,
        price: Number(medicineForm.price || 0),
        stock: Number(medicineForm.stock || 0),
        reorderLevel: Number(medicineForm.reorderLevel || 0),
      };

      if (editingId) {
        await updateMedicine(editingId, payload);
        setMessage("Medicine updated.");
      } else {
        await createMedicine(payload);
        setMessage("Medicine added to inventory.");
      }

      resetMedicineForm();
      await loadPharmacyData(true);
    } catch (err) {
      setMessage(err.message || "Medicine could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const removeMedicine = async (id) => {
    try {
      await deleteMedicine(id);
      setMessage("Medicine deleted.");
      await loadPharmacyData(true);
    } catch (err) {
      setMessage(err.message || "Medicine could not be deleted.");
    }
  };

  const changeOrderStatus = async (id, status) => {
    try {
      await updatePharmacyOrderStatus(id, status);
      setMessage("Order status updated.");
      await loadPharmacyData(true);
    } catch (err) {
      setMessage(err.message || "Order status could not be updated.");
    }
  };

  const add = (med) => {
    if (med.expiryStatus === "expired") {
      setMessage(`${med.name} is expired and cannot be ordered.`);
      return;
    }

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

  const scanBarcode = async () => {
    if (!barcode.trim()) return;

    try {
      const medicine = await getMedicineByBarcode(barcode.trim());
      setSearch(medicine.name);
      setMessage(`${medicine.name} found by barcode.`);
    } catch (err) {
      setMessage(err.message || "No medicine found for this barcode.");
    }
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

      <div className="pharmacy-alerts">
        <div>
          <strong>{alerts.lowStock?.length || 0}</strong>
          <span>Low stock alerts</span>
        </div>
        <div>
          <strong>{alerts.expiringSoon?.length || 0}</strong>
          <span>Expiry alerts</span>
        </div>
      </div>

      {message && <p className="pharmacy-message">{message}</p>}

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

      <div className="barcode-tools">
        <input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && scanBarcode()}
          placeholder="Scan or enter barcode"
        />
        <button onClick={scanBarcode}>Find by Barcode</button>
      </div>

      {isPharmacyStaff && (
        <>
          <section className="pharmacy-manager">
            <div>
              <h2>{editingId ? "Edit medicine" : "Add medicine"}</h2>
              <p>Enter medicine stock, barcode, batch, supplier, and expiry details.</p>
            </div>

            <form className="medicine-admin-form" onSubmit={saveMedicine}>
              <input value={medicineForm.name} onChange={(e) => updateMedicineField("name", e.target.value)} placeholder="Medicine name" />
              <input type="number" min="0" value={medicineForm.price} onChange={(e) => updateMedicineField("price", e.target.value)} placeholder="Price" />
              <input type="number" min="0" value={medicineForm.stock} onChange={(e) => updateMedicineField("stock", e.target.value)} placeholder="Stock" />
              <input type="number" min="0" value={medicineForm.reorderLevel} onChange={(e) => updateMedicineField("reorderLevel", e.target.value)} placeholder="Reorder level" />
              <input value={medicineForm.category} onChange={(e) => updateMedicineField("category", e.target.value)} placeholder="Category" />
              <input value={medicineForm.supplier} onChange={(e) => updateMedicineField("supplier", e.target.value)} placeholder="Supplier" />
              <input value={medicineForm.barcode} onChange={(e) => updateMedicineField("barcode", e.target.value)} placeholder="Barcode" />
              <input value={medicineForm.batchNumber} onChange={(e) => updateMedicineField("batchNumber", e.target.value)} placeholder="Batch number" />
              <input type="date" value={medicineForm.expiryDate} onChange={(e) => updateMedicineField("expiryDate", e.target.value)} />
              <input value={medicineForm.image} onChange={(e) => updateMedicineField("image", e.target.value)} placeholder="Image path or URL" />
              <textarea value={medicineForm.description} onChange={(e) => updateMedicineField("description", e.target.value)} placeholder="Description" rows="3" />

              <div className="medicine-admin-actions">
                <button type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Update medicine" : "Add medicine"}</button>
                {editingId && <button type="button" onClick={resetMedicineForm}>Cancel edit</button>}
              </div>
            </form>
          </section>

          <section className="pharmacy-inventory">
            <h2>Inventory management</h2>
            <div className="inventory-list">
              {visibleMedicines.map((medicine) => (
                <article key={medicine._id} className="inventory-row">
                  <div>
                    <strong>{medicine.name}</strong>
                    <span>{medicine.category || "Uncategorized"} - Stock {medicine.stock || 0} - Reorder {medicine.reorderLevel || 0}</span>
                    <small>{medicine.barcode ? `Barcode ${medicine.barcode}` : "No barcode"} {medicine.expiryStatus ? `- ${medicine.expiryStatus}` : ""}</small>
                  </div>
                  <div>
                    <button onClick={() => startEditingMedicine(medicine)}>Edit</button>
                    <button className="danger" onClick={() => removeMedicine(medicine._id)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="pharmacy-orders">
            <h2>Order management</h2>
            <div className="order-list">
              {orders.length === 0 ? (
                <p className="empty">No pharmacy orders yet.</p>
              ) : orders.map((order) => (
                <article key={order._id} className="order-row">
                  <div>
                    <strong>{order.user?.name || "Patient"}</strong>
                    <span>Rs {order.total || 0} - {order.items?.length || 0} item{order.items?.length === 1 ? "" : "s"}</span>
                    <small>{new Date(order.createdAt).toLocaleString()}</small>
                  </div>
                  <select value={order.status} onChange={(e) => changeOrderStatus(order._id, e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      {!isPharmacyStaff && (
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
      )}
    </div>
  );
}
