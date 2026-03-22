import React, { useEffect } from 'react';

export default function Register() {
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        const phone = data.default_phone || '5548935001794';
        const url = `https://wa.me/${phone}?text=${encodeURIComponent('Olá, gostaria de saber mais sobre o Smart Cartão.')}`;
        window.location.href = url;
      })
      .catch(() => {
        window.location.href = 'https://wa.me/5548935001794';
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 italic font-bold text-slate-400 uppercase tracking-widest text-center">
      <div className="animate-pulse">
        Redirecionando para o suporte...
      </div>
    </div>
  );
}
