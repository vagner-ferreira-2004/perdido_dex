document.addEventListener('DOMContentLoaded', async () => {
    /* 1. BANCO DE DADOS COMPLETO COM IMAGENS REAIS E FLAGS DE SISTEMA */
    const dadosOriginais = window.BancoDeDados.itens;

    let listaExibida = [];
    let statusFiltroSelecionado = 'todos';

    if (document.querySelector('meus-itens')) await customElements.whenDefined('meus-itens');
    if (document.querySelector('todos-itens')) await customElements.whenDefined('todos-itens');

    /* 2. INICIALIZAÇÃO DOS MODAIS */
    GerenciadorModais?.init({
        onConfirmarEditar: (item, dadosNovos) => {
            Object.assign(item, dadosNovos);
            executarBuscaEFiltros();
        },
        onConfirmarExcluir: (item) => {
            const index = dadosOriginais.findIndex(i => i.id === item.id);
            if (index > -1) dadosOriginais.splice(index, 1);
            executarBuscaEFiltros();
        },
        onConfirmarCancelarSolicitacao: (item) => {
            item.usuarioSolicitou = false;
            item.estadoSolicitacao = null;
            item.status = "aprovado"; 
            executarBuscaEFiltros();
        },
        onConfirmarResgate: (item) => {
            item.status = "solicitado";
            item.estadoSolicitacao = "analise";
            item.usuarioSolicitou = true;
            executarBuscaEFiltros();
        },
        onConfirmarContestacao: (item) => {
            // Lógica ao confirmar uma contestação na página Todos os Itens
        },
        onConfirmarRetirada: (item) => {
            item.status = "resgatado";
            executarBuscaEFiltros();
        }
    });

    GerenciadorBusca?.init({
        onBuscarEFiltros: () => executarBuscaEFiltros(),
        onOrdenar: (ordem) => aplicarOrdenacao(ordem),
        obterRaizAtiva: () => GerenciadorItens.obterRaizAtiva()
    });

    /* 3. EVENTOS DOS BOTÕES DINÂMICOS */
    function vincularBotoesAcao() {
        const obterItem = (btn) => {
            const id = btn.closest('[data-id]')?.getAttribute('data-id');
            return dadosOriginais.find(d => d.id == id);
        };

        document.querySelectorAll('.btn-detalhes').forEach(btn => {
            btn.onclick = () => {
                const item = obterItem(btn);
                if (item) GerenciadorModais?.abrirDetalhes(item, GerenciadorItens.ehPaginaMeusItens());
            };
        });

        document.querySelectorAll('.btn-resgatar').forEach(btn => {
            btn.onclick = () => {
                const item = obterItem(btn);
                if (item) GerenciadorModais?.abrirResgate(item);
            };
        });
        
        document.querySelectorAll('.btn-contestar').forEach(btn => {
            btn.onclick = () => {
                const item = obterItem(btn);
                if (item) GerenciadorModais?.abrirContestar(item);
            };
        });

        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.onclick = () => {
                const item = obterItem(btn);
                if (item) GerenciadorModais?.abrirEditar(item);
            };
        });

        document.querySelectorAll('.btn-excluir').forEach(btn => {
            btn.onclick = () => {
                const item = obterItem(btn);
                if (item) GerenciadorModais?.abrirExcluir(item);
            };
        });

        document.querySelectorAll('.btn-cancelar-solicitacao').forEach(btn => {
            btn.onclick = () => {
                const item = obterItem(btn);
                if (item) GerenciadorModais?.abrirCancelarSolicitacao(item);
            };
        });

        document.querySelectorAll('.btn-comprovante').forEach(btn => {
            btn.onclick = () => {
                const item = obterItem(btn);
                if (item) GerenciadorModais?.abrirComprovante(item);
            };
        });
    }

    function atualizarTelas() {
        GerenciadorItens.renderizar(listaExibida);
        vincularBotoesAcao();
    }

    /* 4. ORDENAÇÃO E BUSCA */
    function aplicarOrdenacao(tipo) {
        listaExibida.sort((a, b) => {
            const timeA = GerenciadorDatas ? GerenciadorDatas.converterData(a.data) : 0;
            const timeB = GerenciadorDatas ? GerenciadorDatas.converterData(b.data) : 0;
            return tipo === 'recente' ? timeB - timeA : timeA - timeB;
        });
        atualizarTelas();
    }

    function normalizar(texto) {
        return (texto || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    }

    function executarBuscaEFiltros() {
        const isMeusItens = GerenciadorItens.ehPaginaMeusItens();

        const baseDaPagina = dadosOriginais.filter(item => {
            if (isMeusItens) {
                return item.meuCadastro === true || item.usuarioSolicitou === true;
            } else {
                return ['aprovado', 'devolvido', 'resgatado'].includes(item.status);
            }
        });

        const f = GerenciadorBusca ? GerenciadorBusca.obterFiltrosAtuais() : {
            termo: '', categoria: '', cor: '', tipoData: 'qualquer', dataInicio: '', dataFim: '', ordem: 'recente'
        };

        const dataRef = GerenciadorDatas ? GerenciadorDatas.obterDataReferencia(dadosOriginais) : new Date();
        const umDiaMs = 24 * 60 * 60 * 1000;

        const listaFiltrada = baseDaPagina.filter(item => {
            const desc = normalizar(item.descricao);
            const local = normalizar(item.local);
            const marca = normalizar(item.marca || 'Desconhecida');
            const cat = normalizar(item.categoria);
            const st = normalizar(item.status);

            const bateBusca = !f.termo || desc.includes(f.termo) || local.includes(f.termo) || marca.includes(f.termo) || cat.includes(f.termo) || st.includes(f.termo);

            const categoriasConhecidas = ['eletronicos', 'chaves', 'acessorios', 'bolsas', 'roupas', 'utensilios', 'documentos'];
            const bateCategoria = !f.categoria || (f.categoria === 'outros' ? !categoriasConhecidas.includes(cat) : cat === f.categoria);

            const corItem = normalizar(item.corNome);
            const coresConhecidas = ['preto', 'branco', 'cinza', 'marrom', 'rosa', 'roxo', 'vermelho', 'verde', 'azul', 'amarelo', 'laranja'];
            const bateCor = !f.cor || (f.cor === 'outros' ? !coresConhecidas.includes(corItem) : corItem === f.cor);

            let bateData = true;
            const timestampItem = GerenciadorDatas ? GerenciadorDatas.converterData(item.data) : 0;

            if (f.tipoData === 'semana') {
                bateData = timestampItem >= (dataRef.getTime() - 7 * umDiaMs) && timestampItem <= dataRef.getTime();
            } else if (f.tipoData === 'mes') {
                bateData = timestampItem >= (dataRef.getTime() - 30 * umDiaMs) && timestampItem <= dataRef.getTime();
            } else if (f.tipoData === 'trimestre') {
                bateData = timestampItem >= (dataRef.getTime() - 90 * umDiaMs) && timestampItem <= dataRef.getTime();
            } else if (f.tipoData === 'personalizado') {
                const tsInicio = f.dataInicio ? GerenciadorDatas.converterData(f.dataInicio) : null;
                const tsFim = f.dataFim ? GerenciadorDatas.converterData(f.dataFim) + (umDiaMs - 1) : null;
                if (tsInicio && timestampItem < tsInicio) bateData = false;
                if (tsFim && timestampItem > tsFim) bateData = false;
            }

            return bateBusca && bateCategoria && bateCor && bateData;
        });

        // LÓGICA DE ATUALIZAÇÃO DOS CONTADORES (ABAS)
        if (isMeusItens) {
            const contadores = { todos: listaFiltrada.length, analise: 0, aprovado: 0, reprovado: 0, devolvido: 0, resgatado: 0, solicitado: 0 };
            listaFiltrada.forEach(item => { if (contadores[item.status] !== undefined) contadores[item.status]++; });
            Object.keys(contadores).forEach(st => {
                const el = document.getElementById(`qtd-${st}`);
                if (el) el.textContent = contadores[st];
            });
        } else {
            const contadoresGeral = { todos: listaFiltrada.length, perdidos: 0, achados: 0 };
            listaFiltrada.forEach(item => {
                if (item.status === 'aprovado') contadoresGeral.perdidos++;
                if (['devolvido', 'resgatado'].includes(item.status)) contadoresGeral.achados++;
            });
            const elTodos = document.getElementById('qtd-todos');
            const elPerdidos = document.getElementById('qtd-perdidos');
            const elAchados = document.getElementById('qtd-achados');
            if (elTodos) elTodos.textContent = contadoresGeral.todos;
            if (elPerdidos) elPerdidos.textContent = contadoresGeral.perdidos;
            if (elAchados) elAchados.textContent = contadoresGeral.achados;
        }

        listaExibida = listaFiltrada.filter(item => {
            if (isMeusItens) {
                return statusFiltroSelecionado === 'todos' || item.status === statusFiltroSelecionado;
            } else {
                if (statusFiltroSelecionado === 'todos') return true;
                if (statusFiltroSelecionado === 'perdidos') return item.status === 'aprovado';
                if (statusFiltroSelecionado === 'achados') return ['devolvido', 'resgatado'].includes(item.status);
                return true;
            }
        });

        aplicarOrdenacao(f.ordem);
    }

    /* 5. ABAS DE STATUS */
    function atualizarDefinicaoStatus(st) {
        const mapa = { 
            todos: 'todos', analise: 'analises', aprovado: 'aprovados', 
            reprovado: 'reprovados', devolvido: 'devolvidos', resgatado: 'resgatados', solicitado: 'solicitados',
            perdidos: 'perdidos', achados: 'achados'
        };
        document.querySelectorAll('.area-definicao .definicao-status').forEach(el => el.classList.remove('ativo'));
        document.querySelector(`.area-definicao .definicao-status.${mapa[st] || 'todos'}`)?.classList.add('ativo');
    }

    function vincularAbasStatus() {
        document.querySelectorAll('.btn-tab-status').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.btn-tab-status').forEach(b => b.classList.remove('ativo'));
                btn.classList.add('ativo');
                statusFiltroSelecionado = btn.getAttribute('data-status');
                atualizarDefinicaoStatus(statusFiltroSelecionado);
                executarBuscaEFiltros();
            });
        });

        document.querySelectorAll('.link-atalho-status').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const st = link.getAttribute('data-status');
                if (st) {
                    statusFiltroSelecionado = st;
                    document.querySelectorAll('.btn-tab-status').forEach(b => b.classList.toggle('ativo', b.getAttribute('data-status') === st));
                    atualizarDefinicaoStatus(st);
                    executarBuscaEFiltros();
                    const elScroll = document.getElementById('meus-itens') || document.querySelector('todos-itens');
                    elScroll?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        const statusUrl = new URLSearchParams(window.location.search).get('status');
        if (statusUrl) statusFiltroSelecionado = statusUrl;

        document.querySelectorAll('.btn-tab-status').forEach(btn => {
            btn.classList.toggle('ativo', btn.getAttribute('data-status') === statusFiltroSelecionado);
        });

        atualizarDefinicaoStatus(statusFiltroSelecionado);
        executarBuscaEFiltros();
    }

    vincularAbasStatus();
});