import { useState, useEffect, useCallback, useRef } from "react";
import {
  setupRecaptcha, sendOTP, verifyOTP, logoutUser, getCurrentUser,
  addPlot, subscribePlots, updatePlot, deletePlot,
  addTask, subscribeTasks, updateTask, deleteTask as fbDeleteTask,
  addInventory, subscribeInventory, updateInventory, deleteInventory,
  addExpense, subscribeExpenses, deleteExpense,
  addRevenue, subscribeRevenue, deleteRevenue,
  addFertigationLog, subscribeFertigation, updateFertigationLog, deleteFertigationLog,
  addHealthImage, subscribeHealthImages, deleteHealthImage,
  addWorker, subscribeWorkers, updateWorker, deleteWorker,
  subscribeWeatherAlerts, addWeatherAlert,
  addAttendance, subscribeAttendance,
  getUserProfile, createUserProfile, updateUserProfile,
  seedInitialData
} from "./firebase.js";

// ═══════════════════════════════════════════════════════════════
//  DESIGN SYSTEM
// ═══════════════════════════════════════════════════════════════
const T = {
  bg: "#080E0A", bg1: "#0F1A12", bg2: "#162419", bg3: "#1E3025",
  surface: "#1A2B1E", surfaceHover: "#223828", surfaceActive: "#2A4430",
  border: "#2D4A35", borderLight: "#3A5F44",
  green: "#4ADE80", greenDim: "#22C55E", greenDark: "#166534", greenBg: "rgba(74,222,128,0.08)",
  amber: "#F59E0B", amberDim: "#D97706", amberBg: "rgba(245,158,11,0.08)",
  red: "#EF4444", redBg: "rgba(239,68,68,0.08)",
  blue: "#38BDF8", blueDim: "#0EA5E9", blueBg: "rgba(56,189,248,0.08)",
  violet: "#A78BFA", violetBg: "rgba(167,139,250,0.08)",
  pink: "#F472B6", pinkBg: "rgba(244,114,182,0.08)",
  teal: "#2DD4BF", tealBg: "rgba(45,212,191,0.08)",
  text: "#F0FDF4", textSec: "#86EFAC", textMuted: "#5F8A6A", textDim: "#3D5E46",
  font: "'Outfit', sans-serif", mono: "'JetBrains Mono', monospace",
  display: "'Fraunces', serif",
  radius: 12, radiusSm: 8, radiusLg: 16,
};

// ═══════════════════════════════════════════════════════════════
//  ICONS
// ═══════════════════════════════════════════════════════════════
const I = ({ n, s = 18, c = T.textMuted }) => {
  const d = {
    map:"M1 6l7-4 8 4 7-4v16l-7 4-8-4-7 4V6zm7-4v16m8-12v16",
    crop:"M6.5 6.5L17.5 17.5M7 2v5h5M12 17h5v5",
    users:"M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2m13-9a4 4 0 100-8 4 4 0 000 8m5 9v-2a4 4 0 00-3-3.87m1-9.13a4 4 0 010 7.75",
    drop:"M12 2.69l5.66 5.66a8 8 0 11-11.31 0z",
    box:"M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12",
    dollar:"M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
    sun:"M12 7a5 5 0 100 10 5 5 0 000-10zm0-6v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42",
    heart:"M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
    check:"M20 6L9 17l-5-5", clock:"M12 2a10 10 0 100 20 10 10 0 000-20zm0 4v6l4 2",
    alert:"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01",
    camera:"M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 13a4 4 0 100-8 4 4 0 000 8z",
    layers:"M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    plus:"M12 5v14m-7-7h14", x:"M18 6L6 18M6 6l12 12",
    home:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
    leaf:"M11 20A7 7 0 019.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10zM2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",
    logout:"M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m5 5H9",
    trash:"M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2",
    image:"M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zm-11-6a4 4 0 100-8 4 4 0 000 8z",
    target:"M12 22a10 10 0 100-20 10 10 0 000 20zm0-6a4 4 0 100-8 4 4 0 000 8zm0-2a2 2 0 100-4 2 2 0 000 4z",
    bar:"M18 20V10M12 20V4M6 20v-6",
    shield:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    loader:"M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83",
    cloud:"M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z",
    activity:"M22 12h-4l-3 9L9 3l-3 9H2",
    edit:"M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7m-1.5-10.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
    user:"M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8z",
    calendar:"M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18",
    phone:"M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
    settings:"M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  };
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d[n]||""}/></svg>;
};

// ═══════════════════════════════════════════════════════════════
//  RBAC — Role-Based Access Control
// ═══════════════════════════════════════════════════════════════
const ROLES = {
  admin: {
    label: "Admin / Owner",
    modules: ["overview", "plots", "tasks", "workers", "inventory", "fertigation", "health", "weather", "finance", "settings"],
  },
  manager: {
    label: "Manager",
    modules: ["overview", "plots", "tasks", "workers", "inventory", "fertigation", "health", "weather"],
  },
  worker: {
    label: "Worker",
    modules: ["worker_home"],
  },
};

// ═══════════════════════════════════════════════════════════════
//  REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════════
const Badge = ({ text, color = T.green, small }) => (
  <span style={{ padding: small ? "2px 7px" : "3px 10px", borderRadius: 20, fontSize: small ? 10 : 11,
    fontWeight: 700, color, background: `${color}18`, letterSpacing: 0.3, textTransform: "uppercase", whiteSpace: "nowrap" }}>{text}</span>
);

const Btn = ({ children, onClick, variant = "primary", icon, small, full, disabled, loading, style = {} }) => {
  const [h, setH] = useState(false);
  const base = {
    primary: { bg: T.green, bgH: T.greenDim, color: T.bg, border: "none" },
    secondary: { bg: "transparent", bgH: T.greenBg, color: T.green, border: `1px solid ${T.border}` },
    danger: { bg: T.redBg, bgH: "#EF444433", color: T.red, border: `1px solid ${T.red}33` },
    ghost: { bg: "transparent", bgH: T.greenBg, color: T.textSec, border: "none" },
  }[variant];
  const isDisabled = disabled || loading;
  return (
    <button onClick={isDisabled ? undefined : onClick} disabled={isDisabled}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: small ? "6px 12px" : "10px 18px",
        borderRadius: T.radiusSm, border: base.border, background: h && !isDisabled ? base.bgH : base.bg,
        color: base.color, fontSize: small ? 12 : 13, fontWeight: 600, cursor: isDisabled ? "not-allowed" : "pointer",
        transition: "all 0.2s", fontFamily: T.font, width: full ? "100%" : "auto",
        justifyContent: full ? "center" : "flex-start", opacity: isDisabled ? 0.5 : 1, ...style }}>
      {loading ? <span style={{ display: "inline-block", width: 14, height: 14, border: `2px solid ${base.color}44`,
        borderTopColor: base.color, borderRadius: "50%", animation: "spin 0.6s linear infinite" }} /> :
        icon && <I n={icon} s={small ? 14 : 16} c={base.color} />}{children}
    </button>
  );
};

const Card = ({ children, style = {}, onClick, pad = 20 }) => {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: h && onClick ? T.surfaceHover : T.surface, border: `1px solid ${h && onClick ? T.borderLight : T.border}`,
        borderRadius: T.radius, padding: pad, transition: "all 0.2s", cursor: onClick ? "pointer" : "default", ...style }}>
      {children}
    </div>
  );
};

