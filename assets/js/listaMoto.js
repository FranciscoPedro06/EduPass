import { db } from "./firebase-config.js";
import { collection, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const lista = document.getElementById("motoristasLista");
let motoristasCarregados = [];

async function carregarMotoristas() {
    lista.innerHTML = "<p>Carregando motoristas...</p>";

    try {
        const snap = await getDocs(collection(db, "motoristas"));

        if (snap.empty) {
            lista.innerHTML = "<p>Nenhum motorista encontrado.</p>";
            return;
        }

        motoristasCarregados = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        lista.innerHTML = motoristasCarregados.map(m => `
            <div class="card motorista-card" data-id="${m.id}">
                <h3>${m.nome}</h3>
                <p><strong>Email:</strong> ${m.email}</p>
                <span class="status ${m.status}">
                    ${m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                </span>
            </div>
        `).join("");

        // Evento de clique para abrir modal
        document.querySelectorAll(".motorista-card").forEach(card => {
            card.addEventListener("click", () => {
                const motorista = motoristasCarregados.find(m => m.id === card.dataset.id);
                abrirModal(motorista);
            });
        });

    } catch (erro) {
        console.error("Erro ao carregar motoristas:", erro);
        lista.innerHTML = "<p>Erro ao carregar motoristas.</p>";
    }
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
            carregarMotoristas(); // atualizar lista
        }
    };

    modal.classList.remove("hidden");
}

// Fechar modal
document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("motoristaModal").classList.add("hidden");
});

// Carregar motoristas ao abrir a página
carregarMotoristas();
