  // Sistema de Alertas
        function mostrarAlerta(mensagem, tipo = 'success') {
            const alertContainer = document.getElementById('alertContainer');
            const alert = document.createElement('div');
            alert.className = `alert ${tipo}`;
            alert.textContent = mensagem;
            alertContainer.innerHTML = '';
            alertContainer.appendChild(alert);
            
            setTimeout(() => {
                alert.style.display = 'none';
            }, 3000);
        }

        // Configurar File Inputs
        const fileInputs = ['cnh', 'rgcpf', 'residence', 'photo', 'vehicle'];
        
        fileInputs.forEach(inputId => {
            const fileInput = document.getElementById(inputId);
            const fileLabel = fileInput.previousElementSibling;
            const fileName = fileLabel.querySelector('.file-name');

            fileInput.addEventListener('change', function(e) {
                if (this.files && this.files[0]) {
                    fileName.textContent = this.files[0].name;
                    fileLabel.classList.add('selected');
                } else {
                    fileName.textContent = '';
                    fileLabel.classList.remove('selected');
                }
            });

            fileLabel.addEventListener('click', function() {
                fileInput.click();
            });
        });

        // Validar Formulário
        document.getElementById('motoristForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                mostrarAlerta('As senhas não coincidem!', 'error');
                return;
            }

            if (password.length < 6) {
                mostrarAlerta('A senha deve ter pelo menos 6 caracteres!', 'error');
                return;
            }

            // Verificar se todos os arquivos foram anexados
            const allFilesSelected = fileInputs.every(inputId => 
                document.getElementById(inputId).files.length > 0
            );

            if (!allFilesSelected) {
                mostrarAlerta('Por favor, anexe todos os documentos obrigatórios!', 'error');
                return;
            }

            mostrarAlerta('Cadastro realizado com sucesso!', 'success');
            
            // Aqui você poderia enviar os dados para o servidor
            // this.submit();
        });