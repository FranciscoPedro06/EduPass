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
import { supabase } from "./supabase-client.js";

async function uploadAnexo(usuario, nomeCampoNoStorage, arquivo) {
  // Se não enviaram um novo arquivo → mantém o arquivo antigo
  const campoUrl = `${nomeCampoNoStorage}Url`;
  if (!arquivo) return usuario[campoUrl] || null;

  let path;

  const urlExistente = usuario[campoUrl];

  if (urlExistente) {
    /**
     * Se já existe URL → extrair o path real dentro do bucket
     * Exemplo:
     * https://xxxxx.supabase.co/storage/v1/object/public/edupass/alunos/000/foto3x4.jpg
     *
     * O que queremos extrair:
     * alunos/000/foto3x4.jpg
     */
    const split = urlExistente.split("/object/public/edupass/");
    
    if (split.length > 1) {
      path = split[1];
    } else {
      // fallback (NÃO deve acontecer, mas está aqui para segurança)
      const extensao = arquivo.name.split(".").pop();
      path = `alunos/${usuario.cpf}/${nomeCampoNoStorage}.${extensao}`;
    }
  } else {
    // Não existe arquivo anterior → criar
    const extensao = arquivo.name.split(".").pop();
    path = `alunos/${usuario.cpf}/${nomeCampoNoStorage}.${extensao}`;
  }

  // Faz upload com upsert = true → ATUALIZA o arquivo existente
  const { error } = await supabase.storage
    .from("edupass")
    .update(path, arquivo,)

  if (error) throw error;

  // Retorna URL atualizada
  const { data: urlInfo } = supabase.storage
    .from("edupass")
    .getPublicUrl(path);

  return urlInfo.publicUrl;
}




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

    if (user.foto3x4Url) {
      profileAvatarEl.innerHTML = `<img src="${user.foto3x4Url}" alt="Foto do aluno" />`;
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

  <h3 class="doc-title">📎 Atualizar Documentos</h3>

  <div class="form-group">
    <label>Foto 3x4:</label>
    <input type="file" id="editFoto3x4" accept="image/*">
  </div>

  <div class="form-group">
    <label>Comprovante de Residência:</label>
    <input type="file" id="editResidencia" accept="image/*,application/pdf">
  </div>

  <div class="form-group">
    <label>Título de Eleitor:</label>
    <input type="file" id="editTitulo" accept="image/*,application/pdf">
  </div>

  <div class="form-group">
    <label>Documento RG:</label>
    <input type="file" id="editRg" accept="image/*,application/pdf">
  </div>

  <div class="form-group">
    <label>Documento CPF:</label>
    <input type="file" id="editCpfDoc" accept="image/*,application/pdf">
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

  const alterouAlgo = Object.keys(novosDados).some(
    (campo) => novosDados[campo] !== (usuario[campo] || "")
  );

  const foto3x4File = document.getElementById("editFoto3x4").files[0];
  const residenciaFile = document.getElementById("editResidencia").files[0];
  const tituloFile = document.getElementById("editTitulo").files[0];
  const rgFile = document.getElementById("editRg").files[0];
  const cpfDocFile = document.getElementById("editCpfDoc").files[0];

  const alterouArquivos =
    foto3x4File || residenciaFile || tituloFile || rgFile || cpfDocFile;

  if (!alterouAlgo && !alterouArquivos) {
    mostrarAlerta("Nenhuma alteração detectada.", "aviso");
    return;
  }

  saveBtn.textContent = "Enviando...";
  saveBtn.disabled = true;

  try {
    // Uploads dos arquivos (mantém o atual se não enviar novo)
    const foto3x4Url = await uploadAnexo(usuario, "foto3x4", foto3x4File);
    const residenciaUrl = await uploadAnexo(usuario, "comprovante_residencia", residenciaFile);
    const tituloUrl = await uploadAnexo(usuario, "titulo_eleitor", tituloFile);
    const rgUrl = await uploadAnexo(usuario, "rg", rgFile);
    const cpfUrl = await uploadAnexo(usuario, "cpf", cpfDocFile);

    await addDoc(collection(db, "pending_students"), {
      ...novosDados,
      email: usuario.email,
      estudante: true,
      status: "aguardando_aprovacao",
      alteracaoSolicitadaEm: new Date().toISOString(),
      ref_original: userDocId,

      foto3x4Url,
      residenciaUrl,
      tituloUrl,
      rgUrl,
      cpfUrl,
    });

    mostrarAlerta("Solicitação enviada para análise.", "sucesso");

    usuario.status = "aguardando_aprovacao";
    preencherPerfil(usuario);
    editBtn.disabled = false;

  } catch (error) {
    console.error(error);
    mostrarAlerta("Erro ao enviar solicitação!", "erro");
    saveBtn.disabled = false;
    saveBtn.textContent = "Salvar alterações";
  }
});


    cancelBtn.addEventListener("click", () => {
      preencherPerfil(usuario);
      editBtn.disabled = false;
    });
  });
});

