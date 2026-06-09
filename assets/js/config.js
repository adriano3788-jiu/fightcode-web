const CLIENT_CONFIG = {
    academia: {
        nome: "FIGHTCODE",
        logo: "assets/img/logo-default.png",
        slogan: "Tecnologia para evoluir lutadores"
    },
    
    tema: {
        primaria: "#E53935",
        secundaria: "#0DDDDD",
        escuro: "#1a1a1a",
        claro: "#f8f9fa"
    },
    
    hero: {
        titulo: "TECNOLOGIA PARA EVOLUIR LUTADORES",
        subtitulo: "Sistema completo para gestão da sua academia"
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
        { nome: "Ludy Calixto", especialidade: "Jiu-Jitsu / Faixa Preta 2° Grau", imagem: "assets/img/prof1.jpg" },
        { nome: "Adriano Barbosa", especialidade: "Jiu-Jitsu / Faixa Preta 1° Grau", imagem: "assets/img/prof2.jpg" },
        { nome: "Fernando Morais", especialidade: "Jiu-Jitsu / Faixa Preta", imagem: "assets/img/prof3.jpg" },
        { nome: "Thiago Glad", especialidade: "Judô / Faixa Marrom", imagem: "assets/img/prof4.jpg" }
    ],
    
    horarios: [
        { horario: "06:00 - 07:00", seg: "Jiu-Jitsu Adulto", ter: "", qua: "Jiu-Jitsu Adulto", qui: "", sex: "Jiu-Jitsu Adulto", sab: "" },
        { horario: "19:00 - 20:00", seg: "Jiu-Jitsu Kids", ter: "", qua: "Jiu-Jitsu Kids", qui: "", sex: "Jiu-Jitsu Kids", sab: "" },
        { horario: "20:00 - 21:30", seg: "Jiu-Jitsu Adulto", ter: "Jiu-Jitsu Adulto", qua: "Jiu-Jitsu Adulto", qui: "NO-GI", sex: "Jiu-Jitsu Adulto", sab: "" }
    ],
    
    contato: {
        endereco: "Rua Bernardino de Campos, 20-12 - Bauru, SP",
        telefone: "(14) 99865-9415",
        email: "contato@fightcode.com",
        whatsapp: "(14) 99865-9415"
    },
    
    social: [
        { plataforma: "Facebook", url: "https://facebook.com", icone: "fab fa-facebook" },
        { plataforma: "Instagram", url: "https://instagram.com", icone: "fab fa-instagram" },
        { plataforma: "WhatsApp", url: "https://wa.me/5514998659415", icone: "fab fa-whatsapp" }
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
    }
};
