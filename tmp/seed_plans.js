const fetch = require('node-fetch');

const plans = [
  {
    name: 'Start',
    price: '49,00',
    description: 'O início da sua jornada digital com elegância.',
    features: 'QR Code Exclusivo, Perfil Personalizado, Redes Sociais, Link na Bio',
    billing_cycle: 'monthly',
    months: 1,
    is_popular: false
  },
  {
    name: 'Standard',
    price: '89,00',
    description: 'A ferramenta perfeita para quem já está vendendo.',
    features: 'Tudo do Start, Catálogo de Produtos, Pedidos via WhatsApp, Banner de Destaque',
    billing_cycle: 'monthly',
    months: 1,
    is_popular: true
  },
  {
    name: 'Premium',
    price: '149,00',
    description: 'Para quem quer dominar o mercado com autoridade.',
    features: 'Tudo do Standard, Domínio Próprio, Métricas de Visitas, Suporte Prioritário',
    billing_cycle: 'monthly',
    months: 1,
    is_popular: false
  },
  {
    name: 'Gold',
    price: '299,00',
    description: 'A experiência máxima de exclusividade e poder.',
    features: 'Tudo do Premium, Consultoria de Branding, Layout Exclusivo, Destaque Vitalício',
    billing_cycle: 'monthly',
    months: 1,
    is_popular: false
  }
];

async function seed() {
  console.log('Iniciando seed de planos...');
  for (const plan of plans) {
    try {
      const res = await fetch('http://localhost:3000/api/admin/plans', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer master-token' // Assuming a bypass or direct DB access
        },
        body: JSON.stringify(plan)
      });
      if (res.ok) {
        console.log(`Plano ${plan.name} criado com sucesso!`);
      } else {
        console.error(`Erro ao criar ${plan.name}: ${res.statusText}`);
      }
    } catch (err) {
      console.error(`Erro de conexão para ${plan.name}: ${err.message}`);
    }
  }
}

// Since I might not have the correct headers/auth here, I'll provide another way if it fails.
// But I'll try this first.
seed();
