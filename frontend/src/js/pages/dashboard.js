document.addEventListener('DOMContentLoaded', () => {
    // Garante que o banco de dados global foi carregado
    if (typeof window.BancoDeDados === 'undefined') return;

    const ICONES = {
        aprovado: `<i class="fa-solid fa-check"></i>`,
        reprovado: `<i class="fa-solid fa-xmark"></i>`,
        outro: `<i class="fa-solid fa-arrow-rotate-left"></i>`
    };

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

    // ==========================================
    // ATUALIZAR TOPO DA TELA INICIAL
    // ==========================================
    const user = window.BancoDeDados.usuario || {};

    const avatarTopoUser = document.getElementById('avatarTopoUser');
    if (avatarTopoUser && window.obterIniciaisNome) {
        avatarTopoUser.textContent = window.obterIniciaisNome(user.nome);
    }

    // Exibe apenas o primeiro nome
    const primeiroNomeUser = (user.nome || '').trim().split(' ')[0];
    const spanNomeUser = document.getElementById('primeiroNomeUser');
    if (spanNomeUser) {
        spanNomeUser.textContent = primeiroNomeUser;
    }


    const admin = window.BancoDeDados.administrador || {};

    const avatarTopoAdmin = document.getElementById('avatarTopoAdmin');
    if (avatarTopoAdmin && window.obterIniciaisNome) {
        avatarTopoAdmin.textContent = window.obterIniciaisNome(admin.nome);
    }

    // Exibe apenas o primeiro nome
    const primeiroNomeAdmin = (admin.nome || '').trim().split(' ')[0];
    const spanNomeAdmin = document.getElementById('primeiroNomeAdmin');
    if (spanNomeAdmin) {
        spanNomeAdmin.textContent = primeiroNomeAdmin;
    }

    // ==========================================
    // 1. RENDERIZAR OS 2 ÚLTIMOS ITENS CADASTRADOS
    // ==========================================
    const containerItens = document.querySelector('.previa.itens');
    if (containerItens) {
        let meusItens = window.BancoDeDados.itens.filter(i => i.meuCadastro || i.usuarioSolicitou);
        
        // Ordena do mais recente para o mais antigo
        meusItens.sort((a, b) => window.BancoDeDados.converterDataStr(b.data) - window.BancoDeDados.converterDataStr(a.data));
        
        // Pega os 2 primeiros
        const ultimosItens = meusItens.slice(0, 2);

        let htmlItens = `
            <div class="funcao">
                <h4 class="subtitulo">Últimos itens cadastrados</h4>
                <a class="ver-pagina" href="cadastro-item.html?#meus-itens">Ver todos <i class="fa-solid fa-arrow-right"></i></a>
            </div>
        `;

        ultimosItens.forEach((item, index) => {
            const statusConfig = {
                aprovado: { classe: 'aprovado', icone: 'fa-solid fa-check', rotulo: 'Aprovado' },
                reprovado: { classe: 'reprovado', icone: 'fa-solid fa-xmark', rotulo: 'Reprovado' },
                analise: { classe: 'analise', icone: 'fa-solid fa-magnifying-glass', rotulo: 'Em análise' },
                devolvido: { classe: 'devolvido', icone: 'fa-solid fa-arrow-rotate-left', rotulo: 'Devolvido' },
                solicitado: { classe: 'solicitado', icone: 'fa-solid fa-hand', rotulo: 'Solicitado' },
                resgatado: { classe: 'resgatado', icone: 'fa-solid fa-location-crosshairs', rotulo: 'Resgatado' }
            };
            const st = statusConfig[item.status] || statusConfig['aprovado'];

            htmlItens += `
                <div class="item">
                    <img src="${item.foto}" alt="Foto">
                    <div class="info">
                        <div class="texto">
                            <p class="texto-limitado-2">${item.descricao}</p>
                            <div class="atributos">
                                <span class="data"><i class="fa-solid fa-calendar"></i><p>${item.data}</p></span> 
                                <span class="local"><i class="fa-solid fa-location-dot"></i><p>${item.local}</p></span>
                            </div>
                        </div>
                        <div class="status ${st.classe}"><i class="${st.icone}"></i><span>${st.rotulo}</span></div>
                    </div>
                </div>
            `;
            
            // Adiciona a linha divisória (hr) apenas se não for o último item
            if (index < ultimosItens.length - 1) {
                htmlItens += `<hr>`;
            }
        });

        htmlItens += `<a class="ver-cadastro" href="cadastro-item.html"><i class="fa-solid fa-plus"></i><span>Cadastrar novo item</span></a>`;
        containerItens.innerHTML = htmlItens;
    }

    // ==========================================
    // 2. RENDERIZAR AS 3 ÚLTIMAS NOTIFICAÇÕES
    // ==========================================
    const containerNotif = document.querySelector('.previa.notificacoes');
    if (containerNotif) {
        // Pega as 3 mais recentes do banco
        const ultimasNotif = window.BancoDeDados.gerarNotificacoes().slice(0, 3);
        
        let htmlNotif = `
            <div class="funcao">
                <h4 class="subtitulo">Notificações</h4>
                <a class="ver-pagina" href="notificacoes.html">Ver todas <i class="fa-solid fa-arrow-right"></i></a>
            </div>
        `;

        ultimasNotif.forEach((n, index) => {
            htmlNotif += `
                <div class="notificacao ${n.tipo}">
                    <div class="foto notif-foto-wrapper">
                        <img src="${n.foto}" alt="Foto">
                        <div class="icon-status notif-icon-status">${ICONES[n.tipo]}</div>
                    </div>
                    <div class="info">
                        <div class="texto">
                            <h5>${n.titulo}</h5>
                            <span class="texto-limitado-1">${n.descricao}</span>
                        </div>
                        <div class="time">${tempoRelativo(n.dataHora)} <div class="leitura ${n.lida ? 'lido' : 'nao-lido'}"></div></div>
                    </div>
                </div>
            `;
            
            // Adiciona a linha divisória (hr) apenas se não for a última notificação
            if (index < ultimasNotif.length - 1) {
                htmlNotif += `<hr>`;
            }
        });
        
        containerNotif.innerHTML = htmlNotif;
    }
});