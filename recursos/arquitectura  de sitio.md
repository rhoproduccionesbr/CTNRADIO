# Arquitectura Web: CTN Radio

## 1. Mapa del Sitio (Sitemap)
1. **Home:** Acceso directo al streaming, noticias destacadas y eslogan.
2. **Noticias:** Feed completo categorizado con buscador.
3. **Programación:** Grilla horaria de los programas.
4. **Institucional:** Misión, Visión y Perfil del Prof. Clemente Torales.
5. **Contacto:** Formulario y enlaces directos a WhatsApp/RRSS.

## 2. Componentes Clave
- **`Navbar.jsx`:** Navegación fluida con indicador de "En Vivo".
- **`HeroPlayer.jsx`:** Sección principal con el eslogan "De Guarambaré al mundo" y el reproductor de audio.
- **`NewsGrid.jsx`:** Componente que renderiza tarjetas de noticias desde Firebase.
- **`MissionVision.jsx`:** Bloque de texto con diseño editorial para la filosofía del medio.
- **`StickyPlayer.jsx`:** Barra persistente en la parte inferior para navegación sin interrupciones de audio.

## 3. Lógica del Reproductor
- Debe soportar el stream URL de la radio.
- Implementar manejo de errores (fallback) si el stream cae.
- Control de volumen y visualizador de ondas (opcional).