const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
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

// Configurar Nodemailer (envio de e-mail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
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

// ==================== ROTAS DE E-MAIL ====================

// Enviar e-mail com nova senha
app.post('/api/enviar-senha', async (req, res) => {
    const { email, nome, novaSenha, tipo } = req.body;
    
    if (!email) {
        return res.status(400).json({ erro: 'E-mail não informado' });
    }
    
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `FightCode - Sua nova senha de acesso (${tipo === 'aluno' ? 'Aluno' : 'Professor'})`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="https://fightcode-web.onrender.com/assets/img/banner/logo.jpeg" alt="FightCode" style="height: 80px;">
                    </div>
                    <h2 style="color: #E53935; text-align: center;">Olá, ${nome}!</h2>
                    <p>Sua senha foi redefinida com sucesso.</p>
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <strong style="font-size: 18px;">Nova senha: ${novaSenha}</strong>
                    </div>
                    <p style="color: #666; font-size: 12px;">Recomendamos que você altere sua senha após o primeiro acesso.</p>
                    <hr style="margin: 20px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">FightCode - Tecnologia para evoluir lutadores</p>
                </div>
            `
        };
        
        await transporter.sendMail(mailOptions);
        res.json({ sucesso: true, mensagem: 'E-mail enviado com sucesso!' });
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        res.status(500).json({ erro: 'Erro ao enviar e-mail: ' + error.message });
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
        const result = await pool.query('SELECT id, nome, especialidade, imagem_url, ordem, ativo, email, telefone, horario_trabalho, usuario FROM professores WHERE ativo = true ORDER BY ordem ASC, id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar professores:', error);
        res.status(500).json({ erro: 'Erro ao buscar professores' });
    }
});

// Buscar professor por ID
app.get('/api/professores/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT id, nome, especialidade, imagem_url, ordem, email, telefone, horario_trabalho, usuario FROM professores WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Professor não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar professor:', error);
        res.status(500).json({ erro: 'Erro ao buscar professor' });
    }
});

// Adicionar novo professor
app.post('/api/professores', async (req, res) => {
    const { nome, especialidade, imagem_url, ordem, email, telefone, horario_trabalho, usuario, senha } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO professores (nome, especialidade, imagem_url, ordem, ativo, email, telefone, horario_trabalho, usuario, senha) 
             VALUES ($1, $2, $3, $4, true, $5, $6, $7, $8, $9) RETURNING *`,
            [nome, especialidade, imagem_url || null, ordem || 999, email || null, telefone || null, horario_trabalho || null, usuario || nome.toLowerCase().replace(/\s/g, ''), senha || '123456']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao adicionar professor:', error);
        res.status(500).json({ erro: 'Erro ao adicionar professor' });
    }
});

// Atualizar professor
app.put('/api/professores/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, especialidade, imagem_url, ordem, email, telefone, horario_trabalho, usuario, senha } = req.body;
    
    try {
        let query, params;
        if (senha) {
            query = `UPDATE professores SET 
                nome = $1, 
                especialidade = $2, 
                imagem_url = COALESCE($3, imagem_url), 
                ordem = $4, 
                email = $5, 
                telefone = $6, 
                horario_trabalho = $7, 
                usuario = $8, 
                senha = $9 
            WHERE id = $10 RETURNING *`;
            params = [nome, especialidade, imagem_url, ordem, email, telefone, horario_trabalho, usuario, senha, id];
        } else {
            query = `UPDATE professores SET 
                nome = $1, 
                especialidade = $2, 
                imagem_url = COALESCE($3, imagem_url), 
                ordem = $4, 
                email = $5, 
                telefone = $6, 
                horario_trabalho = $7, 
                usuario = $8 
            WHERE id = $9 RETURNING *`;
            params = [nome, especialidade, imagem_url, ordem, email, telefone, horario_trabalho, usuario, id];
        }
        
        const result = await pool.query(query, params);
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Professor não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar professor:', error);
        res.status(500).json({ erro: 'Erro ao atualizar professor' });
    }
});

