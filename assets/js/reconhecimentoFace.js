// Importações do Firebase que vamos precisar
import { db } from "./firebase-config.js"; 
// Você pode precisar de 'doc' e 'updateDoc' se for registrar a verificação
// import { doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// ===== FUNÇÃO DE ALERTA GLOBAL =====
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

// ===== CONSTANTES E VARIÁVEIS GLOBAIS =====
const API_URL = "https://unpoetically-stampedable-lorena.ngrok-free.dev"; // ⚠️ Sua API DeepFace

const video = document.getElementById("video");
const message = document.getElementById("message");
const popup1 = document.getElementById("popup1");
const popup2 = document.getElementById("popup2");
const backButton = document.getElementById("backButton");
const btnVerificarRosto = document.getElementById("btnVerificarRosto");

let streamAtivo = null;

// ===== LÓGICA DA PÁGINA =====

// Botão Voltar
if (backButton) {
  backButton.addEventListener("click", () => {
    pararCamera();
    window.history.back();
  });
}

// Fluxo dos Popups
window.showPopup2 = function() {
  popup1.classList.add("hidden");
  popup2.classList.remove("hidden");
}

window.startVerification = function() {
  popup2.classList.add("hidden");
  startCamera();
}

// Parar a câmera
function pararCamera() {
  if (streamAtivo) {
    streamAtivo.getTracks().forEach((track) => track.stop());
    streamAtivo = null;
    console.log("[v0] Stream da câmera encerrado");
  }
}

// Iniciar a Câmera
async function startCamera() {
  try {
    // Recupera tipo de usuário
    const userType = sessionStorage.getItem("tipoUsuario") || "motorista"; // Padrão motorista
    const facingMode = userType === "motorista" ? "environment" : "user";

    message.textContent = "Abrindo câmera...";
    message.classList.remove("error-message");
    console.log(`[v0] Solicitando câmera (${facingMode})...`);

    streamAtivo = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });

    console.log("[v0] Permissão concedida, iniciando stream...");
    message.textContent = "Câmera iniciada!";
    video.srcObject = streamAtivo;

    video.onloadedmetadata = () => {
      console.log("[v0] Vídeo carregado");
      video.classList.add("loaded");
      message.textContent = "Posicione o rosto do aluno no oval";
      btnVerificarRosto.style.display = "block"; // Mostra o botão de verificar
    };

  } catch (error) {
    console.error("[v0] Erro ao acessar a câmera:", error);
    message.classList.add("error-message");
    // ... (seu código de tratamento de erro da câmera) ...
    if (error.name === "NotAllowedError") {
       message.textContent = "Permissão da câmera negada.";
    } else {
       message.textContent = "Erro ao iniciar a câmera.";
    }
  }
}

// ===== LÓGICA DE VERIFICAÇÃO (NOVA) =====

// Listener do botão de verificar
btnVerificarRosto.addEventListener("click", capturarEVerificarRosto);

function capturarEVerificarRosto() {
  if (!streamAtivo) {
    mostrarAlerta("Câmera não iniciada.", "erro");
    return;
  }

  message.textContent = "Verificando...";
  btnVerificarRosto.disabled = true; // Desabilita para evitar cliques duplos

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  
  // Desenha o vídeo no canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Converte para Blob e envia para a API
  canvas.toBlob(async (blob) => {
    await verificarRostoAPI(blob);
  }, 'image/jpeg', 0.8);
}

// Função que chama a API de VERIFICAÇÃO
async function verificarRostoAPI(blob) {
  try {
    const formData = new FormData();
    formData.append('file', blob, 'rosto_verificar.jpg');
    
    // ⚠️ ATENÇÃO AQUI: Mudamos para o endpoint '/verificar'
    const response = await fetch(`${API_URL}/verificar`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success && data.nome) {
      // SUCESSO!
      message.textContent = `Aluno Verificado: ${data.nome}`;
      mostrarAlerta(`✅ Verificado: ${data.nome}`, "sucesso");
      
      // Opcional: Registre essa verificação no Firestore
      // await addDoc(collection(db, "verificacoes"), {
      //   alunoNome: data.nome,
      //   motoristaId: sessionStorage.getItem("motoristaLogadoId"), // Você precisaria ter isso
      //   timestamp: serverTimestamp()
      // });

    } else {
      // FALHA (Rosto não encontrado ou erro)
      message.textContent = "Aluno não reconhecido. Tente novamente.";
      mostrarAlerta(data.error || "Rosto não encontrado.", "erro");
    }

  } catch (error) {
    console.error("Erro ao verificar rosto:", error);
    message.textContent = "Erro de conexão. Tente novamente.";
    mostrarAlerta("Erro de conexão com o servidor.", "erro");
  } finally {
    // Reabilita o botão para uma nova tentativa
    btnVerificarRosto.disabled = false;
  }
}

// Parar câmera ao sair
window.addEventListener("beforeunload", () => {
  pararCamera();
});