import React, { useState, useEffect } from 'react';
import { Rocket, Plus, Trash2, Pencil, Calendar, X, Save, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface Plan {
  id: number;
  name: string;
  months: number;
}

export default function MasterPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  
  const [formData, setFormData] = useState({ name: '', months: 1 });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/admin/plans');
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (err) {
      toast.error('Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPlan ? `/api/admin/plans/${editingPlan.id}` : '/api/admin/plans';
      const method = editingPlan ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        toast.success(editingPlan ? 'Plano atualizado!' : 'Plano criado!');
        setShowAdd(false);
        setEditingPlan(null);
        setFormData({ name: '', months: 1 });
        fetchPlans();
      }
    } catch (err) {
      toast.error('Erro ao salvar plano');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/admin/plans/${deleteConfirm.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Plano removido');
        fetchPlans();
      }
    } catch (err) {
      toast.error('Erro ao remover plano');
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Planos de Acesso</h1>
          <p className="text-xs text-gray-500">Gerencie a validade e os nomes dos planos</p>
        </div>
        
        <button 
          onClick={() => {
            setEditingPlan(null);
            setFormData({ name: '', months: 1 });
            setShowAdd(true);
          }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all text-xs"
        >
          <Plus className="w-4 h-4" />
          Novo Plano
        </button>
      </div>

      {(showAdd || editingPlan) && (
        <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-xl shadow-blue-50/50 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-black text-gray-900 flex items-center gap-2">
              <Rocket className="w-4 h-4 text-blue-600" />
              {editingPlan ? 'Editar Plano' : 'Criar Novo Plano'}
            </h2>
            <button onClick={() => { setShowAdd(false); setEditingPlan(null); }} className="p-2 hover:bg-gray-100 rounded-full transition-all">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Nome do Plano</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                placeholder="Ex: Diamond"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Duração (Meses)</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.months}
                  onChange={(e) => setFormData({ ...formData, months: parseInt(e.target.value) })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                />
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="bg-blue-600 text-white font-black px-10 py-3.5 rounded-2xl hover:bg-blue-700 transition-all uppercase tracking-widest text-[10px] shadow-lg shadow-blue-100 flex items-center gap-2">
                <Save className="w-4 h-4" />
                {editingPlan ? 'Salvar Edição' : 'Confirmar Criação'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <p className="text-gray-400 text-sm animate-pulse">Carregando planos...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400 text-sm italic">Nenhum plano cadastrado. Clique em "Novo Plano".</p>
          </div>
        ) : plans.map((plan) => (
          <div key={plan.id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                <Rocket className="w-7 h-7" />
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => {
                    setEditingPlan(plan);
                    setFormData({ name: plan.name, months: plan.months });
                  }}
                  className="p-2.5 bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(plan.id, plan.name)}
                  className="p-2.5 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-xl font-black text-gray-900 mb-2">{plan.name}</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[11px] font-black text-gray-600 uppercase tracking-tight">{plan.months} {plan.months === 1 ? 'Mês' : 'Meses'}</span>
              </div>
              {plan.months >= 12 && (
                <div className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Anual</span>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
               <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">ID do Plano: #{plan.id}</p>
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-black text-gray-900 text-center mb-2">Excluir Plano?</h3>
            <p className="text-sm text-gray-500 text-center mb-8">
              Tem certeza que deseja remover o plano <span className="font-bold text-gray-900">{deleteConfirm.name}</span>? Esta ação não pode ser desfeita e pode afetar usuários vinculados.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-6 py-3 bg-gray-50 text-gray-400 font-bold rounded-2xl hover:bg-gray-100 transition-all text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all text-sm shadow-lg shadow-red-100"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
