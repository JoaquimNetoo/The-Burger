# THE BURGER 

Sistema full-stack de pedidos para hamburgueria, implementando um pipeline completo de compra (catálogo → carrinho → checkout → acompanhamento de status), com frontend e backend desacoplados.

![Interface do The Burger](docs/interface/homepage.png)

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
