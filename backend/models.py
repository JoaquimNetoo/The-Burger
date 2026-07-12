from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from database import Base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

class StatusPedido(enum.Enum):
    aguardando = "aguardando"
    aceito = "aceito"
    cancelado = "cancelado"
    saiu_para_entrega = "saiu_para_entrega"
    entregue = "entregue"


class Produto(Base):
    __tablename__ = "produtos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    descricao = Column(String)
    preco = Column(Float, nullable=False)
    categoria = Column(String, nullable=False)   # "hamburguer" ou "bebida"
    imagem = Column(String, nullable=True)        # ex: "imagens/xburger.jpg"


class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(Enum(StatusPedido), default=StatusPedido.aguardando, nullable=False)
    total = Column(Float, nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow)

    itens = relationship("ItemPedido", back_populates="pedido", cascade="all, delete-orphan")



class ItemPedido(Base):
    __tablename__ = "itens_pedido"

    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"), nullable=False)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False)
    nome = Column(String, nullable=False)
    preco_unitario = Column(Float, nullable=False)
    quantidade = Column(Integer, nullable=False)

    pedido = relationship("Pedido", back_populates="itens")

