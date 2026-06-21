const auth = window.firebaseAuth || null;
const db = window.firebaseDb || null;

// Kadibna code-kii hore...
let students = JSON.parse(localStorage.getItem("students")) || [];
let payments = JSON.parse(localStorage.getItem("payments")) || [];
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "prime-college-erp.firebaseapp.com",
  projectId: "prime-college-erp",
  storageBucket: "prime-college-erp.appspot.com",
  messagingSenderId: "608090500576",
  appId: "1:608090500576:web:536c03a82161ab480ecf85"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);/* ========================================
PRIME COLLEGE ERP - COMPLETE SYSTEM
======================================== */

// ✅ KU DAR TAN BILOWGA:
const auth = window.firebaseAuth;
const db = window.firebaseDb;

// Hadda variables-kii hore
let students = JSON.parse(localStorage.getItem("students")) || [];
let payments = JSON.parse(localStorage.getItem("payments")) || [];
// ... dhammaan code-kii hore/* ========================================
PRIME COLLEGE ERP v6.0 - ONLINE SYSTEM (FIREBASE)
======================================== */

// ========================================
// FIREBASE IMPORTS
// ========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  onSnapshot,
  setDoc,
  getDoc,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// ========================================
// FIREBASE CONFIGURATION
// ========================================
// ⚠️ IMPORTANT: Replace with YOUR Firebase config from console.firebase.google.com


// ========================================
// GLOBAL VARIABLES
// ========================================
let students = [];
let payments = [];
let results = [];
let archives = [];
let users = [];
let currentUser = null;
let editingUserIndex = null;
let unsubscribeListeners = [];

