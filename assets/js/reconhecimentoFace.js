 // ===== FUNÇÃO DE ALERTA GLOBAL (UNIFICADA) =====
    function mostrarAlerta(mensagem, tipo = 'info') {
      let containerAlertas = document.getElementById('container-alertas');
      if (!containerAlertas) {
        containerAlertas = document.createElement('div');
        containerAlertas.id = 'container-alertas';
        document.body.appendChild(containerAlertas);
      }
      
      let tipoClasse = 'alerta-info';
      switch(tipo) {
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
          if (containerAlertas.children.length === 0) {
            containerAlertas.remove();
          }
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
        // Parar a câmera antes de voltar, se estiver ativa
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
        message.textContent = "Solicitando permissão da câmera...";
        message.classList.remove("error-message");
        console.log("[v0] Solicitando permissão da câmera...");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user", // Prioriza câmera frontal
            width: { ideal: 1280 }, // Tenta alta resolução
            height: { ideal: 720 },
            // Frame rate opcional:
            // frameRate: { ideal: 30 } 
          },
          audio: false,
        });

        console.log("[v0] Permissão concedida, iniciando stream...");
        message.textContent = "Iniciando câmera..."; // Mensagem de carregando

        video.srcObject = stream;

        video.onloadedmetadata = () => {
          console.log("[v0] Vídeo carregado");
          video.classList.add("loaded"); 
          // A mensagem será ocultada pelo CSS quando 'loaded' for adicionado
        };
        
        video.onerror = (e) => {
            console.error("[v0] Erro no elemento de vídeo:", e);
            message.textContent = "Erro ao carregar o vídeo da câmera.";
            message.classList.add("error-message");
            mostrarAlerta("Erro ao carregar o vídeo da câmera.", "erro");
        }

      } catch (error) {
        console.error("[v0] Erro ao acessar a câmera:", error);
        message.classList.add("error-message"); // Adiciona classe de erro à mensagem

        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          message.textContent = "Permissão da câmera negada.";
          mostrarAlerta("Permissão da câmera negada. Por favor, permita o acesso nas configurações do seu navegador ou dispositivo.", "erro");
        } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
          message.textContent = "Nenhuma câmera encontrada.";
           mostrarAlerta("Nenhuma câmera foi encontrada no seu dispositivo.", "erro");
        } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
             message.textContent = "Câmera já em uso ou com problema.";
             mostrarAlerta("Não foi possível acessar a câmera. Ela pode já estar em uso por outro aplicativo ou ter apresentado um problema.", "erro");
        } else {
          message.textContent = "Erro desconhecido ao acessar a câmera.";
          mostrarAlerta(`Erro ao acessar a câmera: ${error.message}`, "erro");
        }
      }
    }

    // Limpeza ao sair da página
    window.addEventListener("beforeunload", () => {
      if (video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        console.log("[v0] Stream da câmera encerrado ao sair da página");
      }
    });

    // Iniciar mostrando o primeiro popup por padrão (se não precisar, remova esta linha)
    // Se quiser que a câmera comece direto sem popups, chame startCamera() aqui
    // document.addEventListener('DOMContentLoaded', startCamera); 
    // Por enquanto, os popups controlam o início.