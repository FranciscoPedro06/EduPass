import { auth, db } from "./firebase-config.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";


// ====== FUNÇÃO DE ALERTA ======
function mostrarAlerta(mensagem, tipo = 'info') {
  let containerAlertas = document.getElementById('container-alertas');
  if (!containerAlertas) {
    containerAlertas = document.createElement('div');
    containerAlertas.id = 'container-alertas';
    document.body.appendChild(containerAlertas);
  }
  let tipoClasse = 'alerta-info';
  switch(tipo) {
    case 'sucesso': tipoClasse = 'alerta-sucesso'; break;
    case 'erro': tipoClasse = 'alerta-erro'; break;
    case 'aviso': tipoClasse = 'alerta-aviso'; break;
  }
  const alerta = document.createElement('div');
  alerta.className = `alerta ${tipoClasse}`;
  alerta.innerHTML = mensagem;
  containerAlertas.appendChild(alerta);
  setTimeout(() => {
    alerta.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      alerta.remove();
      if (containerAlertas.children.length === 0) {
        containerAlertas.remove();
      }
    }, 300);
  }, 4000);
}



// ====== LÓGICA DO CHECKLIST ======
document.addEventListener("DOMContentLoaded", () => {

  const backButton = document.getElementById("backButton");
  const confirmButton = document.getElementById("confirmButton");
  const title = document.getElementById("checklistTitle");
  const shift = sessionStorage.getItem("selectedShift");

  if (title && shift) {
    title.textContent = `Checklist - ${shift}`;
  }

  if (backButton) {
    backButton.addEventListener("click", () => {
      window.history.back();
    });
  }

  if (confirmButton) {
    confirmButton.addEventListener("click", confirmPresence);
  }


  // ====== Função principal ======
  async function confirmPresence() {

    const checkboxes = document.querySelectorAll('.checkbox-input:checked');

    if (checkboxes.length === 0) {
      mostrarAlerta("Por favor, selecione pelo menos um dia!", 'aviso'); 
      return;
    }

    // Aguarda o usuário estar logado apenas uma vez
    onAuthStateChanged(auth, async (user) => {

      if (!user) {
        mostrarAlerta("Você precisa estar logado para confirmar presença.", "erro");
        return;
      }

      // ===== BUSCANDO NOME DO ALUNO =====
      let nomeEstudante = "Sem nome";

      try {
        const q = query(collection(db, "students"), where("email", "==", user.email));
        const studentsSnap = await getDocs(q);

        if (!studentsSnap.empty) {
          const dadosAluno = studentsSnap.docs[0].data();
          nomeEstudante =
            dadosAluno.nome ||
            dadosAluno.nomeEstudante ||
            dadosAluno.displayName ||
            user.displayName ||
            "Sem nome";
        } else {
          nomeEstudante = user.displayName || "Sem nome";
        }
      } catch (err) {
        console.error("Erro ao buscar nome do estudante:", err);
        nomeEstudante = user.displayName || "Sem nome";
      }


      // ===== SALVANDO PRESENÇA =====
      const attendanceData = {
        userId: user.uid,
        userEmail: user.email,
        nomeEstudante: nomeEstudante,
        shift: shift || "Não especificado",
        checklist: true,
        days: Array.from(checkboxes).map(cb => ({
          day: cb.dataset.day,
          route: cb.dataset.trip,
        })),
        createdAt: serverTimestamp()
      };

      try {
        await addDoc(collection(db, "presencas"), attendanceData);
        mostrarAlerta("Presença confirmada com sucesso!", 'sucesso');

        setTimeout(() => {
          history.back();
        }, 1500);

      } catch (error) {
        console.error("Erro ao salvar presença:", error);
        mostrarAlerta("Erro ao salvar presença no servidor.", "erro");
      }

    });
  }

});
