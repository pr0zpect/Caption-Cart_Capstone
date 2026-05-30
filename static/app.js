/* ═══════════════════════════════════════════════
   CaptionCraft AI — Future JS Controller
   ═══════════════════════════════════════════════ */

const state = {
  imageDataUrl: null,
  platform: 'instagram',
  tone: 'casual',
  extra: '',
  user: null,
  token: localStorage.getItem('token') || null
};

const BACKEND_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:5001/api"
  : "https://caption-craft-auth-production-4fc8.up.railway.app/api";

// Elements
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const dropIdle = document.getElementById("drop-idle");
const dropPreview = document.getElementById("drop-preview");
const previewImg = document.getElementById("preview-img");
const browseBtn = document.getElementById("browse-btn");
const changeImgBtn = document.getElementById("change-img-btn");

const panelUpload = document.getElementById("panel-upload");
const panelConfig = document.getElementById("panel-config");
const panelResults = document.getElementById("panel-results");

const step1El = document.getElementById("step-1");
const step2El = document.getElementById("step-2");
const step3El = document.getElementById("step-3");

const nextBtn1 = document.getElementById("next-btn-1");
const backBtn1 = document.getElementById("back-btn-1");
const generateBtn = document.getElementById("generate-btn");
const genLabel = document.getElementById("gen-label");
const genSpinner = document.getElementById("gen-spinner");

const resultThumb = document.getElementById("result-thumb");
const captionsList = document.getElementById("captions-list");
const backBtn2 = document.getElementById("back-btn-2");
const startOverBtn = document.getElementById("start-over-btn");
const regenerateBtn = document.getElementById("regenerate-btn");
const toast = document.getElementById("toast");

// Auth & Gate Elements
const authGate = document.getElementById("auth-gate");
const appContent = document.getElementById("app-content");
const historyModal = document.getElementById("history-modal");
const authNavBtn = document.getElementById("auth-nav-btn");
const historyBtn = document.getElementById("history-btn");
const logoutBtn = document.getElementById("logout-btn");

const gateLoginSubmit = document.getElementById("gate-login-submit");
const gateSignupSubmit = document.getElementById("gate-signup-submit");
const historyContent = document.getElementById("history-content");

// Navigation
function showPanel(panelName) {
  [panelUpload, panelConfig, panelResults].forEach(p => p.classList.add("hidden"));
  [step1El, step2El, step3El].forEach(s => s.classList.remove("active"));

  if (panelName === 'upload') {
    panelUpload.classList.remove('hidden');
    step1El.classList.add('active');
  } else if (panelName === 'config') {
    panelConfig.classList.remove('hidden');
    step2El.classList.add('active');
  } else if (panelName === 'results') {
    panelResults.classList.remove('hidden');
    step3El.classList.add('active');
  }
}

nextBtn1.addEventListener("click", () => showPanel("config"));
backBtn1.addEventListener("click", () => showPanel("upload"));
backBtn2.addEventListener("click", () => showPanel("config"));
startOverBtn.addEventListener("click", () => {
  state.imageDataUrl = null;
  dropPreview.classList.add("hidden");
  dropIdle.classList.remove("hidden");
  nextBtn1.disabled = true;
  showPanel("upload");
});

// Toast
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => toast.classList.add("hidden"), 3000);
}

// Upload Handling
async function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) return showToast("Invalid image file!");
  
  const reader = new FileReader();
  reader.onload = e => {
    state.imageDataUrl = e.target.result;
    previewImg.src = state.imageDataUrl;
    dropIdle.classList.add("hidden");
    dropPreview.classList.remove("hidden");
    nextBtn1.disabled = false;
  };
  reader.readAsDataURL(file);
}

dropZone.addEventListener("click", e => { if(e.target !== changeImgBtn) fileInput.click(); });
browseBtn.addEventListener("click", e => { e.stopPropagation(); fileInput.click(); });
fileInput.addEventListener("change", () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
  fileInput.value = ""; 
});
changeImgBtn.addEventListener("click", e => {
  e.stopPropagation();
  fileInput.click();
});
dropZone.addEventListener("dragover", e => { e.preventDefault(); dropZone.classList.add("dragover"); });
dropZone.addEventListener("dragleave", e => { dropZone.classList.remove("dragover"); });
dropZone.addEventListener("drop", e => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});

// Selectors
document.querySelectorAll(".pill").forEach(btn => {
  btn.addEventListener("click", function() {
    const parent = this.closest(".pill-group");
    parent.querySelectorAll(".pill").forEach(b => b.classList.remove("active"));
    this.classList.add("active");
    if (parent.id === "platform-grid") state.platform = this.dataset.value;
    if (parent.id === "tone-grid") state.tone = this.dataset.value;
  });
});

