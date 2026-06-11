const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configurar multer para upload temporário
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/tmp');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Conexão com o banco de dados (Neon)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Testar conexão
pool.connect((err) => {
    if (err) {
        console.log('Erro ao conectar ao banco:', err);
    } else {
        console.log('Conectado ao banco de dados Neon!');
    }
});

// ==================== ROTAS DE AUTENTICAÇÃO ====================

// Login do administrador
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;
    
    try {
        const result = await pool.query(
            'SELECT id, nome, email, senha FROM usuarios WHERE email = $1',
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ erro: 'Usuário não encontrado' });
        }
        
        const usuario = result.rows[0];
        
        if (senha !== usuario.senha) {
            return res.status(401).json({ erro: 'Senha incorreta' });
        }
        
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            process.env.JWT_SECRET || 'fightcode_secret_key',
            { expiresIn: '24h' }
        );
        
        res.json({
            sucesso: true,
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro no servidor' });
    }
});

// ==================== ROTAS DE UPLOAD DE IMAGENS ====================

// Upload de imagem para professor
app.post('/api/upload/professor', upload.single('imagem'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ erro: 'Nenhum arquivo enviado' });
        }
        
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'fightcode/professores'
        });
        
        res.json({ 
            sucesso: true, 
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (error) {
        console.error('Erro no upload:', error);
        res.status(500).json({ erro: 'Erro ao fazer upload da imagem' });
    }
});

// Upload de imagem para produto
app.post('/api/upload/produto', upload.single('imagem'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ erro: 'Nenhum arquivo enviado' });
        }
        
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'fightcode/produtos'
        });
        
        res.json({ 
            sucesso: true, 
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (error) {
        console.error('Erro no upload:', error);
        res.status(500).json({ erro: 'Erro ao fazer upload da imagem' });
    }
});

// ==================== ROTAS DE CONFIGURAÇÕES ====================

// Buscar configurações do site
app.get('/api/configuracoes', async (req, res) => {
    try {
        const result = await pool.query('SELECT chave, valor FROM configuracoes');
        const configuracoes = {};
        result.rows.forEach(row => {
            configuracoes[row.chave] = row.valor;
        });
        res.json(configuracoes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar configurações' });
    }
});

// Atualizar configuração
app.put('/api/configuracoes/:chave', async (req, res) => {
    const { chave } = req.params;
    const { valor } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE configuracoes SET valor = $1, atualizado_em = CURRENT_TIMESTAMP WHERE chave = $2 RETURNING *',
            [valor, chave]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Configuração não encontrada' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao atualizar configuração' });
    }
});

// ==================== ROTAS DE PROFESSORES ====================

// Listar todos os professores
app.get('/api/professores', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM professores WHERE ativo = true ORDER BY ordem');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar professores' });
    }
});

// Buscar professor por ID
app.get('/api/professores/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM professores WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Professor não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar professor' });
    }
});

// Adicionar novo professor
app.post('/api/professores', async (req, res) => {
    const { nome, especialidade, imagem_url } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO professores (nome, especialidade, imagem_url) VALUES ($1, $2, $3) RETURNING *',
            [nome, especialidade, imagem_url || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao adicionar professor' });
    }
});

// Atualizar professor
app.put('/api/professores/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, especialidade, imagem_url } = req.body;
    try {
        const result = await pool.query(
            'UPDATE professores SET nome = $1, especialidade = $2, imagem_url = COALESCE($3, imagem_url) WHERE id = $4 RETURNING *',
            [nome, especialidade, imagem_url, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Professor não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao atualizar professor' });
    }
});

// Remover professor
app.delete('/api/professores/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM professores WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Professor não encontrado' });
        }
        res.json({ mensagem: 'Professor removido com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao remover professor' });
    }
});

// ==================== ROTAS DE PRODUTOS ====================

// Listar todos os produtos
app.get('/api/produtos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM produtos WHERE ativo = true ORDER BY ordem');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar produtos' });
    }
});

// Buscar produto por ID
app.get('/api/produtos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM produtos WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Produto não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar produto' });
    }
});

// Adicionar novo produto
app.post('/api/produtos', async (req, res) => {
    const { nome, descricao, preco, imagem_url } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO produtos (nome, descricao, preco, imagem_url) VALUES ($1, $2, $3, $4) RETURNING *',
            [nome, descricao, preco, imagem_url || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao adicionar produto' });
    }
});

// Atualizar produto
app.put('/api/produtos/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, descricao, preco, imagem_url } = req.body;
    try {
        const result = await pool.query(
            'UPDATE produtos SET nome = $1, descricao = $2, preco = $3, imagem_url = COALESCE($4, imagem_url) WHERE id = $5 RETURNING *',
            [nome, descricao, preco, imagem_url, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Produto não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao atualizar produto' });
    }
});

// Remover produto
app.delete('/api/produtos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM produtos WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Produto não encontrado' });
        }
        res.json({ mensagem: 'Produto removido com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao remover produto' });
    }
});

