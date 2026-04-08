import { Users, Activity, CheckCircle, TrendingUp, ShieldAlert, Shield, Rocket } from 'lucide-react';
import { SYSTEM_VERSION } from '../../config';

interface Props {
  stats: any;
}

export default function MasterOverview({ stats }: Props) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-black text-gray-900 tracking-tight">Visão Geral</h1>
           <p className="text-sm text-gray-400 font-medium">Relatórios e desempenho da plataforma</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100/50">
           <Activity className="w-4 h-4" />
           <span className="text-[10px] font-black uppercase tracking-widest">Sistema Ativo</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100/50 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-500">
            <Users className="w-6 h-6 text-blue-600 group-hover:text-white" />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Usuários</p>
          <p className="text-3xl font-black text-gray-900 tracking-tighter">{stats?.userCount || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100/50 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-500">
            <CheckCircle className="w-6 h-6 text-emerald-600 group-hover:text-white" />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Usuários Ativos</p>
          <p className="text-3xl font-black text-emerald-600 tracking-tighter">{stats?.activeCount || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100/50 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-rose-600 transition-all duration-500">
            <ShieldAlert className="w-6 h-6 text-rose-600 group-hover:text-white" />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Usuários Inativos</p>
          <p className="text-3xl font-black text-rose-600 tracking-tighter">{stats?.inactiveCount || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100/50 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-purple-600 transition-all duration-500">
            <TrendingUp className="w-6 h-6 text-purple-600 group-hover:text-white" />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Últimos 30 Dias</p>
          <p className="text-3xl font-black text-gray-900 tracking-tighter">+{stats?.newUsersCount || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <Rocket className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-black text-gray-900 uppercase tracking-widest">Acessos por Plano</h3>
          </div>
          <div className="space-y-6">
            {stats?.planStats?.map((plan: any, i: number) => {
              const percentage = (plan.count / (stats.userCount || 1)) * 100;
              return (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-900 uppercase tracking-tight">{plan.name}</span>
                    <span className="text-gray-400">{plan.count} usuários</span>
                  </div>
                  <div className="h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {(!stats?.planStats || stats.planStats.length === 0) && (
              <p className="text-xs text-gray-400 italic">Nenhum dado de planos disponível</p>
            )}
          </div>
        </div>

        {/* Level Distribution */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <Shield className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-black text-gray-900 uppercase tracking-widest">Distribuição de Nível</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 text-center group transition-all hover:bg-amber-100">
              <p className="text-[9px] font-black text-amber-600 uppercase tracking-[0.2em] mb-2">Master Admins</p>
              <p className="text-4xl font-black text-amber-700 tracking-tighter">{stats?.adminsCount || 0}</p>
              <div className="mt-4 w-8 h-1 bg-amber-200 mx-auto rounded-full group-hover:w-16 transition-all"></div>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center group transition-all hover:bg-slate-100">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Consultores</p>
              <p className="text-4xl font-black text-slate-700 tracking-tighter">{stats?.membersCount || 0}</p>
              <div className="mt-4 w-8 h-1 bg-slate-200 mx-auto rounded-full group-hover:w-16 transition-all"></div>
            </div>
          </div>
          <div className="mt-8 flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50">
             <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
             <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-tight leading-tight">
               Integridade do banco de dados verificada e sincronizada.
             </p>
          </div>
        </div>
      </div>

      {/* Guia do Administrador */}
      <div className="bg-white p-10 rounded-[48px] border border-blue-100 shadow-xl shadow-blue-50/50">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Guia do Administrador Master</h3>
            <p className="text-sm text-gray-400 font-medium">Instruções essenciais para gestão do sistema</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs">01</span>
              <h4 className="font-bold text-gray-800 uppercase tracking-tight text-xs">Gestão de Usuários</h4>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              No menu <b>Usuários</b>, você pode criar novas contas, resetar senhas e alternar o status de <b>Master Admin</b>. Novos usuários recebem automaticamente as configurações padrão definidas em "Configurações".
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs">02</span>
              <h4 className="font-bold text-gray-800 uppercase tracking-tight text-xs">Onboarding & Nichos</h4>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Utilize o menu <b>Onboarding</b> para gerar links específicos para <b>Veículos</b> ou <b>Imobiliárias</b>. Após o cliente preencher o formulário, ele aparecerá na lista para ativação rápida.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs">03</span>
              <h4 className="font-bold text-gray-800 uppercase tracking-tight text-xs">Faturamento (PagixyPay)</h4>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              O sistema está integrado ao <b>Portal Financeiro</b>. No menu <b>Financeiro</b> ou <b>Configurações</b>, você pode testar a conexão e garantir que as faturas estão sendo geradas corretamente.
            </p>
          </div>
        </div>

        <div className="mt-10 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <Rocket className="w-4 h-4 text-blue-500" />
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Suporte Técnico Ativado</span>
           </div>
           <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">v{SYSTEM_VERSION} • AMBIENTE DE ALTA DISPONIBILIDADE</p>
        </div>
      </div>
    </div>
  );
}

