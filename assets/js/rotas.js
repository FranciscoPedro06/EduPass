import { db } from "./firebase-config.js";
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  where 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const editarChecklistBtn = document.getElementById("editarChecklist");
const excluirChecklistBtn = document.getElementById("excluirChecklist");


/* ============================================================
   1. IDENTIFICAR TIPO DE USUÁRIO
============================================================ */

let userRole = null; // "admin" | "motorista" | "estudante"

// Substitua a sua função carregarTipoUsuario atual por esta versão melhorada:

async function carregarTipoUsuario() {
  const emailLogado = sessionStorage.getItem("usuarioLogado");
  if (!emailLogado) return;

  const colecoes = [
    { nome: "admins", tipo: "admin" },
    { nome: "motoristas", tipo: "motorista" },
    { nome: "students", tipo: "estudante" }
  ];

  for (const col of colecoes) {
    const q = query(collection(db, col.nome), where("email", "==", emailLogado));
    const snap = await getDocs(q);

    if (!snap.empty) {
      userRole = col.tipo;
      
      // --- NOVO: Se for motorista, salva o NOME exato dele ---
      if (userRole === "motorista") {
        const dados = snap.docs[0].data();
        sessionStorage.setItem("nomeMotorista", dados.nome);
        sessionStorage.setItem("emailMotorista", dados.email);
        
        // Mostra o botão de "Minhas Viagens" apenas para motoristas
        const btnViagens = document.getElementById("btnAbrirMinhasViagens");
        if(btnViagens) btnViagens.style.display = "block"; 
      }
      // -------------------------------------------------------

      console.log("Tipo de usuário:", userRole);
      aplicarRestricoes();
      return;
    }
  }

  userRole = "estudante"; 
  aplicarRestricoes();
}

/* ============================================================
   BUSCAR CHECKLIST E APLICAR FILTRO DE ROTAS
============================================================ */
async function aplicarFiltroDeRotasPorChecklist() {
  const emailLogado = sessionStorage.getItem("usuarioLogado");
  if (!emailLogado) return;

  const snapChecklist = await getDocs(query(
    collection(db, "presencas"),
    where("userEmail", "==", emailLogado),
    where("checklist", "==", true)
  ));

  if (snapChecklist.empty) {
    console.log("Nenhum checklist encontrado → mostrar tudo.");
    return;
  }

  const dados = snapChecklist.docs[0].data();
  const turnoChecklist = (dados.shift || "").toUpperCase();

  console.log("Checklist encontrado. Turno recebido:", turnoChecklist);

  // 🔥 NORMALIZAÇÃO PADRÃO
  let turnoNormalizado = turnoChecklist;

  if (turnoChecklist === "NOITE") turnoNormalizado = "NOTURNO";
  if (turnoChecklist === "TARDE") turnoNormalizado = "VESPERTINO";
  if (turnoChecklist === "MANHÃ") turnoNormalizado = "MATUTINO";

  console.log("Turno normalizado:", turnoNormalizado);

  filtrarRotas(turnoNormalizado);
}




/* ============================================================
   FILTRAR BOTÕES DE ROTA PELO TURNO DO CHECKLIST
============================================================ */

function filtrarRotas(turno) {
  document.querySelectorAll(".route-btn").forEach(btn => {
    const turnoRota = btn.dataset.period; // EX: MATUTINO

    if (turnoRota !== turno) {
      btn.style.display = "none"; // Esconde
    } else {
      btn.style.display = "flex"; // Mostra somente as do turno correto
    }
  });
}



/* ============================================================
   2. SISTEMA DE ALERTAS
============================================================ */

function mostrarAlerta(mensagem, tipo = "erro") {
  const container = document.getElementById("alertas-container");
  const alerta = document.createElement("div");
  alerta.className = `alerta alerta-${tipo}`;
  alerta.textContent = mensagem;
  container.appendChild(alerta);

  setTimeout(() => alerta.remove(), 4000);
}


async function buscarChecklistDoUsuario(email) {
  const snap = await getDocs(query(
    collection(db, "presencas"),
    where("userEmail", "==", email),
    where("checklist", "==", true)
  ));

  return snap.empty ? null : snap.docs[0];
}

