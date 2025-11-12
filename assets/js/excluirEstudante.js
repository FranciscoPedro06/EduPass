import { db } from "./firebase-config.js";
import { collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
  const btnExcluir = document.getElementById('excluirEstudante');
  if (!btnExcluir) return;

  btnExcluir.addEventListener('click', async (e) => {
    e.preventDefault();

    const cpfParaExcluir = prompt("Digite o CPF do estudante a ser excluído (apenas números):");
    if (!cpfParaExcluir) return;

    const cpfLimpo = cpfParaExcluir.replace(/\D/g, '');

    try {
      // Verifica nas duas coleções
      const colecoes = ["students", "pending_students"];
      let encontrado = false;

      for (const nomeColecao of colecoes) {
        const snapshot = await getDocs(collection(db, nomeColecao));

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          const cpfEstudante = (data.cpf || "").replace(/\D/g, '');

          if (cpfEstudante === cpfLimpo) {
            await deleteDoc(doc(db, nomeColecao, docSnap.id));
            alert(`Estudante com CPF ${cpfParaExcluir} excluído com sucesso da coleção "${nomeColecao}"!`);
            encontrado = true;
            break;
          }
        }

        if (encontrado) break;
      }

      if (!encontrado) {
        alert("Nenhum estudante encontrado com esse CPF nas coleções.");
      } else {
        window.location.href = "listaEstu.html";
      }
    } catch (error) {
      console.error("Erro ao excluir estudante:", error);
      alert("Ocorreu um erro ao tentar excluir o estudante. Tente novamente.");
    }
  });
});
