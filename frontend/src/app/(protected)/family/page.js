"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/utils/api";
import "@/styles/family.css";

export default function FamilyPage() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    age: "",
    relation: "",
  });
  const [editingId, setEditingId] = useState(null);

  const loadMembers = useCallback(async () => {
    try {
      const data = await api("/api/family");
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadMembers();
    });
  }, [loadMembers]);

  const submit = async () => {
    if (!form.name || !form.age || !form.relation) {
      return alert("Please fill all fields");
    }

    try {
      if (editingId) {
        await api(`/api/family/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        await api("/api/family", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }

      setForm({
        name: "",
        age: "",
        relation: "",
      });
      setEditingId(null);
      loadMembers();
    } catch (err) {
      console.error(err);
    }
  };

  const edit = (member) => {
    setForm({
      name: member.name || "",
      age: member.age || "",
      relation: member.relation || "",
    });
    setEditingId(member._id);
  };

  const remove = async (id) => {
    try {
      await api(`/api/family/${id}`, {
        method: "DELETE",
      });

      loadMembers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="family-container">
      <h2>Family Management</h2>

      <div className="family-form">
        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Age"
          value={form.age}
          onChange={(e) =>
            setForm({ ...form, age: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Relation"
          value={form.relation}
          onChange={(e) =>
            setForm({ ...form, relation: e.target.value })
          }
        />

        <button onClick={submit}>
          {editingId ? "Update Member" : "Add Member"}
        </button>
      </div>

      <div className="family-list">
        {members.length === 0 ? (
          <p>No family members added yet.</p>
        ) : (
          members.map((member) => (
            <div key={member._id} className="family-card">
              <h3>{member.name}</h3>
              <p>Age: {member.age}</p>
              <p>Relation: {member.relation}</p>

              <div className="family-actions">
                <button onClick={() => edit(member)}>
                  Edit
                </button>

                <button onClick={() => remove(member._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
