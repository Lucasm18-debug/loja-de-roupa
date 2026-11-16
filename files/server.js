require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// Pool de conexões com o MySQL (credenciais vindas do arquivo .env)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'urban_style',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);
const idValido = (v) => /^\d+$/.test(v);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Validação e limpeza dos dados recebidos
function validar(corpo = {}) {
  const d = {
    nome: String(corpo.nome || '').trim(),
    email: String(corpo.email || '').trim().toLowerCase(),
    telefone: String(corpo.telefone || '').trim(),
    endereco: String(corpo.endereco || '').trim(),
  };
  const erros = [];
  if (d.nome.length < 3 || d.nome.length > 100) erros.push('Informe o nome completo (3 a 100 caracteres).');
  if (!EMAIL.test(d.email) || d.email.length > 150) erros.push('Informe um e-mail válido.');
  const digitos = d.telefone.replace(/\D/g, '');
  if (digitos.length < 10 || digitos.length > 11 || d.telefone.length > 20) erros.push('Informe um telefone com DDD.');
  if (d.endereco.length < 5 || d.endereco.length > 200) erros.push('Informe o endereço (5 a 200 caracteres).');
  return { d, erros };
}

// READ - lista (com busca opcional por nome ou e-mail) e total geral
app.get('/api/clientes', wrap(async (req, res) => {
  const busca = String(req.query.busca || '').trim();
  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM clientes');
  let sql = 'SELECT id, nome, email, telefone, endereco FROM clientes';
  const params = [];
  if (busca) {
    sql += ' WHERE nome LIKE ? OR email LIKE ?';
    params.push(`%${busca}%`, `%${busca}%`);
  }
  const [clientes] = await pool.query(`${sql} ORDER BY id DESC`, params);
  res.json({ total, clientes });
}));

// READ - um cliente
app.get('/api/clientes/:id', wrap(async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido.' });
  const [linhas] = await pool.query('SELECT id, nome, email, telefone, endereco FROM clientes WHERE id = ?', [req.params.id]);
  if (!linhas.length) return res.status(404).json({ erro: 'Cliente não encontrado.' });
  res.json(linhas[0]);
}));

// CREATE
app.post('/api/clientes', wrap(async (req, res) => {
  const { d, erros } = validar(req.body);
  if (erros.length) return res.status(400).json({ erro: erros.join(' ') });
  const [r] = await pool.query(
    'INSERT INTO clientes (nome, email, telefone, endereco) VALUES (?, ?, ?, ?)',
    [d.nome, d.email, d.telefone, d.endereco]
  );
  res.status(201).json({ id: r.insertId, ...d });
}));

// UPDATE
app.put('/api/clientes/:id', wrap(async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido.' });
  const { d, erros } = validar(req.body);
  if (erros.length) return res.status(400).json({ erro: erros.join(' ') });
  const [r] = await pool.query(
    'UPDATE clientes SET nome = ?, email = ?, telefone = ?, endereco = ? WHERE id = ?',
    [d.nome, d.email, d.telefone, d.endereco, req.params.id]
  );
  if (!r.affectedRows) return res.status(404).json({ erro: 'Cliente não encontrado.' });
  res.json({ id: Number(req.params.id), ...d });
}));

// DELETE
app.delete('/api/clientes/:id', wrap(async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido.' });
  const [r] = await pool.query('DELETE FROM clientes WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ erro: 'Cliente não encontrado.' });
  res.json({ ok: true });
}));

app.use('/api', (req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ erro: 'JSON inválido.' });
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
  console.error(err);
  res.status(500).json({ erro: 'Erro interno. Verifique a conexão com o banco de dados.' });
});

app.listen(PORT, async () => {
  console.log(`URBAN STYLE rodando em http://localhost:${PORT}`);
  try {
    await pool.query('SELECT 1');
    console.log('MySQL conectado.');
  } catch (e) {
    console.error('Falha ao conectar no MySQL:', e.message);
  }
});
