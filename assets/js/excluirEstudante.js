document.addEventListener('DOMContentLoaded', () => {
    const btnExcluir = document.getElementById('excluirEstudante');
    if (btnExcluir) {
        btnExcluir.addEventListener('click', (e) => {
            e.preventDefault();

            const estudantes = JSON.parse(localStorage.getItem('estudantes')) || [];
            const cpfParaExcluir = prompt("Digite o CPF do estudante a ser excluído (apenas números):");

            if (!cpfParaExcluir) return;

            // Remover pontuação do CPF digitado
            const cpfLimpo = cpfParaExcluir.replace(/\D/g, '');

            const estudantesAtualizados = estudantes.filter(estudante => {
                const estudanteCpfLimpo = estudante.documento.replace(/\D/g, '');
                return estudanteCpfLimpo !== cpfLimpo;
            });

            if (estudantesAtualizados.length === estudantes.length) {
                alert('Nenhum estudante encontrado com esse CPF!');
                return;
            }

            localStorage.setItem('estudantes', JSON.stringify(estudantesAtualizados));
            alert('Estudante excluído com sucesso!');
            window.location.href = 'listaEstu.html';
        });
    }
});
