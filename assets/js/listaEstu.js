// Exemplo de estudantes no localStorage
// localStorage.setItem('estudantes', JSON.stringify([
//   { id: '2280473926', nome: 'Ludmila Vitória Santos Ribeiro Carvalho', curso: 'DESENVOLVIMENTO DE SISTEMAS', turno: 'NOTURNO', ativo: true },
//   { id: '2547856635', nome: 'Evelyn da Cruz Estrela', curso: 'DESENVOLVIMENTO DE SISTEMAS', turno: 'NOTURNO', ativo: true }
// ]));

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('studentsContainer');

  const estudantes = JSON.parse(localStorage.getItem('estudantes')) || [];

  if (estudantes.length === 0) {
    container.innerHTML = '<p class="text-white text-center">Nenhum estudante cadastrado.</p>';
    return;
  }

  estudantes.forEach(est => {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-3xl p-8 shadow-lg';

  // Se houver foto, usar como background; senão, usar ícone
  const fotoHtml = est.foto
    ? `<div class="w-32 h-32 rounded-full flex items-center justify-center bg-cover bg-center" style="background-image: url('${est.foto}');"></div>`
    : `<div class="w-32 h-32 custom-blue rounded-full flex items-center justify-center">
        <svg class="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>`;

  card.innerHTML = `
    <div class="flex justify-center mb-6">
      ${fotoHtml}
    </div>

    <h2 class="text-xl font-bold text-center mb-8">${est.nome}</h2>

    <div class="space-y-4">
      <div class="flex items-center gap-4">
        <span class="font-bold">CURSO:</span> ${est.curso}
      </div>
      <div class="flex items-center gap-4">
        <span class="font-bold">TURNO:</span> ${est.turno}
      </div>
      <div class="flex items-center gap-4">
        <span class="font-bold">CPF:</span> ${est.documento || '---'}
      </div>
      <div class="flex items-center gap-4">
        <span class="font-bold">EMAIL:</span> ${est.email || '---'}
      </div>
    </div>
  `;

  container.appendChild(card);
});
});