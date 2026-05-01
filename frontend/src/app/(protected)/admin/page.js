"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getDashboardStats,
  getDoctorsAdmin,
  addDoctor,
  deleteDoctor,
  getOrdersAdmin,
  updateOrder,
  updateDoctor,
  getAppointmentsAdmin,
  updateAppointment,
  getMedicinesAdmin,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  getHospitalsAdmin,
  addHospital,
  updateHospital,
} from "@/services/adminService";

const emptyDoctorForm = {
  name: "",
  specialization: "",
  fees: "",
  experience: "",
  image: "",
};

const emptyMedicineForm = {
  name: "",
  price: "",
  stock: "",
  description: "",
  image: "",
};

const emptyHospitalForm = {
  name: "",
  city: "",
  ICU: "",
  oxygen: "",
  general: "",
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [editingMedicineId, setEditingMedicineId] = useState(null);
  const [editingHospitalId, setEditingHospitalId] = useState(null);
  const [doctorForm, setDoctorForm] = useState(emptyDoctorForm);
  const [medicineForm, setMedicineForm] = useState(emptyMedicineForm);
  const [hospitalForm, setHospitalForm] = useState(emptyHospitalForm);

  const tabs = useMemo(() => ([
    { id: "overview", label: "Overview" },
    { id: "doctors", label: "Doctors" },
    { id: "appointments", label: "Appointments" },
    { id: "medicines", label: "Medicines" },
    { id: "orders", label: "Orders" },
    { id: "hospitals", label: "Hospitals" },
  ]), []);

  const loadDashboard = useCallback(async () => {
    try {
      const [
        statsData,
        doctorsData,
        ordersData,
        appointmentsData,
        medicinesData,
        hospitalsData,
      ] = await Promise.all([
        getDashboardStats(),
        getDoctorsAdmin(),
        getOrdersAdmin(),
        getAppointmentsAdmin(),
        getMedicinesAdmin(),
        getHospitalsAdmin(),
      ]);

      setStats(statsData);
      setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setMedicines(Array.isArray(medicinesData) ? medicinesData : []);
      setHospitals(Array.isArray(hospitalsData) ? hospitalsData : []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadDashboard();
    });
  }, [loadDashboard]);

  const handleSaveDoctor = async () => {
    if (!doctorForm.name || !doctorForm.specialization) {
      return alert("Fill required doctor fields");
    }

    if (editingDoctorId) {
      await updateDoctor(editingDoctorId, doctorForm);
    } else {
      await addDoctor(doctorForm);
    }

    setDoctorForm(emptyDoctorForm);
    setEditingDoctorId(null);
    loadDashboard();
  };

  const editDoctor = (doctor) => {
    setDoctorForm({
      name: doctor.name || "",
      specialization: doctor.specialization || "",
      fees: doctor.fees || "",
      experience: doctor.experience || "",
      image: doctor.image || "",
    });
    setEditingDoctorId(doctor._id);
  };

  const handleSaveMedicine = async () => {
    if (!medicineForm.name || !medicineForm.price) {
      return alert("Fill required medicine fields");
    }

    if (editingMedicineId) {
      await updateMedicine(editingMedicineId, medicineForm);
    } else {
      await addMedicine(medicineForm);
    }

    setMedicineForm(emptyMedicineForm);
    setEditingMedicineId(null);
    loadDashboard();
  };

  const editMedicine = (medicine) => {
    setMedicineForm({
      name: medicine.name || "",
      price: medicine.price || "",
      stock: medicine.stock || "",
      description: medicine.description || "",
      image: medicine.image || "",
    });
    setEditingMedicineId(medicine._id);
  };

  const handleSaveHospital = async () => {
    if (!hospitalForm.name || !hospitalForm.city) {
      return alert("Fill required hospital fields");
    }

    const payload = {
      name: hospitalForm.name,
      city: hospitalForm.city,
      beds: {
        ICU: Number(hospitalForm.ICU || 0),
        oxygen: Number(hospitalForm.oxygen || 0),
        general: Number(hospitalForm.general || 0),
      },
    };

    if (editingHospitalId) {
      await updateHospital(editingHospitalId, payload);
    } else {
      await addHospital(payload);
    }

    setHospitalForm(emptyHospitalForm);
    setEditingHospitalId(null);
    loadDashboard();
  };

  const editHospital = (hospital) => {
    setHospitalForm({
      name: hospital.name || "",
      city: hospital.city || "",
      ICU: hospital.beds?.ICU || "",
      oxygen: hospital.beds?.oxygen || "",
      general: hospital.beds?.general || "",
    });
    setEditingHospitalId(hospital._id);
  };

  const setAppointmentStatus = async (id, status) => {
    await updateAppointment(id, { status });
    loadDashboard();
  };

  const setOrderStatus = async (id, status) => {
    await updateOrder(id, { status });
    loadDashboard();
  };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <h2>MediCare Admin</h2>
        <ul>
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                className={activeTab === tab.id ? "active" : ""}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="admin-main">
        <div className="admin-heading">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage operations promised in the MediCare README.</p>
          </div>
          <button className="btn-primary" onClick={loadDashboard}>Refresh</button>
        </div>

        {activeTab === "overview" && (
          <>
            <div className="stats-grid">
              <div className="stat-card"><h3>Users</h3><p>{stats.totalUsers || 0}</p></div>
              <div className="stat-card"><h3>Doctors</h3><p>{stats.totalDoctors || 0}</p></div>
              <div className="stat-card"><h3>Appointments</h3><p>{stats.totalAppointments || 0}</p></div>
              <div className="stat-card"><h3>Orders</h3><p>{stats.totalOrders || 0}</p></div>
              <div className="stat-card"><h3>Revenue</h3><p>Rs {stats.revenue || 0}</p></div>
              <div className="stat-card"><h3>Medicines</h3><p>{medicines.length}</p></div>
              <div className="stat-card"><h3>Hospitals</h3><p>{hospitals.length}</p></div>
            </div>
          </>
        )}

        {activeTab === "doctors" && (
          <section className="admin-section">
            <h2>{editingDoctorId ? "Edit Doctor" : "Add Doctor"}</h2>
            <div className="admin-form">
              {Object.keys(emptyDoctorForm).map((field) => (
                <input
                  key={field}
                  placeholder={field}
                  value={doctorForm[field]}
                  onChange={(e) => setDoctorForm({ ...doctorForm, [field]: e.target.value })}
                />
              ))}
              <button onClick={handleSaveDoctor}>{editingDoctorId ? "Update Doctor" : "Add Doctor"}</button>
            </div>

            {doctors.map((doctor) => (
              <div key={doctor._id} className="admin-card">
                <div>
                  <h3>{doctor.name}</h3>
                  <p>{doctor.specialization} | Rs {doctor.fees || 0} | {doctor.experience || 0} yrs</p>
                </div>
                <div>
                  <button onClick={() => editDoctor(doctor)}>Edit</button>
                  <button onClick={async () => { await deleteDoctor(doctor._id); loadDashboard(); }}>Delete</button>
                </div>
              </div>
            ))}
          </section>
        )}

        {activeTab === "appointments" && (
          <section className="admin-section">
            <h2>Appointment Tracking</h2>
            {appointments.map((appointment) => (
              <div key={appointment._id} className="admin-card">
                <div>
                  <h3>{appointment.doctor?.name || "Doctor"}</h3>
                  <p>{appointment.user?.name || "Patient"} | {appointment.date} at {appointment.time}</p>
                </div>
                <select
                  value={appointment.status}
                  onChange={(e) => setAppointmentStatus(appointment._id, e.target.value)}
                >
                  <option value="booked">Booked</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            ))}
          </section>
        )}

        {activeTab === "medicines" && (
          <section className="admin-section">
            <h2>{editingMedicineId ? "Edit Medicine" : "Add Medicine"}</h2>
            <div className="admin-form">
              {Object.keys(emptyMedicineForm).map((field) => (
                <input
                  key={field}
                  placeholder={field}
                  value={medicineForm[field]}
                  onChange={(e) => setMedicineForm({ ...medicineForm, [field]: e.target.value })}
                />
              ))}
              <button onClick={handleSaveMedicine}>{editingMedicineId ? "Update Medicine" : "Add Medicine"}</button>
            </div>

            {medicines.map((medicine) => (
              <div key={medicine._id} className="admin-card">
                <div>
                  <h3>{medicine.name}</h3>
                  <p>Rs {medicine.price || 0} | Stock: {medicine.stock || 0}</p>
                </div>
                <div>
                  <button onClick={() => editMedicine(medicine)}>Edit</button>
                  <button onClick={async () => { await deleteMedicine(medicine._id); loadDashboard(); }}>Delete</button>
                </div>
              </div>
            ))}
          </section>
        )}

        {activeTab === "orders" && (
          <section className="admin-section">
            <h2>Order Tracking</h2>
            {orders.map((order) => (
              <div key={order._id} className="admin-card">
                <div>
                  <h3>{order.user?.name || "Customer"}</h3>
                  <p>Total: Rs {order.total || 0}</p>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => setOrderStatus(order._id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            ))}
          </section>
        )}

        {activeTab === "hospitals" && (
          <section className="admin-section">
            <h2>{editingHospitalId ? "Edit Hospital" : "Add Hospital"}</h2>
            <div className="admin-form">
              {Object.keys(emptyHospitalForm).map((field) => (
                <input
                  key={field}
                  placeholder={field}
                  value={hospitalForm[field]}
                  onChange={(e) => setHospitalForm({ ...hospitalForm, [field]: e.target.value })}
                />
              ))}
              <button onClick={handleSaveHospital}>{editingHospitalId ? "Update Hospital" : "Add Hospital"}</button>
            </div>

            {hospitals.map((hospital) => (
              <div key={hospital._id} className="admin-card">
                <div>
                  <h3>{hospital.name}</h3>
                  <p>{hospital.city} | ICU {hospital.beds?.ICU || 0} | Oxygen {hospital.beds?.oxygen || 0} | General {hospital.beds?.general || 0}</p>
                </div>
                <button onClick={() => editHospital(hospital)}>Edit Beds</button>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
