"use client";

import { useEffect, useState } from "react";
import {
  getDashboardStats,
  getDoctorsAdmin,
  addDoctor,
  deleteDoctor,
  getOrdersAdmin,
  updateOrder,
  updateDoctor
} from "../../services/adminService";

export default function AdminDashboard() {
  const emptyDoctorForm = {
    name: "",
    specialization: "",
    fees: "",
    experience: "",
    image: ""
  };

  const [stats, setStats] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [doctorForm, setDoctorForm] = useState(emptyDoctorForm);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const statsData = await getDashboardStats();
      const doctorsData = await getDoctorsAdmin();
      const ordersData = await getOrdersAdmin();

      setStats(statsData);
      setDoctors(doctorsData);
      setOrders(ordersData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveDoctor = async () => {
    if (!doctorForm.name || !doctorForm.specialization) {
      return alert("Fill required fields");
    }

    try {
      if (editingDoctorId) {
        await updateDoctor(editingDoctorId, doctorForm);
      } else {
        await addDoctor(doctorForm);
      }

      setDoctorForm(emptyDoctorForm);
      setEditingDoctorId(null);

      loadDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDoctor = async (id) => {
    await deleteDoctor(id);
    loadDashboard();
  };

  const handleUpdateOrder = async (id) => {
    const status = prompt("Enter new status:");

    if (!status) return;

    await updateOrder(id, { status });

    loadDashboard();
  };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <h2>MediCare Admin</h2>
        <ul>
          <li>Analytics</li>
          <li>Doctors</li>
          <li>Orders</li>
        </ul>
      </aside>

      <main className="admin-main">
        <h1>📊 Admin Dashboard</h1>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Users</h3>
            <p>{stats.totalUsers || 0}</p>
          </div>

          <div className="stat-card">
            <h3>Doctors</h3>
            <p>{stats.totalDoctors || 0}</p>
          </div>

          <div className="stat-card">
            <h3>Appointments</h3>
            <p>{stats.totalAppointments || 0}</p>
          </div>

          <div className="stat-card">
            <h3>Revenue</h3>
            <p>₹{stats.revenue || 0}</p>
          </div>
        </div>

        {/* Doctor Form */}
        <section className="admin-section">
          <h2>
            {editingDoctorId ? "Edit Doctor" : "Add Doctor"}
          </h2>

          <div className="doctor-form">
            <input
              placeholder="Name"
              value={doctorForm.name}
              onChange={(e) =>
                setDoctorForm({
                  ...doctorForm,
                  name: e.target.value
                })
              }
            />

            <input
              placeholder="Specialization"
              value={doctorForm.specialization}
              onChange={(e) =>
                setDoctorForm({
                  ...doctorForm,
                  specialization: e.target.value
                })
              }
            />

            <input
              placeholder="Fees"
              value={doctorForm.fees}
              onChange={(e) =>
                setDoctorForm({
                  ...doctorForm,
                  fees: e.target.value
                })
              }
            />

            <input
              placeholder="Experience"
              value={doctorForm.experience}
              onChange={(e) =>
                setDoctorForm({
                  ...doctorForm,
                  experience: e.target.value
                })
              }
            />

            <input
              placeholder="Doctor Image URL"
              value={doctorForm.image}
              onChange={(e) =>
                setDoctorForm({
                  ...doctorForm,
                  image: e.target.value
                })
              }
            />

            <button onClick={handleSaveDoctor}>
              {editingDoctorId ? "Update Doctor" : "Add Doctor"}
            </button>

            {editingDoctorId && (
              <button
                onClick={() => {
                  setDoctorForm(emptyDoctorForm);
                  setEditingDoctorId(null);
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </section>

        {/* Doctors */}
        <section className="admin-section">
          <h2>Doctors</h2>

          {doctors.map((doc) => (
            <div key={doc._id} className="admin-card">
              <div>
                {doc.image && (
                  <img
                    src={doc.image}
                    alt={doc.name}
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginBottom: "10px"
                    }}
                  />
                )}

                <h3>{doc.name}</h3>
                <p>{doc.specialization}</p>
              </div>

              <div>
                <button
                  onClick={() => {
                    setDoctorForm({
                      name: doc.name || "",
                      specialization: doc.specialization || "",
                      fees: doc.fees || "",
                      experience: doc.experience || "",
                      image: doc.image || ""
                    });

                    setEditingDoctorId(doc._id);
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    handleDeleteDoctor(doc._id)
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Orders */}
        <section className="admin-section">
          <h2>Orders</h2>

          {orders.map((order) => (
            <div key={order._id} className="admin-card">
              <div>
                <p>User: {order.user?.name}</p>
                <p>Total: ₹{order.total}</p>
                <p>Status: {order.status}</p>
              </div>

              <button
                onClick={() =>
                  handleUpdateOrder(order._id)
                }
              >
                Update
              </button>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}