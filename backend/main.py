from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from database import get_db, Base, engine
from models import Produto, Pedido, ItemPedido, StatusPedido as StatusPedidoModel, Admin
from schemas import ProdutoOut, PedidoOut, PedidoCreate, StatusUpdate, LoginRequest, TokenResponse
from auth import verificar_token, verificar_senha, criar_token

Base.metadata.create_all(bind=engine)  


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve os arquivos da pasta static/ publicamente em /static/...
app.mount("/static", StaticFiles(directory="static"), name="static")

BASE_URL = "http://localhost:8000"

def montar_url_imagem(produto: Produto) -> Produto:
    if produto.imagem:
        produto.imagem = f"{BASE_URL}/static/{produto.imagem}"
    return produto

@app.get("/produtos/hamburgueres", response_model=list[ProdutoOut])
def listar_hamburgueres(db: Session = Depends(get_db)):
    produtos = db.query(Produto).filter(Produto.categoria == "hamburguer").all()
    return [montar_url_imagem(p) for p in produtos]

@app.get("/produtos/bebidas", response_model=list[ProdutoOut])
def listar_bebidas(db: Session = Depends(get_db)):
    produtos = db.query(Produto).filter(Produto.categoria == "bebida").all()
    return [montar_url_imagem(p) for p in produtos]

@app.post("/pedidos", response_model=PedidoOut)
def criar_pedido(pedido: PedidoCreate, db: Session = Depends(get_db)):
    total = sum(item.preco_unitario * item.quantidade for item in pedido.itens)

    novo_pedido = Pedido(nome_cliente=pedido.nome_cliente, status=StatusPedidoModel.aguardando, total=total)
    db.add(novo_pedido)
    db.flush()  # gera o id antes de criar os itens

    for item in pedido.itens:
        db.add(ItemPedido(
            pedido_id=novo_pedido.id,
            produto_id=item.produto_id,
            nome=item.nome,
            preco_unitario=item.preco_unitario,
            quantidade=item.quantidade,
        ))

    db.commit()
    db.refresh(novo_pedido)
    return novo_pedido


@app.get("/pedidos/{pedido_id}", response_model=PedidoOut)
def buscar_pedido(pedido_id: int, db: Session = Depends(get_db)):
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return pedido


@app.patch("/pedidos/{pedido_id}/status", response_model=PedidoOut)
def atualizar_status(pedido_id: int, dados: StatusUpdate, db: Session = Depends(get_db)):
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    pedido.status = dados.status
    db.commit()
    db.refresh(pedido)
    return pedido


@app.post("/admin/login", response_model=TokenResponse)
def login(dados: LoginRequest, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == dados.username).first()

    if not admin or not verificar_senha(dados.password, admin.senha_hash):
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")

    token = criar_token({"sub": admin.username})
    return {"token": token}

@app.get("/pedidos", response_model=list[PedidoOut])
def listar_pedidos(db: Session = Depends(get_db), _: str = Depends(verificar_token)):
    return db.query(Pedido).order_by(Pedido.criado_em.desc()).all()


@app.patch("/pedidos/{pedido_id}/status", response_model=PedidoOut)
def atualizar_status(
    pedido_id: int,
    dados: StatusUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(verificar_token),
):
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    pedido.status = dados.status
    db.commit()
    db.refresh(pedido)
    return pedido