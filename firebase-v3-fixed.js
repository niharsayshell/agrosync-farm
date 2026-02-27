// ═══════════════════════════════════════════════════════════════
//  FIREBASE CONFIGURATION — v3 (reCAPTCHA fix)
// ═══════════════════════════════════════════════════════════════

import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, signOut } from "firebase/auth";
import {
  getFirestore, collection, doc, getDocs, getDoc, addDoc,
  updateDoc, deleteDoc, setDoc, onSnapshot, serverTimestamp
} from "firebase/firestore";

// ┌──────────────────────────────────────────────────────────────┐
// │  PASTE YOUR FIREBASE CONFIG BELOW                            │
// │  Get from: Firebase Console → Project Settings → Web app     │
// └──────────────────────────────────────────────────────────────┘
const firebaseConfig = {
  apiKey:            "PASTE_YOUR_API_KEY_HERE",
  authDomain:        "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket:     "PASTE_YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "PASTE_YOUR_SENDER_ID_HERE",
  appId:             "PASTE_YOUR_APP_ID_HERE"
};

// Validate config
const configValid = !Object.values(firebaseConfig).some(v =>
  v.includes("PASTE_YOUR") || v === "" || v === undefined
);
if (!configValid) {
  console.error("🔴 FIREBASE CONFIG ERROR: Replace ALL placeholder values in src/firebase.js");
}

// Initialize
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  auth.languageCode = 'en';
  console.log("✅ Firebase initialized. Project:", firebaseConfig.projectId);
} catch (err) {
  console.error("🔴 Firebase init FAILED:", err.message);
}

// ═══════════════════════════════════════════════════════════════
//  AUTH — FIXED reCAPTCHA APPROACH
//  
//  The fix: We use a CONTAINER DIV (not a button) for reCAPTCHA.
//  The div must exist in the DOM before calling this function.
//  In App.jsx, we render: <div id="recaptcha-box"></div>
// ═══════════════════════════════════════════════════════════════

/**
 * Set up invisible reCAPTCHA on a container div.
 * The div with this ID must exist in the page.
 */
export function setupRecaptcha() {
  console.log("🔧 Setting up reCAPTCHA...");

  // Clean up old verifier if exists
  if (window.recaptchaVerifier) {
    try { window.recaptchaVerifier.clear(); } catch (e) {}
    window.recaptchaVerifier = null;
  }

  // Make sure the container div exists
  let container = document.getElementById("recaptcha-box");
  if (!container) {
    console.log("🔧 Creating reCAPTCHA container div");
    container = document.createElement("div");
    container.id = "recaptcha-box";
    document.body.appendChild(container);
  }

  try {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-box", {
      size: "invisible",
      callback: () => {
        console.log("✅ reCAPTCHA solved");
      },
      "expired-callback": () => {
        console.log("⚠️ reCAPTCHA expired");
        window.recaptchaVerifier = null;
      }
    });

    // Render the reCAPTCHA widget (required for invisible mode)
    window.recaptchaVerifier.render().then((widgetId) => {
      console.log("✅ reCAPTCHA rendered. Widget ID:", widgetId);
      window.recaptchaWidgetId = widgetId;
    }).catch((err) => {
      console.error("🔴 reCAPTCHA render failed:", err.message);
    });

    return window.recaptchaVerifier;
  } catch (err) {
    console.error("🔴 reCAPTCHA setup failed:", err.message);
    window.recaptchaVerifier = null;
    return null;
  }
}

/**
 * Send OTP to phone number. Format: "+919876543210"
 */
