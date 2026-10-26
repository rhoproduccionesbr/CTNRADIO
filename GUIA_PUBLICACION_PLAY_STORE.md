# 📱 Guía Oficial: Publicación de CTN Radio en Google Play Store (TWA)

Esta guía detalla el proceso completo para convertir la PWA de **CTN Radio** en una **Aplicación Nativa para Android** lista para publicar en la **Google Play Store**, utilizando **Trusted Web Activity (TWA)** con la herramienta oficial de Google: **Bubblewrap**.

---

## 🎯 ¿Cómo Funciona la Integración TWA?

* **Sincronización Automática:** La aplicación de Android carga directamente el sitio web optimizado en Vercel (`https://ctnradio.vercel.app/`). Cualquier cambio o actualización que hagas en la web estará **disponible inmediatamente en la App de Android** sin necesidad de subir nuevas versiones a la Play Store.
* **Experiencia Nativa:** Se ejecuta a pantalla completa (sin barra del navegador) con icono en el lanzador del teléfono, soporte de audio en segundo plano, pantalla de bloqueo con controles de reproducción e integración nativa de Android.

---

## 🛠️ Requisitos Previos

1. **Node.js:** Asegúrate de tener Node.js (v18 o superior) instalado en tu sistema.
2. **JDK 17 / Android SDK:** Recomendado tener instalado [Android Studio](https://developer.android.com/studio) para disponer de Java y las herramientas de firma de Android.
3. **Cuenta de Desarrollador en Google Play Console:** Requiere un pago único de $25 USD en [Google Play Console](https://play.google.com/console).

---

## 📋 Paso a Paso para la Generación y Publicación

### Paso 1: Instalar Bubblewrap CLI
Abre tu terminal (PowerShell o CMD) en la raíz del proyecto y ejecuta:

```bash
npm install -g @bubblewrap/cli
```

---

### Paso 2: Inicializar el Proyecto de Android

Ejecuta el siguiente comando (puedes usar el script que agregamos a `package.json`):

```bash
npm run twa:init
```

O directamente:

```bash
bubblewrap init --manifest=twa-manifest.json
```

**Durante la inicialización, Bubblewrap te solicitará:**
1. Ubicación de Java JDK y Android SDK (Bubblewrap puede descargarlos automáticamente si no los encuentra).
2. Crear un archivo de claves de firma (`android-keystore.jks`).
   - Guardarás una contraseña para la clave (ejemplo: guardar en un lugar seguro).
   - Alias sugerido: `ctnradio`

---

### Paso 3: Obtener la Huella Digital SHA-256 de tu Keystore

Para que Google y Android verifiquen que la app pertenece a tu sitio web y eliminen la barra del navegador, necesitas extraer la **huella digital SHA-256**:

```bash
keytool -list -v -keystore android-keystore.jks -alias ctnradio
```

Busca la línea que dice **SHA256:** (un código hexadecimal como `12:34:56:78:90:AB:...`).

---

### Paso 4: Actualizar `public/.well-known/assetlinks.json`

Abre el archivo [public/.well-known/assetlinks.json](file:///C:/Users/Rodrigo/StudioProjects/CTNRADIO/public/.well-known/assetlinks.json) en este repositorio y reemplaza el valor de `sha256_cert_fingerprints`:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.ctnradio.app",
      "sha256_cert_fingerprints": [
        "PEGA_AQUÍ_TU_HUELLA_SHA256"
      ]
    }
  }
]
```

Asegúrate de hacer **Commit y Sync** a GitHub para que Vercel publique este archivo en `https://ctnradio.vercel.app/.well-known/assetlinks.json`. Puedes probar que funciona abriendo esa URL en tu navegador.

---

### Paso 5: Compilar el Paquete `.aab` para Google Play Store

Ejecuta el comando de compilación:

```bash
npm run twa:build
```

Esto generará el archivo ejecutable optimizado:
`app-release-signed.aab`

---

### Paso 6: Crear la Aplicación en Google Play Console

1. Inicia sesión en [Google Play Console](https://play.google.com/console).
2. Haz clic en **Crear aplicación**.
   - **Nombre de la app:** CTN Radio
   - **Idioma predeterminado:** Español (América Latina / Paraguay)
   - **Tipo de aplicación:** Aplicación / Gratis
3. Ve a la sección **Producción** (o Pruebas Internas) y sube el archivo `app-release-signed.aab`.
4. Si activas el servicio **Google Play App Signing** (Firma de aplicaciones de Google Play), Google Play te mostrará una segunda huella digital SHA-256 de producción. Agrégala como un segundo elemento dentro del arreglo `sha256_cert_fingerprints` en `assetlinks.json`:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.ctnradio.app",
      "sha256_cert_fingerprints": [
        "TU_HUELLA_SHA256_LOCAL",
        "HUELLA_SHA256_GOOGLE_PLAY_SIGNING"
      ]
    }
  }
]
```

---

### Paso 7: Completar la Ficha de la Tienda

Sube los recursos requeridos por Google Play:
- **Ícono de la aplicación:** 512 x 512 px PNG (puedes usar `/public/splash-icon.png`).
- **Gráfico con funciones (Feature Graphic):** 1024 x 500 px.
- **Capturas de pantalla:** Mínimo 2 capturas de teléfono mostrando la app en funcionamiento.
- **Política de Privacidad:** Agrega la URL pública de tu política de privacidad (ej. `https://ctnradio.vercel.app/contacto`).
- **Clasificación de contenido:** Completa el cuestionario rápido de Google (Categoría: Música y Audio / Noticias).

---

## 🔄 ¿Cómo Actualizar la Aplicación en el Futuro?

* **Cambios en la interfaz, reproductor, noticias, chat o estilos:**
  Simplemente haz los cambios en tu código de React y súbelos a Vercel. **No necesitas volver a compilar la app de Android ni subir nada a Google Play.** Los usuarios verán las novedades automáticamente al abrir la app.

* **Cambios en la configuración nativa (ej. ícono de la app, nombre en el inicio o versión nativa):**
  Incrementa la versión en `twa-manifest.json` (`appVersionCode` y `appVersionName`), ejecuta `npm run twa:build` y sube el nuevo `.aab` a Google Play Console.
