import { app, auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// ----- Sistema de Alertas -----
function mostrarAlerta(mensagem, tipo = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return alert(mensagem);

    const alert = document.createElement('div');
    alert.className = `alert ${tipo}`;
    alert.textContent = mensagem;

    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);

    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

// ----- Envio do formulário -----
document.getElementById('motoristForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
        const nome = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('password').value;
        const confirmarSenha = document.getElementById('confirmPassword').value;

        // --- Validações ---
        if (senha !== confirmarSenha) {
            mostrarAlerta('As senhas não coincidem!', 'error');
            return;
        }

        if (senha.length < 6) {
            mostrarAlerta('A senha deve ter pelo menos 6 caracteres!', 'error');
            return;
        }

        mostrarAlerta('Criando conta...', 'info');

        // --- Cria usuário no Authentication ---
        const credenciais = await createUserWithEmailAndPassword(auth, email, senha);
        const uid = credenciais.user.uid;

        mostrarAlerta('Salvando dados no Firestore...', 'info');

        // --- Salva apenas dados básicos ---
        await addDoc(collection(db, 'pending_motorists'), {
            uid,
            nome,
            email,
            status: 'aguardando',
            criadoEm: new Date(),
            motorista: true
        });

        mostrarAlerta('✅ Cadastro concluído com sucesso!', 'success');
        setTimeout(() => window.location.href = '/index.html', 2000);

    } catch (erro) {
        console.error('Erro no cadastro:', erro);
        if (erro.code === 'auth/email-already-in-use') {
            mostrarAlerta('Este e-mail já está em uso!', 'error');
        } else {
            mostrarAlerta('Erro ao cadastrar. Tente novamente.', 'error');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Concluir';
    }
});
