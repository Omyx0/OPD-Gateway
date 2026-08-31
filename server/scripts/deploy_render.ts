import https from 'node:https';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.RENDER_API_KEY || '';

function req(path: string, method = 'GET', body: any = null): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'api.render.com',
      path: '/v1' + path,
      method,
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    };
    const request = https.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode || 200, data: JSON.parse(data || '{}') });
        } catch {
          resolve({ status: res.statusCode || 200, data });
        }
      });
    });
    request.on('error', reject);
    if (payload) request.write(payload);
    request.end();
  });
}

export async function deployToRender() {
  if (!token) {
    console.error('❌ RENDER_API_KEY environment variable is required.');
    process.exit(1);
  }

  console.log('🚀 Deploying Smart OPD Server to Render...');

  const payload = {
    type: 'web_service',
    name: 'smart-opd-gateway-api',
    ownerId: process.env.RENDER_OWNER_ID || '',
    repo: 'https://github.com/Omyx0/OPD-Gateway',
    autoDeploy: 'yes',
    branch: 'main',
    rootDir: 'server',
    serviceDetails: {
      env: 'node',
      plan: 'free',
      region: 'singapore',
      envSpecificDetails: {
        buildCommand: 'npm install && npm run build',
        startCommand: 'npm run start'
      },
      healthCheckPath: '/health',
      envVars: [
        { key: 'NODE_ENV', value: 'production' },
        { key: 'PORT', value: '5000' },
        { key: 'CLIENT_URL', value: process.env.CLIENT_URL || 'http://localhost:5173' },
        { key: 'SUPABASE_URL', value: process.env.SUPABASE_URL || '' },
        { key: 'SUPABASE_SERVICE_ROLE_KEY', value: process.env.SUPABASE_SERVICE_ROLE_KEY || '' },
        { key: 'SUPABASE_ANON_KEY', value: process.env.SUPABASE_ANON_KEY || '' },
        { key: 'GEMINI_API_KEY', value: process.env.GEMINI_API_KEY || '' },
        { key: 'GEMINI_TRIAGE_MODEL', value: process.env.GEMINI_TRIAGE_MODEL || 'gemini-2.5-flash' }
      ]
    }
  };

  const res = await req('/services', 'POST', payload);
  console.log('Status:', res.status);
  console.log('Response:', JSON.stringify(res.data, null, 2));
  return res;
}

deployToRender().catch(console.error);
