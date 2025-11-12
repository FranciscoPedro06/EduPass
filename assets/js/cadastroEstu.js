import { app, auth, db, storage } from "./firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

function mostrarAlerta(msg, tipo="info") { alert(msg); }
backButton.addEventListener("click", () => window.history.back());

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cadastroForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // === PEGAR VALORES DO FORM ===
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const confirmarSenha = document.getElementById("confirmarSenha").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const instituicao = document.getElementById("instituicao").value.trim();
    const curso = document.getElementById("curso").value.trim();
    const turno = document.getElementById("turno").value.trim();

    if (senha !== confirmarSenha) {
      return mostrarAlerta("As senhas não coincidem!");
    }

    if (!nome || !email || !cpf || !instituicao || !curso || !turno) {
      return mostrarAlerta("Preencha todos os campos obrigatórios!");
    }

    try {
      // === SALVAR NO FIRESTORE ===
      await addDoc(collection(db, "pending_students"), {
        nome,
        email,
        senha, // futuramente criptografar
        cpf,
        instituicao,
        curso,
        turno,
        status: "aguardando",
        estudante: true,
        foto: "" // campo reservado para futura integração com upload
      });

      // === SALVAR E-MAIL NA SESSÃO ===
      sessionStorage.setItem("usuarioLogado", email);

      mostrarAlerta("✅ Cadastro enviado com sucesso! Aguarde a aprovação do administrador.");
      setTimeout(() => window.location.href = "/index.html", 1500);

    } catch (err) {
      console.error(err);
      mostrarAlerta("Erro ao cadastrar!");
    }
  });
});

// === ATUALIZAÇÃO VISUAL DOS ANEXOS ===
document.addEventListener("DOMContentLoaded", () => {
  const fileInputs = document.querySelectorAll(".file-input");

  fileInputs.forEach(input => {
    const label = input.nextElementSibling;
    const fileNameSpan = label.querySelector(".file-name");
    const labelText = label.querySelector(".file-label-text");

    input.addEventListener("change", () => {
      if (input.files && input.files.length > 0) {
        // Nome do arquivo selecionado
        const nomeArquivo = input.files[0].name;

        // Atualiza texto e aparência
        fileNameSpan.textContent = nomeArquivo;
        label.classList.add("selected");
        labelText.textContent = "✅ Arquivo anexado";
      } else {
        // Caso o usuário remova o arquivo
        fileNameSpan.textContent = "";
        label.classList.remove("selected");
        labelText.textContent = "Anexar arquivo (.pdf, .jpg, .png)";
      }
    });
  });
});


