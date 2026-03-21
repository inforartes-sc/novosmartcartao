import React from 'react';
import { useNavigate, Link, Routes, Route, useLocation } from 'react-router-dom';
import { User, Package, LogOut, LayoutDashboard, ExternalLink, Palette, Copy, Share2, MousePointer2, Bell, Calendar, AlertTriangle } from 'lucide-react';
import AdminProfile from './AdminProfile';
import AdminProducts from './AdminProducts';
import AdminTheme from './AdminTheme';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { SYSTEM_VERSION } from '../config';

export default function UserDashboard() {
  const { user, loading, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [productCount, setProductCount] = useState(0);
  const [settings, setSettings] = useState<any>(null);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (user) {
      fetch('/api/products')
        .then(res => res.json())
        .then(data => setProductCount(data.length || 0))
        .catch(() => {});
      
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => setSettings(data))
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const copyLink = () => {
    const url = `${window.location.origin}/${user?.slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado com sucesso!');
  };

  const shareLink = async () => {
    const url = `${window.location.origin}/${user?.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Smart Cartão',
          url: url,
        });
      } catch (err) {}
    } else {
      copyLink();
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!user) {
    navigate('/login');
    return null;
  }

  const daysLeft = user.expiry_date ? Math.ceil((new Date(user.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isExpiring = daysLeft !== null && daysLeft <= 10;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100 font-heading shrink-0">
          <h2 className="text-xl font-bold text-[#003da5]">Painel de Controle</h2>
        </div>
        
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto scrollbar-hide">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              isActive('/dashboard') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-blue-50/50 hover:text-blue-600'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            to="/dashboard/perfil"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              isActive('/dashboard/perfil') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-blue-50/50 hover:text-blue-600'
            }`}
          >
            <User className="w-5 h-5" />
            Meu Perfil
          </Link>
          <Link
            to="/dashboard/produtos"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              isActive('/dashboard/produtos') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-blue-50/50 hover:text-blue-600'
            }`}
          >
            <Package className="w-5 h-5" />
            Produtos
          </Link>
          <Link
            to="/dashboard/tema"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              isActive('/dashboard/tema') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-blue-50/50 hover:text-blue-600'
            }`}
          >
            <Palette className="w-5 h-5" />
            Tema
          </Link>
        </nav>

        <div className="shrink-0">
          <div className="p-4 border-t border-gray-100">
            <a
              href={`/${user.slug}`}
              target="_blank"
              className="flex items-center gap-3 px-4 py-3 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all font-medium mb-2"
            >
              <ExternalLink className="w-5 h-5" />
              Ver meu Cartão
            </a>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
          
          {/* Fixed Branding */}
          <div className="p-8 border-t border-gray-50 flex flex-col items-center justify-center bg-gray-50/50">
            {settings?.footer_logo ? (
                <img src={settings.footer_logo} alt="Consultor Logo" className="h-14 w-auto object-contain mb-3 mx-auto" />
            ) : (
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 text-center">Tecnologia Smart Cartão</span>
            )}
            <span className="text-[10px] font-black text-[#003da5] tracking-widest">{SYSTEM_VERSION}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto">
        {user.admin_message && (
          <div className="mb-6 bg-blue-600 text-white p-5 rounded-[24px] shadow-lg shadow-blue-200 border border-blue-500 animate-in slide-in-from-top-4 duration-500 flex items-center gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
               <Bell className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Aviso do Sistema</p>
              <h3 className="font-bold text-lg leading-tight">{user.admin_message}</h3>
              {user.admin_message_date && (
                <p className="text-[10px] opacity-60 mt-1 font-medium">Enviado em: {new Date(user.admin_message_date).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        )}

        {isExpiring && (
          <div className="mb-6 bg-amber-500 text-white p-5 rounded-[24px] shadow-lg shadow-amber-200 border border-amber-400 animate-in slide-in-from-top-4 duration-500 flex items-center gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
               <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-white animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-90">Renovação Necessária</p>
              </div>
              <h3 className="font-bold text-lg leading-tight">
                Seu plano expira em {daysLeft! > 0 ? `${daysLeft} dias` : 'hoje'}!
              </h3>
              <p className="text-[10px] opacity-80 mt-1 font-medium">Evite o bloqueio do seu cartão digital entrando em contato com o suporte.</p>
            </div>
          </div>
        )}

        <Routes>
          <Route path="/" element={
            <div className="max-w-4xl space-y-6">
              {/* Card link section */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-orange-500"><MousePointer2 className="w-4 h-4" /></span>
                  <h3 className="font-bold text-gray-900">Seu Cartão Digital</h3>
                </div>
                <p className="text-xs text-gray-400 mb-4">Compartilhe seu link personalizado com clientes</p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                    <p className="text-xs text-gray-400 mb-1">URL do seu cartão</p>
                    <p className="text-blue-600 font-bold break-all text-sm">{window.location.origin}/{user.slug}</p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex flex-col justify-center">
                    <p className="text-[10px] text-blue-400 uppercase font-bold mb-1">Total de Visualizações</p>
                    <p className="text-xl font-black text-blue-700">{user.views || 0}</p>
                  </div>
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex flex-col justify-center">
                    <p className="text-[10px] text-orange-400 uppercase font-bold mb-1">Itens Ativos</p>
                    <p className="text-xl font-black text-orange-700">{productCount}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  <button onClick={copyLink} className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
                    <Copy className="w-4 h-4" /> Copiar Link
                  </button>
                  <button onClick={shareLink} className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
                    <Share2 className="w-4 h-4" /> Compartilhar
                  </button>
                  <a href={`/${user.slug}`} target="_blank" className="flex items-center justify-center gap-2 py-3 px-4 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-100">
                    <ExternalLink className="w-4 h-4" /> Visualizar Cartão
                  </a>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-900"><LayoutDashboard className="w-5 h-5" /></span>
                  <h3 className="font-bold text-xl text-gray-900">Ações Rápidas</h3>
                </div>
                <p className="text-xs text-gray-400 -mt-3 mb-4">Acesse as principais funcionalidades</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link to="/dashboard/produtos" className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group flex flex-col items-center justify-center text-center">
                    <Package className="w-8 h-8 text-gray-300 group-hover:text-blue-500 mb-3 transition-colors" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Gerenciar Produtos</span>
                  </Link>
                  <Link to="/dashboard/perfil" className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group flex flex-col items-center justify-center text-center">
                    <User className="w-8 h-8 text-gray-300 group-hover:text-blue-500 mb-3 transition-colors" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Editar Perfil</span>
                  </Link>
                  <Link to="/dashboard/tema" className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group flex flex-col items-center justify-center text-center">
                    <Palette className="w-8 h-8 text-gray-300 group-hover:text-blue-500 mb-3 transition-colors" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Configurar Tema</span>
                  </Link>
                </div>
              </div>
            </div>
          } />
          <Route path="/perfil" element={<AdminProfile user={user} onUpdate={setUser} />} />
          <Route path="/produtos" element={<AdminProducts />} />
          <Route path="/tema" element={<AdminTheme user={user} onUpdate={setUser} />} />
        </Routes>
      </main>
    </div>
  );
}
