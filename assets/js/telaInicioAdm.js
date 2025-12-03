import { db } from "./firebase-config.js";
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc,
  addDoc      
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { auth } from "./firebase-config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";


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

  setTimeout(() => {
    alerta.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => alerta.remove(), 300);
  }, 4000);
}

document.addEventListener("DOMContentLoaded", () => {
  const linkExcluir = document.getElementById("excluirEstudanteLink");
  if (!linkExcluir) return;

  linkExcluir.addEventListener("click", async (e) => {
    e.preventDefault();

    const cpfParaExcluir = prompt("Digite o CPF do estudante a ser excluído (apenas números):");
    if (!cpfParaExcluir) return;

    const cpfLimpo = cpfParaExcluir.replace(/\D/g, '');

    try {
      const colecoes = ["students", "pending_students"];
      let encontrado = false;

      for (const nomeColecao of colecoes) {
        const snapshot = await getDocs(collection(db, nomeColecao));

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          const cpfEstudante = (data.cpf || "").replace(/\D/g, "");

          if (cpfEstudante === cpfLimpo) {
            const confirmacao = confirm(
              `Tem certeza que deseja excluir o estudante "${data.nome}" (${data.email}) da coleção "${nomeColecao}"?`
            );
            if (!confirmacao) return;

            await deleteDoc(doc(db, nomeColecao, docSnap.id));
            mostrarAlerta(`Estudante "${data.nome}" removido com sucesso!`, "sucesso");
            encontrado = true;
            break;
          }
        }

        if (encontrado) break;
      }

      if (!encontrado) {
        mostrarAlerta("Nenhum estudante encontrado com esse CPF!", "erro");
      }
    } catch (error) {
      console.error("Erro ao excluir estudante:", error);
      mostrarAlerta("Erro ao excluir estudante. Tente novamente.", "erro");
    }
  });
});

