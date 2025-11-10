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

// Ao carregar a página
document.addEventListener("DOMContentLoaded", async () => {
  const lista = document.getElementById("listaPendentes");

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
        <strong>${dados.nome}</strong> (${dados.email})<br>
        <button class="btn-aceitar" data-id="${docSnap.id}">✅ Aceitar</button>
        <button class="btn-recusar" data-id="${docSnap.id}">❌ Recusar</button>
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
  } catch (err) {
    console.error(err);
    mostrarAlerta("Erro ao carregar cadastros!", "erro");
  }
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