// ========================================
// TOAST NOTIFICATION SYSTEM
// ========================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) { alert(message); return; }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { success: 'check-circle', error: 'times-circle', warning: 'exclamation-triangle', info: 'info-circle' };
  toast.innerHTML = `<i class="fas fa-${icons[type]}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ========================================
// LOADING SCREEN
// ========================================
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
}

function showLoginPage() {
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('systemPage').style.display = 'none';
  hideLoadingScreen();
}

function showSystemPage() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('systemPage').style.display = 'flex';
  hideLoadingScreen();
}

// ========================================
// AUTHENTICATION - FIREBASE
// ========================================
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  
  if (!email || !password) {
    showToast("Enter email and password!", "warning");
    return;
  }
  
  try {
    // Show loading
    const loginBtn = document.getElementById("loginBtn");
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    
    // Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
    
    if (!userDoc.exists()) {
      await signOut(auth);
      showToast("User data not found!", "error");
      return;
    }
    
    const userData = userDoc.data();
    
    currentUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      username: userData.username,
      role: userData.role,
      permissions: userData.permissions || []
    };
    
    // Update UI
    document.getElementById("currentUserDisplay").innerText = currentUser.username;
    document.getElementById("dropdownUsername").innerText = currentUser.username;
    document.getElementById("currentRoleDisplay").innerText = currentUser.role;
    
    // Start real-time listeners
    startRealTimeListeners();
    
    applyPermissions(currentUser);
    showSystemPage();
    showToast(`Welcome back, ${currentUser.username}!`, "success");
    
  } catch (error) {
    console.error("Login error:", error);
    let errorMsg = "Login failed!";
    
    if (error.code === 'auth/user-not-found') errorMsg = "User not found!";
    else if (error.code === 'auth/wrong-password') errorMsg = "Wrong password!";
    else if (error.code === 'auth/invalid-email') errorMsg = "Invalid email!";
    else if (error.code === 'auth/too-many-requests') errorMsg = "Too many attempts. Try later!";
    
    showToast(errorMsg, "error");
  } finally {
    const loginBtn = document.getElementById("loginBtn");
    loginBtn.disabled = false;
    loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login to System';
  }
});

// ========================================
// AUTH STATE OBSERVER
// ========================================
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    // User is signed in - get user data
    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        currentUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: userData.username,
          role: userData.role,
          permissions: userData.permissions || []
        };
        
        document.getElementById("currentUserDisplay").innerText = currentUser.username;
        document.getElementById("dropdownUsername").innerText = currentUser.username;
        document.getElementById("currentRoleDisplay").innerText = currentUser.role;
        
        startRealTimeListeners();
        applyPermissions(currentUser);
        showSystemPage();
      } else {
        showLoginPage();
      }
    } catch (error) {
      console.error("Auth state error:", error);
      showLoginPage();
    }
  } else {
    // User is signed out
    showLoginPage();
  }
});

// ========================================
// REAL-TIME LISTENERS (FIRESTORE)
// ========================================
function startRealTimeListeners() {
  // Clean up old listeners
  unsubscribeListeners.forEach(unsub => unsub());
  unsubscribeListeners = [];
  
  // Students listener
  const unsubStudents = onSnapshot(collection(db, "students"), (snapshot) => {
    students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    loadStudentsTable();
    updateDashboard();
  });
  unsubscribeListeners.push(unsubStudents);
  
  // Payments listener
  const unsubPayments = onSnapshot(collection(db, "payments"), (snapshot) => {
    payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    loadFinanceTable();
    updateDashboard();
  });
  unsubscribeListeners.push(unsubPayments);
  
  // Results listener
  const unsubResults = onSnapshot(collection(db, "results"), (snapshot) => {
    results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    loadResultsAll();
    updateDashboard();
  });
  unsubscribeListeners.push(unsubResults);
  
  // Archives listener
  const unsubArchives = onSnapshot(collection(db, "archives"), (snapshot) => {
    archives = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    loadArchives();
  });
  unsubscribeListeners.push(unsubArchives);
  
  // Users listener
  const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
    users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    loadUsersTable();
  });
  unsubscribeListeners.push(unsubUsers);
}

// ========================================
// PERMISSIONS
// ========================================
function applyPermissions(user) {
  document.querySelectorAll(".sidebar-menu button").forEach(btn => {
    btn.classList.remove("disabled");
    btn.style.opacity = "1";
    btn.style.pointerEvents = "auto";
  });
  
  if (user.permissions && user.role !== 'principal') {
    const allSections = ['dashboard','registration','examination','published','finance','portal','reports','archive','users','about','settings'];
    allSections.forEach(section => {
      if (!user.permissions.includes(section)) {
        const el = document.getElementById('nav-' + section);
        if (el) { el.style.opacity = "0.4"; el.style.pointerEvents = "none"; }
      }
    });
  }
}

// ========================================
// NAVIGATION
// ========================================
function showSection(id) {
  const navBtn = document.getElementById("nav-" + id);
  if (navBtn && navBtn.style.pointerEvents === "none") {
    showToast("You do not have permission!", "error");
    return;
  }
  
  document.querySelectorAll(".page-section").forEach(s => s.style.display = "none");
  document.getElementById(id).style.display = "block";
  document.querySelectorAll(".sidebar-menu button").forEach(b => b.classList.remove("active"));
  if (navBtn) navBtn.classList.add("active");
  
  document.getElementById("userDropdown").classList.remove("show");
  
  const titles = {
    dashboard: ["Dashboard", "Overview of college activities"],
    registration: ["Registration Office", "Manage student registrations"],
    finance: ["Finance Office", "Manage payments and finances"],
    examination: ["Examination Office", "Manage exam results"],
    published: ["Published Results", "View all published results"],
    portal: ["Student Portal", "Student result portal"],
    reports: ["Reports Center", "Generate and view reports"],
    archive: ["Archive System", "Archive academic records"],
    users: ["User Management", "Manage system users"],
    about: ["About", "System information"],
    settings: ["Settings", "System configuration"]
  };
  
  if (titles[id]) {
    document.getElementById("pageTitle").innerText = titles[id][0];
    document.getElementById("pageSubtitle").innerText = titles[id][1];
  }
}

async function logout() {
  try {
    await signOut(auth);
    currentUser = null;
    unsubscribeListeners.forEach(unsub => unsub());
    unsubscribeListeners = [];
    showToast("Logged out successfully!", "success");
    location.reload();
  } catch (error) {
    console.error("Logout error:", error);
    showToast("Logout failed!", "error");
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  const toggle = document.getElementById("themeToggle");
  if (toggle) toggle.checked = isDark;
  const icon = document.querySelector('#themeBtnTop i, #themeIcon');
  if (icon) icon.className = isDark ? "fas fa-sun" : "fas fa-moon";
}

// ========================================
// USER DROPDOWN
// ========================================
function toggleUserDropdown() {
  document.getElementById("userDropdown").classList.toggle("show");
}

document.addEventListener("click", (e) => {
  const dropdown = document.getElementById("userDropdown");
  const btn = document.querySelector(".user-menu-btn");
  if (dropdown && !dropdown.contains(e.target) && !btn.contains(e.target)) {
    dropdown.classList.remove("show");
  }
});

// ========================================
// REGISTRATION - FIRESTORE
// ========================================
document.getElementById("btnSaveStudent").addEventListener("click", async () => {
  const id = document.getElementById("regId").value.trim();
  const name = document.getElementById("regName").value.trim();
  const faculty = document.getElementById("regFaculty").value;
  const shift = document.getElementById("regShift").value;
  const phone = document.getElementById("regPhone").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const status = document.getElementById("regStatus").value;
  
  if (!id || !name || !faculty || !password) {
    showToast("Fill all required fields (*)!", "warning");
    return;
  }
  
  if (students.find(s => s.studentId === id)) {
    showToast("Student ID already exists!", "error");
    return;
  }
  
  try {
    const btn = document.getElementById("btnSaveStudent");
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
    await addDoc(collection(db, "students"), {
      studentId: id,
      name,
      faculty,
      shift,
      phone,
      password,
      status,
      createdAt: new Date(),
      createdBy: currentUser.uid
    });
    
    showToast("✓ Student registered successfully!", "success");
    
    ['regId', 'regName', 'regPhone', 'regPassword'].forEach(i => document.getElementById(i).value = '');
    document.getElementById("regFaculty").value = '';
    document.getElementById("regShift").value = '';
    
  } catch (error) {
    console.error("Save student error:", error);
    showToast("Failed to save student!", "error");
  } finally {
    const btn = document.getElementById("btnSaveStudent");
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Save Student';
  }
});

function loadStudentsTable() {
  const tbody = document.getElementById("studentsTableBody");
  if (!tbody) return;
  
  const search = document.getElementById("studentSearch")?.value.toLowerCase() || '';
  const filterFaculty = document.getElementById("studentFilterFaculty")?.value || '';
  
  let filtered = students.filter(s => {
    const matchSearch = !search || s.studentId.toLowerCase().includes(search) || s.name.toLowerCase().includes(search);
    const matchFaculty = !filterFaculty || s.faculty === filterFaculty;
    return matchSearch && matchFaculty;
  });
  
  tbody.innerHTML = "";
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No students found</td></tr>';
    return;
  }
  
  filtered.forEach((s) => {
    tbody.innerHTML += `
      <tr>
        <td><strong>${s.studentId}</strong></td>
        <td>${s.name}</td>
        <td><span style="background:#ede9fe; color:#6d28d9; padding:5px 12px; border-radius:20px; font-size:12px; font-weight:600;">${s.faculty}</span></td>
        <td>${s.shift || '-'}</td>
        <td><span style="background:${s.status === 'Scholarship' ? '#dbeafe' : '#dcfce7'}; color:${s.status === 'Scholarship' ? '#1e40af' : '#166534'}; padding:5px 12px; border-radius:20px; font-size:12px; font-weight:600;">${s.status}</span></td>
        <td style="font-size:12px; color:var(--text-muted);">${s.createdAt?.toDate().toLocaleString() || '-'}</td>
        <td>
          <button class="action-btn btn-edit" onclick="editStudent('${s.id}')"><i class="fas fa-edit"></i></button>
          <button class="action-btn btn-delete" onclick="deleteStudent('${s.id}')"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `;
  });
}

async function editStudent(docId) {
  const s = students.find(st => st.id === docId);
  if (!s) return;
  
  document.getElementById("regId").value = s.studentId;
  document.getElementById("regName").value = s.name;
  document.getElementById("regFaculty").value = s.faculty;
  document.getElementById("regShift").value = s.shift || '';
  document.getElementById("regPhone").value = s.phone || '';
  document.getElementById("regPassword").value = s.password;
  document.getElementById("regStatus").value = s.status;
  
  // Delete old record
  await deleteStudent(docId, false);
  showToast("Student loaded for editing", "info");
}

async function deleteStudent(docId, showConfirm = true) {
  if (showConfirm && !confirm("Delete this student?")) return;
  
  try {
    await deleteDoc(doc(db, "students", docId));
    if (showConfirm) showToast("Student deleted", "success");
  } catch (error) {
    console.error("Delete student error:", error);
    showToast("Failed to delete student!", "error");
  }
}

function clearStudentFilter() {
  document.getElementById("studentSearch").value = '';
  document.getElementById("studentFilterFaculty").value = '';
  loadStudentsTable();
}

// ========================================
// FINANCE - FIRESTORE
// ========================================
document.getElementById("btnSearchStudent").addEventListener("click", () => {
  const id = document.getElementById("finStudentId").value.trim();
  const student = students.find(s => s.studentId === id);
  if (student) {
    document.getElementById("finName").value = student.name;
    document.getElementById("finFaculty").value = student.faculty;
    showToast("Student found!", "success");
  } else {
    showToast("Student Not Found", "error");
  }
});

document.getElementById("btnSavePayment").addEventListener("click", async () => {
  const id = document.getElementById("finStudentId").value.trim();
  const name = document.getElementById("finName").value;
  const faculty = document.getElementById("finFaculty").value;
  const semester = document.getElementById("finSemester").value;
  const required = Number(document.getElementById("finRequiredAmt").value);
  const paid = Number(document.getElementById("finPaidAmt").value);
  const date = document.getElementById("finDate").value;
  
  if (!id || !name || !semester || !required || !paid || !date) {
    showToast("Fill all payment fields!", "warning");
    return;
  }
  
  try {
    const btn = document.getElementById("btnSavePayment");
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
    await addDoc(collection(db, "payments"), {
      studentId: id,
      name,
      faculty,
      semester,
      required,
      paid,
      balance: required - paid,
      date,
      createdAt: new Date(),
      createdBy: currentUser.uid
    });
    
    showToast("✓ Payment saved successfully!", "success");
    
    ['finStudentId', 'finName', 'finFaculty', 'finRequiredAmt', 'finPaidAmt'].forEach(i => document.getElementById(i).value = '');
    document.getElementById("finSemester").value = '';
    
  } catch (error) {
    console.error("Save payment error:", error);
    showToast("Failed to save payment!", "error");
  } finally {
    const btn = document.getElementById("btnSavePayment");
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Save Payment';
  }
});

function loadFinanceTable() {
  const tbody = document.getElementById("financeTableBody");
  if (!tbody) return;
  
  const search = document.getElementById("financeSearch")?.value.toLowerCase() || '';
  const filterFaculty = document.getElementById("financeFilterFaculty")?.value || '';
  
  let filtered = payments.filter(p => {
    const matchSearch = !search || p.studentId.toLowerCase().includes(search) || p.name.toLowerCase().includes(search);
    const matchFaculty = !filterFaculty || p.faculty === filterFaculty;
    return matchSearch && matchFaculty;
  });
  
  tbody.innerHTML = "";
  let tR = 0, tP = 0, tB = 0;
  
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No payments found</td></tr>';
  } else {
    filtered.forEach((p) => {
      tR += Number(p.required);
      tP += Number(p.paid);
      tB += Number(p.balance);
      tbody.innerHTML += `
        <tr>
          <td><strong>${p.studentId}</strong></td>
          <td>${p.name}</td>
          <td><span style="background:#ede9fe; color:#6d28d9; padding:5px 12px; border-radius:20px; font-size:12px; font-weight:600;">${p.faculty}</span></td>
          <td><span style="background:#dbeafe; color:#1e40af; padding:3px 10px; border-radius:12px; font-size:12px;">${p.semester}</span></td>
          <td>$${p.required}</td>
          <td style="color:#10b981; font-weight:bold;">$${p.paid}</td>
          <td style="color:#ef4444; font-weight:bold;">$${p.balance}</td>
          <td style="font-size:12px; color:var(--text-muted);">${p.createdAt?.toDate().toLocaleString() || '-'}</td>
          <td>
            <button class="action-btn btn-delete" onclick="deletePayment('${p.id}')"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      `;
    });
  }
  
  document.getElementById("finRequired").innerText = "$" + tR;
  document.getElementById("finPaid").innerText = "$" + tP;
  document.getElementById("finBalance").innerText = "$" + tB;
}

async function deletePayment(docId) {
  if (!confirm("Delete this payment record?")) return;
  
  try {
    await deleteDoc(doc(db, "payments", docId));
    showToast("Payment deleted", "success");
  } catch (error) {
    console.error("Delete payment error:", error);
    showToast("Failed to delete payment!", "error");
  }
}

function clearFinanceFilter() {
  document.getElementById("financeSearch").value = '';
  document.getElementById("financeFilterFaculty").value = '';
  loadFinanceTable();
}

// ========================================
// EXAMINATION - FIRESTORE
// ========================================
function switchExamTab(code, btn) {
  document.querySelectorAll(".faculty-subform").forEach(f => f.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("exam-" + code).classList.add("active");
  btn.classList.add("active");
}

function searchExam(code) {
  const id = document.getElementById(code + "-id").value.trim();
  const student = students.find(s => s.studentId === id);
  if (student) {
    document.getElementById(code + "-name").value = student.name;
    showToast("Student found!", "success");
  } else {
    showToast("Student Not Found", "error");
  }
}

async function saveExam(code) {
  const facultyMap = {
    cs: "Computer Science",
    health: "Health Science",
    business: "Business",
    social: "Social Science"
  };
  const id = document.getElementById(code + "-id").value.trim();
  const student = students.find(s => s.studentId === id);
  
  if (!student) {
    showToast("Search student first!", "warning");
    return;
  }
  
  const subjects = [];
  for (let i = 1; i <= 3; i++) {
    const course = document.getElementById(code + "-c" + i).value.trim();
    const mark = Number(document.getElementById(code + "-m" + i).value);
    if (course && mark !== '') {
      if (mark < 0 || mark > 100) {
        showToast(`Mark ${i} must be 0-100!`, "error");
        return;
      }
      subjects.push({ course, mark });
    }
  }
  
  if (subjects.length === 0) {
    showToast("Enter at least one course with mark!", "warning");
    return;
  }
  
  const avg = subjects.reduce((sum, s) => sum + s.mark, 0) / subjects.length;
  let grade = "F";
  if (avg >= 90) grade = "A";
  else if (avg >= 80) grade = "B";
  else if (avg >= 70) grade = "C";
  else if (avg >= 60) grade = "D";
  
  try {
    const btn = document.querySelector(`#exam-${code} .btn-primary`);
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    }
    
    await addDoc(collection(db, "results"), {
      studentId: id,
      name: student.name,
      faculty: facultyMap[code],
      subjects,
      gpa: avg.toFixed(2),
      grade,
      published: false,
      createdAt: new Date(),
      createdBy: currentUser.uid
    });
    
    showToast("✓ Result saved with courses!", "success");
    
    for (let i = 1; i <= 3; i++) {
      document.getElementById(code + "-c" + i).value = '';
      document.getElementById(code + "-m" + i).value = '';
    }
    
  } catch (error) {
    console.error("Save exam error:", error);
    showToast("Failed to save result!", "error");
  } finally {
    const btn = document.querySelector(`#exam-${code} .btn-primary`);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-save"></i> Save Result';
    }
  }
}

