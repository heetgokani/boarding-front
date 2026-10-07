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
  users:
    '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  "user-check":
    '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>',
  "x-circle":
    '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
  search:
    '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  printer:
    '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
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

const btn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "10px 18px",
  border: "none",
  borderRadius: 10,
  background: c.primary,
  color: "#fff",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  fontFamily: font,
  whiteSpace: "nowrap",
};

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

const formatDate = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const initials = (name) =>
  String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

// sort by student id numerically: 1, 2, 3 ... 10, 11
const sortById = (list) =>
  [...list].sort((a, b) =>
    String(a.studentId).localeCompare(String(b.studentId), undefined, {
      numeric: true,
    })
  );

function Stat({ icon, label, value, color, soft }) {
  return (
    <div style={{ ...card, display: "flex", alignItems: "center", gap: 16 }}>
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: soft,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={icon} size={26} />
      </div>
      <div>
        <div style={{ fontSize: 13, color: c.muted, fontWeight: 600 }}>
          {label}
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: c.text,
            lineHeight: 1.2,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export default function TodayAttendance() {
  const [date, setDate] = useState("");
  const [students, setStudents] = useState([]);
  const [checked, setChecked] = useState(new Set());
  const [search, setSearch] = useState("");
  const [view, setView] = useState("all");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ text: "", error: false });

  // ---- auto save helpers ----
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const [savedAt, setSavedAt] = useState(null);
  const dateRef = useRef(""); // date of the attendance currently on screen
  const latestIds = useRef([]); // latest ticked student ids
  const savePromise = useRef(null); // save currently running (if any)
  const again = useRef(false); // another save needed after current one

  const showMsg = (text, error = false) => {
    setMsg({ text, error });
    setTimeout(() => setMsg({ text: "", error: false }), 4000);
  };

  const load = async () => {
    try {
      const { data } = await api.get("/attendance/today");
      const sorted = sortById(data.students);
      const validIds = new Set(sorted.map((s) => s._id));
      setDate(data.date);
      dateRef.current = data.date;
      setStudents(sorted);
      // keep only ids that belong to real students
      setChecked(new Set(data.presentIds.filter((id) => validIds.has(id))));
      setDirty(false);
      setSaveState("idle");
    } catch (err) {
      showMsg("Could not load attendance", true);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // after 12 midnight (India time) a new day starts: reload so everyone
  // shows as absent again (old days stay safe in the database)
  useEffect(() => {
    const todayIST = () =>
      new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const check = () => {
      if (
        dateRef.current &&
        dateRef.current !== todayIST() &&
        !savePromise.current
      ) {
        load();
      }
    };
    const timer = setInterval(check, 30000);
    document.addEventListener("visibilitychange", check);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q);
      const isPresent = checked.has(s._id);
      const matchView =
        view === "all" ||
        (view === "present" && isPresent) ||
        (view === "absent" && !isPresent);
      return matchSearch && matchView;
    });
  }, [students, search, view, checked]);

  // students who really exist and are ticked
  const presentList = useMemo(
    () => students.filter((s) => checked.has(s._id)),
    [students, checked]
  );

  // saves the latest ticked list. If a save is already running, it is
  // repeated once more afterwards so the newest ticks are never lost.
  const runSave = () => {
    if (savePromise.current) {
      again.current = true;
      return savePromise.current;
    }
    setSaveState("saving");
    const p = (async () => {
      let ok = true;
      let count = 0;
      try {
        do {
          again.current = false;
          const { data } = await api.put("/attendance/today", {
            date: dateRef.current,
            studentIds: latestIds.current,
          });
          count = data.count;
        } while (again.current);
        setSaveState("saved");
        setSavedAt(new Date());
        setDirty(false);
      } catch (err) {
        ok = false;
        if (err.response?.status === 409) {
          // midnight passed while the page was open
          showMsg("A new day has started. Attendance reloaded.", true);
          savePromise.current = null;
          await load();
        } else {
          setSaveState("error");
          showMsg("Save failed", true);
        }
      } finally {
        savePromise.current = null;
      }
      return { ok, count };
    })();
    savePromise.current = p;
    return p;
  };

  const autoSave = (idSet) => {
    latestIds.current = students
      .filter((s) => idSet.has(s._id))
      .map((s) => s._id);
    runSave();
  };

  const toggle = (id) => {
    const next = new Set(checked);
    next.has(id) ? next.delete(id) : next.add(id);
    setChecked(next);
    setDirty(true);
    setSearch(""); // clear the search bar after every tick
    autoSave(next);
  };

  const allFilteredChecked =
    filtered.length > 0 && filtered.every((s) => checked.has(s._id));

  const toggleAll = () => {
    const next = new Set(checked);
    if (allFilteredChecked) filtered.forEach((s) => next.delete(s._id));
    else filtered.forEach((s) => next.add(s._id));
    setChecked(next);
    setDirty(true);
    autoSave(next);
  };

  // manual "Save Attendance" button (also used by Print)
  const save = async () => {
    setBusy(true);
    latestIds.current = presentList.map((s) => s._id);
    const result = await runSave();
    setBusy(false);
    if (result.ok) {
      showMsg(`Attendance saved. ${result.count} student(s) present.`);
    }
    return result.ok;
  };

  const printAttendance = async () => {
    const present = presentList;
    if (present.length === 0) {
      showMsg("Please select at least one student to print", true);
      return;
    }

    const ok = await save(); // save first so print always matches saved data
    if (!ok) return;

    const rows = present
      .map(
        (s) => `<tr><td>${esc(s.name)}</td><td>${esc(s.studentId)}</td></tr>`
      )
      .join("");

    const html = `
      <html>
        <head>
          <title>&nbsp;</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #000; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 10px; font-size: 15px; text-align: left; }
            th { background: #eee; }
          </style>
        </head>
        <body>
          <table>
            <thead><tr><th>Student Name</th><th style="width:30%">Student ID</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>`;

    const w = window.open("", "_blank");
    if (!w) {
      showMsg("Please allow popups to print", true);
      return;
    }
    w.document.write(html);
    w.document.close();
    setTimeout(() => {
      w.focus();
      w.print();
    }, 500);
  };

  const total = students.length;
  const presentCount = presentList.length;
  const absentCount = Math.max(total - presentCount, 0);

  const tab = (key, label) => {
    const active = view === key;
    return (
      <button
        onClick={() => setView(key)}
        style={{
          padding: "8px 16px",
          border: "none",
          borderRadius: 999,
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: font,
          background: active ? c.primary : c.bg,
          color: active ? "#fff" : c.muted,
        }}
      >
        {label}
      </button>
    );
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
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <Stat
          icon="users"
          label="Total Students"
          value={total}
          color={c.primary}
          soft={c.primarySoft}
        />
        <Stat
          icon="user-check"
          label="Present Today"
          value={presentCount}
          color={c.success}
          soft={c.successSoft}
        />
        <Stat
          icon="x-circle"
          label="Absent Today"
          value={absentCount}
          color={c.danger}
          soft={c.dangerSoft}
        />
      </div>

      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        {/* header */}
        <div
          style={{
            padding: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: c.text }}>
                Attendance for {formatDate(date)}
              </div>
              {saveState === "saving" && (
                <span
                  style={{
                    background: "#fff4e0",
                    color: "#b45309",
                    padding: "3px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Saving...
                </span>
              )}
              {saveState === "saved" && !dirty && (
                <span
                  style={{
                    background: c.successSoft,
                    color: c.success,
                    padding: "3px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  ✓ Auto-saved
                  {savedAt
                    ? " at " +
                      savedAt.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    : ""}
                </span>
              )}
              {saveState === "error" && (
                <span
                  style={{
                    background: c.dangerSoft,
                    color: c.danger,
                    padding: "3px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Not saved - press Save Attendance
                </span>
              )}
            </div>
            <div style={{ fontSize: 13, color: c.muted, marginTop: 2 }}>
              Tick the students who are present - it saves automatically
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={save}
              disabled={busy}
              style={{ ...btnOutline, opacity: busy ? 0.7 : 1 }}
            >
              <Icon name="save" size={17} /> Save Attendance
            </button>
            <button
              onClick={printAttendance}
              disabled={busy}
              style={{ ...btn, opacity: busy ? 0.7 : 1 }}
            >
              <Icon name="printer" size={17} /> Print Today's Attendance
            </button>
          </div>
        </div>

        {/* toolbar */}
        <div
          style={{
            padding: "0 20px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            {tab("all", `All (${total})`)}
            {tab("present", `Present (${presentCount})`)}
            {tab("absent", `Absent (${absentCount})`)}
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

        {/* table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...th, width: 56 }}>
                  <input
                    type="checkbox"
                    checked={allFilteredChecked}
                    onChange={toggleAll}
                    style={{
                      width: 18,
                      height: 18,
                      cursor: "pointer",
                      accentColor: c.primary,
                    }}
                  />
                </th>
                <th style={th}>Student</th>
                <th style={th}>Student ID</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const isPresent = checked.has(s._id);
                return (
                  <tr
                    key={s._id}
                    onClick={() => toggle(s._id)}
                    style={{
                      cursor: "pointer",
                      background: isPresent ? "#f5f9ff" : "transparent",
                    }}
                  >
                    <td style={td}>
                      <input
                        type="checkbox"
                        checked={isPresent}
                        onChange={() => toggle(s._id)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: 18,
                          height: 18,
                          cursor: "pointer",
                          accentColor: c.primary,
                        }}
                      />
                    </td>
                    <td style={td}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
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
                    <td style={td}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: 999,
                          fontWeight: 600,
                          fontSize: 13,
                          background: isPresent ? c.successSoft : c.dangerSoft,
                          color: isPresent ? c.success : c.danger,
                        }}
                      >
                        {isPresent ? "Present" : "Absent"}
                      </span>
                    </td>
                  </tr>
                );
              })}
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
