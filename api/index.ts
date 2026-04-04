import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

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

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

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
    
    const isMaster = profile?.username === 'admin' || 
                    (profile as any)?.is_admin === true;

    if (!isMaster) {
      return res.status(403).json({ error: 'Acesso negado: você não tem permissão de Master Admin.' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Sessão inválida. Por favor, faça login novamente.' });
  }
};

// --- API ROUTES ---

// Public settings
app.get('/api/settings', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const { data, error } = await supabase.from('system_settings').select('*').eq('id', 1).single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Financial & Billing
app.get('/api/admin/faturas', authenticateMaster, async (req, res) => {
  const { data, error } = await supabase.from('faturas').select('*').order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Onboarding Routes
app.get('/api/admin/onboarding', authenticateMaster, async (req, res) => {
  const { data, error } = await supabase.from('onboarding_submissions').select('*').order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.post('/api/public/onboarding', async (req, res) => {
  const { 
    client_name, client_email, client_whatsapp, niche, setup_type, 
    product_estimated_count, business_name, business_location, 
    additional_notes, client_document, role_title, suggested_username, 
    client_logo_url, suggested_password 
  } = req.body;

  const { data, error } = await supabase.from('onboarding_submissions').insert([{
    client_name, client_email, client_whatsapp, niche, setup_type, 
    product_estimated_count, business_name, business_location, 
    additional_notes, client_document, role_title, suggested_username, 
    client_logo_url, suggested_password, status: 'pending'
  }]).select().single();
  
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.delete('/api/admin/onboarding/:id', authenticateMaster, async (req, res) => {
  const { error } = await supabase.from('onboarding_submissions').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

// Auth Routes
app.post('/api/auth/register', authenticateMaster, async (req, res) => {
  const { username, password, display_name, role_title, slug, plan_id, profile_image } = req.body;
  try {
    const { data: settings } = await supabase.from('system_settings').select('*').eq('id', 1).single();
    const default_logo = settings?.default_logo;

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: req.body.email || (username.includes('@') ? username : `${username}@smartcartao.com`),
      password: password,
      email_confirm: true
    });
    if (authError) throw authError;

    let expiryDate = null;
    if (plan_id) {
      const { data: plan } = await supabase.from('plans').select('*').eq('id', plan_id).single();
      if (plan) {
        const d = new Date();
        d.setMonth(d.getMonth() + plan.months);
        expiryDate = d.toISOString().split('T')[0];
      }
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ 
        id: authData.user.id, 
        username, 
        display_name, 
        role_title, 
        slug,
        profile_image: profile_image || default_logo,
        documento: req.body.documento || req.body.cpf || null,
        email: req.body.email || authData.user.email,
        plan_id: plan_id || null,
        expiry_date: expiryDate,
        is_admin: req.body.is_admin === true,
        niche: req.body.niche || 'vehicle',
        status: 'active'
      });
    if (profileError) throw profileError;

    res.json({ id: authData.user.id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const email = username.includes('@') ? username : `${username}@smartcartao.com`;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
    
    if (profile?.status === 'blocked') {
      return res.status(403).json({ error: 'Conta bloqueada.' });
    }

    const token = jwt.sign({ id: data.user.id, email: data.user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ user: { id: data.user.id, username, slug: profile?.slug, is_admin: profile?.is_admin || username === 'admin' } });
  } catch (err: any) {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

app.get('/api/me', authenticate, async (req: any, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', req.user.id).single();
  if (error) return res.status(404).json({ error: 'Perfil não encontrado' });
  res.json({ ...profile, is_admin: profile.is_admin || profile.username === 'admin' });
});

// Admin Stats
app.get('/api/admin/stats', authenticateMaster, async (req, res) => {
  try {
    const userRes = await supabase.from('profiles').select('id, username, is_admin, plan_id, status, views');
    const userProfiles = userRes.data || [];
    const totalViews = userProfiles.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const adminsCount = userProfiles.filter(u => u.username === 'admin' || u.is_admin === true).length;
    
    res.json({ 
      userCount: userProfiles.length, 
      totalViews,
      adminsCount,
      membersCount: userProfiles.length - adminsCount,
      activeCount: userProfiles.filter(u => u.status === 'active').length,
      inactiveCount: userProfiles.filter(u => u.status !== 'active').length
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Plans Management
app.get('/api/admin/plans', authenticateMaster, async (req, res) => {
  const { data: plans, error } = await supabase.from('plans').select('*').order('id', { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json(plans);
});

app.get('/api/public/plans', async (req, res) => {
  const { data: plans, error } = await supabase.from('plans').select('*').order('id', { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json(plans);
});

// --- SPA & SLUG HANDLING FOR VERCEL ---
app.get(['/', '/login', '/register', '/admin', '/admin/*', '/dashboard', '/dashboard/*', '/plans', '/onboarding', '/:slug', '/:slug/catalogo'], async (req, res, next) => {
  const originalUrl = req.originalUrl || req.url;
  
  if (originalUrl.startsWith('/api/') || (originalUrl.includes('.') && !originalUrl.startsWith('/admin/'))) {
    return next();
  }

  const { slug } = req.params;
  const isCatalog = req.path.endsWith('/catalogo');
  const reservedSlugs = ['login', 'register', 'admin', 'dashboard', 'api', 'plans', 'onboarding', 'assets', 'vite'];
  const isProfileSlug = slug && !reservedSlugs.includes(slug.toLowerCase()) && !originalUrl.includes('/', 1);
  
  try {
    const possiblePaths = [
      path.join(process.cwd(), 'dist', 'templ.html'),
      path.join(process.cwd(), 'dist', 'index.html'),
      path.join(process.cwd(), 'index.html')
    ];
    
    let indexPath = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        indexPath = p;
        break;
      }
    }

    if (!indexPath) return next();
    
    let html = fs.readFileSync(indexPath, 'utf-8');
    let title = 'Smart Cartão';
    let description = 'Crie seu cartão digital agora';
    
    const { data: settings } = await supabase.from('system_settings').select('*').eq('id', 1).single();
    let image = settings?.default_logo || 'https://smartcartao.com/og-default.png';

    if (isProfileSlug) {
      const { data: profile } = await supabase.from('profiles').select('*').ilike('slug', slug).single();
      if (profile) {
        title = isCatalog ? `Catálogo | ${profile.display_name}` : `${profile.display_name} - Smart Cartão`;
        description = profile.role_title || 'Meu Cartão Digital';
        image = profile.profile_image || profile.profile_banner_image || image;
      }
    }
    
    html = html.replaceAll('{{title}}', title)
               .replaceAll('{{description}}', description)
               .replaceAll('{{image}}', image);
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  } catch (err) {
    next();
  }
});

export default app;