export async function sendOTP(phoneNumber) {
  console.log("📱 Sending OTP to:", phoneNumber);

  if (!configValid) {
    return { success: false, error: "Firebase config not set. Edit src/firebase.js." };
  }
  if (!auth) {
    return { success: false, error: "Firebase Auth not initialized." };
  }

  // Set up reCAPTCHA if not already done
  if (!window.recaptchaVerifier) {
    setupRecaptcha();
    // Give it a moment to render
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (!window.recaptchaVerifier) {
    return { success: false, error: "reCAPTCHA failed to initialize. Please refresh and try again." };
  }

  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
    window.confirmationResult = confirmationResult;
    console.log("✅ OTP sent successfully!");
    return { success: true };
  } catch (error) {
    console.error("🔴 OTP failed:", error.code, error.message);

    // Reset reCAPTCHA for retry
    try { window.recaptchaVerifier.clear(); } catch(e) {}
    window.recaptchaVerifier = null;

    const messages = {
      "auth/invalid-phone-number": "Invalid phone number. Use format: +919876543210",
      "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
      "auth/quota-exceeded": "SMS quota exceeded for today. Try again tomorrow.",
      "auth/unauthorized-domain": "Domain not authorized. Add your domain in Firebase Console → Auth → Settings → Authorized domains.",
      "auth/captcha-check-failed": "reCAPTCHA failed. Refresh the page and try again.",
      "auth/invalid-api-key": "Invalid Firebase API key. Check your config.",
      "auth/network-request-failed": "Network error. Check your internet connection.",
    };
    return { success: false, error: messages[error.code] || `Error (${error.code}): ${error.message}` };
  }
}

/**
 * Verify OTP code.
 */
