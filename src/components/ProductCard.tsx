import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { motion } from 'motion/react';
import { MessageCircle, Info, FileText, Calculator, CreditCard, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import Modal from './Modal';
import FinancingForm from './FinancingForm';
import ThreeSixtyViewer from './ThreeSixtyViewer';

export interface ProductCardProps {
  product: Product;
  whatsappNumber?: string;
  primaryColor?: string;
  backgroundColor?: string;
  activeModalProductId?: number | null;
  onCloseModal?: () => void;
}

export default function ProductCard({ 
  product, 
  whatsappNumber, 
  primaryColor, 
  backgroundColor,
  activeModalProductId,
  onCloseModal
}: ProductCardProps) {
  const [activeModal, setActiveModal] = useState<'about' | 'consortium' | 'financing' | 'liberacred' | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);

  const themeColor = primaryColor || '#003da5';
  const allImages = [product.image, ...(product.images || [])];

  const handleWhatsApp = () => {
    const phone = whatsappNumber || '5597984094999';
    const message = `Olá! Vim pelo seu Cartão Digital. Tenho interesse na ${product.name}. Pode falar mais sobre ela?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  useEffect(() => {
    if (activeModal === 'about' && allImages.length > 1 && !isAutoPlayPaused) {
      const timer = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [activeModal, allImages.length, isAutoPlayPaused]);

  useEffect(() => {
    let timeout: any;
    if (isAutoPlayPaused) {
      timeout = setTimeout(() => {
        setIsAutoPlayPaused(false);
      }, 5000);
    }
    return () => clearTimeout(timeout);
  }, [isAutoPlayPaused]);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAutoPlayPaused(true);
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAutoPlayPaused(true);
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  useEffect(() => {
    if (activeModalProductId === product.id) {
      setActiveModal('about');
    }
  }, [activeModalProductId, product.id]);

  const handleModalClose = () => {
    setActiveModal(null);
    if (onCloseModal) onCloseModal();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-2xl hover:shadow-gray-300/40 transition-all duration-300"
    >
      <div className="p-4 flex flex-col items-center text-center flex-grow">
        <div className="relative w-full aspect-[4/3] mb-4 group overflow-hidden rounded-xl">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="w-full h-1.5 mb-6 transition-colors rounded-full" style={{ backgroundColor: themeColor }} />

        <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-tight">{product.name}</h3>
        
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() => setActiveModal('about')}
            className="w-full py-2 px-4 text-white rounded-md transition-all text-xs font-bold uppercase hover:brightness-110"
            style={{ backgroundColor: themeColor }}
          >
            Sobre a moto
          </button>
          
          {product.has_consortium !== false && (
            <button
              onClick={() => setActiveModal('consortium')}
              className="w-full py-2 px-4 bg-[#3b71ca] hover:bg-[#305eb0] text-white rounded-md transition-all text-xs font-bold uppercase"
            >
              Plano de Consórcio
            </button>
          )}
          
          <button
            onClick={() => setActiveModal('financing')}
            className="w-full py-2 px-4 bg-[#a8328f] hover:bg-[#8a2975] text-white rounded-md transition-colors text-xs font-bold uppercase"
          >
            Financiamento
          </button>

          {product.hasLiberacred && (
            <button
              onClick={() => setActiveModal('liberacred')}
              className="w-full py-2 px-4 bg-[#f9a825] hover:bg-[#f57f17] text-white rounded-md transition-colors text-xs font-bold uppercase"
            >
              Liberacred
            </button>
          )}
          
          <button
            onClick={handleWhatsApp}
            className="w-full py-2 px-4 bg-[#5cb85c] hover:bg-[#4cae4c] text-white rounded-md transition-colors text-xs font-bold uppercase flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-3 h-3" />
            Entrar em contato
          </button>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={activeModal === 'about'}
        onClose={handleModalClose}
        title={`Sobre a ${product.name}`}
      >
        <div className="space-y-6">
          {product.threeSixtyImages ? (
            <ThreeSixtyViewer images={product.threeSixtyImages} />
          ) : (
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl bg-gray-50">
              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                src={allImages[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
              {allImages.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 shadow-lg rounded-full text-white transition-all z-20"
                    style={{ backgroundColor: themeColor }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 shadow-lg rounded-full text-white transition-all z-20"
                    style={{ backgroundColor: themeColor }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {allImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all border border-white/50 shadow-sm ${
                          idx === currentImageIndex ? 'scale-125' : 'bg-gray-300'
                        }`}
                        style={{ backgroundColor: idx === currentImageIndex ? themeColor : undefined }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          
            {/* Detalhes do Veículo */}
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
              {product.year && (
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Ano</p>
                  <p className="text-sm font-bold text-gray-800">{product.year}</p>
                </div>
              )}
              {product.price && (
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Preço</p>
                  <p className="text-sm font-bold text-emerald-600">R$ {product.price}</p>
                </div>
              )}
              {product.mileage && (
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Quilometragem</p>
                  <p className="text-sm font-bold text-gray-800">{product.mileage} km</p>
                </div>
              )}
              {product.brand && (
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Marca</p>
                  <p className="text-sm font-bold text-gray-800">{product.brand}</p>
                </div>
              )}
              {product.condition && (
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Condição</p>
                  <p className="text-sm font-bold text-gray-800">{product.condition}</p>
                </div>
              )}
              {product.fuel && (
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Combustível</p>
                  <p className="text-sm font-bold text-gray-800">{product.fuel}</p>
                </div>
              )}
              {product.transmission && (
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Câmbio</p>
                  <p className="text-sm font-bold text-gray-800">{product.transmission}</p>
                </div>
              )}
              {product.color && (
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Cor</p>
                  <p className="text-sm font-bold text-gray-800">{product.color}</p>
                </div>
              )}
            </div>

            {/* Opcionais */}
            {(product.optionals && (typeof product.optionals === 'string' ? JSON.parse(product.optionals) : product.optionals).length > 0) && (
              <div className="space-y-3">
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  Opcionais e Itens de Série
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {(typeof product.optionals === 'string' ? JSON.parse(product.optionals) : product.optionals).map((opt: string) => (
                    <div key={opt} className="flex items-center gap-2 text-[11px] text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="font-bold text-lg">Cores Disponíveis</h4>
              <div className="flex gap-3">
                {product.colors.map(color => (
                  <div
                    key={color}
                    className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            </div>
            <button
              onClick={handleWhatsApp}
              className="w-full py-4 px-6 flex items-center justify-center gap-2 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 mt-6"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageCircle className="w-6 h-6" />
              SOLICITAR CONSULTORIA NO WHATSAPP
            </button>
          </div>
        </Modal>

      <Modal
        isOpen={activeModal === 'consortium'}
        onClose={handleModalClose}
        title="Plano de Consórcio"
      >
        <div className="space-y-6">
          {product.show_consortium_plans && product.consortium_plans && product.consortium_plans.length > 0 && (
            <div className="grid grid-cols-1 gap-3">
              {product.consortium_plans.map((plan, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 bg-purple-50 border border-purple-100 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-4">
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-black">{plan.installments}x</span>
                    <span className="text-gray-700 font-medium">de <span className="text-purple-700 font-extrabold text-lg">R$ {plan.value}</span> /mês</span>
                  </div>
                  <Calculator className="w-5 h-5 text-purple-300" />
                </div>
              ))}
            </div>
          )}
          
          {product.consortiumPlanImage ? (
            <div className="space-y-4">
              {product.show_consortium_plans && <h4 className="font-bold text-gray-700 px-1">Tabela de Referência</h4>}
              <img src={product.consortiumPlanImage} alt="Plano de Consórcio" className="w-full rounded-xl shadow-md" referrerPolicy="no-referrer" />
            </div>
          ) : (!product.show_consortium_plans || !product.consortium_plans || product.consortium_plans.length === 0) && (
            <div className="p-8 text-center text-gray-500">
              Informações do plano de consórcio em breve.
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'financing'}
        onClose={handleModalClose}
        title="Simulação de Financiamento"
      >
        <FinancingForm 
          initialModel={product.name} 
          onSubmitSuccess={() => setActiveModal(null)} 
        />
      </Modal>

      <Modal
        isOpen={activeModal === 'liberacred'}
        onClose={handleModalClose}
        title="Liberacred"
      >
        <div className="space-y-4">
          <img 
            src={product.liberacredImage || "https://omeucartao.com.br/wp-content/uploads/2025/05/10-3.png"} 
            alt="Liberacred" 
            className="w-full rounded-xl" 
            referrerPolicy="no-referrer"
          />
          <p className="text-gray-600">
            O Liberacred é a facilidade que você precisava para conquistar sua Yamaha. Consulte condições especiais.
          </p>
        </div>
      </Modal>
    </motion.div>
  );
}
