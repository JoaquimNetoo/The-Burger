import "./Admin.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Admin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [erro, setErro] = useState(null);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setErro(null);

        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

            // dentro do handleSubmit:
            const res = await fetch(`${API_URL}/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) throw new Error("Credenciais inválidas");

            const { token } = await res.json();
            localStorage.setItem("admin_token", token);
            navigate("/admin/pedidos");
        } catch (err) {
            setErro("Usuário ou senha incorretos.");
        }
    }

    return (
        <div className="admin-container">
            <form className="admin-form" onSubmit={handleSubmit}>
                <h2 className="admin-title">Administração</h2>

                <div className="form-group">
                    <label htmlFor="username">Usuário:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Senha:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {erro && <p className="admin-erro">{erro}</p>}

                <button type="submit" className="login-button">Entrar</button>
            </form>
        </div>
    );
}

export default Admin;