async function excluirChecklist() {
  try {
    const email = sessionStorage.getItem("usuarioLogado");
    if (!email) {
      mostrarAlerta("Usuário não identificado.", "erro");
      console.error("excluirChecklist: sessionStorage usuarioLogado vazio");
      return;
    }

    // Busca todos os documentos de presencas que correspondem ao usuário
    const snap = await getDocs(query(
      collection(db, "presencas"),
      where("userEmail", "==", email),
      where("checklist", "==", true)
    ));

    if (snap.empty) {
      mostrarAlerta("Nenhum checklist encontrado.", "erro");
      console.log("excluirChecklist: snap vazio — nenhum documento encontrado para", email);
      return;
    }

    // Se houver mais de um doc (caso raro), vamos deletar todos (com confirmação automática)
    const docsToDelete = snap.docs;
    console.log("excluirChecklist: documentos encontrados:", docsToDelete.map(d => ({ id: d.id, data: d.data() })));

    // Deleta cada documento (aguarda todas)
    const promises = docsToDelete.map(d => {
      const docId = d.id;
      return deleteDoc(doc(db, "presencas", docId));
    });

    await Promise.all(promises);

    mostrarAlerta("Checklist excluído com sucesso!", "sucesso");
    console.log("excluirChecklist: exclusão concluída para", email);

    // Recarrega a página após breve atraso
    setTimeout(() => {
      location.reload();
    }, 1200);

  } catch (err) {
    console.error("excluirChecklist: erro ao excluir checklist:", err);
    mostrarAlerta("Erro ao excluir checklist. Veja console para detalhes.", "erro");
  }
}


editarChecklistBtn.addEventListener("click", () => {
  window.location.href = "confirmarEmbarque.html"; // altere se seu arquivo tiver outro nome
});

excluirChecklistBtn.addEventListener("click", async () => {
  if (!confirm("Tem certeza que deseja excluir sua confirmação?")) return;
  await excluirChecklist();
});



/* ============================================================
   3. BOTÃO VOLTAR
============================================================ */

const backBtn = document.getElementById("backButton");

backBtn.addEventListener("click", () => {
  if (!screen1.classList.contains("hidden") && screen2.classList.contains("hidden") && screen3.classList.contains("hidden")) {
    window.history.back();
    return;
  }

  if (!screen3.classList.contains("hidden")) {
    // Tela 3 → Tela 2
    screen3.classList.add("hidden");
    screen1.classList.remove("hidden");
    return;
  }

  if (!screen2.classList.contains("hidden")) {
    // Tela 2 → Tela 1
    screen2.classList.add("hidden");
    screen1.classList.remove("hidden");
    return;
  }
});


/* ============================================================
   4. DADOS DAS ROTAS
============================================================ */

const rotasData = {
  MATUTINO: {
    "Rota 01": {
      ida: ["UEFS", "SENAI", "ANHANGUERA", "UNEX", "UFRB"],
      volta: ["UFRB", "UNEX", "ANHANGUERA", "SENAI", "UEFS"]
    },
    "Rota 02": {
      ida: ["PREFEITURA", "PETE", "UNIASSSELVI", "GETÚLIO", "GRAU", "UNIFACS", "UNEF"],
      volta: ["UNEF", "UNIFACS", "GETÚLIO", "UNIASSSELVI", "PETE", "PREFEITURA"]
    },
    "Rota 03": {
      ida: ["UEFS"],
      volta: ["UEFS"]
    }
  },

  VESPERTINO: {
    "Rota 01": {
      ida: ["UEFS"],
      volta: ["UEFS"]
    },
    "Rota 02": {
      ida: ["UNEX", "UFRB", "UNEF", "UNIFACS", "SENAI", "UNIASSSELVI", "FAT", "ESATER", "GRAU", "PETE", "GETÚLIO", "ESTÁCIO", "UNEF", "CEEP"],
      volta: ["CEEP", "UNEF", "ESTÁCIO", "GETÚLIO", "PETE", "GRAU", "ESATER", "FAT", "UNIASSSELVI", "SENAI", "UNIFACS", "UNEF", "UFRB", "UNEX"]
    }
  },

  NOTURNO: {
    "Rota 01": {
      ida: ["UNIFAN", "UNEF"],
      volta: ["UNEF", "UNIFAN"]
    },
    "Rota 02": {
      ida: ["UEFS", "PASSARELA", "SENAI", "ANHANGUERA"],
      volta: ["ANHANGUERA", "SENAI", "PASSARELA", "UEFS"]
    },
    "Rota 03": {
      ida: ["PREFEITURA", "UNIASSSELVI", "GRAU", "ESTÁCIO", "FAT", "ESATER"],
      volta: ["ESATER", "FAT", "ESTÁCIO", "GRAU", "UNIASSSELVI", "PREFEITURA"]
    },
    "Rota 04": {
      ida: ["UNIFACS", "CEEP", "UNEX", "UFRB"],
      volta: ["UFRB", "UNEX", "UNIFACS", "CEEP"]
    }
  }
};


