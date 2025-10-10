

  function selectRoute(routeName, direction) {
    console.log(`Rota selecionada: ${routeName} (${direction})`);
    alert(`Você selecionou a parada: ${routeName}\nDireção: ${direction === 'ida' ? 'Ida' : 'Volta'}`);
  }

  backButton.addEventListener("click", () => {
  window.history.back();
});