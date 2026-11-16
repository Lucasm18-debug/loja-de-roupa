const tbody = document.getElementById('lista');
const totalEl = document.getElementById('total');
const busca = document.getElementById('busca');
const vazio = document.getElementById('vazio');
const vazioTexto = document.getElementById('vazio-texto');
const tabela = document.getElementById('tabela');
const msg = document.getElementById('msg');
const dlg = document.getElementById('dlg');
let alvo = null;

async function carregar() {
  try {
    const { total, clientes } = await api.listar(busca.value.trim());
    totalEl.textContent = total;
    tbody.innerHTML = clientes.map((c) => `<tr>
      <td data-label="ID">${c.id}</td>
      <td data-label="Nome">${esc(c.nome)}</td>
      <td data-label="E-mail">${esc(c.email)}</td>
      <td data-label="Telefone">${esc(c.telefone)}</td>
      <td data-label="Endereço">${esc(c.endereco)}</td>
      <td data-label="Ações"><div class="acoes">
        <a class="btn btn-ghost btn-sm" href="cadastro.html?id=${c.id}">Editar</a>
        <button class="btn btn-danger btn-sm" type="button" data-excluir="${c.id}" data-nome="${esc(c.nome)}">Excluir</button>
      </div></td></tr>`).join('');
    tabela.hidden = !clientes.length;
    vazio.hidden = clientes.length > 0;
    vazioTexto.textContent = busca.value.trim() ? 'Nenhum cliente encontrado para essa busca.' : 'Nenhum cliente cadastrado ainda.';
  } catch (e) {
    avisar(msg, 'err', e.message);
  }
}

let timer;
busca.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(carregar, 250); });

tbody.addEventListener('click', (e) => {
  const b = e.target.closest('[data-excluir]');
  if (!b) return;
  alvo = { id: b.dataset.excluir, nome: b.dataset.nome };
  document.getElementById('dlg-texto').textContent = `${alvo.nome} será removido permanentemente. Essa ação não pode ser desfeita.`;
  dlg.returnValue = '';
  dlg.showModal();
});

dlg.addEventListener('close', async () => {
  if (dlg.returnValue !== 'excluir' || !alvo) return;
  try {
    await api.excluir(alvo.id);
    avisar(msg, 'ok', `Cliente ${alvo.nome} excluído.`);
  } catch (e) {
    avisar(msg, 'err', e.message);
  }
  alvo = null;
  carregar();
});

carregar();
