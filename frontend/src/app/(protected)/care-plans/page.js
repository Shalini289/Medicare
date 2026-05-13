"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FaCheck, FaClipboardList, FaPlus, FaTrash } from "react-icons/fa";
import {
  createCarePlan,
  deleteCarePlan,
  getCarePlans,
  toggleCareTask,
  updateCarePlan,
} from "@/services/carePlanService";
import "@/styles/carePlans.css";

const createClientId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const createEmptyTask = () => ({
  clientId: createClientId(),
  title: "",
  schedule: "Daily",
  completed: false,
});

const createEmptyForm = () => ({
  title: "",
  category: "General",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  status: "active",
  notes: "",
  tasks: [createEmptyTask()],
});

const categories = ["General", "Recovery", "Fitness", "Diabetes", "Heart", "Mental Health"];

export default function CarePlansPage() {
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("active");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getCarePlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load care plans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadPlans();
    });
  }, [loadPlans]);

  const stats = useMemo(() => ({
    active: plans.filter((plan) => plan.status === "active").length,
    completed: plans.filter((plan) => plan.status === "completed").length,
    tasks: plans.reduce((sum, plan) => sum + (plan.totalTasks || 0), 0),
  }), [plans]);

  const visiblePlans = useMemo(() => {
    if (filter === "all") return plans;
    return plans.filter((plan) => plan.status === filter);
  }, [filter, plans]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const updateTask = (index, field, value) => {
    setForm((current) => ({
      ...current,
      tasks: current.tasks.map((task, taskIndex) =>
        taskIndex === index ? { ...task, [field]: value } : task
      ),
    }));
  };

  const addTask = () => {
    setForm((current) => ({
      ...current,
      tasks: [...current.tasks, createEmptyTask()],
    }));
  };

  const removeTask = (index) => {
    setForm((current) => ({
      ...current,
      tasks: current.tasks.filter((_, taskIndex) => taskIndex !== index),
    }));
  };

  const resetForm = () => {
    setForm(createEmptyForm());
    setEditingId(null);
  };

  const savePlan = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        endDate: form.endDate || undefined,
      };

      if (editingId) {
        await updateCarePlan(editingId, payload);
      } else {
        await createCarePlan(payload);
      }

      resetForm();
      await loadPlans();
    } catch (err) {
      setError(err.message || "Could not save care plan");
    } finally {
      setSaving(false);
    }
  };

  const editPlan = (plan) => {
    setEditingId(plan._id);
    setForm({
      title: plan.title || "",
      category: plan.category || "General",
      startDate: plan.startDate ? plan.startDate.slice(0, 10) : createEmptyForm().startDate,
      endDate: plan.endDate ? plan.endDate.slice(0, 10) : "",
      status: plan.status || "active",
      notes: plan.notes || "",
      tasks: plan.tasks?.length
        ? plan.tasks.map((task) => ({
            clientId: task._id || createClientId(),
            title: task.title || "",
            schedule: task.schedule || "Daily",
            completed: Boolean(task.completed),
          }))
        : [createEmptyTask()],
    });
  };

  const toggleTask = async (planId, taskId) => {
    await toggleCareTask(planId, taskId);
    await loadPlans();
  };

  const removePlan = async (id) => {
    await deleteCarePlan(id);
    await loadPlans();
  };

  return (
    <main className="care-plans-page">
      <section className="care-plans-hero">
        <div>
          <span className="eyebrow">Recovery and wellness</span>
          <h1>Care Plans</h1>
          <p>Create structured routines for recovery, chronic care, fitness, or mental wellbeing.</p>
        </div>

        <div className="care-plan-stats">
          <span><strong>{stats.active}</strong> Active</span>
          <span><strong>{stats.completed}</strong> Completed</span>
          <span><strong>{stats.tasks}</strong> Tasks</span>
        </div>
      </section>

      <section className="care-plans-layout">
        <form className="care-plan-form" onSubmit={savePlan}>
          <div className="form-title">
            <FaClipboardList aria-hidden="true" />
            <h2>{editingId ? "Edit care plan" : "New care plan"}</h2>
          </div>

          {error && <p className="form-error">{error}</p>}

          <label>
            Plan title
            <input
              name="title"
              value={form.title}
              onChange={updateField}
              placeholder="Post-surgery recovery"
              required
            />
          </label>

          <div className="form-grid">
            <label>
              Category
              <select name="category" value={form.category} onChange={updateField}>
                {categories.map((categoryName) => (
                  <option key={categoryName} value={categoryName}>{categoryName}</option>
                ))}
              </select>
            </label>

            <label>
              Status
              <select name="status" value={form.status} onChange={updateField}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </label>
          </div>

          <div className="form-grid">
            <label>
              Start date
              <input type="date" name="startDate" value={form.startDate} onChange={updateField} />
            </label>

            <label>
              End date
              <input type="date" name="endDate" value={form.endDate} onChange={updateField} />
            </label>
          </div>

          <div className="care-task-editor">
            <div className="section-head">
              <h3>Tasks</h3>
              <button type="button" onClick={addTask}>
                <FaPlus aria-hidden="true" /> Add
              </button>
            </div>

            {form.tasks.map((task, index) => (
              <div className="care-task-line" key={task.clientId || task._id || index}>
                <input
                  value={task.title}
                  onChange={(event) => updateTask(index, "title", event.target.value)}
                  placeholder="Walk for 20 minutes"
                  required
                />
                <input
                  value={task.schedule}
                  onChange={(event) => updateTask(index, "schedule", event.target.value)}
                  placeholder="Daily"
                />
                <button type="button" title="Remove task" onClick={() => removeTask(index)}>
                  <FaTrash aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>

          <label>
            Notes
            <textarea
              name="notes"
              value={form.notes}
              onChange={updateField}
              rows="3"
              placeholder="Doctor instructions, warning signs, or check-in notes"
            />
          </label>

          <div className="form-actions">
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save changes" : "Create plan"}
            </button>
            {editingId && (
              <button className="btn-secondary" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="care-plan-panel">
          <div className="filter-tabs">
            {["active", "paused", "completed", "all"].map((item) => (
              <button
                key={item}
                className={filter === item ? "is-selected" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="empty-state">Loading care plans...</p>
          ) : visiblePlans.length === 0 ? (
            <p className="empty-state">No care plans in this view.</p>
          ) : (
            <div className="care-plan-list">
              {visiblePlans.map((plan) => (
                <article className="care-plan-card" key={plan._id}>
                  <div className="care-plan-card__head">
                    <div>
                      <span>{plan.category}</span>
                      <h2>{plan.title}</h2>
                      <p>{plan.notes || "No notes added."}</p>
                    </div>
                    <strong>{plan.progress || 0}%</strong>
                  </div>

                  <div className="progress-track">
                    <span style={{ width: `${plan.progress || 0}%` }} />
                  </div>

                  <div className="care-task-list">
                    {plan.tasks?.map((task) => (
                      <button
                        key={task._id}
                        className={task.completed ? "is-done" : ""}
                        onClick={() => toggleTask(plan._id, task._id)}
                      >
                        <FaCheck aria-hidden="true" />
                        <span>{task.title}</span>
                        <small>{task.schedule}</small>
                      </button>
                    ))}
                  </div>

                  <div className="care-plan-actions">
                    <button onClick={() => editPlan(plan)}>Edit</button>
                    <button onClick={() => removePlan(plan._id)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
