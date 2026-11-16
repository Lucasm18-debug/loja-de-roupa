// MODO DE TESTE: mesma API do server.js, mas salva os clientes em um arquivo JSON (sem MySQL).
// Use apenas para ver o sistema funcionando. Para a entrega do trabalho, use o server.js com MySQL.
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const ARQUIVO = path.join(__dirname, 'database', 'dados-teste.json');

let clientes = [];
try { clientes = JSON.parse(fs.readFileSync(ARQUIVO, 'utf8')); } catch { /* primeira execução */ }
const salvar = () => fs.writeFileSync(ARQUIVO, JSON.stringify(clientes, null, 2));
const proximoId = () => clientes.reduce((m, c) => Math.max(m, c.id), 0) + 1;
const emailEmUso = (email, ignorarId) => clientes.some((c) => c.email === email && c.id !== ignorarId);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
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

app.get('/api/clientes', (req, res) => {
  const busca = String(req.query.busca || '').trim().toLowerCase();
  const lista = clientes
    .filter((c) => !busca || c.nome.toLowerCase().includes(busca) || c.email.includes(busca))
    .sort((a, b) => b.id - a.id);
  res.json({ total: clientes.length, clientes: lista });
});

app.get('/api/clientes/:id', (req, res) => {
  const c = clientes.find((x) => x.id === Number(req.params.id));
  if (!c) return res.status(404).json({ erro: 'Cliente não encontrado.' });
  res.json(c);
});

app.post('/api/clientes', (req, res) => {
  const { d, erros } = validar(req.body);
  if (erros.length) return res.status(400).json({ erro: erros.join(' ') });
  if (emailEmUso(d.email)) return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
  const novo = { id: proximoId(), ...d };
  clientes.push(novo);
  salvar();
  res.status(201).json(novo);
});

app.put('/api/clientes/:id', (req, res) => {
  const id = Number(req.params.id);
  const i = clientes.findIndex((x) => x.id === id);
  if (i < 0) return res.status(404).json({ erro: 'Cliente não encontrado.' });
  const { d, erros } = validar(req.body);
  if (erros.length) return res.status(400).json({ erro: erros.join(' ') });
  if (emailEmUso(d.email, id)) return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
  clientes[i] = { id, ...d };
  salvar();
  res.json(clientes[i]);
});

app.delete('/api/clientes/:id', (req, res) => {
  const i = clientes.findIndex((x) => x.id === Number(req.params.id));
  if (i < 0) return res.status(404).json({ erro: 'Cliente não encontrado.' });
  clientes.splice(i, 1);
  salvar();
  res.json({ ok: true });
});

app.use('/api', (req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ erro: 'JSON inválido.' });
  console.error(err);
  res.status(500).json({ erro: 'Erro interno.' });
});

app.listen(PORT, () => {
  console.log(`URBAN STYLE (MODO DE TESTE, sem MySQL) em http://localhost:${PORT}`);
  console.log('Os clientes ficam salvos em database/dados-teste.json');
});