// Ao carregar a página
document.addEventListener("DOMContentLoaded", async () => {
  const lista = document.getElementById("listaPendentes");


    const snapshot = await getDocs(collection(db, "pending_students"));

    if (snapshot.empty) {
      lista.innerHTML = "<p>Nenhum estudante pendente.</p>";
      return;
    }

    snapshot.forEach((docSnap) => {
      const dados = docSnap.data();
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${dados.nome}</strong> (${dados.email})<br>
        <button class="btn-aceitar" data-id="${docSnap.id}"> Aceitar</button>
        <button class="btn-recusar" data-id="${docSnap.id}"> Recusar</button>
      `;
      lista.appendChild(li);
    });

    // Eventos dos botões
    document.querySelectorAll(".btn-aceitar").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await aprovarCadastro(btn.dataset.id);
      });
    });

    document.querySelectorAll(".btn-recusar").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await recusarCadastro(btn.dataset.id);
      });
    });
});

async function aprovarCadastro(id) {
  try {
    const docRef = doc(db, "pending_students", id);
    const snap = await (await import("https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js")).getDoc(docRef);

    if (!snap.exists()) return mostrarAlerta("Cadastro não encontrado!", "erro");

    const dados = snap.data();

    // move para a coleção "students"
    await addDoc(collection(db, "students"), {
      nome: dados.nome,
      email: dados.email,
      senha: dados.senha,
      status: "aprovado",
      estudante: true
    });

    // remove da pendente
    await deleteDoc(docRef);

    mostrarAlerta("Estudante aprovado com sucesso!", "sucesso");
    location.reload();
  } catch (err) {
    console.error(err);
    mostrarAlerta("Erro ao aprovar cadastro!", "erro");
  }
}

async function recusarCadastro(id) {
  try {
    await deleteDoc(doc(db, "pending_students", id));
    mostrarAlerta("Cadastro recusado e removido!", "aviso");
    location.reload();
  } catch (err) {
    console.error(err);
    mostrarAlerta("Erro ao recusar cadastro!", "erro");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const badge = document.getElementById("notificationBadge");

  try {
    const snapshot = await getDocs(collection(db, "pending_students"));

    // Se houver estudantes pendentes, mostra o badge
    if (!snapshot.empty) {
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }
  } catch (err) {
    console.error("Erro ao verificar notificações:", err);
  }
});

document.getElementById("notificationsButton").addEventListener("click", async () => {
  const snapshot = await getDocs(collection(db, "pending_students"));
  if (snapshot.empty) {
    alert("Nenhum estudante aguardando verificação.");
  } else {
    alert(`Há ${snapshot.size} estudante(s) aguardando verificação.`);
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
      logoutButton.addEventListener("click", async () => {
        try {
          await signOut(auth);
          sessionStorage.clear();
          mostrarAlerta("Logout realizado com sucesso!", "sucesso");
          setTimeout(() => (window.location.href = "index.html"), 1500);
        } catch (erro) {
          console.error("Erro ao fazer logout:", erro);
          mostrarAlerta("Erro ao fazer logout. Tente novamente.", "erro");
        }
      });
    }
});

document.addEventListener("DOMContentLoaded", () => {
  carregarEstudantesPorTurno();

  // Clique para visualizar emails
  document.getElementById("tituloMatutino").addEventListener("click", () => mostrarEmailsTurno("MATUTINO"));
  document.getElementById("tituloVespertino").addEventListener("click", () => mostrarEmailsTurno("VESPERTINO"));
  document.getElementById("tituloNoturno").addEventListener("click", () => mostrarEmailsTurno("NOTURNO"));
});

const gruposGlobal = {
  MATUTINO: [],
  VESPERTINO: [],
  NOTURNO: []
};

async function carregarEstudantesPorTurno() {
  const snap = await getDocs(collection(db, "presencas"));

  gruposGlobal.MATUTINO = [];
  gruposGlobal.VESPERTINO = [];
  gruposGlobal.NOTURNO = [];

  snap.forEach(docSnap => {
    const dados = docSnap.data();
    if (dados.checklist !== true) return;

    let turno = (dados.shift || "").toUpperCase();
    if (turno === "MANHÃ") turno = "MATUTINO";
    if (turno === "TARDE") turno = "VESPERTINO";
    if (turno === "NOITE") turno = "NOTURNO";

    if (gruposGlobal[turno]) {
      gruposGlobal[turno].push({
        nome: dados.nomeEstudante || "Sem nome",
        email: dados.userEmail || ""
      });
    }
  });

  atualizarTitulo("tituloMatutino", "Matutino", gruposGlobal.MATUTINO.length);
  atualizarTitulo("tituloVespertino", "Vespertino", gruposGlobal.VESPERTINO.length);
  atualizarTitulo("tituloNoturno", "Noturno", gruposGlobal.NOTURNO.length);

  preencherLista("listaMatutino", gruposGlobal.MATUTINO);
  preencherLista("listaVespertino", gruposGlobal.VESPERTINO);
  preencherLista("listaNoturno", gruposGlobal.NOTURNO);
}

function atualizarTitulo(id, baseText, total) {
  document.getElementById(id).innerText = `${baseText} — ${total} confirmados`;
}

// --- Modal elements (pegar referências)
const modal = document.getElementById("modalEmails");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");

// Abre o modal com a lista de um turno
function mostrarEmailsTurno(turno) {
  const grupo = gruposGlobal[turno] || [];
  if (grupo.length === 0) {
    // opcional: aviso breve
    mostrarAlerta("Nenhum estudante confirmado neste turno.", "info");
    return;
  }

  modalTitle.textContent = `Estudantes confirmados — ${turno} (${grupo.length})`;

  // constrói o HTML da lista (nome — email)
  const html = `
    <ul>
      ${grupo.map(est => `
        <li>
          <strong>${escapeHtml(est.nome)}</strong><br>
          <a href="mailto:${encodeURIComponent(est.email)}">${escapeHtml(est.email)}</a>
        </li>
      `).join("")}
    </ul>
    <div style="margin-top:12px; font-size:13px; color:#6b7280;">
      Toque fora do modal ou no × para fechar.
    </div>
  `;

  modalContent.innerHTML = html;

  // abre modal
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");

  // colocar foco em close para acessibilidade
  modalCloseBtn.focus();
}

// Fecha o modal
function fecharModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  modalContent.innerHTML = "";
}

// Eventos de fechamento
modalCloseBtn.addEventListener("click", fecharModal);
modalBackdrop.addEventListener("click", fecharModal);

// fecha com ESC
document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape" && modal.classList.contains("open")) fecharModal();
});

// função simples para escapar HTML (evita XSS se dados vindos do banco)
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

}
