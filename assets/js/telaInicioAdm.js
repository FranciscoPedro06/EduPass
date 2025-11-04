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
  
    // ===== LÓGICA DO DASHBOARD ADMIN =====
    document.addEventListener("DOMContentLoaded", () => {
      const notificationsButton = document.getElementById('notificationsButton');
      const logoutButton = document.getElementById('logoutButton');
      const excluirEstudanteLink = document.getElementById('excluirEstudanteLink');
      
      // Botão de Notificações (Exemplo)
      if (notificationsButton) {
          notificationsButton.addEventListener('click', () => {
              mostrarAlerta('Nenhuma notificação nova.', 'info');
              // Aqui você pode adicionar lógica para abrir um modal de notificações
          });
      }
      
      // Botão de Logout (Exemplo)
      if (logoutButton) {
          logoutButton.addEventListener('click', () => {
              // Adicionar confirmação antes de sair
              if (confirm('Tem certeza que deseja sair?')) {
                  mostrarAlerta('Saindo...', 'info');
                  sessionStorage.removeItem('usuarioLogado'); // Limpa a sessão
                  // Redireciona para a tela de login após um pequeno atraso
                  setTimeout(() => {
                     window.location.assign('index.html'); // Ou o nome correto da sua tela de login
                  }, 1000); 
              }
          });
      }
      
      // Link Excluir Estudante (Placeholder)
      if (excluirEstudanteLink) {
          excluirEstudanteLink.addEventListener('click', (event) => {
              event.preventDefault(); // Impede a navegação padrão do link '#'
              mostrarAlerta('Funcionalidade "Excluir Estudante" em desenvolvimento.', 'aviso');
              // Futuramente, poderia abrir um modal para buscar o estudante a ser excluído
          });
      }

      // Adicionar aqui listeners para outros botões do menu, se necessário
      // Exemplo:
      // const gerarIdButton = document.getElementById('gerarIdEstudante');
      // if (gerarIdButton) {
      //     gerarIdButton.addEventListener('click', (e) => {
      //         e.preventDefault();
      //         mostrarAlerta('Função "Gerar ID" em desenvolvimento.', 'aviso');
      //     });
      // }
      
    });