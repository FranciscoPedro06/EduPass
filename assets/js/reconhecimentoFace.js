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

// ===== LÓGICA DA PÁGINA DE RECONHECIMENTO FACIAL =====
const video = document.getElementById("video");
const message = document.getElementById("message");
const popup1 = document.getElementById("popup1");
const popup2 = document.getElementById("popup2");
const backButton = document.getElementById("backButton");

if (backButton) {
  backButton.addEventListener("click", () => {
    if (video.srcObject) {
      const tracks = video.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      console.log("[v0] Stream da câmera encerrado ao voltar");
    }
    window.history.back();
  });
}

function showPopup2() {
  popup1.classList.add("hidden");
  popup2.classList.remove("hidden");
}

function startVerification() {
  popup2.classList.add("hidden");
  startCamera();
}

async function startCamera() {
  try {
    // Recupera tipo de usuário (salvo no login, por exemplo)
    const userType = sessionStorage.getItem("tipoUsuario"); 
    // Valor esperado: "motorista" ou "estudante"

    // Define qual câmera usar
    const facingMode = userType === "motorista" ? "environment" : "user";

    message.textContent = "Abrindo câmera...";
    message.classList.remove("error-message");
    console.log(`[v0] Solicitando câmera (${facingMode})...`);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });

    console.log("[v0] Permissão concedida, iniciando stream...");
    message.textContent = "Câmera iniciada!";
    video.srcObject = stream;

    video.onloadedmetadata = () => {
      console.log("[v0] Vídeo carregado");
      video.classList.add("loaded");
    };

  } catch (error) {
    console.error("[v0] Erro ao acessar a câmera:", error);
    message.classList.add("error-message");

    if (error.name === "NotAllowedError") {
      message.textContent = "Permissão da câmera negada.";
      mostrarAlerta("Permissão da câmera negada. Ative o acesso à câmera nas configurações do navegador.", "erro");
    } else if (error.name === "NotFoundError") {
      message.textContent = "Nenhuma câmera encontrada.";
      mostrarAlerta("Nenhuma câmera foi encontrada no seu dispositivo.", "erro");
    } else if (error.name === "NotReadableError") {
      message.textContent = "Câmera em uso ou com problema.";
      mostrarAlerta("Não foi possível acessar a câmera. Ela pode estar em uso por outro app.", "erro");
    } else {
      message.textContent = "Erro desconhecido.";
      mostrarAlerta(`Erro: ${error.message}`, "erro");
    }
  }
}

window.addEventListener("beforeunload", () => {
  if (video.srcObject) {
    const tracks = video.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
    console.log("[v0] Stream da câmera encerrado ao sair da página");
  }
});
