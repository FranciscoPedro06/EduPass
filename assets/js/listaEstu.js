import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

async function loadStudents() {
  const container = document.getElementById("studentsContainer");
  container.innerHTML = `<p class="loading">Carregando estudantes...</p>`;

  try {
    // Busca as duas coleções
    const [approvedSnap, pendingSnap] = await Promise.all([
      getDocs(collection(db, "students")),
      getDocs(collection(db, "pending_students")),
    ]);

    // Se ambas estiverem vazias
    if (approvedSnap.empty && pendingSnap.empty) {
      container.innerHTML = `
        <div class="empty-state">
          <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 002 2z"></path>
          </svg>
          <h3 class="empty-title">Nenhum estudante encontrado</h3>
          <p class="empty-description">Quando novos estudantes forem adicionados, eles aparecerão aqui.</p>
        </div>
      `;
      return;
    }

    // Mapeia os estudantes de ambas as coleções
    const approvedStudents = approvedSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), tipo: "aprovado" }));
    const pendingStudents = pendingSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), tipo: "pendente" }));

    const allStudents = [...approvedStudents, ...pendingStudents];

    // Monta os cards
    container.innerHTML = allStudents.map(student => `
      <div class="student-card ${student.tipo === "pendente" ? "pending" : ""}">
        ${student.foto && student.foto.trim() !== "" ?
          `<div class="student-avatar" style="background-image: url('${student.foto}')" aria-label="Foto de ${student.nome}"></div>` :
          `<div class="student-avatar default">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>`
        }
        <div class="student-info">
          <div class="student-name">${student.nome || "Nome não informado"}</div>
          <div class="student-detail"><strong>Instituição:</strong> ${student.instituicao || "Não informado"}</div>
          <div class="student-detail"><strong>Curso:</strong> ${student.curso || "Não informado"}</div>
          <div class="student-detail"><strong>Turno:</strong> ${student.turno || "Não informado"}</div>
          <div class="student-detail"><strong>CPF:</strong> ${student.cpf || "Não informado"}</div>
          <div class="student-detail"><strong>Email:</strong> ${student.email || "Não informado"}</div>
          <div class="student-detail"><strong>Status:</strong> 
            <span class="status ${student.status?.toLowerCase() || student.tipo}">${student.status || student.tipo}</span>
          </div>
        </div>
      </div>
    `).join("");

  } catch (error) {
    console.error("Erro ao carregar estudantes:", error);
    container.innerHTML = `
      <div class="error-state">
        <p>Ocorreu um erro ao buscar os dados. Tente novamente mais tarde.</p>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", loadStudents);
