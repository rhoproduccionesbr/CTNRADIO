# Proyecto: CTN Radio - "De Guarambaré al mundo"

## 1. Descripción General
CTN Radio es una plataforma digital que combina la emisión de radio online en tiempo real con un portal de noticias y actualidad. El proyecto busca posicionarse como un medio de referencia desde Guarambaré, Paraguay, hacia una audiencia global, bajo la dirección del Prof. Clemente Torales Núñez.

## 2. Objetivos del Sistema
- **Streaming 24/7:** Emisión continua de audio de alta fidelidad.
- **Portal de Noticias:** Gestión de contenido dinámico (Política, Deportes, Cultura).
- **Identidad Institucional:** Sección dedicada a la trayectoria del director y la filosofía del medio.

## 3. Stack Tecnológico Sugerido
- **Frontend:** React.js (Vite) para una SPA rápida.
- **Backend/Base de Datos:** Firebase (Firestore para noticias, Storage para imágenes).
- **Estilos:** Tailwind CSS (para implementación de diseño Premium Dark).
- **Estado Global:** Context API o Redux para manejar el estado del reproductor de radio.

## 4. Estructura de Datos (Firestore)
- **Colección `noticias`:** - `id`, `titulo`, `contenido`, `imagenURL`, `categoria`, `fecha`, `autor`.
- **Colección `programacion`:** - `dia`, `hora_inicio`, `hora_fin`, `nombre_programa`, `locutor`.