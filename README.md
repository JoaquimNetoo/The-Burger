# The Burger 🍔

Sistema full-stack de pedidos para hamburgueria, implementando um pipeline completo de compra (catálogo → carrinho → checkout → acompanhamento de status), com frontend e backend desacoplados.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite |
| Backend | FastAPI (ASGI, Python 3.12) |
| ORM | SQLAlchemy |
| Banco de dados | PostgreSQL 16 |
| Validação de schema | Pydantic |
| Infraestrutura local | Docker Compose |
| Servidor ASGI | Uvicorn |

## Modelo de dados

### `produtos`
| Coluna | Tipo | Descrição |
|---|---|---|
| id | Integer (PK) | Identificador |
| nome | String | Nome do produto |
| descricao | String | Descrição |
| preco | Float | Preço unitário atual |
| categoria | String | `hamburguer` \| `bebida` |
| imagem | String (nullable) | Caminho relativo em `static/` |

### `pedidos`
| Coluna | Tipo | Descrição |
|---|---|---|
| id | Integer (PK) | Identificador |
| status | Enum | `aguardando` \| `aceito` \| `cancelado` \| `saiu_para_entrega` \| `entregue` |
| total | Float | Total calculado no backend (não confiável se enviado pelo cliente) |
| criado_em | DateTime | Timestamp de criação |

### `itens_pedido`
| Coluna | Tipo | Descrição |
|---|---|---|
| id | Integer (PK) | Identificador |
| pedido_id | Integer (FK → pedidos.id) | Pedido ao qual pertence |
| produto_id | Integer (FK → produtos.id) | Produto de referência |
| nome | String | Nome do produto **no momento da compra** (snapshot) |
| preco_unitario | Float | Preço **no momento da compra** (snapshot) |
| quantidade | Integer | Quantidade pedida |

> `nome` e `preco_unitario` são desnormalizados propositalmente em `itens_pedido`: um pedido não pode ser afetado retroativamente por alterações futuras no catálogo de produtos.

Relação `Pedido` 1—N `ItemPedido`, com `cascade="all, delete-orphan"`.

## API

Base URL local: `http://localhost:8000`. Documentação OpenAPI interativa em `/docs` (Swagger UI) e `/redoc`.

| Método | Rota | Body | Response | Descrição |
|---|---|---|---|---|
| GET | `/produtos/hamburgueres` | — | `ProdutoOut[]` | Lista produtos da categoria `hamburguer` |
| GET | `/produtos/bebidas` | — | `ProdutoOut[]` | Lista produtos da categoria `bebida` |
| POST | `/pedidos` | `PedidoCreate` | `PedidoOut` | Cria pedido + itens em transação única |
| GET | `/pedidos/{id}` | — | `PedidoOut` | Consulta um pedido por ID |
| PATCH | `/pedidos/{id}/status` | `StatusUpdate` | `PedidoOut` | Atualiza o status de um pedido |

**Exemplo — `POST /pedidos`:**
```json
{
  "itens": [
    { "produto_id": 1, "nome": "X-Burger", "preco_unitario": 22.5, "quantidade": 2 }
  ]
}
```

**Resposta:**
```json
{
  "id": 14,
  "status": "aguardando",
  "total": 45.0,
  "criado_em": "2026-07-12T21:24:41.304568",
  "itens": [
    { "id": 20, "produto_id": 1, "nome": "X-Burger", "preco_unitario": 22.5, "quantidade": 2 }
  ]
}
```

### Detalhes de implementação relevantes

- A criação de pedido usa `db.flush()` para obter o `id` gerado pelo Postgres antes de inserir os itens dependentes (FK), seguido de `db.commit()` único — pedido e itens são gravados atomicamente na mesma transação.
- O campo `total` é sempre recalculado no servidor a partir de `preco_unitario × quantidade`, nunca aceito diretamente do cliente.
- O enum `StatusPedido` é validado tanto em nível de aplicação (Pydantic) quanto de banco (tipo `ENUM` nativo do Postgres).

## Estrutura do projeto

```
The-Burger/
├── backend/
│   ├── main.py          # Definição de rotas e regras de negócio
│   ├── models.py        # Entidades SQLAlchemy (Produto, Pedido, ItemPedido, StatusPedido)
│   ├── schemas.py        # Contratos Pydantic de entrada/saída
│   ├── database.py       # Engine, SessionLocal, dependency get_db()
│   ├── static/            # Assets de imagem servidos publicamente
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── pages/Cardapio/  # Componente principal (catálogo, carrinho, checkout)
│       └── assets/
├── docker-compose.yml    # Provisionamento do PostgreSQL
└── LICENSE
```

## Setup local

### Requisitos
- Python ≥ 3.12
- Node.js ≥ 18
- Docker + Docker Compose

### 1. Banco de dados

```bash
docker compose up -d
```

Sobe PostgreSQL 16 em `localhost:5432` com as credenciais definidas em `docker-compose.yml`.

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Crie `backend/.env`:
```
DATABASE_URL=postgresql://burger:burger123@localhost:5432/burger_db
```

```bash
uvicorn main:app --reload
```

Tabelas são criadas automaticamente no import de `main.py` via `Base.metadata.create_all(bind=engine)` — não há sistema de migrations (Alembic) neste projeto.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Servido em `http://localhost:5173`.

## Licença

Distribuído sob a licença MIT. Veja [LICENSE](LICENSE) para o texto completo.
