import { auth } from "./firebase-config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";


// ====== FUNÇÃO GLOBAL DE ALERTA ======
function mostrarAlerta(mensagem, tipo = "info") {
  let container = document.getElementById("container-alertas");
  if (!container) {
    container = document.createElement("div");
    container.id = "container-alertas";
    document.body.appendChild(container);
  }

  const alerta = document.createElement("div");
  alerta.className = `alerta alerta-${tipo}`;
  alerta.textContent = mensagem;
  container.appendChild(alerta);

  setTimeout(() => {
    alerta.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => alerta.remove(), 300);
  }, 4000);
}

// ====== LÓGICA DO DASHBOARD MOTORISTA ======
document.addEventListener("DOMContentLoaded", () => {
  const notificationsButton = document.getElementById("notificationsButton");
  const logoutButton = document.getElementById("logoutButton");

  // Notificação simulada
  if (notificationsButton) {
    notificationsButton.addEventListener("click", () => {
      mostrarAlerta("Você tem 2 novas viagens disponíveis.", "info");
    });
  }

  // Logout do Firebase
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      try {
        await signOut(auth);
        sessionStorage.clear();
        mostrarAlerta("Logout realizado com sucesso!", "sucesso");
        setTimeout(() => (window.location.href = "index.html"), 1500);
      } catch (erro) {
        console.error("Erro ao fazer logout:", erro);
        mostrarAlerta("Erro ao fazer logout. Tente novamente.", "erro");
      }
    });
  }
});
