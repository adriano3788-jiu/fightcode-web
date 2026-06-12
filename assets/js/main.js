// MAIN.JS - Carrega todas as configuracoes dinamicamente via API

// URL da API
const API_URL = 'https://fightcode-api.onrender.com';

document.addEventListener('DOMContentLoaded', function() {
    
    console.log('Main.js carregado!');
    
    // 1. CARREGAR CONFIGURACOES DO SITE (via API)
    async function carregarConfiguracoes() {
        try {
            const response = await fetch(`${API_URL}/api/configuracoes`);
            const config = await response.json();
            
            // Aplicar cores do tema
            const root = document.documentElement;
            if (config.tema_primaria) root.style.setProperty('--primary-color', config.tema_primaria);
            if (config.tema_secundaria) root.style.setProperty('--secondary-color', config.tema_secundaria);
            
            // Atualizar textos do site
            const academiaNome = document.getElementById('academia-nome');
            if (academiaNome && config.academia_nome) academiaNome.textContent = config.academia_nome;
            
            const heroSubtitulo = document.getElementById('hero-subtitulo');
            if (heroSubtitulo && config.hero_subtitulo) heroSubtitulo.textContent = config.hero_subtitulo;
            
            const sobreDescricao = document.getElementById('sobre-descricao');
            if (sobreDescricao && config.sobre_descricao) sobreDescricao.textContent = config.sobre_descricao;
            
            console.log('Configuracoes carregadas da API');
        } catch (error) {
            console.error('Erro ao carregar configuracoes:', error);
        }
    }
    
    // 2. CARREGAR PILARES (fixos - nao vem da API)
    function carregarPilares() {
        const container = document.getElementById('pilares-container');
        if (!container) return;
        
        const pilares = [
            { icone: "fas fa-chart-line", titulo: "Tecnologia", descricao: "Solucoes modernas e eficientes" },
            { icone: "fas fa-shield-alt", titulo: "Confianca", descricao: "Seguranca e dados protegidos" },
            { icone: "fas fa-fist-raised", titulo: "Disciplina", descricao: "Foco, consistencia e evolucao" },
            { icone: "fas fa-trophy", titulo: "Resultados", descricao: "Estrategia que gera vitoria" }
        ];
        
        container.innerHTML = '';
        pilares.forEach(pilar => {
            container.innerHTML += `
                <div class="grid-item">
                    <i class="${pilar.icone}"></i>
                    <h3>${pilar.titulo}</h3>
                    <p>${pilar.descricao}</p>
                </div>
            `;
        });
    }
    
    // 3. CARREGAR PROFESSORES (via API)
    async function carregarProfessores() {
        const container = document.getElementById('professores-container');
        if (!container) return;
        
        try {
            const response = await fetch(`${API_URL}/api/professores`);
            const professores = await response.json();
            
            container.innerHTML = '';
            if (professores.length === 0) {
                container.innerHTML = '<p style="text-align:center">Nenhum professor cadastrado.</p>';
                return;
            }
            
            professores.forEach(prof => {
                container.innerHTML += `
                    <div class="professor-card">
                        <img src="${prof.imagem_url || 'https://via.placeholder.com/300x250/E53935/white?text=' + prof.nome}" alt="${prof.nome}">
                        <h3>${prof.nome}</h3>
                        <p>${prof.especialidade || 'Professor'}</p>
                    </div>
                `;
            });
            console.log('Professores carregados da API:', professores.length);
        } catch (error) {
            console.error('Erro ao carregar professores:', error);
            container.innerHTML = '<p style="text-align:center">Erro ao carregar professores. Tente novamente.</p>';
        }
    }
    
    // 4. CARREGAR HORARIOS (via API)
    async function carregarHorarios() {
        const tabela = document.getElementById('tabela-horarios');
        if (!tabela) return;
        
        let tbody = tabela.querySelector('tbody');
        if (!tbody) {
            tbody = document.createElement('tbody');
            tabela.appendChild(tbody);
        }
        
        try {
            const response = await fetch(`${API_URL}/api/horarios`);
            const horarios = await response.json();
            
            tbody.innerHTML = '';
            if (horarios.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7">Nenhum horario cadastrado.</td></tr>';
                return;
            }
            
            horarios.forEach(linha => {
                tbody.innerHTML += `
                    <tr>
                        <td class="horario">${linha.horario}</td>
                        <td>${linha.segunda || '-'}</td>
                        <td>${linha.terca || '-'}</td>
                        <td>${linha.quarta || '-'}</td>
                        <td>${linha.quinta || '-'}</td>
                        <td>${linha.sexta || '-'}</td>
                        <td>${linha.sabado || '-'}</td>
                    </tr>
                `;
            });
            console.log('Horarios carregados da API:', horarios.length);
        } catch (error) {
            console.error('Erro ao carregar horarios:', error);
            tbody.innerHTML = '<tr><td colspan="7">Erro ao carregar horarios.</td></tr>';
        }
    }
    
    // 5. CARREGAR PRODUTOS (via API)
    async function carregarProdutos() {
        const container = document.getElementById('produtos-container');
        if (!container) return;
        
        try {
            const response = await fetch(`${API_URL}/api/produtos`);
            const produtos = await response.json();
            
            container.innerHTML = '';
            if (produtos.length === 0) {
                container.innerHTML = '<p style="text-align:center">Nenhum produto cadastrado.</p>';
                return;
            }
            
            produtos.forEach(produto => {
                container.innerHTML += `
                    <div class="produto-card">
                        <img src="${produto.imagem_url || 'https://via.placeholder.com/300x250/E53935/white?text=' + produto.nome}" alt="${produto.nome}" class="produto-imagem">
                        <div class="produto-info">
                            <h3>${produto.nome}</h3>
                            <p class="produto-descricao">${produto.descricao || ''}</p>
                            <p class="produto-preco">R$ ${parseFloat(produto.preco).toFixed(2)}</p>
                            <button class="btn-comprar" data-id="${produto.id}">Adicionar ao Carrinho</button>
                        </div>
                    </div>
                `;
            });
            console.log('Produtos carregados da API:', produtos.length);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            container.innerHTML = '<p style="text-align:center">Erro ao carregar produtos.</p>';
        }
    }
    
    // 6. CARREGAR CONTATO (dados fixos por enquanto)
    function carregarContato() {
        const endereco = document.getElementById('endereco');
        const telefone = document.getElementById('telefone');
        const email = document.getElementById('email');
        const whatsapp = document.getElementById('whatsapp');
        
        if (endereco) endereco.textContent = 'Rua Bernardino de Campos, 20-12 - Bauru, SP';
        if (telefone) telefone.textContent = '(14) 991971317';
        if (email) email.textContent = 'contato@fightcode.com';
        if (whatsapp) whatsapp.textContent = '(14) 991971317';
    }
    
    // 7. CARREGAR REDES SOCIAIS (via API)
    async function carregarSocial() {
        const container = document.getElementById('social-links');
        if (!container) return;
        
        try {
            const response = await fetch(`${API_URL}/api/redes-sociais`);
            const social = await response.json();
            
            container.innerHTML = '';
            social.forEach(link => {
                container.innerHTML += `
                    <a href="${link.url}" target="_blank" title="${link.plataforma}">
                        <i class="${link.icone}"></i>
                    </a>
                `;
            });
            console.log('Redes sociais carregadas da API');
        } catch (error) {
            console.error('Erro ao carregar redes sociais:', error);
        }
    }
    
    // 8. CARREGAR ANALYTICS (simulado)
    function carregarAnalytics() {
        const trafego = { instagram: 45, facebook: 25, twitter: 10, direct: 20 };
        
        const progressInsta = document.getElementById('progress-instagram');
        const progressFb = document.getElementById('progress-facebook');
        const progressTwitter = document.getElementById('progress-twitter');
        const progressDirect = document.getElementById('progress-direct');
        
        if (progressInsta) progressInsta.style.width = trafego.instagram + '%';
        if (progressFb) progressFb.style.width = trafego.facebook + '%';
        if (progressTwitter) progressTwitter.style.width = trafego.twitter + '%';
        if (progressDirect) progressDirect.style.width = trafego.direct + '%';
        
        const percentInsta = document.getElementById('percent-instagram');
        const percentFb = document.getElementById('percent-facebook');
        const percentTwitter = document.getElementById('percent-twitter');
        const percentDirect = document.getElementById('percent-direct');
        
        if (percentInsta) percentInsta.textContent = trafego.instagram + '%';
        if (percentFb) percentFb.textContent = trafego.facebook + '%';
        if (percentTwitter) percentTwitter.textContent = trafego.twitter + '%';
        if (percentDirect) percentDirect.textContent = trafego.direct + '%';
    }
    
    // 9. CARRINHO DE COMPRAS
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    
    function mostrarMensagem(texto) {
        const msg = document.createElement('div');
        msg.className = 'mensagem-confirmacao';
        msg.textContent = texto;
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 5000);
    }
    
    function atualizarCarrinho() {
        const carrinhoItens = document.getElementById('carrinho-itens');
        const carrinhoContador = document.getElementById('carrinho-contador');
        const carrinhoTotal = document.getElementById('carrinho-total');
        
        if (!carrinhoItens) return;
        
        if (carrinho.length === 0) {
            carrinhoItens.innerHTML = '<p class="carrinho-vazio">Seu carrinho esta vazio</p>';
            if (carrinhoContador) carrinhoContador.textContent = '0';
            if (carrinhoTotal) carrinhoTotal.textContent = 'R$ 0,00';
            return;
        }
        
        let total = 0;
        let quantidadeTotal = 0;
        carrinhoItens.innerHTML = '';
        
        carrinho.forEach((item, index) => {
            total += item.preco * item.quantidade;
            quantidadeTotal += item.quantidade;
            
            carrinhoItens.innerHTML += `
                <div class="carrinho-item">
                    <div class="carrinho-item-info">
                        <div class="carrinho-item-nome">${item.nome}</div>
                        <div class="carrinho-item-preco">R$ ${item.preco.toFixed(2)}</div>
                    </div>
                    <div class="carrinho-item-actions">
                        <button class="carrinho-item-diminuir" data-index="${index}">-</button>
                        <span class="carrinho-item-qtd">${item.quantidade}</span>
                        <button class="carrinho-item-aumentar" data-index="${index}">+</button>
                        <button class="carrinho-item-remove" data-index="${index}">🗑️</button>
                    </div>
                </div>
            `;
        });
        
        if (carrinhoContador) carrinhoContador.textContent = quantidadeTotal;
        if (carrinhoTotal) carrinhoTotal.textContent = `R$ ${total.toFixed(2)}`;
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
    }
    
    // Eventos do carrinho
    document.addEventListener('click', async (e) => {
        if (e.target.classList && e.target.classList.contains('btn-comprar')) {
            const id = parseInt(e.target.dataset.id);
            
            try {
                const response = await fetch(`${API_URL}/api/produtos`);
                const produtos = await response.json();
                const produto = produtos.find(p => p.id === id);
                
                if (produto) {
                    const itemExistente = carrinho.find(item => item.id === id);
                    if (itemExistente) {
                        itemExistente.quantidade++;
                    } else {
                        carrinho.push({
                            id: produto.id,
                            nome: produto.nome,
                            preco: parseFloat(produto.preco),
                            quantidade: 1
                        });
                    }
                    atualizarCarrinho();
                    mostrarMensagem(`${produto.nome} adicionado ao carrinho!`);
                }
            } catch (error) {
                console.error('Erro ao buscar produto:', error);
            }
        }
        
        if (e.target.classList && e.target.classList.contains('carrinho-item-diminuir')) {
            const index = parseInt(e.target.dataset.index);
            if (carrinho[index].quantidade > 1) {
                carrinho[index].quantidade--;
            } else {
                carrinho.splice(index, 1);
            }
            atualizarCarrinho();
        }
        
        if (e.target.classList && e.target.classList.contains('carrinho-item-aumentar')) {
            const index = parseInt(e.target.dataset.index);
            carrinho[index].quantidade++;
            atualizarCarrinho();
        }
        
        if (e.target.classList && e.target.classList.contains('carrinho-item-remove')) {
            const index = parseInt(e.target.dataset.index);
            carrinho.splice(index, 1);
            atualizarCarrinho();
        }
    });
    
    // Finalizar compra
    const btnFinalizar = document.getElementById('btn-finalizar');
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', () => {
            if (carrinho.length === 0) {
                mostrarMensagem('Seu carrinho esta vazio!');
                return;
            }
            
            let mensagemWhatsApp = `🛒 *NOVO PEDIDO - FIGHTCODE*%0a%0a`;
            mensagemWhatsApp += `📦 *ITENS:*%0a`;
            
            let total = 0;
            carrinho.forEach(item => {
                mensagemWhatsApp += `- ${item.nome} x${item.quantidade} = R$ ${(item.preco * item.quantidade).toFixed(2)}%0a`;
                total += item.preco * item.quantidade;
            });
            
            mensagemWhatsApp += `%0a💰 *Total:* R$ ${total.toFixed(2)}%0a`;
            mensagemWhatsApp += `📍 *Retirada:* Retirar na Academia%0a`;
            
            window.open(`https://wa.me/5514991971317?text=${mensagemWhatsApp}`, '_blank');
            
            mostrarMensagem('Pedido enviado! Entraremos em contato pelo WhatsApp.');
            carrinho = [];
            atualizarCarrinho();
        });
    }
    
    // MENU MOBILE
    function initMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const nav = document.querySelector('.nav');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                nav.classList.toggle('active');
            });
        }
    }
    
    // SMOOTH SCROLL
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
    
    // FORMULARIO CONTATO
    function initFormContato() {
        const form = document.getElementById('form-contato');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Mensagem enviada! Em breve entraremos em contato.');
                form.reset();
            });
        }
    }
    
    // INICIALIZAR TUDO
    async function init() {
        await carregarConfiguracoes();
        carregarPilares();
        await carregarProfessores();
        await carregarHorarios();
        await carregarProdutos();
        carregarContato();
        await carregarSocial();
        carregarAnalytics();
        initMobileMenu();
        initSmoothScroll();
        initFormContato();
        atualizarCarrinho();
        
        console.log('Inicializacao concluida!');
    }
    
    init();
    
});
