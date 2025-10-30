 document.addEventListener('DOMContentLoaded', () => {
      const editBtn = document.querySelector('button.btn-primary');
      const backButton = document.querySelector('button.back-button');

      if (backButton) {
        backButton.addEventListener('click', () => {
          window.history.back();
        });
      }

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

      // ===== FUNÇÃO DE EDIÇÃO DO PERFIL =====
      function editProfile() {
        mostrarAlerta('Funcionalidade de edição de perfil em desenvolvimento.', 'aviso');
      }

      if (editBtn) {
        editBtn.addEventListener('click', editProfile);
      }
    });