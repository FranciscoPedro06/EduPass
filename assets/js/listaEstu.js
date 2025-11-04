  function loadStudents() {
      const container = document.getElementById('studentsContainer');
      const students = JSON.parse(localStorage.getItem('students')) || [];

      // ATUALIZAÇÃO: Aplicando a Variação de "Empty State"
      if (students.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            <h3 class="empty-title">Nenhum estudante cadastrado</h3>
            <p class="empty-description">Quando novos estudantes forem adicionados, eles aparecerão aqui.</p>
          </div>
        `;
        return;
      }
      
      // O restante do seu script original é mantido
      container.innerHTML = students.map(student => `
        <div class="student-card">
          ${student.photo ?
            `<div class="student-avatar" style="background-image: url('${student.photo}')" aria-label="Foto de ${student.name}"></div>` :
            `<div class="student-avatar default">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                 <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
               </svg>
             </div>`
          }
          <div class="student-info">
            <div class="student-name">${student.name || 'Nome não informado'}</div>
            <div class="student-detail"><strong>Curso:</strong> ${student.course || 'Não informado'}</div>
            <div class="student-detail"><strong>Turno:</strong> ${student.shift || 'Não informado'}</div>
            <div class="student-detail"><strong>CPF:</strong> ${student.cpf || 'Não informado'}</div>
            <div class="student-detail"><strong>Email:</strong> ${student.email || 'Não informado'}</div>
          </div>
        </div>
      `).join('');
    }

    document.addEventListener('DOMContentLoaded', loadStudents);