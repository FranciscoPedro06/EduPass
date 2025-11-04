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
  
    // ===== LÓGICA DA PÁGINA DE TERMOS =====
    document.addEventListener("DOMContentLoaded", () => {
      const checkbox = document.getElementById("agreeCheckbox");
      const acceptBtn = document.getElementById("acceptButton");
      const backButton = document.getElementById("backButton");

      // Botão Voltar
      if (backButton) {
          backButton.addEventListener('click', () => window.history.back());
      }
      
      // Lógica do Checkbox para habilitar botão
      if (checkbox && acceptBtn) {
          checkbox.addEventListener("change", function () {
            acceptBtn.disabled = !this.checked;
          });
      }

      // Lógica do Botão Aceitar
      if (acceptBtn) {
          acceptBtn.addEventListener('click', handleAccept);
      }

      function handleAccept() {
        if (checkbox.checked) {
          mostrarAlerta("Termo aceito com sucesso!", 'sucesso');
          // Adicione aqui o redirecionamento ou próxima ação
          // Exemplo: Salvar no localStorage que o termo foi aceito
          localStorage.setItem('termoAceito', 'true');
          // Exemplo: Redirecionar para o cadastro após um pequeno delay
          // setTimeout(() => { window.location.href = 'cadastro.html'; }, 1500);
        } else {
            // Isso não deve acontecer se o botão estiver desabilitado corretamente,
            // mas é uma boa prática ter um fallback.
            mostrarAlerta("Você precisa concordar com os termos para continuar.", 'aviso');
        }
      }
    });