import React, { useEffect, useState } from 'react';
import { Instagram, Facebook, MessageCircle, ArrowLeft, Package } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const NovidadesSlider = ({ products, onProductClick }: { products: any[], onProductClick: (id: string | number) => void }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % products.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [products.length]);

  return (
    <div className="w-full h-full relative cursor-pointer group" onClick={() => onProductClick(products[index].id)}>
      <AnimatePresence mode="wait">
        <motion.img
          key={products[index].id}
          src={products[index].image}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.7, ease: "circOut" }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
      </AnimatePresence>
      
      <div className="absolute bottom-6 right-8 flex gap-2 z-20">
        {products.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? 'bg-gray-800 w-8 shadow-sm' : 'bg-gray-800/20 w-3 hover:bg-gray-800/40'}`} 
          />
        ))}
      </div>
    </div>
  );
};

export default function Catalog() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeModalProductId, setActiveModalProductId] = useState<string | number | null>(null);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      fetch(`/api/profile/${slug}`).then(res => res.json()),
      fetch('/api/settings').then(res => res.json())
    ]).then(([profileData, settingsData]) => {
      setData(profileData);
      setSettings(settingsData);
    })
    .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!data || data.error) return <div className="min-h-screen flex items-center justify-center text-red-500">Perfil não encontrado</div>;

  const { user, products } = data;

  const isDark = (color: string) => {
    const hex = (color || '#ffffff').replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 155;
  };

  const textColor = isDark(user.background_color) ? 'text-white' : 'text-gray-900';
  const subtitleColor = isDark(user.background_color) ? 'text-gray-300' : 'text-gray-500';

  return (
    <div 
      className="min-h-screen transition-colors duration-500"
      style={{ backgroundColor: user.background_color || '#ffffff' }}
    >
      {/* Header Bar */}
      <header 
        className="w-full py-4 px-6 flex items-center justify-between sticky top-0 z-40 transition-colors duration-500 shadow-md"
        style={{ backgroundColor: user.primary_color || '#003da5' }}
      >
        <button 
          onClick={() => navigate(`/${slug}`)}
          className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-white text-xl font-bold font-heading">Meu Catálogo</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-20">
        {/* Profile Info & Novidades Slider Section */}
        {/* Profile Info & Novidades Slider Section */}
        {products.filter((p: any) => p.is_new).length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            {/* Left: Profile Info */}
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-32 h-32 lg:w-44 lg:h-44 mb-4"
              >
                <img
                  src={user.profile_image || "https://omeucartao.com.br/wp-content/uploads/2024/11/Rose-256x300.png"}
                  alt={user.display_name}
                  className="w-full h-full object-cover rounded-full border-4 border-white shadow-xl"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <h2 className={`text-2xl lg:text-4xl font-bold mb-1 font-heading ${textColor}`}>{user.display_name}</h2>
              <p className={`${subtitleColor} text-sm lg:text-lg mb-8 uppercase tracking-widest font-medium opacity-80`}>{user.role_title}</p>
              
              {/* Social Icons Row */}
              <div className="flex gap-4">
                {user.instagram && (
                  <a href={user.instagram} target="_blank" className="p-3 bg-pink-500 text-white rounded-xl hover:scale-110 transition-transform shadow-lg shadow-pink-100">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                <a href={`https://wa.me/${user.whatsapp || '5597984094999'}`} target="_blank" className="p-3 bg-green-500 text-white rounded-xl hover:scale-110 transition-transform shadow-lg shadow-green-100">
                  <MessageCircle className="w-5 h-5" />
                </a>
                {user.facebook && (
                  <a href={user.facebook} target="_blank" className="p-3 bg-blue-600 text-white rounded-xl hover:scale-110 transition-transform shadow-lg shadow-blue-100">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Mobile: Novidades Slider (Below Profile, Above Highlights) */}
            <div className="lg:hidden w-full mt-8">
              <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden shadow-lg border border-gray-100">
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-purple-600 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Novidades</span>
                </div>
                <NovidadesSlider 
                  products={products.filter((p: any) => p.is_new)} 
                  onProductClick={(id) => setActiveModalProductId(id)}
                />
              </div>
            </div>

            {/* Right: Novidades Slider (Desktop only) */}
            <div className="hidden lg:block w-full">
              <div className="relative w-full aspect-[16/9] rounded-[2.5rem] overflow-hidden group">
                <div className="absolute top-6 left-6 z-10">
                  <span className="bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Novidades</span>
                </div>
                <NovidadesSlider 
                  products={products.filter((p: any) => p.is_new)} 
                  onProductClick={(id) => setActiveModalProductId(id)}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Profile Info Section Centered (No Novidades) */
          <div className="flex flex-col items-center text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-32 h-32 lg:w-44 lg:h-44 mb-4"
            >
              <img
                src={user.profile_image || "https://omeucartao.com.br/wp-content/uploads/2024/11/Rose-256x300.png"}
                alt={user.display_name}
                className="w-full h-full object-cover rounded-full border-4 border-white shadow-xl"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <h2 className={`text-2xl lg:text-4xl font-bold mb-1 font-heading ${textColor}`}>{user.display_name}</h2>
            <p className={`${subtitleColor} text-sm lg:text-lg mb-8 uppercase tracking-widest font-medium opacity-80`}>{user.role_title}</p>
            
            {/* Social Icons Row */}
            <div className="flex gap-4">
              {user.instagram && (
                <a href={user.instagram} target="_blank" className="p-3 bg-pink-500 text-white rounded-xl hover:scale-110 transition-transform shadow-lg shadow-pink-100">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              <a href={`https://wa.me/${user.whatsapp || '5597984094999'}`} target="_blank" className="p-3 bg-green-500 text-white rounded-xl hover:scale-110 transition-transform shadow-lg shadow-green-100">
                <MessageCircle className="w-5 h-5" />
              </a>
              {user.facebook && (
                <a href={user.facebook} target="_blank" className="p-3 bg-blue-600 text-white rounded-xl hover:scale-110 transition-transform shadow-lg shadow-blue-100">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Featured Products (Highlights) */}
        {products.filter((p: any) => p.is_highlighted).length > 0 && (
          <div className="mb-12">
            <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${textColor}`}>
              <div className="w-2 h-8 rounded-full" style={{ backgroundColor: user.primary_color || '#003da5' }} />
              Destaques
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {products
                .filter((p: any) => p.is_highlighted)
                .slice(0, 2)
                .map((product: any) => (
                  <div key={product.id}>
                    <ProductCard 
                      product={{
                        ...product,
                        colors: typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors,
                        hasLiberacred: !!product.has_liberacred,
                        consortiumPlanImage: product.consortium_image,
                        liberacredImage: product.liberacred_image,
                        images: typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []),
                        optionals: typeof product.optionals === 'string' ? JSON.parse(product.optionals) : (product.optionals || []),
                        show_consortium_plans: !!product.show_consortium_plans,
                        consortium_plans: typeof product.consortium_plans === 'string' ? JSON.parse(product.consortium_plans) : (product.consortium_plans || [])
                      }} 
                      whatsappNumber={user.whatsapp}
                      primaryColor={user.primary_color}
                      backgroundColor={user.background_color}
                      activeModalProductId={activeModalProductId}
                      onCloseModal={() => setActiveModalProductId(null)}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="mb-8">
          {products.filter((p: any) => p.is_highlighted).length > 0 && (
             <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${textColor}`}>
              <div className="w-2 h-8 rounded-full bg-gray-200" />
              Todos os Produtos
            </h3>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products
              .filter((p: any) => !products.filter((hp: any) => hp.is_highlighted).slice(0, 2).find((hp: any) => hp.id === p.id))
              .map((product: any) => (
                <div key={product.id}>
                  <ProductCard 
                    product={{
                      ...product,
                      colors: typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors,
                      hasLiberacred: !!product.has_liberacred,
                      consortiumPlanImage: product.consortium_image,
                      liberacredImage: product.liberacred_image,
                      images: typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []),
                      optionals: typeof product.optionals === 'string' ? JSON.parse(product.optionals) : (product.optionals || []),
                      show_consortium_plans: !!product.show_consortium_plans,
                      consortium_plans: typeof product.consortium_plans === 'string' ? JSON.parse(product.consortium_plans) : (product.consortium_plans || [])
                    }} 
                    whatsappNumber={user.whatsapp}
                    primaryColor={user.primary_color}
                    backgroundColor={user.background_color}
                    activeModalProductId={activeModalProductId}
                    onCloseModal={() => setActiveModalProductId(null)}
                  />
                </div>
              ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50/50 py-10 text-center px-6 border-t border-gray-100 italic">
        <div className="max-w-xl mx-auto space-y-2">
          <p className="text-gray-400 text-[10px] leading-relaxed">
            {settings?.footer_text && <span className="mr-1">{settings.footer_text} | </span>}
            Catálogo Digital Desenvolvido por: <span className="font-bold text-gray-700">Smart Cartão</span>
          </p>
          <a
            href={`https://wa.me/${settings?.default_phone || '5548935001794'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-xs font-bold hover:underline block"
          >
            Clique Aqui e faça o seu também!
          </a>
        </div>
      </footer>
    </div>
  );
}
