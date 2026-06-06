const API = "http://192.168.1.17:8080/api/clips";

let allClips = [];

/* =========================
   SAVE CLIP
========================= */
async function saveClip() {
    const content = document.getElementById("inputBox").value.trim();

    if (!content) {
        showToast("Please enter some text or a link.");
        return;
    }

    showSkeleton();

    try {
        const response = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content })
        });

        if (!response.ok) throw new Error("Failed to save.");

        document.getElementById("inputBox").value = "";
        showToast("Nudged! 🚀");
        await loadClips();

    } catch (error) {
        console.error(error);
        showToast("Could not connect to server ❌");
    }
}

/* =========================
   SAVE MOBILE CLIP
========================= */
async function saveMobileClip() {
    const content = document.getElementById("mobileInput").value.trim();
    if (!content) return;

    try {
        await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content })
        });
        document.getElementById("mobileInput").value = "";
        showToast("Nudged! 🚀");
        await loadClips();
    } catch (error) {
        showToast("Could not connect ❌");
    }
}

/* =========================
   SAVE IMAGE
========================= */
async function saveImage() {
    const file = document.getElementById("imageInput").files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: e.target.result })
            });
            showToast("Image nudged! 🖼️");
            await loadClips();
        } catch (err) {
            showToast("Failed to upload image ❌");
        }
    };
    reader.readAsDataURL(file);
}

/* =========================
   LOAD CLIPS
========================= */
async function loadClips() {
    try {
        const response = await fetch(API);
        if (!response.ok) throw new Error("Failed to fetch.");
        allClips = await response.json();
        renderClips();
    } catch (error) {
        console.error("Loading error:", error);
        document.getElementById("clipList").innerHTML = `
            <div class="empty-state">Unable to connect to server.</div>`;
    }
}

/* =========================
   RENDER CLIPS
========================= */
function renderClips() {
    const list = document.getElementById("clipList");
    const counter = document.getElementById("clipCount");

    let clips = [...allClips];

    // Pinned first then newest
    clips.sort((a, b) => {
        if (b.pinned !== a.pinned) return b.pinned ? 1 : -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    counter.textContent = `${clips.length} item${clips.length !== 1 ? "s" : ""}`;

    if (clips.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                Nothing nudged yet.<br>Paste something above!
            </div>`;
        return;
    }

    list.innerHTML = clips.map(clip => {
        const isImage = clip.content.startsWith("data:image");
        const isLink = clip.type === "link" ||
            clip.content.startsWith("http://") ||
            clip.content.startsWith("https://");

        const expiry = getExpiryText(clip.expiresAt);
        const cardClass = clip.pinned ? "clip-card pinned" : "clip-card";
        const pinClass = clip.pinned ? "pin-btn pinned-active" : "pin-btn";
        const pinLabel = clip.pinned ? "📌 Pinned" : "📌 Pin";

        let contentHtml = "";
        if (isImage) {
            contentHtml = `<img src="${clip.content}" alt="nudged image">`;
        } else if (isLink) {
            contentHtml = `<a href="${clip.content}" target="_blank">${clip.content}</a>`;
        } else {
            contentHtml = `<p>${escapeHtml(clip.content)}</p>`;
        }

        return `
        <div class="${cardClass}" id="card-${clip.id}">
            ${contentHtml}
            <div class="clip-meta">
                ${isImage ? "🖼️ Image" : isLink ? "🔗 Link" : "📝 Text"} •
                ${formatDate(clip.createdAt)} •
                <span class="expiry-badge">⏳ ${expiry}</span>
            </div>
            <div class="clip-actions">
                <button class="copy-btn"
                    onclick="copyClip(${clip.id})">Copy</button>
                ${isLink
                    ? `<button class="open-btn"
                        onclick="window.open('${clip.content}','_blank')">Open</button>`
                    : ""}
                ${isLink
                    ? `<button class="qr-btn"
                        onclick="showQR('${clip.content}')">QR</button>`
                    : ""}
                <button class="share-btn"
                    onclick="shareClip(${clip.id})">Share</button>
                <button class="${pinClass}"
                    onclick="togglePin(${clip.id})">${pinLabel}</button>
                <button class="danger"
                    onclick="deleteClip(${clip.id})">Delete</button>
            </div>
        </div>`;
    }).join("");
}

/* =========================
   COPY CLIP
========================= */
async function copyClip(id) {
    const clip = allClips.find(c => c.id === id);
    if (!clip) return;
    try {
        await navigator.clipboard.writeText(clip.content);
        showToast("Copied! ✅");
    } catch (err) {
        showToast("Failed to copy ❌");
    }
}

/* =========================
   DELETE CLIP
========================= */
async function deleteClip(id) {
    try {
        const response = await fetch(`${API}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error();
        showToast("Deleted 🗑️");
        await loadClips();
    } catch (error) {
        showToast("Failed to delete ❌");
    }
}

/* =========================
   CLEAR ALL
========================= */
async function clearAll() {
    if (!confirm("Delete all nudged items?")) return;
    try {
        await fetch(API, { method: "DELETE" });
        showToast("Cleared all 🗑️");
        await loadClips();
    } catch (error) {
        showToast("Failed to clear ❌");
    }
}

/* =========================
   TOGGLE PIN
========================= */
async function togglePin(id) {
    try {
        await fetch(`${API}/${id}/pin`, { method: "PATCH" });
        await loadClips();
    } catch (err) {
        showToast("Failed to pin ❌");
    }
}

/* =========================
   QR CODE
========================= */
function showQR(url) {
    document.getElementById("qrModal").classList.add("open");
    document.getElementById("qrUrl").textContent = url;
    document.getElementById("qrCode").innerHTML = "";
    new QRCode(document.getElementById("qrCode"), {
        text: url,
        width: 200,
        height: 200
    });
}

function closeQR() {
    document.getElementById("qrModal").classList.remove("open");
}

/* =========================
   SHARE
========================= */
function shareClip(id) {
    const clip = allClips.find(c => c.id === id);
    if (!clip) return;
    if (navigator.share) {
        navigator.share({ text: clip.content });
    } else {
        navigator.clipboard.writeText(clip.content);
        showToast("Copied to share! ✅");
    }
}

/* =========================
   EXPIRY TEXT
========================= */
function getExpiryText(expiresAt) {
    if (!expiresAt) return "";
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
}

/* =========================
   SKELETON LOADER
========================= */
function showSkeleton() {
    document.getElementById("clipList").innerHTML = `
        <div class="skeleton">
            <div class="skeleton-line medium"></div>
            <div class="skeleton-line short"></div>
        </div>`;
}

/* =========================
   TOAST
========================= */
function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
}

/* =========================
   THEME TOGGLE
========================= */
function toggleTheme() {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    document.getElementById("themeBtn").textContent = isLight ? "🌙" : "☀️";
}

/* =========================
   ESCAPE HTML
========================= */
function escapeHtml(text) {
    const div = document.createElement("div");
    div.innerText = text;
    return div.innerHTML;
}

/* =========================
   DATE FORMATTER
========================= */
function formatDate(dateString) {
    return new Date(dateString).toLocaleString();
}

/* =========================
   KEYBOARD SHORTCUT
========================= */
document.getElementById("inputBox").addEventListener("keydown", function(e) {
    if (e.ctrlKey && e.key === "Enter") saveClip();
});

/* =========================
   INITIAL LOAD + AUTO REFRESH
========================= */
loadClips();
setInterval(loadClips, 3000);