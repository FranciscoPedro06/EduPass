import { db, auth } from "./firebase-config.js";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// ====== Função global de alerta ======
function mostrarAlerta(mensagem, tipo = "info") {
  let container = document.getElementById("container-alertas");
  if (!container) {
    container = document.createElement("div");
    container.id = "container-alertas";
    document.body.appendChild(container);
  }

  const alerta = document.createElement("div");
  alerta.className = `alerta alerta-${tipo}`;
  alerta.textContent = mensagem;
  container.appendChild(alerta);

  setTimeout(() => alerta.remove(), 4000);
}

// ====== Lógica principal ======
document.addEventListener("DOMContentLoaded", () => {
  const studentNameEl = document.getElementById("studentName");
  const infoListEl = document.getElementById("infoList");
  const profileAvatarEl = document.getElementById("profileAvatar");
  const editBtn = document.getElementById("editProfileBtn");
  const backBtn = document.getElementById("backButton");

  let usuario = null;
  let userDocId = null;

  // === Detecta usuário autenticado ===
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      mostrarAlerta("Você precisa estar logado.", "erro");
      setTimeout(() => (window.location.href = "index.html"), 2000);
      return;
    }

    try {
      const q = query(collection(db, "students"), where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        mostrarAlerta("Usuário não encontrado no banco de dados.", "erro");
        return;
      }

      const docRef = querySnapshot.docs[0];
      userDocId = docRef.id;
      usuario = docRef.data();

      preencherPerfil(usuario);
    } catch (err) {
      console.error(err);
      mostrarAlerta("Erro ao carregar dados do perfil.", "erro");
    }
  });

  // === Função para preencher o perfil ===
  function preencherPerfil(user) {
    studentNameEl.textContent = user.nome || "Nome não disponível";

    if (user.foto) {
      profileAvatarEl.innerHTML = `<img src="${user.foto}" alt="Foto do aluno" />`;
    } else {
      profileAvatarEl.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>`;
    }

    const campos = [
      { label: "Email", valor: user.email },
      { label: "CPF", valor: user.cpf },
      { label: "Instituição", valor: user.instituicao },
      { label: "Curso", valor: user.curso },
      { label: "Turno", valor: user.turno },
    ];

    infoListEl.innerHTML = campos
      .map(
        (c) => `
        <div class="info-item">
          <strong>${c.label}:</strong> <span>${c.valor || "Não informado"}</span>
        </div>`
      )
      .join("");
  }

  // === Botão Voltar ===
  backBtn.addEventListener("click", () => window.history.back());

  // === Botão Editar Perfil ===
  editBtn.addEventListener("click", async () => {
    if (!usuario) return mostrarAlerta("Usuário não carregado.", "erro");

    // Criar campos editáveis dinamicamente
    infoListEl.innerHTML = `
      <label>Nome: <input type="text" id="editNome" value="${usuario.nome || ""}" /></label>
      <label>CPF: <input type="text" id="editCpf" value="${usuario.cpf || ""}" /></label>
      <label>Instituição: <input type="text" id="editInstituicao" value="${usuario.instituicao || ""}" /></label>
      <label>Curso: <input type="text" id="editCurso" value="${usuario.curso || ""}" /></label>
      <label>Turno: <input type="text" id="editTurno" value="${usuario.turno || ""}" /></label>
      <button id="saveChangesBtn" class="save-button">Salvar alterações</button>
      <button id="cancelChangesBtn" class="save-button">Cancelar alterações</button>
    `;

    const saveBtn = document.getElementById("saveChangesBtn");
    saveBtn.addEventListener("click", async () => {
      const novosDados = {
        nome: document.getElementById("editNome").value.trim(),
        cpf: document.getElementById("editCpf").value.trim(),
        instituicao: document.getElementById("editInstituicao").value.trim(),
        curso: document.getElementById("editCurso").value.trim(),
        turno: document.getElementById("editTurno").value.trim(),
        email: usuario.email,
        estudante: true,
        status: "aguardando_aprovacao",
        alteracaoSolicitadaEm: new Date().toISOString(),
        ref_original: userDocId, // 🔗 referência ao documento original
      };

      try {
        await addDoc(collection(db, "pending_students"), novosDados);
        mostrarAlerta("Solicitação de alteração enviada ao administrador.", "sucesso");

        // volta ao modo de visualização
        setTimeout(() => preencherPerfil(usuario), 2000);
      } catch (error) {
        console.error(error);
        mostrarAlerta("Erro ao enviar solicitação!", "erro");
      }
    });

      const cancelBtn = document.getElementById("cancelChangesBtn");
    cancelBtn.addEventListener("click", async () => {
      window.location.reload();
    });
  });
});