// Remover professor
app.delete('/api/professores/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('UPDATE professores SET ativo = false WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Professor não encontrado' });
        }
        res.json({ mensagem: 'Professor removido com sucesso' });
    } catch (error) {
        console.error('Erro ao remover professor:', error);
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
    const { nome, email, telefone, plano, categoria, usuario, senha } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO alunos (nome, email, telefone, plano, categoria, usuario, senha, total_aulas) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [nome, email, telefone, plano || 'Mensal', categoria || 'adulto', usuario, senha || '123456', 0]
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
    const { nome, email, telefone, plano, status, categoria, usuario, senha } = req.body;
    
    try {
        const checkAluno = await pool.query('SELECT * FROM alunos WHERE id = $1', [id]);
        if (checkAluno.rows.length === 0) {
            return res.status(404).json({ erro: 'Aluno não encontrado' });
        }
        
        if (senha) {
            const result = await pool.query(
                `UPDATE alunos SET 
                    nome = $1, 
                    email = $2, 
                    telefone = $3, 
                    plano = $4, 
                    status = $5, 
                    categoria = $6, 
                    usuario = $7, 
                    senha = $8 
                WHERE id = $9 RETURNING *`,
                [nome, email, telefone, plano, status, categoria, usuario, senha, id]
            );
            return res.json(result.rows[0]);
        } else {
            const result = await pool.query(
                `UPDATE alunos SET 
                    nome = $1, 
                    email = $2, 
                    telefone = $3, 
                    plano = $4, 
                    status = $5, 
                    categoria = $6, 
                    usuario = $7 
                WHERE id = $8 RETURNING *`,
                [nome, email, telefone, plano, status, categoria, usuario, id]
            );
            return res.json(result.rows[0]);
        }
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

// Realizar check-in (agora fica pendente)
app.post('/api/checkin', async (req, res) => {
    const { aluno_id } = req.body;
    try {
        // Verificar se já fez hoje
        const existente = await pool.query(
            'SELECT * FROM presencas WHERE aluno_id = $1 AND data_presenca = CURRENT_DATE',
            [aluno_id]
        );
        if (existente.rows.length > 0) {
            return res.status(400).json({ erro: 'Você já solicitou check-in hoje' });
        }
        
        // Buscar categoria do aluno
        const aluno = await pool.query('SELECT categoria FROM alunos WHERE id = $1', [aluno_id]);
        const categoria = aluno.rows[0]?.categoria || 'adulto';
        
        // Registrar presença como PENDENTE
        const result = await pool.query(
            `INSERT INTO presencas (aluno_id, confirmado_por, categoria_registro, status) 
             VALUES ($1, $2, $3, 'pendente') RETURNING *`,
            [aluno_id, 'aluno_app', categoria]
        );
        
        res.status(201).json({ 
            sucesso: true, 
            mensagem: 'Solicitação enviada! Aguarde a confirmação do professor.',
            presenca: result.rows[0] 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao registrar solicitação' });
    }
});

// Verificar status do check-in de hoje
app.get('/api/checkin/status/:aluno_id', async (req, res) => {
    const { aluno_id } = req.params;
    try {
        const result = await pool.query(
            `SELECT status, id FROM presencas 
             WHERE aluno_id = $1 AND data_presenca = CURRENT_DATE`,
            [aluno_id]
        );
        if (result.rows.length === 0) {
            return res.json({ status: 'nenhum', mensagem: 'Nenhuma solicitação hoje' });
        }
        const status = result.rows[0].status;
        let mensagem = '';
        if (status === 'pendente') mensagem = '⏳ Solicitação enviada. Aguardando aprovação do professor.';
        else if (status === 'aprovado') mensagem = '✅ Presença confirmada!';
        else if (status === 'rejeitado') mensagem = '❌ Solicitação rejeitada.';
        res.json({ status, mensagem, id: result.rows[0].id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao verificar status' });
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

// ==================== ROTAS PARA PROFESSORES (LOGIN) ====================

// Login do professor
app.post('/api/professor/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const result = await pool.query(
            'SELECT id, nome, email, usuario, senha, horario_trabalho, imagem_url FROM professores WHERE (email = $1 OR usuario = $1) AND senha = $2 AND ativo = true',
            [email, senha]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ erro: 'Email ou senha inválidos' });
        }
        
        const professor = result.rows[0];
        const token = jwt.sign(
            { id: professor.id, nome: professor.nome, email: professor.email },
            process.env.JWT_SECRET || 'fightcode_secret_key',
            { expiresIn: '24h' }
        );
        
        res.json({ 
            sucesso: true, 
            token, 
            professor: { 
                id: professor.id, 
                nome: professor.nome, 
                email: professor.email,
                usuario: professor.usuario
            } 
        });
    } catch (error) {
        console.error('Erro no login do professor:', error);
        res.status(500).json({ erro: 'Erro no servidor' });
    }
});

// Buscar perfil do professor
app.get('/api/professor/perfil/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT id, nome, email, usuario, horario_trabalho, imagem_url, telefone FROM professores WHERE id = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Professor não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({ erro: 'Erro ao buscar perfil' });
    }
});

// Atualizar perfil do professor
app.put('/api/professor/perfil/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, email, horario, senha } = req.body;
    try {
        if (senha) {
            await pool.query(
                'UPDATE professores SET nome = $1, email = $2, horario_trabalho = $3, senha = $4 WHERE id = $5',
                [nome, email, horario, senha, id]
            );
        } else {
            await pool.query(
                'UPDATE professores SET nome = $1, email = $2, horario_trabalho = $3 WHERE id = $4',
                [nome, email, horario, id]
            );
        }
        res.json({ sucesso: true });
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ erro: 'Erro ao atualizar perfil' });
    }
});

// Buscar solicitações de check-in pendentes
app.get('/api/presencas/pendentes', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, a.nome as aluno_nome, a.categoria 
             FROM presencas p 
             JOIN alunos a ON p.aluno_id = a.id 
             WHERE p.status = 'pendente' AND p.data_presenca = CURRENT_DATE 
             ORDER BY p.hora_presenca`
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar solicitações' });
    }
});

// Aprovar check-in
app.put('/api/presencas/aprovar/:id', async (req, res) => {
    const { id } = req.params;
    const { professor_id } = req.body;
    try {
        const result = await pool.query(
            `UPDATE presencas 
             SET status = 'aprovado', professor_id = $1, data_aprovacao = CURRENT_DATE 
             WHERE id = $2 RETURNING *`,
            [professor_id, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Solicitação não encontrada' });
        }
        res.json({ sucesso: true, presenca: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao aprovar check-in' });
    }
});

// Rejeitar check-in
app.put('/api/presencas/rejeitar/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `UPDATE presencas 
             SET status = 'rejeitado' 
             WHERE id = $1 RETURNING *`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Solicitação não encontrada' });
        }
        res.json({ sucesso: true, presenca: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao rejeitar check-in' });
    }
});

// Buscar total de aulas do aluno (para o professor)
app.get('/api/aluno/total-aulas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT nome, total_aulas, categoria FROM alunos WHERE id = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Aluno não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar total de aulas' });
    }
});

// ==================== ROTA DE TESTE ====================

app.get('/', (req, res) => {
    res.json({ mensagem: 'API FightCode funcionando!' });
});

// ==================== INICIAR SERVIDOR ====================

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
