import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

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
document.getElementById("loginForm").addEventListener("submit", async (e) => {
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

    mostrarAlerta("Login realizado com sucesso!", "success");

    // ===== Verifica tipo de usuário =====
    const role = await identificarTipoUsuario(uid, email);

    // ===== Redireciona conforme o tipo =====
    if (role === "motorista") {
      sessionStorage.setItem("usuarioLogado", email);
      setTimeout(() => window.location.href = "telaInicioMot.html", 1000);
    } else if (role === "estudante") {
      sessionStorage.setItem("usuarioLogado", email);
      setTimeout(() => window.location.href = "telaInicioEstu.html", 1000);
    } else{
      sessionStorage.setItem("usuarioLogado", email);
      setTimeout(() => window.location.href = "telaInicioAdm.html", 1000);
    }
    
    if (!role) {
      mostrarAlerta("Sua conta ainda está em análise. Aguarde aprovação do administrador.", "error");
      return;
    }

  } catch (error) {
    console.error(error);
    mostrarAlerta("E-mail ou senha inválidos!", "error");
  }
});

// ===== Função para identificar tipo de usuário =====
async function identificarTipoUsuario(uid, email) {
  const colecoes = [
    { nome: "pending_motorists", tipo: "motorista" },
    { nome: "students", tipo: "estudante" },
    { nome: "admins", tipo: "admin" }
  ];

  for (const col of colecoes) {
    const q = query(collection(db, col.nome), where("email", "==", email));
    const snap = await getDocs(q);
    if (!snap.empty) return col.tipo;
  }

  return null; // caso não encontre
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

