import { db } from "/assets/js/firebase-config.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// ===== FUNÇÃO DE ALERTA =====
function mostrarAlerta(mensagem, tipo = 'info') {
  let container = document.getElementById('container-alertas');
  if (!container) {
    container = document.createElement('div');
    container.id = 'container-alertas';
    document.body.appendChild(container);
  }
  const alerta = document.createElement('div');
  alerta.className = `alerta alerta-${tipo}`;
  alerta.textContent = mensagem;
  container.appendChild(alerta);
  setTimeout(() => {
    alerta.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => alerta.remove(), 300);
  }, 4000);
}

// ===== LÓGICA DO DASHBOARD =====
document.addEventListener("DOMContentLoaded", async () => {
  const emailLogado = sessionStorage.getItem("usuarioLogado");
  if (!emailLogado) {
    mostrarAlerta("Nenhum usuário logado. Faça login novamente.", "erro");
    setTimeout(() => window.location.href = "index.html", 2000);
    return;
  }

  // Elementos da UI
  const studentNameEl = document.getElementById('studentName');
  const studentInstitutionEl = document.getElementById('studentInstitution');
  const studentCourseEl = document.getElementById('studentCourse');
  const studentShiftEl = document.getElementById('studentShift');
  const studentCPFEl = document.getElementById('studentCPF');
  const studentStatusEl = document.getElementById('studentStatus');
  const userPhotoEl = document.getElementById('userPhoto');
  const userAvatarEl = document.getElementById('userAvatar');
  const qrCodePlaceholderEl = document.getElementById('qrCodePlaceholder');
  const logoutButton = document.getElementById('logoutButton');

  try {
    // Busca o estudante pelo e-mail
    const q = query(collection(db, "students"), where("email", "==", emailLogado));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      mostrarAlerta("Estudante não encontrado no sistema.", "erro");
      return;
    }

    const estudante = snapshot.docs[0].data();

    // Preenche a tela com os dados vindos do Firestore
    if (studentNameEl) studentNameEl.textContent = estudante.nome || "Sem nome";
    if (studentInstitutionEl) studentInstitutionEl.innerHTML = `<span class="info-label">INSTITUIÇÃO:</span> ${estudante.instituicao || "Não informada"}`;
    if (studentCourseEl) studentCourseEl.innerHTML = `<span class="info-label">CURSO:</span> ${estudante.curso || "Não informado"}`;
    if (studentShiftEl) studentShiftEl.innerHTML = `<span class="info-label">TURNO:</span> ${estudante.turno || "Não informado"}`;
    if (studentCPFEl) studentCPFEl.innerHTML = `<span class="info-label">CPF:</span> ${estudante.cpf || "Não informado"}`;

    // Status
    const status = estudante.status || "cadastrado";
    if (studentStatusEl) {
      studentStatusEl.textContent = status;
      studentStatusEl.className = `status-badge status-${status}`;
    }

    // Foto
    if (estudante.foto) {
      if (userPhotoEl) userPhotoEl.style.backgroundImage = `url(${estudante.foto})`;
      if (userAvatarEl) userAvatarEl.style.backgroundImage = `url(${estudante.foto})`;
    }

    // Placeholder de QR Code
    if (qrCodePlaceholderEl) {
      qrCodePlaceholderEl.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      `;
    }

  } catch (error) {
    console.error("Erro ao carregar dados do estudante:", error);
    mostrarAlerta("Erro ao buscar dados do estudante.", "erro");
  }

  // Logout
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      sessionStorage.clear();
      window.location.href = "index.html";
    });
  }
});




