"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getOrders } from "@/services/pharmacyService";
import "@/styles/order.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      const res = await getOrders();
      setOrders(Array.isArray(res) ? res : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadOrders();
    });
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    return status === "all"
      ? orders
      : orders.filter((order) => order.status === status);
  }, [orders, status]);

  const totalSpend = useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  }, [filteredOrders]);

  if (loading) return <p className="center">Loading orders...</p>;

  return (
    <div className="orders-page">
      <div className="order-header">
        <div>
          <h1>My Orders</h1>
          <p>Review pharmacy orders and delivery status.</p>
        </div>
      </div>

      <div className="order-tools">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="delivered">Delivered</option>
        </select>

        <strong>Visible total: Rs {totalSpend}</strong>
      </div>

      {filteredOrders.length === 0 && <p>No orders found</p>}

      <div className="orders-list">
        {filteredOrders.map(o => (
          <div key={o._id} className="order-card">
            <div className="order-info">
              <h3>Order #{String(o._id).slice(-6).toUpperCase()}</h3>
              <p>Total: Rs {o.total}</p>
              <p>Items: {o.items?.length || 0}</p>
              <div className="order-items">
                {o.items?.map((item) => (
                  <span key={item._id || item.medicine?._id}>
                    {item.medicine?.name || "Medicine"} x {item.quantity}
                  </span>
                ))}
              </div>
            </div>

            <span className={`order-status ${o.status}`}>
              {o.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
