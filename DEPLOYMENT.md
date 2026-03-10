# 🚀 Guía de Despliegue en Railway

## Requisitos previos

- Cuenta en GitHub
- Cuenta en Railway
- Variables de entorno configuradas

## Pasos para desplegar

### 1. En Railway Dashboard

1. Ve a [railway.app](https://railway.app)
2. Crea un nuevo proyecto
3. Selecciona "Deploy from GitHub"
4. Conecta tu repositorio `dravinci-ai`
5. Railway detectará automáticamente que es un proyecto Next.js

### 2. Variables de Entorno en Railway

En el dashboard de Railway, agrega estas variables:

```
NEXT_PUBLIC_APP_URL=https://tu-app.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ANTHROPIC_API_KEY=sk-ant-your-key-here
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_MONTHLY_PRICE_ID=price_your_monthly_price_id
STRIPE_ANNUAL_PRICE_ID=price_your_annual_price_id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
NODE_ENV=production
```

### 3. Despliegue automático

Una vez configuradas las variables, Railway desplegará automáticamente cada vez que hagas push a la rama principal.

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Crear archivo .env.local
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
npm start
```

## Webhook de Stripe

Para recibir eventos de Stripe en producción:

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com)
2. Endpoints → Agregar endpoint
3. URL: `https://tu-app.railway.app/api/subscriptions/webhook`
4. Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Copia el webhook secret a Railway como `STRIPE_WEBHOOK_SECRET`

