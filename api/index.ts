import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// View Cooldown Cache
const viewCache: Record<string, number> = {};
const VIEW_COOLDOWN = 60 * 60 * 1000; // 1 hour

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Webhook Debug Logger
const addWebhookLog = async (data: any) => {
  try {
    await supabase.from('webhook_logs').insert([{
      event: data.event,
      payload: data.body,
      headers: data.headers
    }]);
  } catch (err) {
    console.error('[DEBUG-LOG] Failed to save webhook log:', err);
  }
};

// Auth Middlewares
const authenticate = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Não autorizado' });
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

const authenticateMaster = async (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Não autorizado' });
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', decoded.id).single();
    const isMaster = profile?.username === 'admin' || profile?.is_admin === true;
    if (!isMaster) return res.status(403).json({ error: 'Acesso negado Master' });
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Sessão inválida' });
  }
};

// --- API ROUTES (SYNCED WITH SERVER.TS) ---

app.get('/api/settings', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const { data, error } = await supabase.from('system_settings').select('*').eq('id', 1).single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.get('/api/public/settings', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const { data, error } = await supabase.from('system_settings').select('*').eq('id', 1).single();
  res.json(data || {});
});

app.get('/api/admin/settings', authenticateMaster, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const { data, error } = await supabase.from('system_settings').select('*').eq('id', 1).single();
  res.json(data);
});

app.put('/api/admin/settings', authenticateMaster, async (req, res) => {
  const { error } = await supabase.from('system_settings').update(req.body).eq('id', 1);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

// Stats, Testimonials, Plans
app.get('/api/testimonials', async (req, res) => {
  const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
  res.json(data || []);
});

app.get('/api/public/plans', async (req, res) => {
  const { data: plans, error } = await supabase.from('plans').select('*').order('id', { ascending: true });
  res.json(plans || []);
});

app.get('/api/admin/stats', authenticateMaster, async (req, res) => {
  try {
    const { data: profiles, error: pError } = await supabase.from('profiles').select('id, username, is_admin, plan_id, status, views, created_at');
    if (pError) throw pError;

    const userProfiles = profiles || [];
    const { data: plans } = await supabase.from('plans').select('*');
    
    // Simplificando contagem de novos usuários usando o campo created_at do banco
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersCount = userProfiles.filter(u => u.created_at && new Date(u.created_at) > thirtyDaysAgo).length;

    res.json({ 
      userCount: userProfiles.length, 
      totalViews: userProfiles.reduce((acc, curr) => acc + (curr.views || 0), 0),
      adminsCount: userProfiles.filter(u => u.username === 'admin' || u.is_admin === true).length,
      membersCount: userProfiles.length - userProfiles.filter(u => u.username === 'admin' || u.is_admin === true).length,
      planStats: (plans || []).map(p => ({
        name: p.name,
        count: userProfiles.filter(u => u.plan_id && Number(u.plan_id) === Number(p.id)).length
      })),
      newUsersCount,
      activeCount: userProfiles.filter(u => u.status === 'active').length,
      inactiveCount: userProfiles.filter(u => u.status !== 'active').length
    });
  } catch (err: any) {
    console.error('[STATS-ERROR]', err);
    res.status(500).json({ error: 'Erro ao processar estatísticas' });
  }
});

// Onboarding
app.post('/api/public/onboarding', async (req, res) => {
  const { error } = await supabase.from('onboarding_submissions').insert([req.body]);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

app.get('/api/admin/onboarding', authenticateMaster, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('onboarding_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    console.error('[ONBOARDING-FETCH-ERROR]', err);
    res.status(500).json({ error: 'Erro ao buscar submissões' });
  }
});

app.delete('/api/admin/onboarding/:id', authenticateMaster, async (req, res) => {
  await supabase.from('onboarding_submissions').delete().eq('id', req.params.id);
  res.json({ success: true });
});

// Auth & Profiles
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const email = username.includes('@') ? username : `${username}@smartcartao.com`;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: 'Erro de login' });
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
  const token = jwt.sign({ id: data.user.id, email: data.user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
  res.json({ user: { id: data.user.id, username, slug: profile?.slug, is_admin: profile?.is_admin || username === 'admin' } });
});

app.post('/api/auth/register', authenticateMaster, async (req, res) => {
  const { username, password, display_name, role_title, slug, plan_id, profile_image } = req.body;
  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: req.body.email || `${username}@smartcartao.com`,
      password,
      email_confirm: true
    });
    if (authError) throw authError;

    let expiryDate = null;
    if (plan_id) {
       const { data: plan } = await supabase.from('plans').select('months').eq('id', plan_id).single();
       if (plan) {
         const d = new Date();
         d.setMonth(d.getMonth() + plan.months);
         expiryDate = d.toISOString().split('T')[0];
       }
    }

    await supabase.from('profiles').insert({ 
      id: authData.user.id, username, display_name, role_title, slug,
      profile_image, documento: req.body.documento || req.body.cpf,
      plan_id, expiry_date: expiryDate, niche: req.body.niche || 'vehicle', status: 'active'
    });
    res.json({ id: authData.user.id });
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});