function loadResultsAll() {
  const codes = {
    cs: "Computer Science",
    health: "Health Science",
    business: "Business",
    social: "Social Science"
  };
  
  Object.keys(codes).forEach(code => {
    const tbody = document.getElementById(code + "-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    
    const facultyResults = results.filter(r => r.faculty === codes[code]);
    
    if (facultyResults.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="empty-state">No results yet</td></tr>';
      return;
    }
    
    facultyResults.forEach((r) => {
      const coursesHtml = r.subjects.map(s => 
        `<div style="background:#ede9fe; color:#6d28d9; padding:4px 8px; border-radius:8px; font-size:11px; margin:2px 0; display:inline-block;">
          ${s.course}: <strong>${s.mark}</strong>
        </div>`
      ).join('');
      
      tbody.innerHTML += `
        <tr>
          <td><strong>${r.studentId}</strong></td>
          <td>${r.name}</td>
          <td style="max-width:200px;">${coursesHtml}</td>
          <td><strong style="color:var(--primary);">${r.gpa}</strong></td>
          <td><span style="background:${r.grade === 'A' ? '#dcfce7' : r.grade === 'B' ? '#dbeafe' : r.grade === 'C' ? '#fef3c7' : '#fee2e2'}; color:${r.grade === 'A' ? '#166534' : r.grade === 'B' ? '#1e40af' : r.grade === 'C' ? '#92400e' : '#991b1b'}; padding:5px 12px; border-radius:20px; font-weight:600;">${r.grade}</span></td>
          <td>${r.published ? '<span style="color:#10b981; font-weight:600;"><i class="fas fa-check"></i> Published</span>' : '<span style="color:#f59e0b; font-weight:600;"><i class="fas fa-clock"></i> Pending</span>'}</td>
          <td style="font-size:12px; color:var(--text-muted);">${r.createdAt?.toDate().toLocaleString() || '-'}</td>
          <td>
            ${!r.published ? `<button class="action-btn btn-publish" style="background:#f59e0b;" onclick="publishSingle('${r.id}')"><i class="fas fa-bullhorn"></i></button>` : ''}
            <button class="action-btn btn-delete" onclick="deleteResult('${r.id}')"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      `;
    });
  });
}

async function publishSingle(docId) {
  if (!confirm("Publish this result?")) return;
  
  try {
    await updateDoc(doc(db, "results", docId), {
      published: true,
      publishedAt: new Date()
    });
    showToast("Result published!", "success");
  } catch (error) {
    console.error("Publish error:", error);
    showToast("Failed to publish!", "error");
  }
}

async function deleteResult(docId) {
  if (!confirm("Delete this result?")) return;
  
  try {
    await deleteDoc(doc(db, "results", docId));
    showToast("Result deleted", "success");
  } catch (error) {
    console.error("Delete result error:", error);
    showToast("Failed to delete!", "error");
  }
}

async function publishResults(faculty) {
  const pending = results.filter(r => r.faculty === faculty && !r.published);
  if (pending.length === 0) {
    showToast("No pending results for " + faculty, "warning");
    return;
  }
  if (!confirm(`Publish ${pending.length} results for ${faculty}?`)) return;
  
  try {
    const promises = pending.map(r => 
      updateDoc(doc(db, "results", r.id), {
        published: true,
        publishedAt: new Date()
      })
    );
    await Promise.all(promises);
    showToast(`✓ ${pending.length} results published!`, "success");
  } catch (error) {
    console.error("Publish results error:", error);
    showToast("Failed to publish!", "error");
  }
}

// ========================================
// PUBLISHED RESULTS
// ========================================
function filterPublishedResults() {
  const faculty = document.getElementById("publishedFacultyFilter").value;
  const tbody = document.getElementById("publishedResultsBody");
  tbody.innerHTML = "";
  
  if (!faculty) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Please select a faculty to view results.</td></tr>';
    return;
  }
  
  const filtered = results.filter(r => r.faculty === faculty && r.published);
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No published results found.</td></tr>';
    return;
  }
  
  filtered.forEach(r => {
    tbody.innerHTML += `
      <tr>
        <td><strong>${r.studentId}</strong></td>
        <td>${r.name}</td>
        <td><strong style="color:var(--primary);">${r.gpa}</strong></td>
        <td><span style="background:#dcfce7; color:#166534; padding:5px 12px; border-radius:20px; font-weight:600;">${r.grade}</span></td>
        <td style="font-size:12px; color:var(--text-muted);">${r.publishedAt?.toDate().toLocaleString() || r.createdAt?.toDate().toLocaleString() || '-'}</td>
      </tr>
    `;
  });
}

