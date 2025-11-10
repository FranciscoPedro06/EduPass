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
  
    // ===== LÓGICA DO DASHBOARD MOTORISTA =====
    document.addEventListener("DOMContentLoaded", () => {
      const notificationsButton = document.getElementById('notificationsButton');
      const logoutButton = document.getElementById('logoutButton');
      
      if (notificationsButton) {
          notificationsButton.addEventListener('click', () => {
              mostrarAlerta('Você tem 2 novas viagens disponíveis.', 'info');
          });
      }
      
      if (logoutButton) {
          logoutButton.addEventListener('click', () => {
              if (confirm('Tem certeza que deseja sair?')) {
                  mostrarAlerta('Saindo...', 'info');
                  sessionStorage.removeItem('usuarioLogado');
                  setTimeout(() => {
                     window.location.assign('index.html');
                  }, 1000); 
              }
          });
      }
    });