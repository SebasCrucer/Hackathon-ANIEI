# 🔐 Actualización: Arquitectura Serverless Segura

## ✅ Cambios Implementados

Hemos actualizado la arquitectura para **mantener tu API key segura** usando serverless functions.

## 🔄 Qué Cambió

### Antes (Inseguro ❌)
```
Browser → OpenAI API directamente
  ↑
  API key expuesta en el bundle JS
```

### Ahora (Seguro ✅)
```
Browser → Tu Serverless Function → OpenAI API
            ↑
            API key segura en el servidor
```

## 📝 Archivos Modificados

### 1. Nuevas Serverless Functions

**`api/analyze-emotion.ts`** (Vercel)
- Endpoint: `/api/analyze-emotion`
- Recibe imagen base64
- Llama a OpenAI con API key del servidor
- Retorna métricas de emoción

**`netlify/functions/analyze-emotion.ts`** (Netlify)
- Endpoint: `/.netlify/functions/analyze-emotion`
- Misma funcionalidad que Vercel

### 2. Capa de Infraestructura Actualizada

**`src/infrastructure/services/OpenAIEmotionService.ts`**
- ❌ Eliminado: Llamada directa a OpenAI
- ❌ Eliminado: `dangerouslyAllowBrowser: true`
- ✅ Agregado: `fetch()` a nuestro endpoint seguro
- ✅ API key ahora es la URL del endpoint

### 3. Hook Actualizado

**`src/presentation/hooks/useEmotionPipeline.ts`**
- Cambió de `VITE_OPENAI_API_KEY` a `VITE_API_ENDPOINT`
- Ahora pasa el endpoint en lugar de la API key

### 4. Configuración

**`.env.example`**
```bash
# Antes
VITE_OPENAI_API_KEY=sk-...

# Ahora
VITE_API_ENDPOINT=/api/analyze-emotion
```

**`vercel.json`** (nuevo)
- Configuración para deploy en Vercel

**`netlify.toml`** (nuevo)
- Configuración para deploy en Netlify

### 5. UI Actualizada

**`src/presentation/components/PrivacyBanner.tsx`**
- Mensaje actualizado: "se procesan de forma segura a través de nuestro servidor"

## 🎯 Ventajas

1. ✅ **Seguridad**: API key nunca llega al navegador
2. ✅ **DDD Intacto**: Solo cambió la capa de infraestructura
3. ✅ **Mismo Código**: El resto de la app es idéntico
4. ✅ **Fácil Deploy**: Un comando (`vercel` o `netlify deploy`)
5. ✅ **Sin Servidor**: No necesitas mantener un backend
6. ✅ **Auto-scaling**: Escala con el tráfico

## 🚀 Cómo Usar

### Desarrollo Local con Vercel Dev

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Configurar API key localmente
# Crea .env.local en la raíz:
OPENAI_API_KEY=sk-tu-api-key-aqui

# 3. Ejecutar con Vercel Dev
vercel dev
```

### Desarrollo Local con Netlify Dev

```bash
# 1. Instalar Netlify CLI
npm i -g netlify-cli

# 2. Configurar .env local
VITE_API_ENDPOINT=/.netlify/functions/analyze-emotion

# 3. Crear .env.local para la function
OPENAI_API_KEY=sk-tu-api-key-aqui

# 4. Ejecutar con Netlify Dev
netlify dev
```

### Deploy a Producción

Ver `DEPLOYMENT.md` para instrucciones completas.

## 📊 Comparación de Código

### OpenAIEmotionService - Antes
```typescript
// ❌ Inseguro
this.client = new OpenAI({
  apiKey: config.apiKey,
  dangerouslyAllowBrowser: true  // API key expuesta
});

await this.client.chat.completions.create({...});
```

### OpenAIEmotionService - Ahora
```typescript
// ✅ Seguro
const response = await fetch(this.apiEndpoint, {
  method: 'POST',
  body: JSON.stringify({ imageBase64 })
});
// API key está en el servidor
```

## 🧩 Arquitectura DDD Preservada

```
Domain Layer          ← Sin cambios
  └── IEmotionDetector

Application Layer     ← Sin cambios
  └── EmotionPipeline

Infrastructure Layer  ← Solo esto cambió ✓
  └── OpenAIEmotionService (ahora llama a fetch)
  
Presentation Layer    ← Cambio mínimo
  └── useEmotionPipeline (cambia env var)
```

## 🔧 Variables de Entorno

### Servidor (Vercel/Netlify)
```bash
OPENAI_API_KEY=sk-tu-api-key-real  # ← Aquí está segura
```

### Cliente (Frontend)
```bash
# Para Vercel (default)
VITE_API_ENDPOINT=/api/analyze-emotion

# Para Netlify
VITE_API_ENDPOINT=/.netlify/functions/analyze-emotion
```

## ✨ Sin Cambios Necesarios En

- ✅ Domain Layer (entities, repositories, value objects)
- ✅ Application Layer (EmotionPipeline, QualityMonitor)
- ✅ Worker (emotion-worker.ts)
- ✅ Componentes UI (excepto PrivacyBanner)
- ✅ Store (Zustand)
- ✅ Otros hooks

## 🎯 Siguiente Paso

1. **Elige tu plataforma**: Vercel o Netlify
2. **Lee** `DEPLOYMENT.md`
3. **Deploy** con un comando
4. **Disfruta** de una app segura 🔒

---

**La belleza de DDD**: Cambiamos la implementación sin tocar el dominio 🎨

