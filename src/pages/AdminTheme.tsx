import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Save, Palette, RotateCcw } from 'lucide-react';

interface AdminThemeProps {
  user: any;
  onUpdate: (user: any) => void;
}

export default function AdminTheme({ user, onUpdate }: AdminThemeProps) {
  const [formData, setFormData] = useState({
    ...user,
    primary_color: user.primary_color || '#003da5',
    background_color: user.background_color || '#ffffff'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        onUpdate(formData);
        toast.success('Tema atualizado com sucesso!');
      } else {
        toast.error('Erro ao atualizar tema.');
      }
    } catch (err) {
      toast.error('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const resetTheme = () => {
    setFormData({
      ...formData,
      primary_color: '#003da5',
      background_color: '#ffffff'
    });
  };

  return (
    <div className="max-w-2xl mx-auto lg:mx-0 font-sans">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900 uppercase tracking-tight">Personalizar Tema</h1>
          <p className="text-xs lg:text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Ajuste as cores principais do seu cartão</p>
        </div>
        <button 
          onClick={resetTheme}
          className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 px-4 py-2 rounded-xl border border-gray-100 uppercase tracking-widest"
        >
          <RotateCcw className="w-4 h-4" />
          Resetar Cores
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-5 lg:p-8 rounded-3xl lg:rounded-[2rem] shadow-sm border border-gray-100 space-y-8 lg:space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2 text-[#003da5]">
              <Palette className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-wider text-sm">Cor Principal</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">Aplica-se a botões, ícones, barras de navegação e detalhes importantes.</p>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                className="w-16 h-16 rounded-2xl border-none cursor-pointer p-0 overflow-hidden"
              />
              <input
                type="text"
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                className="flex-grow px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl font-mono text-sm uppercase"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2 text-[#003da5]">
              <Palette className="w-5 h-5 opacity-50" />
              <h3 className="font-bold uppercase tracking-wider text-sm text-gray-700">Cor de Fundo</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">Aplica-se ao fundo principal do cartão e das páginas.</p>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={formData.background_color}
                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                className="w-16 h-16 rounded-2xl border border-gray-100 cursor-pointer p-0 overflow-hidden shadow-inner"
              />
              <input
                type="text"
                value={formData.background_color}
                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                className="flex-grow px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl font-mono text-sm uppercase"
              />
            </div>
          </div>
        </div>

        {/* Live Preview Simulation */}
        <div className="pt-8 border-t border-gray-50">
          <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider text-center">Prévia em Tempo Real</h3>
          <div 
            className="w-full max-w-sm mx-auto p-8 rounded-[2.5rem] shadow-2xl space-y-4 transition-all duration-500 border border-gray-50"
            style={{ backgroundColor: formData.background_color }}
          >
            <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-6" />
            <div className="h-4 w-3/4 bg-gray-100 mx-auto rounded-full" />
            <div className="h-3 w-1/2 bg-gray-50 mx-auto rounded-full mb-8" />
            
            <div 
              className="w-full h-12 rounded-full flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: formData.primary_color }}
            >
              Botão de Exemplo
            </div>
            <div 
              className="w-full h-12 rounded-full flex items-center justify-center text-white font-bold text-xs opacity-80"
              style={{ backgroundColor: formData.primary_color }}
            >
              Outro Elemento
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          style={{ backgroundColor: formData.primary_color }}
        >
          <Save className="w-5 h-5" />
          {loading ? 'Aplicando...' : 'Salvar Novo Tema'}
        </button>
      </form>
    </div>
  );
}
