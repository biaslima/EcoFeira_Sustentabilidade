const API_URL = "http://localhost:3000/api/reports"; // URL da sua API

// --- Navegação ---
function showPage(pageId, event) {
  document
    .querySelectorAll(".page")
    .forEach((page) => page.classList.remove("active"));
  document
    .querySelectorAll(".nav-btn")
    .forEach((btn) => btn.classList.remove("active"));

  document.getElementById(pageId).classList.add("active");
  if (event) event.currentTarget.classList.add("active");

  if (pageId === "home") displayReports();
  if (pageId === "admin") displayPendingReports();
}

// --- Exibir denúncias aprovadas ---
async function displayReports() {
  const grid = document.getElementById("reportsGrid");
  try {
    const res = await fetch(API_URL, { cache: "no-cache" });
    const reports = await res.json();
    console.log("Reports recebidos:", reports); // <-- adicione este log

    if (!reports.length) {
      grid.innerHTML =
        '<p style="text-align:center;color:#666">Nenhuma denúncia aprovada ainda.</p>';
      return;
    }

    grid.innerHTML = reports
      .filter((r) => r.status === "approved")
      .map(
        (r) => `
        <div class="report-card">
          <div class="report-header">
          <h2 class="report-title">${r.title}</h2>
            <span class="report-type">${getReportTypeLabel(r.type)}</span>
            <span class="report-date">${formatDate(r.date)}</span>
          </div>
          <div class="report-location">📍 ${r.neighborhood} - ${
          r.location
        }</div>
          <div class="report-description">${r.description}</div>
          <div class="report-photo">
            ${
              r.photo
                ? `<img src="${r.photo}" alt="Foto">`
                : "📷 Sem foto disponível"
            }
          </div>
           ${
             document.getElementById("adminBtn").style.display === "block"
               ? `
                <div class="admin-actions">
                <button class="delete-btn" onclick="deleteReport('${r._id}')">🗑️ Excluir</button>
                </div>
            `
               : ""
           }
        </div>
      `
      )
      .join("");
  } catch (err) {
    console.error(err);
    grid.innerHTML =
      '<p style="text-align:center;color:#f44336">Erro ao carregar denúncias.</p>';
  }
}

// --- Formulário de envio ---
document.getElementById("reportForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = e.target.querySelector(".submit-btn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";

  const formData = {
    title: document.getElementById("title").value,
    type: document.getElementById("reportType").value,
    neighborhood: document.getElementById("neighborhood").value,
    location: document.getElementById("location").value,
    description: document.getElementById("description").value,
    photo:
      document.getElementById("photoPreview").querySelector("img")?.src || null,
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error("Erro ao enviar");

    showMessage("Denúncia enviada! Será analisada.", "success");
    e.target.reset();
    document.getElementById("photoPreview").innerHTML = "";
  } catch (err) {
    showMessage(err.message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar Denúncia";
  }
});
function toggleOtherTypeField() {
  const reportType = document.getElementById("reportType").value;
  const otherTypeField = document.getElementById("otherTypeField");
  if (reportType === "outros") {
    otherTypeField.style.display = "block";
  } else {
    otherTypeField.style.display = "none";
  }
}

// --- Upload e preview de fotos ---
function handlePhotoUpload(input) {
  const preview = document.getElementById("photoPreview");
  if (input.files && input.files[0]) {
    const file = input.files[0];
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      showMessage("Arquivo inválido ou maior que 5MB.", "error");
      input.value = "";
      preview.innerHTML = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `
        <div style="text-align:center;margin-top:1rem">
          <img src="${
            e.target.result
          }" style="max-width:100%;max-height:200px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
          <p style="color:#666;margin-top:0.5rem;font-size:0.9rem">📁 ${
            file.name
          } (${(file.size / 1024 / 1024).toFixed(1)}MB)</p>
          <button type="button" onclick="clearPhoto()" style="background:#f44336;color:white;border:none;padding:0.3rem 0.8rem;border-radius:4px;font-size:0.8rem;margin-top:0.5rem;cursor:pointer">Remover foto</button>
        </div>
      `;
    };
    reader.readAsDataURL(file);
  }
}
function clearPhoto() {
  document.getElementById("photo").value = "";
  document.getElementById("photoPreview").innerHTML = "";
}

