import { app, auth, db, storage } from "./firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

function mostrarAlerta(msg, tipo="info") { alert(msg); }

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cadastroForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // ✅ Pegando os valores corretamente
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const confirmarSenha = document.getElementById("confirmarSenha").value.trim();

    if (senha !== confirmarSenha) {
      return mostrarAlerta("As senhas não coincidem!");
    }

    try {
      // ✅ Adiciona novo documento à collection "pending_students"
      await addDoc(collection(db, "pending_students"), {
        nome,
        email,
        senha, // futuramente criptografar
        status: "aguardando"
      });

      mostrarAlerta("✅ Cadastro enviado para análise!");
      setTimeout(() => window.location.href = "/login.html", 1500);

    } catch (err) {
      console.error(err);
      mostrarAlerta("Erro ao cadastrar!");
    }
  });
});
