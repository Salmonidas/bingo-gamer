# Bingo Gamer 🎮

[![en](https://img.shields.io/badge/lang-en-red.svg)](README.md)

Bingo Gamer es una aplicación web *local-first* y sin conexión para crear, personalizar y jugar cartones de Bingo digitales. Diseñada para streamers y comunidades, permite crear cuadrículas de hasta 20x20, personalizar imágenes y compartir plantillas de forma privada a través de URLs, sin servidores.

## Cómo Funciona (Implementación Técnica) ⚙️

Bingo Gamer está construido bajo una arquitectura **100% Local-First**, lo que significa que depende enteramente del navegador del usuario en lugar de un servidor backend.

- **Almacenamiento (IndexedDB):** Todos los cartones, imágenes personalizadas, logos y preferencias se guardan localmente en el navegador usando IndexedDB. Esto garantiza privacidad, cero costes de servidor y tiempos de carga instantáneos.
- **Motor de Compartición Offline:** Para compartir cartones complejos (ej. una cuadrícula de 20x20 con textos) sin base de datos, la app utiliza un **algoritmo de compresión GZIP**. Los datos del tablero se serializan en JSON, se comprimen usando la API nativa `CompressionStream` del navegador, y se codifican en Base64URL.
- **Importación basada en URL:** El paquete comprimido se añade a la URL (ej. `bingo-gamer.com/es/import#payload`). Cuando otro usuario abre el enlace, la app decodifica localmente el contenido, recrea el cartón exacto y lo guarda en su propio IndexedDB como un clon privado.
- **Gestión de Imágenes:** Las imágenes se procesan en el navegador, se almacenan como Base64/Blobs en IndexedDB y se inyectan en las celdas. Incluye soporte para "drag & drop" y pegar desde el portapapeles.
- **Internacionalización:** La interfaz soporta 8 idiomas, gestionados automáticamente mediante Next.js Edge Middleware y traducidos con `next-intl`.

## Características ✨

- **100% Local y Privado:** Sin servidores ni bases de datos. Tus datos se quedan en tu dispositivo.
- **Personalización Extrema:** Cuadrículas de hasta 20x20, espacios libres centrales e imágenes por celda.
- **Ideal para Streamers:** Descarga cartones en PNG, añade logos y celebra con animación de confeti.
- **Multilingüe:** Español, Inglés, Francés, Alemán, Italiano, Portugués, Japonés y Catalán.

## Comenzando 🚀

Para ejecutar el servidor de desarrollo local:

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.
