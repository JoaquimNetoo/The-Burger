from database import SessionLocal, engine, Base
from models import Produto

Base.metadata.create_all(bind=engine)

db = SessionLocal()

produtos = [
    Produto(nome="X-Burger", descricao="Pão, hambúrguer, queijo e molho especial",
            preco=15.90, categoria="hamburguer", imagem="imagens/xburger.jpg"),
    Produto(nome="X-Bacon", descricao="Pão, hambúrguer, queijo, bacon crocante",
            preco=18.90, categoria="hamburguer", imagem="imagens/xbacon.jpg"),
    Produto(nome="X-Salada", descricao="Pão, hambúrguer, queijo, alface e tomate",
            preco=17.50, categoria="hamburguer", imagem="imagens/xsalada.jpg"),
    Produto(nome="X-Tudo", descricao="Pão, hambúrguer duplo, queijo, bacon, ovo e salada",
            preco=24.90, categoria="hamburguer", imagem="imagens/xtudo.jpg"),
    Produto(nome="Refrigerante Lata", descricao="350ml, várias opções de sabor",
            preco=6.00, categoria="bebida", imagem="imagens/refrigerante.jpg"),
    Produto(nome="Suco Natural", descricao="500ml, laranja, limão ou abacaxi",
            preco=8.50, categoria="bebida", imagem="imagens/suco.jpg"),
    Produto(nome="Água Mineral", descricao="500ml, com ou sem gás",
            preco=4.00, categoria="bebida", imagem="imagens/agua.jpg"),
]

db.add_all(produtos)
db.commit()
db.close()

print("Seed concluído!")