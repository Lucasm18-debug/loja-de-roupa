const form = document.getElementById('form-cliente');
const msg = document.getElementById('msg');
const botao = document.getElementById('btn-salvar');
const nota = document.getElementById('nota-edicao');
const editId = new URLSearchParams(location.search).get('id');
const campos = ['nome', 'email', 'telefone', 'endereco'];

const regras = {
  nome: (v) => (v.length < 3 ? 'Informe o nome completo.' : ''),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Informe um e-mail válido, como nome@exemplo.com.'),
  telefone: (v) => { const n = v.replace(/\D/g, ''); return n.length < 10 || n.length > 11 ? 'Informe o telefone com DDD.' : ''; },
  endereco: (v) => (v.length < 5 ? 'Informe o endereço completo.' : ''),
};

function mascara(v) {
  const n = v.replace(/\D/g, '').slice(0, 11);
  if (n.length <= 2) return n ? `(${n}` : '';
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
}

function erroCampo(nome, texto) {
  document.getElementById('erro-' + nome).textContent = texto;
  form.elements[nome].setAttribute('aria-invalid', texto ? 'true' : 'false');
}

form.elements.telefone.addEventListener('input', (e) => { e.target.value = mascara(e.target.value); });
campos.forEach((c) => form.elements[c].addEventListener('input', () => erroCampo(c, '')));

document.getElementById('btn-limpar').addEventListener('click', () => {
  form.reset();
  campos.forEach((c) => erroCampo(c, ''));
  msg.hidden = true;
  form.elements.nome.focus();
});

// Modo edição: carrega o cliente do banco e troca o texto do botão
if (editId) {
  botao.textContent = 'Salvar Alterações';
  api.obter(editId)
    .then((c) => {
      campos.forEach((k) => { form.elements[k].value = c[k]; });
      nota.textContent = `Editando o cliente #${c.id}.`;
      nota.hidden = false;
    })
    .catch((e) => { avisar(msg, 'err', e.message); botao.disabled = true; });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.hidden = true;
  const dados = Object.fromEntries(campos.map((c) => [c, form.elements[c].value.trim()]));
  const invalidos = campos.filter((c) => { const t = regras[c](dados[c]); erroCampo(c, t); return t; });
  if (invalidos.length) {
    form.elements[invalidos[0]].focus();
    return avisar(msg, 'err', 'Corrija os campos destacados.');
  }
  botao.disabled = true;
  let ok = false;
  try {
    if (editId) {
      await api.atualizar(editId, dados);
      avisar(msg, 'ok', 'Alterações salvas. Voltando para a lista de clientes…');
      setTimeout(() => { location.href = 'clientes.html'; }, 1200);
    } else {
      await api.criar(dados);
      avisar(msg, 'ok', `Cliente ${dados.nome} cadastrado com sucesso.`);
      form.reset();
    }
    ok = true;
  } catch (err) {
    avisar(msg, 'err', err.message);
  } finally {
    botao.disabled = ok && !!editId;
  }
});
