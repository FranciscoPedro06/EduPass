document.addEventListener('DOMContentLoaded', () => {
  const emailLogado = sessionStorage.getItem('usuarioLogado');


  const estudantes = JSON.parse(localStorage.getItem('estudantes')) || [];
  const usuario = estudantes.find(u => u.email === emailLogado);
  const statusBadge = document.querySelector('.status-badge');
    statusBadge.textContent = 'Cadastrado';
    statusBadge.style.backgroundColor = '#19e226ff'; // verde
    statusBadge.style.color = 'white';


  if (!usuario) return;

  // Função para formatar data no padrão DD/MM/AAAA
  function formatarDataBR(data) {
    const d = new Date(data);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0'); // Janeiro = 0
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  // Atualiza os campos da tela de início
  document.querySelector('.student-name').textContent = `NOME: ${usuario.nome}`;
  document.querySelector('.info-row:nth-child(2)').innerHTML = `<span class="info-label">CPF:</span> ${usuario.documento}`;
  document.querySelector('.info-row:nth-child(3)').innerHTML = `<span class="info-label">CURSO:</span> ${usuario.curso}`;
  document.querySelector('.info-row:nth-child(4)').innerHTML = `<span class="info-label">TURNO:</span> ${usuario.turno}`;
  document.querySelector('.info-row:nth-child(5)').innerHTML = `<span class="info-label">NASCIMENTO:</span> ${formatarDataBR(usuario.nascimento)}`;

  if (usuario.foto) {
    document.querySelector('.photo').style.backgroundImage = `url(${usuario.foto})`;
    document.querySelector('.photo').style.backgroundSize = 'cover';
    document.querySelector('.photo').style.backgroundPosition = 'center';
  }

});