app.get('/api/me', authenticate, async (req: any, res) => {
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', req.user.id).single();
  if (!profile) return res.status(404).json({ error: 'Não encontrado' });
  res.json({ ...profile, is_admin: profile.is_admin || profile.username === 'admin' });
});

// Products
app.get('/api/products', authenticate, async (req: any, res) => {
  const { data } = await supabase.from('products').select('*').eq('user_id', req.user.id);
  res.json(data || []);
});

app.get('/api/profile/:slug', async (req, res) => {
  const { data: profile } = await supabase.from('profiles').select('*').eq('slug', req.params.slug).single();
  if (!profile) return res.status(404).json({ error: 'Perfil não encontrado' });
  await supabase.from('profiles').update({ views: (profile.views || 0) + 1 }).eq('id', profile.id);
  const { data: products } = await supabase.from('products').select('*').eq('user_id', profile.id);
  res.json({ user: profile, products: (products || []).filter(p => p.is_active !== false) });
});

// --- SPA & METADATA FOR VERCEL ---
app.get(['/', '/login', '/register', '/admin', '/admin/*', '/dashboard', '/dashboard/*', '/plans', '/onboarding', '/:slug', '/:slug/catalogo'], async (req, res, next) => {
  if (req.url.startsWith('/api/') || req.url.includes('.')) return next();

  const { slug } = req.params;
  const isCatalog = req.path.endsWith('/catalogo');
  const reserved = ['login', 'register', 'admin', 'dashboard', 'api', 'plans', 'onboarding', 'assets'];
  const isProfileSlug = slug && !reserved.includes(slug.toLowerCase()) && !req.url.includes('/', 1);
  
  try {
    const paths = [path.join(process.cwd(), 'dist', 'templ.html'), path.join(process.cwd(), 'dist', 'index.html'), path.join(process.cwd(), 'index.html')];
    let indexPath = paths.find(p => fs.existsSync(p)) || '';
    if (!indexPath) return next();
    
    let html = fs.readFileSync(indexPath, 'utf-8');
    let title = 'Smart Cartão', description = 'Crie seu cartão digital agora';
    const { data: settings } = await supabase.from('system_settings').select('*').eq('id', 1).single();
    let image = settings?.default_logo || 'https://smartcartao.com/og-default.png';

    if (isProfileSlug) {
      const { data: profile } = await supabase.from('profiles').select('*').ilike('slug', slug).single();
      if (profile) {
        title = isCatalog ? `Catálogo | ${profile.display_name}` : `${profile.display_name} - Smart Cartão`;
        description = profile.role_title || 'Meu Cartão Digital';
        image = profile.profile_image || image;
      }
    }
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html.replaceAll('{{title}}', title).replaceAll('{{description}}', description).replaceAll('{{image}}', image));
  } catch (err) { next(); }
});

export default app;
