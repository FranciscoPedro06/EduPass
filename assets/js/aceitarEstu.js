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
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const auth = getAuth();
let estudanteSelecionado = null;

// === Alerta visual ===
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

document.addEventListener("DOMContentLoaded", async () => {
  const lista = document.getElementById("listaPendentes");
  const modal = document.getElementById("modalDetalhes");
  const infoEstudante = document.getElementById("infoEstudante");
  const btnFechar = document.getElementById("btnFechar");
  const btnAprovar = document.getElementById("btnAprovar");
  const btnRecusar = document.getElementById("btnRecusar");

  // Fecha o modal
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

    // Abre o modal ao clicar em "Ver detalhes"
    document.querySelectorAll(".btn-detalhes").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const ref = doc(db, "pending_students", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) return;
        const dados = snap.data();
        estudanteSelecionado = { id, dados };

        infoEstudante.innerHTML = `
          <p><strong>Nome:</strong> ${dados.nome}</p>
          <p><strong>Email:</strong> ${dados.email}</p>
          <p><strong>CPF:</strong> ${dados.cpf}</p>
          <p><strong>Instituição:</strong> ${dados.instituicao}</p>
          <p><strong>Curso:</strong> ${dados.curso}</p>
          <p><strong>Turno:</strong> ${dados.turno}</p>
          <p><strong>Status:</strong> ${dados.status || "Pendente"}</p>
          ${
            dados.ref_original
              ? `<p><em>Solicitação de alteração de cadastro existente.</em></p>`
              : `<p><em>Novo cadastro aguardando aprovação.</em></p>`
          }
        `;
        modal.style.display = "flex";
      });
    });

    // Aprovar
    btnAprovar.addEventListener("click", async () => {
      if (!estudanteSelecionado) return;
      const { id, dados } = estudanteSelecionado;

      if (dados.ref_original) {
        // 🔄 Atualização de perfil existente
        await aprovarAlteracao(id, dados);
      } else {
        // 🆕 Novo cadastro
        await aprovarNovoCadastro(id, dados);
      }

      modal.style.display = "none";
    });

    // Recusar
    btnRecusar.addEventListener("click", async () => {
      if (!estudanteSelecionado) return;
      await recusarCadastro(estudanteSelecionado.id);
      modal.style.display = "none";
    });
  } catch (err) {
    console.error(err);
    mostrarAlerta("Erro ao carregar cadastros!", "erro");
  }
});


// === 🆕 Aprovação de novo cadastro ===
async function aprovarNovoCadastro(id, dados) {
  try {
    // Verifica se já existe estudante com o mesmo email
    const userQuery = query(collection(db, "students"), where("email", "==", dados.email));
    const existingUser = await getDocs(userQuery);

    // Cria conta no Auth (opcional)
    if (existingUser.empty) {
      try {
        if (dados.senha) {
          await createUserWithEmailAndPassword(auth, dados.email, dados.senha);
        } else {
          console.warn("Usuário sem senha — criado apenas no Firestore.");
        }
      } catch (authErr) {
        if (authErr.code !== "auth/email-already-in-use") throw authErr;
      }
    }

    // Adiciona no Firestore
    await addDoc(collection(db, "students"), {
      ...dados,
      status: "aprovado",
      aprovadoEm: new Date().toISOString(),
    });

    // Remove da coleção de pendentes
    await deleteDoc(doc(db, "pending_students", id));

    mostrarAlerta(`Estudante ${dados.nome} aprovado com sucesso!`, "sucesso");
    setTimeout(() => location.reload(), 1500);
  } catch (err) {
    console.error("Erro ao aprovar novo cadastro:", err);
    mostrarAlerta("Erro ao aprovar cadastro!", "erro");
  }
}


// === 🔄 Aprovação de alteração de dados existente ===
async function aprovarAlteracao(pendingId, dados) {
  try {
    const studentRef = doc(db, "students", dados.ref_original);

    await updateDoc(studentRef, {
      nome: dados.nome,
      cpf: dados.cpf,
      instituicao: dados.instituicao,
      curso: dados.curso,
      turno: dados.turno,
      status: "aprovado",
      aprovadoEm: new Date().toISOString(),
    });

    await deleteDoc(doc(db, "pending_students", pendingId));

    mostrarAlerta("Alteração de cadastro aprovada!", "sucesso");
    setTimeout(() => location.reload(), 1500);
  } catch (err) {
    console.error("Erro ao aprovar alteração:", err);
    mostrarAlerta("Erro ao aprovar alteração!", "erro");
  }
}


// === ❌ Recusar solicitação ===
async function recusarCadastro(id) {
  try {
    await deleteDoc(doc(db, "pending_students", id));
    mostrarAlerta("Solicitação recusada e removida!", "aviso");
    setTimeout(() => location.reload(), 1500);
  } catch (err) {
    console.error(err);
    mostrarAlerta("Erro ao recusar cadastro!", "erro");
  }
}
