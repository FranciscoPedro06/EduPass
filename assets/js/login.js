// Alternar exibição da senha
function togglePassword() {
  const passwordInput = document.getElementById("password");
  passwordInput.type = passwordInput.type === "password" ? "text" : "password";
}

// Aguardar o carregamento do DOM
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const entrarButton = document.getElementById("entrar");

  form.addEventListener("submit", (event) => {
    event.preventDefault(); // Evita que a página recarregue

    // Aqui você pode adicionar validações se quiser
    const email = form.querySelector('input[type="email"]').value;
    const password = document.getElementById("password").value;

    if (email.trim() === "" || password.trim() === "") {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    // Redireciona para a tela de cadastro do estudante
    window.location.href = "cadastroEstu.html";
  });
});

document.getElementById("togglePasswordBtn").addEventListener("click", togglePassword);
