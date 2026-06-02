# Registro de Cambios (Changelog)

Todos los cambios notables de este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [Unreleased]

### Añadido
- Verificación mediante etiqueta meta de Google Search Console en la metadata del layout principal para indexación orgánica.
- Favicon gamer transparente, plano y optimizado (128x128px) acorde al sistema de diseño Ethereal Gamer Dark.

### Arreglado
- Reemplazada la restricción forzada de 100vh en los contenedores de las páginas por un espaciador Flexbox en el layout principal, anclando correctamente el pie de página (footer) al fondo sin generar scroll innecesario.

### Añadido
- Implementado el flujo de GitHub Actions para la creación automática de Releases bilingües al subir tags semánticos.

## [1.0.0] - 2026-06-01

### Añadido
- Configuración de cartones 100% *local-first* usando IndexedDB.
- Compartir plantillas sin conexión mediante compresión GZIP, comprimiendo cuadrículas de 20x20 en URLs cortas.
- Página local de importación de plantillas para decodificar, instanciar y redirigir a clones privados sin conexión.
- Edición de celdas en línea (inline) y flujo simplificado de creación.
- Tamaño de cuadrícula de hasta 20x20 y opción de espacio libre central.
- Personalización del fondo de celdas individuales (arrastrar y soltar, pegar Base64 desde el portapapeles).
- Caché en el cliente para proteger los derechos de autor de las imágenes.
- Reinicio masivo con confirmación, animación de victoria con confeti y exportación de cartones a PNG.
- Internacionalización completa de la interfaz en 8 idiomas.

### Eliminado
- Backend de PostgreSQL y la dependencia `@vercel/postgres`.
- Opción de compartir con la comunidad (ahora es 100% privado basado en URLs).
