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
                    <img src="${prof.imagem}" alt="${prof.nome}" onerror="this.src='https://via.placeholder.com/300x250/E53935/white?text=${prof.nome}'">
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
                alert('Mensagem enviada! Em breve entraremos em contato.');
                form.reset();
            });
        }
    }
    
    // 10. GERENCIAR SEÇÕES
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
    
    // 11. CARREGAR ANALYTICS (medidor de tráfego)
    function carregarAnalytics() {
        const trafego = CLIENT_CONFIG.analytics || {
            instagram: 45,
            facebook: 25,
            twitter: 10,
            direct: 20
        };
        
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
    
    // 12. LOJA ONLINE
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
            carrinhoItens.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio</p>';
            if (carrinhoContador) carrinhoContador.textContent = '0';
            if (carrinhoTotal) carrinhoTotal.textContent = 'R$ 0,00';
            return;
        }
        
        let total = 0;
        let quantidadeTotal = 0;
        carrinhoItens.innerHTML = '';
        
        carrinho.forEach((item, index) => {
            const subtotal = item.preco * item.quantidade;
            total += subtotal;
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
    
    function carregarProdutos() {
        const container = document.getElementById('produtos-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!CLIENT_CONFIG.produtos || CLIENT_CONFIG.produtos.length === 0) {
            container.innerHTML = '<p style="text-align:center">Nenhum produto cadastrado.</p>';
            return;
        }
        
        CLIENT_CONFIG.produtos.forEach(produto => {
            container.innerHTML += `
                <div class="produto-card">
                    <img src="${produto.imagem}" alt="${produto.nome}" class="produto-imagem" onerror="this.src='https://via.placeholder.com/300x250/E53935/white?text=${produto.nome}'">
                    <div class="produto-info">
                        <h3>${produto.nome}</h3>
                        <p class="produto-descricao">${produto.descricao}</p>
                        <p class="produto-preco">R$ ${produto.preco.toFixed(2)}</p>
                        <button class="btn-comprar" data-id="${produto.id}">Adicionar ao Carrinho</button>
                    </div>
                </div>
            `;
        });
        
        document.querySelectorAll('.btn-comprar').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const produto = CLIENT_CONFIG.produtos.find(p => p.id === id);
                const itemExistente = carrinho.find(item => item.id === id);
                
                if (itemExistente) {
                    itemExistente.quantidade++;
                } else {
                    carrinho.push({
                        id: produto.id,
                        nome: produto.nome,
                        preco: produto.preco,
                        quantidade: 1
                    });
                }
                
                atualizarCarrinho();
                mostrarMensagem(`${produto.nome} adicionado ao carrinho!`);
            });
        });
    }
    
    // Eventos do carrinho
    const carrinhoItensElement = document.getElementById('carrinho-itens');
    if (carrinhoItensElement) {
        carrinhoItensElement.addEventListener('click', (e) => {
            const index = e.target.dataset.index;
            if (index === undefined) return;
            
            if (e.target.classList.contains('carrinho-item-diminuir')) {
                if (carrinho[index].quantidade > 1) {
                    carrinho[index].quantidade--;
                } else {
                    carrinho.splice(index, 1);
                }
                atualizarCarrinho();
            }
            
            if (e.target.classList.contains('carrinho-item-aumentar')) {
                carrinho[index].quantidade++;
                atualizarCarrinho();
            }
            
            if (e.target.classList.contains('carrinho-item-remove')) {
                carrinho.splice(index, 1);
                atualizarCarrinho();
            }
        });
    }
    
    // Modal checkout
    const modal = document.getElementById('modal-checkout');
    const btnFinalizar = document.getElementById('btn-finalizar');
    const modalFechar = document.querySelector('.modal-fechar');
    
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', () => {
            if (carrinho.length === 0) {
                mostrarMensagem('Seu carrinho está vazio!');
                return;
            }
            
            const total = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
            const resumo = document.getElementById('resumo-itens');
            if (resumo) {
                resumo.innerHTML = '';
                carrinho.forEach(item => {
                    resumo.innerHTML += `
                        <div class="resumo-item">
                            <span>${item.nome} x${item.quantidade}</span>
                            <span>R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
                        </div>
                    `;
                });
            }
            const modalTotal = document.getElementById('modal-total');
            if (modalTotal) modalTotal.textContent = `R$ ${total.toFixed(2)}`;
            if (modal) modal.style.display = 'flex';
        });
    }
    
    if (modalFechar) {
        modalFechar.addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
        });
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }
    
    const formCheckout = document.getElementById('form-checkout');
    if (formCheckout) {
        formCheckout.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const clienteNome = document.getElementById('cliente-nome')?.value || '';
            const clienteTelefone = document.getElementById('cliente-telefone')?.value || '';
            const clienteEmail = document.getElementById('cliente-email')?.value || '';
            const pagamentoMetodo = document.getElementById('pagamento-metodo')?.value || '';
            const retirada = document.getElementById('retirada')?.value || '';
            const observacoes = document.getElementById('observacoes')?.value || '';
            
            let mensagemWhatsApp = `🛒 *NOVO PEDIDO - FIGHTCODE*%0a%0a`;
            mensagemWhatsApp += `👤 *Cliente:* ${clienteNome}%0a`;
            mensagemWhatsApp += `📱 *Telefone:* ${clienteTelefone}%0a`;
            mensagemWhatsApp += `📧 *Email:* ${clienteEmail}%0a%0a`;
            mensagemWhatsApp += `📦 *ITENS:*%0a`;
            
            carrinho.forEach(item => {
                mensagemWhatsApp += `- ${item.nome} x${item.quantidade} = R$ ${(item.preco * item.quantidade).toFixed(2)}%0a`;
            });
            
            const total = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
            mensagemWhatsApp += `%0a💰 *Total:* R$ ${total.toFixed(2)}%0a`;
            mensagemWhatsApp += `💳 *Pagamento:* ${pagamentoMetodo === 'pix' ? 'PIX' : 'Cartão'}%0a`;
            mensagemWhatsApp += `📍 *Retirada:* ${retirada}%0a`;
            if (observacoes) mensagemWhatsApp += `📝 *Observações:* ${observacoes}%0a`;
            
            const whatsappNumber = CLIENT_CONFIG.contato.whatsapp.replace(/\D/g, '');
            window.open(`https://wa.me/${whatsappNumber}?text=${mensagemWhatsApp}`, '_blank');
            
            mostrarMensagem('Pedido enviado! Entraremos em contato pelo WhatsApp.');
            if (modal) modal.style.display = 'none';
            carrinho = [];
            atualizarCarrinho();
            formCheckout.reset();
        });
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
    carregarAnalytics();
    carregarProdutos();
    atualizarCarrinho();
    
});
