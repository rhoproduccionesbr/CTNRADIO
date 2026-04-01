# Documentación Completa: Proyecto CTN Chat V2 (Abril 2026)

Esta documentación sirve como registro completo y guía técnica de todo lo implementado en la actualización "V2 Profesional" del sistema de mensajería en tiempo real para CTN Radio.

---

## 1. Arquitectura General y Decisiones Técnicas

El objetivo principal fue evolucionar el chat de una simple caja de texto a un **Sistema Interactivo (Estilo WhatsApp) con Capacidad de Moderación**, optimizado profundamente para la vista móvil PWA (Progressive Web App).

Se mantuvo la separación estricta:
*   **Backend (Servidor WebSocket):** Alojado en la consola de **Oracle Cloud** bajo el proceso PM2 `ctn-chat` (Puerto 3001). Esto aligera la carga sobre el frontend y garantiza el guardado de datos continuo.
*   **Frontend (Cliente React):** Alojado en **Vercel**, conectado al backend por WebSockets continuos para mensajería y REST API para inicio de conexión.

---

## 2. Novedades del Servidor (Backend Node.js)
El corazón de los mensajes en tu servidor de Oracle (`e:\Rodrigo\Documents\server oracle\ctn_messages_server\server.js`).

*   **Identidad de Usuario Local:** Añadidos los campos `nombre` y `localidad` a la base de datos de los mensajes para registrar el origen de cada oyente.
*   **Almacenamiento en Memoria/Disco (`data/`):** Todos los mensajes entrantes se recolectan en memoria RAM (para responder en milisegundos) y se guardan automáticamente en archivos por día (`chat_YYYY-MM-DD.json`) de forma diferida ("batch writing") para no desgastar ni ralentizar el disco duro de Oracle.
*   **Proxy de Contador de Oyentes (Icecast Tracker):** Se programó un puente de red secreto (`/api/oyentes`) interno en el backend. Así, en lugar de que el móvil del usuario intente contactar a AzuraCast y sufra "errores de certificado SSL", es tu propio servidor backend el que obtiene los oyentes de forma nativa por localhost (`http://127.0.0.1`) sin barreras de seguridad y simplemente le informa un número limpio (`15`, `40`) al frontend.
*   **Capaz de Reaccionar (Likes):** El WebSocket fue modificado para recibir de los usuarios el evento `reaccion`, que aumenta el contador de corazones (likes) de un mensaje particular y lo sincroniza a todos los demás dispositivos al instante (`reaccion_update`).
*   **Moderación en Vivo (Poder Administrativo Absoluto):** Si el servidor detecta el "ADMIN_SECRET" (`ctn_admin_2026`):
    *   **Comando Borrar (`borrar_admin`):** Elimina el mensaje exacto por su ID de la memoria y la base de datos. Se emite un broadcast a todos los celulares del mundo conectados para que esa misma burbuja explote y desaparezca de sus pantallas al segundo.
    *   **Comando Vaciar (`vaciar_admin`):** Purga la sala por completo reiniciando el array de memoria a cero.
    *   **Comando Ban (`ban_ip`):** Lee inmediatamente la dirección IP de internet (`x-forwarded-for`) oculta en el mensaje del infractor de red, destruye su conexión WebSocket con fuerza y graba la IP en `banned_ips.json` para que nunca más pueda siquiera cargar el buzón.

---

## 3. Novedades Visuales e Integración Frontend (React Vite)
Todos los cambios hechos localmente en los proyectos de OCI (que subirás a Vercel).

### A. Reproductor Central (`HeroPlayer.jsx`)
*   **Contador Antena:** En la parte superior, se quitó el texto de apoyo y se implementó un icono minimalista verde centelleante (`RadioTower`) que refleja fielmente los oyentes obtenidos a través del proxy.
*   **Botón Principal de Chat Translúcido:** Hemos eliminado el agresivo "botón flotante" que entorpecía la lectura. En su lugar, diseñamos un botón largo nativo "ENTRAR AL CHAT EN VIVO" con estética Glassmorphism que se integra pulcramente antes de los botones de WhatsApp/Facebook, mostrando elegantemente el número de mensajes sin leer.

