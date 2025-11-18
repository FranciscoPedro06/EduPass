import { db } from "./firebase-config.js";
import { collection, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const lista = document.getElementById("motoristasLista");
const searchBar = document.getElementById("searchBar");
let motoristasCarregados = []; // Lista mestre para guardar os motoristas

/**
 * Renderiza os cards de motorista na tela
 * @param {Array} motoristasParaRenderizar - A lista (filtrada ou completa) a ser exibida
 */
function renderizarMotoristas(motoristasParaRenderizar) {
  if (motoristasParaRenderizar.length === 0) {
    lista.innerHTML = "<p>Nenhum motorista encontrado.</p>";
    return;
  }

  lista.innerHTML = motoristasParaRenderizar.map(m => `
    <div class="card motorista-card" data-id="${m.id}">
      <h3>${m.nome}</h3>
      <p><strong>Email:</strong> ${m.email}</p>
      <span class="status ${m.status}">
        ${m.status.charAt(0).toUpperCase() + m.status.slice(1)}
      </span>
    </div>
  `).join("");

  // Re-adiciona o evento de clique para abrir o modal
  document.querySelectorAll(".motorista-card").forEach(card => {
    card.addEventListener("click", () => {
      // Procura na lista MESTRE para garantir que temos todos os dados
      const motorista = motoristasCarregados.find(m => m.id === card.dataset.id);
      if (motorista) {
        abrirModal(motorista);
      }
    });
  });
}

/**
 * Busca os motoristas do Firebase (apenas uma vez)
 */
async function carregarMotoristas() {
  lista.innerHTML = "<p>Carregando motoristas...</p>";

  try {
    const snap = await getDocs(collection(db, "motoristas"));

    if (snap.empty) {
      lista.innerHTML = "<p>Nenhum motorista encontrado.</p>";
      return;
    }

    // Salva na lista mestre
    motoristasCarregados = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Ordena por nome (opcional)
    motoristasCarregados.sort((a, b) => a.nome.localeCompare(b.nome));

    // Renderiza a lista completa pela primeira vez
    renderizarMotoristas(motoristasCarregados);

  } catch (erro) {
    console.error("Erro ao carregar motoristas:", erro);
    lista.innerHTML = "<p>Erro ao carregar motoristas.</p>";
  }
}

/**
 * Filtra e re-renderiza a lista de motoristas com base na pesquisa
 */
function handleSearch() {
  const searchTerm = searchBar.value.toLowerCase().trim();

  const motoristasFiltrados = motoristasCarregados.filter(motorista => {
    const nome = (motorista.nome || "").toLowerCase();
    return nome.includes(searchTerm);
  });

  // Re-renderiza a lista apenas com os motoristas filtrados
  renderizarMotoristas(motoristasFiltrados);
}

// === MODAL ===
function abrirModal(m) {
  const modal = document.getElementById("motoristaModal");
  const detalhes = document.getElementById("modalDetails");
  const deleteBtn = document.getElementById("deleteMotoristaBtn");

  detalhes.innerHTML = `
    <h2>${m.nome}</h2>
    <p><strong>Email:</strong> ${m.email}</p>
    <p><strong>Status:</strong> ${m.status}</p>
    <hr>
    <h3>Documentos Enviados</h3>
    ${m.cnh ? `<p><a href="${m.cnh}" target="_blank">📄 CNH</a></p>` : "<p>CNH não enviada</p>"}
    ${m.rgcpf ? `<p><a href="${m.rgcpf}" target="_blank">📄 RG/CPF</a></p>` : "<p>RG/CPF não enviado</p>"}
    ${m.residence ? `<p><a href="${m.residence}" target="_blank">📄 Comprovante de residência</a></p>` : "<p>Residência não enviada</p>"}
    ${m.photo ? `<p><img src="${m.photo}" class="foto-doc"></p>` : "<p>Foto não enviada</p>"}
  `;

  // Botão de deletar
  deleteBtn.onclick = async () => {
    if (confirm(`Deseja realmente excluir ${m.nome}?`)) {
      await deleteDoc(doc(db, "motoristas", m.id));
      alert("Motorista excluído com sucesso!");
      modal.classList.add("hidden");
      carregarMotoristas(); // Recarrega a lista mestre
    }
  };

  modal.classList.remove("hidden");
}

// === EVENT LISTENERS ===

// Fechar modal
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("motoristaModal").classList.add("hidden");
});

// Listener da barra de pesquisa
searchBar.addEventListener("input", handleSearch);

// Carregar motoristas ao abrir a página
document.addEventListener("DOMContentLoaded", carregarMotoristas);