// ========================================
// STUDENT PORTAL
// ========================================
document.getElementById("portalLoginBtn").addEventListener("click", () => {
  const id = document.getElementById("portalId").value.trim();
  const password = document.getElementById("portalPassword").value.trim();
  const faculty = document.getElementById("portalFaculty").value;
  
  const student = students.find(s => s.studentId === id && s.password === password);
  if (!student) {
    showToast("Wrong ID or Password", "error");
    return;
  }
  if (faculty && student.faculty !== faculty) {
    showToast("Faculty does not match", "error");
    return;
  }
  showStudentResults(student);
});

function showStudentResults(student) {
  const container = document.getElementById("studentResultArea");
  const studentResults = results.filter(r => r.studentId === student.studentId && r.published);
  
  let html = `
    <div class="portal-student-info">
      <div><label>Student ID</label><span>${student.studentId}</span></div>
      <div><label>Full Name</label><span>${student.name}</span></div>
      <div><label>Faculty</label><span>${student.faculty}</span></div>
      <div><label>Shift</label><span>${student.shift || '-'}</span></div>
      <div><label>Status</label><span>${student.status}</span></div>
    </div>
  `;
  
  if (studentResults.length === 0) {
    html += `<div class="section-box" style="text-align:center;"><h3>No Published Results Yet</h3></div>`;
  } else {
    studentResults.forEach(r => {
      const subjectsHtml = r.subjects.map(s => 
        `<tr><td>${s.course}</td><td><strong>${s.mark}</strong></td></tr>`
      ).join("");
      
      html += `
        <div class="result-card">
          <h2>Examination Results</h2>
          <table style="width:100%; margin:15px 0;">
            <thead>
              <tr style="background:var(--bg);">
                <th>Course</th>
                <th>Mark</th>
              </tr>
            </thead>
            <tbody>${subjectsHtml}</tbody>
          </table>
          <div class="result-summary">
            <span class="badge badge-gpa"><i class="fas fa-chart-line"></i> GPA: ${r.gpa}</span>
            <span class="badge badge-grade"><i class="fas fa-award"></i> Grade: ${r.grade}</span>
          </div>
        </div>
      `;
    });
  }
  
  container.innerHTML = html;
  showToast("Results loaded!", "success");
}

