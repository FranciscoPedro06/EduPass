// Aguarda o carregamento do DOM
document.addEventListener("DOMContentLoaded", () => {
  const cadastroForm = document.getElementById("cadastroForm");
  const backButton = document.getElementById("backButton");

  // 🔙 Botão de voltar para tela de login
  backButton.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  // 📤 Ao enviar o formulário
  cadastroForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("[v1] Cadastro concluído");
    alert("Cadastro realizado com sucesso!");
    window.location.href = "index.html";
  });

  // 📝 Atualizar texto dos labels ao selecionar arquivo
  document.querySelectorAll(".file-input").forEach((input) => {
    input.addEventListener("change", function () {
      const label = document.querySelector(`label[for="${this.id}"]`);
      if (this.files.length > 0) {
        label.textContent = this.files[0].name;
        label.style.color = "#111827";
      }
    });
  });
});