// ==================== ROTAS DE ALUNOS ====================

// Listar todos os alunos
app.get('/api/alunos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM alunos ORDER BY id');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar alunos' });
    }
});

// Buscar aluno por ID
app.get('/api/alunos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM alunos WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Aluno não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar aluno' });
    }
});

// Adicionar novo aluno
app.post('/api/alunos', async (req, res) => {
    const { nome, email, telefone, plano } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO alunos (nome, email, telefone, plano) VALUES ($1, $2, $3, $4) RETURNING *',
            [nome, email, telefone, plano || 'Mensal']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao adicionar aluno' });
    }
});

// Atualizar aluno
app.put('/api/alunos/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, email, telefone, plano, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE alunos SET nome = $1, email = $2, telefone = $3, plano = $4, status = $5 WHERE id = $6 RETURNING *',
            [nome, email, telefone, plano, status, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Aluno não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao atualizar aluno' });
    }
});

// Remover aluno
app.delete('/api/alunos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM alunos WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Aluno não encontrado' });
        }
        res.json({ mensagem: 'Aluno removido com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao remover aluno' });
    }
});

// ==================== ROTAS DE HORÁRIOS ====================

// Listar todos os horários
app.get('/api/horarios', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM horarios ORDER BY ordem');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar horários' });
    }
});

// Buscar horário por ID
app.get('/api/horarios/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM horarios WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Horário não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar horário' });
    }
});

// Adicionar novo horário
app.post('/api/horarios', async (req, res) => {
    const { horario, segunda, terca, quarta, quinta, sexta, sabado, ordem } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO horarios (horario, segunda, terca, quarta, quinta, sexta, sabado, ordem) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [horario, segunda || '', terca || '', quarta || '', quinta || '', sexta || '', sabado || '', ordem || 999]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao adicionar horário' });
    }
});

// Atualizar horário
app.put('/api/horarios/:id', async (req, res) => {
    const { id } = req.params;
    const { horario, segunda, terca, quarta, quinta, sexta, sabado, ordem } = req.body;
    try {
        const result = await pool.query(
            'UPDATE horarios SET horario = $1, segunda = $2, terca = $3, quarta = $4, quinta = $5, sexta = $6, sabado = $7, ordem = $8 WHERE id = $9 RETURNING *',
            [horario, segunda || '', terca || '', quarta || '', quinta || '', sexta || '', sabado || '', ordem || 999, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Horário não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao atualizar horário' });
    }
});

// Remover horário
app.delete('/api/horarios/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM horarios WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Horário não encontrado' });
        }
        res.json({ mensagem: 'Horário removido com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao remover horário' });
    }
});

// ==================== ROTAS DE PRESENÇAS (CHECK-IN) ====================

// Registrar presença
app.post('/api/presencas', async (req, res) => {
    const { aluno_id, confirmado_por } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO presencas (aluno_id, confirmado_por) VALUES ($1, $2) RETURNING *',
            [aluno_id, confirmado_por || 'aluno']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao registrar presença' });
    }
});

// Listar presenças de um aluno
app.get('/api/presencas/aluno/:aluno_id', async (req, res) => {
    const { aluno_id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM presencas WHERE aluno_id = $1 ORDER BY data_presenca DESC',
            [aluno_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar presenças' });
    }
});

// ==================== ROTAS DE REDES SOCIAIS ====================

// Listar redes sociais
app.get('/api/redes-sociais', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM redes_sociais WHERE ativo = true');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar redes sociais' });
    }
});

// Rota de teste
app.get('/', (req, res) => {
    res.json({ mensagem: 'API FightCode funcionando!' });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
// ==================== ROTAS PARA ALUNOS (APP) ====================

// Login do aluno
app.post('/api/aluno/login', async (req, res) => {
    const { usuario, senha } = req.body;
    try {
        const result = await pool.query(
            'SELECT * FROM alunos WHERE usuario = $1 AND senha = $2',
            [usuario, senha]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
        }
        const aluno = result.rows[0];
        const token = jwt.sign(
            { id: aluno.id, nome: aluno.nome },
            process.env.JWT_SECRET || 'fightcode_secret_key',
            { expiresIn: '24h' }
        );
        res.json({ sucesso: true, token, aluno: { id: aluno.id, nome: aluno.nome, categoria: aluno.categoria } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro no servidor' });
    }
});

// Buscar dados do aluno
app.get('/api/aluno/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT id, nome, usuario, categoria, total_aulas, faixa_atual, grau_atual, data_nascimento FROM alunos WHERE id = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Aluno não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar aluno' });
    }
});

