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

    // Mostra aviso fixo se estiver aguardando análise
    const avisoHTML = user.status === "aguardando_aprovacao"
      ? `<div class="status-aviso">Suas alterações estão em análise pelo administrador.</div>`
      : "";

    const campos = [
      { label: "Email", valor: user.email },
      { label: "CPF", valor: user.cpf },
      { label: "Instituição", valor: user.instituicao },
      { label: "Curso", valor: user.curso },
      { label: "Turno", valor: user.turno },
    ];

    infoListEl.innerHTML = `
      ${avisoHTML}
      ${campos
        .map(
          (c) => `
          <div class="info-item">
            <strong>${c.label}:</strong> <span>${c.valor || "Não informado"}</span>
          </div>`
        )
        .join("")}
    `;
  }

  // === Botão Voltar ===
  backBtn.addEventListener("click", () => window.history.back());

  // === Botão Editar Perfil ===
  editBtn.addEventListener("click", async () => {
    if (!usuario) return mostrarAlerta("Usuário não carregado.", "erro");

    // Impede edição se já houver solicitação pendente
    if (usuario.status === "aguardando_aprovacao") {
      return mostrarAlerta("Você já possui uma solicitação em análise.", "aviso");
    }

    editBtn.disabled = true;

    // === Campos editáveis ===
    infoListEl.innerHTML = `
      <div class="form-group">
        <label for="editNome">Nome:</label>
        <input type="text" id="editNome" value="${usuario.nome || ""}">
      </div>
      <div class="form-group">
        <label for="editCpf">CPF:</label>
        <input type="text" id="editCpf" value="${usuario.cpf || ""}">
      </div>
      <div class="form-group">
        <label for="editInstituicao">Instituição:</label>
        <input type="text" id="editInstituicao" value="${usuario.instituicao || ""}">
      </div>
      <div class="form-group">
        <label for="editCurso">Curso:</label>
        <input type="text" id="editCurso" value="${usuario.curso || ""}">
      </div>
      <div class="form-group">
        <label for="editTurno">Turno:</label>
        <select id="editTurno">
          <option value="Manhã" ${usuario.turno === "Manhã" ? "selected" : ""}>Manhã</option>
          <option value="Tarde" ${usuario.turno === "Tarde" ? "selected" : ""}>Tarde</option>
          <option value="Noite" ${usuario.turno === "Noite" ? "selected" : ""}>Noite</option>
        </select>
      </div>
      
      <div class="form-button-group">
        <button id="cancelChangesBtn" class="save-button secondary">Cancelar</button>
        <button id="saveChangesBtn" class="save-button primary">Salvar alterações</button>
      </div>
    `;

    // === Lógica dos botões ===
    const saveBtn = document.getElementById("saveChangesBtn");
    const cancelBtn = document.getElementById("cancelChangesBtn");

    saveBtn.addEventListener("click", async () => {
      const novosDados = {
        nome: document.getElementById("editNome").value.trim(),
        cpf: document.getElementById("editCpf").value.trim(),
        instituicao: document.getElementById("editInstituicao").value.trim(),
        curso: document.getElementById("editCurso").value.trim(),
        turno: document.getElementById("editTurno").value.trim(),
      };

      // Verifica se há mudanças em relação aos dados atuais
      const alterouAlgo = Object.keys(novosDados).some(
        (campo) => novosDados[campo] !== (usuario[campo] || "")
      );

      if (!alterouAlgo) {
        mostrarAlerta("Nenhuma alteração detectada.", "aviso");
        return;
      }

      saveBtn.textContent = "Enviando...";
      saveBtn.disabled = true;

      try {
        await addDoc(collection(db, "pending_students"), {
          ...novosDados,
          email: usuario.email,
          estudante: true,
          status: "aguardando_aprovacao",
          alteracaoSolicitadaEm: new Date().toISOString(),
          ref_original: userDocId,
        });

        mostrarAlerta("Solicitação de alteração enviada ao administrador.", "sucesso");

        // Atualiza o estado local e exibe o aviso
        usuario.status = "aguardando_aprovacao";
        preencherPerfil(usuario);
        editBtn.disabled = false;

      } catch (error) {
        console.error(error);
        mostrarAlerta("Erro ao enviar solicitação!", "erro");
        saveBtn.textContent = "Salvar alterações";
        saveBtn.disabled = false;
      }
    });

    cancelBtn.addEventListener("click", () => {
      preencherPerfil(usuario);
      editBtn.disabled = false;
    });
  });
});
