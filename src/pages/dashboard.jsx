import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateStudent from "./createstudent.jsx";
import TodayAttendance from "./todayattendance.jsx";
import logo from "../assets/logo.webp";

const c = {
  primary: "#2563eb",
  primarySoft: "#eaf1ff",
  bg: "#f4f7fc",
  border: "#e3e9f4",
  text: "#0f172a",
  muted: "#64748b",
  danger: "#dc2626",
};
const font = "'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif";

const paths = {
  "check-square":
    '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  "user-plus":
    '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>',
  logout:
    '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
  calendar:
    '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
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

const menu = [
  {
    key: "attendance",
    label: "Today's Attendance",
    icon: "check-square",
    title: "Today's Attendance",
  },
  {
    key: "students",
    label: "Create Student",
    icon: "user-plus",
    title: "Student Management",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("attendance");
  const [width, setWidth] = useState(window.innerWidth);
  const [open, setOpen] = useState(window.innerWidth > 860);
  const mobile = width <= 860;
  const username = localStorage.getItem("username") || "Admin";

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  const pick = (key) => {
    setTab(key);
    if (mobile) setOpen(false);
  };

  const todayText = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const current = menu.find((m) => m.key === tab);

  const sidebarStyle = {
    width: 260,
    background: "#fff",
    borderRight: `1px solid ${c.border}`,
    display: "flex",
    flexDirection: "column",
    padding: 18,
    boxSizing: "border-box",
    flexShrink: 0,
    ...(mobile
      ? {
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          boxShadow: "0 0 30px rgba(15,23,42,0.2)",
        }
      : { position: "sticky", top: 0, height: "100vh" }),
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: font,
        background: c.bg,
      }}
    >
      {mobile && open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15,23,42,0.45)",
            zIndex: 40,
          }}
        />
      )}

      {open && (
        <div style={sidebarStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              paddingBottom: 18,
              borderBottom: `1px solid ${c.border}`,
              marginBottom: 18,
            }}
          >
            <img
              src={logo}
              alt="logo"
              style={{ width: 48, height: 48, objectFit: "contain" }}
            />
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: c.text,
                  lineHeight: 1.2,
                }}
              >
                Lohana Boarding
              </div>
              <div style={{ fontSize: 12, color: c.muted }}>Since 1896</div>
            </div>
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: c.muted,
              letterSpacing: 1,
              margin: "0 10px 10px",
            }}
          >
            MENU
          </div>

          {menu.map((m) => {
            const active = tab === m.key;
            return (
              <button
                key={m.key}
                onClick={() => pick(m.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "12px 14px",
                  marginBottom: 6,
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: font,
                  background: active ? c.primary : "transparent",
                  color: active ? "#fff" : c.muted,
                  textAlign: "left",
                }}
              >
                <Icon name={m.icon} size={19} />
                {m.label}
              </button>
            );
          })}

          <div style={{ flex: 1 }} />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: 12,
              background: c.bg,
              borderRadius: 12,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: c.primarySoft,
                color: c.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 15,
                flexShrink: 0,
              }}
            >
              {username.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: c.text,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {username}
              </div>
              <div style={{ fontSize: 12, color: c.muted }}>Administrator</div>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              padding: "11px 14px",
              border: `1px solid ${c.border}`,
              borderRadius: 10,
              background: "#fff",
              color: c.danger,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: font,
            }}
          >
            <Icon name="logout" size={18} />
            Logout
          </button>
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* top bar */}
        <div
          style={{
            background: "#fff",
            borderBottom: `1px solid ${c.border}`,
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              minWidth: 0,
            }}
          >
            <button
              onClick={() => setOpen(!open)}
              style={{
                width: 40,
                height: 40,
                border: `1px solid ${c.border}`,
                borderRadius: 10,
                background: "#fff",
                color: c.text,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="menu" size={20} />
            </button>
            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: c.text,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {current.title}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: c.muted,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            <Icon name="calendar" size={17} />
            {!mobile && <span>{todayText}</span>}
          </div>
        </div>

        <div style={{ padding: mobile ? 16 : 28 }}>
          {tab === "attendance" ? <TodayAttendance /> : <CreateStudent />}
        </div>
      </div>
    </div>
  );
}
