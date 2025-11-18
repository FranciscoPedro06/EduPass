import { app, auth, db, storage } from "./firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// === ALERTA UNIFICADO ===
function mostrarAlerta(msg, tipo = "info") {
  alert(msg); // pode trocar depois pelo seu alerta estilizado
}

backButton.addEventListener("click", () => window.history.back());

// === LÓGICA PRINCIPAL ===
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cadastroForm");
  const modalTermo = document.getElementById("modalTermo");
  const btnAceitarTermo = document.getElementById("btnAceitarTermo");
  const btnCancelarTermo = document.getElementById("btnCancelarTermo");
  const checkboxTermo = document.getElementById("checkboxTermo");

  let dadosCadastro = null; // variável temporária para guardar dados antes de enviar

  // === Habilita botão ao marcar checkbox ===
  checkboxTermo.addEventListener("change", () => {
    btnAceitarTermo.disabled = !checkboxTermo.checked;
  });

  // === Cancelar Termo ===
  btnCancelarTermo.addEventListener("click", () => {
    modalTermo.classList.add("hidden");
    checkboxTermo.checked = false;
    btnAceitarTermo.disabled = true;
  });

  // === Aceitar Termo ===
  btnAceitarTermo.addEventListener("click", async () => {
    modalTermo.classList.add("hidden");

    try {
      // salva dados no Firestore
      await addDoc(collection(db, "pending_students"), dadosCadastro);

      // salva e-mail do usuário na sessão
      sessionStorage.setItem("usuarioLogado", dadosCadastro.email);

      mostrarAlerta("✅ Cadastro enviado com sucesso! Aguarde a aprovação do administrador.");
      setTimeout(() => window.location.href = "index.html", 1500);
    } catch (err) {
      console.error(err);
      mostrarAlerta("Erro ao cadastrar!");
    }
  });

  // === Quando o usuário tenta enviar o formulário ===
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // pega valores do formulário
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const confirmarSenha = document.getElementById("confirmarSenha").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const instituicao = document.getElementById("instituicao").value.trim();
    const curso = document.getElementById("curso").value.trim();
    const turno = document.getElementById("turno").value.trim();

    // validações
    if (senha !== confirmarSenha) return mostrarAlerta("As senhas não coincidem!");
    if (!nome || !email || !cpf || !instituicao || !curso || !turno)
      return mostrarAlerta("Preencha todos os campos obrigatórios!");

    // guarda dados temporariamente e exibe o termo
    dadosCadastro = {
      nome,
      email,
      senha, // (futuramente criptografar)
      cpf,
      instituicao,
      curso,
      turno,
      status: "aguardando",
      estudante: true,
      foto: ""
    };

    modalTermo.classList.remove("hidden");
  });
});

