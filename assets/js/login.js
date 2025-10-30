// ===== IMPORT FIREBASE AUTH =====
import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// ===== FUNÇÕES =====
function togglePassword() {
  const input = document.getElementById('password');
  input.type = input.type === 'password' ? 'text' : 'password';
}

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

// ===== VALIDAÇÃO =====
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
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("password").value;

  const validEmail = validarEmail(email);
  const validPass = validarSenha(senha);

  if (!validEmail.valido) return mostrarAlerta(validEmail.mensagem);
  if (!validPass.valido) return mostrarAlerta(validPass.mensagem);

  try {
    await signInWithEmailAndPassword(auth, email, senha);

    mostrarAlerta("Login realizado com sucesso!", "success");
    sessionStorage.setItem("usuarioLogado", email);

    setTimeout(() => {
      window.location.href = "telaInicioAdm.html";
    }, 1000);

  } catch (error) {
    console.error(error);
    mostrarAlerta("E-mail ou senha inválidos!", "error");
  }
});

// ===== LOGOUT =====
if (document.getElementById("logoutBtn")) {
  document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth).then(() => {
      sessionStorage.clear();
      window.location.href = "login.html";
    });
  });
}