document.getElementById("extra-input").addEventListener("input", function() {
  state.extra = this.value;
});

// Elements for Loading
const loadingModal = document.getElementById("loading-modal");
const loadingStepText = document.getElementById("loading-step-text");
const loadingProgress = document.getElementById("loading-progress");

async function performGeneration() {
  if (!state.token) return showToast("Please login first");
  
  // Show Loading Modal
  loadingModal.classList.remove("hidden");
  updateLoadingStep(1);

  const steps = [
    { text: "🔍 Analyzing your image...", progress: 25 },
    { text: "🧠 Understanding context...", progress: 50 },
    { text: "✍️ Crafting captions...", progress: 75 },
    { text: "✨ Finishing touches...", progress: 95 }
  ];

  let currentStep = 0;
  const stepInterval = setInterval(() => {
    if (currentStep < steps.length - 1) {
      currentStep++;
      loadingStepText.textContent = steps[currentStep].text;
      loadingProgress.style.width = steps[currentStep].progress + "%";
    }
  }, 2000);

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      body: JSON.stringify({
        image: state.imageDataUrl,
        platform: state.platform,
        tone: state.tone,
        extra: state.extra
      })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    clearInterval(stepInterval);
    loadingProgress.style.width = "100%";
    loadingStepText.textContent = "✅ Done!";

    setTimeout(async () => {
      loadingModal.classList.add("hidden");
      state.lastResult = data; 
      renderResults(data.captions);
      showPanel("results");

      // AUTO-SAVE Variation 1
      const savedItem = await saveToHistory(data.captions[0], data.captions, true);
      if (savedItem) state.currentHistoryId = savedItem.id;
    }, 800);

  } catch (err) {
    clearInterval(stepInterval);
    loadingModal.classList.add("hidden");
    showToast(err.message || "Generation failed");
  }
}

function updateLoadingStep(step) {
  const steps = ["🔍 Analyzing...", "🧠 Understanding...", "✍️ Crafting...", "✨ Finishing..."];
  loadingStepText.textContent = steps[step-1];
  loadingProgress.style.width = (step * 25) + "%";
}

generateBtn.addEventListener("click", performGeneration);
regenerateBtn.addEventListener("click", performGeneration);

// Results
function renderResults(captions) {
  resultThumb.src = state.imageDataUrl;
  captionsList.innerHTML = "";
  
  captions.forEach((cap, idx) => {
    const div = document.createElement("div");
    div.className = "cap-card";
    div.innerHTML = `
      <div class="cap-header">
        <div class="cap-num">Variation ${idx + 1}</div>
        <div class="cap-actions">
          <button class="btn-secondary btn-cap-action" id="save-${idx}">Save</button>
          <button class="btn-secondary btn-cap-action" id="copy-${idx}">Copy</button>
        </div>
      </div>
      <div class="cap-text">${escapeHtml(cap)}</div>
    `;
    captionsList.appendChild(div);

    div.querySelector(`#copy-${idx}`).addEventListener("click", function() {
      navigator.clipboard.writeText(cap);
      this.textContent = "Copied!";
      showToast("Copied to clipboard");
      setTimeout(() => this.textContent = "Copy", 2000);
    });

    div.querySelector(`#save-${idx}`).addEventListener("click", async function() {
      if (state.currentHistoryId) {
        // Update existing entry
        await updateHistoryItem(state.currentHistoryId, cap);
        this.innerHTML = "Saved! <span class='sparkle'>✓</span>";
        this.disabled = true;
        showToast("Preference updated in history");
      } else {
        // Fallback for edge cases
        const savedItem = await saveToHistory(cap, captions);
        if (savedItem) state.currentHistoryId = savedItem.id;
        this.innerHTML = "Saved! <span class='sparkle'>✓</span>";
        this.disabled = true;
      }
    });
  });
}

async function generateHashtagsForCard() {
  if (!state.lastResult) return [];
  const res = await fetch("/api/hashtags", {
    method: "POST",
    body: JSON.stringify({
      description: state.lastResult.description,
      platform: state.platform,
      tone: state.tone
    })
  });
  const data = await res.json();
  return data.hashtags || [];
}

window.copyTag = (tag) => {
  navigator.clipboard.writeText(tag);
  showToast(`Copied ${tag}`);
};

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ─── Auth & History Logic ─── */

async function checkAuth() {
  const storedUser = localStorage.getItem('user');
  if (state.token && storedUser) {
    try {
      state.user = JSON.parse(storedUser);
      updateUIForAuth(true);
    } catch(e) { updateUIForAuth(false); }
  } else {
    updateUIForAuth(false);
  }
}

