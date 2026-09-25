class MenuUserComponent extends HTMLElement {
    connectedCallback() {
        this.renderizar();

        window.addEventListener('usuarioAtualizado', () => {
            this.renderizar();
        });
    }

    renderizar() {
        const user = window.BancoDeDados?.usuario || {};
        const iniciais = window.obterIniciaisNome ? window.obterIniciaisNome(user.nome) : '';

        this.innerHTML = `
        <!-- MENU LATERAL FIXO -->
        <nav>
            <!-- Ícone Menu -->
            <div class="btn-menu"><i class="fa-solid fa-bars"></i></div>

            <!-- Logo -->
            <div class="logo"><a href="../../index.html"><img class="logo-completa" src="../../src/images/logos/logo-escuro.png" alt="Logo da Perdidex"><img class="logo-simbolo" src="../../../src/images/logos/simbolo-logo.png" alt="Logo"></a></div>

            <!-- Perfil -->
            <div class="perfil">
                <div class="cabecalho">
                    <div class="avatar">${iniciais}</div>

                    <div class="info">
                        <strong>${user.nome || ''}</strong>
                        <div><i class="${user.iconePerfil || ''}"></i><span>${user.perfil || ''}</span></div>
                    </div>

                    <i class="fi fi-br-angle-small-down btn-perfil"></i>
                </div>
                
                <div class="dados">
                    <span><i class="fa-solid fa-envelope"></i><p>${user.email || ''}</p></span>
                    <span><i class="fa-solid fa-phone"></i><p>${user.telefone || ''}</p></span>
                </div>
            </div>

            <!-- Lista de Páginas -->
            <ul class="lista">
                <li class="grupo">
                    <h3>Navegação</h3>
                    <ul>
                        <li><a href="index.html"><i class="fa-regular fa-house icon-normal"></i><i class="fa-solid fa-house icon-ativo"></i><span>Início</span></a></li>
                        <li><a href="cadastro-item.html"><i class="fi fi-rr-square-plus icon-normal"></i><i class="fi fi-sr-square-plus icon-ativo"></i><span>Cadastro do Item</span></a></li>
                        <li><a href="itens-sistema.html"><i class="fi fi-rr-box-alt icon-normal"></i><i class="fi fi-sr-box-alt icon-ativo"></i><span>Itens do Sistema</span></a></li>
                    </ul>
                </li>

                <li class="grupo">
                    <h3>Conta</h3>
                    <ul>
                        <li><a href="notificacoes.html"><i class="fa-regular fa-bell icon-normal"></i><i class="fa-solid fa-bell icon-ativo"></i><span>Notificações</span><div class="nao-lidas" style="display: none;">0</div></a></li>
                        <li><a href="configuracoes.html"><i class="fi fi-rr-settings icon-normal"></i><i class="fa-solid fa-gear icon-ativo"></i><span>Configurações</span></a></li>
                    </ul>
                </li>

                <li class="grupo">
                    <h3>Suporte</h3>
                    <ul>
                        <li><a href="ajuda.html"><i class="fa-regular fa-circle-question icon-normal"></i><i class="fa-solid fa-circle-question icon-ativo"></i><span>Ajuda</span></a></li>
                        <hr>
                        <li><a href=""><i class="fa-solid fa-arrow-right-from-bracket icon-normal"></i><i class="fa-solid fa-right-from-bracket icon-ativo"></i><span>Sair</span></a></li>
                    </ul>
                </li>
            </ul>

            <!-- Rodapé -->
            <footer>
                <div class="copyright"><span class="nome-logo">PERDIDEX | </span> &copy; <span class="ano-atual"></span></div>
                <div class="formas"></div>
            </footer>
        </nav>
        `;

        const temaSalvo = localStorage.getItem("tema") || "light";
        document.documentElement.setAttribute("data-theme", temaSalvo);

        const paginaAtual = window.location.pathname.split("/").pop();
        const links = this.querySelectorAll(".lista a");

        links.forEach(link => {
            const paginaLink = link.getAttribute("href");
            if (paginaLink && (paginaLink === paginaAtual || (paginaAtual === '' && paginaLink.includes('itens-sistema')))) {
                link.classList.add("ativo");
            }
        });

        const botaoMenu = this.querySelector(".btn-menu i");
        const botaoMobile = document.querySelector(".btn-mobile");
        const menu = this.querySelector("nav");
        const main = document.querySelector("main");

        const isDesktop = () => window.innerWidth > 780;

        if (isDesktop() && localStorage.getItem("menuMinimizado") === "true") {
            if (menu) menu.classList.add("active");
            if (main) main.classList.add("active");
        }

        if (botaoMenu && menu) {
            botaoMenu.addEventListener("click", () => {
                if (!isDesktop()) return;

                menu.classList.toggle("active");
                if (main) main.classList.toggle("active");

                const menuMinimizado = menu.classList.contains("active");
                localStorage.setItem("menuMinimizado", menuMinimizado);
            });
        }

        window.addEventListener("resize", () => {
            if (!menu) return;

            if (!isDesktop()) {
                menu.classList.remove("active");
                if (main) main.classList.remove("active");
            } else if (localStorage.getItem("menuMinimizado") === "true") {
                menu.classList.add("active");
                if (main) main.classList.add("active");
            }
        });

        if (botaoMobile && menu) {
            botaoMobile.addEventListener("click", () => {
                botaoMobile.classList.toggle("active");
                menu.classList.toggle("menu-aberto");
                if (main) main.classList.toggle("menu-aberto");
            });
        }

        const btnPerfil = this.querySelector(".perfil .btn-perfil");
        const perfil = this.querySelector(".perfil");

        if (btnPerfil && perfil) {
            btnPerfil.addEventListener("click", (e) => {
                e.stopPropagation();
                perfil.classList.toggle("aberto");
            });

            document.addEventListener("click", (e) => {
                if (!perfil.contains(e.target)) {
                    perfil.classList.remove("aberto");
                }
            });
        }
        
        const badge = this.querySelector(".nao-lidas");
        
        const atualizarBadgeMenu = () => {
            if(typeof window.BancoDeDados === 'undefined' || !badge) return;
            
            const notificacoes = window.BancoDeDados.gerarNotificacoes();
            const naoLidas = notificacoes.filter(n => !n.lida).length;
            
            if (naoLidas > 0) {
                if (naoLidas > 9) {
                    badge.innerHTML = '9<span class="mais" style="display: flex;">+</span>';
                } else {
                    badge.innerHTML = naoLidas;
                }
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }

        setTimeout(atualizarBadgeMenu, 100);
        window.atualizarBadgeGlobal = atualizarBadgeMenu;

        const elementoAno = this.querySelector(".ano-atual");
        if (elementoAno) {
            elementoAno.textContent = new Date().getFullYear();
        }
    }
}
customElements.define("menu-user", MenuUserComponent);




class MenuAdminComponent extends HTMLElement {
    connectedCallback() {
        this.renderizar();

        // Escuta atualizações específicas do admin, ou pode manter 'usuarioAtualizado' dependendo da sua lógica de login
        window.addEventListener('adminAtualizado', () => {
            this.renderizar();
        });
    }

    renderizar() {
        // Busca os dados do ADMINISTRADOR no banco
        const admin = window.BancoDeDados?.administrador || {};
        const iniciais = window.obterIniciaisNome ? window.obterIniciaisNome(admin.nome) : '';

        this.innerHTML = `
        <!-- MENU LATERAL FIXO (ADMINISTRADOR) -->
        <nav class="nav-admin"> <!-- Classe opcional caso queira estilizar cores diferentes para o adm -->
            <!-- Ícone Menu -->
            <div class="btn-menu"><i class="fa-solid fa-bars"></i></div>

            <!-- Logo -->
            <div class="logo"><a href="../../index.html"><img class="logo-completa" src="../../src/images/logos/logo-escuro.png" alt="Logo da Perdidex"><img class="logo-simbolo" src="../../../src/images/logos/simbolo-logo.png" alt="Logo"></a></div>

            <!-- Perfil -->
            <div class="perfil">
                <div class="cabecalho">
                    <div class="avatar admin-avatar">${iniciais}</div>

                    <div class="info">
                        <strong>${admin.nome || ''}</strong>
                        <div><i class="${admin.iconePerfil || ''}"></i><span>${admin.perfil || ''}</span></div>
                    </div>

                    <i class="fi fi-br-angle-small-down btn-perfil"></i>
                </div>
                
                <div class="dados">
                    <span><i class="fa-solid fa-envelope"></i><p>${admin.email || ''}</p></span>
                    <span><i class="fa-solid fa-phone"></i><p>${admin.telefone || ''}</p></span>
                </div>
            </div>

            <!-- Lista de Páginas do Administrador -->
            <ul class="lista">
                <li class="grupo">
                    <h3>Gestão</h3>
                    <ul>
                        <li><a href="index.html"><i class="fa-regular fa-house icon-normal"></i><i class="fa-solid fa-house icon-ativo"></i><span>Início</span></a></li>
                        <li><a href="analises.html"><i class="fi fi-rr-analyse icon-normal"></i><i class="fi fi-sr-analyse icon-ativo"></i><span>Análises</span></a></li>
                        <li><a href="usuarios.html"><i class="fa-regular fa-user icon-normal"></i><i class="fa-solid fa-user icon-ativo"></i><span>Usuários</span></a></li>
                    </ul>
                </li>

                <li class="grupo">
                    <h3>Conta</h3>
                    <ul>
                        <li><a href="notificacoes.html"><i class="fa-regular fa-bell icon-normal"></i><i class="fa-solid fa-bell icon-ativo"></i><span>Notificações</span><div class="nao-lidas" style="display: none;">0</div></a></li>
                        <li><a href="configuracoes.html"><i class="fi fi-rr-settings icon-normal"></i><i class="fa-solid fa-gear icon-ativo"></i><span>Configurações</span></a></li>
                    </ul>
                </li>

                <li class="grupo">
                    <ul>
                        <hr>
                        <li><a href=""><i class="fa-solid fa-arrow-right-from-bracket icon-normal"></i><i class="fa-solid fa-right-from-bracket icon-ativo"></i><span>Sair</span></a></li>
                    </ul>
                </li>
            </ul>

            <!-- Rodapé -->
            <footer>
                <div class="copyright"><span class="nome-logo">PERDIDEX ADMIN | </span> &copy; <span class="ano-atual"></span></div>
                <div class="formas"></div>
            </footer>
        </nav>
        `;

        // Mantém a lógica de tema (Dark Mode/Light Mode)
        const temaSalvo = localStorage.getItem("tema") || "light";
        document.documentElement.setAttribute("data-theme", temaSalvo);

        // Lógica de Links Ativos ajustada para as rotas do adm
        const paginaAtual = window.location.pathname.split("/").pop();
        const links = this.querySelectorAll(".lista a");

        links.forEach(link => {
            const paginaLink = link.getAttribute("href");
            if (paginaLink && (paginaLink === paginaAtual || (paginaAtual === '' && paginaLink.includes('index-admin')))) {
                link.classList.add("ativo");
            }
        });

        // Eventos de Menu (Mobile e Desktop)
        const botaoMenu = this.querySelector(".btn-menu i");
        const botaoMobile = document.querySelector(".btn-mobile");
        const menu = this.querySelector("nav");
        const main = document.querySelector("main");

        const isDesktop = () => window.innerWidth > 780;

        if (isDesktop() && localStorage.getItem("menuMinimizado") === "true") {
            if (menu) menu.classList.add("active");
            if (main) main.classList.add("active");
        }

        if (botaoMenu && menu) {
            botaoMenu.addEventListener("click", () => {
                if (!isDesktop()) return;

                menu.classList.toggle("active");
                if (main) main.classList.toggle("active");

                const menuMinimizado = menu.classList.contains("active");
                localStorage.setItem("menuMinimizado", menuMinimizado);
            });
        }

        window.addEventListener("resize", () => {
            if (!menu) return;

            if (!isDesktop()) {
                menu.classList.remove("active");
                if (main) main.classList.remove("active");
            } else if (localStorage.getItem("menuMinimizado") === "true") {
                menu.classList.add("active");
                if (main) main.classList.add("active");
            }
        });

        if (botaoMobile && menu) {
            botaoMobile.addEventListener("click", () => {
                botaoMobile.classList.toggle("active");
                menu.classList.toggle("menu-aberto");
                if (main) main.classList.toggle("menu-aberto");
            });
        }

        // Dropdown do Perfil
        const btnPerfil = this.querySelector(".perfil .btn-perfil");
        const perfil = this.querySelector(".perfil");

        if (btnPerfil && perfil) {
            btnPerfil.addEventListener("click", (e) => {
                e.stopPropagation();
                perfil.classList.toggle("aberto");
            });

            document.addEventListener("click", (e) => {
                if (!perfil.contains(e.target)) {
                    perfil.classList.remove("aberto");
                }
            });
        }
        
        // Badge de Notificações do Admin (ajustado se o admin tiver uma fila de aprovação)
        const badge = this.querySelector(".nao-lidas");
        
        const atualizarBadgeMenu = () => {
            if(typeof window.BancoDeDados === 'undefined' || !badge) return;
            
            // Aqui você pode mudar para buscar itens pendentes de aprovação, por exemplo
            const notificacoes = window.BancoDeDados.gerarNotificacoes ? window.BancoDeDados.gerarNotificacoes() : [];
            const naoLidas = notificacoes.filter(n => !n.lida).length;
            
            if (naoLidas > 0) {
                if (naoLidas > 9) {
                    badge.innerHTML = '9<span class="mais" style="display: flex;">+</span>';
                } else {
                    badge.innerHTML = naoLidas;
                }
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }

        setTimeout(atualizarBadgeMenu, 100);
        window.atualizarBadgeGlobal = atualizarBadgeMenu;

        const elementoAno = this.querySelector(".ano-atual");
        if (elementoAno) {
            elementoAno.textContent = new Date().getFullYear();
        }
    }
}
customElements.define("menu-admin", MenuAdminComponent);