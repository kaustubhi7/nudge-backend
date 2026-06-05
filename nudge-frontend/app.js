const API = "http://192.168.1.17:8080/api/clips";

async function saveClip() {
    const content = document.getElementById("inputBox").value.trim();
    if (!content) return;

    try {
        await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content })
        });
        document.getElementById("inputBox").value = "";
        loadClips();
    } catch (err) {
        alert("Could not connect to Nudge server. Is it running?");
    }
}

async function loadClips() {
    try {
        const res = await fetch(API);
        const clips = await res.json();
        const list = document.getElementById("clipList");
        const counter = document.getElementById("clipCount");

        counter.textContent = `${clips.length} item${clips.length !== 1 ? "s" : ""}`;

        if (clips.length === 0) {
            list.innerHTML = `<div class="empty-state">Nothing nudged yet.<br>Paste something above!</div>`;
            return;
        }

        list.innerHTML = clips.reverse().map(clip => `
            <div class="clip-card">
                ${clip.type === "link"
                    ? `<a href="${clip.content}" target="_blank">${clip.content}</a>`
                    : `<p>${clip.content}</p>`
                }
                <div class="clip-meta">
                    ${clip.type === "link" ? "🔗 Link" : "📝 Text"} •
                    ${new Date(clip.createdAt).toLocaleString()}
                </div>
                <div class="clip-actions">
                    <button class="copy-btn" onclick="copyClip(\`${clip.content}\`)">Copy</button>
                    <button class="danger" onclick="deleteClip(${clip.id})">Delete</button>
                </div>
            </div>
        `).join("");

    } catch (err) {
        console.error("Failed to load clips:", err);
    }
}

async function deleteClip(id) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    loadClips();
}

async function clearAll() {
    if (!confirm("Clear all nudged items?")) return;
    await fetch(API, { method: "DELETE" });
    loadClips();
}

function copyClip(text) {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
}

// Auto refresh every 3 seconds
loadClips();
setInterval(loadClips, 3000);