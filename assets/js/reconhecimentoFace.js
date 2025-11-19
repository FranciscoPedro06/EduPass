import { db } from "./firebase-config.js"; 
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js"; 

// ===== CONSTANTES GLOBAIS =====
const API_URL = "https://unpoetically-stampedable-lorena.ngrok-free.dev"; 

const video = document.getElementById("video");
const message = document.getElementById("message");
const popup1 = document.getElementById("popup1");
const popup2 = document.getElementById("popup2");
const backButton = document.getElementById("backButton");
const btnVerificarRosto = document.getElementById("btnVerificarRosto"); // O botão de captura/verificação

// Variáveis de Estado (lidas da URL)
let modo = null;         // 'cadastro' ou 'verificar'
let docId = null;        // ID do documento (para modo cadastro)
let nomeAluno = null;    // Nome do aluno (para modo cadastro)
let streamAtivo = null;


function mostrarAlerta(mensagem, tipo = 'info') {
  let containerAlertas = document.getElementById('container-alertas');
  if (!containerAlertas) {
    containerAlertas = document.createElement('div');
    containerAlertas.id = 'container-alertas';
    document.body.appendChild(containerAlertas);
  }

  let tipoClasse = 'alerta-info';
  switch (tipo) {
    case 'sucesso': tipoClasse = 'alerta-sucesso'; break;
    case 'erro': tipoClasse = 'alerta-erro'; break;
    case 'aviso': tipoClasse = 'alerta-aviso'; break;
  }

  const alerta = document.createElement('div');
  alerta.className = `alerta ${tipoClasse}`;
  alerta.innerHTML = mensagem;
  containerAlertas.appendChild(alerta);

  setTimeout(() => {
    alerta.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      alerta.remove();
      if (containerAlertas.children.length === 0) containerAlertas.remove();
    }, 300);
  }, 4000);
}

function pararCamera() {
  if (streamAtivo) {
    streamAtivo.getTracks().forEach((track) => track.stop());
    streamAtivo = null;
    console.log("Stream da câmera encerrado");
  }
}

async function startCamera() {
  try {
    let facingMode;

    if (modo === 'cadastro') {
      facingMode = 'user'; 
    } else {
      facingMode = 'environment';
    }

    message.textContent = "Abrindo câmera...";
    message.classList.remove("error-message");

    streamAtivo = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });

    video.srcObject = streamAtivo;

    video.onloadedmetadata = () => {
      video.classList.add("loaded");
      btnVerificarRosto.style.display = "block"; // Mostra o botão
      
      // Espelha o vídeo se for a câmera frontal
      video.style.transform = (facingMode === 'user') ? "scaleX(-1)" : "none";
      
      // Muda o texto do botão e da mensagem
      if (modo === 'cadastro') {
        message.textContent = "Posicione o rosto para cadastrar";
        btnVerificarRosto.textContent = " Cadastrar Rosto";
      } else {
        message.textContent = "Posicione o rosto para verificar";
        btnVerificarRosto.textContent = "📸 Verificar Rosto";
      }
    };

  } catch (error) {
    console.error("[v0] Erro ao acessar a câmera:", error);
    message.classList.add("error-message");
    if (error.name === "NotAllowedError") {
      message.textContent = "Permissão da câmera negada.";
    } else {
      message.textContent = "Erro ao iniciar a câmera.";
    }
  }
}

// ===== LÓGICA DE CAPTURA E API =====

btnVerificarRosto.addEventListener("click", () => {
  if (!streamAtivo) return;

  message.textContent = "Processando...";
  btnVerificarRosto.disabled = true;

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  
  // Corrige o espelhamento ao desenhar no canvas
  if (video.style.transform === "scaleX(-1)") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(async (blob) => {
    // AQUI O SCRIPT DECIDE O QUE FAZER
    if (modo === 'cadastro') {
      await cadastrarRostoAPI(blob);
    } else {
      await verificarRostoAPI(blob);
    }
  }, 'image/jpeg', 0.8);
});

// FUNÇÃO 1: Cadastrar Rosto (para Alunos)
async function cadastrarRostoAPI(blob) {
  try {
    const formData = new FormData();
    formData.append('file', blob, 'rosto.jpg');
    formData.append('nome', nomeAluno); // Usa o nome vindo da URL

    const response = await fetch(`${API_URL}/cadastrar`, { // Endpoint /cadastrar
      method: 'POST',
      body: formData
    });
    const data = await response.json();

    if (data.success) {
      const facialId = data.user_id;
      // Atualiza o documento no Firestore
      const alunoRef = doc(db, "pending_students", docId);
      await updateDoc(alunoRef, { facial_id: facialId });
      
      mostrarAlerta("✅ Rosto cadastrado com sucesso!", "sucesso");
      pararCamera();
      setTimeout(() => window.location.href = "index.html", 2000); // Volta para o login
    } else {
      throw new Error(data.error || "Não foi possível cadastrar o rosto.");
    }
  } catch (error) {
    console.error("Erro ao cadastrar rosto:", error);
    mostrarAlerta(error.message, "erro");
    btnVerificarRosto.disabled = false; // Tente de novo
  }
}

// FUNÇÃO 2: Verificar Rosto (para Motoristas)
async function verificarRostoAPI(blob) {
  try {
    const formData = new FormData();
    formData.append('file', blob, 'rosto_verificar.jpg');
    
    const response = await fetch(`${API_URL}/verificar`, { // Endpoint /verificar
      method: 'POST',
      body: formData
    });
    const data = await response.json();

    if (data.success && data.nome) {
      mostrarAlerta(`✅ Verificado: ${data.nome}`, "sucesso");
    } else {
      mostrarAlerta(data.error || "Rosto não encontrado.", "erro");
    }
  } catch (error) {
    mostrarAlerta("Erro de conexão com o servidor.", "erro");
  } finally {
    btnVerificarRosto.disabled = false; // Tente de novo
  }
}

// ===== INICIALIZAÇÃO =====

// Popups (precisam ser globais para o onclick do HTML)
window.showPopup2 = () => {
  popup1.classList.add("hidden");
  popup2.classList.remove("hidden");
};
window.startVerification = () => {
  popup2.classList.add("hidden");
  startCamera();
};

// Botão Voltar
backButton.addEventListener("click", () => {
  pararCamera();
  window.history.back();
});
window.addEventListener("beforeunload", pararCamera);

// Evento Principal: Ler a URL e decidir o que fazer
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Tenta pegar os parâmetros de cadastro
  const cadastroId = urlParams.get('id');
  const cadastroNome = urlParams.get('nome');

  if (urlParams.get('modo') === 'cadastro' && cadastroId && cadastroNome) {
    // --- MODO CADASTRO ---
    modo = 'cadastro';
    docId = cadastroId;
    nomeAluno = cadastroNome;
    
    // Pula o primeiro popup e vai direto para as instruções
    popup1.classList.add("hidden");
    popup2.classList.remove("hidden");
    
  } else {
    // --- MODO VERIFICAÇÃO (Padrão) ---
    modo = 'verificar';
    // O motorista (ou quem abrir sem params) vê o popup 1
    popup1.classList.remove("hidden");
  }
});