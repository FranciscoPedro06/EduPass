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
        `;
        modal.style.display = "flex";
      });
    });

    // Aprovar
    btnAprovar.addEventListener("click", async () => {
      if (!estudanteSelecionado) return;
      await aprovarCadastro(estudanteSelecionado.id);
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

// === Função de aprovação (corrigida) ===
async function aprovarCadastro(id) {
  try {
    const ref = doc(db, "pending_students", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const dados = snap.data();

    // Verifica se já existe estudante com o mesmo email
    const userQuery = query(
      collection(db, "students"),
      where("email", "==", dados.email)
    );
    const existingUser = await getDocs(userQuery);

    // Se não existir, cria novo registro no Firestore e no Auth (se necessário)
    if (existingUser.empty) {
      try {
        // Tenta criar usuário no Auth (caso seja realmente novo)
        if (dados.senha) {
          await createUserWithEmailAndPassword(auth, dados.email, dados.senha);
        } else {
          console.warn("Usuário não tem senha registrada, criando apenas no Firestore.");
        }
      } catch (authErr) {
        if (authErr.code === "auth/email-already-in-use") {
          console.warn("Email já cadastrado no Auth, apenas atualizando Firestore.");
        } else {
          throw authErr;
        }
      }
    }

    // Adiciona o estudante aprovado ao Firestore
    await addDoc(collection(db, "students"), {
      ...dados,
      status: "aprovado",
      aprovadoEm: new Date().toISOString(),
    });

    // Remove da lista pendente
    await deleteDoc(ref);

    mostrarAlerta(`Estudante ${dados.nome} aprovado!`, "sucesso");
    setTimeout(() => location.reload(), 1500);
  } catch (err) {
    console.error("Erro ao aprovar cadastro:", err);
    mostrarAlerta("Erro ao aprovar cadastro!", "erro");
  }
}

// === Função de recusa ===
async function recusarCadastro(id) {
  try {
    await deleteDoc(doc(db, "pending_students", id));
    mostrarAlerta("Cadastro recusado e removido!", "aviso");
    setTimeout(() => location.reload(), 1500);
  } catch (err) {
    console.error(err);
    mostrarAlerta("Erro ao recusar cadastro!", "erro");
  }
}