// Verificar se aluno já fez check-in hoje
app.get('/api/checkin/hoje/:aluno_id', async (req, res) => {
    const { aluno_id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM presencas WHERE aluno_id = $1 AND data_presenca = CURRENT_DATE',
            [aluno_id]
        );
        res.json({ feito: result.rows.length > 0, checkin: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao verificar check-in' });
    }
});

// Realizar check-in
app.post('/api/checkin', async (req, res) => {
    const { aluno_id } = req.body;
    try {
        // Verificar se já fez hoje
        const existente = await pool.query(
            'SELECT * FROM presencas WHERE aluno_id = $1 AND data_presenca = CURRENT_DATE',
            [aluno_id]
        );
        if (existente.rows.length > 0) {
            return res.status(400).json({ erro: 'Você já fez check-in hoje' });
        }
        // Buscar categoria do aluno
        const aluno = await pool.query('SELECT categoria FROM alunos WHERE id = $1', [aluno_id]);
        const categoria = aluno.rows[0]?.categoria || 'adulto';
        // Registrar presença
        const result = await pool.query(
            'INSERT INTO presencas (aluno_id, confirmado_por, categoria_registro) VALUES ($1, $2, $3) RETURNING *',
            [aluno_id, 'aluno_app', categoria]
        );
        // Atualizar total de aulas do aluno
        await pool.query(
            'UPDATE alunos SET total_aulas = total_aulas + 1 WHERE id = $1',
            [aluno_id]
        );
        res.status(201).json({ sucesso: true, presenca: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao registrar presença' });
    }
});

// Listar presenças do dia (todos os alunos)
app.get('/api/presencas/hoje', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT p.*, a.nome FROM presencas p JOIN alunos a ON p.aluno_id = a.id WHERE p.data_presenca = CURRENT_DATE ORDER BY p.hora_presenca'
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar presenças' });
    }
});

// Calcular graduação do aluno
app.get('/api/graduacao/:aluno_id', async (req, res) => {
    const { aluno_id } = req.params;
    try {
        const aluno = await pool.query('SELECT total_aulas, faixa_atual, grau_atual, categoria FROM alunos WHERE id = $1', [aluno_id]);
        const totalAulas = aluno.rows[0]?.total_aulas || 0;
        const categoria = aluno.rows[0]?.categoria || 'adulto';
        // Buscar configurações de graduação
        const configs = await pool.query(
            'SELECT * FROM graduacoes_config WHERE categoria = $1 ORDER BY graus_needed',
            [categoria]
        );
        let faixaAtual = 'Branca';
        let grauAtual = 0;
        let aulasNecessarias = 0;
        let proximaFaixa = '---';
        for (let i = 0; i < configs.rows.length; i++) {
            if (totalAulas >= configs.rows[i].graus_needed) {
                faixaAtual = configs.rows[i].faixa;
                grauAtual = Math.floor(totalAulas / configs.rows[i].graus_needed) % 4;
                aulasNecessarias = configs.rows[i + 1]?.graus_needed || configs.rows[i].graus_needed;
                proximaFaixa = configs.rows[i + 1]?.faixa || 'Preta';
            }
        }
        res.json({
            faixa: faixaAtual,
            grau_atual: grauAtual,
            aulas_feitas: totalAulas,
            aulas_necessarias: aulasNecessarias,
            aulas_restantes: Math.max(0, aulasNecessarias - (totalAulas % aulasNecessarias)),
            proxima_faixa: proximaFaixa,
            detalhes: `Você tem ${totalAulas} aulas. Continue treinando para evoluir!`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao calcular graduação' });
    }
});

// Listar ocorrências do aluno
app.get('/api/ocorrencias/:aluno_id', async (req, res) => {
    const { aluno_id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM ocorrencias WHERE aluno_id = $1 ORDER BY data DESC',
            [aluno_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar ocorrências' });
    }
});

// Adicionar ocorrência (pelo professor)
app.post('/api/ocorrencias', async (req, res) => {
    const { aluno_id, titulo, descricao, criado_por } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO ocorrencias (aluno_id, titulo, descricao, criado_por) VALUES ($1, $2, $3, $4) RETURNING *',
            [aluno_id, titulo, descricao, criado_por || 'professor']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao adicionar ocorrência' });
    }
});

// Alterar senha do aluno
app.put('/api/aluno/alterar-senha', async (req, res) => {
    const { aluno_id, nova_senha } = req.body;
    try {
        await pool.query('UPDATE alunos SET senha = $1 WHERE id = $2', [nova_senha, aluno_id]);
        res.json({ sucesso: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao alterar senha' });
    }
});
