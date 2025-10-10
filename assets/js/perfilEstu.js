// Função de edição do perfil
function editProfile() {
    console.log('[v0] Edit profile clicked');
    alert('Funcionalidade de edição de perfil em desenvolvimento');
    // Caso queira redirecionar futuramente:
    // window.location.href = 'editar-perfil.html';
}

// Adiciona evento ao botão de edição assim que o DOM carrega
document.addEventListener('DOMContentLoaded', () => {
    const editBtn = document.getElementById('editProfileBtn');
    editBtn.addEventListener('click', editProfile);
});


 backButton.addEventListener("click", () => {
    window.history.back();
  });