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
    
    // ===== LÓGICA DA PÁGINA DE PERFIL =====
    document.addEventListener("DOMContentLoaded", () => {
      const emailLogado = sessionStorage.getItem('usuarioLogado');
      const estudantes = JSON.parse(localStorage.getItem('estudantes')) || [];
      const usuario = estudantes.find(u => u.email === emailLogado);

      const studentNameEl = document.getElementById('studentName');
      const infoListEl = document.getElementById('infoList');
      const profileAvatarEl = document.getElementById('profileAvatar');
      const backButton = document.getElementById('backButton');
      const editBtn = document.getElementById('editProfileBtn');

      if (!usuario) {
        mostrarAlerta('Erro: Usuário não encontrado. Faça login novamente.', 'erro');
        studentNameEl.textContent = "Usuário não encontrado";
        // Opcional: Redirecionar para login após um tempo
        // setTimeout(() => window.location.href = 'login.html', 3000);
        return;
      }

      // Preencher Nome
      studentNameEl.textContent = usuario.nome || "Nome não disponível";

      // Preencher Avatar (Foto ou Ícone)
      if (usuario.foto) {
          profileAvatarEl.innerHTML = ''; // Limpa o SVG padrão
          const img = document.createElement('img');
          img.src = usuario.foto;
          img.alt = `Foto de ${usuario.nome}`;
          profileAvatarEl.appendChild(img);
      } // Se não houver foto, o SVG padrão já está no HTML

      // Mapeamento de Chaves para Labels e Ícones
      const infoMap = {
        curso: { label: 'Curso', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>' },
        turno: { label: 'Turno', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
        nascimento: { label: 'Nascimento', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
        cpf: { label: 'CPF', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/></svg>' },
        email: { label: 'Email', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>' }
      };

      // Limpar lista antes de preencher
      infoListEl.innerHTML = ''; 

      // Preencher a lista de informações
      Object.keys(infoMap).forEach(key => {
        const info = infoMap[key];
        let valor = usuario[key] || 'Não informado';

        // Formatar data de nascimento
        if (key === 'nascimento' && usuario.nascimento) {
          try {
            const partes = usuario.nascimento.split('-'); // ["YYYY","MM","DD"]
            if (partes.length === 3) {
              valor = `${partes[2]}/${partes[1]}/${partes[0]}`;
            }
          } catch (e) {
             console.error("Erro ao formatar data de nascimento:", e);
             valor = usuario.nascimento; // Mantém o valor original se der erro
          }
        }
        
        // Criar o item da lista
        const itemDiv = document.createElement('div');
        itemDiv.className = 'info-item';
        itemDiv.innerHTML = `
          <div class="info-icon">${info.icon}</div>
          <div class="info-text">
            <span class="info-label">${info.label}:</span> ${valor}
          </div>
        `;
        infoListEl.appendChild(itemDiv);
      });

      // Botão Voltar
      if (backButton) {
        backButton.addEventListener('click', () => window.history.back());
      }

      // Botão Editar
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          mostrarAlerta('Funcionalidade de edição em desenvolvimento', 'aviso');
          // Futuro: window.location.href = 'editar-perfil-estudante.html'; 
        });
      }
    });