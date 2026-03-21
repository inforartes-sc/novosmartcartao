import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import MasterDashboard from './pages/MasterDashboard';

function Landing() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-5xl font-bold text-blue-600 mb-4 font-heading">Smart Cartão</h1>
      <p className="text-xl text-gray-600 mb-8 max-w-md">
        Crie seu cartão de visita digital com catálogo de produtos em minutos.
      </p>
      <div className="flex gap-4">
        <Link to="/login" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
          Entrar
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.favicon) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
          }
          link.href = data.favicon;
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard/*" element={<UserDashboard />} />
        <Route path="/admin/*" element={<MasterDashboard />} />
        <Route path="/:slug" element={<Home />} />
        <Route path="/:slug/catalogo" element={<Catalog />} />
      </Routes>
    </Router>
  );
}
