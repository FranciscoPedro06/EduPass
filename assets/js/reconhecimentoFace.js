const video = document.getElementById("video");
const message = document.getElementById("message");
const popup1 = document.getElementById("popup1");
const popup2 = document.getElementById("popup2");

  if (backButton) {
    backButton.addEventListener("click", () => {
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
    console.log("[v0] Solicitando permissão da câmera...");

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });

    console.log("[v0] Permissão concedida, iniciando stream...");

    video.srcObject = stream;

    video.onloadedmetadata = () => {
      console.log("[v0] Vídeo carregado, ocultando mensagem");
      message.style.display = "none";
      video.classList.add("loaded");
    };
  } catch (error) {
    console.error("[v0] Erro ao acessar a câmera:", error);

    if (
      error.name === "NotAllowedError" ||
      error.name === "PermissionDeniedError"
    ) {
      message.textContent =
        "Permissão da câmera negada. Por favor, permita o acesso à câmera nas configurações.";
    } else if (error.name === "NotFoundError") {
      message.textContent = "Nenhuma câmera encontrada no dispositivo.";
    } else {
      message.textContent = "Erro ao acessar a câmera. Tente novamente.";
    }
    message.classList.add("error-message");
  }
}

// Camera now starts only after popups are dismissed

window.addEventListener("beforeunload", () => {
  if (video.srcObject) {
    const tracks = video.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
    console.log("Stream da câmera encerrado");
  }
});
