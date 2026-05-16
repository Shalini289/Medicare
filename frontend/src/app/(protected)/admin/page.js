"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addAmbulance,
  addDepartment,
  addDoctor,
  addHospital,
  addInsuranceClaim,
  addInvoice,
  addMedicine,
  addStaff,
  deleteAmbulance,
  deleteDepartment,
  deleteDoctor,
  deleteInsuranceClaim,
  deleteInvoice,
  deleteMedicine,
  deleteStaff,
  deleteUserAdmin,
  getAmbulancesAdmin,
  getAdminRecords,
  getAppointmentsAdmin,
  getDashboardStats,
  getDepartmentsAdmin,
  getDoctorsAdmin,
  getHospitalsAdmin,
  getInsuranceClaimsAdmin,
  getInvoicesAdmin,
  getMedicinesAdmin,
  getOrdersAdmin,
  getStaffAdmin,
  getUsersAdmin,
  updateAmbulance,
  updateAppointment,
  updateDepartment,
  updateDoctor,
  updateHospital,
  updateInsuranceClaim,
  updateInvoice,
  updateMedicine,
  updateOrder,
  updateStaff,
} from "@/services/adminService";
import { getCurrentUser } from "@/utils/auth";

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
  reorderLevel: "10",
  category: "",
  supplier: "",
  barcode: "",
  batchNumber: "",
  expiryDate: "",
  description: "",
  image: "",
};

const emptyHospitalForm = {
  name: "",
  city: "",
  ICU: "",
  oxygen: "",
  general: "",
  occupiedICU: "",
  occupiedOxygen: "",
  occupiedGeneral: "",
};

const emptyStaffForm = {
  name: "",
  role: "",
  department: "",
  phone: "",
  shift: "",
  status: "active",
};

const emptyInvoiceForm = {
  patientName: "",
  amount: "",
  dueDate: "",
  status: "unpaid",
  items: "",
};

const emptyClaimForm = {
  patientName: "",
  provider: "",
  policyNumber: "",
  amount: "",
  status: "submitted",
  notes: "",
};

const emptyAmbulanceForm = {
  vehicleNumber: "",
  driverName: "",
  driverPhone: "",
  location: "",
  status: "available",
};

const emptyDepartmentForm = {
  name: "",
  head: "",
  phone: "",
  beds: "",
  status: "active",
};

const formatCurrency = (value) =>
  `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

const formatDateTime = (value) => {
  if (!value) return "Not available";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toStatusRows = (items = {}) =>
  Object.entries(items).map(([label, value]) => ({
    label: label.replace(/-/g, " "),
    value,
  }));

const getPersonName = (value, fallback = "Not assigned") => {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value.name || value.email || fallback;
};

const renderRecordValue = (value) => {
  if (value === null || value === undefined || value === "") return "Not set";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString("en-IN");
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? "" : "s"}`;
  if (typeof value === "object") return value.name || value.email || value.title || value._id || "Record";
  return String(value);
};

