function togglePassword() {
  const passwordInput = document.getElementById("password");
  passwordInput.type = passwordInput.type === "password" ? "text" : "password";
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const cliqueBtn = document.getElementById("Clique");
  
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

    const alerta = document.createElement('div');
    alerta.className = `alerta alerta-${tipo}`;
    alerta.textContent = mensagem;
    alerta.style.cssText = `
      padding: 15px 20px;
      background-color: ${tipo === 'erro' ? '#ef4444' : '#10b981'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      font-weight: 500;
      animation: slideIn 0.3s ease-out;
      word-wrap: break-word;
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
    input.erro {
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

  function validarEmail(email) {
    email = email.trim();
    
    if (email.length === 0) {
      return { valido: false, mensagem: 'E-mail é obrigatório!' };
    }
    
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
      return { valido: false, mensagem: 'E-mail inválido!' };
    }
    
    return { valido: true };
  }

  function validarSenha(senha) {
    senha = senha.trim();
    
    if (senha.length === 0) {
      return { valido: false, mensagem: 'Senha é obrigatória!' };
    }
    
    if (senha.length < 6) {
      return { valido: false, mensagem: 'Senha deve ter no mínimo 6 caracteres!' };
    }
    
    return { valido: true };
  }

  cliqueBtn.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "cadastroEstu.html";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    console.log("[Login] Validando credenciais...");

    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => input.classList.remove('erro'));

    const emailInput = form.querySelector('input[type="email"]');
    const passwordInput = document.getElementById("password");
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    let erros = [];

    const validacaoEmail = validarEmail(email);
    if (!validacaoEmail.valido) {
      erros.push({ elemento: emailInput, mensagem: validacaoEmail.mensagem });
    }

    const validacaoSenha = validarSenha(password);
    if (!validacaoSenha.valido) {
      erros.push({ elemento: passwordInput, mensagem: validacaoSenha.mensagem });
    }

    if (erros.length > 0) {
      console.log("[Login] Erros de validação encontrados:", erros.length);
      erros.forEach((erro, index) => {
        erro.elemento.classList.add('erro');
        setTimeout(() => {
          mostrarAlerta(erro.mensagem, 'erro');
        }, index * 400);
      });
      return;
    }

    if (email === "tccADM@gmail.com" && password === "admin123") {
      console.log("[Login] Acesso de administrador autorizado");
      mostrarAlerta("Login realizado com sucesso!", 'sucesso');
      setTimeout(() => {
        window.location.href = "telaInicioAdm.html";
      }, 1500);
    } else if (email === "aluno@gmail.com" && password === "aluno123") {
      console.log("[Login] Acesso de aluno autorizado");
      mostrarAlerta("Login realizado com sucesso!", 'sucesso');
      setTimeout(() => {
        window.location.href = "telaInicioEstu.html";
      }, 1500);
    } else {
      console.log("[Login] Credenciais incorretas");
      emailInput.classList.add('erro');
      passwordInput.classList.add('erro');
      mostrarAlerta("Usuário ou senha incorretos!", 'erro');
    }
  });

  const emailInput = form.querySelector('input[type="email"]');
  const passwordInput = document.getElementById("password");

  emailInput.addEventListener('input', function() {
    this.classList.remove('erro');
  });

  passwordInput.addEventListener('input', function() {
    this.classList.remove('erro');
  });
});