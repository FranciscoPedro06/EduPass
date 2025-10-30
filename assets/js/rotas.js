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
  
    // ===== LÓGICA DA PÁGINA DE ROTAS =====
    document.addEventListener("DOMContentLoaded", () => {
      const backButton = document.getElementById("backButton");
      const routesCard = document.getElementById("routesCard"); 

      if (backButton) {
        backButton.addEventListener("click", () => {
          window.history.back();
        });
      }
      
      if (routesCard) {
          routesCard.addEventListener("click", (event) => {
              const routeItem = event.target.closest(".route-item"); 
              
              if (routeItem) {
                  const routeName = routeItem.dataset.route;
                  const direction = routeItem.dataset.direction;
                  
                  if (routeName && direction) {
                      selectRoute(routeItem, routeName, direction); // Passa o elemento clicado
                  }
              }
          });
      }
      
      function selectRoute(element, routeName, direction) {
        console.log(`Rota selecionada: ${routeName} (${direction})`);
        
        // Feedback visual: Adiciona classe para animação
        element.classList.add('selected-flash');
        // Remove a classe após a animação para poder ser usada de novo
        setTimeout(() => {
            element.classList.remove('selected-flash');
        }, 400); // Duração da animação

        const direcaoTexto = direction === 'ida' ? 'Ida' : 'Volta';
        const mensagem = `<strong>Parada selecionada:</strong> ${routeName}<br><strong>Direção:</strong> ${direcaoTexto}`;
        
        mostrarAlerta(mensagem, 'info'); 
      }
    });