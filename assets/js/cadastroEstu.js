import { app, auth, db, storage } from "./firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// === ALERTA UNIFICADO ===
function mostrarAlerta(msg, tipo = "info") {
  alert(msg); // pode trocar depois pelo seu alerta estilizado
}

// === LÓGICA PRINCIPAL ===
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cadastroForm");
  const modalTermo = document.getElementById("modalTermo");
  const btnAceitarTermo = document.getElementById("btnAceitarTermo");
  const btnCancelarTermo = document.getElementById("btnCancelarTermo");
  const checkboxTermo = document.getElementById("checkboxTermo");

  let dadosCadastro = null; // variável temporária para guardar dados antes de enviar

  // === Habilita botão ao marcar checkbox ===
  checkboxTermo.addEventListener("change", () => {
    btnAceitarTermo.disabled = !checkboxTermo.checked;
  });

  // === Cancelar Termo ===
  btnCancelarTermo.addEventListener("click", () => {
    modalTermo.classList.add("hidden");
    checkboxTermo.checked = false;
    btnAceitarTermo.disabled = true;
  });

  // === Aceitar Termo ===
  btnAceitarTermo.addEventListener("click", async () => {
    modalTermo.classList.add("hidden");

    try {
      // salva dados no Firestore
      await addDoc(collection(db, "pending_students"), dadosCadastro);

      // salva e-mail do usuário na sessão
      sessionStorage.setItem("usuarioLogado", dadosCadastro.email);

      mostrarAlerta("✅ Cadastro enviado com sucesso! Aguarde a aprovação do administrador.");
      setTimeout(() => window.location.href = "/index.html", 1500);
    } catch (err) {
      console.error(err);
      mostrarAlerta("Erro ao cadastrar!");
    }
  });

  // === Quando o usuário tenta enviar o formulário ===
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // pega valores do formulário
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const confirmarSenha = document.getElementById("confirmarSenha").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const instituicao = document.getElementById("instituicao").value.trim();
    const curso = document.getElementById("curso").value.trim();
    const turno = document.getElementById("turno").value.trim();

    // validações
    if (senha !== confirmarSenha) return mostrarAlerta("As senhas não coincidem!");
    if (!nome || !email || !cpf || !instituicao || !curso || !turno)
      return mostrarAlerta("Preencha todos os campos obrigatórios!");

    // guarda dados temporariamente e exibe o termo
    dadosCadastro = {
      nome,
      email,
      senha, // (futuramente criptografar)
      cpf,
      instituicao,
      curso,
      turno,
      status: "aguardando",
      estudante: true,
      foto: ""
    };

    modalTermo.classList.remove("hidden");
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
        const nomeArquivo = input.files[0].name;
        fileNameSpan.textContent = nomeArquivo;
        label.classList.add("selected");
        labelText.textContent = "✅ Arquivo anexado";
      } else {
        fileNameSpan.textContent = "";
        label.classList.remove("selected");
        labelText.textContent = "Anexar arquivo (.pdf, .jpg, .png)";
      }
    });
  });
});
