const CLIENT_CONFIG = {
    academia: {
        nome: "FIGHTCODE",
        logo: "assets/img/banner/logo.jpeg",
        slogan: "Tecnologia para evoluir lutadores"
    },
    
    tema: {
        primaria: "#E53935",
        secundaria: "#0DDDDD",
        escuro: "#1a1a1a",
        claro: "#f8f9fa"
    },
    
    hero: {
        titulo: "TECNOLOGIA QUE ELEVA SUA ACADEMIA",
        subtitulo: "Sites e sistemas personalizados para academias de lutas"
    },
    
    sobre: {
        descricao: "A FightCode nasceu da paixão por artes marciais e tecnologia. Oferecemos soluções completas para academias que desejam modernizar sua gestão.",
        pilares: [
            { icone: "fas fa-chart-line", titulo: "Tecnologia", descricao: "Soluções modernas e eficientes" },
            { icone: "fas fa-shield-alt", titulo: "Confiança", descricao: "Segurança e dados protegidos" },
            { icone: "fas fa-fist-raised", titulo: "Disciplina", descricao: "Foco, consistência e evolução" },
            { icone: "fas fa-trophy", titulo: "Resultados", descricao: "Estratégia que gera vitória" }
        ]
    },
    
    professores: [
        { nome: "Ludy Calixto", especialidade: "Jiu-Jitsu / Faixa Preta 2° Grau", imagem: "assets/img/professores/ludy.jpg" },
        { nome: "Adriano Barbosa", especialidade: "Jiu-Jitsu / Faixa Preta 1° Grau", imagem: "assets/img/professores/adriano.jpg" },
        { nome: "Fernando Morais", especialidade: "Jiu-Jitsu / Faixa Preta", imagem: "assets/img/professores/fernando.jpg" }
    ],
    
    horarios: [
        { horario: "06:00 - 07:00", seg: "Jiu-Jitsu Adulto", ter: "", qua: "Jiu-Jitsu Adulto", qui: "", sex: "Jiu-Jitsu Adulto", sab: "" },
        { horario: "19:00 - 20:00", seg: "Jiu-Jitsu Kids", ter: "", qua: "Jiu-Jitsu Kids", qui: "", sex: "Jiu-Jitsu Kids", sab: "" },
        { horario: "20:00 - 21:30", seg: "Jiu-Jitsu Adulto", ter: "Jiu-Jitsu Adulto", qua: "Jiu-Jitsu Adulto", qui: "NO-GI", sex: "Jiu-Jitsu Adulto", sab: "" }
    ],
    
    contato: {
        endereco: "Rua Bernardino de Campos, 20-12 - Bauru, SP",
        telefone: "(14) 991971317",
        email: "contato@fightcode.com",
        whatsapp: "(14) 991971317"
    },
    
    social: [
        { plataforma: "Facebook", url: "https://facebook.com", icone: "fab fa-facebook" },
        { plataforma: "Instagram", url: "https://instagram.com", icone: "fab fa-instagram" },
        { plataforma: "WhatsApp", url: "https://wa.me/5514991971317", icone: "fab fa-whatsapp" }
    ],
    
    analytics: {
        instagram: 45,
        facebook: 25,
        twitter: 10,
        direct: 20
    },
    
    secoes: {
        hero: true,
        sobre: true,
        professores: true,
        horarios: true,
        contato: true
    },
    
    produtos: [
        {
            id: 1,
            nome: "Kimono Jiu-Jitsu Profissional",
            descricao: "Kimono premium 550g, algodão peruano, azul royal",
            preco: 350.00,
            imagem: "assets/img/loja/kimono.jpg",
            parcelas: 3
        },
        {
            id: 2,
            nome: "Camiseta FightCode",
            descricao: "Camiseta 100% algodão, estampa FightCode",
            preco: 79.90,
            imagem: "assets/img/loja/camiseta.jpg",
            parcelas: 1
        },
        {
            id: 3,
            nome: "Rash Guard NO-GI",
            descricao: "Rash guard compressão, proteção UV, manga longa",
            preco: 129.90,
            imagem: "assets/img/loja/rashguard.jpg",
            parcelas: 2
        },
        {
            id: 4,
            nome: "Bermuda de Jiu-Jitsu",
            descricao: "Bermuda com reforço, ideal para NO-GI",
            preco: 149.90,
            imagem: "assets/img/loja/bermuda.jpg",
            parcelas: 2
        },
        {
            id: 5,
            nome: "Faixa de Jiu-Jitsu",
            descricao: "Faixa 100% algodão, cores variadas",
            preco: 45.90,
            imagem: "assets/img/loja/faixa.jpg",
            parcelas: 1
        },
        {
            id: 6,
            nome: "Mochila FightCode",
            descricao: "Mochila para equipamentos, 35L",
            preco: 189.90,
            imagem: "assets/img/loja/mochila.jpg",
            parcelas: 3
        }
    ]
};
