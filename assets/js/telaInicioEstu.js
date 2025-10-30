 // ===== FUNÇÃO DE ALERTA GLOBAL (UNIFICADA) =====
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

    // ===== LÓGICA DO DASHBOARD ESTUDANTE =====
    document.addEventListener('DOMContentLoaded', () => {
      const emailLogado = sessionStorage.getItem('usuarioLogado');
      const estudantes = JSON.parse(localStorage.getItem('estudantes')) || [];
      const usuario = estudantes.find(u => u.email === emailLogado);

      // Elementos da UI
      const studentNameEl = document.getElementById('studentName');
      const studentInstitutionEl = document.getElementById('studentInstitution');
      const studentCourseEl = document.getElementById('studentCourse');
      const studentShiftEl = document.getElementById('studentShift');
      const studentCPFEl = document.getElementById('studentCPF'); // Usaremos CPF aqui
      const studentStatusEl = document.getElementById('studentStatus');
      const userPhotoEl = document.getElementById('userPhoto');
      const userAvatarEl = document.getElementById('userAvatar'); // Avatar no header
      const qrCodePlaceholderEl = document.getElementById('qrCodePlaceholder'); 
      
      const notificationsButton = document.getElementById('notificationsButton');
      const logoutButton = document.getElementById('logoutButton');
      const navPerfil = document.getElementById('navPerfil');
      const navHorarios = document.getElementById('navHorarios');
      const navReconhecimento = document.getElementById('navReconhecimento');


      if (!usuario) {
          mostrarAlerta('Usuário não encontrado. Faça login novamente.', 'erro');
          if(studentNameEl) studentNameEl.textContent = "Erro: Usuário não logado";
          // Opcional: Redirecionar para login
           // setTimeout(() => window.location.href = 'index.html', 2000); 
          return; // Interrompe a execução se não houver usuário
      }

      // Preencher informações
      if(studentNameEl) studentNameEl.textContent = `NOME: ${usuario.nome || 'Não informado'}`;
      // Assumindo que 'instituicao' está no objeto usuario, se não, ajuste
      if(studentInstitutionEl) studentInstitutionEl.innerHTML = `<span class="info-label">INSTITUIÇÃO:</span> ${usuario.instituicao || 'Não informada'}`; 
      if(studentCourseEl) studentCourseEl.innerHTML = `<span class="info-label">CURSO:</span> ${usuario.curso || 'Não informado'}`;
      if(studentShiftEl) studentShiftEl.innerHTML = `<span class="info-label">TURNO:</span> ${usuario.turno || 'Não informado'}`;
      if(studentCPFEl) studentCPFEl.innerHTML = `<span class="info-label">CPF:</span> ${usuario.cpf || usuario.documento || 'Não informado'}`; // Prioriza CPF
      
      // Atualizar Status Badge (Exemplo)
      const status = usuario.status || 'cadastrado'; // Assume 'cadastrado' como padrão
      if (studentStatusEl) {
          studentStatusEl.textContent = status.charAt(0).toUpperCase() + status.slice(1); // Capitaliza
          studentStatusEl.className = 'status-badge'; // Reseta classes
          if (status === 'cadastrado') {
              studentStatusEl.classList.add('status-cadastrado');
          } else if (status === 'pendente') {
              studentStatusEl.classList.add('status-pendente');
          } else if (status === 'bloqueado') {
              studentStatusEl.classList.add('status-bloqueado');
          }
      }

      // Foto de Perfil (no card e no header)
      if (usuario.foto) {
        if(userPhotoEl) {
            userPhotoEl.style.backgroundImage = `url(${usuario.foto})`;
        }
        if(userAvatarEl) {
            userAvatarEl.style.backgroundImage = `url(${usuario.foto})`;
        }
      } else {
          // Manter placeholders se não houver foto
          if(userPhotoEl) userPhotoEl.style.backgroundColor = 'var(--bg-color)'; 
          if(userAvatarEl) userAvatarEl.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
      }
      
      // Placeholder para QR Code (Idealmente, gerar dinamicamente)
      if (qrCodePlaceholderEl) {
          // Aqui você usaria uma biblioteca para gerar o QR code com base em dados do usuário (ex: ID ou CPF)
          // Exemplo: new QRCode(qrCodePlaceholderEl, usuario.id || usuario.cpf);
          // Por enquanto, mantemos o placeholder SVG
          qrCodePlaceholderEl.innerHTML = `
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> 
              <span style="font-size: 12px; margin-top: 8px;">QR Code</span>`;
      }

      // --- Event Listeners ---

      // Header Buttons
      if (notificationsButton) {
        notificationsButton.addEventListener('click', () => {
          mostrarAlerta('Nenhuma notificação nova.', 'info');
        });
      }
      if (logoutButton) {
        logoutButton.addEventListener('click', () => {
          if (confirm('Tem certeza que deseja sair?')) {
            mostrarAlerta('Saindo...', 'info');
            sessionStorage.removeItem('usuarioLogado');
            setTimeout(() => { window.location.assign('index.html'); }, 1000); 
          }
        });
      }

      // Bottom Navigation
      if (navPerfil) navPerfil.addEventListener('click', () => window.location.href = 'perfilEstu.html');
      if (navHorarios) navHorarios.addEventListener('click', () => window.location.href = 'horarios.html');
      if (navReconhecimento) navReconhecimento.addEventListener('click', () => window.location.href = 'reconhecimentoFace.html');

    });