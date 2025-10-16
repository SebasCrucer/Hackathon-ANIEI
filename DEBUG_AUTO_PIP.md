# 🐛 Debug Auto-PiP - Guía de Resolución

## 🔧 Problema Resuelto

**Causa del bug**: El hook `useAutoPiP` se recreaba en cada render debido a dependencias cambiantes, causando que el event listener se removiera y agregara constantemente.

## ✅ Solución Implementada

Usamos **refs** para mantener referencias estables mientras el listener permanece activo:

```typescript
// ✅ CORRECTO - Refs mantienen valores actualizados
const isActiveRef = useRef(isActive);
const isPipActiveRef = useRef(isPipActive);

useEffect(() => {
  // Listener se registra UNA SOLA VEZ
  const handler = () => {
    if (isActiveRef.current && !isPipActiveRef.current) {
      // Usa valores actuales de los refs
    }
  };
  document.addEventListener('visibilitychange', handler);
  
  return () => document.removeEventListener('visibilitychange', handler);
}, []); // ← Empty deps!
```

## 🧪 Cómo Probar que Funciona

### 1. Ejecuta con logs de debug

```bash
vercel dev
```

### 2. Abre la consola del navegador

- Chrome: F12 o Cmd+Option+I (Mac) / Ctrl+Shift+I (Windows)
- Ve a la pestaña "Console"

### 3. Inicia la cámara

- Click "Iniciar Cámara"
- Permite permisos
- **Deberías ver en consola**:
  ```
  [Auto-PiP] Hook initialized, adding listener
  ```

### 4. Cambia de pestaña

- Abre otra pestaña (Cmd/Ctrl + T)
- O cambia a otra app (Alt+Tab / Cmd+Tab)

### 5. Verifica logs en consola

**Deberías ver esta secuencia:**

```
[Auto-PiP] Visibility change: {
  hidden: true,
  isActive: true,
  isPipActive: false
}
[Auto-PiP] Activating PiP automatically...
[App] Auto-PiP triggered, calling enterPiP
[App] Auto-PiP success, updating store
[Auto-PiP] Result: true
```

### 6. ¡Ventana PiP debería aparecer!

Si ves estos logs pero no aparece PiP, puede ser un problema del navegador (continúa leyendo).

## 🔍 Troubleshooting

### Caso 1: No aparecen logs de "[Auto-PiP] Visibility change"

**Problema**: Event listener no está registrado

**Solución**:
```bash
# Limpia y reinicia
rm -rf node_modules/.vite
vercel dev
```

### Caso 2: Log dice "isActive: false"

**Problema**: La cámara no está activa

**Verifica**:
1. ¿Presionaste "Iniciar Cámara"?
2. ¿Permitiste permisos de cámara?
3. ¿El video se está mostrando?

### Caso 3: Log dice "isPipActive: true"

**Problema**: PiP ya está activo

**Esto es correcto** - Auto-PiP solo activa si NO está ya en PiP.

### Caso 4: Log dice "No video element available"

**Problema**: Video element no está disponible

**Solución**:
```typescript
// Verifica en consola:
const pipeline = useEmotionPipeline();
console.log('Video element:', pipeline.getVideoElement());
```

Debería retornar un `<video>` element, no `null`.

### Caso 5: Logs correctos pero no aparece ventana

**Problema**: Navegador no soporta Document PiP o está bloqueado

**Verificaciones**:

1. **¿Navegador compatible?**
   - Chrome/Edge 111+: ✅ Document PiP
   - Firefox/Safari: ⚠️ Solo Video PiP (no funciona con Document PiP)

2. **¿Permisos bloqueados?**
   ```javascript
   // Ejecuta en consola:
   'documentPictureInPicture' in window
   // Debería retornar: true (Chrome/Edge 111+)
   ```

3. **¿Acción manual requerida?**
   En algunos navegadores, PiP requiere que el usuario haya interactuado primero:
   - Click manual "Modo PiP" una vez
   - Luego auto-PiP debería funcionar

## 🎯 Test Completo Paso a Paso

### Prueba 1: Click Manual (Baseline)