// ========================================
// DASHBOARD
// ========================================
function updateDashboard() {
  document.getElementById("dashTotalStudents").innerText = students.length;
  let paid = 0, balance = 0;
  payments.forEach(p => { paid += p.paid; balance += p.balance; });
  document.getElementById("dashTotalPaid").innerText = "$" + paid;
  document.getElementById("dashTotalBalance").innerText = "$" + balance;
  document.getElementById("dashPublishedResults").innerText = results.filter(r => r.published).length;
  
  const faculties = ["Computer Science", "Health Science", "Business", "Social Science"];
  const distEl = document.getElementById("facultyDistribution");
  if (distEl) {
    const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
    let html = "";
    faculties.forEach((f, i) => {
      const count = students.filter(s => s.faculty === f).length;
      const percent = students.length > 0 ? (count / students.length * 100).toFixed(0) : 0;
      html += `
        <div style="margin-bottom:15px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span style="font-size:14px; color:var(--text-muted);">${f}</span>
            <span style="font-size:14px; font-weight:600; color:var(--text);">${count} students (${percent}%)</span>
          </div>
          <div style="background:var(--bg); border-radius:10px; height:10px; overflow:hidden;">
            <div style="background:${colors[i]}; height:100%; width:${percent}%; border-radius:10px; transition:width 0.5s;"></div>
          </div>
        </div>
      `;
    });
    distEl.innerHTML = html;
  }
}

// ========================================
// REPORTS
// ========================================
function generateReport() {
  const type = document.getElementById("reportType").value;
  const out = document.getElementById("reportsOutput");
  let html = "";
  
  if (type === "registration") {
    const faculties = ["Computer Science", "Health Science", "Business", "Social Science"];
    html = `<h3><i class="fas fa-user-plus"></i> Registration Report</h3>`;
    faculties.forEach(f => {
      html += `<div class="stat-row"><span>${f}</span><span>${students.filter(s => s.faculty === f).length} students</span></div>`;
    });
    html += `<div class="stat-row"><span>Total Students</span><span>${students.length}</span></div>`;
  } else if (type === "finance") {
    let tR = 0, tP = 0, tB = 0;
    payments.forEach(p => { tR += p.required; tP += p.paid; tB += p.balance; });
    html = `
      <h3><i class="fas fa-dollar-sign"></i> Financial Report</h3>
      <div class="stat-row"><span>Total Required</span><span>$${tR}</span></div>
      <div class="stat-row"><span>Total Paid</span><span>$${tP}</span></div>
      <div class="stat-row"><span>Total Balance</span><span>$${tB}</span></div>
    `;
  } else if (type === "examination") {
    const total = results.length;
    const pub = results.filter(r => r.published).length;
    html = `
      <h3><i class="fas fa-clipboard-list"></i> Examination Report</h3>
      <div class="stat-row"><span>Total Results</span><span>${total}</span></div>
      <div class="stat-row"><span>Published</span><span>${pub}</span></div>
      <div class="stat-row"><span>Pending</span><span>${total - pub}</span></div>
    `;
  }
  
  out.innerHTML = html + `<button class="btn-export" style="margin-top:20px;" onclick="exportData('report_${type}')"><i class="fas fa-file-excel"></i> Export Report</button>`;
}