/* ============================================================
   5. ELEMENTOS
============================================================ */

const screen1 = document.getElementById("screen1");
const screen2 = document.getElementById("screen2");
const screen3 = document.getElementById("screen3");

const routeBtns = document.querySelectorAll(".route-btn");

const motoristaSelect = document.getElementById("motorista");
const confirmarBtn = document.getElementById("confirmar");
const alterarBtn = document.getElementById("alterar");
const voltarBtn = document.getElementById("voltar1");
const selecionarMotoLabel = document.getElementById("selecionarMoto");


voltarBtn.addEventListener("click", () => {
  
  // Caso o usuário tenha vindo da tela 3 (clicou em ALTERAR)
  if (screen3.dataset.fromAlterar === "true") {
    // Voltar para a tela 3
    screen2.classList.add("hidden");
    screen3.classList.remove("hidden");

    // Resetar o marcador
    delete screen3.dataset.fromAlterar;
    return;
  }

  // Qualquer outro caso → volta para a TELA 1
  screen2.classList.add("hidden");
  screen1.classList.remove("hidden");

  // Resetar estado
  state.periodo = "";
  state.rota = "";
  state.motorista = "";
  motoristaSelect.value = "";
});


/* ============================================================
   ALTERAR ROTA (TELA 3 → 2)
============================================================ */

alterarBtn.addEventListener("click", () => {
  if (userRole !== "admin") return;

  // MARCA que o usuário saiu da tela 3 por ALTERAR
  screen3.dataset.fromAlterar = "true";

  screen3.classList.add("hidden");
  screen2.classList.remove("hidden");

  motoristaSelect.value = "";
  carregarMotoristas();
});


/* ============================================================
   6. CARREGAR MOTORISTAS (ADMIN SOMENTE)
============================================================ */

async function carregarMotoristas() {
  const select = motoristaSelect;

  try {
    select.innerHTML = '<option value="">Escolha um motorista</option>';

    const snapshot = await getDocs(collection(db, "motoristas"));

    snapshot.forEach((doc) => {
      const dados = doc.data();
      const option = document.createElement("option");
      option.value = dados.email;       // value = email
      option.dataset.nome = dados.nome; // nome separado
      option.textContent = dados.nome;
      select.appendChild(option);
    });

  } catch (err) {
    console.error("Erro ao carregar motoristas:", err);
    mostrarAlerta("Erro ao carregar motoristas", "erro");
  }
}



/* ============================================================
   7. BUSCAR + SALVAR + APAGAR ROTA CONFIRMADA
============================================================ */

async function buscarRotaSalva(periodo, rota) {
  const snap = await getDocs(collection(db, "rotasConfirmadas"));
  let rotaEncontrada = null;

  snap.forEach((doc) => {
    const d = doc.data();
    if (d.periodo === periodo && d.rota === rota) {
      rotaEncontrada = d;
    }
  });

  return rotaEncontrada;
}

async function deletarRotaSalva(periodo, rota) {
  const snap = await getDocs(collection(db, "rotasConfirmadas"));

  snap.forEach((d) => {
    const dados = d.data();
    if (dados.periodo === periodo && dados.rota === rota) {
      deleteDoc(doc(db, "rotasConfirmadas", d.id));
    }
  });
}

async function salvarRotaConfirmada() {
  const dados = rotasData[state.periodo][state.rota];

  await addDoc(collection(db, "rotasConfirmadas"), {
    periodo: state.periodo,
    rota: state.rota,
    motorista: state.motorista,          // nome
    motoristaEmail: state.motoristaEmail, // email
    ida: dados.ida,
    volta: dados.volta,
    timestamp: new Date()
  });
}



/* ============================================================
   8. ESTADO
============================================================ */

const state = {
  periodo: "",
  rota: "",
  motorista: ""
};


/* ============================================================
   9. NAVEGAÇÃO ENTRE TELAS
============================================================ */