```
1. Inicia cámara
2. Click "Modo PiP" manualmente
3. ¿Aparece ventana? → SI: Browser OK ✓
                      → NO: Browser issue ✗
```

### Prueba 2: Auto-PiP

```
1. Reinicia app (cierra PiP si está abierto)
2. Inicia cámara
3. Abre consola (F12)
4. Cambia de pestaña
5. Verifica logs:
   - "[Auto-PiP] Visibility change" → ✓
   - "isActive: true" → ✓
   - "isPipActive: false" → ✓
   - "[Auto-PiP] Activating..." → ✓
   - "Result: true" → ✓
6. ¿Aparece ventana PiP? → SI: ¡Funciona! 🎉
                          → NO: Ver soluciones abajo
```

## 💡 Soluciones Alternativas

### Opción 1: Fallback a Video PiP

Si Document PiP no funciona, puedes forzar Video PiP:

```typescript
// En usePiP.ts, comenta Document PiP:
// if (capabilities.documentPiP) {
//   try { ... } catch { ... }
// }

// Solo deja Video PiP:
if (capabilities.videoPiP) {
  await videoElement.requestPictureInPicture();
  // ...
}
```

### Opción 2: Mostrar notificación

En lugar de activar PiP automáticamente, muestra un toast:

```typescript
if (document.hidden && currentIsActive && !currentIsPipActive) {
  // Mostrar notificación
  alert('💡 Cambiaste de pestaña. ¿Quieres activar PiP?');
  // O usa un toast library
}
```

### Opción 3: Esperar interacción de usuario

Algunos navegadores requieren que el usuario haya interactuado primero:

```typescript
let userHasInteracted = false;

document.addEventListener('click', () => {
  userHasInteracted = true;
}, { once: true });

// En auto-PiP:
if (document.hidden && userHasInteracted) {
  await enterPiP(videoElement);
}
```

## 🔬 Tests en Diferentes Browsers

### Chrome/Edge 111+ (Recomendado)

```
✅ Document PiP: Full support
✅ Auto-PiP: Should work
✅ Real-time updates: Yes
```

**Test**: Debería funcionar perfectamente

### Firefox

```
⚠️ Document PiP: No support
✅ Video PiP: Yes
⚠️ Auto-PiP: Partial (no real-time updates)
```

**Workaround**: Usar Video PiP fallback

### Safari

```
⚠️ Document PiP: No support
✅ Video PiP: Yes (limited)
⚠️ Auto-PiP: May require interaction
```

**Workaround**: Puede requerir click manual primero

## 📝 Checklist Final

Antes de reportar que "no funciona", verifica:

- [ ] ¿Ejecutaste `vercel dev`?
- [ ] ¿Abriste http://localhost:3000?
- [ ] ¿Presionaste "Iniciar Cámara"?
- [ ] ¿Permitiste permisos de cámara?
- [ ] ¿Video se está mostrando?
- [ ] ¿Abriste la consola del navegador (F12)?
- [ ] ¿Viste logs de "[Auto-PiP]"?
- [ ] ¿Cambiaste de pestaña (no minimizar ventana)?
- [ ] ¿Estás en Chrome/Edge 111+?
- [ ] ¿Probaste click manual "Modo PiP" primero?

## 🎉 Si Todo Funciona Correctamente

Deberías ver:

1. ✅ Logs en consola confirmando activación
2. ✅ Ventana PiP apareciendo automáticamente
3. ✅ Métricas actualizándose en tiempo real en PiP
4. ✅ Video stream sincronizado

## 🆘 Necesitas Más Ayuda?

**Comparte estos datos**:

```javascript
// Ejecuta en consola y comparte output:
console.log({
  browser: navigator.userAgent,
  documentPiP: 'documentPictureInPicture' in window,
  videoPiP: 'pictureInPictureEnabled' in document,
  hidden: document.hidden,
  visibilityState: document.visibilityState,
});
```

---

**Última actualización**: Debug logs agregados  
**Estado**: Refs implementados para estabilidad  
**Test**: Probado en Chrome 120+