export async function verifyOTP(otpCode) {
  console.log("🔑 Verifying OTP...");
  if (!window.confirmationResult) {
    return { success: false, error: "No OTP was sent. Please request a new code." };
  }
  try {
    const result = await window.confirmationResult.confirm(otpCode);
    console.log("✅ OTP verified! UID:", result.user.uid);
    return { success: true, user: result.user };
  } catch (error) {
    console.error("🔴 OTP verify failed:", error.code);
    const messages = {
      "auth/invalid-verification-code": "Incorrect code. Please check and try again.",
      "auth/code-expired": "Code expired. Please request a new OTP.",
    };
    return { success: false, error: messages[error.code] || "Invalid OTP. Please try again." };
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
    window.recaptchaVerifier = null;
    window.confirmationResult = null;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function onAuthChange(callback) {
  return auth.onAuthStateChanged(callback);
}

// ═══════════════════════════════════════════════════════════════
//  FIRESTORE DATABASE FUNCTIONS (unchanged)
// ═══════════════════════════════════════════════════════════════

export async function createUserProfile(userId, data) {
  await setDoc(doc(db, "users", userId), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}
export async function getUserProfile(userId) {
  const snap = await getDoc(doc(db, "users", userId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
export async function updateUserProfile(userId, data) {
  await updateDoc(doc(db, "users", userId), { ...data, updatedAt: serverTimestamp() });
}

async function addToCollection(userId, collName, data) {
  const ref = collection(db, "farms", userId, collName);
  const docRef = await addDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return docRef.id;
}
async function getAllFromCollection(userId, collName) {
  const snap = await getDocs(collection(db, "farms", userId, collName));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
async function updateInCollection(userId, collName, docId, data) {
  await updateDoc(doc(db, "farms", userId, collName, docId), { ...data, updatedAt: serverTimestamp() });
}
async function deleteFromCollection(userId, collName, docId) {
  await deleteDoc(doc(db, "farms", userId, collName, docId));
}
function subscribeToCollection(userId, collName, callback) {
  return onSnapshot(collection(db, "farms", userId, collName), (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (err) => { console.error(`🔴 Firestore error (${collName}):`, err.message); });
}

export const addPlot = (uid, d) => addToCollection(uid, "plots", d);
export const getPlots = (uid) => getAllFromCollection(uid, "plots");
export const updatePlot = (uid, id, d) => updateInCollection(uid, "plots", id, d);
export const deletePlot = (uid, id) => deleteFromCollection(uid, "plots", id);
export const subscribePlots = (uid, cb) => subscribeToCollection(uid, "plots", cb);

export const addTask = (uid, d) => addToCollection(uid, "tasks", d);
export const getTasks = (uid) => getAllFromCollection(uid, "tasks");
export const updateTask = (uid, id, d) => updateInCollection(uid, "tasks", id, d);
export const deleteTask = (uid, id) => deleteFromCollection(uid, "tasks", id);
export const subscribeTasks = (uid, cb) => subscribeToCollection(uid, "tasks", cb);

export const addInventory = (uid, d) => addToCollection(uid, "inventory", d);
export const getInventory = (uid) => getAllFromCollection(uid, "inventory");
export const updateInventory = (uid, id, d) => updateInCollection(uid, "inventory", id, d);
export const deleteInventory = (uid, id) => deleteFromCollection(uid, "inventory", id);
export const subscribeInventory = (uid, cb) => subscribeToCollection(uid, "inventory", cb);

export const addExpense = (uid, d) => addToCollection(uid, "expenses", d);
export const getExpenses = (uid) => getAllFromCollection(uid, "expenses");
export const subscribeExpenses = (uid, cb) => subscribeToCollection(uid, "expenses", cb);

export const addRevenue = (uid, d) => addToCollection(uid, "revenue", d);
export const getRevenue = (uid) => getAllFromCollection(uid, "revenue");
export const subscribeRevenue = (uid, cb) => subscribeToCollection(uid, "revenue", cb);

export const addFertigationLog = (uid, d) => addToCollection(uid, "fertigation", d);
export const subscribeFertigation = (uid, cb) => subscribeToCollection(uid, "fertigation", cb);

export const addHealthImage = (uid, d) => addToCollection(uid, "healthImages", d);
export const subscribeHealthImages = (uid, cb) => subscribeToCollection(uid, "healthImages", cb);

export const addWorker = (uid, d) => addToCollection(uid, "workers", d);
export const getWorkers = (uid) => getAllFromCollection(uid, "workers");
export const subscribeWorkers = (uid, cb) => subscribeToCollection(uid, "workers", cb);

export async function seedInitialData(userId) {
  const existing = await getPlots(userId);
  if (existing.length > 0) return false;
  console.log("🌱 Seeding initial data...");
  const plots = [
    { name: "North Field", acreage: 5.2, crop: "Tomato (Hybrid-5)", stage: "Flowering", soil: "Black Cotton", ph: 6.8, irrigation: "Drip", health: 87, color: "#4ADE80" },
    { name: "East Terrace", acreage: 8.7, crop: "Rice (Basmati-370)", stage: "Vegetative", soil: "Loamy", ph: 7.1, irrigation: "Flood", health: 92, color: "#38BDF8" },
    { name: "Greenhouse A", acreage: 1.5, crop: "Bell Pepper", stage: "Fruiting", soil: "Sandy Loam", ph: 6.5, irrigation: "Drip", health: 78, color: "#F59E0B" },
  ];
  const pIds = {};
  for (const p of plots) { pIds[p.name] = await addPlot(userId, p); }
  const tasks = [
    { title: "Apply Neem Oil Spray", plot: pIds["Greenhouse A"], worker: "Raju K.", priority: "high", status: "pending", due: "2026-02-27", category: "ipm", desc: "Spray neem oil (2ml/L) on rows 1-4." },
    { title: "Drip Line Inspection", plot: pIds["North Field"], worker: "Suresh M.", priority: "medium", status: "in_progress", due: "2026-02-26", category: "irrigation", desc: "Check emitters rows 10-20." },
    { title: "Harvest Tomatoes", plot: pIds["North Field"], worker: "Lakshmi P.", priority: "high", status: "pending", due: "2026-02-26", category: "harvesting", desc: "Harvest ripe tomatoes rows 5-8." },
  ];
  for (const t of tasks) { await addTask(userId, t); }
  const inv = [
    { name: "Urea 46-0-0", cat: "Fertilizer", stock: 85, max: 200, unit: "kg", cost: 12, status: "ok" },
    { name: "NPK 19-19-19", cat: "Fertilizer", stock: 12, max: 100, unit: "kg", cost: 28, status: "critical" },
    { name: "Neem Oil", cat: "Pesticide", stock: 5, max: 20, unit: "L", cost: 380, status: "critical" },
    { name: "Drip Tape 16mm", cat: "Equipment", stock: 120, max: 500, unit: "m", cost: 8, status: "low" },
  ];
  for (const i of inv) { await addInventory(userId, i); }
  console.log("✅ Data seeded");
  return true;
}

export { auth, db };
