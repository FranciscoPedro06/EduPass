import { db } from "./firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  updateDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// ===== FUNÇÃO DE ALERTA =====
function mostrarAlerta(msg, tipo = "info") {
  alert(msg);
  console.log(`[${tipo.toUpperCase()}] ${msg}`);
}

// ====== FUNÇÃO PARA VERIFICAR NOTIFICAÇÕES ======
async function verificarNotificacoes(email) {
  if (!email) return;

  try {
    const q = query(
      collection(db, "notifications"),
      where("userEmail", "==", email),
      where("read", "==", false),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("📭 Nenhuma notificação nova para", email);
      return;
    }

    snapshot.forEach(async (docSnap) => {
      const notif = docSnap.data();

      // Evita mostrar notificação sem mensagem
      if (notif.message) mostrarAlerta(notif.message, notif.type);

      // Marca como lida
      const ref = doc(db, "notifications", docSnap.id);
      await updateDoc(ref, { read: true });
    });
  } catch (err) {
    console.error("Erro ao verificar notificações:", err);
  }
}

// ===== LÓGICA DO DASHBOARD =====
document.addEventListener("DOMContentLoaded", async () => {
  const emailLogado = sessionStorage.getItem("usuarioLogado");

  if (!emailLogado) {
    mostrarAlerta("Nenhum usuário logado. Faça login novamente.");
    setTimeout(() => (window.location.href = "index.html"), 1500);
    return;
  }



  // Elementos da interface
  const titulo = document.getElementById("titulo");
  const studentNameEl = document.getElementById("studentName");
  const studentInstitutionEl = document.getElementById("studentInstitution");
  const studentCourseEl = document.getElementById("studentCourse");
  const studentShiftEl = document.getElementById("studentShift");
  const studentCPFEl = document.getElementById("studentCPF");
  const studentStatusEl = document.getElementById("studentStatus");
  const userPhotoEl = document.getElementById("userPhoto");
  const userAvatarEl = document.getElementById("userAvatar");
  const qrCodePlaceholderEl = document.getElementById("qrCodePlaceholder");
  const logoutButton = document.getElementById("logoutButton");

  try {
    // === BUSCAR ESTUDANTE PELO E-MAIL ===
    const q = query(collection(db, "students"), where("email", "==", emailLogado));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      mostrarAlerta("Estudante não encontrado no sistema.");
      return;
    }

    const estudante = snapshot.docs[0].data();

    // === SAUDAÇÃO DINÂMICA ===
    const hora = new Date().getHours();
    let saudacao = "Olá";
    if (hora >= 5 && hora < 12) {
      saudacao = "Bom dia";
    } else if (hora >= 12 && hora < 18) {
      saudacao = "Boa tarde";
    } else if (hora >= 18 && hora <= 23) {
      saudacao = "Boa noite";
    } else {
      saudacao = "Boa madrugada";
    }

    if (titulo) {
      titulo.textContent = `${saudacao}, ${estudante.nome || "Estudante"}! 🌟`;
    }

    // === PREENCHER DADOS NA TELA ===
    if (studentNameEl) studentNameEl.textContent = estudante.nome || "Sem nome";
    if (studentInstitutionEl)
      studentInstitutionEl.innerHTML = `<span class="info-label">INSTITUIÇÃO:</span> ${estudante.instituicao || "Não informada"}`;
    if (studentCourseEl)
      studentCourseEl.innerHTML = `<span class="info-label">CURSO:</span> ${estudante.curso || "Não informado"}`;
    if (studentShiftEl)
      studentShiftEl.innerHTML = `<span class="info-label">TURNO:</span> ${estudante.turno || "Não informado"}`;
    if (studentCPFEl)
      studentCPFEl.innerHTML = `<span class="info-label">CPF:</span> ${estudante.cpf || "Não informado"}`;

    // === STATUS ===
    const status = estudante.status || "aguardando";
    if (studentStatusEl) {
      studentStatusEl.textContent = status;
      studentStatusEl.className = `status-badge status-${status}`;
    }

    // === FOTO ===
    if (estudante.foto) {
      if (userPhotoEl) userPhotoEl.style.backgroundImage = `url(${estudante.foto})`;
      if (userAvatarEl) userAvatarEl.style.backgroundImage = `url(${estudante.foto})`;
    }

    // === QR CODE ===
    if (qrCodePlaceholderEl) {
      qrCodePlaceholderEl.innerHTML = ""; // limpa texto "Carregando..."
      try {
        new QRCode(qrCodePlaceholderEl, {
          text: emailLogado,
          width: 200,
          height: 200,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H,
        });
      } catch (e) {
        console.error("Erro ao gerar QR Code:", e);
        qrCodePlaceholderEl.textContent = "Erro ao gerar QR Code.";
      }
    }

    // 🔔 Verifica notificações do estudante após carregar dados
    await verificarNotificacoes(estudante.email);

  } catch (error) {
    console.error("Erro ao carregar dados do estudante:", error);
    mostrarAlerta("Erro ao buscar dados do estudante.", "erro");
  }

  // === LOGOUT ===
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      sessionStorage.clear();
      window.location.href = "index.html";
    });
  }
});
