import { app, auth, db, storage } from "./firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
// ⚠️ Lembre-se de importar o Auth para corrigir a senha!
// import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
// ⚠️ Lembre-se de importar o Storage para os arquivos!
// import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js";

// === ALERTA UNIFICADO ===
function mostrarAlerta(msg, tipo = "info") {
  alert(msg); // (Substitua pelo seu alerta)
}

document.getElementById("backButton").addEventListener("click", () => window.history.back());

// === LÓGICA PRINCIPAL (TUDO EM UM DOMContentLoaded) ===
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cadastroForm");
  const modalTermo = document.getElementById("modalTermo");
  const btnAceitarTermo = document.getElementById("btnAceitarTermo");
  const btnCancelarTermo = document.getElementById("btnCancelarTermo");
  const checkboxTermo = document.getElementById("checkboxTermo");

  let dadosCadastro = null;

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

  // === Aceitar Termo (MODIFICADO PARA REDIRECIONAR) ===
  btnAceitarTermo.addEventListener("click", async () => {
    modalTermo.classList.add("hidden");

    try {
      // 🚨 ALERTA DE SEGURANÇA: Corrija isso! Use Firebase Auth.
      // 1. Crie o usuário no Auth (ex: createUserWithEmailAndPassword)
      // 2. Pegue o UID retornado
      // 3. Remova a senha do 'dadosCadastro'

      
      // 🚨 LÓGICA FALTANDO: Faça o upload dos 5 arquivos para o Storage aqui
      // e adicione as URLs de download ao 'dadosCadastro'.

      // Salva dados no Firestore
      const docRef = await addDoc(collection(db, "pending_students"), dadosCadastro);

      // Salva e-mail do usuário na sessão (para o novo login)
      sessionStorage.setItem("usuarioLogado", dadosCadastro.email);

      mostrarAlerta("✅ Cadastro enviado! Agora, vamos cadastrar seu rosto.", "sucesso");

      // === MUDANÇA PRINCIPAL: REDIRECIONAR ===
      setTimeout(() => {
        // Passa o modo, o ID do documento, e o nome pela URL
        window.location.href = `reconhecimentoFace.html?modo=cadastro&id=${docRef.id}&nome=${dadosCadastro.nome}`;
      }, 2000);

    } catch (err) {
      console.error(err);
      mostrarAlerta("Erro ao salvar cadastro: " + err.message, "erro");
    }
  });

  // === Envio do Formulário ===
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Pega valores do formulário
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const confirmarSenha = document.getElementById("confirmarSenha").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const instituicao = document.getElementById("instituicao").value.trim();
    const curso = document.getElementById("curso").value.trim();
    const turno = document.getElementById("turno").value.trim();
    
    // 🚨 Pegue os arquivos aqui (ex: const fotoFile = document.getElementById("foto").files[0];)

    // Validações
    if (senha !== confirmarSenha) return mostrarAlerta("As senhas não coincidem!", "aviso");
    if (!nome || !email || !cpf || !instituicao || !curso || !turno)
      return mostrarAlerta("Preencha todos os campos obrigatórios!", "aviso");
    // 🚨 Valide os arquivos aqui

    // Guarda dados temporariamente
    dadosCadastro = {
      nome,
      email,
      senha, // 🚨 Lembre-se de remover isso ao usar Auth
      cpf,
      instituicao,
      curso,
      turno,
      status: "aguardando",
      estudante: true,
      foto: "", // 🚨 Preencher com a URL da foto 3x4 após upload
      // 🚨 Adicione os outros arquivos aqui (residenciaUrl, tituloUrl, etc.)
    };

    modalTermo.classList.remove("hidden");
  });

  // === ATUALIZAÇÃO VISUAL DOS ANEXOS ===
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
        labelText.textContent = "Arquivo anexado";
      } else {
        fileNameSpan.textContent = "";
        label.classList.remove("selected");
        labelText.textContent = "Anexar arquivo (.pdf, .jpg, .png)";
      }
    });
  });
});