// MAIN.JS - Carrega todas as configurações dinamicamente

document.addEventListener('DOMContentLoaded', function() {
    
    console.log('Main.js carregado!');
    console.log('CLIENT_CONFIG:', CLIENT_CONFIG);
    
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
        const nomeElement = document.getElementById('academia-nome');
        if (nomeElement) nomeElement.textContent = CLIENT_CONFIG.academia.nome;
        
        const heroSubtitulo = document.getElementById('hero-subtitulo');
        if (heroSubtitulo) heroSubtitulo.textContent = CLIENT_CONFIG.hero.subtitulo;
        
        const sobreDescricao = document.getElementById('sobre-descricao');
        if (sobreDescricao) sobreDescricao.textContent = CLIENT_CONFIG.sobre.descricao;
    }
    
    // 3. CARREGAR PILARES (SOBRE)
    function carregarPilares() {
        const container = document.getElementById('pilares-container');
        if (!container) {
            console.log('Container de pilares não encontrado');
            return;
        }
        
        container.innerHTML = '';
        CLIENT_CONFIG.sobre.pilares.forEach(pilar => {
            container.innerHTML += `
                <div class="grid-item">
                    <i class="${pilar.icone}"></i>
                    <h3>${pilar.titulo}</h3>
                    <p>${pilar.descricao}</p>
                </div>
            `;
        });
        console.log('Pilares carregados:', CLIENT_CONFIG.sobre.pilares.length);
    }
    
    // 4. CARREGAR PROFESSORES
    function carregarProfessores() {
        const container = document.getElementById('professores-container');
        if (!container) {
            console.log('Container de professores não encontrado');
            return;
        }
        
        container.innerHTML = '';
        if (!CLIENT_CONFIG.professores || CLIENT_CONFIG.professores.length === 0) {
            container.innerHTML = '<p style="text-align:center">Nenhum professor cadastrado.</p>';
            return;
        }
        
        CLIENT_CONFIG.professores.forEach(prof => {
            container.innerHTML += `
                <div class="professor-card">
                    <img src="${prof.imagem}" alt="${prof.nome}" onerror="this.src='https://via.placeholder.com/300x250/E53935/white?text=${prof.nome}'">
                    <h3>${prof.nome}</h3>
                    <p>${prof.especialidade}</p>
                </div>
            `;
        });
        console.log('Professores carregados:', CLIENT_CONFIG.professores.length);
    }
    
    // 5. CARREGAR HORÁRIOS
    function carregarHorarios() {
        const tabela = document.getElementById('tabela-horarios');
        if (!tabela) {
            console.log('Tabela de horários não encontrada');
            return;
        }
        
        let tbody = tabela.querySelector('tbody');
        if (!tbody) {
            tbody = document.createElement('tbody');
            tabela.appendChild(tbody);
        }
        
        tbody.innerHTML = '';
        if (!CLIENT_CONFIG.horarios || CLIENT_CONFIG.horarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">Nenhum horário cadastrado.</td></tr>';
            return;
        }
        
        CLIENT_CONFIG.horarios.forEach(linha => {
            tbody.innerHTML += `
                <tr>
                    <td class="horario">${linha.horario}</td>
                    <td>${linha.seg || '-'}</td>
                    <td>${linha.ter || '-'}</td>
                    <td>${linha.qua || '-'}</td>
                    <td>${linha.qui || '-'}</td>
                    <td>${linha.sex || '-'}</td>
                    <td>${linha.sab || '-'}</td>
                </tr>
            `;
        });
        console.log('Horários carregados:', CLIENT_CONFIG.horarios.length);
    }
    
    // 6. CARREGAR CONTATO
    function carregarContato() {
        const endereco = document.getElementById('endereco');
        const telefone = document.getElementById('telefone');
        const email = document.getElementById('email');
        const whatsapp = document.getElementById('whatsapp');
        
        if (endereco) endereco.textContent = CLIENT_CONFIG.contato.endereco;
        if (telefone) telefone.textContent = CLIENT_CONFIG.contato.telefone;
        if (email) email.textContent = CLIENT_CONFIG.contato.email;
        if (whatsapp) whatsapp.textContent = CLIENT_CONFIG.contato.whatsapp;
    }
    
    // 7. CARREGAR REDES SOCIAIS
    function carregarSocial() {
        const container = document.getElementById('social-links');
        if (!container) return;
        
        container.innerHTML = '';
        CLIENT_CONFIG.social.forEach(social => {
            container.innerHTML += `
                <a href="${social.url}" target="_blank" title="${social.plataforma}">
                    <i class="${social.icone}"></i>
                </a>
            `;
        });
    }
    
    // 8. CARREGAR ANALYTICS
    function carregarAnalytics() {
        const trafego = CLIENT_CONFIG.analytics || { instagram: 45, facebook: 25, twitter: 10, direct: 20 };
        
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
    
    // 9. CARREGAR PRODUTOS
    function carregarProdutos() {
        const container = document.getElementById('produtos-container');
        if (!container) {
            console.log('Container de produtos não encontrado');
            return;
        }
        
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
        console.log('Produtos carregados:', CLIENT_CONFIG.produtos.length);
    }
    
    // 10. CARRINHO E CHECKOUT
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
    
    // Eventos de clique nos produtos
    document.addEventListener('click', function(e) {
        if (e.target.classList && e.target.classList.contains('btn-comprar')) {
            const id = parseInt(e.target.dataset.id);
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
    
    // INICIALIZAR TUDO
    console.log('Inicializando...');
    aplicarTema();
    carregarInfoAcademia();
    carregarPilares();
    carregarProfessores();
    carregarHorarios();
    carregarContato();
    carregarSocial();
    carregarAnalytics();
    carregarProdutos();
    initMobileMenu();
    initSmoothScroll();
    atualizarCarrinho();
    
    console.log('Inicialização concluída!');
});
