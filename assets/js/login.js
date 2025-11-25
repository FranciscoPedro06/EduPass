import { auth, db } from "./firebase-config.js";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import { 
  getDocs, 
  collection, 
  query, 
  where 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// ===== Sistema de Alertas =====
function mostrarAlerta(mensagem, tipo = 'error') {
  let container = document.getElementById('alert-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'alert-container';
    container.className = 'alert-container';
    document.body.appendChild(container);
  }
  const alert = document.createElement('div');
  alert.className = `alert alert-${tipo}`;
  alert.textContent = mensagem;
  container.appendChild(alert);
  setTimeout(() => {
    alert.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => alert.remove(), 300);
  }, 3500);
}

// ===== Validações =====
function validarEmail(email) {
  if (!email.trim()) return { valido: false, mensagem: "E-mail é obrigatório!" };
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return { valido: false, mensagem: "E-mail inválido!" };
  return { valido: true };
}

function validarSenha(senha) {
  if (!senha.trim()) return { valido: false, mensagem: "Senha é obrigatória!" };
  if (senha.length < 6) return { valido: false, mensagem: "Senha mínima de 6 dígitos!" };
  return { valido: true };
}

// ===== LOGIN =====
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const forgotBtn = document.querySelector(".forgot-password"); // <--- corrige o seletor

  // === LOGIN ===
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("password").value;

    const validEmail = validarEmail(email);
    const validPass = validarSenha(senha);

    if (!validEmail.valido) return mostrarAlerta(validEmail.mensagem);
    if (!validPass.valido) return mostrarAlerta(validPass.mensagem);

    try {
  const credenciais = await signInWithEmailAndPassword(auth, email, senha);
  const uid = credenciais.user.uid;

  const role = await identificarTipoUsuario(uid, email);

  if (!role) {
    mostrarAlerta("Sua conta ainda está em análise. Aguarde aprovação do administrador.", "error");
    return;
  }

  mostrarAlerta("Login realizado com sucesso!", "success");
  sessionStorage.setItem("usuarioLogado", email);

 if (role === "motorista") {

  sessionStorage.setItem("usuarioLogado", email);
  sessionStorage.setItem("emailMotorista", email); // <-- ESSENCIAL

  setTimeout(() => window.location.href = "telaInicioMot.html", 1000);
  } else if (role === "estudante") {
    setTimeout(() => window.location.href = "telaInicioEstu.html", 1000);
  } else {
    setTimeout(() => window.location.href = "telaInicioAdm.html", 1000);
  }

} catch (error) {
  console.error(error);
  if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
    mostrarAlerta("E-mail ou senha inválidos!", "error");
  } else if (error.code === "auth/user-not-found") {
    mostrarAlerta("Usuário não encontrado!", "error");
  } else {
    mostrarAlerta("Erro inesperado ao fazer login.", "error");
  }
}

  });

  // === ESQUECEU A SENHA ===
  forgotBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();

    if (!email) {
      return mostrarAlerta("Digite seu e-mail para redefinir a senha!");
    }

    try {
      await sendPasswordResetEmail(auth, email);
      mostrarAlerta(`📧 Um e-mail de redefinição foi enviado para ${email}`, "success");
    } catch (error) {
      console.error(error);
      if (error.code === "auth/user-not-found") {
        mostrarAlerta("Nenhum usuário encontrado com este e-mail!");
      } else if (error.code === "auth/invalid-email") {
        mostrarAlerta("E-mail inválido!");
      } else {
        mostrarAlerta("Erro ao enviar e-mail de redefinição.");
      }
    }
  });
});

// ===== Função para identificar tipo de usuário =====
async function identificarTipoUsuario(uid, email) {
  try {
    const colecoes = [
      { nome: "motoristas", tipo: "motorista" },
      { nome: "students", tipo: "estudante" },
      { nome: "admins", tipo: "admin" }
    ];

    for (const col of colecoes) {
      const q = query(collection(db, col.nome), where("email", "==", email));
      const snap = await getDocs(q);
      if (!snap.empty) return col.tipo;
    }

    return null; // não encontrado
  } catch (error) {
    console.error("Erro ao identificar tipo de usuário:", error);
    return null; // em caso de erro, retorna null ao invés de lançar exceção
  }
}


// ===== LOGOUT =====
if (document.getElementById("logoutBtn")) {
  document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth).then(() => {
      sessionStorage.clear();
      window.location.href = "index.html";
    });
  });
}

// ===== Mostrar / ocultar senha =====
window.togglePassword = function () {
  const input = document.getElementById("password");
  const btn = document.querySelector(".password-toggle svg");

  if (input.type === "password") {
    input.type = "text";
    btn.style.opacity = "0.6";
  } else {
    input.type = "password";
    btn.style.opacity = "1";
  }
};
