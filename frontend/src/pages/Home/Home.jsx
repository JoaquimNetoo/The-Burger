import { Link } from "react-router-dom";
import "./Home.css";
import backgroundImage from "../../assets/fundo.jpg";
function Home() {
    return (
        <div className="home-container">

            <div className="top-background" style={{ backgroundImage: `url(${backgroundImage})` }}></div>

            <div className="Navbar">
                <div className="QuemSomos">
                    Quem somos?
                    <span className="QuemSomos-underline">Somos uma equipe apaixonada por hambúrgueres!</span>
                </div>

            </div>   
            <div className="content">
                <div className="title-container">
                    <h1 className="title">THE BURGER</h1>
                </div>

                <div className="buttons-container">
                    <Link to="/cardapio">
                        <button className="cardapio-button">Ver Cardápio</button>
                    </Link>

                </div>
            </div>
        </div>
    );
}

export default Home