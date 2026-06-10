const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

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

// ==================== ROTAS DE CONFIGURAÇÕES ====================

// Buscar configurações do site (com e sem barra)
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

app.get('/api/configuracoes/', async (req, res) => {
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

// ==================== ROTAS DE HORÁRIOS ====================

// Listar todos os horários
app.get('/api/horarios', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM horarios ORDER BY ordem'
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar horários' });
    }
});

app.get('/api/horarios/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM horarios ORDER BY ordem'
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar horários' });
    }
});

// ==================== ROTAS DE PROFESSORES ====================

// Listar todos os professores
app.get('/api/professores', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM professores WHERE ativo = true ORDER BY ordem'
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar professores' });
    }
});

app.get('/api/professores/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM professores WHERE ativo = true ORDER BY ordem'
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar professores' });
    }
});

// ==================== ROTAS DE PRODUTOS ====================

// Listar todos os produtos
app.get('/api/produtos', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM produtos WHERE ativo = true ORDER BY ordem'
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar produtos' });
    }
});

app.get('/api/produtos/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM produtos WHERE ativo = true ORDER BY ordem'
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar produtos' });
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

// Rota de teste
app.get('/', (req, res) => {
    res.json({ mensagem: 'API FightCode funcionando!' });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
