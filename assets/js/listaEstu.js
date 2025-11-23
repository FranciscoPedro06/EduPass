import { db } from "./firebase-config.js";
import { collection, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// Variável para guardar a lista mestre de estudantes
let allStudents = [];

/**
 * Renderiza os cards de estudante na tela.
 * @param {Array} studentsToRender - A lista (filtrada ou completa) de estudantes a ser exibida.
 */
function renderStudents(studentsToRender) {
  const container = document.getElementById("studentsContainer");

  // Verifica se a lista para renderizar está vazia
  if (studentsToRender.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 17a1 1 0 0 1 2 0v2a1 1 0 0 1-2 0v-2Zm0-8a1 1 0 0 1 2 0v5a1 1 0 0 1-2 0V9Zm8.9-3.9 1.4 1.4L4.1 21.3l-1.4-1.4L19.9 5.1Z"></path><path d="m14 7 5.5 5.5m-1.5 5.5 1 1"></path></svg>
        <h3 class="empty-title">Nenhum estudante encontrado</h3>
        <p class="empty-description">Tente ajustar os termos da sua pesquisa.</p>
      </div>`;
    return;
  }

  // Cria o HTML para cada estudante
  container.innerHTML = studentsToRender.map(student => `
    <div class="student-card ${student.tipo === "pendente" ? "pending" : ""}" 
         data-id="${student.id}" data-tipo="${student.tipo}">
      ${student.foto && student.foto.trim() !== "" ?
        `<div class="student-avatar" style="background-image: url('${student.foto}')"></div>` :
        `<div class="student-avatar default">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
             <circle cx="12" cy="7" r="4"></circle>
           </svg>
         </div>`}
      <div class="student-info">
        <div class="student-name">${student.nome || "Nome não informado"}</div>
        <div class="student-detail"><strong>Instituição:</strong> ${student.instituicao || "Não informado"}</div>
        <div class="student-detail"><strong>Curso:</strong> ${student.curso || "Não informado"}</div>
      </div>
    </div>
  `).join("");

  // Adiciona evento de clique para abrir o modal
  document.querySelectorAll(".student-card").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      const tipo = card.dataset.tipo;
      // Encontra o estudante na lista MESTRE para garantir todos os dados
      const student = allStudents.find(s => s.id === id); 
      if (student) {
        openModal(student, tipo);
      }
    });
  });
}

/**
 * Busca os estudantes do Firebase (apenas uma vez).
 */
async function loadStudents() {
  const container = document.getElementById("studentsContainer");
  container.innerHTML = `<p class="loading">Carregando estudantes...</p>`;

  try {
    const [approvedSnap, pendingSnap] = await Promise.all([
      getDocs(collection(db, "students")),
      getDocs(collection(db, "pending_students")),
    ]);

    const approvedStudents = approvedSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), tipo: "aprovado" }));
    const pendingStudents = pendingSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), tipo: "pendente" }));
    
    // Armazena na variável global
    allStudents = [...approvedStudents, ...pendingStudents]; 
    
    // Ordena por nome (opcional, mas recomendado)
    allStudents.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));

    // Renderiza a lista completa pela primeira vez
    renderStudents(allStudents);

  } catch (error) {
    console.error("Erro ao carregar estudantes:", error);
    container.innerHTML = `<p>Erro ao carregar dados.</p>`;
  }
}

/**
 * Filtra e re-renderiza a lista de estudantes com base na pesquisa.
 */
function handleSearch() {
  const searchBar = document.getElementById("searchBar");
  const searchTerm = searchBar.value.toLowerCase().trim();

  const filteredStudents = allStudents.filter(student => {
    // Garante que 'student.nome' existe antes de chamar .toLowerCase()
    const studentName = (student.nome || "").toLowerCase();
    return studentName.includes(searchTerm);
  });

  // Re-renderiza a lista apenas com os estudantes filtrados
  renderStudents(filteredStudents);
}

// === Função para abrir o modal ===
function openModal(student, tipo) {
  const modal = document.getElementById("studentModal");
  const modalDetails = document.getElementById("modalDetails");
  const deleteBtn = document.getElementById("deleteStudentBtn");

  // Função estilizada para exibir documentos
  const renderDoc = (label, url) => {
    return `
      <div class="doc-card">
        <div class="doc-info">
          <div class="doc-icon">📄</div>
          <div class="doc-text">
            <strong>${label}</strong>
            <span>${url ? "Arquivo enviado" : "Não enviado"}</span>
          </div>
        </div>

        ${
          url
            ? `<button class="btn-doc" data-url="${url}">Ver</button>`
            : `<span class="doc-missing">—</span>`
        }
      </div>
    `;
  };

  modalDetails.innerHTML = `
    <h2>${student.nome || "Nome não informado"}</h2>

    <p><strong>Instituição:</strong> ${student.instituicao || "Não informado"}</p>
    <p><strong>Curso:</strong> ${student.curso || "Não informado"}</p>
    <p><strong>Turno:</strong> ${student.turno || "Não informado"}</p>
    <p><strong>CPF:</strong> ${student.cpf || "Não informado"}</p>
    <p><strong>Email:</strong> ${student.email || "Não informado"}</p>
    <p><strong>Status:</strong> ${student.status || tipo}</p>

    <h3 class="docs-title">📎 Documentos enviados</h3>

    <div class="docs-grid">
      ${renderDoc("Foto 3x4", student.foto3x4Url)}
      ${renderDoc("Comprovante de residência", student.residenciaUrl)}
      ${renderDoc("Título de Eleitor", student.tituloUrl)}
      ${renderDoc("Documento RG", student.rgUrl)}
      ${renderDoc("Documento CPF", student.cpfUrl)}
    </div>
  `;

  // Botões de abrir arquivos
  modalDetails.querySelectorAll(".btn-doc").forEach(btn => {
    btn.addEventListener("click", () => {
      const url = btn.dataset.url;
      if (!url) return alert("Arquivo não encontrado!");
      window.open(url, "_blank");
    });
  });

  // === Botão deletar estudante ===
  deleteBtn.onclick = async () => {
    if (confirm(`Deseja realmente excluir ${student.nome}?`)) {
      try {
        await deleteDoc(doc(db, tipo === "pendente" ? "pending_students" : "students", student.id));
        alert("Estudante excluído com sucesso!");
        modal.classList.add("hidden");
        loadStudents();
      } catch (error) {
        console.error("Erro ao excluir estudante:", error);
        alert("Erro ao excluir estudante.");
      }
    }
  };

  modal.classList.remove("hidden");
}


// === Event Listeners ===
document.addEventListener("DOMContentLoaded", () => {
  // Carrega os estudantes
  loadStudents();

  // Adiciona o listener para a barra de pesquisa
  const searchBar = document.getElementById("searchBar");
  searchBar.addEventListener("input", handleSearch);

  // Adiciona o listener para fechar o modal
  document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("studentModal").classList.add("hidden");
  });
});