import "./AdminPedidos.css";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const STATUS_OPTIONS = [
    { value: "aguardando", label: "Aguardando" },
    { value: "aceito", label: "Aceito" },
    { value: "cancelado", label: "Cancelado" },
    { value: "saiu_para_entrega", label: "Saiu para entrega" },
    { value: "entregue", label: "Entregue" },
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function formatarData(isoString) {
    const data = new Date(isoString);
    return data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function AdminPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [atualizandoId, setAtualizandoId] = useState(null);
    const [filtroStatus, setFiltroStatus] = useState("todos");
    const navigate = useNavigate();

    function logout() {
        localStorage.removeItem("admin_token");
        navigate("/admin");
    }

    function headersAutenticados() {
        const token = localStorage.getItem("admin_token");
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
    }

    const buscarPedidos = useCallback(() => {
        const token = localStorage.getItem("admin_token");
        if (!token) {
            navigate("/admin");
            return;
        }

        fetch(`${API_URL}/pedidos`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (res.status === 401) {
                    localStorage.removeItem("admin_token");
                    navigate("/admin");
                    return null;
                }
                if (!res.ok) throw new Error("Falha ao buscar pedidos");
                return res.json();
            })
            .then((dados) => {
                if (dados === null) return; // já redirecionou
                setPedidos(dados);
                setErro(null);
                setCarregando(false);
            })
            .catch((err) => {
                console.error("Erro ao buscar pedidos:", err);
                setErro("Não foi possível carregar os pedidos. O backend está rodando?");
                setCarregando(false);
            });
    }, [navigate]);

    useEffect(() => {
        buscarPedidos();
        const intervalo = setInterval(buscarPedidos, 15000); // atualiza a cada 15s
        return () => clearInterval(intervalo);
    }, [buscarPedidos]);

    async function alterarStatus(pedidoId, novoStatus) {
        setAtualizandoId(pedidoId);
        try {
            const res = await fetch(`${API_URL}/pedidos/${pedidoId}/status`, {
                method: "PATCH",
                headers: headersAutenticados(),
                body: JSON.stringify({ status: novoStatus }),
            });

            if (res.status === 401) {
                localStorage.removeItem("admin_token");
                navigate("/admin");
                return;
            }
            if (!res.ok) throw new Error("Falha ao atualizar status");

            const pedidoAtualizado = await res.json();
            setPedidos((prev) =>
                prev.map((p) => (p.id === pedidoId ? pedidoAtualizado : p))
            );
        } catch (err) {
            console.error("Erro ao atualizar status:", err);
            alert("Não foi possível atualizar o status. Tente novamente.");
        } finally {
            setAtualizandoId(null);
        }
    }

    const pedidosFiltrados =
        filtroStatus === "todos"
            ? pedidos
            : pedidos.filter((p) => p.status === filtroStatus);

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1>Pedidos</h1>
                <div className="admin-header-acoes">
                    <select
                        className="admin-filtro"
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                    >
                        <option value="todos">Todos os status</option>
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <button className="admin-atualizar" onClick={buscarPedidos}>
                        Atualizar
                    </button>
                    <button className="admin-logout" onClick={logout}>
                        Sair
                    </button>
                </div>
            </header>

            {carregando && <p className="admin-info">Carregando pedidos...</p>}
            {erro && <p className="admin-erro">{erro}</p>}

            {!carregando && !erro && pedidosFiltrados.length === 0 && (
                <p className="admin-info">Nenhum pedido encontrado.</p>
            )}

            {!carregando && !erro && pedidosFiltrados.length > 0 && (
                <div className="admin-lista">
                    {pedidosFiltrados.map((pedido) => (
                        <div key={pedido.id} className="pedido-card">
                            <div className="pedido-card-topo">
                                <div>
                                    <span className="pedido-id">Pedido #{pedido.id}</span>
                                    <span className="pedido-id">Pedido #{pedido.id} — {pedido.nome_cliente}</span>
                                    <span className="pedido-data">{formatarData(pedido.criado_em)}</span>
                                </div>
                                <span className={`status-badge status-${pedido.status}`}>
                                    {STATUS_OPTIONS.find((o) => o.value === pedido.status)?.label}
                                </span>
                            </div>

                            <div className="pedido-itens">
                                {pedido.itens.map((item) => (
                                    <p key={item.id}>
                                        {item.quantidade}x {item.nome} — R$ {(item.preco_unitario * item.quantidade).toFixed(2)}
                                    </p>
                                ))}
                            </div>

                            <div className="pedido-card-rodape">
                                <span className="pedido-total">Total: R$ {pedido.total.toFixed(2)}</span>

                                <select
                                    className="pedido-status-select"
                                    value={pedido.status}
                                    disabled={atualizandoId === pedido.id}
                                    onChange={(e) => alterarStatus(pedido.id, e.target.value)}
                                >
                                    {STATUS_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminPedidos;