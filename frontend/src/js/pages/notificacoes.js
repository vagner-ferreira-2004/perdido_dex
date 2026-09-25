// ============================================================
// Página de Notificações (Dinâmica Admin/User)
// ============================================================

const ICONES = {
    // Ícones do Utilizador Comum
    aprovado: `<i class="fa-solid fa-check"></i>`,
    reprovado: `<i class="fa-solid fa-xmark"></i>`,
    // Ícone partilhado (Devolvidos/Outros) - Usando fa-undo que funciona em todas as versões
    outro: `<i class="fa-solid fa-undo"></i>`, 
    // Ícones do Administrador
    cadastro: `<i class="fa-solid fa-hourglass"></i>`,
    solicitacao: `<i class="fa-solid fa-hand"></i>`
};

let notificacoes = [];
let filtroAtual = 'todas';
let ordemAtual = 'recentes';
let paginaAtual = 1;
const ITENS_POR_PAGINA = 5;

function ehAdmin() {
    return document.body.getAttribute('data-user-type') === 'admin';
}

function sincronizarBancoDeDados(notificacao, lidaStatus, excluir = false) {
    if (typeof window.BancoDeDados !== 'undefined') {
        const itemDb = window.BancoDeDados.itens.find(i => i.id === notificacao.idItem);
        if (itemDb) {
            if (ehAdmin()) {
                if (excluir) {
                    itemDb[`notifAdminExcluida_${notificacao.id}`] = true;
                    itemDb[`notifAdminLida_${notificacao.id}`] = true;
                } else {
                    itemDb[`notifAdminLida_${notificacao.id}`] = lidaStatus;
                }
            } else {
                if (excluir) {
                    itemDb.notificacaoExcluida = true;
                    itemDb.notificacaoLida = true;
                } else {
                    itemDb.notificacaoLida = lidaStatus;
                }
            }
        }
    }
}

function carregarNotificacoes() {
    if (typeof window.BancoDeDados !== 'undefined') {
        let todasNotificacoes = ehAdmin() 
            ? window.BancoDeDados.gerarNotificacoesAdmin() 
            : window.BancoDeDados.gerarNotificacoes();

        if (ehAdmin()) {
            todasNotificacoes = todasNotificacoes.map(n => {
                const itemDb = window.BancoDeDados.itens.find(i => i.id === n.idItem);
                if (itemDb) {
                    n.lida = itemDb[`notifAdminLida_${n.id}`] || false;
                }
                return n;
            }).filter(n => {
                const itemDb = window.BancoDeDados.itens.find(i => i.id === n.idItem);
                return itemDb && !itemDb[`notifAdminExcluida_${n.id}`];
            });
        } else {
            todasNotificacoes = todasNotificacoes.filter(n => {
                const itemDb = window.BancoDeDados.itens.find(i => i.id === n.idItem);
                return itemDb && !itemDb.notificacaoExcluida;
            });
        }

        return todasNotificacoes;
    }
    return [];
}

function tempoRelativo(data) {
    const diffMs = Date.now() - data.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return diffMin <= 1 ? 'Agora mesmo' : `Há ${diffMin} minutos`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Há ${diffH} hora${diffH > 1 ? 's' : ''}`;
    const diffDias = Math.floor(diffH / 24);
    if (diffDias === 1) return 'Ontem';
    if (diffDias < 7) return `Há ${diffDias} dias`;
    return data.toLocaleDateString('pt-BR');
}

function contarPorFiltro() {
    if (ehAdmin()) {
        return {
            todas: notificacoes.length,
            'nao-lidas': notificacoes.filter(n => !n.lida).length,
            cadastros: notificacoes.filter(n => n.tipo === 'cadastro').length,
            solicitacoes: notificacoes.filter(n => n.tipo === 'solicitacao').length,
            outros: notificacoes.filter(n => n.tipo === 'outro').length,
        };
    } else {
        return {
            todas: notificacoes.length,
            'nao-lidas': notificacoes.filter(n => !n.lida).length,
            aprovados: notificacoes.filter(n => n.tipo === 'aprovado').length,
            reprovados: notificacoes.filter(n => n.tipo === 'reprovado').length,
            outros: notificacoes.filter(n => n.tipo === 'outro').length,
        };
    }
}

function atualizarContadores() {
    const c = contarPorFiltro();
    document.querySelectorAll('.filtro-chip').forEach(chip => {
        const chave = chip.dataset.filtro;
        const span = chip.querySelector('.contagem');
        if (span && c[chave] !== undefined) span.textContent = c[chave];
    });
}

function notificacoesFiltradas() {
    let lista = [...notificacoes];
    
    if (filtroAtual === 'nao-lidas') {
        lista = lista.filter(n => !n.lida);
    } else if (filtroAtual !== 'todas') {
        const mapaTipos = {
            'aprovados': 'aprovado',
            'reprovados': 'reprovado',
            'cadastros': 'cadastro',
            'solicitacoes': 'solicitacao',
            'outros': 'outro'
        };
        const tipoMapeado = mapaTipos[filtroAtual] || filtroAtual;
        
        lista = lista.filter(n => n.tipo === tipoMapeado);
    }

    lista.sort((a, b) => ordemAtual === 'recentes' ? b.dataHora - a.dataHora : a.dataHora - b.dataHora);
    return lista;
}


function renderizarLista() {
    const lista = notificacoesFiltradas();
    const totalPaginas = Math.max(1, Math.ceil(lista.length / ITENS_POR_PAGINA));
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;

    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const paginaLista = lista.slice(inicio, inicio + ITENS_POR_PAGINA);
    const container = document.getElementById('listaNotificacoes');

    if (paginaLista.length === 0) {
        container.innerHTML = `
        <div class="estado-vazio">
            <i class="fa-regular fa-bell-slash"></i>
            <h3>Nenhuma notificação por aqui</h3>
            <p>Quando houver novidades sobre os registos, elas aparecerão nesta lista.</p>
        </div>`;
    } else {
        container.innerHTML = paginaLista.map(n => `
        <div class="notificacao ${n.lida ? 'lida' : 'nao-lida'}" data-tipo="${n.tipo}" data-id="${n.id}">
            <div class="grupo1">
                <div class="notif-foto-wrapper">
                    <img src="${n.foto}" alt="Foto do item">
                    <!-- Correção: mantida apenas a classe notif-icon-status -->
                    <div class="notif-icon-status">${ICONES[n.tipo]}</div>
                </div>
                
                <div class="notificacao-corpo">
                    <p class="notificacao-titulo">${n.titulo}</p>
                    <p class="notificacao-desc texto-limitado-1">${n.descricao}</p>
                </div>
            </div>

            <div class="grupo2">
                <div class="notificacao-acoes">
                    <button class="btn btn-secundario btn-pequeno" data-acao="ver-mais" data-id="${n.id}">Ver mais <i class="fa-solid fa-arrow-right"></i></button>
                </div>
                <div class="notificacao-meta">
                    <span class="notificacao-tempo">${tempoRelativo(n.dataHora)}</span>
                    <span class="notificacao-status"><span class="bolinha"></span>${n.lida ? 'Lida' : 'Não lida'}</span>
                </div>
                <div class="menu-opcoes">
                    <button class="btn-opcoes" data-acao="abrir-menu" data-id="${n.id}" aria-label="Mais opções">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                    <div class="dropdown-opcoes" data-menu-id="${n.id}">
                        <button data-acao="alternar-lida" data-id="${n.id}">
                        ${n.lida ? '<i class="fi fi-br-bell-notification-social-media"></i> Marcar como não lida' : '<i class="fi fi-br-bell"></i> Marcar como lida'}
                        </button>
                        <button class="excluir" data-acao="excluir" data-id="${n.id}"><i class="fi fi-br-trash"></i> Excluir notificação</button>
                    </div>
                </div>
            </div>
        </div>
        `).join('');
    }

    renderizarPaginacao(totalPaginas);
    atualizarContadores();
}


function renderizarPaginacao(totalPaginas) {
    const container = document.getElementById('paginacao');
    if (totalPaginas <= 1) { container.innerHTML = ''; return; }

    let html = `<button class="pagina-btn" data-pag="anterior" ${paginaAtual === 1 ? 'disabled' : ''}><i class="fa-solid fa-chevron-left"></i></button>`;
    for (let i = 1; i <= totalPaginas; i++) {
        html += `<button class="pagina-btn ${i === paginaAtual ? 'ativa' : ''}" data-pag="${i}">${i}</button>`;
    }
    html += `<button class="pagina-btn" data-pag="proxima" ${paginaAtual === totalPaginas ? 'disabled' : ''}><i class="fa-solid fa-chevron-right"></i></button>`;
    container.innerHTML = html;
}

function mostrarToast(mensagem) {
    if (typeof GerenciadorToast !== 'undefined') {
        GerenciadorToast.exibir(mensagem);
    } else {
        const toast = document.getElementById('toast');
        if(toast) {
            toast.textContent = mensagem;
            toast.classList.add('mostrar');
            clearTimeout(toast._timer);
            toast._timer = setTimeout(() => toast.classList.remove('mostrar'), 2600);
        }
    }
}

function fecharTodosMenus() {
    document.querySelectorAll('.dropdown-opcoes.aberto').forEach(m => m.classList.remove('aberto'));
    document.querySelectorAll('.notificacao').forEach(n => n.style.zIndex = '');
}

function abrirModalDetalhe(notificacao) {
    const overlay = document.getElementById('overlayDetalhe');
    const modal = overlay.querySelector('.modal');
    
    // Injeta o data-tipo no modal para o CSS estilizá-lo
    if (modal) {
        modal.setAttribute('data-tipo', notificacao.tipo);
    }

    const fotoEl = document.getElementById('detalheFoto');
    if (fotoEl) fotoEl.src = notificacao.foto || '';

    const iconeEl = document.getElementById('detalheIcone');
    if (iconeEl) {
        iconeEl.innerHTML = ICONES[notificacao.tipo];
    }

    const tituloEl = document.getElementById('detalheTitulo');
    if (tituloEl) {
        tituloEl.textContent = notificacao.titulo;
    }

    document.getElementById('detalheTempo').textContent = tempoRelativo(notificacao.dataHora);
    document.getElementById('detalheDescricao').textContent = notificacao.descricao;
    
    const motivoBox = document.getElementById('detalheMotivo');
    if (notificacao.motivo) {
        motivoBox.style.display = 'flex';
        motivoBox.querySelector('span:last-child').innerHTML = `<strong>Motivo:</strong> ${notificacao.motivo}`;
    } else {
        motivoBox.style.display = 'none';
    }

    const btnLinkItem = document.getElementById('detalheLinkItem');
    if (btnLinkItem) {
        btnLinkItem.href = ehAdmin() ? `gerenciar-itens.html` : `cadastro-item.html?status=todos#meus-itens`;
    }

    overlay.classList.add('aberto');

    if (!notificacao.lida) {
        notificacao.lida = true;
        sincronizarBancoDeDados(notificacao, true);
        renderizarLista();
        if (window.atualizarBadgeGlobal) window.atualizarBadgeGlobal();
    }
}

function configurarSelectOrdem() {
    const container = document.getElementById('campoOrdenarNotificacoes');
    if (!container) return;

    const btn = container.querySelector('.select-btn');
    const dropdown = container.querySelector('.select-dropdown');
    const textoVisivel = container.querySelector('.btn-texto');
    const opcoes = container.querySelectorAll('.option');

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        btn.classList.toggle('ativo');
        dropdown.classList.toggle('mostrar');
    });

    opcoes.forEach(opcao => {
        opcao.addEventListener('click', (e) => {
            e.stopPropagation();
            const valor = opcao.getAttribute('data-value');
            textoVisivel.innerHTML = opcao.innerHTML;
            
            btn.classList.remove('ativo');
            dropdown.classList.remove('mostrar');

            ordemAtual = valor;
            paginaAtual = 1;
            renderizarLista();
        });
    });

    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            btn.classList.remove('ativo');
            dropdown.classList.remove('mostrar');
        }
    });
}

function inicializar() {
    notificacoes = carregarNotificacoes();
    renderizarLista();
    configurarSelectOrdem();

    document.querySelectorAll('.filtro-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelector('.filtro-chip.ativo').classList.remove('ativo');
            chip.classList.add('ativo');
            filtroAtual = chip.dataset.filtro;
            paginaAtual = 1;
            renderizarLista();
        });
    });

    document.getElementById('btnMarcarTodas').addEventListener('click', () => {
        const haviaNaoLidas = notificacoes.some(n => !n.lida);
        notificacoes.forEach(n => {
            n.lida = true;
            sincronizarBancoDeDados(n, true);
        });
        renderizarLista();
        mostrarToast(haviaNaoLidas ? 'Todas as notificações foram marcadas como lidas' : 'Nenhuma notificação pendente');
        if (window.atualizarBadgeGlobal) window.atualizarBadgeGlobal();
    });

    document.getElementById('listaNotificacoes').addEventListener('click', (e) => {
        const alvo = e.target.closest('[data-acao]');
        if (!alvo) return;
        
        const id = Number(alvo.dataset.id);
        const notificacao = notificacoes.find(n => n.id === id);

        if (alvo.dataset.acao === 'ver-mais' && notificacao) {
            abrirModalDetalhe(notificacao);
        }
        if (alvo.dataset.acao === 'abrir-menu') {
            const menu = document.querySelector(`.dropdown-opcoes[data-menu-id="${id}"]`);
            const estavaAberto = menu.classList.contains('aberto');
            
            fecharTodosMenus();
            
            if (!estavaAberto) {
                menu.classList.add('aberto');
                alvo.closest('.notificacao').style.zIndex = '50';
            }
        }
        if (alvo.dataset.acao === 'alternar-lida' && notificacao) {
            notificacao.lida = !notificacao.lida;
            sincronizarBancoDeDados(notificacao, notificacao.lida);
            fecharTodosMenus();
            renderizarLista();
            mostrarToast(notificacao.lida ? 'Notificação marcada como lida' : 'Notificação marcada como não lida');
            if (window.atualizarBadgeGlobal) window.atualizarBadgeGlobal();
        }
        if (alvo.dataset.acao === 'excluir' && notificacao) {
            fecharTodosMenus();
            sincronizarBancoDeDados(notificacao, true, true);
            notificacoes = notificacoes.filter(n => n.id !== id);
            renderizarLista();
            mostrarToast('Notificação excluída permanentemente');
            if (window.atualizarBadgeGlobal) window.atualizarBadgeGlobal();
        }
    });

    document.getElementById('paginacao').addEventListener('click', (e) => {
        const alvo = e.target.closest('.pagina-btn');
        if (!alvo || alvo.disabled) return;
        
        const totalPaginas = Math.max(1, Math.ceil(notificacoesFiltradas().length / ITENS_POR_PAGINA));
        if (alvo.dataset.pag === 'anterior') paginaAtual = Math.max(1, paginaAtual - 1);
        else if (alvo.dataset.pag === 'proxima') paginaAtual = Math.min(totalPaginas, paginaAtual + 1);
        else paginaAtual = Number(alvo.dataset.pag);

        renderizarLista();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Fechar modais
    const overlayDetalhe = document.getElementById('overlayDetalhe');
    overlayDetalhe.addEventListener('click', (e) => {
        if (e.target.id === 'overlayDetalhe') overlayDetalhe.classList.remove('aberto');
    });

    document.getElementById('fecharDetalhe').addEventListener('click', () => {
        overlayDetalhe.classList.remove('aberto');
    });

    document.getElementById('modalNotificacaoFechar').addEventListener('click', () => {
        overlayDetalhe.classList.remove('aberto');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharTodosMenus();
            overlayDetalhe.classList.remove('aberto');
        }
    });
}

document.addEventListener('DOMContentLoaded', inicializar);