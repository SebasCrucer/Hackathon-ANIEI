# ⚡ Quick Start - Serverless Edition

## 🚀 En 5 Minutos

### Opción 1: Deploy a Vercel (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Configurar API key de OpenAI
vercel env add OPENAI_API_KEY
# Pegar tu key: sk-proj-...

# 3. Deploy
vercel

# 4. ¡Listo! Abre la URL que te da Vercel
```

### Opción 2: Deploy a Netlify

```bash
# 1. Instalar Netlify CLI
npm i -g netlify-cli

# 2. Configurar endpoint en .env
echo "VITE_API_ENDPOINT=/.netlify/functions/analyze-emotion" > .env

# 3. Configurar API key
netlify env:set OPENAI_API_KEY sk-proj-tu-key-aqui

# 4. Deploy
netlify deploy --prod

# 5. ¡Listo! Abre la URL que te da Netlify
```

## 🧪 Desarrollo Local

### Con Vercel Dev

```bash
# 1. Crear archivo con tu API key
echo "OPENAI_API_KEY=sk-proj-tu-key" > .env.local

# 2. Ejecutar
vercel dev

# 3. Abrir http://localhost:3000
```

### Con Netlify Dev

```bash
# 1. Crear archivos de configuración
echo "OPENAI_API_KEY=sk-proj-tu-key" > .env.local
echo "VITE_API_ENDPOINT=/.netlify/functions/analyze-emotion" > .env

# 2. Ejecutar
netlify dev

# 3. Abrir http://localhost:3000
```

## ⚠️ Importante

1. **Tu API key NUNCA va en el frontend**
   - ❌ NO: Poner en `.env` como `VITE_OPENAI_API_KEY`
   - ✅ SÍ: Configurar en Vercel/Netlify dashboard

2. **Usa el CLI correcto**
   - ❌ NO: `npm run dev` (no incluye serverless functions)
   - ✅ SÍ: `vercel dev` o `netlify dev`

3. **Endpoint correcto**
   - Vercel: `/api/analyze-emotion` (default)
   - Netlify: `/.netlify/functions/analyze-emotion`

## 📋 Checklist Pre-Deploy

- [ ] Tienes cuenta en Vercel o Netlify
- [ ] Tienes API key de OpenAI con GPT-4 Vision access
- [ ] Instalaste el CLI (`vercel` o `netlify-cli`)
- [ ] Configuraste la API key en el servidor (no en frontend)
- [ ] Si usas Netlify, actualizaste `VITE_API_ENDPOINT` en `.env`

## 🎯 Comandos Útiles

### Vercel

```bash
# Ver environment variables
vercel env ls

# Agregar nueva variable
vercel env add OPENAI_API_KEY

# Deploy a producción
vercel --prod

# Ver logs
vercel logs
```

### Netlify

```bash
# Ver environment variables
netlify env:list

# Agregar nueva variable
netlify env:set OPENAI_API_KEY sk-...

# Deploy a producción
netlify deploy --prod

# Ver logs
netlify functions:log
```

## 🐛 Problemas Comunes

### "API error: 500"
```bash
# Verifica que la API key esté configurada
vercel env ls  # o netlify env:list

# Si no está, agrégala
vercel env add OPENAI_API_KEY
```

### "Failed to fetch"
```bash
# Para Netlify, verifica el endpoint en .env
cat .env
# Debe decir: VITE_API_ENDPOINT=/.netlify/functions/analyze-emotion
```

### "Camera not working"
- Necesitas HTTPS o localhost
- Vercel/Netlify dan HTTPS automático ✓

## 📚 Más Info

- **Deploy completo**: Ver `DEPLOYMENT.md`
- **Arquitectura**: Ver `SECURE_ARCHITECTURE_COMPLETE.md`
- **Troubleshooting**: Ver `README.md`

## ✨ Lo Que Tienes Ahora

✅ API key segura en servidor  
✅ Frontend optimizado  
✅ Serverless functions  
✅ Auto-scaling  
✅ HTTPS by default  
✅ Deploy con un comando  
✅ Production-ready  

---

**¡Ahora a crear!** 🎨

