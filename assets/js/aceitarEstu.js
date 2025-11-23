import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const auth = getAuth();
let estudanteSelecionado = null;

// === Botão voltar ===
const backButton = document.getElementById("backButton");
if (backButton) backButton.addEventListener("click", () => window.history.back());

/* ============================================================
   ALERTA VISUAL
============================================================ */
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

/* ============================================================
   ABRIR ARQUIVOS SUPABASE
============================================================ */
function abrirArquivoSupabase(url) {
  if (!url) return mostrarAlerta("Arquivo não encontrado!", "erro");
  window.open(url, "_blank");
}

/* ============================================================
   FUNÇÃO DE COMPONENTE – CARD DOS ANEXOS
============================================================ */
function criarCard(titulo, url) {
  if (!url)
    return `
      <div class="anexo-card anexo-vazio">
        <div class="anexo-icone">❌</div>
        <p>${titulo}</p>
        <span class="anexo-status">Não enviado</span>
      </div>
    `;

  return `
    <div class="anexo-card">
      <div class="anexo-icone">📄</div>
      <p>${titulo}</p>
      <button class="btn-doc" data-url="${url}">Abrir</button>
    </div>
  `;
}

/* ============================================================
   ENVIAR NOTIFICAÇÃO
============================================================ */
async function enviarNotificacao(email, mensagem, tipo = "info") {
  if (!email || !mensagem) return;

  try {
    await addDoc(collection(db, "notifications"), {
      userEmail: email.trim().toLowerCase(),
      message: mensagem,
      type: tipo,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Erro ao salvar notificação:", err);
  }
}

/* ============================================================
   CARREGAR ESTUDANTES PENDENTES
============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
  const lista = document.getElementById("listaPendentes");
  const modal = document.getElementById("modalDetalhes");
  const infoEstudante = document.getElementById("infoEstudante");
  const btnFechar = document.getElementById("btnFechar");
  const btnAprovar = document.getElementById("btnAprovar");
  const btnRecusar = document.getElementById("btnRecusar");

  if (!lista || !modal) return;

  btnFechar.addEventListener("click", () => (modal.style.display = "none"));

  try {
    const snapshot = await getDocs(collection(db, "pending_students"));

    if (snapshot.empty) {
      lista.innerHTML = "<p>Nenhum estudante pendente.</p>";
      return;
    }

    snapshot.forEach((docSnap) => {
      const dados = docSnap.data();

      const li = document.createElement("li");
      li.innerHTML = `
        <div class="dados-estudante">
          <strong>${dados.nome}</strong>
          <span>${dados.email}</span>
          <small>${dados.ref_original ? "(Alteração)" : "(Novo cadastro)"}</small>
        </div>
        <button class="btn-detalhes" data-id="${docSnap.id}">Ver detalhes</button>
      `;
      lista.appendChild(li);
    });

   /* ============================================================
   BOTÃO: ABRIR DETALHES
============================================================ */
document.querySelectorAll(".btn-detalhes").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const id = btn.dataset.id;
    const ref = doc(db, "pending_students", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const dados = snap.data();
    estudanteSelecionado = { id, dados };

    /* ============================================================
       LAYOUT MODERNO (igual ao seu openModal)
    ============================================================ */

    // Função renderDoc integrada ao aceitarEstu.js
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

    infoEstudante.innerHTML = `
      <h2>${dados.nome || "Nome não informado"}</h2>

      <p><strong>Instituição:</strong> ${dados.instituicao || "Não informado"}</p>
      <p><strong>Curso:</strong> ${dados.curso || "Não informado"}</p>
      <p><strong>Turno:</strong> ${dados.turno || "Não informado"}</p>
      <p><strong>CPF:</strong> ${dados.cpf || "Não informado"}</p>
      <p><strong>Email:</strong> ${dados.email || "Não informado"}</p>

      ${
        dados.ref_original
          ? `<p><strong>Tipo:</strong> Solicitação de alteração</p>`
          : `<p><strong>Tipo:</strong> Novo cadastro</p>`
      }

      <h3 class="docs-title">📎 Documentos enviados</h3>

      <div class="docs-grid">
        ${renderDoc("Foto 3x4", dados.foto3x4Url)}
        ${renderDoc("Comprovante de residência", dados.residenciaUrl)}
        ${renderDoc("Título de Eleitor", dados.tituloUrl)}
        ${renderDoc("Documento RG", dados.rgUrl)}
        ${renderDoc("Documento CPF", dados.cpfUrl)}
      </div>
    `;

    modal.style.display = "flex";

    // Botões de abrir documento
    document.querySelectorAll(".btn-doc").forEach((b) => {
      b.addEventListener("click", () => abrirArquivoSupabase(b.dataset.url));
    });
  });
});


    /* ============================================================
       APROVAR
    ============================================================ */
    btnAprovar.addEventListener("click", async () => {
      if (!estudanteSelecionado) return;

      const { id, dados } = estudanteSelecionado;

      if (dados.ref_original) {
        await aprovarAlteracao(id, dados);
      } else {
        await aprovarNovoCadastro(id, dados);
      }

      modal.style.display = "none";
    });

    /* ============================================================
       RECUSAR
    ============================================================ */
    btnRecusar.addEventListener("click", async () => {
      if (!estudanteSelecionado) return;

      await recusarCadastro(estudanteSelecionado.id, estudanteSelecionado.dados);
      modal.style.display = "none";
    });

  } catch (err) {
    console.error(err);
    mostrarAlerta("Erro ao carregar cadastros!", "erro");
  }
});

/* ============================================================
   APROVAR NOVO CADASTRO
============================================================ */
async function aprovarNovoCadastro(id, dados) {
  try {
    const userQuery = query(collection(db, "students"), where("email", "==", dados.email));
    const existingUser = await getDocs(userQuery);

    if (existingUser.empty && dados.senha) {
      try {
        await createUserWithEmailAndPassword(auth, dados.email, dados.senha);
      } catch (authErr) {
        if (authErr.code !== "auth/email-already-in-use") throw authErr;
      }
    }

    await addDoc(collection(db, "students"), {
      ...dados,
      status: "aprovado",
      aprovadoEm: new Date().toISOString(),
    });

    await deleteDoc(doc(db, "pending_students", id));

    await enviarNotificacao(
      dados.email,
      "Seu cadastro foi aprovado! 🎉 Você já pode acessar sua conta.",
      "sucesso"
    );

    mostrarAlerta(`Estudante ${dados.nome} aprovado com sucesso!`, "sucesso");
    setTimeout(() => location.reload(), 1500);
  } catch (err) {
    console.error("Erro ao aprovar novo cadastro:", err);
    mostrarAlerta("Erro ao aprovar cadastro!", "erro");
  }
}

/* ============================================================
   APROVAR ALTERAÇÃO
============================================================ */
async function aprovarAlteracao(pendingId, dados) {
  try {
    const studentRef = doc(db, "students", dados.ref_original);

   await updateDoc(studentRef, {
  nome: dados.nome,
  cpf: dados.cpf,
  instituicao: dados.instituicao,
  curso: dados.curso,
  turno: dados.turno,
  
  // 🔥 ATUALIZA OS DOCUMENTOS
  foto3x4Url: dados.foto3x4Url || null,
  residenciaUrl: dados.residenciaUrl || null,
  tituloUrl: dados.tituloUrl || null,
  rgUrl: dados.rgUrl || null,
  cpfUrl: dados.cpfUrl || null,

  status: "aprovado",
  aprovadoEm: new Date().toISOString(),
});


    await deleteDoc(doc(db, "pending_students", pendingId));

    await enviarNotificacao(
      dados.email,
      "Suas informações foram atualizadas com sucesso! ✅",
      "sucesso"
    );

    mostrarAlerta("Alteração de cadastro aprovada!", "sucesso");
    setTimeout(() => location.reload(), 1500);
  } catch (err) {
    console.error("Erro ao aprovar alteração:", err);
    mostrarAlerta("Erro ao aprovar alteração!", "erro");
  }
}

/* ============================================================
   RECUSAR
============================================================ */
async function recusarCadastro(id, dados) {
  try {
    await deleteDoc(doc(db, "pending_students", id));

    await enviarNotificacao(
      dados.email,
      "Sua solicitação foi recusada. Verifique seus dados e tente novamente.",
      "aviso"
    );

    mostrarAlerta("Solicitação recusada e removida!", "aviso");
    setTimeout(() => location.reload(), 1500);
  } catch (err) {
    console.error(err);
    mostrarAlerta("Erro ao recusar cadastro!", "erro");
  }
}
