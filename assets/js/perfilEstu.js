document.addEventListener('DOMContentLoaded', () => {
  const editBtn = document.getElementById('editProfileBtn');
  const backButton = document.getElementById('backButton');

  // Botão voltar
  if (backButton) {
    backButton.addEventListener('click', () => {
      window.history.back();
    });
  }

  // ===== FUNÇÕES DE ALERTA VISUAL =====
  
  function mostrarAlerta(mensagem, tipo = 'info') {
    let containerAlertas = document.getElementById('container-alertas');
    if (!containerAlertas) {
      containerAlertas = document.createElement('div');
      containerAlertas.id = 'container-alertas';
      containerAlertas.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 350px;
      `;
      document.body.appendChild(containerAlertas);
    }

    // Definir cores baseadas no tipo
    let corFundo;
    switch(tipo) {
      case 'sucesso':
        corFundo = '#10b981';
        break;
      case 'erro':
        corFundo = '#ef4444';
        break;
      case 'aviso':
        corFundo = '#f59e0b';
        break;
      case 'info':
      default:
        corFundo = '#3b82f6';
        break;
    }

    const alerta = document.createElement('div');
    alerta.className = `alerta alerta-${tipo}`;
    alerta.innerHTML = mensagem;
    alerta.style.cssText = `
      padding: 15px 20px;
      background-color: ${corFundo};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      font-weight: 500;
      animation: slideIn 0.3s ease-out;
      word-wrap: break-word;
      line-height: 1.5;
    `;
    
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

  // Adicionar estilos de animação
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(400px); opacity: 0; }
    }
    .alerta strong {
      display: block;
      margin-bottom: 5px;
      font-size: 1.05em;
    }
  `;
  document.head.appendChild(style);

  // ===== FUNÇÃO DE EDIÇÃO DO PERFIL =====
  
  function editProfile() {
    console.log('[v0] Edit profile clicked');
    mostrarAlerta('Funcionalidade de edição de perfil em desenvolvimento', 'aviso');
    
    // Caso queira redirecionar futuramente:
    // setTimeout(() => {
    //   window.location.href = 'editar-perfil.html';
    // }, 1500);
  }

  // Adiciona evento ao botão de edição
  if (editBtn) {
    editBtn.addEventListener('click', editProfile);
  }
});