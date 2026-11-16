# URBAN STYLE

Loja fictícia de roupas com CRUD de clientes: HTML5, CSS3 e JavaScript puro no front-end; Node.js, Express, mysql2, body-parser e dotenv no back-end; MySQL como banco.

## Como executar

1. Instale o Node.js 18+ e o MySQL.
2. Crie o banco e a tabela: `mysql -u root -p < database/database.sql`
3. Copie `.env.example` para `.env` e informe usuário e senha do MySQL.
4. Instale e inicie: `npm install` e `npm start`
5. Abra http://localhost:3000

## API

| Método | Rota | Operação |
|---|---|---|
| GET | /api/clientes?busca= | Lista clientes (busca por nome ou e-mail) e total |
| GET | /api/clientes/:id | Consulta um cliente |
| POST | /api/clientes | Cadastra |
| PUT | /api/clientes/:id | Altera |
| DELETE | /api/clientes/:id | Exclui |

## Estrutura

```
server.js            servidor Express e rotas
database/database.sql
public/              index.html, cadastro.html, clientes.html
public/css/style.css
public/js/           common.js, cadastro.js, clientes.js
```