function updateUIForAuth(isLoggedIn) {
  if (isLoggedIn) {
    authGate.classList.add("hidden");
    appContent.classList.remove("hidden");
    authNavBtn.textContent = `Hi, ${state.user.name.split(' ')[0]}`;
    historyBtn.style.display = 'block';
    logoutBtn.style.display = 'block';
  } else {
    authGate.classList.remove("hidden");
    appContent.classList.add("hidden");
    authNavBtn.textContent = 'Login ✧';
    historyBtn.style.display = 'none';
    logoutBtn.style.display = 'none';
  }
}

// Modal Toggles
document.getElementById("close-history").addEventListener("click", () => historyModal.classList.add("hidden"));
document.getElementById("gate-show-signup").addEventListener("click", () => {
  document.getElementById("gate-login").classList.add("hidden");
  document.getElementById("gate-signup").classList.remove("hidden");
});
document.getElementById("gate-show-login").addEventListener("click", () => {
  document.getElementById("gate-login").classList.remove("hidden");
  document.getElementById("gate-signup").classList.add("hidden");
});

// Login
gateLoginSubmit.addEventListener("click", async () => {
  const email = document.getElementById("gate-email").value;
  const password = document.getElementById("gate-password").value;
  
  try {
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    updateUIForAuth(true);
    showToast("Welcome back!");
  } catch (err) {
    showToast(err.message);
  }
});

// Signup
gateSignupSubmit.addEventListener("click", async () => {
  const name = document.getElementById("gate-signup-name").value;
  const email = document.getElementById("gate-signup-email").value;
  const password = document.getElementById("gate-signup-password").value;
  
  try {
    const res = await fetch(`${BACKEND_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    updateUIForAuth(true);
    showToast("Account created!");
  } catch (err) {
    showToast(err.message);
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  state.token = null;
  state.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  updateUIForAuth(false);
  showToast("Logged out");
});

// History Save
async function saveToHistory(caption, allVariants, isSilent = false) {
  // Always save to LocalStorage first as a robust local copy
  const localItem = {
    id: Date.now(),
    caption_text: caption,
    platform: state.platform,
    tone: state.tone,
    image_data: state.imageDataUrl,
    all_variations: allVariants,
    hashtags: state.lastHashtags || [],
    created_at: new Date().toISOString()
  };
  
  try {
    const localData = JSON.parse(localStorage.getItem("local_captions_history") || "[]");
    localData.unshift(localItem);
    localStorage.setItem("local_captions_history", JSON.stringify(localData));
  } catch(e) {
    console.error("Local save failed", e);
  }

  if (!state.token) return localItem;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${BACKEND_URL}/history`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.token}`
      },
      body: JSON.stringify({ 
        caption_text: caption,
        platform: state.platform,
        tone: state.tone,
        image_data: state.imageDataUrl,
        all_variations: allVariants,
        hashtags: state.lastHashtags || []
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    const data = await res.json();
    if (res.ok) {
      if (!isSilent) showToast(`Saved to History!`);
      return data;
    } else {
      if (!isSilent) showToast("Saved to Local History!");
    }
  } catch (err) { 
    console.warn("Backend save failed, saved locally:", err);
    if (!isSilent) showToast("Saved to Local History!");
  }
  return localItem;
}

async function updateHistoryItem(id, newCaption) {
  // Update LocalStorage first
  try {
    const localData = JSON.parse(localStorage.getItem("local_captions_history") || "[]");
    const idx = localData.findIndex(h => h.id === id);
    if (idx !== -1) {
      localData[idx].caption_text = newCaption;
      localStorage.setItem("local_captions_history", JSON.stringify(localData));
    }
  } catch(e) {
    console.error("Local update failed", e);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${BACKEND_URL}/history/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.token}`
      },
      body: JSON.stringify({ caption_text: newCaption }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return await res.json();
  } catch (err) {
    console.warn("Backend update failed, updated locally", err);
  }
}

// History Fetch & Filtering
let fullHistory = [];

async function fetchHistory() {
  historyModal.classList.remove("hidden");
  historyContent.innerHTML = `
    <div class="empty-state">
      <div class="spinner"></div>
      <p>Loading your history...</p>
    </div>`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${BACKEND_URL}/history`, {
      headers: { "Authorization": `Bearer ${state.token}` },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!res.ok) throw new Error("Backend error status");
    
    fullHistory = await res.json();
    renderHistoryList(fullHistory);
  } catch (err) {
    console.warn("Backend fetch failed, loading from local history:", err);
    try {
      const localData = localStorage.getItem("local_captions_history") || "[]";
      fullHistory = JSON.parse(localData);
      renderHistoryList(fullHistory);
    } catch (e) {
      historyContent.innerHTML = "<p class='error-text'>Error loading history.</p>";
    }
  }
}

historyBtn.addEventListener("click", fetchHistory);

function renderHistoryList(data) {
  historyContent.innerHTML = "";
  
  if (data.length === 0) {
    historyContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📂</div>
        <p>No captions saved yet. Start generating!</p>
      </div>`;
    return;
  }
  
  data.forEach(item => {
    const card = document.createElement("div");
    card.className = "advanced-history-card";
    card.innerHTML = `
      <div class="history-card-main" onclick="toggleHistoryExpand(${item.id})">
        <div class="history-card-content">
          <p class="history-card-preview">${escapeHtml(item.caption_text)}</p>
          <div class="history-meta">
            <small class="timestamp">${item.platform || 'General'} • ${new Date(item.created_at).toLocaleDateString()}</small>
          </div>
        </div>
      </div>
      <div id="expand-${item.id}" class="history-expanded hidden">
        <div class="variants-wrap">
          ${(item.all_variations || [item.caption_text]).map((v, i) => `
            <div class="expanded-variant">
              <div class="variant-title">Variation ${i+1}</div>
              <div class="variant-body">${escapeHtml(v)}</div>
            </div>
          `).join('')}
        </div>
        ${item.hashtags && item.hashtags.length > 0 ? `
          <div class="history-tags-wrap" style="margin-top: 15px; border-top: 1px dashed #eee; padding-top: 10px;">
            <div class="variant-title">Hashtags</div>
            <div style="font-size: 0.8rem; color: var(--brand-accent);">${item.hashtags.join(' ')}</div>
          </div>
        ` : ''}
      </div>
      <div class="history-card-actions">
        <button class="btn-secondary btn-cap-action" onclick="copyToClipboard('${item.caption_text.replace(/'/g, "\\'")}')">Copy</button>
        <button class="btn-secondary btn-cap-action" onclick="reuseSettings(${item.id})">Reuse</button>
        <button class="btn-secondary btn-cap-action" style="color: #ef4444; border-color: #fecaca;" onclick="deleteHistoryItem(${item.id})">Delete</button>
      </div>
    `;
    historyContent.appendChild(card);
  });
}

