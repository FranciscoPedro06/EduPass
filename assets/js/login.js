// Alternar exibição da senha
function togglePassword() {
  const passwordInput = document.getElementById("password");
  passwordInput.type =
    passwordInput.type === "password" ? "text" : "password";
}

// Aguardar carregamento do DOM
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const cliqueBtn = document.getElementById("Clique");

  // Redirecionar para página de cadastro
  cliqueBtn.addEventListener("click", (event) => {
    event.preventDefault(); // impede que a âncora recarregue a página
    window.location.href = "cadastroEstu.html";
  });

  // Login
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = form.querySelector('input[type="email"]').value.trim();
    const password = document.getElementById("password").value.trim();

    if (email === "" || password === "") {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    if (email === "tccADM@gmail.com" && password === "admin123") {
      alert("Login realizado com sucesso!");
      window.location.href = "telaInicioAdm.html";
    } else if (email === "aluno@gmail.com" && password === "aluno123") {
      alert("Login realizado com sucesso!");
      window.location.href = "telaInicioEstu.html";
    } else {
      alert("Login falhou. Usuário ou senha incorretos.");
    }
  });
});
