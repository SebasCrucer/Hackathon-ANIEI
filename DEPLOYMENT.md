# 🚀 Deployment Guide

Esta guía explica cómo deployar la aplicación con serverless functions (Vercel o Netlify).

## 🔐 Arquitectura Segura

La aplicación ahora usa serverless functions para mantener tu API key de OpenAI segura:

```
Frontend (Browser) → Serverless Function → OpenAI API
                     ↑
                     Tu API key está aquí (segura)
```

## Opción 1: Deploy en Vercel (Recomendado)

### 1. Instalar Vercel CLI

```bash
npm i -g vercel
```

### 2. Configurar Variables de Entorno

En el dashboard de Vercel o usando CLI:

```bash
vercel env add OPENAI_API_KEY
# Pega tu API key cuando se solicite
```

O en el dashboard:
- Ve a tu proyecto → Settings → Environment Variables
- Agrega: `OPENAI_API_KEY` = `sk-tu-api-key-aqui`

### 3. Deploy

```bash
vercel
```

O conecta tu repo de GitHub y Vercel hará deploy automático.

### 4. La app estará disponible en:
```
https://tu-proyecto.vercel.app
```

El endpoint será: `https://tu-proyecto.vercel.app/api/analyze-emotion`

## Opción 2: Deploy en Netlify

### 1. Instalar Netlify CLI

```bash
npm i -g netlify-cli
```

### 2. Configurar Variables de Entorno

```bash
netlify env:set OPENAI_API_KEY sk-tu-api-key-aqui
```

O en el dashboard de Netlify:
- Site Settings → Environment Variables
- Agrega: `OPENAI_API_KEY` = `sk-tu-api-key-aqui`

### 3. Actualizar `.env` local

Para Netlify, cambia el endpoint:

```bash
VITE_API_ENDPOINT=/.netlify/functions/analyze-emotion
```

### 4. Deploy

```bash
netlify deploy --prod
```

O conecta tu repo de GitHub y Netlify hará deploy automático.

### 5. La app estará disponible en:
```
https://tu-proyecto.netlify.app
```

El endpoint será: `https://tu-proyecto.netlify.app/.netlify/functions/analyze-emotion`

## 📁 Estructura de Archivos Serverless

### Vercel
```
api/
  └── analyze-emotion.ts  ← Serverless function
vercel.json               ← Configuración de Vercel
```

### Netlify
```
netlify/
  └── functions/
      └── analyze-emotion.ts  ← Serverless function
netlify.toml                  ← Configuración de Netlify
```

## 🔧 Variables de Entorno

### En el servidor (Vercel/Netlify)
```bash
OPENAI_API_KEY=sk-tu-api-key-real
```

### En tu .env local (frontend)
```bash
# Para Vercel
VITE_API_ENDPOINT=/api/analyze-emotion

# Para Netlify
VITE_API_ENDPOINT=/.netlify/functions/analyze-emotion

# Configuración
VITE_TARGET_FPS=15
VITE_SMOOTHING_WINDOW=2.5
```

## 🧪 Probar Localmente

### Con Vercel Dev

```bash
vercel dev
```

Esto ejecutará tanto el frontend como las serverless functions localmente.

### Con Netlify Dev

```bash
netlify dev
```

Esto ejecutará tanto el frontend como las functions localmente.

## ✅ Ventajas de Esta Arquitectura

1. ✅ **API Key Segura**: Nunca se expone al cliente
2. ✅ **Sin Backend Complejo**: Solo serverless functions
3. ✅ **Auto-scaling**: Escala automáticamente con el tráfico
4. ✅ **Deploy Simple**: Un solo comando
5. ✅ **Mismo Dominio**: No hay problemas de CORS
6. ✅ **DDD Intacto**: Solo cambiamos la capa de infraestructura

## 🔄 Cómo Funciona

### Frontend (`OpenAIEmotionService.ts`)
```typescript
// Llama a nuestro endpoint seguro
const response = await fetch('/api/analyze-emotion', {
  method: 'POST',
  body: JSON.stringify({ imageBase64 })
});
```

### Serverless Function (`api/analyze-emotion.ts`)
```typescript
// Usa la API key del servidor (segura)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY  // ✅ Segura
});
```

## 🐛 Troubleshooting

### Error: "API key not configured"
- Verifica que configuraste `OPENAI_API_KEY` en las variables de entorno del servidor
- Para Vercel: `vercel env ls`
- Para Netlify: `netlify env:list`

### Error: "CORS error"
- Las funciones ya incluyen headers CORS (`Access-Control-Allow-Origin: *`)
- Si usas un dominio personalizado, actualiza los headers CORS

### Error: "Function timeout"
- OpenAI puede tardar 1-2 segundos
- Vercel: 10s timeout (Hobby), 60s (Pro)
- Netlify: 10s timeout (Free), 26s (Pro)

### Error: "Rate limit exceeded"
- Implementa rate limiting en el frontend
- O usa Redis/KV storage para rate limiting en el backend

## 📊 Monitoreo

### Vercel
- Dashboard → Tu proyecto → Functions
- Ver logs, invocaciones, y errores

### Netlify
- Dashboard → Tu proyecto → Functions
- Ver logs y analytics

## 💰 Costos Estimados

### Vercel (Hobby - Free)
- 100GB bandwidth
- 100 GB-hours serverless execution
- Más que suficiente para MVP

### Netlify (Free)
- 100GB bandwidth
- 125K function requests/mes
- Más que suficiente para MVP

### OpenAI API
- GPT-4o-mini: ~$0.001 por imagen
- A 15 FPS: ~$54/hora de uso continuo
- En práctica: mucho menos (uso intermitente)

## 🚀 Deploy en 3 Pasos

### Para Vercel:
```bash
# 1. Configurar API key
vercel env add OPENAI_API_KEY

# 2. Deploy
vercel

# 3. Listo!
```

### Para Netlify:
```bash
# 1. Configurar API key
netlify env:set OPENAI_API_KEY sk-...

# 2. Actualizar .env local
echo "VITE_API_ENDPOINT=/.netlify/functions/analyze-emotion" > .env

# 3. Deploy
netlify deploy --prod
```

## 🎯 Próximos Pasos

Una vez deployado:
1. ✅ Abre la URL de tu app
2. ✅ Permite permisos de cámara
3. ✅ ¡Disfruta del análisis de emociones seguro!

## 🔒 Seguridad

- ✅ API key en servidor (no en cliente)
- ✅ HTTPS por defecto
- ✅ CORS configurado
- ✅ Sin almacenamiento de imágenes
- ✅ Sin logs de frames de video

---

**¿Preguntas?** Revisa los logs de la función serverless para debugging.