window.toggleHistoryExpand = (id) => {
  const el = document.getElementById(`expand-${id}`);
  el.classList.toggle("hidden");
};

window.copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  showToast("Copied to clipboard");
};

window.reuseSettings = (id) => {
  const item = fullHistory.find(h => h.id === id);
  if (!item) return;

  // Pre-fill State
  state.imageDataUrl = item.image_data;
  state.platform = item.platform || 'instagram';
  state.tone = item.tone || 'casual';
  
  // Update UI
  previewImg.src = state.imageDataUrl;
  dropIdle.classList.add("hidden");
  dropPreview.classList.remove("hidden");
  nextBtn1.disabled = false;
  
  // Update Pills
  document.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
  document.querySelector(`[data-value="${state.platform}"]`)?.classList.add("active");
  document.querySelector(`[data-value="${state.tone}"]`)?.classList.add("active");

  historyModal.classList.add("hidden");
  showPanel("upload");
  showToast("Settings reused!");
};

// Filter Logic
document.querySelectorAll(".pill-mini").forEach(btn => {
  btn.addEventListener("click", function() {
    const parent = this.closest(".pill-group-mini");
    parent.querySelectorAll(".pill-mini").forEach(b => b.classList.remove("active"));
    this.classList.add("active");
    applyHistoryFilters();
  });
});

function applyHistoryFilters() {
  const plat = document.querySelector("#history-filter-platform .pill-mini.active").dataset.value;
  const tone = document.querySelector("#history-filter-tone .pill-mini.active").dataset.value;
  
  const filtered = fullHistory.filter(item => {
    const matchPlat = plat === "all" || item.platform === plat;
    const matchTone = tone === "all" || item.tone === tone;
    return matchPlat && matchTone;
  });
  
  renderHistoryList(filtered);
}

function getPlatformLogo(platform) {
  const p = platform?.toLowerCase();
  if (p === 'instagram') return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`;
  if (p === 'twitter') return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>`;
  if (p === 'linkedin') return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`;
  if (p === 'facebook') return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`;
  if (p === 'tiktok') return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>`;
  return '📝';
}

window.deleteHistoryItem = async (id) => {
  // Delete from LocalStorage first
  try {
    let localData = JSON.parse(localStorage.getItem("local_captions_history") || "[]");
    localData = localData.filter(h => h.id !== id);
    localStorage.setItem("local_captions_history", JSON.stringify(localData));
  } catch(e) {
    console.error("Local delete failed", e);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    await fetch(`${BACKEND_URL}/history/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${state.token}` },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
  } catch (err) { 
    console.warn("Backend delete failed, deleted locally", err);
  }
  fetchHistory(); // Refresh view
};

document.getElementById("close-history").addEventListener("click", () => historyModal.classList.add("hidden"));

// Init
checkAuth();
