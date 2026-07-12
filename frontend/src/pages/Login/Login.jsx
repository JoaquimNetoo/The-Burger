import "./Login.css";

function Login(){
    return (


        <div className="login-container">
            <h1>Login</h1>
            <form className="login-form">
                <input type="email" placeholder="Email" />
                <input type="password" placeholder="Senha" />
                <button type="submit">Entrar</button>
            </form>
        </div>
    );
}

export default Login