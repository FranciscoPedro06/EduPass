function handleAccept() {
  const checkbox = document.getElementById("agree")
  if (checkbox.checked) {
    alert("Termo aceito com sucesso!")
    // Aqui você pode redirecionar para a próxima página
    // window.location.href = 'proxima-pagina.html';
  }
}

// Habilita/desabilita o botão de aceitar baseado no checkbox
document.addEventListener("DOMContentLoaded", () => {
  const checkbox = document.getElementById("agree")
  const acceptBtn = document.getElementById("acceptBtn")

  checkbox.addEventListener("change", function () {
    acceptBtn.disabled = !this.checked
  })
})