routeBtns.forEach((btn) => {
  btn.addEventListener("click", async () => {
    state.periodo = btn.dataset.period;
    state.rota = btn.dataset.route;

    const rotaExistente = await buscarRotaSalva(state.periodo, state.rota);

    /* ============================================================
       NÃO EXISTE ROTA CONFIRMADA → ALERTA (opcional) + TELA 2
    ============================================================ */
    if (!rotaExistente) {
      mostrarAlerta("Ainda não há motorista vinculado a esta rota.", "erro");

      const dados = rotasData[state.periodo][state.rota];

      document.getElementById("periodTitle").textContent = state.periodo;
      document.getElementById("routeTitle").textContent = state.rota;

      document.getElementById("percursoBox").innerHTML = `
        <strong>IDA:</strong><br>
        ${dados.ida.map(i => "• " + i).join("<br>")}
        <br><br>
        <strong>VOLTA:</strong><br>
        ${dados.volta.map(i => "• " + i).join("<br>")}
      `;

      screen1.classList.add("hidden");
      screen2.classList.remove("hidden");

      motoristaSelect.value = "";

      if (userRole === "admin") {
        await carregarMotoristas();
      }
      return;
    }

    /* ============================================================
       EXISTE ROTA → TELA 3
    ============================================================ */

    if (!rotaExistente.motorista) {
      mostrarAlerta("Ainda não há motorista vinculado a esta rota.", "erro");
      document.getElementById("confirmMotorista").textContent = "Não definido";
    } else {
      document.getElementById("confirmMotorista").textContent =
        rotaExistente.motorista;
    }

    document.getElementById("confirmDestino").innerHTML = `
      <strong>IDA:</strong><br>
      ${rotaExistente.ida.join(" → ")}
      <br><br>
      <strong>VOLTA:</strong><br>
      ${rotaExistente.volta.join(" → ")}
    `;

    screen1.classList.add("hidden");
    screen3.classList.remove("hidden");
  });
});


/* ============================================================
   10. CONFIRMAR (TELA 2 → 3)
============================================================ */

confirmarBtn.addEventListener("click", async () => {

  if (!motoristaSelect.value) {
    mostrarAlerta("Selecione um motorista", "erro");
    return;
  }

  await deletarRotaSalva(state.periodo, state.rota);

  state.motorista = motoristaSelect.selectedOptions[0].dataset.nome;
  state.motoristaEmail = motoristaSelect.value; // email

  const dados = rotasData[state.periodo][state.rota];

  document.getElementById("confirmMotorista").textContent = state.motorista;

  document.getElementById("confirmDestino").innerHTML = `
    <strong>IDA:</strong><br>
    ${dados.ida.join(" → ")}
    <br><br>
    <strong>VOLTA:</strong><br>
    ${dados.volta.join(" → ")}
  `;

  await salvarRotaConfirmada();

  screen2.classList.add("hidden");
  screen3.classList.remove("hidden");
});



/* ============================================================
   11. ALTERAR ROTA (TELA 3 → 2)
============================================================ */

alterarBtn.addEventListener("click", () => {
  if (userRole !== "admin") return;

  screen3.classList.add("hidden");
  screen2.classList.remove("hidden");

  motoristaSelect.value = "";
  carregarMotoristas();
});

// Mostrar/ocultar botões de editar e excluir checklist conforme existência do checklist
async function validarExibicaoDeChecklistButtons() {
  const emailLogado = sessionStorage.getItem("usuarioLogado");
  if (!emailLogado) return;

  const snap = await getDocs(query(
    collection(db, "presencas"),
    where("userEmail", "==", emailLogado),
    where("checklist", "==", true)
  ));

  if (!snap.empty) {
    // Checklist existe → mostrar botões
    editarChecklistBtn.style.display = "block";
    excluirChecklistBtn.style.display = "block";
  } else {
    // Checklist NÃO existe → esconder botões
    editarChecklistBtn.style.display = "none";
    excluirChecklistBtn.style.display = "none";
  }
}


/* ============================================================
   12. RESTRIÇÕES POR PERMISSÃO
============================================================ */

function aplicarRestricoes() {
  console.log("Aplicando restrições para:", userRole);

  if (userRole === "admin") {
    alterarBtn.style.display = "block";
    motoristaSelect.disabled = false;
    motoristaSelect.style.display = "block";
    confirmarBtn.disabled = false;
    confirmarBtn.style.display = "block";
    return;
  }

  // Motorista e Estudante — apenas visualizar
  alterarBtn.style.display = "none";
  confirmarBtn.style.display = "none";
  motoristaSelect.style.display = "none";
  selecionarMotoLabel.style.display = "none";
}



/* ============================================================
   13. INICIALIZAÇÃO
============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  await carregarTipoUsuario();
  await validarExibicaoDeChecklistButtons();
  await aplicarFiltroDeRotasPorChecklist();

  if (userRole == "admin") {
    editarChecklistBtn.style.display = "none";
    excluirChecklistBtn.style.display = "none";
  }
});


