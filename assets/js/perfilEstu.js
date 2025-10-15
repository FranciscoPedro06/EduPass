document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (!usuario) {
    alert('Nenhum usuário encontrado. Cadastre-se primeiro.');
    return;
  }

  // Nome
  const studentNameEl = document.querySelector('.student-name');
  if (studentNameEl) studentNameEl.textContent = usuario.nome;

  // Foto
  const profileIconInner = document.querySelector('.profile-icon-inner');
  if (profileIconInner && usuario.foto) {
    profileIconInner.style.backgroundImage = `url(${usuario.foto})`;
    profileIconInner.style.backgroundSize = 'cover';
    profileIconInner.style.backgroundPosition = 'center';
  }

  // Preencher info-items dinamicamente
  const infoItems = document.querySelectorAll('.info-item');
  infoItems.forEach(item => {
    const key = item.dataset.key;
    if (!key) return;

    let label = '';
    let valor = usuario[key] || '';

    

  switch (key) {
    case 'curso':
      label = 'CURSO';
      valor = usuario.curso;
      break;

    case 'turno':
      label = 'TURNO';
      valor = usuario.turno;
      break;

    case 'nascimento':
      label = 'NASCIMENTO';
      if (usuario.nascimento) {
        const partes = usuario.nascimento.split('-'); // ["2002","09","15"]
        valor = `${partes[2]}/${partes[1]}/${partes[0]}`; // "15/09/2002"
      } else {
        valor = 'Não informado';
      }
      break;

    case 'documento':
      label = 'DOCUMENTO';
      valor = usuario.documento;
      break;

    case 'cpf':
      label = 'CPF';
      valor = usuario.cpf || usuario.documento; // se CPF estiver vazio, usa documento
      break;

    case 'email':
      label = 'EMAIL';
      valor = usuario.email;
      break;

    default:
      valor = 'Pequeno erro!';
  }


    item.innerHTML = `
      <div class="info-icon">
        <!-- Você pode adicionar SVGs aqui se quiser -->
      </div>
      <div class="info-text">
        <span class="info-label">${label}:</span> ${valor}
      </div>
    `;
  });

  // Botão voltar
  const backButton = document.getElementById('backButton');
  if (backButton) backButton.addEventListener('click', () => window.history.back());

  // Botão editar
  const editBtn = document.getElementById('editProfileBtn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      alert('Funcionalidade de edição em desenvolvimento');
      // Futuro: window.location.href = 'editar-perfil.html';
    });
  }
});
