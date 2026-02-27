// ═══════════════════════════════════════════════════════════════
//  FIREBASE CONFIGURATION
//  
//  🔴 YOU MUST REPLACE THE VALUES BELOW WITH YOUR OWN
//  Follow the Firebase Setup Guide to get these values
// ═══════════════════════════════════════════════════════════════

import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, signOut } from "firebase/auth";
import {
  getFirestore, collection, doc, getDocs, getDoc, addDoc,
  updateDoc, deleteDoc, setDoc, query, where, orderBy, onSnapshot,
  serverTimestamp, Timestamp
} from "firebase/firestore";

// ┌──────────────────────────────────────────────────────────────┐
// │  PASTE YOUR FIREBASE CONFIG BELOW                            │
// │  (Get this from Firebase Console → Project Settings → Web)   │
// └──────────────────────────────────────────────────────────────┘
const firebaseConfig = {
  apiKey: "AIzaSyB2qoL8bfajZKG30MXHFsqV3NXvKlzDN-s",
  authDomain: "agrosync-farm.firebaseapp.com",
  projectId: "agrosync-farm",
  storageBucket: "agrosync-farm.firebasestorage.app",
  messagingSenderId: "424411748568",
  appId: "1:424411748568:web:642e0d748e0dd5d2549fad"
};

// ═══════════════════════════════════════════════════════════════
//  Initialize Firebase
// ═══════════════════════════════════════════════════════════════
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Set language for OTP SMS
auth.languageCode = 'en';

// ═══════════════════════════════════════════════════════════════
//  AUTH FUNCTIONS (Phone + OTP)
// ═══════════════════════════════════════════════════════════════

/**
 * Set up invisible reCAPTCHA on a button element.
 * Must be called ONCE before sending OTP.
 */
export function setupRecaptcha(buttonId) {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved — allow signInWithPhoneNumber
      },
      "expired-callback": () => {
        // Reset reCAPTCHA if it expires
        window.recaptchaVerifier = null;
      }
    });
  }
  return window.recaptchaVerifier;
}

/**
 * Send OTP to a phone number.
 * Phone must include country code: "+91XXXXXXXXXX"
 * Returns a confirmationResult used to verify the OTP.
 */
export async function sendOTP(phoneNumber) {
  try {
    const appVerifier = window.recaptchaVerifier;
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    // Store globally so verifyOTP can access it
    window.confirmationResult = confirmationResult;
    return { success: true };
  } catch (error) {
    console.error("OTP send error:", error);
    // Reset reCAPTCHA on failure so user can retry
    window.recaptchaVerifier = null;
    return { success: false, error: error.message };
  }
}

/**
 * Verify the OTP code entered by the user.
 * Returns the Firebase user object on success.
 */
export async function verifyOTP(otpCode) {
  try {
    const result = await window.confirmationResult.confirm(otpCode);
    return { success: true, user: result.user };
  } catch (error) {
    console.error("OTP verify error:", error);
    return { success: false, error: "Invalid OTP. Please try again." };
  }
}

/**
 * Sign out the current user.
 */
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

/**
 * Get the current authenticated user (or null).
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Listen for auth state changes.
 */
export function onAuthChange(callback) {
  return auth.onAuthStateChanged(callback);
}

// ═══════════════════════════════════════════════════════════════
//  FIRESTORE DATABASE FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// Helper: Get the farm ID for the current user (uses their UID)
function farmRef(userId) {
  return `farms/${userId}`;
}

// --- USER PROFILE ---

