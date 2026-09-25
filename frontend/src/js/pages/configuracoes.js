// ============================================================
// Página de Configurações — lógica de front-end (Dinâmica Admin/User)
// ============================================================

function ehAdmin() {
    return document.body.getAttribute('data-user-type') === 'admin';
}

function obterUsuario() {
    if (!window.BancoDeDados) return {};
    return ehAdmin() ? window.BancoDeDados.administrador : window.BancoDeDados.usuario;
}

function iniciais(nome) {
    return window.obterIniciaisNome ? window.obterIniciaisNome(nome) : 'U';
}

function mostrarToast(mensagem, tipo = 'sucesso') {
    if (typeof GerenciadorToast !== 'undefined') {
        GerenciadorToast.exibir(mensagem);
    } else {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = mensagem;
            toast.classList.toggle('erro', tipo === 'erro');
            toast.classList.add('mostrar');
            clearTimeout(toast._timer);
            toast._timer = setTimeout(() => toast.classList.remove('mostrar'), 2800);
        }
    }
}

// ---------- Máscaras ----------
function mascararTelefone(valor) {
    return valor.replace(/\D/g, '').slice(0, 11)
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
}

function mascararCPF(valor) {
    return valor.replace(/\D/g, '').slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// ---------- Validações ----------
function emailValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

function telefoneValido(valor) {
    return valor.replace(/\D/g, '').length >= 10;
}

function cpfValido(valor) {
    return valor.replace(/\D/g, '').length === 11;
}

function definirErro(campoId, mensagem) {
    const input = document.getElementById(campoId);
    const msgEl = document.getElementById(campoId + 'Erro');
    if (input) input.classList.toggle('erro', Boolean(mensagem));
    if (msgEl) msgEl.textContent = mensagem || '';
}

function preencherFormulario() {
    const user = obterUsuario();

    if (document.getElementById('campoNome')) document.getElementById('campoNome').value = user.nome || '';
    if (document.getElementById('campoEmail')) document.getElementById('campoEmail').value = user.email || '';
    if (document.getElementById('campoTelefone')) document.getElementById('campoTelefone').value = user.telefone || '';
    if (document.getElementById('campoCpf')) document.getElementById('campoCpf').value = user.cpf || '';
    
    // Campo RGM existe apenas no painel do usuário
    if (document.getElementById('campoRgm')) document.getElementById('campoRgm').value = user.rgm || '';

    if (document.getElementById('nomeExibicao')) document.getElementById('nomeExibicao').textContent = user.nome || '';
    if (document.getElementById('membroDesde')) document.getElementById('membroDesde').textContent = user.membroDesde ? `Desde ${user.membroDesde}` : '';
    
    const avatarGrande = document.getElementById('avatarIniciais');
    if (avatarGrande) avatarGrande.textContent = iniciais(user.nome);

    const textoPerfilEl = document.getElementById('textoPerfilInstituicao');
    if (textoPerfilEl) textoPerfilEl.textContent = user.perfil || '';
    
    const iconePerfilEl = document.getElementById('iconePerfilInstituicao');
    if (iconePerfilEl) iconePerfilEl.className = user.iconePerfil || '';
}

function alternarVisibilidadeSenha(botao) {
    const wrap = botao.closest('.campo-input-wrap');
    const input = wrap.querySelector('input');
    const mostrando = input.type === 'text';
    input.type = mostrando ? 'password' : 'text';
    botao.innerHTML = mostrando ? iconeOlho() : iconeOlhoFechado();
}

function iconeOlho() {
    return `<i class="fa-regular fa-eye"></i>`;
}

function iconeOlhoFechado() {
    return `<i class="fa-regular fa-eye-slash"></i>`;
}

function validarDadosPessoais() {
    let ok = true;
    const nome = document.getElementById('campoNome')?.value.trim() || '';
    const email = document.getElementById('campoEmail')?.value.trim() || '';
    const telefone = document.getElementById('campoTelefone')?.value.trim() || '';
    const cpf = document.getElementById('campoCpf')?.value.trim() || '';

    if (nome.length < 3) { definirErro('campoNome', 'Informe seu nome completo'); ok = false; }
    else definirErro('campoNome', '');

    if (!emailValido(email)) { definirErro('campoEmail', 'Informe um e-mail válido'); ok = false; }
    else definirErro('campoEmail', '');

    if (!telefoneValido(telefone)) { definirErro('campoTelefone', 'Informe um telefone válido'); ok = false; }
    else definirErro('campoTelefone', '');

    if (!cpfValido(cpf)) { definirErro('campoCpf', 'CPF inválido.'); ok = false; }
    else definirErro('campoCpf', '');

    return ok;
}

function validarSenha() {
    const atual = document.getElementById('senhaAtual')?.value || '';
    const nova = document.getElementById('senhaNova')?.value || '';
    const confirmar = document.getElementById('senhaConfirmar')?.value || '';

    if (!atual && !nova && !confirmar) {
        definirErro('senhaAtual', ''); definirErro('senhaNova', ''); definirErro('senhaConfirmar', '');
        return true;
    }

    let ok = true;
    if (!atual) { definirErro('senhaAtual', 'Informe sua senha atual'); ok = false; }
    else definirErro('senhaAtual', '');

    if (nova.length < 6) { definirErro('senhaNova', 'Use pelo menos 6 caracteres'); ok = false; }
    else definirErro('senhaNova', '');

    if (nova !== confirmar) { definirErro('senhaConfirmar', 'As senhas não coincidem'); ok = false; }
    else definirErro('senhaConfirmar', '');

    return ok;
}

function inicializar() {
    preencherFormulario();

    document.getElementById('campoTelefone')?.addEventListener('input', (e) => {
        e.target.value = mascararTelefone(e.target.value);
    });
    document.getElementById('campoCpf')?.addEventListener('input', (e) => {
        e.target.value = mascararCPF(e.target.value);
    });

    document.querySelectorAll('.alt-senha').forEach(botao => {
        botao.innerHTML = iconeOlho();
        botao.addEventListener('click', () => alternarVisibilidadeSenha(botao));
    });

    const nomesPref = { 
        prefEmails: 'E-mails', 
        prefStatus: 'Status', 
        prefReencontro: 'Devolvidos',
        prefTema: 'Modo escuro'
    };

    Object.keys(nomesPref).forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            if (id === 'prefTema') {
                const temaSalvo = localStorage.getItem('tema') || document.documentElement.getAttribute('data-theme') || 'light';
                elemento.checked = (temaSalvo === 'dark');

                elemento.addEventListener('change', (e) => {
                    const novoTema = e.target.checked ? 'dark' : 'light';
                    if (typeof window.alternarTemaGlobal === 'function') {
                        window.alternarTemaGlobal(novoTema);
                    } else {
                        document.documentElement.setAttribute('data-theme', novoTema);
                        localStorage.setItem('tema', novoTema);
                    }
                    mostrarToast(e.target.checked ? "Modo escuro ativado" : "Modo claro ativado");
                });
            } else {
                elemento.addEventListener('change', (e) => {
                    const estado = e.target.checked ? 'ativadas' : 'desativadas';
                    mostrarToast(`Notificações de "${nomesPref[id]}" ${estado}`);
                });
            }
        }
    });

    // Salvar alterações
    document.getElementById('formConfiguracoes')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const dadosOk = validarDadosPessoais();
        const senhaOk = validarSenha();

        if (!dadosOk || !senhaOk) {
            mostrarToast('Verifique os campos destacados em vermelho.', 'erro');
            return;
        }

        if (window.BancoDeDados) {
            const userRef = ehAdmin() ? window.BancoDeDados.administrador : window.BancoDeDados.usuario;
            
            if (userRef) {
                userRef.nome = document.getElementById('campoNome').value.trim();
                userRef.email = document.getElementById('campoEmail').value.trim();
                userRef.telefone = document.getElementById('campoTelefone').value.trim();
                userRef.cpf = document.getElementById('campoCpf').value.trim();
                
                if (document.getElementById('campoRgm')) {
                    userRef.rgm = document.getElementById('campoRgm').value.trim();
                }

                window.dispatchEvent(new CustomEvent('usuarioAtualizado'));
            }
        }

        if(document.getElementById('senhaAtual')) document.getElementById('senhaAtual').value = '';
        if(document.getElementById('senhaNova')) document.getElementById('senhaNova').value = '';
        if(document.getElementById('senhaConfirmar')) document.getElementById('senhaConfirmar').value = '';

        preencherFormulario();
        mostrarToast('Alterações salvas com sucesso!');
    });

    document.getElementById('btnCancelar')?.addEventListener('click', () => {
        preencherFormulario();
        ['campoNome', 'campoEmail', 'campoTelefone', 'campoCpf', 'senhaAtual', 'senhaNova', 'senhaConfirmar'].forEach(id => definirErro(id, ''));
        if(document.getElementById('senhaAtual')) document.getElementById('senhaAtual').value = '';
        if(document.getElementById('senhaNova')) document.getElementById('senhaNova').value = '';
        if(document.getElementById('senhaConfirmar')) document.getElementById('senhaConfirmar').value = '';
        mostrarToast('Alterações descartadas');
    });

    // Excluir conta
    const overlay = document.getElementById('overlayExcluir');
    const inputSenhaExcluir = document.getElementById('senhaExcluir');
    const btnConfirmarExcluir = document.getElementById('btnConfirmarExcluir');

    document.getElementById('btnAbrirExcluir')?.addEventListener('click', () => {
        if (inputSenhaExcluir) inputSenhaExcluir.value = '';
        overlay.classList.add('aberto');
    });

    document.getElementById('btnCancelarExcluir')?.addEventListener('click', () => overlay.classList.remove('aberto'));
    
    overlay?.addEventListener('click', (e) => { 
        if (e.target === overlay) overlay.classList.remove('aberto'); 
    });

    btnConfirmarExcluir?.addEventListener('click', () => {
        overlay.classList.remove('aberto');
        mostrarToast('Conta excluída! Você será redirecionado(a)');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay) overlay.classList.remove('aberto');
    });
}

document.addEventListener('DOMContentLoaded', inicializar);