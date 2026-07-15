import "./Cardapio.css";
import carrinho from "../../assets/carrinho-de-compras.png";
import backgroundGrelha from "../../assets/grelha.jpg";
import { useState, useEffect } from "react";

function Cardapio() {
    const [carrinhoAberto, setCarrinhoAberto] = useState(false);
    const [categoriaAberta, setCategoriaAberta] = useState(null);
    const [quantidades, setQuantidades] = useState({});
    const [itensCarrinho, setItensCarrinho] = useState([]);
    const [hamburgueres, setHamburgueres] = useState([]);
    const [bebidas, setBebidas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [realizarpedido, setRealizarPedido] = useState(false);
    const [enviandoPedido, setEnviandoPedido] = useState(false);
    const [erroPedido, setErroPedido] = useState(null);
    const [pedidoConfirmado, setPedidoConfirmado] = useState(null); // { id, status }
    const [nomeCliente, setNomeCliente] = useState("");

    useEffect(() => {
        Promise.all([
            fetch("http://localhost:8000/produtos/hamburgueres").then((res) => res.json()),
            fetch("http://localhost:8000/produtos/bebidas").then((res) => res.json()),
        ])
            .then(([dadosHamburgueres, dadosBebidas]) => {
                setHamburgueres(dadosHamburgueres);
                setBebidas(dadosBebidas);
                setCarregando(false);
            })
            .catch((err) => {
                console.error("Erro ao buscar produtos:", err);
                setErro("Não foi possível carregar o cardápio. O backend está rodando?");
                setCarregando(false);
            });
    }, []);

    function alterarQuantidade(id, delta) {
        setQuantidades((prev) => {
            const atual = prev[id] || 0;
            const nova = Math.max(0, atual + delta);
            return { ...prev, [id]: nova };
        });
    }

    function adicionarAoCarrinho(produto) {
        const qtd = quantidades[produto.id] || 0;
        if (qtd === 0) return;

        setItensCarrinho((prev) => {
            const existente = prev.find((item) => item.id === produto.id);
            if (existente) {
                return prev.map((item) =>
                    item.id === produto.id
                        ? { ...item, quantidade: item.quantidade + qtd }
                        : item
                );
            }
            return [...prev, { ...produto, quantidade: qtd }];
        });

        setQuantidades((prev) => ({ ...prev, [produto.id]: 0 }));
    }

    const listaAtual = categoriaAberta === "hamburgueres" ? hamburgueres
        : categoriaAberta === "bebidas" ? bebidas
            : [];


    async function confirmarPedido() {
        setEnviandoPedido(true);
        setErroPedido(null);

        try {
            const itens = itensCarrinho.map((item) => ({
                produto_id: item.id,
                nome: item.nome,
                preco_unitario: item.preco,
                quantidade: item.quantidade,
            }));

            const res = await fetch("http://localhost:8000/pedidos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome_cliente: nomeCliente, itens }),
            });

            if (!res.ok) throw new Error("Falha ao enviar pedido");

            const pedido = await res.json();
            setPedidoConfirmado({ id: pedido.id, status: pedido.status });
            setItensCarrinho([]);
            setNomeCliente("");
        } catch (err) {
            console.error("Erro ao confirmar pedido:", err);
            setErroPedido("Não foi possível enviar o pedido. Tente novamente.");
        } finally {
            setEnviandoPedido(false);
        }
    }

    return (
        <div className="cardapio-container">

            <div className="top-background" style={{ backgroundImage: `url(${backgroundGrelha})` }}></div>

            <div className="cardapio-content">
                <h1>Cardápio</h1>
                <p>Bem-vindo ao cardápio do The Burger!</p>

                <div
                    className="carrinhoicone"
                    style={{ backgroundImage: `url(${carrinho})` }}
                    onClick={() => setCarrinhoAberto(!carrinhoAberto)}
                ></div>

                {carrinhoAberto && (
                    <div className="carrinho-popup">
                        <h3>Seus pedidos</h3>
                        {itensCarrinho.length === 0 ? (
                            <p>Nenhum item selecionado ainda.</p>
                        ) : (
                            itensCarrinho.map((item) => (
                                <p key={item.id}>
                                    {item.quantidade}x {item.nome} - R$ {(item.preco * item.quantidade).toFixed(2)}
                                </p>
                            ))
                        )}

                        <button className="realizar-pedido" onClick={() => setRealizarPedido(true)}>
                            Realizar Pedido
                        </button>

                        {realizarpedido && (
                            <div className="modal-overlay" onClick={() => setRealizarPedido(false)}>
                                <div className="pedido-popup" onClick={(e) => e.stopPropagation()}>

                                    {pedidoConfirmado ? (
                                        <>
                                            <h2>Pedido enviado!</h2>
                                            <p>Pedido #{pedidoConfirmado.id}</p>
                                            <p>Status: {pedidoConfirmado.status}</p>
                                            <button
                                                className="confirmar-pedido"
                                                onClick={() => {
                                                    setRealizarPedido(false);
                                                    setPedidoConfirmado(null);
                                                    setCarrinhoAberto(false);
                                                }}
                                            >
                                                Fechar
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <h2>Finalizando seu pedido!</h2>
                                            <p>Confira seu pedido antes de confirmar:</p>

                                            {itensCarrinho.map((item) => (
                                                <p key={item.id}>
                                                    {item.quantidade}x {item.nome} -
                                                    R$ {(item.preco * item.quantidade).toFixed(2)}
                                                </p>
                                            ))}

                                            <div className="form-group">
                                                <label htmlFor="nomeCliente">Seu nome:</label>
                                                <input
                                                    type="text"
                                                    id="nomeCliente"
                                                    value={nomeCliente}
                                                    onChange={(e) => setNomeCliente(e.target.value)}
                                                    placeholder="Digite seu nome"
                                                    required
                                                />
                                            </div>

                                            {erroPedido && <p className="cardapio-erro">{erroPedido}</p>}

                                            <button
                                                className="confirmar-pedido"
                                                onClick={confirmarPedido}
                                                disabled={enviandoPedido || nomeCliente.trim() === ""}
                                            >
                                                {enviandoPedido ? "Enviando..." : "Confirmar Pedido"}
                                            </button>

                                            <button
                                                className="cancelar-pedido"
                                                onClick={() => setRealizarPedido(false)}
                                                disabled={enviandoPedido}
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {erro && <p className="cardapio-erro">{erro}</p>}
                {carregando && <p>Carregando cardápio...</p>}

                {!carregando && !erro && (
                    <div className="categorias-container">
                        <button className="categoria-button" onClick={() => setCategoriaAberta("hamburgueres")}>
                            Hambúrgueres
                        </button>
                        <button className="categoria-button" onClick={() => setCategoriaAberta("bebidas")}>
                            Bebidas
                        </button>
                    </div>
                )}
            </div>

            {categoriaAberta && (
                <div className="modal-overlay" onClick={() => setCategoriaAberta(null)}>
                    <div className="modal-conteudo" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{categoriaAberta === "hamburgueres" ? "Hambúrgueres" : "Bebidas"}</h2>
                            <button className="modal-fechar" onClick={() => setCategoriaAberta(null)}>×</button>
                        </div>

                        <div className="modal-lista">
                            {listaAtual.map((produto) => (
                                <div key={produto.id} className="produto-item">
                                    {produto.imagem && (
                                        <img
                                            src={produto.imagem}
                                            alt={produto.nome}
                                            className="produto-imagem"
                                        />
                                    )}

                                    <div className="produto-info">
                                        <h4>{produto.nome}</h4>
                                        <p className="produto-descricao">{produto.descricao}</p>
                                        <p className="produto-preco">R$ {produto.preco.toFixed(2)}</p>
                                    </div>

                                    <div className="produto-acoes">
                                        <div className="quantidade-controle">
                                            <button onClick={() => alterarQuantidade(produto.id, -1)}>-</button>
                                            <span>{quantidades[produto.id] || 0}</span>
                                            <button onClick={() => alterarQuantidade(produto.id, 1)}>+</button>
                                        </div>
                                        <button
                                            className="adicionar-button"
                                            onClick={() => adicionarAoCarrinho(produto)}
                                        >
                                            Adicionar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Cardapio;