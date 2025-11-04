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

    document.addEventListener("DOMContentLoaded", () => {
        const backButton = document.getElementById("backButton");
        const confirmButton = document.getElementById("confirmButton");
        const title = document.getElementById("checklistTitle");
        
        const shift = sessionStorage.getItem("selectedShift");

        if (title && shift) {
            title.textContent = `Checklist - ${shift}`;
        }

        if (backButton) {
            backButton.addEventListener("click", () => {
                window.history.back();
            });
        }
        
        if (confirmButton) {
            confirmButton.addEventListener("click", confirmPresence);
        }

        function confirmPresence() {
          const checkboxes = document.querySelectorAll('.checkbox-input:checked');

          if (checkboxes.length === 0) {
            mostrarAlerta("Por favor, selecione pelo menos um dia!", 'aviso'); 
            return;
          }

          const attendanceData = {
            shift: shift || "Não especificado",
            days: Array.from(checkboxes).map(cb => ({
              day: cb.dataset.day,
              route: cb.dataset.trip,
            })),
          };
          
          console.log("Dados de presença:", attendanceData);

          mostrarAlerta("Presença confirmada com sucesso!", 'sucesso');
          
          setTimeout(() => {
             history.back();
          }, 1500);
        }
    });
    
    function updateAttendance() {
      // const checkedCount = document.querySelectorAll('input[type="checkbox"]:checked').length
      // console.log(checkedCount);
    }