// === ATUALIZAÇÃO VISUAL DOS ANEXOS ===
document.addEventListener("DOMContentLoaded", () => {
  const fileInputs = document.querySelectorAll(".file-input");

  fileInputs.forEach(input => {
    const label = input.nextElementSibling;
    const fileNameSpan = label.querySelector(".file-name");
    const labelText = label.querySelector(".file-label-text");

    input.addEventListener("change", () => {
      if (input.files && input.files.length > 0) {
        const nomeArquivo = input.files[0].name;
        fileNameSpan.textContent = nomeArquivo;
        label.classList.add("selected");
        labelText.textContent = "✅ Arquivo anexado";
      } else {
        fileNameSpan.textContent = "";
        label.classList.remove("selected");
        labelText.textContent = "Anexar arquivo (.pdf, .jpg, .png)";
      }
    });
  });

  // === RECONHECIMENTO FACIAL NO CADASTRO ===
const API_URL = "https://unpoetically-stampedable-lorena.ngrok-free.dev"; // API DeepFace

// Elementos do modal facial
const modalCapturaFacial = document.getElementById('modalCapturaFacial');
const btnIniciarCaptura = document.getElementById('btnIniciarCaptura');
const btnCapturarRosto = document.getElementById('btnCapturarRosto');
const btnCancelarCaptura = document.getElementById('btnCancelarCaptura');
const videoCaptura = document.getElementById('videoCaptura');
const canvasCaptura = document.getElementById('canvasCaptura');
const resultadoCaptura = document.getElementById('resultadoCaptura');
const statusCaptura = document.getElementById('statusCaptura');

let streamCaptura = null;
let facialEmbedding = null;

// Abrir modal de captura
btnIniciarCaptura.addEventListener('click', () => {
  const nome = document.getElementById('nome').value.trim();
  if (!nome) {
    mostrarAlerta("Digite o nome do aluno primeiro", "aviso");
    return;
  }
  
  modalCapturaFacial.classList.remove('hidden');
  iniciarCameraCaptura();
});

// Fechar modal
btnCancelarCaptura.addEventListener('click', () => {
  fecharModalCaptura();
});

// Iniciar câmera para captura
async function iniciarCameraCaptura() {
  try {
    if (streamCaptura) {
      streamCaptura.getTracks().forEach(track => track.stop());
    }
    
    const constraints = {
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user'
      }
    };
    
    streamCaptura = await navigator.mediaDevices.getUserMedia(constraints);
    videoCaptura.srcObject = streamCaptura;
    
    videoCaptura.addEventListener('loadedmetadata', () => {
      canvasCaptura.width = videoCaptura.videoWidth;
      canvasCaptura.height = videoCaptura.videoHeight;
      btnCapturarRosto.disabled = false;
      resultadoCaptura.innerHTML = '<div class="captura-success"> Câmera pronta! Clique em "Capturar Rosto"</div>';
    });
    
  } catch (error) {
    console.error('Erro na câmera:', error);
    resultadoCaptura.innerHTML = '<div class="captura-error"> Erro ao acessar câmera</div>';
  }
}

// Capturar rosto
btnCapturarRosto.addEventListener('click', async () => {
  const ctx = canvasCaptura.getContext('2d');
  ctx.drawImage(videoCaptura, 0, 0, canvasCaptura.width, canvasCaptura.height);
  
  resultadoCaptura.innerHTML = '<div style="color: #2196F3;">🔄 Processando reconhecimento facial...</div>';
  
  try {
    // Converter para blob e enviar para API
    canvasCaptura.toBlob(async (blob) => {
      await cadastrarRostoAPI(blob);
    }, 'image/jpeg', 0.8);
    
  } catch (error) {
    resultadoCaptura.innerHTML = '<div class="captura-error"> Erro ao capturar imagem</div>';
  }
});

// Cadastrar rosto na API DeepFace
async function cadastrarRostoAPI(blob) {
  try {
    const nome = document.getElementById('nome').value.trim();
    
    const formData = new FormData();
    formData.append('file', blob, 'rosto.jpg');
    formData.append('nome', nome);
    
    const response = await fetch(`${API_URL}/cadastrar`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      facialEmbedding = data.user_id; // Salva o ID do usuário no sistema facial
      
      resultadoCaptura.innerHTML = `
        <div class="captura-success">
          ✅ ${data.message}
          <br><small>Embedding: ${data.embedding_size} dimensões</small>
        </div>
      `;
      
      statusCaptura.innerHTML = '✅ Rosto cadastrado com sucesso!';
      statusCaptura.style.color = '#10b981';
      
      // Fechar modal após 2 segundos
      setTimeout(() => {
        fecharModalCaptura();
      }, 2000);
      
    } else {
      resultadoCaptura.innerHTML = `
        <div class="captura-error">
           Erro: ${data.error || data.message}
          ${data.dica ? `<br><small>💡 ${data.dica}</small>` : ''}
        </div>
      `;
    }
    
  } catch (error) {
    resultadoCaptura.innerHTML = `
      <div class="captura-error">
         Erro de conexão com o servidor
        <br><small>Verifique se o backend está rodando</small>
      </div>
    `;
  }
}

function fecharModalCaptura() {
  modalCapturaFacial.classList.add('hidden');
  if (streamCaptura) {
    streamCaptura.getTracks().forEach(track => track.stop());
    streamCaptura = null;
  }
  resultadoCaptura.innerHTML = '';
}

// Modificar o evento de submit do formulário para incluir o facialEmbedding
// (Substitua o evento submit existente por este)
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Validações existentes
  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value.trim();
  const confirmarSenha = document.getElementById('confirmarSenha').value.trim();
  const cpf = document.getElementById('cpf').value.trim();
  const instituicao = document.getElementById('instituicao').value.trim();
  const curso = document.getElementById('curso').value.trim();
  const turno = document.getElementById('turno').value.trim();

  if (senha !== confirmarSenha) return mostrarAlerta("As senhas não coincidem!");
  if (!nome || !email || !cpf || !instituicao || !curso || !turno)
    return mostrarAlerta("Preencha todos os campos obrigatórios!");

  // ✅ AGORA INCLUI O FACIAL_EMBEDDING
  dadosCadastro = {
    nome,
    email,
    senha,
    cpf,
    instituicao,
    curso,
    turno,
    status: "aguardando",
    estudante: true,
    foto: "",
    facial_id: facialEmbedding // ✅ ID do sistema de reconhecimento facial
  };

  modalTermo.classList.remove('hidden');
});
});