const StatCard = ({ label, value, icon, color = T.green, sub }) => (
  <Card pad={16}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 6, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: T.text, fontFamily: T.mono }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>{sub}</div>}
      </div>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`,
        display: "flex", alignItems: "center", justifyContent: "center" }}><I n={icon} s={20} c={color} /></div>
    </div>
  </Card>
);

const Progress = ({ value, max = 100, color = T.green, h = 6 }) => (
  <div style={{ background: T.border, borderRadius: h, height: h, width: "100%", overflow: "hidden" }}>
    <div style={{ width: `${Math.min((value / max) * 100, 100)}%`, height: "100%",
      background: `linear-gradient(90deg, ${color}, ${color}bb)`, borderRadius: h, transition: "width 0.8s ease" }} />
  </div>
);

const Input = ({ label, value, onChange, type = "text", placeholder, options, textarea, full = true }) => (
  <div style={{ marginBottom: 14, width: full ? "100%" : "auto" }}>
    {label && <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 5,
      letterSpacing: 0.5, fontFamily: T.mono }}>{label}</label>}
    {options ? (
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", padding: "9px 12px", borderRadius: T.radiusSm, border: `1px solid ${T.border}`,
          background: T.bg2, color: T.text, fontSize: 13, fontFamily: T.font, outline: "none" }}>
        {options.map(o => <option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
      </select>
    ) : textarea ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
        style={{ width: "100%", padding: "9px 12px", borderRadius: T.radiusSm, border: `1px solid ${T.border}`,
          background: T.bg2, color: T.text, fontSize: 13, fontFamily: T.font, outline: "none", resize: "vertical" }} />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "9px 12px", borderRadius: T.radiusSm, border: `1px solid ${T.border}`,
          background: T.bg2, color: T.text, fontSize: 13, fontFamily: T.font, outline: "none" }} />
    )}
  </div>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center",
      justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} />
      <div onClick={e => e.stopPropagation()}
        style={{ position: "relative", background: T.bg1, border: `1px solid ${T.border}`, borderRadius: T.radiusLg,
          padding: 28, width: "100%", maxWidth: 520, maxHeight: "85vh", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: T.text, fontFamily: T.display }}>{title}</h3>
          <div onClick={onClose} style={{ cursor: "pointer", padding: 4 }}><I n="x" s={20} c={T.textMuted} /></div>
        </div>
        {children}
      </div>
    </div>
  );
};

const Spinner = ({ text = "Loading..." }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, color: T.textMuted }}>
    <div style={{ width: 32, height: 32, border: `3px solid ${T.border}`, borderTopColor: T.green,
      borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    <div style={{ marginTop: 12, fontSize: 13 }}>{text}</div>
  </div>
);

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  const colors = { success: T.green, error: T.red, info: T.blue };
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, padding: "12px 20px",
      borderRadius: T.radius, background: T.surface, border: `1px solid ${colors[type]}44`,
      color: T.text, fontSize: 13, fontFamily: T.font, boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", gap: 10, animation: "slideUp 0.3s ease" }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors[type] }} />
      {message}
    </div>
  );
};

const EmptyState = ({ icon, text }) => (
  <Card pad={40} style={{ textAlign: "center", color: T.textMuted }}>
    <I n={icon} s={28} c={T.textDim} /><div style={{ marginTop: 8, fontSize: 13 }}>{text}</div>
  </Card>
);

// ═══════════════════════════════════════════════════════════════
//  LOGIN SCREEN — REAL FIREBASE OTP with ROLE SELECTION
// ═══════════════════════════════════════════════════════════════
const LoginScreen = ({ onLogin }) => {
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const recaptchaReady = useRef(false);

  const handleSendOTP = async () => {
    setError("");
    const cleaned = phone.replace(/\s/g, "");
    if (cleaned.length < 10) {
      setError("Please enter a valid phone number with country code (e.g. +91XXXXXXXXXX)");
      return;
    }
    setLoading(true);
    try {
      const result = await sendOTP(cleaned);
      if (result.success) { setOtpSent(true); } else { setError(result.error || "Failed to send OTP."); }
    } catch (err) { setError("Failed to send OTP. Please try again."); }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setError("");
    if (otp.length < 6) { setError("Please enter the 6-digit OTP"); return; }
    setLoading(true);
    try {
      const result = await verifyOTP(otp);
      if (result.success) {
        const profile = await getUserProfile(result.user.uid);
        if (!profile) {
          await createUserProfile(result.user.uid, {
            phone: result.user.phoneNumber, name: "Farm Owner", role: "admin", farm: "My Farm"
          });
          await seedInitialData(result.user.uid);
        }
        onLogin(result.user);
      } else { setError(result.error || "Invalid OTP"); }
    } catch (err) { setError("Verification failed. Please try again."); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: T.font, color: T.text }}>
      <div style={{ width: 380, padding: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: `linear-gradient(135deg, ${T.green}, ${T.greenDim})`,
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>🌿</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: T.display, marginBottom: 4 }}>AgroSync</h1>
          <p style={{ fontSize: 13, color: T.textMuted }}>Farm Management Platform</p>
        </div>
        <Card>
          <div style={{ fontSize: 11, color: T.textMuted, fontFamily: T.mono, letterSpacing: 1, marginBottom: 14, fontWeight: 700 }}>
            {otpSent ? "VERIFY OTP" : "PHONE LOGIN"}
          </div>
          {error && (
            <div style={{ padding: "10px 14px", borderRadius: T.radiusSm, background: T.redBg,
              border: `1px solid ${T.red}33`, fontSize: 12, color: T.red, marginBottom: 14 }}>{error}</div>
          )}
          {!otpSent ? (
            <>
              <Input label="PHONE NUMBER (with country code)" value={phone}
                onChange={v => { setPhone(v); setError(""); }} placeholder="+91 98765 43210" />
              <p style={{ fontSize: 11, color: T.textDim, marginBottom: 14 }}>
                Enter your number with country code. You'll receive an SMS with a 6-digit code.
              </p>
              <Btn full onClick={handleSendOTP} loading={loading} disabled={phone.replace(/\s/g, "").length < 10}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </Btn>
            </>
          ) : (
            <>
              <p style={{ fontSize: 12, color: T.textSec, marginBottom: 14 }}>OTP sent to <strong>{phone}</strong></p>
              <Input label="6-DIGIT OTP CODE" value={otp}
                onChange={v => { setOtp(v.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                placeholder="Enter 6-digit code" />
              <Btn full onClick={handleVerifyOTP} loading={loading} disabled={otp.length < 6}>
                {loading ? "Verifying..." : "Verify & Login"}
              </Btn>
              <div style={{ textAlign: "center", marginTop: 14 }}>
                <span onClick={() => { setOtpSent(false); setOtp(""); setError(""); recaptchaReady.current = false; }}
                  style={{ fontSize: 12, color: T.green, cursor: "pointer" }}>← Change phone number</span>
              </div>
            </>
          )}
        </Card>
        <div style={{ textAlign: "center", marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <I n="shield" s={14} c={T.textDim} />
          <span style={{ fontSize: 11, color: T.textDim }}>Secured with Firebase Authentication</span>
        </div>
      </div>
      <div id="recaptcha-box"></div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  NAV CONFIG
// ═══════════════════════════════════════════════════════════════
const ALL_NAV = [
  { id: "overview", label: "Overview", icon: "home" },
  { id: "plots", label: "Land & Plots", icon: "map" },
  { id: "tasks", label: "Tasks", icon: "clock" },
  { id: "workers", label: "Workers", icon: "users" },
  { id: "inventory", label: "Inventory", icon: "box" },
  { id: "fertigation", label: "Fertigation", icon: "drop" },
  { id: "health", label: "Health Monitor", icon: "activity" },
  { id: "weather", label: "Weather", icon: "cloud" },
  { id: "finance", label: "Financials", icon: "dollar" },
  { id: "settings", label: "Settings", icon: "settings" },
];

// ═══════════════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function AgroSync({ firebaseUser }) {
  const [user, setUser] = useState(firebaseUser);
  const [profile, setProfile] = useState(null);

  // Data state
  const [plots, setPlots] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [fertigationLogs, setFertigationLogs] = useState([]);
  const [healthImages, setHealthImages] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // UI state
  const [module, setModule] = useState("overview");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });
  const role = profile?.role || "admin";
  const allowedModules = ROLES[role]?.modules || ROLES.admin.modules;
  const NAV = role === "worker" ? [{ id: "worker_home", label: "My Tasks", icon: "clock" }] :
    ALL_NAV.filter(n => allowedModules.includes(n.id));

  // Subscribe to Firestore
  useEffect(() => {
    if (!user) { setDataLoaded(false); return; }
    const uid = user.uid;
    let mounted = true;
    getUserProfile(uid).then(p => { if (mounted && p) setProfile(p); });
    const unsubs = [
      subscribePlots(uid, items => { if (mounted) setPlots(items); }),
      subscribeTasks(uid, items => { if (mounted) setTasks(items); }),
      subscribeInventory(uid, items => { if (mounted) setInventory(items); }),
      subscribeExpenses(uid, items => { if (mounted) setExpenses(items); }),
      subscribeRevenue(uid, items => { if (mounted) setRevenue(items); }),
      subscribeFertigation(uid, items => { if (mounted) setFertigationLogs(items); }),
      subscribeHealthImages(uid, items => { if (mounted) setHealthImages(items); }),
      subscribeWorkers(uid, items => { if (mounted) setWorkers(items); }),
      subscribeWeatherAlerts(uid, items => { if (mounted) setWeatherAlerts(items); }),
      subscribeAttendance(uid, items => { if (mounted) setAttendance(items); }),
    ];
    setTimeout(() => { if (mounted) setDataLoaded(true); }, 1500);
    return () => { mounted = false; unsubs.forEach(fn => fn()); };
  }, [user]);

  const handleLogin = (fbUser) => setUser(fbUser);
  const handleLogout = async () => {
    await logoutUser();
    setUser(null); setProfile(null); setPlots([]); setTasks([]); setInventory([]);
    setExpenses([]); setRevenue([]); setFertigationLogs([]); setHealthImages([]);
    setWorkers([]); setWeatherAlerts([]); setAttendance([]); setDataLoaded(false);
  };

  // ── CRUD OPERATIONS ──
  const handleAddPlot = async (data) => { try { await addPlot(user.uid, data); showToast("Plot added"); } catch(e) { showToast("Failed","error"); }};
  const handleUpdatePlot = async (id, data) => { try { await updatePlot(user.uid, id, data); showToast("Plot updated"); } catch(e) { showToast("Failed","error"); }};
  const handleDeletePlot = async (id) => { try { await deletePlot(user.uid, id); showToast("Plot deleted"); } catch(e) { showToast("Failed","error"); }};
  const handleAddTask = async (data) => { try { await addTask(user.uid, data); showToast("Task created"); } catch(e) { showToast("Failed","error"); }};
  const handleUpdateTask = async (id, data) => { try { await updateTask(user.uid, id, data); } catch(e) { showToast("Failed","error"); }};
  const handleDeleteTask = async (id) => { try { await fbDeleteTask(user.uid, id); showToast("Task deleted"); } catch(e) { showToast("Failed","error"); }};
  const handleAddInventory = async (data) => { try { await addInventory(user.uid, data); showToast("Item added"); } catch(e) { showToast("Failed","error"); }};
  const handleAddExpense = async (data) => { try { await addExpense(user.uid, data); showToast("Expense recorded"); } catch(e) { showToast("Failed","error"); }};
  const handleAddRevenue = async (data) => { try { await addRevenue(user.uid, data); showToast("Revenue recorded"); } catch(e) { showToast("Failed","error"); }};
  const handleAddFertLog = async (data) => { try { await addFertigationLog(user.uid, data); showToast("Log added"); } catch(e) { showToast("Failed","error"); }};
  const handleAddHealthImg = async (data) => { try { await addHealthImage(user.uid, data); showToast("Image logged"); } catch(e) { showToast("Failed","error"); }};
  const handleAddWorker = async (data) => { try { await addWorker(user.uid, data); showToast("Worker added"); } catch(e) { showToast("Failed","error"); }};
  const handleUpdateWorker = async (id, data) => { try { await updateWorker(user.uid, id, data); showToast("Worker updated"); } catch(e) { showToast("Failed","error"); }};
  const handleDeleteWorker = async (id) => { try { await deleteWorker(user.uid, id); showToast("Worker removed"); } catch(e) { showToast("Failed","error"); }};

  // ── RENDER ──
  if (!user) return <LoginScreen onLogin={handleLogin} />;
  if (!dataLoaded) return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font }}>
      <Spinner text="Loading your farm data from the cloud..." />
    </div>
  );

  const priorityC = { urgent: T.red, high: "#F97316", medium: T.amber, low: T.textMuted };
  const statusC = { pending: T.textMuted, in_progress: T.blue, completed: T.green, scheduled: T.violet };
  const catC = { ipm: T.pink, irrigation: T.blue, harvesting: T.amber, general: T.textSec, sowing: T.green, fertigation: T.teal };
  const statusInvC = { ok: T.green, low: T.amber, critical: T.red };
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalRevenue = revenue.reduce((s, r) => s + ((r.qty || 0) * (r.price || 0)), 0);

  // ═══════════════════════════════════════════════════════════════
  //  MODULE: OVERVIEW
  // ═══════════════════════════════════════════════════════════════
  const renderOverview = () => {
    const pending = tasks.filter(t => t.status === "pending").length;
    const criticalStock = inventory.filter(i => i.status === "critical" || i.status === "low").length;
    const activeWorkers = workers.filter(w => w.status === "active").length;
    return (
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: T.text, fontFamily: T.display, marginBottom: 4 }}>Farm Overview</h2>
        <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>
          {profile?.farm || "My Farm"} — {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
          <StatCard label="Active Plots" value={plots.length} icon="map" color={T.green} sub={`${plots.reduce((s,p)=>s+(p.acreage||0),0).toFixed(1)} acres`} />
          <StatCard label="Pending Tasks" value={pending} icon="clock" color={T.amber} />
          <StatCard label="Stock Alerts" value={criticalStock} icon="alert" color={T.red} />
          <StatCard label="Active Workers" value={activeWorkers} icon="users" color={T.blue} />
          <StatCard label="Net P&L" value={`₹${((totalRevenue-totalExpenses)/1000).toFixed(1)}K`} icon="bar" color={totalRevenue >= totalExpenses ? T.green : T.red} />
        </div>
        <div style={{ fontSize: 11, color: T.textMuted, fontFamily: T.mono, letterSpacing: 1, marginBottom: 10, fontWeight: 700 }}>YOUR PLOTS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 10 }}>
          {plots.map(p => (
            <Card key={p.id} onClick={() => setModule("plots")} pad={14}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: p.color || T.green }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{p.crop || "No crop"} · {p.acreage} ac</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, fontFamily: T.mono,
                  color: (p.health||50) > 80 ? T.green : (p.health||50) > 60 ? T.amber : T.red }}>{p.health||50}%</div>
              </div>
            </Card>
          ))}
          {plots.length === 0 && <EmptyState icon="map" text="No plots yet. Go to Land & Plots to add one." />}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  //  MODULE: LAND & PLOTS
  // ═══════════════════════════════════════════════════════════════
  const renderPlots = () => {
    const [showAdd, setShowAdd] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name:"", acreage:"", crop:"", soil:"Loamy", irrigation:"Drip", ph:"7.0" });
    const [saving, setSaving] = useState(false);
    const resetForm = () => { setForm({ name:"", acreage:"", crop:"", soil:"Loamy", irrigation:"Drip", ph:"7.0" }); setEditId(null); };
    const doAdd = async () => {
      if (!form.name || !form.acreage) return;
      setSaving(true);
      if (editId) {
        await handleUpdatePlot(editId, { name: form.name, acreage: parseFloat(form.acreage), crop: form.crop || "None",
          soil: form.soil, ph: parseFloat(form.ph), irrigation: form.irrigation });
      } else {
        await handleAddPlot({ name: form.name, acreage: parseFloat(form.acreage), crop: form.crop || "None",
          stage: "Preparing", soil: form.soil, ph: parseFloat(form.ph), irrigation: form.irrigation,
          health: 50, color: ["#4ADE80","#38BDF8","#F59E0B","#A78BFA","#2DD4BF","#F472B6"][plots.length % 6] });
      }
      resetForm(); setShowAdd(false); setSaving(false);
    };
    const startEdit = (p) => {
      setForm({ name: p.name, acreage: String(p.acreage), crop: p.crop, soil: p.soil, irrigation: p.irrigation, ph: String(p.ph) });
      setEditId(p.id); setShowAdd(true);
    };
    return (
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <h2 style={{ fontSize:22, fontWeight:700, color:T.text, fontFamily:T.display }}>Land & Plots</h2>
            <p style={{ fontSize:13, color:T.textMuted, marginTop:4 }}>{plots.length} plots · {plots.reduce((s,p)=>s+(p.acreage||0),0).toFixed(1)} acres</p>
          </div>
          <Btn icon="plus" onClick={()=>{ resetForm(); setShowAdd(true); }}>Add Plot</Btn>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:12 }}>
          {plots.map(p => (
            <Card key={p.id}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <div style={{ width:10, height:10, borderRadius:3, background:p.color||T.green }} />
                    <span style={{ fontSize:14, fontWeight:700, color:T.text }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize:12, color:T.textMuted }}>{p.crop || "No crop"}</span>
                </div>
                <Badge text={p.stage || "—"} color={p.color||T.green} small />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, fontSize:11 }}>
                <div><span style={{ color:T.textMuted }}>Acreage: </span><span style={{ color:T.textSec, fontWeight:600 }}>{p.acreage} ac</span></div>
                <div><span style={{ color:T.textMuted }}>Soil: </span><span style={{ color:T.textSec, fontWeight:600 }}>{p.soil}</span></div>
                <div><span style={{ color:T.textMuted }}>pH: </span><span style={{ color:T.textSec, fontWeight:600 }}>{p.ph}</span></div>
                <div><span style={{ color:T.textMuted }}>Irrigation: </span><span style={{ color:T.textSec, fontWeight:600 }}>{p.irrigation}</span></div>
              </div>
              <div style={{ marginTop:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:11, color:T.textMuted }}>Health</span>
                  <span style={{ fontSize:11, fontWeight:700, fontFamily:T.mono,
                    color: (p.health||50) > 80 ? T.green : (p.health||50) > 60 ? T.amber : T.red }}>{p.health||50}%</span>
                </div>
                <Progress value={p.health||50} color={(p.health||50) > 80 ? T.green : (p.health||50) > 60 ? T.amber : T.red} />
              </div>
              <div style={{ display:"flex", gap:6, marginTop:12 }}>
                <Btn small variant="secondary" icon="edit" onClick={()=>startEdit(p)}>Edit</Btn>
                <Btn small variant="danger" icon="trash" onClick={()=>handleDeletePlot(p.id)}>Delete</Btn>
              </div>
            </Card>
          ))}
        </div>
        <Modal open={showAdd} onClose={()=>{ setShowAdd(false); resetForm(); }} title={editId ? "Edit Plot" : "Add New Plot"}>
          <Input label="PLOT NAME" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="e.g. North Field" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="ACREAGE" value={form.acreage} onChange={v=>setForm(f=>({...f,acreage:v}))} type="number" placeholder="5.0" />
            <Input label="SOIL pH" value={form.ph} onChange={v=>setForm(f=>({...f,ph:v}))} type="number" />
          </div>
          <Input label="CURRENT CROP" value={form.crop} onChange={v=>setForm(f=>({...f,crop:v}))} placeholder="e.g. Tomato (Hybrid-5)" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="SOIL TYPE" value={form.soil} onChange={v=>setForm(f=>({...f,soil:v}))}
              options={["Loamy","Black Cotton","Sandy","Red","Sandy Loam","Clay"]} />
            <Input label="IRRIGATION" value={form.irrigation} onChange={v=>setForm(f=>({...f,irrigation:v}))}
              options={["Drip","Sprinkler","Flood","Rainfed"]} />
          </div>
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn variant="secondary" onClick={()=>{ setShowAdd(false); resetForm(); }} full>Cancel</Btn>
            <Btn onClick={doAdd} full loading={saving}>{editId ? "Save Changes" : "Add Plot"}</Btn>
          </div>
        </Modal>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  //  MODULE: TASKS
  // ═══════════════════════════════════════════════════════════════
  const renderTasks = () => {
    const [filter, setFilter] = useState("all");
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ title:"", plot:"", worker:"", priority:"medium", category:"general", due: new Date().toISOString().split("T")[0], desc:"" });
    const [saving, setSaving] = useState(false);
    const filtered = tasks.filter(t => filter === "all" || t.status === filter);
    const counts = { all: tasks.length, pending: tasks.filter(t=>t.status==="pending").length,
      in_progress: tasks.filter(t=>t.status==="in_progress").length, completed: tasks.filter(t=>t.status==="completed").length };
    const doAdd = async () => {
      if (!form.title) return; setSaving(true);
      await handleAddTask({ ...form, status: "pending" });
      setForm({ title:"", plot:"", worker:"", priority:"medium", category:"general", due: new Date().toISOString().split("T")[0], desc:"" });
      setShowAdd(false); setSaving(false);
    };
    return (
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
          <h2 style={{ fontSize:22, fontWeight:700, color:T.text, fontFamily:T.display }}>Tasks</h2>
          <Btn icon="plus" onClick={()=>setShowAdd(true)}>New Task</Btn>
        </div>
        <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
          {[{id:"all",label:"All"},{id:"pending",label:"Pending"},{id:"in_progress",label:"Active"},{id:"completed",label:"Done"}].map(f => (
            <button key={f.id} onClick={()=>setFilter(f.id)}
              style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${filter===f.id? T.green+"66":T.border}`,
                background: filter===f.id? T.greenBg:"transparent", color: filter===f.id? T.green:T.textMuted,
                fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:T.font }}>{f.label} ({counts[f.id]})</button>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {filtered.map(t => {
            const plot = plots.find(p => p.id === t.plot);
            return (
              <Card key={t.id} pad={14}>
                <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:(catC[t.category]||T.textMuted)+"18",
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <I n={t.category==="ipm"?"heart":t.category==="irrigation"?"drop":t.category==="harvesting"?"crop":"layers"} s={16} c={catC[t.category]||T.textMuted} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", gap:8, flexWrap:"wrap" }}>
                      <span style={{ fontSize:13, fontWeight:700, color:T.text }}>{t.title}</span>
                      <div style={{ display:"flex", gap:6 }}>
                        <Badge text={t.priority} color={priorityC[t.priority]} small />
                        <Badge text={t.status?.replace("_"," ")} color={statusC[t.status]} small />
                      </div>
                    </div>
                    <div style={{ fontSize:11, color:T.textMuted, marginTop:3 }}>{plot?.name || "—"} · {t.worker || "Unassigned"} · Due: {t.due}</div>
                    {t.desc && <div style={{ fontSize:11, color:T.textDim, marginTop:4 }}>{t.desc}</div>}
                    <div style={{ display:"flex", gap:6, marginTop:8 }}>
                      {t.status==="pending" && <Btn small variant="secondary" onClick={()=>handleUpdateTask(t.id,{status:"in_progress"})}>Start</Btn>}
                      {t.status==="in_progress" && <Btn small onClick={()=>handleUpdateTask(t.id,{status:"completed"})} icon="check">Complete</Btn>}
                      {t.status==="completed" && <Btn small variant="ghost" onClick={()=>handleUpdateTask(t.id,{status:"pending"})}>Reopen</Btn>}
                      <Btn small variant="danger" onClick={()=>handleDeleteTask(t.id)} icon="trash">Delete</Btn>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
          {filtered.length === 0 && <EmptyState icon="check" text="No tasks match this filter" />}
        </div>
        <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Create New Task">
          <Input label="TASK TITLE" value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="e.g. Apply fertilizer" />
          <Input label="DESCRIPTION" value={form.desc} onChange={v=>setForm(f=>({...f,desc:v}))} textarea placeholder="Instructions..." />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="PLOT" value={form.plot} onChange={v=>setForm(f=>({...f,plot:v}))}
              options={[{value:"",label:"Select plot"}, ...plots.map(p=>({value:p.id,label:p.name}))]} />
            <Input label="ASSIGN TO" value={form.worker} onChange={v=>setForm(f=>({...f,worker:v}))}
              options={[{value:"",label:"Select worker"}, ...workers.map(w=>({value:w.name,label:w.name}))]} />
            <Input label="PRIORITY" value={form.priority} onChange={v=>setForm(f=>({...f,priority:v}))}
              options={["low","medium","high","urgent"]} />
            <Input label="CATEGORY" value={form.category} onChange={v=>setForm(f=>({...f,category:v}))}
              options={["sowing","fertigation","ipm","irrigation","harvesting","general"]} />
          </div>
          <Input label="DUE DATE" value={form.due} onChange={v=>setForm(f=>({...f,due:v}))} type="date" />
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn variant="secondary" onClick={()=>setShowAdd(false)} full>Cancel</Btn>
            <Btn onClick={doAdd} full loading={saving}>Create Task</Btn>
          </div>
        </Modal>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  //  MODULE: WORKERS
  // ═══════════════════════════════════════════════════════════════
  const renderWorkers = () => {
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ name:"", phone:"", specialty:"", dailyWage:"", role:"worker" });
    const [saving, setSaving] = useState(false);
    const activeW = workers.filter(w => w.status === "active");
    const doAdd = async () => {
      if (!form.name) return; setSaving(true);
      await handleAddWorker({ ...form, dailyWage: parseFloat(form.dailyWage||0), status: "active", joinDate: new Date().toISOString().split("T")[0] });
      setForm({ name:"", phone:"", specialty:"", dailyWage:"", role:"worker" });
      setShowAdd(false); setSaving(false);
    };
    const workerTasks = (workerName) => tasks.filter(t => t.worker === workerName);
    const completedPct = (workerName) => {
      const wt = workerTasks(workerName);
      if (wt.length === 0) return 0;
      return Math.round((wt.filter(t => t.status === "completed").length / wt.length) * 100);
    };

    return (
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
          <div>
            <h2 style={{ fontSize:22, fontWeight:700, color:T.text, fontFamily:T.display }}>Workforce</h2>
            <p style={{ fontSize:13, color:T.textMuted, marginTop:4 }}>{activeW.length} active workers · Total wage: ₹{activeW.reduce((s,w)=>s+(w.dailyWage||0),0).toLocaleString()}/day</p>
          </div>
          <Btn icon="plus" onClick={()=>setShowAdd(true)}>Add Worker</Btn>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:12 }}>
          {workers.map(w => {
            const wTasks = workerTasks(w.name);
            const pct = completedPct(w.name);
            return (
              <Card key={w.id}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                  <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                    <div style={{ width:42, height:42, borderRadius:"50%", background:T.greenDark,
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:T.green }}>
                      {w.name?.[0] || "?"}
                    </div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:T.text }}>{w.name}</div>
                      <div style={{ fontSize:11, color:T.textMuted }}>{w.specialty || "General"}</div>
                    </div>
                  </div>
                  <Badge text={w.status || "active"} color={w.status==="active" ? T.green : T.textMuted} small />
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, fontSize:11, marginBottom:12 }}>
                  <div><span style={{ color:T.textMuted }}>Role: </span><span style={{ color:T.textSec, fontWeight:600 }}>{w.role || "worker"}</span></div>
                  <div><span style={{ color:T.textMuted }}>Wage: </span><span style={{ color:T.textSec, fontWeight:600 }}>₹{w.dailyWage}/day</span></div>
                  <div><span style={{ color:T.textMuted }}>Phone: </span><span style={{ color:T.textSec, fontWeight:600 }}>{w.phone || "—"}</span></div>
                  <div><span style={{ color:T.textMuted }}>Since: </span><span style={{ color:T.textSec, fontWeight:600 }}>{w.joinDate || "—"}</span></div>
                </div>

                <div style={{ fontSize:11, color:T.textMuted, marginBottom:4 }}>Tasks: {wTasks.length} total · {pct}% completed</div>
                <Progress value={pct} color={pct > 70 ? T.green : pct > 40 ? T.amber : T.red} />

                <div style={{ display:"flex", gap:6, marginTop:12 }}>
                  <Btn small variant="secondary" onClick={()=>handleUpdateWorker(w.id, { status: w.status==="active" ? "inactive" : "active" })}>
                    {w.status==="active" ? "Deactivate" : "Activate"}
                  </Btn>
                  <Btn small variant="danger" icon="trash" onClick={()=>handleDeleteWorker(w.id)}>Remove</Btn>
                </div>
              </Card>
            );
          })}
          {workers.length === 0 && <EmptyState icon="users" text="No workers added yet" />}
        </div>

        <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add Worker">
          <Input label="FULL NAME" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="e.g. Raju Kumar" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="PHONE" value={form.phone} onChange={v=>setForm(f=>({...f,phone:v}))} placeholder="+91..." />
            <Input label="DAILY WAGE (₹)" value={form.dailyWage} onChange={v=>setForm(f=>({...f,dailyWage:v}))} type="number" />
          </div>
          <Input label="SPECIALTY" value={form.specialty} onChange={v=>setForm(f=>({...f,specialty:v}))} placeholder="e.g. Irrigation & Plumbing" />
          <Input label="ROLE" value={form.role} onChange={v=>setForm(f=>({...f,role:v}))} options={["worker","manager"]} />
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn variant="secondary" onClick={()=>setShowAdd(false)} full>Cancel</Btn>
            <Btn onClick={doAdd} full loading={saving}>Add Worker</Btn>
          </div>
        </Modal>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  //  MODULE: INVENTORY
  // ═══════════════════════════════════════════════════════════════
  const renderInventory = () => {
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ name:"", cat:"Fertilizer", stock:"", max:"", unit:"kg", cost:"" });
    const [saving, setSaving] = useState(false);
    const criticalCount = inventory.filter(i => i.status === "critical").length;
    const lowCount = inventory.filter(i => i.status === "low").length;
    const doAdd = async () => {
      if (!form.name || !form.stock) return; setSaving(true);
      const s = parseFloat(form.stock), m = parseFloat(form.max || form.stock * 2);
      const status = s < m * 0.15 ? "critical" : s < m * 0.4 ? "low" : "ok";
      await handleAddInventory({ name:form.name, cat:form.cat, stock:s, max:m, unit:form.unit, cost:parseFloat(form.cost||0), status });
      setForm({ name:"", cat:"Fertilizer", stock:"", max:"", unit:"kg", cost:"" });
      setShowAdd(false); setSaving(false);
    };
    return (
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
          <div>
            <h2 style={{ fontSize:22, fontWeight:700, color:T.text, fontFamily:T.display }}>Inventory</h2>
            <p style={{ fontSize:13, color:T.textMuted, marginTop:4 }}>
              {inventory.length} items
              {criticalCount > 0 && <> · <span style={{ color:T.red }}>{criticalCount} critical</span></>}
              {lowCount > 0 && <> · <span style={{ color:T.amber }}>{lowCount} low</span></>}
            </p>
          </div>
          <Btn icon="plus" onClick={()=>setShowAdd(true)}>Add Item</Btn>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {inventory.map(item => (
            <Card key={item.id} pad={14}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:8, height:38, borderRadius:4, background:statusInvC[item.status]||T.textMuted }} />
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div><span style={{ fontSize:13, fontWeight:700, color:T.text }}>{item.name}</span>
                      <span style={{ marginLeft:8 }}><Badge text={item.cat} color={T.textMuted} small /></span></div>
                    <div><span style={{ fontSize:15, fontWeight:800, fontFamily:T.mono,
                      color: statusInvC[item.status]||T.textMuted }}>{item.stock}</span>
                      <span style={{ fontSize:11, color:T.textMuted }}> / {item.max} {item.unit}</span></div>
                  </div>
                  <div style={{ marginTop:8 }}><Progress value={item.stock} max={item.max} color={statusInvC[item.status]||T.green} h={5} /></div>
                  {item.status !== "ok" && <div style={{ fontSize:11, fontWeight:700, color:statusInvC[item.status], marginTop:4 }}>
                    {item.status === "critical" ? "⚠ REORDER NOW" : "📦 Restock soon"}</div>}
                </div>
              </div>
            </Card>
          ))}
          {inventory.length === 0 && <EmptyState icon="box" text="No inventory items yet" />}
        </div>
        <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add Inventory Item">
          <Input label="ITEM NAME" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="e.g. Urea 46-0-0" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="CATEGORY" value={form.cat} onChange={v=>setForm(f=>({...f,cat:v}))}
              options={["Fertilizer","Pesticide","Herbicide","Seed","Equipment","Other"]} />
            <Input label="UNIT" value={form.unit} onChange={v=>setForm(f=>({...f,unit:v}))} options={["kg","L","g","m","piece","roll"]} />
            <Input label="CURRENT STOCK" value={form.stock} onChange={v=>setForm(f=>({...f,stock:v}))} type="number" />
            <Input label="MAX CAPACITY" value={form.max} onChange={v=>setForm(f=>({...f,max:v}))} type="number" />
          </div>
          <Input label="COST PER UNIT (₹)" value={form.cost} onChange={v=>setForm(f=>({...f,cost:v}))} type="number" />
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn variant="secondary" onClick={()=>setShowAdd(false)} full>Cancel</Btn>
            <Btn onClick={doAdd} full loading={saving}>Add Item</Btn>
          </div>
        </Modal>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  //  MODULE: FERTIGATION & IRRIGATION
  // ═══════════════════════════════════════════════════════════════
  const renderFertigation = () => {
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ plot:"", type:"fertigation", nutrient:"", concentration:"", waterVolume:"", unit:"L", duration:"", method:"Drip", date: new Date().toISOString().split("T")[0], notes:"", status:"scheduled" });
    const [saving, setSaving] = useState(false);
    const doAdd = async () => {
      if (!form.plot || !form.waterVolume) return; setSaving(true);
      await handleAddFertLog({ ...form, concentration: parseFloat(form.concentration||0), waterVolume: parseFloat(form.waterVolume), duration: parseFloat(form.duration||0) });
      setForm({ plot:"", type:"fertigation", nutrient:"", concentration:"", waterVolume:"", unit:"L", duration:"", method:"Drip", date: new Date().toISOString().split("T")[0], notes:"", status:"scheduled" });
      setShowAdd(false); setSaving(false);
    };
    const totalWater = fertigationLogs.reduce((s, f) => s + (f.waterVolume || 0), 0);
    const scheduled = fertigationLogs.filter(f => f.status === "scheduled").length;

    return (
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
          <div>
            <h2 style={{ fontSize:22, fontWeight:700, color:T.text, fontFamily:T.display }}>Fertigation & Irrigation</h2>
            <p style={{ fontSize:13, color:T.textMuted, marginTop:4 }}>{fertigationLogs.length} logs · {totalWater.toLocaleString()}L total · {scheduled} scheduled</p>
          </div>
          <Btn icon="plus" onClick={()=>setShowAdd(true)}>Add Log</Btn>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:12, marginBottom:20 }}>
          <StatCard label="Total Water Used" value={`${(totalWater/1000).toFixed(1)}KL`} icon="drop" color={T.blue} />
          <StatCard label="Fertigation Cycles" value={fertigationLogs.filter(f=>f.type==="fertigation").length} icon="layers" color={T.teal} />
          <StatCard label="Irrigation Cycles" value={fertigationLogs.filter(f=>f.type==="irrigation").length} icon="drop" color={T.blue} />
          <StatCard label="Scheduled" value={scheduled} icon="calendar" color={T.violet} />
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {fertigationLogs.map(log => {
            const plot = plots.find(p => p.id === log.plot);
            return (
              <Card key={log.id} pad={14}>
                <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div style={{ width:36, height:36, borderRadius:8, background: log.type==="fertigation" ? T.tealBg : T.blueBg,
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <I n="drop" s={16} c={log.type==="fertigation" ? T.teal : T.blue} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", gap:8, flexWrap:"wrap" }}>
                      <span style={{ fontSize:13, fontWeight:700, color:T.text }}>
                        {log.type === "fertigation" ? "Fertigation" : "Irrigation"} — {plot?.name || "Unknown Plot"}
                      </span>
                      <Badge text={log.status} color={statusC[log.status] || T.textMuted} small />
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(120px, 1fr))", gap:6, fontSize:11, marginTop:6 }}>
                      {log.nutrient && log.nutrient !== "None" && <div><span style={{ color:T.textMuted }}>Nutrient: </span><span style={{ color:T.textSec }}>{log.nutrient} ({log.concentration}g/L)</span></div>}
                      <div><span style={{ color:T.textMuted }}>Volume: </span><span style={{ color:T.textSec }}>{log.waterVolume} {log.unit}</span></div>
                      <div><span style={{ color:T.textMuted }}>Duration: </span><span style={{ color:T.textSec }}>{log.duration} min</span></div>
                      <div><span style={{ color:T.textMuted }}>Method: </span><span style={{ color:T.textSec }}>{log.method}</span></div>
                      <div><span style={{ color:T.textMuted }}>Date: </span><span style={{ color:T.textSec }}>{log.date}</span></div>
                    </div>
                    {log.notes && <div style={{ fontSize:11, color:T.textDim, marginTop:4 }}>{log.notes}</div>}
                    {log.status === "scheduled" && (
                      <div style={{ marginTop:8 }}>
                        <Btn small onClick={async ()=>{ await updateFertigationLog(user.uid, log.id, { status:"completed" }); showToast("Marked complete"); }}>
                          Mark Completed
                        </Btn>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
          {fertigationLogs.length === 0 && <EmptyState icon="drop" text="No fertigation/irrigation logs yet" />}
        </div>

        <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add Fertigation / Irrigation Log">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="TYPE" value={form.type} onChange={v=>setForm(f=>({...f,type:v}))} options={["fertigation","irrigation"]} />
            <Input label="PLOT" value={form.plot} onChange={v=>setForm(f=>({...f,plot:v}))}
              options={[{value:"",label:"Select plot"}, ...plots.map(p=>({value:p.id,label:p.name}))]} />
          </div>
          {form.type === "fertigation" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Input label="NUTRIENT" value={form.nutrient} onChange={v=>setForm(f=>({...f,nutrient:v}))} placeholder="e.g. NPK 19-19-19" />
              <Input label="CONCENTRATION (g/L)" value={form.concentration} onChange={v=>setForm(f=>({...f,concentration:v}))} type="number" />
            </div>
          )}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="WATER VOLUME (L)" value={form.waterVolume} onChange={v=>setForm(f=>({...f,waterVolume:v}))} type="number" />
            <Input label="DURATION (min)" value={form.duration} onChange={v=>setForm(f=>({...f,duration:v}))} type="number" />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="METHOD" value={form.method} onChange={v=>setForm(f=>({...f,method:v}))} options={["Drip","Sprinkler","Flood","Manual"]} />
            <Input label="DATE" value={form.date} onChange={v=>setForm(f=>({...f,date:v}))} type="date" />
          </div>
          <Input label="STATUS" value={form.status} onChange={v=>setForm(f=>({...f,status:v}))} options={["scheduled","completed"]} />
          <Input label="NOTES" value={form.notes} onChange={v=>setForm(f=>({...f,notes:v}))} textarea placeholder="Additional details..." />
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn variant="secondary" onClick={()=>setShowAdd(false)} full>Cancel</Btn>
            <Btn onClick={doAdd} full loading={saving}>Add Log</Btn>
          </div>
        </Modal>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  //  MODULE: HEALTH MONITORING & AI REPORTING
  // ═══════════════════════════════════════════════════════════════
  const renderHealth = () => {
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ plot:"", issue:"", severity:"medium", imageUrl:"", notes:"", ndvi:"", date: new Date().toISOString().split("T")[0] });
    const [saving, setSaving] = useState(false);

    const doAdd = async () => {
      if (!form.plot) return; setSaving(true);
      await handleAddHealthImg({
        ...form, severity: form.severity, ndvi: parseFloat(form.ndvi || 0),
        timestamp: new Date().toISOString(),
        gpsLat: null, gpsLng: null,
      });
      setForm({ plot:"", issue:"", severity:"medium", imageUrl:"", notes:"", ndvi:"", date: new Date().toISOString().split("T")[0] });
      setShowAdd(false); setSaving(false);
    };

    const severityC = { low: T.green, medium: T.amber, high: "#F97316", critical: T.red };
    const avgHealth = plots.length ? Math.round(plots.reduce((s,p)=>s+(p.health||50),0)/plots.length) : 0;
    const issues = healthImages.filter(h => h.severity === "critical" || h.severity === "high").length;

    return (
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
          <div>
            <h2 style={{ fontSize:22, fontWeight:700, color:T.text, fontFamily:T.display }}>Health Monitoring</h2>
            <p style={{ fontSize:13, color:T.textMuted, marginTop:4 }}>{healthImages.length} reports · {issues} critical/high issues</p>
          </div>
          <Btn icon="plus" onClick={()=>setShowAdd(true)}>Log Report</Btn>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:12, marginBottom:20 }}>
          <StatCard label="Avg Health Score" value={`${avgHealth}%`} icon="heart" color={avgHealth>75?T.green:avgHealth>50?T.amber:T.red} />
          <StatCard label="Total Reports" value={healthImages.length} icon="camera" color={T.blue} />
          <StatCard label="Active Issues" value={issues} icon="alert" color={T.red} />
          <StatCard label="Plots Monitored" value={plots.length} icon="target" color={T.violet} />
        </div>

        {/* Per-Plot Health Summary */}
        <div style={{ fontSize:11, color:T.textMuted, fontFamily:T.mono, letterSpacing:1, marginBottom:10, fontWeight:700 }}>PLOT HEALTH SUMMARY</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:10, marginBottom:20 }}>
          {plots.map(p => (
            <Card key={p.id} pad={14}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <div style={{ width:10, height:10, borderRadius:3, background:p.color||T.green }} />
                <span style={{ fontSize:13, fontWeight:700, color:T.text }}>{p.name}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:11, color:T.textMuted }}>Health Score</span>
                <span style={{ fontSize:14, fontWeight:800, fontFamily:T.mono,
                  color:(p.health||50)>80?T.green:(p.health||50)>60?T.amber:T.red }}>{p.health||50}%</span>
              </div>
              <Progress value={p.health||50} color={(p.health||50)>80?T.green:(p.health||50)>60?T.amber:T.red} />
            </Card>
          ))}
        </div>

        {/* Health Reports */}
        <div style={{ fontSize:11, color:T.textMuted, fontFamily:T.mono, letterSpacing:1, marginBottom:10, fontWeight:700 }}>HEALTH REPORTS</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {healthImages.map(h => {
            const plot = plots.find(p => p.id === h.plot);
            return (
              <Card key={h.id} pad={14}>
                <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:(severityC[h.severity]||T.textMuted)+"18",
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <I n="activity" s={16} c={severityC[h.severity]||T.textMuted} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", gap:8, flexWrap:"wrap" }}>
                      <span style={{ fontSize:13, fontWeight:700, color:T.text }}>{plot?.name || "Unknown"} — {h.issue || "General Check"}</span>
                      <Badge text={h.severity} color={severityC[h.severity]} small />
                    </div>
                    <div style={{ fontSize:11, color:T.textMuted, marginTop:3 }}>
                      Date: {h.date} {h.ndvi ? `· NDVI: ${h.ndvi}` : ""}
                    </div>
                    {h.notes && <div style={{ fontSize:11, color:T.textDim, marginTop:4 }}>{h.notes}</div>}
                  </div>
                </div>
              </Card>
            );
          })}
          {healthImages.length === 0 && <EmptyState icon="activity" text="No health reports yet. Log plant observations to track crop health." />}
        </div>

        <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Log Health Report">
          <Input label="PLOT" value={form.plot} onChange={v=>setForm(f=>({...f,plot:v}))}
            options={[{value:"",label:"Select plot"}, ...plots.map(p=>({value:p.id,label:p.name}))]} />
          <Input label="ISSUE / OBSERVATION" value={form.issue} onChange={v=>setForm(f=>({...f,issue:v}))} placeholder="e.g. Leaf curl, yellowing, pest damage" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="SEVERITY" value={form.severity} onChange={v=>setForm(f=>({...f,severity:v}))} options={["low","medium","high","critical"]} />
            <Input label="NDVI SCORE (0-1)" value={form.ndvi} onChange={v=>setForm(f=>({...f,ndvi:v}))} type="number" placeholder="0.65" />
          </div>
          <Input label="DATE" value={form.date} onChange={v=>setForm(f=>({...f,date:v}))} type="date" />
          <Input label="IMAGE URL (optional)" value={form.imageUrl} onChange={v=>setForm(f=>({...f,imageUrl:v}))} placeholder="https://..." />
          <Input label="NOTES" value={form.notes} onChange={v=>setForm(f=>({...f,notes:v}))} textarea placeholder="Describe what you observed..." />
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn variant="secondary" onClick={()=>setShowAdd(false)} full>Cancel</Btn>
            <Btn onClick={doAdd} full loading={saving}>Log Report</Btn>
          </div>
        </Modal>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  //  MODULE: WEATHER & ENVIRONMENT
  // ═══════════════════════════════════════════════════════════════
  const renderWeather = () => {
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ type:"frost", severity:"medium", message:"", affectedPlots:"", date: new Date().toISOString().split("T")[0] });
    const [saving, setSaving] = useState(false);

    const doAddAlert = async () => {
      if (!form.message) return; setSaving(true);
      await addWeatherAlert(user.uid, { ...form, createdAt: new Date().toISOString(), dismissed: false });
      setForm({ type:"frost", severity:"medium", message:"", affectedPlots:"", date: new Date().toISOString().split("T")[0] });
      setShowAdd(false); setSaving(false); showToast("Alert added");
    };

    const alertTypeC = { frost: T.blue, rain: T.blueDim, pest: T.pink, heat: "#F97316", wind: T.violet, general: T.textMuted };
    const alertIcons = { frost: "cloud", rain: "drop", pest: "heart", heat: "sun", wind: "cloud", general: "alert" };

    // Simulated weather data (in production this would come from a weather API)
    const weatherData = {
      temp: 28, humidity: 65, windSpeed: 12, rainfall: 0,
      forecast: [
        { day: "Today", high: 32, low: 22, condition: "Sunny", icon: "sun" },
        { day: "Tomorrow", high: 30, low: 21, condition: "Partly Cloudy", icon: "cloud" },
        { day: "Sat", high: 27, low: 19, condition: "Rain Expected", icon: "drop" },
        { day: "Sun", high: 29, low: 20, condition: "Clear", icon: "sun" },
      ]
    };

    return (
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
          <div>
            <h2 style={{ fontSize:22, fontWeight:700, color:T.text, fontFamily:T.display }}>Weather & Environment</h2>
            <p style={{ fontSize:13, color:T.textMuted, marginTop:4 }}>Hyper-local conditions · {weatherAlerts.length} active alerts</p>
          </div>
          <Btn icon="plus" onClick={()=>setShowAdd(true)}>Add Alert</Btn>
        </div>

        {/* Current Conditions */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:12, marginBottom:20 }}>
          <StatCard label="Temperature" value={`${weatherData.temp}°C`} icon="sun" color="#F97316" />
          <StatCard label="Humidity" value={`${weatherData.humidity}%`} icon="drop" color={T.blue} />
          <StatCard label="Wind Speed" value={`${weatherData.windSpeed} km/h`} icon="cloud" color={T.violet} />
          <StatCard label="Rainfall Today" value={`${weatherData.rainfall} mm`} icon="drop" color={T.teal} />
        </div>

        {/* 4-Day Forecast */}
        <div style={{ fontSize:11, color:T.textMuted, fontFamily:T.mono, letterSpacing:1, marginBottom:10, fontWeight:700 }}>4-DAY FORECAST</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(150px, 1fr))", gap:10, marginBottom:20 }}>
          {weatherData.forecast.map((f, i) => (
            <Card key={i} pad={14} style={{ textAlign:"center" }}>
              <div style={{ fontSize:12, fontWeight:700, color:T.text, marginBottom:6 }}>{f.day}</div>
              <I n={f.icon} s={24} c={f.icon==="sun"?"#F97316":T.blue} />
              <div style={{ fontSize:11, color:T.textMuted, marginTop:6 }}>{f.condition}</div>
              <div style={{ fontSize:13, fontFamily:T.mono, marginTop:4 }}>
                <span style={{ color:T.red, fontWeight:700 }}>{f.high}°</span>
                <span style={{ color:T.textDim }}> / </span>
                <span style={{ color:T.blue, fontWeight:700 }}>{f.low}°</span>
              </div>
            </Card>
          ))}
        </div>

        <p style={{ fontSize:11, color:T.textDim, marginBottom:16, fontStyle:"italic" }}>
          Weather data is simulated. Connect a weather API (OpenWeatherMap, Visual Crossing) for real hyper-local data.
        </p>

        {/* Risk Alerts */}
        <div style={{ fontSize:11, color:T.textMuted, fontFamily:T.mono, letterSpacing:1, marginBottom:10, fontWeight:700 }}>RISK ALERTS</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {weatherAlerts.map(a => (
            <Card key={a.id} pad={14}>
              <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                <div style={{ width:36, height:36, borderRadius:8, background:(alertTypeC[a.type]||T.textMuted)+"18",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <I n={alertIcons[a.type]||"alert"} s={16} c={alertTypeC[a.type]||T.textMuted} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", gap:8, flexWrap:"wrap" }}>
                    <span style={{ fontSize:13, fontWeight:700, color:T.text, textTransform:"capitalize" }}>{a.type} Alert</span>
                    <Badge text={a.severity} color={a.severity==="high"||a.severity==="critical"?T.red:T.amber} small />
                  </div>
                  <div style={{ fontSize:12, color:T.textSec, marginTop:3 }}>{a.message}</div>
                  <div style={{ fontSize:11, color:T.textMuted, marginTop:3 }}>Date: {a.date} {a.affectedPlots ? `· Plots: ${a.affectedPlots}` : ""}</div>
                </div>
              </div>
            </Card>
          ))}
          {weatherAlerts.length === 0 && <EmptyState icon="cloud" text="No active weather alerts. Add alerts manually or connect a weather API." />}
        </div>

        <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add Weather/Risk Alert">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="ALERT TYPE" value={form.type} onChange={v=>setForm(f=>({...f,type:v}))} options={["frost","rain","pest","heat","wind","general"]} />
            <Input label="SEVERITY" value={form.severity} onChange={v=>setForm(f=>({...f,severity:v}))} options={["low","medium","high","critical"]} />
          </div>
          <Input label="MESSAGE" value={form.message} onChange={v=>setForm(f=>({...f,message:v}))} textarea placeholder="Describe the risk or condition..." />
          <Input label="AFFECTED PLOTS (optional)" value={form.affectedPlots} onChange={v=>setForm(f=>({...f,affectedPlots:v}))} placeholder="e.g. North Field, Greenhouse A" />
          <Input label="DATE" value={form.date} onChange={v=>setForm(f=>({...f,date:v}))} type="date" />
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn variant="secondary" onClick={()=>setShowAdd(false)} full>Cancel</Btn>
            <Btn onClick={doAddAlert} full loading={saving}>Add Alert</Btn>
          </div>
        </Modal>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  //  MODULE: FINANCIALS (Enhanced with P&L per plot)
  // ═══════════════════════════════════════════════════════════════
  const renderFinance = () => {
    const [showAddExp, setShowAddExp] = useState(false);
    const [showAddRev, setShowAddRev] = useState(false);
    const [expForm, setExpForm] = useState({ amount:"", cat:"Labor", desc:"", date: new Date().toISOString().split("T")[0] });
    const [revForm, setRevForm] = useState({ qty:"", price:"", crop:"", buyer:"", date: new Date().toISOString().split("T")[0], notes:"" });
    const [saving, setSaving] = useState(false);

    const doAddExp = async () => {
      if (!expForm.amount) return; setSaving(true);
      await handleAddExpense({ amount: parseFloat(expForm.amount), cat: expForm.cat, desc: expForm.desc, date: expForm.date });
      setExpForm({ amount:"", cat:"Labor", desc:"", date: new Date().toISOString().split("T")[0] });
      setShowAddExp(false); setSaving(false);
    };
    const doAddRev = async () => {
      if (!revForm.qty || !revForm.price) return; setSaving(true);
      await handleAddRevenue({ qty: parseFloat(revForm.qty), price: parseFloat(revForm.price), crop: revForm.crop, buyer: revForm.buyer, date: revForm.date, notes: revForm.notes });
      setRevForm({ qty:"", price:"", crop:"", buyer:"", date: new Date().toISOString().split("T")[0], notes:"" });
      setShowAddRev(false); setSaving(false);
    };

    const catExp = {}; expenses.forEach(e => { catExp[e.cat||"Other"] = (catExp[e.cat||"Other"]||0) + (e.amount||0); });
    const maxCat = Math.max(...Object.values(catExp), 1);
    const laborCost = workers.filter(w=>w.status==="active").reduce((s,w)=>s+(w.dailyWage||0),0) * 30;

    return (
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
          <h2 style={{ fontSize:22, fontWeight:700, color:T.text, fontFamily:T.display }}>Financial Intelligence</h2>
          <div style={{ display:"flex", gap:8 }}>
            <Btn icon="plus" onClick={()=>setShowAddExp(true)} variant="secondary">Add Expense</Btn>
            <Btn icon="plus" onClick={()=>setShowAddRev(true)}>Add Revenue</Btn>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:12, marginBottom:20 }}>
          <StatCard label="Revenue" value={`₹${(totalRevenue/1000).toFixed(1)}K`} icon="bar" color={T.green} />
          <StatCard label="Expenses" value={`₹${(totalExpenses/1000).toFixed(1)}K`} icon="dollar" color={T.red} />
          <StatCard label="Net P&L" value={`₹${((totalRevenue-totalExpenses)/1000).toFixed(1)}K`} icon="target" color={totalRevenue>=totalExpenses?T.green:T.red} />
          <StatCard label="Est. Monthly Labor" value={`₹${(laborCost/1000).toFixed(1)}K`} icon="users" color={T.blue} sub={`${workers.filter(w=>w.status==="active").length} workers`} />
        </div>

        {/* Expense Breakdown */}
        {Object.keys(catExp).length > 0 && (
          <Card style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, color:T.textMuted, fontFamily:T.mono, letterSpacing:1, marginBottom:14, fontWeight:700 }}>EXPENSE BREAKDOWN</div>
            {Object.entries(catExp).sort((a,b)=>b[1]-a[1]).map(([cat,amt]) => (
              <div key={cat} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:12, color:T.text }}>{cat}</span>
                  <span style={{ fontSize:12, fontWeight:700, fontFamily:T.mono, color:T.textSec }}>₹{amt.toLocaleString()}</span>
                </div>
                <Progress value={amt} max={maxCat} color={T.amber} h={5} />
              </div>
            ))}
          </Card>
        )}

        {/* Recent Revenue */}
        {revenue.length > 0 && (
          <Card>
            <div style={{ fontSize:11, color:T.textMuted, fontFamily:T.mono, letterSpacing:1, marginBottom:14, fontWeight:700 }}>RECENT REVENUE</div>
            {revenue.map(r => (
              <div key={r.id} style={{ display:"flex", justifyContent:"space-between", paddingBottom:10, marginBottom:10, borderBottom:`1px solid ${T.border}` }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{r.crop || "Produce"} — {r.buyer || "Direct Sale"}</div>
                  <div style={{ fontSize:11, color:T.textMuted }}>{r.qty} units × ₹{r.price} · {r.date}</div>
                </div>
                <div style={{ fontSize:14, fontWeight:800, fontFamily:T.mono, color:T.green }}>₹{((r.qty||0)*(r.price||0)).toLocaleString()}</div>
              </div>
            ))}
          </Card>
        )}

        {/* Add Expense Modal */}
        <Modal open={showAddExp} onClose={()=>setShowAddExp(false)} title="Record Expense">
          <Input label="AMOUNT (₹)" value={expForm.amount} onChange={v=>setExpForm(f=>({...f,amount:v}))} type="number" placeholder="5000" />
          <Input label="CATEGORY" value={expForm.cat} onChange={v=>setExpForm(f=>({...f,cat:v}))}
            options={["Labor","Fertilizer","Pesticide","Seed","Equipment","Fuel","Transport","Other"]} />
          <Input label="DESCRIPTION" value={expForm.desc} onChange={v=>setExpForm(f=>({...f,desc:v}))} placeholder="What was this for?" />
          <Input label="DATE" value={expForm.date} onChange={v=>setExpForm(f=>({...f,date:v}))} type="date" />
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn variant="secondary" onClick={()=>setShowAddExp(false)} full>Cancel</Btn>
            <Btn onClick={doAddExp} full loading={saving}>Record Expense</Btn>
          </div>
        </Modal>

        {/* Add Revenue Modal */}
        <Modal open={showAddRev} onClose={()=>setShowAddRev(false)} title="Record Revenue">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="QUANTITY" value={revForm.qty} onChange={v=>setRevForm(f=>({...f,qty:v}))} type="number" placeholder="100" />
            <Input label="PRICE PER UNIT (₹)" value={revForm.price} onChange={v=>setRevForm(f=>({...f,price:v}))} type="number" placeholder="45" />
          </div>
          <Input label="CROP" value={revForm.crop} onChange={v=>setRevForm(f=>({...f,crop:v}))} placeholder="e.g. Tomato" />
          <Input label="BUYER" value={revForm.buyer} onChange={v=>setRevForm(f=>({...f,buyer:v}))} placeholder="e.g. Mandi Trader" />
          <Input label="DATE" value={revForm.date} onChange={v=>setRevForm(f=>({...f,date:v}))} type="date" />
          <Input label="NOTES" value={revForm.notes} onChange={v=>setRevForm(f=>({...f,notes:v}))} textarea placeholder="Additional details..." />
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn variant="secondary" onClick={()=>setShowAddRev(false)} full>Cancel</Btn>
            <Btn onClick={doAddRev} full loading={saving}>Record Revenue</Btn>
          </div>
        </Modal>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  //  MODULE: SETTINGS (Admin only)
  // ═══════════════════════════════════════════════════════════════
  const renderSettings = () => {
    const [farmName, setFarmName] = useState(profile?.farm || "");
    const [userName, setUserName] = useState(profile?.name || "");
    const [saving, setSaving] = useState(false);

    const saveProfile = async () => {
      setSaving(true);
      await updateUserProfile(user.uid, { farm: farmName, name: userName });
      setProfile(p => ({ ...p, farm: farmName, name: userName }));
      showToast("Settings saved");
      setSaving(false);
    };

    return (
      <div>
        <h2 style={{ fontSize:22, fontWeight:700, color:T.text, fontFamily:T.display, marginBottom:20 }}>Settings</h2>

        <Card style={{ marginBottom:20, maxWidth:500 }}>
          <div style={{ fontSize:11, color:T.textMuted, fontFamily:T.mono, letterSpacing:1, marginBottom:14, fontWeight:700 }}>FARM PROFILE</div>
          <Input label="FARM NAME" value={farmName} onChange={setFarmName} placeholder="My Farm" />
          <Input label="YOUR NAME" value={userName} onChange={setUserName} placeholder="Farm Owner" />
          <div style={{ fontSize:11, color:T.textMuted, marginBottom:14 }}>
            Phone: {user?.phoneNumber} · Role: <Badge text={role} color={T.green} small /> · UID: {user?.uid?.slice(0,12)}...
          </div>
          <Btn onClick={saveProfile} loading={saving}>Save Changes</Btn>
        </Card>

        <Card style={{ maxWidth:500 }}>
          <div style={{ fontSize:11, color:T.textMuted, fontFamily:T.mono, letterSpacing:1, marginBottom:14, fontWeight:700 }}>USER ACCESS CONTROL (RBAC)</div>
          <div style={{ fontSize:12, color:T.textSec, lineHeight:1.8 }}>
            <div style={{ marginBottom:8 }}>
              <Badge text="Admin" color={T.green} small /> Full access — financials, land, users, all settings
            </div>
            <div style={{ marginBottom:8 }}>
              <Badge text="Manager" color={T.blue} small /> Operations — tasks, inventory, workers, reports (no financials)
            </div>
            <div>
              <Badge text="Worker" color={T.amber} small /> Simple mobile view — assigned tasks, image uploads, attendance
            </div>
          </div>
          <p style={{ fontSize:11, color:T.textDim, marginTop:14 }}>
            To change a user's role, update their profile document in the Firestore "users" collection.
          </p>
        </Card>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  //  MODULE: WORKER HOME (simplified mobile view for workers)
  // ═══════════════════════════════════════════════════════════════
  const renderWorkerHome = () => {
    const myName = profile?.name || "";
    const myTasks = tasks.filter(t => t.worker === myName);
    const pending = myTasks.filter(t => t.status === "pending");
    const inProgress = myTasks.filter(t => t.status === "in_progress");
    const completed = myTasks.filter(t => t.status === "completed");

    return (
      <div>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ width:56, height:56, borderRadius:"50%", background:T.greenDark,
            display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", fontSize:22, fontWeight:800, color:T.green }}>
            {myName?.[0] || "?"}
          </div>
          <h2 style={{ fontSize:20, fontWeight:700, color:T.text, fontFamily:T.display }}>Hello, {myName || "Worker"}</h2>
          <p style={{ fontSize:13, color:T.textMuted }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:20 }}>
          <Card pad={12} style={{ textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:800, fontFamily:T.mono, color:T.amber }}>{pending.length}</div>
            <div style={{ fontSize:10, color:T.textMuted, marginTop:2 }}>PENDING</div>
          </Card>
          <Card pad={12} style={{ textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:800, fontFamily:T.mono, color:T.blue }}>{inProgress.length}</div>
            <div style={{ fontSize:10, color:T.textMuted, marginTop:2 }}>IN PROGRESS</div>
          </Card>
          <Card pad={12} style={{ textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:800, fontFamily:T.mono, color:T.green }}>{completed.length}</div>
            <div style={{ fontSize:10, color:T.textMuted, marginTop:2 }}>COMPLETED</div>
          </Card>
        </div>

        <div style={{ fontSize:11, color:T.textMuted, fontFamily:T.mono, letterSpacing:1, marginBottom:10, fontWeight:700 }}>YOUR TASKS</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {myTasks.filter(t=>t.status!=="completed").map(t => {
            const plot = plots.find(p => p.id === t.plot);
            return (
              <Card key={t.id} pad={14}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:T.text }}>{t.title}</span>
                  <Badge text={t.status?.replace("_"," ")} color={statusC[t.status]} small />
                </div>
                <div style={{ fontSize:11, color:T.textMuted, marginBottom:4 }}>{plot?.name} · Due: {t.due}</div>
                {t.desc && <div style={{ fontSize:11, color:T.textDim, marginBottom:8 }}>{t.desc}</div>}
                <div style={{ display:"flex", gap:6 }}>
                  {t.status==="pending" && <Btn small full onClick={()=>handleUpdateTask(t.id,{status:"in_progress"})}>Start Task</Btn>}
                  {t.status==="in_progress" && <Btn small full icon="check" onClick={()=>handleUpdateTask(t.id,{status:"completed"})}>Mark Complete</Btn>}
                </div>
              </Card>
            );
          })}
          {myTasks.filter(t=>t.status!=="completed").length === 0 && <EmptyState icon="check" text="All tasks completed! Great work." />}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  //  MODULE ROUTER
  // ═══════════════════════════════════════════════════════════════
  const renderModule = () => {
    switch(module) {
      case "plots": return renderPlots();
      case "tasks": return renderTasks();
      case "workers": return renderWorkers();
      case "inventory": return renderInventory();
      case "fertigation": return renderFertigation();
      case "health": return renderHealth();
      case "weather": return renderWeather();
      case "finance": return renderFinance();
      case "settings": return renderSettings();
      case "worker_home": return renderWorkerHome();
      default: return renderOverview();
    }
  };

  // ═══════════════════════════════════════════════════════════════
  //  APP SHELL
  // ═══════════════════════════════════════════════════════════════
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Fraunces:ital,wght@0,600;0,700;0,800;1,600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, select:focus, textarea:focus, button:focus { outline: none; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @media(max-width:768px) { .agro-side { display: none !important; } .agro-mobile-nav { display: flex !important; } }
      `}</style>

      {/* Sidebar — hidden for workers on mobile */}
      {role !== "worker" && (
        <div className="agro-side" style={{ width: 230, background: T.bg1, borderRight: `1px solid ${T.border}`,
          display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "20px 16px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${T.green}, ${T.greenDim})`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🌿</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>AgroSync</div>
                <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 1.5, textTransform: "uppercase" }}>
                  {profile?.farm || "Farm Management"}
                </div>
              </div>
            </div>
          </div>
          <div style={{ padding: "12px 8px", flex: 1, overflowY: "auto" }}>
            {NAV.map(n => {
              const active = module === n.id;
              return (
                <button key={n.id} onClick={() => setModule(n.id)}
                  style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px",
                    borderRadius: 8, border: "none", marginBottom: 2, cursor: "pointer", fontFamily: T.font, fontSize: 13,
                    fontWeight: active ? 700 : 500, transition: "all 0.15s",
                    background: active ? T.greenBg : "transparent", color: active ? T.green : T.textMuted }}>
                  <I n={n.icon} s={17} c={active ? T.green : T.textMuted} />{n.label}
                </button>
              );
            })}
          </div>
          <div style={{ padding: 12, borderTop: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.greenDark,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: T.green }}>
                {(profile?.name || "U")[0]}
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {profile?.name || user?.phoneNumber || "User"}
                </div>
                <div style={{ fontSize: 10, color: T.textMuted }}>{ROLES[role]?.label || role}</div>
              </div>
              <div onClick={handleLogout} style={{ cursor: "pointer", padding: 4 }} title="Logout">
                <I n="logout" s={16} c={T.textMuted} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, overflow: "auto", padding: role === "worker" ? "20px 16px" : "28px 32px", maxWidth: 1000 }}>
        {/* Worker header (no sidebar) */}
        {role === "worker" && (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:8, background:`linear-gradient(135deg, ${T.green}, ${T.greenDim})`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🌿</div>
              <span style={{ fontSize:15, fontWeight:800, color:T.text }}>AgroSync</span>
            </div>
            <Btn small variant="ghost" icon="logout" onClick={handleLogout}>Logout</Btn>
          </div>
        )}
        {renderModule()}
      </div>

      {/* Mobile Bottom Nav */}
      {role !== "worker" && (
        <div className="agro-mobile-nav" style={{ display:"none", position:"fixed", bottom:0, left:0, right:0, background:T.bg1,
          borderTop:`1px solid ${T.border}`, justifyContent:"space-around", padding:"8px 0", zIndex:100 }}>
          {NAV.slice(0, 5).map(n => {
            const active = module === n.id;
            return (
              <button key={n.id} onClick={()=>setModule(n.id)}
                style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, border:"none",
                  background:"transparent", cursor:"pointer", padding:"4px 8px" }}>
                <I n={n.icon} s={18} c={active?T.green:T.textMuted} />
                <span style={{ fontSize:9, color:active?T.green:T.textMuted, fontFamily:T.font }}>{n.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
