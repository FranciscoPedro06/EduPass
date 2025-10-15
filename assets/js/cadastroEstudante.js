document.addEventListener("DOMContentLoaded", () => {
  const cadastroForm = document.getElementById("cadastroForm");
  const backButton = document.getElementById("backButton");

  backButton.addEventListener("click", () => {
    window.history.back();
  });

  // ======== Formatação e labels de arquivo ========
  document.querySelectorAll(".file-input").forEach((input) => {
    input.addEventListener("change", function () {
      const label = document.querySelector(`label[for="${this.id}"]`);
      if (this.files.length > 0) {
        label.textContent = this.files[0].name;
        label.style.color = "#111827";
      }
    });
  });

  // ======== Formatação de CPF/RG ========
  const inputDocumento = document.querySelector('input[name="documento"]');
  inputDocumento.addEventListener('input', function (e) {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor.length <= 9) {
      valor = valor.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
    } else if (valor.length <= 11) {
      valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    e.target.value = valor;
  });

  // ======== Funções de validação (CPF, RG, nome, etc.) ========
  function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf.substring(10, 11));
  }

 

  function validarDataNascimento(data) {
    if (!data) return { valido: false, mensagem: 'Data de nascimento obrigatória!' };
    const dataNasc = new Date(data + 'T00:00:00');
    const hoje = new Date();
    let idade = hoje.getFullYear() - dataNasc.getFullYear();
    const mes = hoje.getMonth() - dataNasc.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < dataNasc.getDate())) idade--;
    if (dataNasc > hoje) return { valido: false, mensagem: 'A data de nascimento não pode ser futura!' };
    if (idade < 15) return { valido: false, mensagem: 'Idade mínima: 15 anos!' };
    if (idade > 120) return { valido: false, mensagem: 'Data de nascimento inválida!' };
    return { valido: true };
  }

  function validarFoto(input) {
    if (!input.files || input.files.length === 0) {
      return { valido: false, mensagem: 'Por favor, selecione uma foto 3x4!' };
    }
    const arquivo = input.files[0];
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!tiposPermitidos.includes(arquivo.type)) {
      return { valido: false, mensagem: 'Formato inválido! Use apenas JPG ou PNG.' };
    }
    return { valido: true };
  }

  function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      return { valido: false, mensagem: 'E-mail inválido!' };
    }
    return { valido: true };
  }



  function validarNome(nome) {
    nome = nome.trim();
    if (nome.length < 10) return { valido: false, mensagem: 'Nome muito curto!' };
    if (!/^[a-záàâãéèêíïóôõöúçñ\s]+$/i.test(nome)) {
      return { valido: false, mensagem: 'Nome deve conter apenas letras!' };
    }
    const partes = nome.split(' ').filter(p => p.length > 0);
    if (partes.length < 2) return { valido: false, mensagem: 'Digite o nome completo!' };
    return { valido: true };
  }

  function validarCurso(curso) {
    curso = curso.trim();
    if (curso.length < 10) return { valido: false, mensagem: 'Nome do curso muito curto!' };
    return { valido: true };
  }

  function validarTurno(turno) {
    turno = turno.trim().toLowerCase();
    const turnosValidos = ['manhã', 'manha', 'tarde', 'noturno', 'integral'];
    if (!turnosValidos.some(t => turno.includes(t))) {
      return { valido: false, mensagem: 'Turno inválido! Use: Manhã, Tarde, Noturno ou Integral.' };
    }
    return { valido: true };
  }

  // ======== Função de alerta ========
  function mostrarAlerta(mensagem, tipo = 'erro') {
    let containerAlertas = document.getElementById('container-alertas');
    if (!containerAlertas) {
      containerAlertas = document.createElement('div');
      containerAlertas.id = 'container-alertas';
      containerAlertas.style.cssText = `
        position: fixed;
        top: 20px;
        right: 50%;
        transform: translateX(50%);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 90%;
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
        if (containerAlertas.children.length === 0) containerAlertas.remove();
      }, 300);
    }, 3500);
  }

  // ======== Estilos dos alertas ========
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
    .input.erro, .file-label.erro {
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

  // ======== Evento de submit ========
  cadastroForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const inputs = cadastroForm.querySelectorAll('.input');
    const nome = inputs[0].value;
    const documento = inputs[1].value;
    const dataNasc = inputs[2].value;
    const foto = document.getElementById('foto');
    const curso = inputs[3].value;
    const turno = inputs[4].value;
    const email = inputs[5].value;



    let erros = [];

    const validacoes = [
      { valido: validarNome(nome), elemento: inputs[0] },
      { valido: validarCurso(curso), elemento: inputs[3] },
      { valido: validarTurno(turno), elemento: inputs[4] },
      { valido: validarDataNascimento(dataNasc), elemento: inputs[2] },
      { valido: validarFoto(foto), elemento: document.querySelector(`label[for="foto"]`) },
      { valido: validarEmail(email), elemento: inputs[5] },
  

    ];

    validacoes.forEach(v => {
      if (!v.valido.valido) erros.push({ elemento: v.elemento, mensagem: v.valido.mensagem });
    });

    const docLimpo = documento.replace(/\D/g, '');
    if (docLimpo.length === 0) {
      erros.push({ elemento: inputs[1], mensagem: 'CPF ou RG obrigatório!' });
    } else if (docLimpo.length === 11 && !validarCPF(documento)) {
      erros.push({ elemento: inputs[1], mensagem: 'CPF inválido!' });
    } else if ((docLimpo.length < 7 || docLimpo.length > 9) && docLimpo.length !== 11) {
      erros.push({ elemento: inputs[1], mensagem: 'RG inválido!' });
    }

    if (erros.length > 0) {
      erros.forEach((erro, i) => {
        erro.elemento.classList.add('erro');
        setTimeout(() => mostrarAlerta(erro.mensagem, 'erro'), i * 400);
      });
      return;
    }

    // ======== Converter imagem e salvar dados ========
    const reader = new FileReader();
    reader.onload = function (e) {
      const fotoBase64 = e.target.result;
      const dados = {
        nome,
        documento,
        nascimento: dataNasc,
        curso,
        turno,
        foto: fotoBase64,
        email: email,
        senha: '123456'
      };
      const estudantes = JSON.parse(localStorage.getItem('estudantes')) || [];
      estudantes.push(dados);
      localStorage.setItem('estudantes', JSON.stringify(estudantes));
      mostrarAlerta('Cadastro realizado com sucesso!', 'sucesso');
      setTimeout(() => window.location.assign('index.html'), 2000);
    };
    reader.readAsDataURL(foto.files[0]);
  });
});