export async function createUserProfile(userId, data) {
  await setDoc(doc(db, "users", userId), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function getUserProfile(userId) {
  const snap = await getDoc(doc(db, "users", userId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUserProfile(userId, data) {
  await updateDoc(doc(db, "users", userId), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

// --- GENERIC COLLECTION HELPERS ---
// Each "module" stores data in: farms/{userId}/{collection}/{docId}

async function addToCollection(userId, collectionName, data) {
  const ref = collection(db, "farms", userId, collectionName);
  const docRef = await addDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
}

async function getAllFromCollection(userId, collectionName) {
  const ref = collection(db, "farms", userId, collectionName);
  const snap = await getDocs(ref);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function updateInCollection(userId, collectionName, docId, data) {
  const ref = doc(db, "farms", userId, collectionName, docId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

async function deleteFromCollection(userId, collectionName, docId) {
  const ref = doc(db, "farms", userId, collectionName, docId);
  await deleteDoc(ref);
}

function subscribeToCollection(userId, collectionName, callback) {
  const ref = collection(db, "farms", userId, collectionName);
  return onSnapshot(ref, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}

// --- PLOTS ---
export const addPlot = (userId, data) => addToCollection(userId, "plots", data);
export const getPlots = (userId) => getAllFromCollection(userId, "plots");
export const updatePlot = (userId, id, data) => updateInCollection(userId, "plots", id, data);
export const deletePlot = (userId, id) => deleteFromCollection(userId, "plots", id);
export const subscribePlots = (userId, cb) => subscribeToCollection(userId, "plots", cb);

// --- TASKS ---
export const addTask = (userId, data) => addToCollection(userId, "tasks", data);
export const getTasks = (userId) => getAllFromCollection(userId, "tasks");
export const updateTask = (userId, id, data) => updateInCollection(userId, "tasks", id, data);
export const deleteTask = (userId, id) => deleteFromCollection(userId, "tasks", id);
export const subscribeTasks = (userId, cb) => subscribeToCollection(userId, "tasks", cb);

// --- INVENTORY ---
export const addInventory = (userId, data) => addToCollection(userId, "inventory", data);
export const getInventory = (userId) => getAllFromCollection(userId, "inventory");
export const updateInventory = (userId, id, data) => updateInCollection(userId, "inventory", id, data);
export const deleteInventory = (userId, id) => deleteFromCollection(userId, "inventory", id);
export const subscribeInventory = (userId, cb) => subscribeToCollection(userId, "inventory", cb);

// --- EXPENSES ---
export const addExpense = (userId, data) => addToCollection(userId, "expenses", data);
export const getExpenses = (userId) => getAllFromCollection(userId, "expenses");
export const subscribeExpenses = (userId, cb) => subscribeToCollection(userId, "expenses", cb);

// --- REVENUE ---
export const addRevenue = (userId, data) => addToCollection(userId, "revenue", data);
export const getRevenue = (userId) => getAllFromCollection(userId, "revenue");
export const subscribeRevenue = (userId, cb) => subscribeToCollection(userId, "revenue", cb);

// --- FERTIGATION LOGS ---
export const addFertigationLog = (userId, data) => addToCollection(userId, "fertigation", data);
export const getFertigationLogs = (userId) => getAllFromCollection(userId, "fertigation");
export const subscribeFertigation = (userId, cb) => subscribeToCollection(userId, "fertigation", cb);

// --- HEALTH IMAGES ---
export const addHealthImage = (userId, data) => addToCollection(userId, "healthImages", data);
export const getHealthImages = (userId) => getAllFromCollection(userId, "healthImages");
export const subscribeHealthImages = (userId, cb) => subscribeToCollection(userId, "healthImages", cb);

// --- WORKERS ---
export const addWorker = (userId, data) => addToCollection(userId, "workers", data);
export const getWorkers = (userId) => getAllFromCollection(userId, "workers");
export const updateWorker = (userId, id, data) => updateInCollection(userId, "workers", id, data);
export const subscribeWorkers = (userId, cb) => subscribeToCollection(userId, "workers", cb);

// --- SEED DATA (first-time setup) ---
export async function seedInitialData(userId) {
  const existingPlots = await getPlots(userId);
  if (existingPlots.length > 0) return false; // Already has data

  // Add sample plots
  const plotIds = {};
  const samplePlots = [
    { name: "North Field", acreage: 5.2, crop: "Tomato (Hybrid-5)", stage: "Flowering", soil: "Black Cotton", ph: 6.8, irrigation: "Drip", health: 87, color: "#4ADE80" },
    { name: "East Terrace", acreage: 8.7, crop: "Rice (Basmati-370)", stage: "Vegetative", soil: "Loamy", ph: 7.1, irrigation: "Flood", health: 92, color: "#38BDF8" },
    { name: "Greenhouse A", acreage: 1.5, crop: "Bell Pepper", stage: "Fruiting", soil: "Sandy Loam", ph: 6.5, irrigation: "Drip", health: 78, color: "#F59E0B" },
  ];
  for (const p of samplePlots) {
    const id = await addPlot(userId, p);
    plotIds[p.name] = id;
  }

  // Add sample tasks
  const sampleTasks = [
    { title: "Apply Neem Oil Spray", plot: plotIds["Greenhouse A"], worker: "Raju K.", priority: "high", status: "pending", due: "2026-02-27", category: "ipm", desc: "Spray neem oil (2ml/L) on rows 1-4." },
    { title: "Drip Line Inspection", plot: plotIds["North Field"], worker: "Suresh M.", priority: "medium", status: "in_progress", due: "2026-02-26", category: "irrigation", desc: "Check emitters rows 10-20 for clogs." },
    { title: "Harvest Tomatoes Row 5-8", plot: plotIds["North Field"], worker: "Lakshmi P.", priority: "high", status: "pending", due: "2026-02-26", category: "harvesting", desc: "Harvest ripe tomatoes. Use green crates." },
  ];
  for (const t of sampleTasks) await addTask(userId, t);

  // Add sample inventory
  const sampleInventory = [
    { name: "Urea 46-0-0", cat: "Fertilizer", stock: 85, max: 200, unit: "kg", cost: 12, status: "ok" },
    { name: "NPK 19-19-19", cat: "Fertilizer", stock: 12, max: 100, unit: "kg", cost: 28, status: "critical" },
    { name: "Neem Oil", cat: "Pesticide", stock: 5, max: 20, unit: "L", cost: 380, status: "critical" },
    { name: "Drip Tape 16mm", cat: "Equipment", stock: 120, max: 500, unit: "m", cost: 8, status: "low" },
  ];
  for (const i of sampleInventory) await addInventory(userId, i);

  return true; // Data was seeded
}

// Export the raw instances for advanced usage
export { auth, db };