// ========================================
// ARCHIVE - FIRESTORE
// ========================================
async function createArchive() {
  const name = document.getElementById("archiveName").value.trim();
  const year = document.getElementById("archiveYear").value;
  const faculty = document.getElementById("archiveFaculty").value;
  
  if (!name || !year || !faculty) {
    showToast("Fill all archive fields!", "warning");
    return;
  }
  
  let filteredStudents = students;
  let filteredPayments = payments;
  let filteredResults = results;
  
  if (faculty !== "All") {
    filteredStudents = students.filter(s => s.faculty === faculty);
    filteredPayments = payments.filter(p => p.faculty === faculty);
    filteredResults = results.filter(r => r.faculty === faculty);
  }
  
  try {
    await addDoc(collection(db, "archives"), {
      name,
      year,
      faculty,
      studentsCount: filteredStudents.length,
      paymentsCount: filteredPayments.length,
      resultsCount: filteredResults.length,
      createdAt: new Date(),
      createdBy: currentUser.uid,
      data: {
        students: filteredStudents,
        payments: filteredPayments,
        results: filteredResults
      }
    });
    
    showToast("✓ Archive folder created!", "success");
    
    document.getElementById("archiveName").value = '';
    document.getElementById("archiveYear").value = '';
    document.getElementById("archiveFaculty").value = '';
    
  } catch (error) {
    console.error("Create archive error:", error);
    showToast("Failed to create archive!", "error");
  }
}

