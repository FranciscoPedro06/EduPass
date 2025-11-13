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
  serverTimestamp, // ✅ necessário para o createdAt funcionar corretamente
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

// === Envia notificação ao usuário ===
async function enviarNotificacao(email, mensagem, tipo = "info") {
  if (!email || !mensagem) {
    console.error("❌ Notificação inválida: email ou mensagem ausente!");
    return;
  }

  try {
    await addDoc(collection(db, "notifications"), {
      userEmail: email.trim().toLowerCase(), // 🔒 padroniza o e-mail
      message: mensagem,
      type: tipo,
      read: false,
      createdAt: serverTimestamp(), // 🔥 campo de data correta
    });
    console.log("✅ Notificação salva com sucesso:", mensagem);
  } catch (err) {
    console.error("Erro ao salvar notificação:", err);
  }
}

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

    // === Ao clicar em "Ver detalhes" ===
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

    // === Aprovar cadastro ===
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

    // === Recusar cadastro ===
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

// === 🆕 Aprovação de novo cadastro ===
async function aprovarNovoCadastro(id, dados) {
  try {
    const userQuery = query(collection(db, "students"), where("email", "==", dados.email));
    const existingUser = await getDocs(userQuery);

    if (existingUser.empty) {
      try {
        if (dados.senha) {
          await createUserWithEmailAndPassword(auth, dados.email, dados.senha);
        }
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

    // ✅ Envia notificação ao estudante
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

// === 🔄 Aprovação de alteração existente ===
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

    // ✅ Envia notificação ao estudante
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

// === ❌ Recusar solicitação ===
async function recusarCadastro(id, dados) {
  try {
    await deleteDoc(doc(db, "pending_students", id));

    // ✅ Envia notificação ao estudante
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
