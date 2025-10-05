# Cookies — Diagnóstico diferencias legales vs principales

## 1. Inclusión del banner
- Todas las plantillas analizadas (inicio, servicios y páginas legales) insertan el banner mediante el mismo bloque `<div class="cookie-banner">` situado tras el pie de página y antes de los `script` diferidos. En la home se ubica tras el enlace flotante de WhatsApp y previo a `main.js` y `cookies.js`. 【F:index.html†L649-L661】
- Las páginas legales repiten el mismo marcado, también inmediatamente después del `<footer>`; al no existir estilos que lo posicionen de forma fija, queda embebido en el flujo y solo se ve al llegar al final. 【F:politica-privacidad.html†L224-L234】【F:aviso-legal.html†L242-L252】【F:politica-cookies.html†L222-L232】【F:codigo-deontologico.html†L230-L240】

## 2. CSS aplicable y diferencias
- El comportamiento flotante y transiciones del banner se definen en `css/common.css` (`.cookie-banner`, `.cookie-link`, `.cookie-actions` y variantes `.is-visible`). 【F:css/common.css†L288-L338】
- Las hojas usadas por las páginas principales (`home.css`, `terapia-online.css`, `terapia-pareja.css`) importan explícitamente `common.css`, por lo que reciben esos estilos sin duplicarlos. 【F:css/home.css†L1-L6】【F:css/terapia-online.css†L1-L4】【F:css/terapia-pareja.css†L1-L6】
- `legal-styles.css` únicamente importa `base.css` y no arrastra `common.css`, por lo que el banner carece de posicionamiento fijo y se muestra como un bloque estándar al final del contenido. 【F:css/legal-styles.css†L1-L93】

## 3. JavaScript y disparadores
- El control del banner reside en `/js/cookies.js`, que al cargarse diferido tras el cuerpo busca `.cookie-banner`, lo oculta por defecto y lo muestra solo cuando no hay consentimiento previo; también gestiona la persistencia en `localStorage` y dispara `loadGTM()` al aceptar. No emplea temporizadores ni `IntersectionObserver`. 【F:js/cookies.js†L1-L73】
- `main.js` define `window.loadGTM` y otros comportamientos de interfaz; ambos scripts se inyectan al final de cada documento con `defer`, garantizando la ejecución tras el parseo del HTML. 【F:js/main.js†L1-L24】【F:index.html†L660-L661】
- No se detectan otros scripts relacionados con cookies ni eventos especiales en páginas legales; la única diferencia visual proviene de la falta de estilos compartidos.

## 4. Lógica de ocultación/auto-hide
- `hideBanner()` elimina la clase `is-visible`, marca `aria-hidden="true"` y aplica `display: none`, quedando permanente hasta nueva decisión del usuario; no existe auto-ocultación por scroll ni temporizadores. La experiencia es idéntica en todas las páginas porque comparten `cookies.js`. 【F:js/cookies.js†L26-L72】

## 5. Duplicidades y propuesta de "fuentes de verdad"
- El mismo bloque HTML del banner está copiado en las siete plantillas, lo que obliga a tocar múltiples archivos ante cualquier ajuste de contenido o accesibilidad. 【F:index.html†L651-L657】【F:politica-privacidad.html†L224-L230】【F:terapia-online.html†L577-L583】【F:terapia-pareja.html†L549-L555】
- Los estilos viven en `common.css`, pero no se consumen desde `legal-styles.css`, generando la inconsistencia visual descrita. 【F:css/common.css†L288-L338】【F:css/legal-styles.css†L1-L93】
- **Fuentes de verdad sugeridas:**
  - Centralizar el marcado en un fragmento compartido (por ejemplo, incluirlo vía build o componente) para evitar divergencias.
  - Alinear los estilos importando `common.css` desde `legal-styles.css` o moviendo el bloque de cookies a `base.css` si debe aplicar a todo el sitio.
  - Mantener `cookies.js` como único orquestador de la lógica y documentar que cualquier otra funcionalidad relacionada (como cargar GTM) debe colgarse de `window.loadGTM` para no duplicar scripts.
