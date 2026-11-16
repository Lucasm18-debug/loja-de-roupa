// Utilitários compartilhados: cliente da API, cabeçalho, rodapé e mensagens

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function requisicao(url, opcoes = {}) {
  let res;
  try {
    res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opcoes });
  } catch {
    throw new Error('Não foi possível falar com o servidor. Confirme se ele está rodando (npm start).');
  }
  const dados = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(dados.erro || 'Não foi possível concluir a operação.');
  return dados;
}

const api = {
  listar: (busca = '') => requisicao('/api/clientes?busca=' + encodeURIComponent(busca)),
  obter: (id) => requisicao('/api/clientes/' + encodeURIComponent(id)),
  criar: (d) => requisicao('/api/clientes', { method: 'POST', body: JSON.stringify(d) }),
  atualizar: (id, d) => requisicao('/api/clientes/' + encodeURIComponent(id), { method: 'PUT', body: JSON.stringify(d) }),
  excluir: (id) => requisicao('/api/clientes/' + encodeURIComponent(id), { method: 'DELETE' }),
};

function avisar(el, tipo, texto) {
  el.className = 'alert ' + tipo;
  el.textContent = texto;
  el.hidden = false;
}

(function montarLayout() {
  const atual = location.pathname.split('/').pop() || 'index.html';
  const links = [['index.html', 'Início'], ['cadastro.html', 'Cadastro'], ['clientes.html', 'Clientes']];
  const topo = document.getElementById('site-header');
  const rodape = document.getElementById('site-footer');
  if (topo) {
    topo.innerHTML = `<div class="container bar"><a class="logo" href="index.html">URBAN STYLE</a>
      <nav aria-label="Principal">${links.map(([u, t]) => `<a href="${u}"${u === atual ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav></div>`;
  }
  if (rodape) {
    rodape.innerHTML = `<div class="container foot"><a class="logo" href="index.html">URBAN STYLE</a>
      <span>© ${new Date().getFullYear()} URBAN STYLE. Projeto acadêmico de Desenvolvimento Front-End para Web.</span></div>`;
  }
})();
