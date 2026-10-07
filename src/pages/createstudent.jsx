import { useEffect, useMemo, useRef, useState } from "react";
import api from "../api";

const c = {
  primary: "#2563eb",
  primarySoft: "#eaf1ff",
  bg: "#f4f7fc",
  border: "#e3e9f4",
  text: "#0f172a",
  muted: "#64748b",
  success: "#16a34a",
  successSoft: "#e8f7ee",
  danger: "#dc2626",
  dangerSoft: "#fdecec",
};
const font = "'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif";

const paths = {
  "user-plus":
    '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>',
  upload:
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  download:
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  search:
    '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  trash:
    '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
};

const Icon = ({ name, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
    dangerouslySetInnerHTML={{ __html: paths[name] }}
  />
);

const card = {
  background: "#fff",
  border: `1px solid ${c.border}`,
  borderRadius: 14,
  padding: 20,
  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
  boxSizing: "border-box",
  fontFamily: font,
};

const btn = (bg = c.primary, color = "#fff") => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "10px 18px",
  border: "none",
  borderRadius: 10,
  background: bg,
  color,
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  fontFamily: font,
  whiteSpace: "nowrap",
});

const btnOutline = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "9px 18px",
  border: `1px solid ${c.primary}`,
  borderRadius: 10,
  background: "#fff",
  color: c.primary,
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  fontFamily: font,
  whiteSpace: "nowrap",
};

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  border: `1px solid ${c.border}`,
  borderRadius: 10,
  fontSize: 14,
  outline: "none",
  fontFamily: font,
  color: c.text,
  background: "#fff",
  boxSizing: "border-box",
};

const th = {
  textAlign: "left",
  padding: "12px 16px",
  background: "#f1f5fd",
  color: c.muted,
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  borderBottom: `1px solid ${c.border}`,
};

const td = {
  padding: "12px 16px",
  borderBottom: `1px solid ${c.border}`,
  fontSize: 14,
  color: c.text,
};

const initials = (name) =>
  String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

export default function CreateStudent() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState({ text: "", error: false });
  const fileRef = useRef(null);

  const showMsg = (text, error = false) => {
    setMsg({ text, error });
    setTimeout(() => setMsg({ text: "", error: false }), 4000);
  };

  const loadStudents = async () => {
    try {
      const { data } = await api.get("/students");
      setStudents(data);
    } catch (err) {
      showMsg("Could not load students", true);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q)
    );
  }, [students, search]);

  const addStudent = async (e) => {
    e.preventDefault();
    try {
      await api.post("/students", { name, studentId });
      setName("");
      setStudentId("");
      showMsg("Student created successfully");
      loadStudents();
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to create student", true);
    }
  };

  const importExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    try {
      const { data } = await api.post("/students/import", form);
      showMsg(data.message);
      loadStudents();
    } catch (err) {
      showMsg(err.response?.data?.message || "Import failed", true);
    }
    e.target.value = "";
  };

  const exportExcel = async () => {
    try {
      const res = await api.get("/students/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "students.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showMsg("Export failed", true);
    }
  };

  const removeStudent = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      await api.delete(`/students/${id}`);
      showMsg("Student deleted");
      loadStudents();
    } catch (err) {
      showMsg("Delete failed", true);
    }
  };

  const label = {
    fontSize: 13,
    fontWeight: 600,
    color: c.text,
    display: "block",
    marginBottom: 6,
  };

  return (
    <div style={{ fontFamily: font }}>
      {msg.text && (
        <div
          style={{
            marginBottom: 16,
            padding: "12px 16px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            background: msg.error ? c.dangerSoft : c.successSoft,
            color: msg.error ? c.danger : c.success,
            border: `1px solid ${msg.error ? "#f7c6c6" : "#bfe8cc"}`,
          }}
        >
          {msg.text}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
          marginBottom: 20,
        }}
      >
        {/* manual */}
        <div style={card}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: c.primarySoft,
                color: c.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="user-plus" size={21} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: c.text }}>
                Add Student Manually
              </div>
              <div style={{ fontSize: 13, color: c.muted }}>
                Enter name and a unique ID
              </div>
            </div>
          </div>

          <form onSubmit={addStudent}>
            <label style={label}>Student Name</label>
            <input
              style={{ ...inputStyle, marginBottom: 14 }}
              placeholder="Enter student name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <label style={label}>Student ID</label>
            <input
              style={{ ...inputStyle, marginBottom: 18 }}
              placeholder="Enter unique ID number"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
            <button type="submit" style={{ ...btn(), width: "100%" }}>
              <Icon name="user-plus" size={17} /> Add Student
            </button>
          </form>
        </div>

        {/* excel */}
        <div style={card}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: c.successSoft,
                color: c.success,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="upload" size={21} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: c.text }}>
                Import / Export Excel
              </div>
              <div style={{ fontSize: 13, color: c.muted }}>
                Add many students in one go
              </div>
            </div>
          </div>

          <div
            style={{
              background: c.bg,
              border: `1px dashed ${c.border}`,
              borderRadius: 12,
              padding: 16,
              fontSize: 13,
              color: c.muted,
              lineHeight: 1.7,
              marginBottom: 18,
            }}
          >
            Excel must have only <b style={{ color: c.text }}>2 columns</b>:
            <br />
            Column A: <b style={{ color: c.text }}>Student Name</b>
            <br />
            Column B: <b style={{ color: c.text }}>Student ID</b>
            <br />
            First row is the heading. Click Export once to get a ready sample
            file.
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".xlsx"
            onChange={importExcel}
            style={{ display: "none" }}
          />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => fileRef.current.click()}
              style={{ ...btn(), flex: 1 }}
            >
              <Icon name="upload" size={17} /> Import Excel
            </button>
            <button onClick={exportExcel} style={{ ...btnOutline, flex: 1 }}>
              <Icon name="download" size={17} /> Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* table */}
      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: c.text }}>
              All Students
            </div>
            <div style={{ fontSize: 13, color: c.muted }}>
              {students.length} students registered
            </div>
          </div>
          <div style={{ position: "relative", width: 280, maxWidth: "100%" }}>
            <span
              style={{
                position: "absolute",
                left: 13,
                top: 12,
                color: c.muted,
              }}
            >
              <Icon name="search" size={17} />
            </span>
            <input
              style={{ ...inputStyle, paddingLeft: 38 }}
              placeholder="Search name or ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...th, width: 60 }}>#</th>
                <th style={th}>Student</th>
                <th style={th}>Student ID</th>
                <th style={{ ...th, textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s._id}>
                  <td style={{ ...td, color: c.muted }}>{i + 1}</td>
                  <td style={td}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: c.primarySoft,
                          color: c.primary,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        {initials(s.name)}
                      </div>
                      <span style={{ fontWeight: 600 }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={td}>
                    <span
                      style={{
                        background: c.primarySoft,
                        color: c.primary,
                        padding: "4px 12px",
                        borderRadius: 999,
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      {s.studentId}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <button
                      onClick={() => removeStudent(s._id)}
                      style={{
                        ...btn(c.dangerSoft, c.danger),
                        padding: "7px 12px",
                      }}
                    >
                      <Icon name="trash" size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    style={{
                      ...td,
                      textAlign: "center",
                      color: c.muted,
                      padding: 32,
                    }}
                    colSpan={4}
                  >
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