### B. Funcionalidad Modal del Chat (`ChatModal.jsx`) - (The PWA Update)
*   **Layout Universal (Transparente o Mate):** El Chat ya no es una ruta (`/chat`). Es un Modal de cristal oscuro. Tiene un fondo con tu `logo.svg` como **marca de agua semitransparente** sutil (estilo telegram o whatsapp), logrando un entorno serio pero interactivo.
*   **Compatibilidad Móvil (PWA) de Alto Nivel:**
    *   **Z-Index Perfecto:** En computadoras cubre el centro de la pantalla; en teléfonos celulares asume su posición calculando exactamente 64px abajo del encabezado de la APP e insertando un cojinete de 140px debajo para JAMÁS chocar con tu reproductor mínimo ni con el menú inferior de tu web app. La navegación web no se bloquea.
    *   **Metadatos de Audio Dinámicos:** La barra superior del chat ahora lee el estado del `AudioContext` para imprimir en tiempo real el título de la canción o el programa que se está emitiendo en vivo.
    *   **Botón Atrás:** Inclusión de un botón explícito y claro "< Atrás" para emular navegación nativa en Android y iOS sin usar la tecla de retroceso del teléfono, aliviando dolores de cabeza a usuarios poco técnicos.
*   **Diseño Puesto-a-Puesto (Burbujas Inteligentes):**
    *   En lugar de la aburrida lista original en la que todo parecía monótono, tu chat ahora calcula `isMe`.
    *   Si es de *otra persona*: Color oscuro transparente a la izquierda.
    *   Si es *tuyo*: Color `emerald` de fondo a la derecha sin repetir tu nombre, dando orden psicológico visual de inmediato.
    *   Ancho flexible (`w-fit`): Los globos de conversación estrechan gentilmente o se expanden si es un pergamino de texto, cuidando un ancho máximo.
*   **Formato de Tiempo Semántico:** Formateador experto en JavaScript implantado. Diferencia los mensajes enviados con el rótulo temporal "Hoy 16:30" versus una cronología de ayer "31/03 12:00".
*   **Accesorios Emojis:**
    *   **Barra Slider Desplegable:** Al tocar la carita sonriente (`Smile`), un panel de reacción horizontal surge mágicamente de abajo arriba para cliquear y armar mensajes expresivos a toda velocidad, sin tener que abrir el teclado del teléfono.
    *   **Detector de Mensajes "Solo Emojis" Estilo iOS:** Creé un mini-motor de evaluación de Patrones (Regex) Pictográficos que intercepta mensajes que carezcan de formato de texto (`Hola`), y descubren cadenas de hasta 10 emojis. En caso afirmativo, se les arranca el fondo plástico de color, se suprimen los bordes y se triplica el tamaño de los emojis como una expresión independiente (ej. "😂😂😂" flotando de 52px).

### C. Centro de Moderación Privado (`AdminChat.jsx`)
*   Ubicado firmemente bajo un escudo en `/admin/chat` y solo listado en la Barra de Administración Lateral.
*   Requerirá clave por primera vez. Tras pasarla, presenta un dashboard similar al chat público pero con herramientas quirúrgicas teñidas en rojo como `Botón Banear IP`, `Botón Destrozar mensaje (Borrar)` y `Purgar (Vaciar Todo el Historial)`.
*   El administrador escribiendo desde aquí goza de una placa oficial, que inyecta su burbuja de mensaje con color rojo escarlata y el nombre forzado *CTN RADIO*, asegurando la atención inmediata.

---

## 4. Próxima Acción Para el Propietario (Despliegue)

Todos estos hitos están 100% operativos localmente. El código en tu servidor Oracle ya está trabajando silenciosamente en segundo plano.

**Tus últimos pasos:**
1. Haz tus pruebas abriendo y cerrando en el navegador, o en una pestaña en incógnito de tu teléfono abriendo `http://(tu-ip-local):5173`.
2. Como se ha ajustado todo en React (*Vite*, *Vercel*, `app.jsx`, `ChatContext`), sube sencillamente los cambios a GitHub desde tu Visual Studio Code pulsando **Commit & Sync**. Vercel se hará cargo de desplegar tu obra maestra para que el mundo comience a usarlo.
