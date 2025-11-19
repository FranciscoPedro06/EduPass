import { db } from "./firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

/* ============================================================
   ELEMENTOS DA TELA
============================================================ */

const screenMinhasViagens = document.getElementById("screenMinhasViagens");
const btnAbrirViagens = document.getElementById("btnAbrirMinhasViagens");
const btnVoltarViagens = document.getElementById("btnVoltarDasViagens");
const listaViagensContainer = document.getElementById("listaMinhasViagens");

/* ============================================================
   ABRIR TELA DE MINHAS VIAGENS
============================================================ */

if (btnAbrirViagens) {
  btnAbrirViagens.addEventListener("click", () => {
    screenMinhasViagens.classList.remove("hidden");
    carregarViagensDoMotorista();
  });
}

btnVoltarViagens.addEventListener("click", () => {
  window.location.href = "telaInicioMotorista.html";
});


/* ============================================================
   VOLTAR PARA A TELA INICIAL
============================================================ */

btnVoltarViagens.addEventListener("click", () => {
  screenMinhasViagens.classList.add("hidden");
  screen1.classList.remove("hidden");
});

/* ============================================================
   BUSCAR ROTAS DO MOTORISTA NO FIREBASE
============================================================ */

async function carregarViagensDoMotorista() {
  listaViagensContainer.innerHTML = "<p>Carregando...</p>";

  const nomeMotorista = sessionStorage.getItem("nomeMotorista");

  if (!nomeMotorista) {
    listaViagensContainer.innerHTML = `
      <p class="aviso">Erro: nome do motorista não encontrado.</p>
    `;
    return;
  }

  try {
    const q = query(
      collection(db, "rotasConfirmadas"),
      where("motorista", "==", nomeMotorista)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      listaViagensContainer.innerHTML = `
        <div class="card-vazio">
          <p>Você ainda não possui rotas vinculadas.</p>
        </div>
      `;
      return;
    }

    listaViagensContainer.innerHTML = "";

    snap.forEach((doc) => criarCardViagem(doc.data()));

  } catch (error) {
    console.error("Erro ao carregar viagens:", error);
    listaViagensContainer.innerHTML =
      "<p class='erro'>Erro ao carregar suas viagens.</p>";
  }
}

/* ============================================================
   CRIAR CARD NA TELA
============================================================ */

function criarCardViagem(dados) {
  const card = document.createElement("div");
  card.className = "card-rota";

  const ida = dados.ida?.join(" ➝ ") || "Não informado";
  const volta = dados.volta?.join(" ➝ ") || "Não informado";

  card.innerHTML = `
    <div class="card-header ${dados.periodo.toLowerCase()}">
      <h3>${dados.rota}</h3>
      <span class="badge">${dados.periodo}</span>
    </div>

    <div class="card-body">
      <p><strong>IDA:</strong> ${ida}</p>
      <p><strong>VOLTA:</strong> ${volta}</p>

      <hr>

      <p style="font-size: 0.9em; color: #666;">
        Motorista responsável: <strong>${dados.motorista}</strong>
      </p>
    </div>
  `;

  listaViagensContainer.appendChild(card);
}