// --- Mensagens ---
function showMessage(message, type = "success") {
  const div = document.createElement("div");
  div.style.cssText = `
    position: fixed; top:20px; right:20px; padding:1rem 1.5rem;
    border-radius:8px; color:white; font-weight:600; z-index:10000;
    animation: slideIn 0.3s ease; max-width:300px;
    box-shadow:0 4px 12px rgba(0,0,0,0.2);
  `;
  div.style.background =
    type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : "#2196F3";
  div.textContent = message;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

// --- Admin ---
let pendingReports = [];
async function displayPendingReports() {
  const container = document.getElementById("pendingReports");
  try {
    const res = await fetch(`${API_URL}/pending?t=${Date.now()}`, {
      cache: "no-cache",
    });
    const reports = await res.json();
    pendingReports = reports.filter((r) => r.status === "pending");

    if (!pendingReports.length) {
      container.innerHTML =
        '<p style="text-align:center;color:#666">Nenhuma denúncia pendente.</p>';
      return;
    }

    container.innerHTML = pendingReports
      .map(
        (r) => `
      <div class="report-card admin-card">
        <div class="report-header">
        <h2 class="report-title">${r.title}</h2>
          <span class="report-type">${getReportTypeLabel(r.type)}</span>
          <span class="report-date">${formatDate(r.date)}</span>
        </div>
        <div class="report-location">📍 ${r.neighborhood} - ${r.location}</div>
        <div class="report-description">${r.description}</div>
        <div class="report-photo">
          ${
            r.photo
              ? `<img src="${r.photo}" alt="Foto">`
              : "📷 Sem foto disponível"
          }
        </div>
        <div class="admin-actions">
            <button class="approve-btn" onclick="approveReport('${
              r._id
            }')">✅ Aprovar</button>
            <button class="reject-btn" onclick="rejectReport('${
              r._id
            }')">❌ Rejeitar</button>
        </div>
      </div>
    `
      )
      .join("");
  } catch (err) {
    console.error(err);
    container.innerHTML =
      '<p style="text-align:center;color:#f44336">Erro ao carregar denúncias pendentes.</p>';
  }
}

// --- Aprovar / Rejeitar ---
async function approveReport(id) {
  try {
    await fetch(`${API_URL}/approve/${id}`, { method: "PUT" });
    showMessage("Denúncia aprovada!", "success");

    pendingReports = pendingReports.filter((r) => r._id !== id);

    renderPendingReports();
    displayReports();
  } catch {
    showMessage("Erro ao aprovar denúncia.", "error");
  }
}

function renderPendingReports() {
  const container = document.getElementById("pendingReports");
  if (!pendingReports.length) {
    container.innerHTML =
      '<p style="text-align:center;color:#666">Nenhuma denúncia pendente.</p>';
    return;
  }

  container.innerHTML = pendingReports
    .map(
      (r) => `
      <div class="report-card admin-card">
        <div class="report-header">
        <h2 class="report-title">${r.title}</h2>
          <span class="report-type">${getReportTypeLabel(r.type)}</span>
          <span class="report-date">${formatDate(r.date)}</span>
        </div>
        <div class="report-location">📍 ${r.neighborhood} - ${r.location}</div>
        <div class="report-description">${r.description}</div>
        <div class="report-photo">
          ${
            r.photo
              ? `<img src="${r.photo}" alt="Foto">`
              : "📷 Sem foto disponível"
          }
        </div>
        <div class="admin-actions">
            <button class="approve-btn" onclick="approveReport('${
              r._id
            }')">✅ Aprovar</button>
            <button class="reject-btn" onclick="rejectReport('${
              r._id
            }')">❌ Rejeitar</button>

        </div>
      </div>
    `
    )
    .join("");
}

async function rejectReport(id) {
  try {
    // A rota para deletar é /:id com o método DELETE
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    showMessage("Denúncia rejeitada e apagada.", "info"); // Mensagem mais clara
    displayPendingReports();
  } catch {
    showMessage("Erro ao rejeitar denúncia.", "error");
  }
}

async function deleteReport(id) {
  const confirmDelete = confirm("Tem certeza que deseja apagar esta denúncia?");
  if (!confirmDelete) return;

  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    showMessage("Denúncia apagada com sucesso.", "success");
    displayReports(); // Recarrega a lista
    displayPendingReports(); // Atualiza painel admin caso necessário
  } catch (err) {
    showMessage("Erro ao apagar denúncia.", "error");
    console.error(err);
  }
}

// --- Funções auxiliares ---
function getReportTypeLabel(type) {
  const types = {
    lixo: "Descarte de Lixo",
    "poluicao-agua": "Poluição da Água",
    "poluicao-ar": "Poluição do Ar",
    desmatamento: "Desmatamento",
    queimada: "Queimada Irregular",
    outros: "Outros",
  };
  return types[type] || "Não especificado";
}
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR");
}

// --- Inicialização ---
document.addEventListener("DOMContentLoaded", () => {
  displayReports();

  // Ativar admin com Ctrl+Shift+A
  let attempts = 0;
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === "A") {
      attempts++;
      if (attempts >= 3) {
        showMessage("Muitas tentativas. Aguarde 30s.", "error");
        return;
      }
      const pwd = prompt("🔐 Senha do administrador:");
      if (pwd === "admin123") {
        document.getElementById("adminBtn").style.display = "block";
        showMessage("🛡️ Modo administrador ativado!", "success");
        attempts = 0;

        if (document.getElementById("home").classList.contains("active")) {
          displayReports();
        }
      } else if (pwd) showMessage("❌ Senha incorreta!", "error");
    }
  });
  setInterval(() => {
    attempts = 0;
  }, 30000);
});

// --- Estilos para animação de mensagens ---
const style = document.createElement("style");
style.textContent = `
@keyframes slideIn {
  from { transform: translateX(100%); opacity:0; }
  to { transform: translateX(0); opacity:1; }
}`;
document.head.appendChild(style);
