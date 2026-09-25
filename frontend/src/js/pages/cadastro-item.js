document.addEventListener('DOMContentLoaded', () => {
    // Busca o formulário de cadastro na página
    const formCadastro = document.querySelector('form.cadastro');

    // Só executa se estiver na página que tem o formulário
    if (formCadastro) {
        formCadastro.addEventListener('submit', (evento) => {
            evento.preventDefault(); // Evita que a página recarregue

            // -------------------------------------------------------------
            // Aqui você colocaria a lógica de enviar os dados para o Banco
            // -------------------------------------------------------------

            // 1. Exibe a notificação de sucesso agrupada
            if (typeof GerenciadorToast !== 'undefined') {
                GerenciadorToast.exibir("Item cadastrado com sucesso! Ele foi enviado para análise.");
            }

            // 2. Limpa o formulário (textos, datas, etc)
            formCadastro.reset();

            // 3. Reseta a área da foto
            const preview = formCadastro.querySelector('.upload-preview');
            const placeholder = formCadastro.querySelector('.upload-placeholder');
            const filename = formCadastro.querySelector('.upload-filename');
            const inputBase64 = formCadastro.querySelector('.upload-base64-input');

            if (preview) { preview.src = ''; preview.style.display = 'none'; }
            if (placeholder) placeholder.style.display = 'flex';
            if (filename) { filename.textContent = ''; filename.style.display = 'none'; }
            if (inputBase64) inputBase64.value = '';

            // 4. Reseta os Selects Customizados (Categoria e Cor)
            formCadastro.querySelectorAll('.custom-select-container').forEach(container => {
                const label = container.querySelector('.select-btn-text');
                const btn = container.querySelector('.select-btn');
                const inputHidden = container.querySelector('.input-oculto');

                if (inputHidden) inputHidden.value = '';
                if (btn) btn.classList.remove('tem-valor');
                
                // Restaura o texto original do placeholder
                if (label) {
                    if (container.querySelector('label').textContent.includes('Categoria')) {
                        label.textContent = 'Selecione uma categoria...';
                    } else if (container.querySelector('label').textContent.includes('Cor')) {
                        label.textContent = 'Selecione uma cor...';
                    }
                    label.style.color = "#8b8b8b"; // Volta para a cor cinza de placeholder
                }
            });

            // 5. Reseta o flatpickr (se a data foi preenchida)
            const inputData = formCadastro.querySelector('#data');
            if (inputData && inputData._flatpickr) {
                inputData._flatpickr.clear();
            }
        });
    }
});