
document.addEventListener("DOMContentLoaded", () => {
  const cadastroForm = document.getElementById("cadastroForm");
  const backButton = document.getElementById("backButton");

  backButton.addEventListener("click", () => {
    window.history.back();
  });

  document.querySelectorAll(".file-input").forEach((input) => {
    input.addEventListener("change", function () {
      const label = document.querySelector(`label[for="${this.id}"]`);
      if (this.files.length > 0) {
        label.textContent = this.files[0].name;
        label.style.color = "#111827";
      }
    });
  });

  const inputDocumento = document.querySelector('input[name="documento"]');

  inputDocumento.addEventListener('input', function(e) {
    let valor = e.target.value.replace(/\D/g, '');
    
    if (valor.length <= 9) {
      valor = valor.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
    } else if (valor.length <= 11) {
      valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    e.target.value = valor;
  });

  function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
      return false;
    }
    
    let soma = 0;
    let resto;
    
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
  }

  function validarRG(rg) {
    rg = rg.replace(/\D/g, '');
    return rg.length >= 7 && rg.length <= 9;
  }

  function validarDataNascimento(data) {
    if (!data) {
      return { valido: false, mensagem: 'Data de nascimento obrigatória!' };
    }

    const dataNasc = new Date(data + 'T00:00:00');
    const hoje = new Date();
    let idade = hoje.getFullYear() - dataNasc.getFullYear();
    const mes = hoje.getMonth() - dataNasc.getMonth();
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < dataNasc.getDate())) {
      idade--;
    }
    
    // Verifica se a data não é futura
    if (dataNasc > hoje) {
      return { valido: false, mensagem: 'A data de nascimento não pode ser futura!' };
    }
    
    // Verifica idade mínima (5 anos) e máxima (120 anos)
    if (idade < 5) {
      return { valido: false, mensagem: 'Idade mínima: 5 anos!' };
    }
    
    if (idade > 120) {
      return { valido: false, mensagem: 'Data de nascimento inválida!' };
    }
    
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

  function validarNome(nome) {
    nome = nome.trim();
    
    if (nome.length < 10) {
      return { valido: false, mensagem: 'Nome muito curto!' };
    }
    
    if (!/^[a-záàâãéèêíïóôõöúçñ\s]+$/i.test(nome)) {
      return { valido: false, mensagem: 'Nome deve conter apenas letras!' };
    }
    
    const partes = nome.split(' ').filter(p => p.length > 0);
    if (partes.length < 2) {
      return { valido: false, mensagem: 'Digite o nome completo!' };
    }
    
    return { valido: true };
  }

  function validarCurso(curso) {
    curso = curso.trim();
    
    if (curso.length < 10) {
      return { valido: false, mensagem: 'Nome do curso muito curto!' };
    }
    
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

  function mostrarAlerta(mensagem, tipo = 'erro') {
    const alerta = document.createElement('div');
    alerta.className = `alerta alerta-${tipo}`;
    alerta.textContent = mensagem;
    alerta.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background-color: ${tipo === 'erro' ? '#ef4444' : '#10b981'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 1000;
      font-weight: 500;
      animation: slideIn 0.3s ease-out;
      max-width: 300px;
    `;
    
    document.body.appendChild(alerta);
    
    setTimeout(() => {
      alerta.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => alerta.remove(), 300);
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

  cadastroForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    console.log("[v1] Validando cadastro...");
    
    // Remover classes de erro anteriores
    document.querySelectorAll('.input, .file-label').forEach(el => {
      el.classList.remove('erro');
    });
    
    const inputs = cadastroForm.querySelectorAll('.input');
    const nome = inputs[0].value;
    const documento = inputs[1].value;
    const dataNasc = inputs[2].value;
    const foto = document.getElementById('foto');
    const curso = inputs[3].value;
    const turno = inputs[4].value;
    
    let erros = [];
    
    // Validar nome
    const validacaoNome = validarNome(nome);
    if (!validacaoNome.valido) {
      erros.push({ elemento: inputs[0], mensagem: validacaoNome.mensagem });
    }
    
    // Validar documento
    const docLimpo = documento.replace(/\D/g, '');
    
    if (docLimpo.length === 0) {
      erros.push({ elemento: inputs[1], mensagem: 'CPF ou RG obrigatório!' });
    } else if (docLimpo.length === 11) {
      if (!validarCPF(documento)) {
        erros.push({ elemento: inputs[1], mensagem: 'CPF inválido!' });
      }
    } else if (docLimpo.length >= 7 && docLimpo.length <= 9) {
      if (!validarRG(documento)) {
        erros.push({ elemento: inputs[1], mensagem: 'RG inválido!' });
      }
    } else {
      erros.push({ elemento: inputs[1], mensagem: 'CPF (11 dígitos) ou RG (7-9 dígitos) inválido!' });
    }
    
    // Validar data de nascimento
    const validacaoData = validarDataNascimento(dataNasc);
    if (!validacaoData.valido) {
      erros.push({ elemento: inputs[2], mensagem: validacaoData.mensagem });
    }
    
    // Validar foto
    const validacaoFoto = validarFoto(foto);
    if (!validacaoFoto.valido) {
      const label = document.querySelector(`label[for="foto"]`);
      erros.push({ elemento: label, mensagem: validacaoFoto.mensagem });
    }
    
    // Validar curso
    const validacaoCurso = validarCurso(curso);
    if (!validacaoCurso.valido) {
      erros.push({ elemento: inputs[3], mensagem: validacaoCurso.mensagem });
    }
    
    // Validar turno
    const validacaoTurno = validarTurno(turno);
    if (!validacaoTurno.valido) {
      erros.push({ elemento: inputs[4], mensagem: validacaoTurno.mensagem });
    }
    
    // Se houver erros, mostrar alertas vermelhos
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
    
    // Se passou em todas as validações
    console.log("[v1] Cadastro concluído com sucesso!");
    console.log("Dados:", { nome, documento, dataNascimento: dataNasc, curso, turno });
    
    mostrarAlerta('Cadastro realizado com sucesso!', 'sucesso');
    
    // Redirecionar após 2 segundos
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
  });
});