function loadArchives() {
  const container = document.getElementById("archiveFolders");
  if (!container) return;
  container.innerHTML = "";
  
  if (archives.length === 0) {
    container.innerHTML = '<div class="empty-state">No archive folders yet</div>';
    return;
  }
  
  archives.forEach((a, i) => {
    container.innerHTML += `
      <div class="archive-folder" onclick="toggleArchive(${i})">
        <i class="fas fa-folder"></i>
        <h4>${a.name}</h4>
        <p><i class="fas fa-calendar"></i> ${a.createdAt?.toDate().toLocaleString() || '-'}</p>
        <div class="archive-meta">
          <span><i class="fas fa-calendar-alt"></i> ${a.year}</span>
          <span><i class="fas fa-university"></i> ${a.faculty}</span>
        </div>
        <div class="archive-content" id="archive-content-${i}">
          <div class="archive-data-section">
            <h5><i class="fas fa-info-circle"></i> Archive Summary</h5>
            <p><strong>Students:</strong> ${a.studentsCount}</p>
            <p><strong>Payments:</strong> ${a.paymentsCount}</p>
            <p><strong>Results:</strong> ${a.resultsCount}</p>
          </div>
          
          ${a.data?.students?.length > 0 ? `
            <div class="archive-data-section">
              <h5><i class="fas fa-user-graduate"></i> Students (${a.data.students.length})</h5>
              <table>
                <thead><tr><th>ID</th><th>Name</th><th>Faculty</th></tr></thead>
                <tbody>
                  ${a.data.students.map(s => `<tr><td>${s.studentId}</td><td>${s.name}</td><td>${s.faculty}</td></tr>`).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}
          
          ${a.data?.payments?.length > 0 ? `
            <div class="archive-data-section">
              <h5><i class="fas fa-dollar-sign"></i> Payments (${a.data.payments.length})</h5>
              <table>
                <thead><tr><th>ID</th><th>Name</th><th>Paid</th></tr></thead>
                <tbody>
                  ${a.data.payments.map(p => `<tr><td>${p.studentId}</td><td>${p.name}</td><td>$${p.paid}</td></tr>`).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}
          
          ${a.data?.results?.length > 0 ? `
            <div class="archive-data-section">
              <h5><i class="fas fa-clipboard-list"></i> Results (${a.data.results.length})</h5>
              <table>
                <thead><tr><th>ID</th><th>Name</th><th>GPA</th><th>Grade</th></tr></thead>
                <tbody>
                  ${a.data.results.map(r => `<tr><td>${r.studentId}</td><td>${r.name}</td><td>${r.gpa}</td><td>${r.grade}</td></tr>`).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}
          
          <button class="action-btn btn-delete" style="margin-top:10px;" onclick="event.stopPropagation(); deleteArchive('${a.id}')">
            <i class="fas fa-trash"></i> Delete Folder
          </button>
        </div>
      </div>
    `;
  });
}

function toggleArchive(index) {
  const content = document.getElementById(`archive-content-${index}`);
  content.style.display = content.style.display === "block" ? "none" : "block";
}

async function deleteArchive(docId) {
  if (!confirm("Delete this archive folder?")) return;
  
  try {
    await deleteDoc(doc(db, "archives", docId));
    showToast("Archive deleted", "success");
  } catch (error) {
    console.error("Delete archive error:", error);
    showToast("Failed to delete archive!", "error");
  }
}

// ========================================
// USERS - FIRESTORE
// ========================================
document.getElementById("btnCreateUser").addEventListener("click", createUser);

async function createUser() {
  const email = document.getElementById("newEmail").value.trim();
  const username = document.getElementById("newUsername").value.trim();
  const password = document.getElementById("newPassword").value.trim();
  const role = document.getElementById("newRole").value;
  
  if (!email || !username || !password) {
    showToast("Fill all fields!", "warning");
    return;
  }
  
  const permissions = [];
  document.querySelectorAll(".permission-checkbox input[type='checkbox']:checked").forEach(cb => {
    permissions.push(cb.id.replace("perm-", ""));
  });
  if (!permissions.includes("dashboard")) permissions.push("dashboard");
  
  try {
    const btn = document.getElementById("btnCreateUser");
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Save user data to Firestore
    await setDoc(doc(db, "users", firebaseUser.uid), {
      username,
      email,
      role,
      permissions,
      createdAt: new Date(),
      createdBy: currentUser.uid
    });
    
    showToast("✓ User created!", "success");
    clearUserForm();
    
  } catch (error) {
    console.error("Create user error:", error);
    let errorMsg = "Failed to create user!";
    if (error.code === 'auth/email-already-in-use') errorMsg = "Email already in use!";
    else if (error.code === 'auth/weak-password') errorMsg = "Password too weak (min 6 chars)!";
    else if (error.code === 'auth/invalid-email') errorMsg = "Invalid email!";
    
    showToast(errorMsg, "error");
  } finally {
    const btn = document.getElementById("btnCreateUser");
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-user-plus"></i> Create User';
  }
}

function loadUsersTable() {
  const tbody = document.getElementById("usersTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  
  users.forEach((u) => {
    const permsText = u.permissions ? u.permissions.join(", ") : "None";
    const isAdmin = u.role === 'principal';
    tbody.innerHTML += `
      <tr>
        <td><strong>${u.username}</strong></td>
        <td style="font-size:12px;">${u.email || '-'}</td>
        <td><span style="background:#ede9fe; color:#6d28d9; padding:5px 12px; border-radius:20px; font-size:12px;">${u.role}</span></td>
        <td style="font-size:12px; color:var(--text-muted);">${permsText}</td>
        <td>
          ${!isAdmin ? `<button class="action-btn btn-delete" onclick="deleteUser('${u.uid}')"><i class="fas fa-trash"></i></button>` : '<span style="color:var(--text-muted); font-size:12px;">Admin</span>'}
        </td>
      </tr>
    `;
  });
}

async function deleteUser(uid) {
  if (!confirm("Delete this user?")) return;
  
  try {
    await deleteDoc(doc(db, "users", uid));
    showToast("User deleted", "success");
  } catch (error) {
    console.error("Delete user error:", error);
    showToast("Failed to delete user!", "error");
  }
}

function clearUserForm() {
  document.getElementById("newEmail").value = '';
  document.getElementById("newUsername").value = '';
  document.getElementById("newPassword").value = '';
  document.querySelectorAll(".permission-checkbox input[type='checkbox']").forEach(cb => {
    if (!cb.disabled) cb.checked = false;
  });
}

// ========================================
// EXCEL EXPORT WITH COURSES & MARKS
// ========================================
function exportData(type) {
  let csv = "";
  let filename = "";
  
  if (type === 'students') {
    csv = "ID,NAME,FACULTY,SHIFT,STATUS,TIMESTAMP\n";
    students.forEach(s => csv += `${s.studentId},${s.name},${s.faculty},${s.shift || ''},${s.status},${s.createdAt?.toDate().toLocaleString() || ''}\n`);
    filename = 'Students.csv';
  } 
  else if (type === 'finance') {
    csv = "ID,NAME,FACULTY,SEMESTER,REQUIRED,PAID,BALANCE,TIMESTAMP\n";
    payments.forEach(p => csv += `${p.studentId},${p.name},${p.faculty},${p.semester || ''},${p.required},${p.paid},${p.balance},${p.createdAt?.toDate().toLocaleString() || ''}\n`);
    filename = 'Finance_Report.csv';
  } 
  else if (type.startsWith('exam_')) {
    const faculty = type.replace('exam_', '').toUpperCase();
    const facultyMap = { 
      CS: "Computer Science", 
      HEALTH: "Health Science", 
      BUSINESS: "Business", 
      SOCIAL: "Social Science" 
    };
    const facName = facultyMap[faculty];
    
    csv = "ID,NAME,COURSE_1,MARK_1,COURSE_2,MARK_2,COURSE_3,MARK_3,TOTAL_MARKS,GPA,GRADE,STATUS,TIMESTAMP\n";
    
    results.filter(r => r.faculty === facName).forEach(r => {
      const c1 = r.subjects[0] ? r.subjects[0].course : '';
      const m1 = r.subjects[0] ? r.subjects[0].mark : '';
      const c2 = r.subjects[1] ? r.subjects[1].course : '';
      const m2 = r.subjects[1] ? r.subjects[1].mark : '';
      const c3 = r.subjects[2] ? r.subjects[2].course : '';
      const m3 = r.subjects[2] ? r.subjects[2].mark : '';
      
      const total = (m1 || 0) + (m2 || 0) + (m3 || 0);
      
      csv += `${r.studentId},${r.name},"${c1}",${m1},"${c2}",${m2},"${c3}",${m3},${total},${r.gpa},${r.grade},${r.published ? 'Published' : 'Pending'},${r.createdAt?.toDate().toLocaleString() || ''}\n`;
    });
    
    filename = `Exam_${facName}_Results.csv`;
  } 
  else if (type === 'all_exams') {
    csv = "FACULTY,ID,NAME,COURSE_1,MARK_1,COURSE_2,MARK_2,COURSE_3,MARK_3,TOTAL_MARKS,GPA,GRADE,STATUS,TIMESTAMP\n";
    
    results.forEach(r => {
      const c1 = r.subjects[0] ? r.subjects[0].course : '';
      const m1 = r.subjects[0] ? r.subjects[0].mark : '';
      const c2 = r.subjects[1] ? r.subjects[1].course : '';
      const m2 = r.subjects[1] ? r.subjects[1].mark : '';
      const c3 = r.subjects[2] ? r.subjects[2].course : '';
      const m3 = r.subjects[2] ? r.subjects[2].mark : '';
      const total = (m1 || 0) + (m2 || 0) + (m3 || 0);
      
      csv += `${r.faculty},${r.studentId},${r.name},"${c1}",${m1},"${c2}",${m2},"${c3}",${m3},${total},${r.gpa},${r.grade},${r.published ? 'Published' : 'Pending'},${r.createdAt?.toDate().toLocaleString() || ''}\n`;
    });
    
    filename = 'All_Exam_Results.csv';
  }
  else if (type.startsWith('report_')) {
    const reportType = type.replace('report_', '');
    csv = "Type,Value\n";
    if (reportType === 'registration') csv += `Total Students,${students.length}\n`;
    filename = `Report_${reportType}.csv`;
  } 
  else if (type === 'all') {
    const data = { students, payments, results, archives, users, date: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'PrimeCollege_Backup_' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    showToast("Backup downloaded!", "success");
    return;
  }
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast(`✓ ${filename} exported successfully!`, "success");
}

// ========================================
// SETTINGS FUNCTIONS
// ========================================
async function restoreData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      // Restore students
      if (data.students && data.students.length > 0) {
        for (const s of data.students) {
          const { id, ...rest } = s;
          await addDoc(collection(db, "students"), rest);
        }
      }
      
      // Restore payments
      if (data.payments && data.payments.length > 0) {
        for (const p of data.payments) {
          const { id, ...rest } = p;
          await addDoc(collection(db, "payments"), rest);
        }
      }
      
      // Restore results
      if (data.results && data.results.length > 0) {
        for (const r of data.results) {
          const { id, ...rest } = r;
          await addDoc(collection(db, "results"), rest);
        }
      }
      
      showToast("✓ Data restored successfully!", "success");
      setTimeout(() => location.reload(), 1500);
      
    } catch (err) {
      console.error("Restore error:", err);
      showToast("Invalid backup file!", "error");
    }
  };
  reader.readAsText(file);
}

async function clearAllData() {
  if (!confirm("⚠️ This will delete ALL data! Are you sure?")) return;
  if (!confirm("This cannot be undone! Final confirmation?")) return;
  
  try {
    // Delete all collections
    const collections = ['students', 'payments', 'results', 'archives'];
    for (const collName of collections) {
      const snapshot = await getDocs(collection(db, collName));
      const promises = snapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(promises);
    }
    
    showToast("✓ All data cleared!", "success");
    setTimeout(() => location.reload(), 1500);
    
  } catch (error) {
    console.error("Clear data error:", error);
    showToast("Failed to clear data!", "error");
  }
}

// ========================================
// GLOBAL SEARCH
// ========================================
function openSearchModal() {
  document.getElementById("searchModal").classList.add("show");
  document.getElementById("globalSearchInput").focus();
}

function closeModal(id) {
  document.getElementById(id).classList.remove("show");
}

function performGlobalSearch() {
  const query = document.getElementById("globalSearchInput").value.toLowerCase().trim();
  const resultsDiv = document.getElementById("globalSearchResults");
  
  if (!query) {
    resultsDiv.innerHTML = '';
    return;
  }
  
  let html = '';
  
  const matchedStudents = students.filter(s => 
    s.studentId.toLowerCase().includes(query) || 
    s.name.toLowerCase().includes(query)
  ).slice(0, 5);
  
  if (matchedStudents.length > 0) {
    html += '<h4 style="margin:15px 0 10px; color:var(--primary);"><i class="fas fa-user-graduate"></i> Students</h4>';
    matchedStudents.forEach(s => {
      html += `<div class="search-result-item"><i class="fas fa-user"></i><div><strong>${s.name}</strong><small>ID: ${s.studentId} | ${s.faculty}</small></div></div>`;
    });
  }
  
  const matchedPayments = payments.filter(p => 
    p.studentId.toLowerCase().includes(query) || 
    p.name.toLowerCase().includes(query)
  ).slice(0, 5);
  
  if (matchedPayments.length > 0) {
    html += '<h4 style="margin:15px 0 10px; color:var(--success);"><i class="fas fa-dollar-sign"></i> Payments</h4>';
    matchedPayments.forEach(p => {
      html += `<div class="search-result-item"><i class="fas fa-money-bill"></i><div><strong>${p.name}</strong><small>Paid: $${p.paid} | ${p.faculty}</small></div></div>`;
    });
  }
  
  const matchedResults = results.filter(r => 
    r.studentId.toLowerCase().includes(query) || 
    r.name.toLowerCase().includes(query)
  ).slice(0, 5);
  
  if (matchedResults.length > 0) {
    html += '<h4 style="margin:15px 0 10px; color:var(--warning);"><i class="fas fa-clipboard-list"></i> Results</h4>';
    matchedResults.forEach(r => {
      html += `<div class="search-result-item"><i class="fas fa-award"></i><div><strong>${r.name}</strong><small>GPA: ${r.gpa} | Grade: ${r.grade}</small></div></div>`;
    });
  }
  
  if (!html) {
    html = '<div class="empty-state">No results found</div>';
  }
  
  resultsDiv.innerHTML = html;
}

// ========================================
// INITIALIZATION
// ========================================
window.addEventListener("load", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    const toggle = document.getElementById("themeToggle");
    if (toggle) toggle.checked = true;
    const icon = document.querySelector('#themeBtnTop i, #themeIcon');
    if (icon) icon.className = "fas fa-sun";
  }
  
  const dateEl = document.getElementById("currentDate");
  if (dateEl) {
    dateEl.innerText = new Date().toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
  }
});
