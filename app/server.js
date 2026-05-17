const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do banco de dados
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'chatuser',
  password: process.env.DB_PASSWORD || 'chatpass',
  database: process.env.DB_NAME || 'chatdb',
});

// Função para aguardar o banco de dados estar disponível
async function waitForDatabase(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      console.log('✅ Banco de dados conectado com sucesso!');
      client.release();
      return true;
    } catch (err) {
      console.log(`⏳ Aguardando banco de dados... tentativa ${i + 1}/${retries}`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error('❌ Não foi possível conectar ao banco de dados após várias tentativas.');
}

// Inicializar banco de dados (criar tabelas se não existirem)
async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS mensagens (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        conteudo TEXT NOT NULL,
        enviado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Tabelas criadas/verificadas com sucesso!');
  } finally {
    client.release();
  }
}

// ─────────────────────────────────────────────
// ROTAS DE USUÁRIOS
// ─────────────────────────────────────────────

// Cadastrar usuário (CREATE)
app.post('/api/usuarios', async (req, res) => {
  const { nome, username } = req.body;
  if (!nome || !username) {
    return res.status(400).json({ erro: 'Nome e username são obrigatórios.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nome, username) VALUES ($1, $2) RETURNING *',
      [nome, username]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      res.status(409).json({ erro: 'Username já existe.' });
    } else {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
    }
  }
});

// Listar usuários (READ)
app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios ORDER BY criado_em DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar usuários.' });
  }
});

// Deletar usuário (DELETE)
app.delete('/api/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    res.json({ mensagem: 'Usuário removido com sucesso.', usuario: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao remover usuário.' });
  }
});

// ─────────────────────────────────────────────
// ROTAS DE MENSAGENS
// ─────────────────────────────────────────────

// Enviar mensagem (CREATE)
app.post('/api/mensagens', async (req, res) => {
  const { usuario_id, conteudo } = req.body;
  if (!usuario_id || !conteudo) {
    return res.status(400).json({ erro: 'usuario_id e conteudo são obrigatórios.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO mensagens (usuario_id, conteudo) VALUES ($1, $2) RETURNING *',
      [usuario_id, conteudo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao enviar mensagem.' });
  }
});

// Listar mensagens com dados do usuário (READ)
app.get('/api/mensagens', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.id, m.conteudo, m.enviado_em, u.nome, u.username
      FROM mensagens m
      JOIN usuarios u ON m.usuario_id = u.id
      ORDER BY m.enviado_em ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar mensagens.' });
  }
});

// Deletar mensagem (DELETE)
app.delete('/api/mensagens/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM mensagens WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Mensagem não encontrada.' });
    }
    res.json({ mensagem: 'Mensagem removida com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao remover mensagem.' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', banco: 'Conectado', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'ERRO', banco: 'Desconectado' });
  }
});

// Iniciar servidor
(async () => {
  try {
    await waitForDatabase();
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();
