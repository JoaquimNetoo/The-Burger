from pydantic import BaseModel
from enum import Enum
from datetime import datetime

class StatusPedido(str, Enum):
    aguardando = "aguardando"
    aceito = "aceito"
    cancelado = "cancelado"
    saiu_para_entrega = "saiu_para_entrega"
    entregue = "entregue"

class ProdutoOut(BaseModel):
    id: int
    nome: str
    descricao: str
    preco: float
    categoria: str
    imagem: str | None = None

    class Config:
        from_attributes = True


class ItemPedidoIn(BaseModel):
    produto_id: int
    nome: str
    preco_unitario: float
    quantidade: int


class PedidoCreate(BaseModel):
    itens: list[ItemPedidoIn]


class ItemPedidoOut(BaseModel):
    id: int
    produto_id: int
    nome: str
    preco_unitario: float
    quantidade: int

    class Config:
        from_attributes = True

class PedidoOut(BaseModel):
    id: int
    status: StatusPedido
    total: float
    criado_em: datetime
    itens: list[ItemPedidoOut]

    class Config:
        from_attributes = True

class StatusUpdate(BaseModel):
    status: StatusPedido

    