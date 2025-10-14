// Aguarda o carregamento do DOM
document.addEventListener("DOMContentLoaded", () => {
  const cadastroForm = document.getElementById("cadastroForm");
  const backButton = document.getElementById("backButton");

  // 🔙 Botão de voltar para tela de login
  backButton.addEventListener("click", () => {
    window.history.back();
  });

  // ===== FUNÇÕES DE ALERTA VISUAL =====

  function mostrarAlerta(mensagem, tipo = 'erro') {
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
    switch (tipo) {
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
    }, 3500);
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
    input.erro, .file-label.erro {
      border: 2px solid #ef4444 !important;
      animation: shake 0.3s;
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);

  // ===== VALIDAÇÃO BÁSICA =====

  function validarCamposObrigatorios() {
    const inputs = cadastroForm.querySelectorAll('input[required]');
    let erros = [];

    inputs.forEach(input => {
      // Remove erro anterior
      input.classList.remove('erro');

      // Verifica se é input de arquivo
      if (input.type === 'file') {
        if (!input.files || input.files.length === 0) {
          const label = document.querySelector(`label[for="${input.id}"]`);
          if (label) {
            erros.push({ elemento: label, mensagem: 'Por favor, selecione um arquivo!' });
          }
        }
      } else {
        // Outros inputs
        if (!input.value.trim()) {
          const placeholder = input.placeholder || 'Este campo';
          erros.push({ elemento: input, mensagem: `${placeholder} é obrigatório!` });
        }
      }
    });

    return erros;
  }

  // 📤 Ao enviar o formulário
  cadastroForm.addEventListener("submit", (e) => {
    e.preventDefault();

    console.log("[v1] Validando cadastro...");

    // Validar campos obrigatórios
    const erros = validarCamposObrigatorios();

    if (erros.length > 0) {
      console.log("[v1] Erros encontrados:", erros.length);
      erros.forEach((erro, index) => {
        erro.elemento.classList.add('erro');
        setTimeout(() => {
          mostrarAlerta(erro.mensagem, 'erro');
        }, index * 400);
      });
      return;
    }

    // Se passou nas validações
    console.log("[v1] Cadastro concluído");
    mostrarAlerta("Cadastro realizado com sucesso!", 'sucesso');

    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
  });

  // 📝 Atualizar texto dos labels ao selecionar arquivo
  document.querySelectorAll(".file-input").forEach((input) => {
    input.addEventListener("change", function () {
      const label = document.querySelector(`label[for="${this.id}"]`);
      if (this.files.length > 0) {
        label.textContent = this.files[0].name;
        label.style.color = "#111827";
        label.classList.remove('erro'); // Remove erro ao selecionar arquivo
      }
    });
  });

  // Remover erro ao começar a digitar
  cadastroForm.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', function () {
      this.classList.remove('erro');
    });
  });
});