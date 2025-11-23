import { app, auth, db, storage } from "./firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

import { supabase } from "./supabase-client.js";

// Função de upload genérica
async function uploadParaSupabase(file, path) {
  const { data, error } = await supabase.storage
    .from("edupass")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true
    });

  if (error) throw error;

  const { data: urlInfo } = supabase.storage
    .from("edupass")
    .getPublicUrl(path);

  return urlInfo.publicUrl;
}

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
    const basePath = `alunos/${dadosCadastro.cpf}`;

    // === UPLOAD SUPABASE ===

    // Foto 3x4
    dadosCadastro.foto3x4Url = await uploadParaSupabase(
      dadosCadastro.foto3x4,
      `${basePath}/foto3x4.${dadosCadastro.foto3x4.name.split(".").pop()}`
    );

    // Comprovante de residência
    dadosCadastro.residenciaUrl = await uploadParaSupabase(
      dadosCadastro.comprovanteResidencia,
      `${basePath}/comprovante_residencia.${dadosCadastro.comprovanteResidencia.name.split(".").pop()}`
    );

    // Título de eleitor
    dadosCadastro.tituloUrl = await uploadParaSupabase(
      dadosCadastro.tituloEleitor,
      `${basePath}/titulo_eleitor.${dadosCadastro.tituloEleitor.name.split(".").pop()}`
    );

    // RG
    dadosCadastro.rgUrl = await uploadParaSupabase(
      dadosCadastro.documentoRG,
      `${basePath}/rg.${dadosCadastro.documentoRG.name.split(".").pop()}`
    );

    // CPF
    dadosCadastro.cpfUrl = await uploadParaSupabase(
      dadosCadastro.documentoCPF,
      `${basePath}/cpf.${dadosCadastro.documentoCPF.name.split(".").pop()}`
    );

    dadosCadastro.foto = dadosCadastro.foto3x4Url;

    // === Remover arquivos antes de salvar no Firestore ===
    delete dadosCadastro.foto3x4;
    delete dadosCadastro.comprovanteResidencia;
    delete dadosCadastro.tituloEleitor;
    delete dadosCadastro.documentoRG;
    delete dadosCadastro.documentoCPF;
     

    // === Salvar no Firestore (NÃO MUDEI NADA) ===
    const docRef = await addDoc(collection(db, "pending_students"), dadosCadastro);

    sessionStorage.setItem("usuarioLogado", dadosCadastro.email);

    mostrarAlerta("✅ Cadastro enviado! Agora, vamos cadastrar seu rosto.", "sucesso");

    setTimeout(() => {
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

  // === ARQUIVOS ===
  const foto3x4 = document.getElementById("foto3x4").files[0];
  const comprovanteResidencia = document.getElementById("comprovanteResidencia").files[0];
  const tituloEleitor = document.getElementById("tituloEleitor").files[0];
  const documentoRG = document.getElementById("documentoRG").files[0];
  const documentoCPF = document.getElementById("documentoCPF").files[0];

  // Validações
  if (senha !== confirmarSenha) return mostrarAlerta("As senhas não coincidem!", "aviso");
  if (!nome || !email || !cpf || !instituicao || !curso || !turno)
    return mostrarAlerta("Preencha todos os campos obrigatórios!", "aviso");

  if (!foto3x4 || !comprovanteResidencia || !tituloEleitor || !documentoRG || !documentoCPF)
    return mostrarAlerta("Envie todos os documentos!", "aviso");

  // Guarda dados temporariamente
  dadosCadastro = {
    nome,
    email,
    senha, 
    cpf,
    instituicao,
    curso,
    turno,
    status: "aguardando",
    estudante: true,

    // URLs que serão preenchidas depois
    foto3x4Url: "",
    residenciaUrl: "",
    tituloUrl: "",
    rgUrl: "",
    cpfUrl: "",

    // arquivos temporários
    foto3x4,
    comprovanteResidencia,
    tituloEleitor,
    documentoRG,
    documentoCPF,
  };

  modalTermo.classList.remove("hidden");
});


  // === ATUALIZAÇÃO VISUAL DOS ANEXOS ===
document.querySelectorAll(".file-input").forEach(input => {
  const label = input.nextElementSibling;
  const fileLabelText = label.querySelector(".file-label-text");
  const fileName = label.querySelector(".file-name");

  input.addEventListener("change", () => {
    const file = input.files[0];

    if (file) {
      fileLabelText.textContent = "Arquivo anexado";
      fileName.textContent = file.name;
      label.classList.add("selected");
    } else {
      fileLabelText.textContent = "Anexar arquivo (.pdf, .jpg, .png)";
      fileName.textContent = "";
      label.classList.remove("selected");
    }
  });
});
});


