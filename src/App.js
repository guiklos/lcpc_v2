import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Relatorios from './components/Relatorios';
import Pedidos from './components/Pedidos';
import Clientes from './components/Clientes';
import Produtos from './components/Produtos';
import './App.css'; // Adicione este import para os estilos
import logo from './images/logo512.png'; // Adicione o caminho para sua imagem de logo

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <nav className="sidebar">
          <img src={logo} alt="Logo" className="logo" />
          <ul>
            <li>
              <Link to="/pedidos">Pedidos</Link>
            </li>
            <li>
              <Link to="/clientes">Clientes</Link>
            </li>
            <li>
              <Link to="/produtos">Produtos</Link>
            </li>
            <li>
              <Link to="/relatorios">Relatórios</Link>
            </li>
          </ul>
        </nav>
        <div className="content">
          <Routes>
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/produtos" element={<Produtos />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
