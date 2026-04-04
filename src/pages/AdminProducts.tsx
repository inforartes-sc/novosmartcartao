import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { uploadImage } from '../lib/supabase';
import { motion } from 'motion/react';
import { Plus, Trash2, Package, Camera, Loader2, Edit2, X, Check, Copy, Calculator, Search, Home as HomeIcon, MapPin, Maximize, Bed, Bath, Car, ArrowRightLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newColor, setNewColor] = useState('#000000');
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; title: string; onConfirm: () => void } | null>(null);
  
  const { user } = useAuth();
  const userNiche = user?.niche || 'vehicle';

  const VEHICLE_OPTIONALS = [
    'Ar Condicionado', 'Direção Hidráulica', 'Direção Elétrica', 'Vidros Elétricos',
    'Travas Elétricas', 'Alarme', 'Air Bag', 'Air Bag Duplo',
    'Air Bag Lateral', 'Freios ABS', 'Sensor de Estacionamento', 'Câmera de Ré',
    'Central Multimídia', 'Bluetooth', 'USB', 'GPS',
    'Teto Solar', 'Bancos de Couro', 'Banco com Regulagem Elétrica', 'Aquecedor de Bancos',
    'Volante Multifuncional', 'Piloto Automático', 'Controle de Tração', 'Controle de Estabilidade',
    'Faróis de Neblina', 'Faróis de LED', 'Retrovisores Elétricos', 'Rodas de Liga Leve',
    'Para-choques na cor do veiculo', 'IPVA Pago', 'Único Dono', 'Revisões em Dia',
    'Manual do Proprietário', 'Chave Reserva'
  ];

  const REAL_ESTATE_OPTIONALS = [
    'Piscina', 'Churrasqueira', 'Academia', 'Salão de Festas', 'Portaria 24h', 'Sistema de Alarme',
    'Elevador', 'Varanda', 'Varanda Gourmet', 'Mobiliado', 'Ar Condicionado', 'Quintal', 
    'Jardim', 'Lareira', 'Closet', 'Copa', 'Despensa', 'Escritório', 'Mezanino',
    'Dependência de Empregada', 'Área de Serviço', 'Gás Encanado', 'Interfone',
    'Armários na Cozinha', 'Armários no Banheiro', 'Armários nos Quartos',
    'Próximo ao Metrô', 'Próximo a Shopping', 'Pet Friendly', 'Acesso para Deficientes',
    'Vista Panorâmica', 'Vista para o Mar'
  ];

  const PROPERTY_TYPES = [
    'Casa', 'Apartamento', 'Sobrado', 'Terreno', 'Galpão', 'Loja', 'Sala Comercial', 'Rural', 'Chácara', 'Sítio'
  ];

  const CURRENT_OPTIONALS = userNiche === 'realestate' ? REAL_ESTATE_OPTIONALS : VEHICLE_OPTIONALS;

  const [formState, setFormState] = useState({
    name: '',
    image: '',
    description: '',
    colors: ['#000000'] as string[],
    images: [] as string[],
    consortium_image: '',
    liberacred_image: '',
    has_liberacred: false,
    has_consortium: true,
    is_highlighted: false,
    year: '',
    price: '',
    mileage: '',
    brand: '',
    condition: 'Novo',
    fuel: 'Flex',
    transmission: 'Manual',
    color: '',
    optionals: [] as string[],
    show_consortium_plans: false,
    consortium_plans: [] as { installments: number; value: string }[],
    show_financing_plans: false,
    financing_plans: [] as { down_payment: string; installments: number; value: string }[],
    cash_price: '',
    card_installments: '',
    card_interest: true,
    is_active: true,
    niche: userNiche,
    property_type: 'Casa',
    property_status: 'ready',
    bedrooms: '',
    bathrooms: '',
    suites: '',
    parking_spaces: '',
    area: '',
    location: '',
    is_for_sale: true,
    is_for_rent: false,
    condo_fee: '',
    iptu: '',
    map_url: '',
    video_url: ''
  });

  const [newPlan, setNewPlan] = useState({ installments: 0, value: '' });
  const [newFinancingPlan, setNewFinancingPlan] = useState({ down_payment: '', installments: 0, value: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'consortium_image' | 'liberacred_image') => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploading(true);
      const url = await uploadImage(e.target.files[0]);
      setFormState(prev => ({ ...prev, [field]: url }));
    } catch (err) {
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      if (formState.images.length >= 5) {
        toast.error('Máximo de 5 imagens na galeria');
        return;
      }
      setUploading(true);
      const url = await uploadImage(e.target.files[0]);
      setFormState(prev => ({ ...prev, images: [...prev.images, url] }));
    } catch (err) {
      toast.error('Erro ao enviar imagem da galeria');
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormState(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading || submitting) return;

    setSubmitting(true);
    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';

      const submissionData = {
        ...formState,
        card_installments: formState.card_installments ? `${formState.card_installments.replace('x', '')}x` : '',
        card_interest: !!formState.card_interest
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (res.ok) {
        toast.success(editingId ? 'Produto atualizado!' : 'Produto salvo!');
        closeForm();
        fetchProducts();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Erro ao salvar produto');
      }
    } catch (err) {
      toast.error('Erro de conexão ao salvar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setFormState({
      name: product.name,
      image: product.image,
      description: product.description,
      colors: typeof product.colors === 'string' ? JSON.parse(product.colors) : (product.colors || ['#000000']),
      images: typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []),
      consortium_image: product.consortium_image || '',
      liberacred_image: product.liberacred_image || '',
      has_liberacred: !!product.has_liberacred,
      has_consortium: product.has_consortium !== undefined ? !!product.has_consortium : true,
      is_highlighted: !!product.is_highlighted,
      year: product.year || '',
      price: product.price || '',
      mileage: product.mileage || '',
      brand: product.brand || '',
      condition: product.condition || 'Novo',
      fuel: product.fuel || 'Flex',
      transmission: product.transmission || 'Manual',
      color: product.color || '',
      optionals: typeof product.optionals === 'string' ? JSON.parse(product.optionals) : (product.optionals || []),
      show_consortium_plans: !!product.show_consortium_plans,
      consortium_plans: typeof product.consortium_plans === 'string' ? JSON.parse(product.consortium_plans) : (product.consortium_plans || []),
      show_financing_plans: !!product.show_financing_plans,
      financing_plans: typeof product.financing_plans === 'string' ? JSON.parse(product.financing_plans) : (product.financing_plans || []),
      cash_price: product.cash_price || '',
      card_installments: (product.card_installments || '').replace('x', ''),
      card_interest: product.card_interest === true || product.card_interest === 1 || String(product.card_interest) === 'true',
      is_active: product.is_active !== false,
      niche: product.niche || 'vehicle',
      property_type: product.property_type || 'Casa',
      property_status: product.property_status || 'ready',
      bedrooms: product.bedrooms || '',
      bathrooms: product.bathrooms || '',
      suites: product.suites || '',
      parking_spaces: product.parking_spaces || '',
      area: product.area || '',
      location: product.location || '',
      is_for_sale: product.is_for_sale !== false,
      is_for_rent: !!product.is_for_rent,
      condo_fee: product.condo_fee || '',
      iptu: product.iptu || '',
      map_url: product.map_url || '',
      video_url: product.video_url || ''
    });
    setShowAddForm(true);
  };

  const handleDuplicate = (product: any) => {
    setEditingId(null);
    setFormState({
      name: `${product.name} (Cópia)`,
      image: product.image,
      description: product.description,
      colors: typeof product.colors === 'string' ? JSON.parse(product.colors) : (product.colors || ['#000000']),
      images: typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []),
      consortium_image: product.consortium_image || '',
      liberacred_image: product.liberacred_image || '',
      has_liberacred: !!product.has_liberacred,
      has_consortium: product.has_consortium !== undefined ? !!product.has_consortium : true,
      is_highlighted: !!product.is_highlighted,
      year: product.year || '',
      price: product.price || '',
      mileage: product.mileage || '',
      brand: product.brand || '',
      condition: product.condition || 'Novo',
      fuel: product.fuel || 'Flex',
      transmission: product.transmission || 'Manual',
      color: product.color || '',
      optionals: typeof product.optionals === 'string' ? JSON.parse(product.optionals) : (product.optionals || []),
      show_consortium_plans: !!product.show_consortium_plans,
      consortium_plans: typeof product.consortium_plans === 'string' ? JSON.parse(product.consortium_plans) : (product.consortium_plans || []),
      show_financing_plans: !!product.show_financing_plans,
      financing_plans: typeof product.financing_plans === 'string' ? JSON.parse(product.financing_plans) : (product.financing_plans || []),
      cash_price: product.cash_price || '',
      card_installments: (product.card_installments || '').replace('x', ''),
      card_interest: product.card_interest === true || product.card_interest === 1 || String(product.card_interest) === 'true',
      is_active: product.is_active !== false,
      niche: product.niche || 'vehicle',
      property_type: product.property_type || 'Casa',
      property_status: product.property_status || 'ready',
      bedrooms: product.bedrooms || '',
      bathrooms: product.bathrooms || '',
      suites: product.suites || '',
      parking_spaces: product.parking_spaces || '',
      area: product.area || '',
      location: product.location || '',
      is_for_sale: product.is_for_sale !== false,
      is_for_rent: !!product.is_for_rent,
      condo_fee: product.condo_fee || '',
      iptu: product.iptu || '',
      map_url: product.map_url || '',
      video_url: product.video_url || ''
    });
    setShowAddForm(true);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormState({
      name: '',
      image: '',
      description: '',
      colors: ['#000000'],
      images: [],
      consortium_image: '',
      liberacred_image: '',
      has_liberacred: false,
      has_consortium: true,
      is_highlighted: false,
      year: '',
      price: '',
      mileage: '',
      brand: '',
      condition: 'Novo',
      fuel: 'Flex',
      transmission: 'Manual',
      color: '',
      optionals: [],
      show_consortium_plans: false,
      consortium_plans: [],
      show_financing_plans: false,
      financing_plans: [],
      cash_price: '',
      card_installments: '',
      card_interest: true,
      is_active: true,
      niche: userNiche,
      property_type: 'Casa',
      property_status: 'ready',
      bedrooms: '',
      bathrooms: '',
      suites: '',
      parking_spaces: '',
      area: '',
      location: '',
      is_for_sale: true,
      is_for_rent: false,
      condo_fee: '',
      iptu: '',
      map_url: '',
      video_url: ''
    });
    setNewPlan({ installments: 0, value: '' });
    setNewFinancingPlan({ down_payment: '', installments: 0, value: '' });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value === "") {
        setFormState({ ...formState, price: "" });
        return;
    }
    const options = { minimumFractionDigits: 2 };
    const result = new Intl.NumberFormat('pt-BR', options).format(parseFloat(value) / 100);
    setFormState({ ...formState, price: result });
  };

  const handleCardInstallmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    setFormState({ ...formState, card_installments: value });
  };

  const addPlan = () => {
    if (newPlan.installments > 0 && newPlan.value) {
      setFormState(prev => ({
        ...prev,
        consortium_plans: [...prev.consortium_plans, newPlan]
      }));
      setNewPlan({ installments: 0, value: '' });
    }
  };

  const removePlan = (index: number) => {
    setFormState(prev => ({
      ...prev,
      consortium_plans: prev.consortium_plans.filter((_, i) => i !== index)
    }));
  };

  const handlePlanValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value === "") {
        setNewPlan({ ...newPlan, value: "" });
        return;
    }
    const result = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(parseFloat(value) / 100);
    setNewPlan({ ...newPlan, value: result });
  };

  const handleCashPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    const result = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(parseFloat(value) / 100);
    setFormState({ ...formState, cash_price: value === "" ? "" : result });
  };

  const handleFinancingDownPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    const result = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(parseFloat(value) / 100);
    setNewFinancingPlan({ ...newFinancingPlan, down_payment: value === "" ? "" : result });
  };

  const handleFinancingValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    const result = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(parseFloat(value) / 100);
    setNewFinancingPlan({ ...newFinancingPlan, value: value === "" ? "" : result });
  };

  const addFinancingPlan = () => {
    if (newFinancingPlan.installments > 0 && newFinancingPlan.value && newFinancingPlan.down_payment) {
      setFormState(prev => ({
        ...prev,
        financing_plans: [...prev.financing_plans, newFinancingPlan]
      }));
      setNewFinancingPlan({ down_payment: '', installments: 0, value: '' });
    }
  };

  const removeFinancingPlan = (index: number) => {
    setFormState(prev => ({
      ...prev,
      financing_plans: prev.financing_plans.filter((_, i) => i !== index)
    }));
  };

  const addColor = () => {
    if (!formState.colors.includes(newColor)) {
      setFormState(prev => ({ ...prev, colors: [...prev.colors, newColor] }));
    }
  };

  const removeColor = (colorToRemove: string) => {
    setFormState(prev => ({ ...prev, colors: prev.colors.filter(c => c !== colorToRemove) }));
  };

  const handleDeleteProduct = (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Tem certeza que deseja excluir este produto?',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
          if (res.ok) {
            toast.success('Produto excluído');
            fetchProducts();
          }
        } catch (err) {
          toast.error('Erro ao excluir produto');
        }
        setConfirmConfig(null);
      }
    });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 text-gray-400">
      <Loader2 className="w-10 h-10 animate-spin mb-4" />
      <p>Carregando seu catálogo...</p>
    </div>
  );

  return (
    <div className="max-w-4xl animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-heading">Gerenciar Catálogo</h1>
          <p className="text-gray-500">Adicione e edite os produtos que aparecem no seu cartão.</p>
        </div>
        <button
          onClick={() => { closeForm(); setShowAddForm(true); }}
          className="bg-[#003da5] hover:bg-[#002b75] text-white font-bold py-3 px-6 rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      <div className="mb-8 p-6 bg-white rounded-3xl border border-gray-100 flex items-center gap-4 group transition-all hover:shadow-lg hover:shadow-blue-50">
        <div className="p-2 bg-blue-50 rounded-xl text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="Buscar no seu catálogo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none font-medium text-gray-700 placeholder:text-gray-400"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="p-1 px-3 bg-gray-100 hover:bg-gray-200 rounded-full text-[10px] font-black uppercase text-gray-500 transition-all"
          >
            Limpar
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-[2rem] shadow-2xl p-8 scrollbar-hide">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 font-heading">
                {editingId ? 'Editar Produto' : 'Adicionar Produto'}
              </h2>
              <button onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">{userNiche === 'realestate' ? 'Título do Imóvel *' : 'Nome do Veículo *'}</label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  placeholder={userNiche === 'realestate' ? "Ex: Apartamento no Centro" : "Ex: KM-HAKA"}
                />
              </div>

              {/* Informações do Veículo / Imóvel */}
              <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  {userNiche === 'realestate' ? <HomeIcon className="w-5 h-5 text-gray-400" /> : <Edit2 className="w-5 h-5 text-gray-400" />}
                  <h3 className="text-lg font-bold text-gray-800">{userNiche === 'realestate' ? 'Detalhes do Imóvel' : 'Informações do Veículo'}</h3>
                </div>
                
                {userNiche === 'vehicle' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Ano</label>
                        <input
                          type="text"
                          value={formState.year}
                          onChange={(e) => setFormState({ ...formState, year: e.target.value })}
                          placeholder="Ex: 2026"
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Preço (R$)</label>
                        <input
                          type="text"
                          value={formState.price}
                          onChange={handlePriceChange}
                          placeholder="0,00"
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Quilometragem (km)</label>
                        <input
                          type="text"
                          value={formState.mileage}
                          onChange={(e) => setFormState({ ...formState, mileage: e.target.value })}
                          placeholder="Opcional"
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Marca</label>
                        <input
                          type="text"
                          value={formState.brand}
                          onChange={(e) => setFormState({ ...formState, brand: e.target.value })}
                          placeholder="Ex: Mobtec"
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Condição</label>
                        <select
                          value={formState.condition}
                          onChange={(e) => setFormState({ ...formState, condition: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                        >
                          <option value="Novo">Novo</option>
                          <option value="Seminovo">Seminovo</option>
                          <option value="Usado">Usado</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Combustível</label>
                        <select
                          value={formState.fuel}
                          onChange={(e) => setFormState({ ...formState, fuel: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                        >
                          <option value="Gasolina">Gasolina</option>
                          <option value="Etanol">Etanol</option>
                          <option value="Flex">Flex</option>
                          <option value="Diesel">Diesel</option>
                          <option value="Elétrico">Elétrico</option>
                          <option value="Híbrido">Híbrido</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tipo de Imóvel</label>
                        <select
                          value={formState.property_type}
                          onChange={(e) => setFormState({ ...formState, property_type: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                        >
                          {PROPERTY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Status do Imóvel</label>
                        <select
                          value={formState.property_status}
                          onChange={(e) => setFormState({ ...formState, property_status: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                        >
                          <option value="ready">Pronto</option>
                          <option value="building">Em Construção</option>
                          <option value="launch">Lançamento</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Preço (R$)</label>
                        <input
                          type="text"
                          value={formState.price}
                          onChange={handlePriceChange}
                          placeholder="0,00"
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase flex items-center gap-1"><Maximize className="w-3 h-3" /> Área (m²)</label>
                        <input
                          type="number"
                          value={formState.area}
                          onChange={(e) => setFormState({ ...formState, area: e.target.value })}
                          placeholder="Ex: 120"
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase flex items-center gap-1"><Bed className="w-3 h-3" /> Quartos</label>
                        <input
                          type="number"
                          value={formState.bedrooms}
                          onChange={(e) => setFormState({ ...formState, bedrooms: e.target.value })}
                          placeholder="0"
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase flex items-center gap-1"><Bath className="w-3 h-3" /> Banheiros</label>
                        <input
                          type="number"
                          value={formState.bathrooms}
                          onChange={(e) => setFormState({ ...formState, bathrooms: e.target.value })}
                          placeholder="0"
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase flex items-center gap-1"><Check className="w-3 h-3" /> Suítes</label>
                        <input
                          type="number"
                          value={formState.suites}
                          onChange={(e) => setFormState({ ...formState, suites: e.target.value })}
                          placeholder="0"
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase flex items-center gap-1"><Car className="w-3 h-3" /> Vagas</label>
                        <input
                          type="number"
                          value={formState.parking_spaces}
                          onChange={(e) => setFormState({ ...formState, parking_spaces: e.target.value })}
                          placeholder="0"
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase flex items-center gap-1"><MapPin className="w-3 h-3" /> Localização / Bairro</label>
                        <input
                          type="text"
                          value={formState.location}
                          onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                          placeholder="Ex: Adrianópolis, Manaus"
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase flex items-center gap-1"><MapPin className="w-3 h-3" /> Link do Google Maps (Opcional)</label>
                        <input
                          type="url"
                          value={formState.map_url}
                          onChange={(e) => setFormState({ ...formState, map_url: e.target.value })}
                          placeholder="https://goo.gl/maps/..."
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 p-3 bg-white border border-gray-100 rounded-xl">
                        <input
                          type="checkbox"
                          id="is_for_sale"
                          checked={formState.is_for_sale}
                          onChange={(e) => setFormState({ ...formState, is_for_sale: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <label htmlFor="is_for_sale" className="text-xs font-bold text-gray-600 uppercase">Disponível para Venda</label>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-white border border-gray-100 rounded-xl">
                        <input
                          type="checkbox"
                          id="is_for_rent"
                          checked={formState.is_for_rent}
                          onChange={(e) => setFormState({ ...formState, is_for_rent: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <label htmlFor="is_for_rent" className="text-xs font-bold text-gray-600 uppercase">Disponível para Aluguel</label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Capa do Produto</label>
                  <div className="relative h-40 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden group transition-colors hover:border-blue-300">
                    {formState.image ? (
                      <img src={formState.image} className="w-full h-full object-contain p-2" alt="Preview" />
                    ) : (
                      <Camera className="w-10 h-10 text-gray-300" />
                    )}
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity backdrop-blur-[2px]">
                      <span className="bg-white/20 px-4 py-2 rounded-full font-bold text-sm backdrop-blur-md">Alterar</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'image')} />
                    </label>
                    {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Tabela Consórcio</label>
                    <button
                      type="button"
                      onClick={() => setFormState(prev => ({ ...prev, has_consortium: !prev.has_consortium }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formState.has_consortium ? 'bg-emerald-500' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formState.has_consortium ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className={`relative h-40 bg-gray-50 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden group transition-all ${
                    formState.has_consortium ? 'border-gray-200 hover:border-blue-300' : 'border-red-200 opacity-50 grayscale'
                  }`}>
                    {formState.consortium_image ? (
                      <img src={formState.consortium_image} className="w-full h-full object-contain p-2" alt="Preview" />
                    ) : (
                      <Camera className="w-10 h-10 text-gray-300" />
                    )}
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity backdrop-blur-[2px]">
                      <span className="bg-white/20 px-4 py-2 rounded-full font-bold text-sm backdrop-blur-md">Alterar</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'consortium_image')} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Galeria de Imagens (Até 5)</label>
                <div className="grid grid-cols-5 gap-2">
                  {formState.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group">
                      <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                      <button 
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {formState.images.length < 5 && (
                    <label className="aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 transition-colors">
                      <Plus className="w-6 h-6 text-gray-300" />
                      <span className="text-[10px] text-gray-400 font-bold mt-1">Adicionar</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleGalleryUpload} />
                    </label>
                  )}
                </div>
              </div>

              {/* Seção Plano de Consórcio Detalhado */}
              <div className="bg-purple-50/50 p-6 rounded-3xl border border-purple-100 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-800">Planos de Consórcio</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Habilitar Planos</span>
                    <button
                      type="button"
                      onClick={() => setFormState(prev => ({ ...prev, show_consortium_plans: !prev.show_consortium_plans }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formState.show_consortium_plans ? 'bg-purple-600' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formState.show_consortium_plans ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                {formState.show_consortium_plans && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-3">
                      {formState.consortium_plans.map((plan, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white border border-purple-100 rounded-2xl shadow-sm">
                          <div className="flex items-center gap-4">
                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">{plan.installments}x</span>
                            <span className="text-gray-700 font-medium">de <span className="text-purple-700 font-bold">R$ {plan.value}</span> /mês</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => removePlan(idx)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border-none bg-transparent"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-white border border-dashed border-purple-200 rounded-2xl flex flex-wrap items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">Quantidade</span>
                        <input
                          type="number"
                          value={newPlan.installments || ''}
                          onChange={(e) => setNewPlan({ ...newPlan, installments: parseInt(e.target.value) || 0 })}
                          placeholder="Qtd"
                          className="w-24 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-center font-bold"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">Valor da Parcela</span>
                        <input
                          type="text"
                          value={newPlan.value}
                          onChange={handlePlanValueChange}
                          placeholder="0,00"
                          className="w-32 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-bold"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addPlan}
                        className="mt-5 px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs uppercase hover:bg-purple-700 transition-colors shadow-lg shadow-purple-100"
                      >
                        + Add Plano
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Seção Plano de Financiamento */}
              <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-800">Planos de Financiamento</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Habilitar Planos</span>
                    <button
                      type="button"
                      onClick={() => setFormState(prev => ({ ...prev, show_financing_plans: !prev.show_financing_plans }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formState.show_financing_plans ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formState.show_financing_plans ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                {formState.show_financing_plans && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase text-blue-600">Valor à Vista</label>
                        <input
                          type="text"
                          value={formState.cash_price}
                          onChange={handleCashPriceChange}
                          placeholder="R$ 0,00"
                          className="w-full px-4 py-2.5 bg-white border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-blue-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase text-blue-600">Parcelas Cartão</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formState.card_installments}
                            onChange={handleCardInstallmentsChange}
                            placeholder="Ex: 10"
                            className="w-full px-4 py-2.5 bg-white border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-8"
                          />
                          {formState.card_installments && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">x</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center pt-5">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={formState.card_interest}
                            onChange={(e) => setFormState({ ...formState, card_interest: e.target.checked })}
                            className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-blue-200 rounded-lg cursor-pointer"
                          />
                          <span className="text-xs font-bold text-gray-500 group-hover:text-blue-600 transition-colors uppercase select-none">Com Juros</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-tight">Opções de Financiamento</label>
                      {formState.financing_plans.map((plan, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white border border-blue-100 rounded-2xl shadow-sm">
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-gray-400 uppercase">Entrada:</span>
                              <span className="text-blue-700 font-bold">R$ {plan.down_payment}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-gray-400 uppercase">Restante:</span>
                              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{plan.installments}x</span>
                              <span className="text-gray-700 font-medium font-heading">de <span className="text-blue-700 font-bold">R$ {plan.value}</span> /mês</span>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => removeFinancingPlan(idx)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-white border border-dashed border-blue-200 rounded-2xl flex flex-wrap items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">Entrada</span>
                        <input
                          type="text"
                          value={newFinancingPlan.down_payment}
                          onChange={handleFinancingDownPaymentChange}
                          placeholder="R$ 0,00"
                          className="w-32 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">Parcelas</span>
                        <input
                          type="number"
                          value={newFinancingPlan.installments || ''}
                          onChange={(e) => setNewFinancingPlan({ ...newFinancingPlan, installments: parseInt(e.target.value) || 0 })}
                          placeholder="Qtd"
                          className="w-20 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-center font-bold"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">Valor Parcela</span>
                        <input
                          type="text"
                          value={newFinancingPlan.value}
                          onChange={handleFinancingValueChange}
                          placeholder="R$ 0,00"
                          className="w-32 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addFinancingPlan}
                        className="mt-5 flex items-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {formState.has_liberacred && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider text-orange-600">Banner Customizado Liberacred</label>
                  <div className="relative h-40 bg-orange-50 rounded-2xl border-2 border-dashed border-orange-200 flex flex-col items-center justify-center overflow-hidden group transition-colors hover:border-orange-300">
                    {formState.liberacred_image ? (
                      <img src={formState.liberacred_image} className="w-full h-full object-contain p-2" alt="Preview" />
                    ) : (
                      <Camera className="w-10 h-10 text-orange-200" />
                    )}
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity backdrop-blur-[2px]">
                      <span className="bg-white/20 px-4 py-2 rounded-full font-bold text-sm backdrop-blur-md">Anexar Banner</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'liberacred_image')} />
                    </label>
                  </div>
                </div>
              )}

              {/* Opcionais */}
              <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-bold text-gray-800">Opcionais</h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">{userNiche === 'realestate' ? 'Selecione os opcionais e comodidades do imóvel' : 'Selecione os opcionais disponíveis no veículo'}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CURRENT_OPTIONALS.map((optional) => (
                    <label key={optional} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl cursor-pointer hover:border-blue-200 transition-all hover:shadow-sm">
                      <input
                        type="checkbox"
                        checked={formState.optionals.includes(optional)}
                        onChange={(e) => {
                          const newOptionals = e.target.checked
                            ? [...formState.optionals, optional]
                            : formState.optionals.filter(o => o !== optional);
                          setFormState({ ...formState, optionals: newOptionals });
                        }}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-200 rounded-lg cursor-pointer"
                      />
                      <span className="text-sm text-gray-600 font-medium">{optional}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-6 bg-blue-50/50 border border-blue-100 rounded-[2rem]">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-2xl transition-all border border-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-4 bg-[#003da5] hover:bg-[#002b75] text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {editingId ? 'Salvar Alterações' : 'Cadastrar Produto'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Produtos */}
      <div className="grid grid-cols-1 gap-4">
        {products.length === 0 ? (
          <div className="bg-white p-20 rounded-[2.5rem] border-2 border-dashed border-gray-100 text-center text-gray-400">
            <Package className="w-16 h-16 mx-auto mb-6 opacity-10" />
            <p className="text-xl font-medium">Seu catálogo está vazio</p>
            <p className="text-sm opacity-60">Comece adicionando seu primeiro produto acima.</p>
          </div>
        ) : (
          products
            .filter(product => 
              product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
              product.description?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((product) => (
            <div 
              key={product.id} 
              className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex items-center gap-6 group hover:shadow-xl hover:shadow-blue-50/50 transition-all animate-in slide-in-from-bottom-4 duration-500"
            >
              <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gray-50 rounded-3xl overflow-hidden flex-shrink-0 border border-gray-50 group-hover:scale-105 transition-transform duration-500">
                <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 truncate font-heading group-hover:text-blue-600 transition-colors uppercase">{product.name}</h3>
                  {product.niche === 'realestate' && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full border border-blue-100">
                      Imóvel
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                  <div className="flex items-center gap-1.5 text-blue-600 font-bold text-base lg:text-lg">
                    R$ {product.price}
                  </div>
                  {product.year && (
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      <Check className="w-3.5 h-3.5" />
                      {product.year}
                    </div>
                  )}
                  <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${product.is_active !== false ? 'text-emerald-500' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${product.is_active !== false ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                    {product.is_active !== false ? 'Ativo' : 'Inativo'}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <div className="flex flex-col items-center">
                    <label className="relative inline-flex items-center cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={product.is_active !== false}
                        onChange={async (e) => {
                          e.stopPropagation();
                          const oldStatus = product.is_active !== false;
                          const newStatus = !oldStatus;
                          setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: newStatus } : p));
                          try {
                            const res = await fetch(`/api/products/${product.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ is_active: newStatus })
                            });
                            if (res.ok) {
                              toast.success(newStatus ? 'Produto Ativado!' : 'Produto Desativado!');
                              fetchProducts();
                            } else {
                              const err = await res.json();
                              toast.error(err.error || 'Erro ao atualizar status');
                              setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: oldStatus } : p));
                            }
                          } catch (err) {
                            toast.error('Erro de conexão ao atualizar status');
                            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: oldStatus } : p));
                          }
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <span className={`text-[8px] font-bold uppercase mt-1 ${product.is_active !== false ? 'text-blue-600' : 'text-gray-400'}`}>
                      {product.is_active !== false ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDuplicate(product)}
                      className="p-3.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-2xl transition-all"
                      title="Duplicar"
                    >
                      <Copy className="w-5 h-5 lg:w-6 lg:h-6" />
                    </button>
                    <button 
                      onClick={() => handleEdit(product)}
                      className="p-3.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all"
                      title="Editar"
                    >
                      <Edit2 className="w-5 h-5 lg:w-6 lg:h-6" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-3.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-2xl transition-all"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5 lg:w-6 lg:h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {confirmConfig?.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full text-center"
          >
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-heading">{confirmConfig.title}</h3>
            <p className="text-gray-500 text-sm mb-8">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmConfig(null)}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmConfig.onConfirm}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-100"
              >
                Excluir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
