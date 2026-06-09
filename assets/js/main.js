// MAIN.JS - Carrega todas as configurações dinamicamente

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. APLICAR CORES DO TEMA
    function aplicarTema() {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', CLIENT_CONFIG.tema.primaria);
        root.style.setProperty('--secondary-color', CLIENT_CONFIG.tema.secundaria);
        root.style.setProperty('--bg-dark', CLIENT_CONFIG.tema.escuro);
        root.style.setProperty('--bg-light', CLIENT_CONFIG.tema.claro);
    }
    
    // 2. CARREGAR INFORMAÇÕES DA ACADEMIA
    function carregarInfoAcademia() {
        document.getElementById('academia-nome').textContent = CLIENT_CONFIG.academia.nome;
        const logoImg = document.getElementById('logo-img');
        if (logoImg) logoImg.src = CLIENT_CONFIG.academia.logo;
        
        document.getElementById('hero-titulo').textContent = CLIENT_CONFIG.hero.titulo;
        document.getElementById('hero-subtitulo').textContent = CLIENT_CONFIG.hero.subtitulo;
        
        document.getElementById('sobre-descricao').textContent = CLIENT_CONFIG.sobre.descricao;
    }
    
    // 3. CARREGAR PROFESSORES
    function carregarProfessores() {
        const container = document.getElementById('professores-container');
        if (!container) return;
        
        container.innerHTML = '';
        CLIENT_CONFIG.professores.forEach(prof => {
            const card = `
                <div class="professor-card">
                    <img src="${prof.imagem}" alt="${prof.nome}">
                    <h3>${prof.nome}</h3>
                    <p>${prof.especialidade}</p>
                </div>
            `;
            container.innerHTML += card;
        });
    }
    
    // 4. CARREGAR HORÁRIOS
    function carregarHorarios() {
        const tabela = document.getElementById('tabela-horarios').querySelector('tbody');
        if (!tabela) return;
        
        tabela.innerHTML = '';
        CLIENT_CONFIG.horarios.forEach(linha => {
            const row = `
                <tr>
                    <td class="horario">${linha.horario}</td>
                    <td>${linha.seg}</td>
                    <td>${linha.ter}</td>
                    <td>${linha.qua}</td>
                    <td>${linha.qui}</td>
                    <td>${linha.sex}</td>
                    <td>${linha.sab}</td>
                </tr>
            `;
            tabela.innerHTML += row;
        });
    }
    
    // 5. CARREGAR CONTATO
    function carregarContato() {
        document.getElementById('endereco').textContent = CLIENT_CONFIG.contato.endereco;
        document.getElementById('telefone').textContent = CLIENT_CONFIG.contato.telefone;
        document.getElementById('email').textContent = CLIENT_CONFIG.contato.email;
        document.getElementById('whatsapp').textContent = CLIENT_CONFIG.contato.whatsapp;
    }
    
    // 6. CARREGAR REDES SOCIAIS
    function carregarSocial() {
        const container = document.getElementById('social-links');
        if (!container) return;
        
        container.innerHTML = '';
        CLIENT_CONFIG.social.forEach(social => {
            const link = `
                <a href="${social.url}" target="_blank" title="${social.plataforma}">
                    <i class="${social.icone}"></i>
                </a>
            `;
            container.innerHTML += link;
        });
    }
    
    // 7. MENU MOBILE (responsivo)
    function initMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const nav = document.querySelector('.nav');
        
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                nav.classList.toggle('active');
            });
        }
    }
    
    // 8. SMOOTH SCROLL (rolagem suave)
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    // Fechar menu mobile se estiver aberto
                    document.querySelector('.nav')?.classList.remove('active');
                }
            });
        });
    }
    
    // 9. FORMULÁRIO DE CONTATO
    function initFormContato() {
        const form = document.getElementById('form-contato');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                // Aqui você enviará para o backend depois
                alert('Mensagem enviada! Em breve entraremos em contato.');
                form.reset();
            });
        }
    }
    
    // 10. GERENCIAR SEÇÕES (mostrar/esconder)
    function gerenciarSecoes() {
        const secoes = {
            hero: document.getElementById('home'),
            sobre: document.getElementById('sobre'),
            professores: document.getElementById('professores'),
            horarios: document.getElementById('horarios'),
            contato: document.getElementById('contato')
        };
        
        for (const [key, element] of Object.entries(secoes)) {
            if (element && CLIENT_CONFIG.secoes[key] === false) {
                element.style.display = 'none';
            }
        }
    }
    
    // INICIALIZAR TUDO
    aplicarTema();
    carregarInfoAcademia();
    carregarProfessores();
    carregarHorarios();
    carregarContato();
    carregarSocial();
    initMobileMenu();
    initSmoothScroll();
    initFormContato();
    gerenciarSecoes();
    
});