function RecordGroup({ title, records, fields }) {
  const items = Array.isArray(records) ? records : [];

  return (
    <section className="admin-section">
      <div className="admin-section-title">
        <h2>{title}</h2>
        <span>{items.length} record{items.length === 1 ? "" : "s"}</span>
      </div>

      {items.length === 0 && <p className="analytics-empty">No records found.</p>}

      {items.map((record) => (
        <div key={record._id} className="admin-card admin-card--records">
          <div>
            <h3>{record.name || record.title || record.invoiceNumber || record.claimNumber || record.file?.split(/[\\/]/).pop() || record._id}</h3>
            <div className="record-field-grid">
              {fields.map(([label, getter]) => (
                <p key={label}>
                  <span>{label}</span>
                  <strong>{renderRecordValue(getter(record))}</strong>
                </p>
              ))}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [accessStatus, setAccessStatus] = useState("checking");
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [staff, setStaff] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [claims, setClaims] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editingIds, setEditingIds] = useState({});
  const [doctorForm, setDoctorForm] = useState(emptyDoctorForm);
  const [medicineForm, setMedicineForm] = useState(emptyMedicineForm);
  const [hospitalForm, setHospitalForm] = useState(emptyHospitalForm);
  const [staffForm, setStaffForm] = useState(emptyStaffForm);
  const [invoiceForm, setInvoiceForm] = useState(emptyInvoiceForm);
  const [claimForm, setClaimForm] = useState(emptyClaimForm);
  const [ambulanceForm, setAmbulanceForm] = useState(emptyAmbulanceForm);
  const [departmentForm, setDepartmentForm] = useState(emptyDepartmentForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const tabs = useMemo(() => ([
    { id: "overview", label: "Analytics" },
    { id: "users", label: "Users" },
    { id: "records", label: "Records" },
    { id: "hospitals", label: "Beds" },
    { id: "staff", label: "Staff" },
    { id: "invoices", label: "Billing" },
    { id: "claims", label: "Insurance" },
    { id: "medicines", label: "Pharmacy" },
    { id: "ambulances", label: "Ambulances" },
    { id: "departments", label: "Departments" },
    { id: "doctors", label: "Doctors" },
    { id: "appointments", label: "Appointments" },
    { id: "orders", label: "Orders" },
  ]), []);

  const loadDashboard = useCallback(async () => {
    setError("");

    const requests = [
      ["stats", getDashboardStats],
      ["users", getUsersAdmin],
      ["records", getAdminRecords],
      ["doctors", getDoctorsAdmin],
      ["orders", getOrdersAdmin],
      ["appointments", getAppointmentsAdmin],
      ["medicines", getMedicinesAdmin],
      ["hospitals", getHospitalsAdmin],
      ["staff", getStaffAdmin],
      ["invoices", getInvoicesAdmin],
      ["claims", getInsuranceClaimsAdmin],
      ["ambulances", getAmbulancesAdmin],
      ["departments", getDepartmentsAdmin],
    ];

    const results = await Promise.allSettled(requests.map(([, request]) => request()));
    const data = {};
    const failures = [];

    results.forEach((result, index) => {
      const key = requests[index][0];

      if (result.status === "fulfilled") {
        data[key] = result.value;
      } else {
        failures.push(`${key}: ${result.reason?.message || "API Error"}`);
      }
    });

    setStats(data.stats && typeof data.stats === "object" ? data.stats : {});
    setUsers(Array.isArray(data.users) ? data.users : []);
    setRecords(data.records && typeof data.records === "object" ? data.records : {});
    setDoctors(Array.isArray(data.doctors) ? data.doctors : []);
    setOrders(Array.isArray(data.orders) ? data.orders : []);
    setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
    setMedicines(Array.isArray(data.medicines) ? data.medicines : []);
    setHospitals(Array.isArray(data.hospitals) ? data.hospitals : []);
    setStaff(Array.isArray(data.staff) ? data.staff : []);
    setInvoices(Array.isArray(data.invoices) ? data.invoices : []);
    setClaims(Array.isArray(data.claims) ? data.claims : []);
    setAmbulances(Array.isArray(data.ambulances) ? data.ambulances : []);
    setDepartments(Array.isArray(data.departments) ? data.departments : []);

    if (failures.length) {
      setError(`Some admin data could not load. ${failures.join(" | ")}`);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      const currentUser = getCurrentUser();

      if (currentUser?.role !== "admin") {
        setAccessStatus("denied");
        router.replace("/dashboard");
        return;
      }

      setAccessStatus("allowed");
      loadDashboard();
    });
  }, [loadDashboard, router]);

  const setEditing = (key, id) => {
    setEditingIds((current) => ({ ...current, [key]: id }));
  };

  const showSaved = async (text = "Saved") => {
    setMessage(text);
    await loadDashboard();
  };

  const saveDoctor = async () => {
    if (!doctorForm.name || !doctorForm.specialization) return setError("Fill required doctor fields");
    if (editingIds.doctor) await updateDoctor(editingIds.doctor, doctorForm);
    else await addDoctor(doctorForm);
    setDoctorForm(emptyDoctorForm);
    setEditing("doctor", null);
    showSaved("Doctor saved");
  };

  const saveMedicine = async () => {
    if (!medicineForm.name || !medicineForm.price) return setError("Fill required medicine fields");
    if (editingIds.medicine) await updateMedicine(editingIds.medicine, medicineForm);
    else await addMedicine(medicineForm);
    setMedicineForm(emptyMedicineForm);
    setEditing("medicine", null);
    showSaved("Medicine inventory saved");
  };

  const saveHospital = async () => {
    if (!hospitalForm.name || !hospitalForm.city) return setError("Fill required hospital fields");
    const payload = {
      name: hospitalForm.name,
      city: hospitalForm.city,
      beds: {
        ICU: Number(hospitalForm.ICU || 0),
        oxygen: Number(hospitalForm.oxygen || 0),
        general: Number(hospitalForm.general || 0),
      },
      occupiedBeds: {
        ICU: Number(hospitalForm.occupiedICU || 0),
        oxygen: Number(hospitalForm.occupiedOxygen || 0),
        general: Number(hospitalForm.occupiedGeneral || 0),
      },
    };

    if (editingIds.hospital) await updateHospital(editingIds.hospital, payload);
    else await addHospital(payload);
    setHospitalForm(emptyHospitalForm);
    setEditing("hospital", null);
    showSaved("Bed data saved");
  };

  const saveStaff = async () => {
    if (!staffForm.name) return setError("Staff name is required");
    if (editingIds.staff) await updateStaff(editingIds.staff, staffForm);
    else await addStaff(staffForm);
    setStaffForm(emptyStaffForm);
    setEditing("staff", null);
    showSaved("Staff record saved");
  };

  const saveInvoice = async () => {
    if (!invoiceForm.patientName || !invoiceForm.amount) return setError("Patient and amount are required");
    if (editingIds.invoice) await updateInvoice(editingIds.invoice, invoiceForm);
    else await addInvoice(invoiceForm);
    setInvoiceForm(emptyInvoiceForm);
    setEditing("invoice", null);
    showSaved("Invoice saved");
  };

  const saveClaim = async () => {
    if (!claimForm.patientName || !claimForm.provider) return setError("Patient and insurer are required");
    if (editingIds.claim) await updateInsuranceClaim(editingIds.claim, claimForm);
    else await addInsuranceClaim(claimForm);
    setClaimForm(emptyClaimForm);
    setEditing("claim", null);
    showSaved("Insurance claim saved");
  };

  const saveAmbulance = async () => {
    if (!ambulanceForm.vehicleNumber) return setError("Vehicle number is required");
    if (editingIds.ambulance) await updateAmbulance(editingIds.ambulance, ambulanceForm);
    else await addAmbulance(ambulanceForm);
    setAmbulanceForm(emptyAmbulanceForm);
    setEditing("ambulance", null);
    showSaved("Ambulance saved");
  };

  const saveDepartment = async () => {
    if (!departmentForm.name) return setError("Department name is required");
    if (editingIds.department) await updateDepartment(editingIds.department, departmentForm);
    else await addDepartment(departmentForm);
    setDepartmentForm(emptyDepartmentForm);
    setEditing("department", null);
    showSaved("Department saved");
  };

  const editHospital = (hospital) => {
    setHospitalForm({
      name: hospital.name || "",
      city: hospital.city || "",
      ICU: hospital.beds?.ICU || "",
      oxygen: hospital.beds?.oxygen || "",
      general: hospital.beds?.general || "",
      occupiedICU: hospital.occupiedBeds?.ICU || "",
      occupiedOxygen: hospital.occupiedBeds?.oxygen || "",
      occupiedGeneral: hospital.occupiedBeds?.general || "",
    });
    setEditing("hospital", hospital._id);
  };

  const statCards = [
    ["Users", stats.totalUsers || 0],
    ["Doctors", stats.totalDoctors || 0],
    ["Appointments", stats.totalAppointments || 0],
    ["Orders", stats.totalOrders || 0],
    ["Invoice revenue", formatCurrency(stats.invoiceRevenue)],
    ["Available beds", stats.availableBeds || 0],
    ["Open claims", stats.openClaims || 0],
    ["Ambulances ready", stats.ambulancesAvailable || 0],
    ["Low stock meds", stats.lowStockMedicines || 0],
    ["Departments", stats.totalDepartments || 0],
  ];

  const analyticsLists = {
    appointments: Array.isArray(stats.recentAppointments) ? stats.recentAppointments : [],
    orders: Array.isArray(stats.recentOrders) ? stats.recentOrders : [],
    invoices: Array.isArray(stats.recentInvoices) ? stats.recentInvoices : [],
    claims: Array.isArray(stats.recentClaims) ? stats.recentClaims : [],
    hospitals: Array.isArray(stats.hospitalBedSummary) ? stats.hospitalBedSummary : [],
    lowStock: Array.isArray(stats.lowStockItems) ? stats.lowStockItems : [],
  };

  if (accessStatus !== "allowed") {
    return (
      <div className="admin-access-gate">
        <div>
          <h1>Admin access only</h1>
          <p>{accessStatus === "denied" ? "Redirecting to your dashboard..." : "Checking permissions..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <h2>MediCare Admin</h2>
        <ul>
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="admin-main">
        <div className="admin-heading">
          <div>
            <h1>Hospital Operations</h1>
            <p>Manage beds, staff, billing, claims, pharmacy, ambulances, departments, and analytics.</p>
          </div>
          <button className="btn-primary" onClick={loadDashboard}>Refresh</button>
        </div>

        {error && <p className="admin-message error">{error}</p>}
        {message && <p className="admin-message success">{message}</p>}

        {activeTab === "overview" && (
          <>
            <div className="stats-grid">
              {statCards.map(([label, value]) => (
                <div className="stat-card" key={label}><h3>{label}</h3><p>{value}</p></div>
              ))}
            </div>

            <section className="analytics-panel">
              <div className="analytics-panel__head">
                <div>
                  <h2>Live database analytics</h2>
                  <p>These values are loaded from MongoDB through the admin stats API.</p>
                </div>
                <strong>{formatCurrency(stats.revenueBreakdown?.total)} total revenue</strong>
              </div>

              <div className="analytics-breakdown-grid">
                <div className="analytics-breakdown-card">
                  <h3>Revenue</h3>
                  <p><span>Pharmacy</span><strong>{formatCurrency(stats.revenueBreakdown?.pharmacy)}</strong></p>
                  <p><span>Invoices</span><strong>{formatCurrency(stats.revenueBreakdown?.invoices)}</strong></p>
                </div>

                <div className="analytics-breakdown-card">
                  <h3>Appointments</h3>
                  {toStatusRows(stats.statusBreakdowns?.appointments).map((item) => (
                    <p key={item.label}><span>{item.label}</span><strong>{item.value}</strong></p>
                  ))}
                </div>

                <div className="analytics-breakdown-card">
                  <h3>Orders</h3>
                  {toStatusRows(stats.statusBreakdowns?.orders).map((item) => (
                    <p key={item.label}><span>{item.label}</span><strong>{item.value}</strong></p>
                  ))}
                </div>

                <div className="analytics-breakdown-card">
                  <h3>Claims</h3>
                  {toStatusRows(stats.statusBreakdowns?.claims).map((item) => (
                    <p key={item.label}><span>{item.label}</span><strong>{item.value}</strong></p>
                  ))}
                </div>
              </div>
            </section>

            <div className="analytics-grid">
              <section className="analytics-panel">
                <h2>Recent appointments</h2>
                {analyticsLists.appointments.length === 0 && <p className="analytics-empty">No appointment records found.</p>}
                {analyticsLists.appointments.map((appointment) => (
                  <div className="analytics-row" key={appointment._id}>
                    <div>
                      <strong>{appointment.user?.name || "Patient"}</strong>
                      <span>{appointment.doctor?.name || "Doctor"} | {appointment.date} at {appointment.time}</span>
                    </div>
                    <em>{appointment.status}</em>
                  </div>
                ))}
              </section>

              <section className="analytics-panel">
                <h2>Recent orders</h2>
                {analyticsLists.orders.length === 0 && <p className="analytics-empty">No order records found.</p>}
                {analyticsLists.orders.map((order) => (
                  <div className="analytics-row" key={order._id}>
                    <div>
                      <strong>{order.user?.name || "Customer"}</strong>
                      <span>{formatDateTime(order.createdAt)}</span>
                    </div>
                    <em>{formatCurrency(order.total)} | {order.status}</em>
                  </div>
                ))}
              </section>

              <section className="analytics-panel">
                <h2>Hospital beds</h2>
                {analyticsLists.hospitals.length === 0 && <p className="analytics-empty">No hospital records found.</p>}
                {analyticsLists.hospitals.map((hospital) => (
                  <div className="analytics-row" key={hospital._id}>
                    <div>
                      <strong>{hospital.name}</strong>
                      <span>{hospital.city || "City not set"} | Total {hospital.total} | Occupied {hospital.occupied}</span>
                    </div>
                    <em>{hospital.available} available</em>
                  </div>
                ))}
              </section>

              <section className="analytics-panel">
                <h2>Low stock medicines</h2>
                {analyticsLists.lowStock.length === 0 && <p className="analytics-empty">No low stock medicines.</p>}
                {analyticsLists.lowStock.map((medicine) => (
                  <div className="analytics-row" key={medicine._id}>
                    <div>
                      <strong>{medicine.name}</strong>
                      <span>{medicine.category || "Uncategorized"} | Reorder at {medicine.reorderLevel || 0}</span>
                    </div>
                    <em>{medicine.stock || 0} left</em>
                  </div>
                ))}
              </section>

              <section className="analytics-panel">
                <h2>Recent invoices</h2>
                {analyticsLists.invoices.length === 0 && <p className="analytics-empty">No invoice records found.</p>}
                {analyticsLists.invoices.map((invoice) => (
                  <div className="analytics-row" key={invoice._id}>
                    <div>
                      <strong>{invoice.invoiceNumber || "Invoice"}</strong>
                      <span>{invoice.patientName} | {formatDateTime(invoice.createdAt)}</span>
                    </div>
                    <em>{formatCurrency(invoice.amount)} | {invoice.status}</em>
                  </div>
                ))}
              </section>

              <section className="analytics-panel">
                <h2>Recent insurance claims</h2>
                {analyticsLists.claims.length === 0 && <p className="analytics-empty">No insurance claim records found.</p>}
                {analyticsLists.claims.map((claim) => (
                  <div className="analytics-row" key={claim._id}>
                    <div>
                      <strong>{claim.claimNumber || "Claim"}</strong>
                      <span>{claim.patientName} | {claim.provider}</span>
                    </div>
                    <em>{formatCurrency(claim.amount)} | {claim.status}</em>
                  </div>
                ))}
              </section>
            </div>
          </>
        )}

        {activeTab === "users" && (
          <section className="admin-section">
            <div className="admin-section-title">
              <h2>User accounts</h2>
              <span>{users.length} record{users.length === 1 ? "" : "s"}</span>
            </div>
            {users.length === 0 && <p className="analytics-empty">No users found.</p>}
            {users.map((user) => (
              <div key={user._id} className="admin-card">
                <div>
                  <h3>{user.name || "Unnamed user"}</h3>
                  <p>{user.email || "No email"} | {user.phone || "No phone"} | {user.role || "user"}</p>
                  <p>Joined {formatDateTime(user.createdAt)}</p>
                </div>
                <button onClick={async () => { await deleteUserAdmin(user._id); showSaved("User deleted"); }}>Delete</button>
              </div>
            ))}
          </section>
        )}

        {activeTab === "records" && (
          <div className="records-grid">
            <RecordGroup
              title="Medical reports"
              records={records.reports}
              fields={[
                ["Patient", (item) => getPersonName(item.user)],
                ["Analysis", (item) => item.analysis],
                ["Created", (item) => formatDateTime(item.createdAt)],
              ]}
            />
            <RecordGroup
              title="Lab tests"
              records={records.labTests}
              fields={[
                ["Category", (item) => item.category],
                ["Price", (item) => formatCurrency(item.price)],
                ["Report time", (item) => item.reportTime],
              ]}
            />
            <RecordGroup
              title="Lab bookings"
              records={records.labBookings}
              fields={[
                ["User", (item) => getPersonName(item.user)],
                ["Test", (item) => getPersonName(item.test, "Test")],
                ["Status", (item) => item.status],
              ]}
            />
            <RecordGroup
              title="Blood donors"
              records={records.bloodDonors}
              fields={[
                ["User", (item) => getPersonName(item.user)],
                ["Blood group", (item) => item.bloodGroup],
                ["City", (item) => item.city],
              ]}
            />
            <RecordGroup
              title="Prescriptions"
              records={records.prescriptions}
              fields={[
                ["Patient", (item) => getPersonName(item.user)],
                ["Doctor", (item) => getPersonName(item.doctor)],
                ["Medicines", (item) => item.medicines],
              ]}
            />
            <RecordGroup
              title="Reviews"
              records={records.reviews}
              fields={[
                ["User", (item) => getPersonName(item.user)],
                ["Doctor", (item) => getPersonName(item.doctor)],
                ["Rating", (item) => item.rating],
              ]}
            />
            <RecordGroup
              title="Notifications"
              records={records.notifications}
              fields={[
                ["User", (item) => getPersonName(item.user, "Broadcast")],
                ["Type", (item) => item.type],
                ["Read", (item) => item.read],
              ]}
            />
            <RecordGroup
              title="Medical profiles"
              records={records.medicalProfiles}
              fields={[
                ["User", (item) => getPersonName(item.user)],
                ["Blood group", (item) => item.bloodGroup],
                ["Contacts", (item) => item.emergencyContacts],
              ]}
            />
            <RecordGroup
              title="Vitals"
              records={records.vitals}
              fields={[
                ["User", (item) => getPersonName(item.user)],
                ["Recorded", (item) => formatDateTime(item.recordedAt)],
                ["Pulse", (item) => item.pulse],
              ]}
            />
            <RecordGroup
              title="Vaccinations"
              records={records.vaccinations}
              fields={[
                ["User", (item) => getPersonName(item.user)],
                ["Due", (item) => formatDateTime(item.dueDate)],
                ["Status", (item) => item.status],
              ]}
            />
            <RecordGroup
              title="Care plans"
              records={records.carePlans}
              fields={[
                ["User", (item) => getPersonName(item.user)],
                ["Status", (item) => item.status],
                ["Tasks", (item) => item.tasks],
              ]}
            />
            <RecordGroup
              title="Medicine reminders"
              records={records.medicineLogs}
              fields={[
                ["User", (item) => getPersonName(item.user)],
                ["Medicine", (item) => item.medicine],
                ["Reminder", (item) => item.time],
              ]}
            />
            <RecordGroup
              title="Chat messages"
              records={records.chats}
              fields={[
                ["Sender", (item) => getPersonName(item.sender)],
                ["Receiver", (item) => getPersonName(item.receiver)],
                ["Message", (item) => item.message],
              ]}
            />
            <RecordGroup
              title="Doctor notes"
              records={records.doctorNotes}
              fields={[
                ["Doctor", (item) => getPersonName(item.doctor)],
                ["Patient", (item) => getPersonName(item.patient)],
                ["Title", (item) => item.title],
              ]}
            />
          </div>
        )}

        {activeTab === "hospitals" && (
          <section className="admin-section">
            <h2>Bed management</h2>
            <div className="admin-form">
              {Object.keys(emptyHospitalForm).map((field) => (
                <input key={field} placeholder={field} value={hospitalForm[field]} onChange={(e) => setHospitalForm({ ...hospitalForm, [field]: e.target.value })} />
              ))}
              <button onClick={saveHospital}>{editingIds.hospital ? "Update beds" : "Add hospital"}</button>
            </div>
            {hospitals.map((hospital) => {
              const total = Number(hospital.beds?.ICU || 0) + Number(hospital.beds?.oxygen || 0) + Number(hospital.beds?.general || 0);
              const occupied = Number(hospital.occupiedBeds?.ICU || 0) + Number(hospital.occupiedBeds?.oxygen || 0) + Number(hospital.occupiedBeds?.general || 0);
              return (
                <div key={hospital._id} className="admin-card">
                  <div>
                    <h3>{hospital.name}</h3>
                    <p>{hospital.city} | Total {total} | Occupied {occupied} | Available {Math.max(total - occupied, 0)}</p>
                  </div>
                  <button onClick={() => editHospital(hospital)}>Edit beds</button>
                </div>
              );
            })}
          </section>
        )}

        {activeTab === "staff" && (
          <section className="admin-section">
            <div className="admin-section-title">
              <h2>Staff management</h2>
              <span>{staff.length} member{staff.length === 1 ? "" : "s"}</span>
            </div>
            <div className="admin-form">
              {Object.keys(emptyStaffForm).map((field) => (
                <input key={field} placeholder={field} value={staffForm[field]} onChange={(e) => setStaffForm({ ...staffForm, [field]: e.target.value })} />
              ))}
              <button onClick={saveStaff}>{editingIds.staff ? "Update staff" : "Add staff"}</button>
            </div>
            {staff.length === 0 && <p className="analytics-empty">No staff records found. Add a staff member above.</p>}
            {staff.map((member) => (
              <div key={member._id} className="admin-card admin-card--staff">
                <div>
                  <div className="staff-card-head">
                    <h3>{member.name || "Unnamed staff"}</h3>
                    <span className={`status-pill status-pill--${member.status || "active"}`}>
                      {(member.status || "active").replace(/-/g, " ")}
                    </span>
                  </div>
                  <div className="staff-detail-grid">
                    <p><span>Role</span><strong>{member.role || "Not assigned"}</strong></p>
                    <p><span>Department</span><strong>{member.department || "Not assigned"}</strong></p>
                    <p><span>Phone</span><strong>{member.phone || "Not set"}</strong></p>
                    <p><span>Shift</span><strong>{member.shift || "General"}</strong></p>
                    <p><span>Added</span><strong>{formatDateTime(member.createdAt)}</strong></p>
                  </div>
                </div>
                <div className="admin-card-actions">
                  <button onClick={() => { setStaffForm({ ...emptyStaffForm, ...member }); setEditing("staff", member._id); }}>Edit</button>
                  <button onClick={async () => { await deleteStaff(member._id); showSaved("Staff deleted"); }}>Delete</button>
                </div>
              </div>
            ))}
          </section>
        )}

        {activeTab === "invoices" && (
          <section className="admin-section">
            <div className="admin-section-title">
              <h2>Billing and invoices</h2>
              <span>{invoices.length} invoice{invoices.length === 1 ? "" : "s"}</span>
            </div>
            <div className="admin-form">
              {Object.keys(emptyInvoiceForm).map((field) => (
                <input key={field} placeholder={field} value={invoiceForm[field]} onChange={(e) => setInvoiceForm({ ...invoiceForm, [field]: e.target.value })} />
              ))}
              <button onClick={saveInvoice}>{editingIds.invoice ? "Update invoice" : "Create invoice"}</button>
            </div>
            {invoices.length === 0 && <p className="analytics-empty">No invoices found. Create an invoice above.</p>}
            {invoices.map((invoice) => (
              <div key={invoice._id} className="admin-card admin-card--details">
                <div>
                  <div className="detail-card-head">
                    <h3>{invoice.invoiceNumber || "Invoice"}</h3>
                    <span className={`status-pill status-pill--${invoice.status || "unpaid"}`}>
                      {(invoice.status || "unpaid").replace(/-/g, " ")}
                    </span>
                  </div>
                  <div className="detail-field-grid">
                    <p><span>Patient</span><strong>{invoice.patientName || "Not set"}</strong></p>
                    <p><span>Amount</span><strong>{formatCurrency(invoice.amount)}</strong></p>
                    <p><span>Due date</span><strong>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("en-IN") : "Not set"}</strong></p>
                    <p><span>Items</span><strong>{Array.isArray(invoice.items) && invoice.items.length ? invoice.items.map((item) => item.name).filter(Boolean).join(", ") : "Not set"}</strong></p>
                    <p><span>Created</span><strong>{formatDateTime(invoice.createdAt)}</strong></p>
                  </div>
                </div>
                <div className="admin-card-actions">
                  <button onClick={() => { setInvoiceForm({ ...emptyInvoiceForm, ...invoice, items: invoice.items?.map((item) => item.name).join(", ") || "" }); setEditing("invoice", invoice._id); }}>Edit</button>
                  <button onClick={async () => { await deleteInvoice(invoice._id); showSaved("Invoice deleted"); }}>Delete</button>
                </div>
              </div>
            ))}
          </section>
        )}

        {activeTab === "claims" && (
          <section className="admin-section">
            <div className="admin-section-title">
              <h2>Insurance claim processing</h2>
              <span>{claims.length} claim{claims.length === 1 ? "" : "s"}</span>
            </div>
            <div className="admin-form">
              {Object.keys(emptyClaimForm).map((field) => (
                <input key={field} placeholder={field} value={claimForm[field]} onChange={(e) => setClaimForm({ ...claimForm, [field]: e.target.value })} />
              ))}
              <button onClick={saveClaim}>{editingIds.claim ? "Update claim" : "Create claim"}</button>
            </div>
            {claims.length === 0 && <p className="analytics-empty">No insurance claims found. Create a claim above.</p>}
            {claims.map((claim) => (
              <div key={claim._id} className="admin-card admin-card--details">
                <div>
                  <div className="detail-card-head">
                    <h3>{claim.claimNumber || "Claim"}</h3>
                    <span className={`status-pill status-pill--${claim.status || "submitted"}`}>
                      {(claim.status || "submitted").replace(/-/g, " ")}
                    </span>
                  </div>
                  <div className="detail-field-grid">
                    <p><span>Patient</span><strong>{claim.patientName || "Not set"}</strong></p>
                    <p><span>Provider</span><strong>{claim.provider || "Not set"}</strong></p>
                    <p><span>Policy</span><strong>{claim.policyNumber || "Not set"}</strong></p>
                    <p><span>Amount</span><strong>{formatCurrency(claim.amount)}</strong></p>
                    <p><span>Notes</span><strong>{claim.notes || "No notes"}</strong></p>
                    <p><span>Created</span><strong>{formatDateTime(claim.createdAt)}</strong></p>
                  </div>
                </div>
                <div className="admin-card-actions">
                  <button onClick={() => { setClaimForm({ ...emptyClaimForm, ...claim }); setEditing("claim", claim._id); }}>Edit</button>
                  <button onClick={async () => { await deleteInsuranceClaim(claim._id); showSaved("Claim deleted"); }}>Delete</button>
                </div>
              </div>
            ))}
          </section>
        )}

        {activeTab === "medicines" && (
          <section className="admin-section">
            <h2>Pharmacy inventory</h2>
            <div className="admin-form">
              {Object.keys(emptyMedicineForm).map((field) => (
                <input key={field} placeholder={field} value={medicineForm[field]} onChange={(e) => setMedicineForm({ ...medicineForm, [field]: e.target.value })} />
              ))}
              <button onClick={saveMedicine}>{editingIds.medicine ? "Update medicine" : "Add medicine"}</button>
            </div>
            {medicines.map((medicine) => (
              <div key={medicine._id} className="admin-card">
                <div>
                  <h3>{medicine.name}</h3>
                  <p>Rs {medicine.price || 0} | Stock {medicine.stock || 0} | Reorder {medicine.reorderLevel || 0} | {medicine.supplier || "No supplier"}</p>
                  <p>Barcode {medicine.barcode || "not set"} | Batch {medicine.batchNumber || "not set"} | Expiry {medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString() : "not set"}</p>
                </div>
                <div>
                  <button onClick={() => { setMedicineForm({ ...emptyMedicineForm, ...medicine }); setEditing("medicine", medicine._id); }}>Edit</button>
                  <button onClick={async () => { await deleteMedicine(medicine._id); showSaved("Medicine deleted"); }}>Delete</button>
                </div>
              </div>
            ))}
          </section>
        )}

        {activeTab === "ambulances" && (
          <section className="admin-section">
            <h2>Ambulance tracking</h2>
            <div className="admin-form">
              {Object.keys(emptyAmbulanceForm).map((field) => (
                <input key={field} placeholder={field} value={ambulanceForm[field]} onChange={(e) => setAmbulanceForm({ ...ambulanceForm, [field]: e.target.value })} />
              ))}
              <button onClick={saveAmbulance}>{editingIds.ambulance ? "Update ambulance" : "Add ambulance"}</button>
            </div>
            {ambulances.map((ambulance) => (
              <div key={ambulance._id} className="admin-card">
                <div><h3>{ambulance.vehicleNumber}</h3><p>{ambulance.driverName} | {ambulance.location || "Location unknown"} | {ambulance.status}</p></div>
                <div>
                  <button onClick={() => { setAmbulanceForm({ ...emptyAmbulanceForm, ...ambulance }); setEditing("ambulance", ambulance._id); }}>Edit</button>
                  <button onClick={async () => { await deleteAmbulance(ambulance._id); showSaved("Ambulance deleted"); }}>Delete</button>
                </div>
              </div>
            ))}
          </section>
        )}

        {activeTab === "departments" && (
          <section className="admin-section">
            <h2>Department management</h2>
            <div className="admin-form">
              {Object.keys(emptyDepartmentForm).map((field) => (
                <input key={field} placeholder={field} value={departmentForm[field]} onChange={(e) => setDepartmentForm({ ...departmentForm, [field]: e.target.value })} />
              ))}
              <button onClick={saveDepartment}>{editingIds.department ? "Update department" : "Add department"}</button>
            </div>
            {departments.map((department) => (
              <div key={department._id} className="admin-card">
                <div><h3>{department.name}</h3><p>Head: {department.head || "Not assigned"} | Beds {department.beds || 0} | {department.status}</p></div>
                <div>
                  <button onClick={() => { setDepartmentForm({ ...emptyDepartmentForm, ...department }); setEditing("department", department._id); }}>Edit</button>
                  <button onClick={async () => { await deleteDepartment(department._id); showSaved("Department deleted"); }}>Delete</button>
                </div>
              </div>
            ))}
          </section>
        )}

        {activeTab === "doctors" && (
          <section className="admin-section">
            <h2>Doctor management</h2>
            <div className="admin-form">
              {Object.keys(emptyDoctorForm).map((field) => (
                <input key={field} placeholder={field} value={doctorForm[field]} onChange={(e) => setDoctorForm({ ...doctorForm, [field]: e.target.value })} />
              ))}
              <button onClick={saveDoctor}>{editingIds.doctor ? "Update doctor" : "Add doctor"}</button>
            </div>
            {doctors.map((doctor) => (
              <div key={doctor._id} className="admin-card">
                <div><h3>{doctor.name}</h3><p>{doctor.specialization} | Rs {doctor.fees || 0} | {doctor.experience || 0} yrs</p></div>
                <div>
                  <button onClick={() => { setDoctorForm({ ...emptyDoctorForm, ...doctor }); setEditing("doctor", doctor._id); }}>Edit</button>
                  <button onClick={async () => { await deleteDoctor(doctor._id); showSaved("Doctor deleted"); }}>Delete</button>
                </div>
              </div>
            ))}
          </section>
        )}

        {activeTab === "appointments" && (
          <section className="admin-section">
            <h2>Appointment tracking</h2>
            {appointments.map((appointment) => (
              <div key={appointment._id} className="admin-card">
                <div><h3>{appointment.doctor?.name || "Doctor"}</h3><p>{appointment.user?.name || "Patient"} | {appointment.date} at {appointment.time}</p></div>
                <select value={appointment.status} onChange={async (e) => { await updateAppointment(appointment._id, { status: e.target.value }); loadDashboard(); }}>
                  <option value="booked">Booked</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            ))}
          </section>
        )}

        {activeTab === "orders" && (
          <section className="admin-section">
            <h2>Order tracking</h2>
            {orders.map((order) => (
              <div key={order._id} className="admin-card">
                <div><h3>{order.user?.name || "Customer"}</h3><p>Total: Rs {order.total || 0}</p></div>
                <select value={order.status} onChange={async (e) => { await updateOrder(order._id, { status: e.target.value }); loadDashboard(); }}>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
