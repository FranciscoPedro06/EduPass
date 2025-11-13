import { db } from "./firebase-config.js";
import { collection, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

async function loadStudents() {
  const container = document.getElementById("studentsContainer");
  container.innerHTML = `<p class="loading">Carregando estudantes...</p>`;

  try {
    const [approvedSnap, pendingSnap] = await Promise.all([
      getDocs(collection(db, "students")),
      getDocs(collection(db, "pending_students")),
    ]);

    if (approvedSnap.empty && pendingSnap.empty) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>Nenhum estudante encontrado</h3>
        </div>`;
      return;
    }

    const approvedStudents = approvedSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), tipo: "aprovado" }));
    const pendingStudents = pendingSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), tipo: "pendente" }));
    const allStudents = [...approvedStudents, ...pendingStudents];

    container.innerHTML = allStudents.map(student => `
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
        const student = allStudents.find(s => s.id === id);
        openModal(student, tipo);
      });
    });

  } catch (error) {
    console.error("Erro ao carregar estudantes:", error);
    container.innerHTML = `<p>Erro ao carregar dados.</p>`;
  }
}

// === Função para abrir o modal ===
function openModal(student, tipo) {
  const modal = document.getElementById("studentModal");
  const modalDetails = document.getElementById("modalDetails");
  const deleteBtn = document.getElementById("deleteStudentBtn");

  modalDetails.innerHTML = `
    <h2>${student.nome || "Nome não informado"}</h2>
    <p><strong>Instituição:</strong> ${student.instituicao || "Não informado"}</p>
    <p><strong>Curso:</strong> ${student.curso || "Não informado"}</p>
    <p><strong>Turno:</strong> ${student.turno || "Não informado"}</p>
    <p><strong>CPF:</strong> ${student.cpf || "Não informado"}</p>
    <p><strong>Email:</strong> ${student.email || "Não informado"}</p>
    <p><strong>Status:</strong> ${student.status || tipo}</p>
  `;

  deleteBtn.onclick = async () => {
    if (confirm(`Deseja realmente excluir ${student.nome}?`)) {
      await deleteDoc(doc(db, tipo === "pendente" ? "pending_students" : "students", student.id));
      alert("Estudante excluído com sucesso!");
      modal.classList.add("hidden");
      loadStudents(); // recarrega lista
    }
  };

  modal.classList.remove("hidden");
}

// === Fechar modal ===
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("studentModal").classList.add("hidden");
});

document.addEventListener("DOMContentLoaded", loadStudents);
