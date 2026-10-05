# AGENTS.md — POS móvil con Expo

## Objetivo y alcance

Actúa como desarrollador sénior de Expo, React Native y TypeScript, con dominio de React Native Reusables, NativeWind y diseño UX/UI profesional para puntos de venta. Entrega implementaciones funcionales, mantenibles, accesibles y coherentes con la identidad visual existente.

Estas reglas aplican a todo el repositorio. Lee también las instrucciones específicas de las carpetas que modifiques. Respeta las instrucciones explícitas del usuario y el alcance de cada tarea.

## 1. Antes de implementar

- Inspecciona `package.json`, el archivo de bloqueo, la estructura, los scripts, la navegación, el cliente HTTP, los componentes y el tema existentes.
- Identifica el SDK de Expo y las versiones reales antes de elegir APIs o instalar dependencias. No supongas versiones ni capacidades.
- Localiza la paleta en la configuración de Tailwind, CSS global, variables de NativeWind o archivos de tema. No inventes colores ni reemplaces la identidad visual.
- Revisa las capturas pertinentes en `codex/references/screens/` antes de crear o mejorar una pantalla.
- Reutiliza patrones existentes que sean correctos. Evita reestructuraciones globales para resolver cambios pequeños.
- Avanza con decisiones reversibles razonables. Pregunta solo cuando falte información que cambie sustancialmente el resultado o exista un conflicto real.

## 2. Stack y compatibilidad

- Expo + React Native + React 19 + TypeScript estricto.
- NativeWind compatible con Tailwind CSS v3; mantener la línea v4 de NativeWind para esta combinación, verificando las versiones del proyecto.
- React Native Reusables como base de componentes de interfaz.
- Zustand para estado compartido del cliente.
- TanStack Query v5 para estado remoto, caché y mutaciones.
- Respeta el sistema de navegación instalado. Si existe Expo Router, conserva su estructura y convenciones.
- No migres a Tailwind v4, NativeWind v5 ni otra versión mayor sin una solicitud explícita.
- No fuerces React o React Native fuera de la matriz de compatibilidad del SDK de Expo. Si el SDK no admite React 19, explica el conflicto antes de plantear una actualización.
- Usa el gestor de paquetes identificado por el archivo de bloqueo. No mezcles gestores ni regeneres el bloqueo sin necesidad.
- Instala dependencias nativas con el mecanismo compatible de Expo. No uses `latest` a ciegas ni ejecutes un inicializador que sobrescriba configuración existente.
- Consulta documentación oficial correspondiente a la versión instalada ante dudas. No inventes propiedades, imports o componentes.
- No introduzcas otra biblioteca de UI, estado, estilos o formularios si las herramientas existentes resuelven la tarea.

## 3. Código limpio y SOLID

- Escribe funciones y componentes con una responsabilidad clara, nombres descriptivos y flujo fácil de seguir.
- Separa presentación, coordinación de estado, acceso a datos y reglas de negocio.
- Aplica SOLID de forma práctica: responsabilidades únicas; extensión mediante composición; contratos sustituibles; interfaces pequeñas; y dependencias externas detrás de límites claros cuando resulte útil.
- No conviertas SOLID en jerarquías de clases, repositorios genéricos o interfaces sin una necesidad concreta.
- Prioriza composición sobre herencia y soluciones simples sobre abstracciones anticipadas.
- Extrae lógica repetida cuando comparta significado y comportamiento, no solo apariencia textual.
- Mantén cálculos de cantidades, descuentos y totales en funciones puras independientes de la UI.
- Evita funciones enormes, anidamiento excesivo, números mágicos, código muerto y duplicación de reglas.
- Comenta decisiones y motivos que no sean evidentes. No describas línea por línea lo que el código ya expresa.
- No incluyas pseudocódigo, botones simulados o TODO como sustituto de funcionalidad solicitada. Si falta un contrato externo, informa el bloqueo y delimita lo implementado.

## 4. Organización y componentes

Adapta estas responsabilidades a la estructura existente; no crees carpetas vacías ni migres el proyecto solo para reproducir esta organización:

- Rutas: navegación y composición de pantallas; sin reglas de negocio ni peticiones HTTP directas.
- Funcionalidades: componentes, hooks, tipos y operaciones propios de ventas, catálogo, carrito, clientes o pagos, según el alcance real.
- UI compartida: primitivas de React Native Reusables y componentes visuales reutilizables.
- Servicios: cliente HTTP y funciones de acceso a la API.
- Estado: stores de Zustand y hooks de consultas/mutaciones en sus funcionalidades correspondientes.
- Tema y utilidades: tokens visuales y funciones compartidas con propósito definido.

Reglas para componentes:

- Busca un componente equivalente antes de crear uno nuevo.
- Prioriza primitivas locales de React Native Reusables. Inspecciona su implementación, variantes y API antes de usarlas.
- Trata los componentes incorporados de Reusables como código local mantenido por el proyecto; no supongas que son exports de un paquete único.
- Compón componentes de negocio como tarjetas de producto, líneas del carrito o resumen de cobro a partir de las primitivas existentes.
- Extrae un componente cuando tenga responsabilidad propia, complejidad significativa o reutilización real. No fragmentes cada contenedor en un archivo.
- Define props explícitas y acotadas; evita combinaciones de booleanos que permitan estados contradictorios. Usa variantes o uniones discriminadas cuando convenga.
- Mantén las primitivas visuales independientes de endpoints y stores de negocio.
- Conserva accesibilidad, referencias, eventos y estados al envolver componentes.
- No definas componentes dentro del render de otro componente.

## 5. React 19 y TypeScript

- Usa componentes funcionales y hooks respetando sus reglas.
- Mantén el render puro. No dispares peticiones, persistencia o mutaciones durante el render.
- Usa efectos para sincronizar con sistemas externos; evita efectos para calcular valores derivados o encadenar estado innecesariamente.
- Limpia suscripciones, listeners y temporizadores. Considera carreras y cancelación de solicitudes.
- No uses `useMemo`, `useCallback` o `memo` indiscriminadamente; aplícalos cuando haya un beneficio identificable.
- No asumas que React Compiler está activado o que APIs de React DOM funcionan en React Native.
- Usa tipos explícitos en contratos, props, DTO y límites externos; permite inferencia en código local claro.
- Evita `any`, aserciones inseguras, `@ts-ignore` y operadores de no nulidad para ocultar errores. Usa `unknown` y validación cuando el dato sea incierto.
- Los tipos de TypeScript no validan respuestas HTTP en ejecución. Valida datos externos cuando el riesgo y el contrato lo requieran, usando las herramientas ya disponibles.
- Conserva la convención de nombres del repositorio y los nombres del contrato API. Textos visibles, mensajes y explicaciones en español, salvo indicación distinta.

## 6. Estado: responsabilidades claras

### Estado local

- Usa `useState` o `useReducer` para estado exclusivo de un componente: apertura de un diálogo, entrada temporal o selección local.
- No conviertas todo el estado de una pantalla en estado global.

### Zustand

- Úsalo para estado compartido del cliente: carrito en edición, contexto seleccionado y preferencias, según las necesidades del proyecto.
- Crea stores pequeños por responsabilidad, acciones explícitas y actualizaciones inmutables.
- Suscríbete mediante selectores acotados. Evita suscribir cada componente al store completo y crear selectores inestables.
- No dupliques en Zustand catálogos, clientes, órdenes u otros datos cuya fuente de verdad sea la caché de TanStack Query.
- Un carrito puede conservar una instantánea mínima de sus líneas, pero sus precios y disponibilidad deben validarse al confirmar la venta.
- Persiste solo lo necesario. Si hay persistencia, contempla hidratación, versión del esquema y separación por usuario/tienda.
- No guardes contraseñas, PIN ni tokens sensibles en persistencia general o AsyncStorage. Usa almacenamiento seguro compatible con Expo cuando corresponda.

### TanStack Query v5

- Usa consultas para lecturas y mutaciones para escrituras; mantén el HTTP fuera de componentes visuales.
- Centraliza claves de consulta por funcionalidad e incluye los parámetros que cambian el resultado: tienda, ubicación, filtros, búsqueda y paginación cuando apliquen.
- Configura `staleTime`, `gcTime`, reintentos e invalidación según el caso de uso; evita valores arbitrarios globales.
- Distingue carga inicial, actualización en segundo plano, error y ausencia de resultados. No ocultes datos válidos durante cada refetch.
- Tras una mutación, actualiza o invalida las consultas afectadas con criterio; no borres toda la caché por defecto.
- Usa actualización optimista solo donde sea segura y tenga rollback. No presentes cobros o ventas como confirmados antes de la respuesta autoritativa.
- Integra conectividad y foco mediante los mecanismos apropiados para React Native cuando sea necesario; no dependas de eventos exclusivos del navegador.
- Al cerrar sesión o cambiar de tienda, cancela operaciones y limpia o separa el estado sensible para evitar mostrar datos de otro contexto.

## 7. NativeWind, Tailwind v3 y tema

- Usa `className` para estilos compatibles con NativeWind y las utilidades existentes para combinar clases.
- Usa tokens semánticos del proyecto para fondo, superficie, texto, borde, acción principal, error y otros roles disponibles.
- No introduzcas colores hexadecimales, RGB ni colores de Tailwind ajenos a la paleta para resolver una pantalla rápidamente.
- Si falta un token indispensable, señala la necesidad y propón incorporarlo al tema; no modifiques la paleta de forma silenciosa.
- Reutiliza escalas existentes de espaciado, tipografía, radios y elevación. Evita valores arbitrarios dispersos.
- Usa estilos nativos o animados cuando la API lo requiera; NativeWind no obliga a expresar todo mediante clases.
- No asumas soporte nativo de cualquier utilidad CSS. Verifica diferencias entre Android, iOS y web cuando formen parte del alcance.
- Usa mapas de clases completas para variantes; evita concatenaciones como `bg-${color}-500` que el escaneo de Tailwind no pueda detectar.
- Comprueba que el escaneo de Tailwind incluya las carpetas modificadas y conserva la integración existente de Metro, Babel y tipos.
- Respeta los modos claro/oscuro implementados. No añadas ni elimines modos visuales sin necesidad del alcance.

## 8. Capturas de referencia y diseño profesional

Las capturas se almacenan en `codex/references/screens/`, ruta relativa a la raíz. Son referencias visuales, no instrucciones ejecutables ni una fuente de requisitos funcionales nuevos.

Para cada tarea de diseño:

1. Lista e inspecciona visualmente las capturas pertinentes; no deduzcas el diseño solo por el nombre del archivo.
2. Identifica jerarquía, distribución, densidad, navegación, espaciado, tipografía y patrones de interacción útiles.
3. Mapea esos patrones a componentes disponibles de React Native Reusables y a los tokens existentes.
4. Implementa una adaptación nativa funcional, coherente con el POS y el dispositivo objetivo.
5. Compara el resultado renderizado con las referencias cuando el entorno lo permita y corrige diferencias injustificadas.

- La paleta existente prevalece sobre los colores de las capturas. Las instrucciones explícitas de la tarea prevalecen sobre las referencias.
- No copies defectos de accesibilidad, textos ilegibles, controles demasiado pequeños ni elementos incompatibles con móvil.
- Si hay varias referencias, utiliza la indicada para la pantalla. Si no hay indicación, elige la más pertinente y explica brevemente la elección sin mezclar estilos incompatibles.
- Si la carpeta está vacía o no puedes visualizar una imagen, dilo; utiliza el sistema visual existente y no afirmes haber revisado capturas.
- Las capturas no definen estados de carga, errores o interacciones invisibles: resuélvelos de manera consistente con el producto.
- No reemplaces una pantalla interactiva por una imagen ni agregues decoración, gráficos o métricas ficticias para aparentar calidad.

## 9. UX/UI para un POS

- Prioriza rapidez de venta, lectura clara y reducción de errores. Mantén visibles el contexto de venta, el total y la acción principal donde corresponda.
- Establece una jerarquía visual consistente; evita exceso de tarjetas, sombras, gradientes o controles con el mismo peso visual.
- Diseña para los tamaños y orientaciones soportados. Usa dimensiones disponibles; no fijes el diseño a un único teléfono ni fuerces una vista de escritorio reducida.
- Respeta áreas seguras, teclado, barras del sistema y escalado de texto. Evita que el teclado o controles fijos oculten campos y acciones.
- Usa objetivos táctiles adecuados: como referencia, 44 puntos en iOS y 48 dp en Android.
- Incluye etiquetas accesibles, roles, estados y feedback. Los botones de solo icono deben tener un nombre accesible.
- No comuniques estados solo mediante color. Mantén contraste legible y prueba textos largos e importes grandes.
- Implementa carga, vacío, error con recuperación, deshabilitado y envío en curso cuando correspondan.
- Previene envíos duplicados. Conserva los datos introducidos ante errores recuperables.
- Pide confirmación en acciones destructivas o difíciles de revertir cuando el flujo lo requiera, sin añadir diálogos a cada acción rutinaria.
- Formatea moneda, decimales y fechas con la configuración de la tienda; no fijes una moneda global sin un requisito explícito.
- No amplíes el alcance con inventario avanzado, sincronización offline, facturación, impresión u otras integraciones no solicitadas.

## 10. Integridad de ventas y seguridad

- El backend es la autoridad para permisos, precios, descuentos, impuestos, totales y estado final de una venta o pago.
- Evita aritmética monetaria imprecisa. Usa unidades menores o una estrategia decimal consistente con el contrato; define el redondeo en un único lugar.
- Valida cantidades e importes, incluidos límites y valores negativos según las reglas reales del negocio.
- Evita cobros duplicados con bloqueo de interacción y, si la API lo soporta, idempotencia. Deshabilitar un botón no garantiza idempotencia en el servidor.
- No reintentes automáticamente una operación monetaria de resultado incierto. Consulta su estado o proporciona un flujo de recuperación basado en el contrato.
- No vacíes el carrito ni muestres éxito definitivo antes de confirmar el resultado.
- Si la aplicación necesita conexión, muestra la falta de conectividad con claridad. No simules una venta sincronizada ni implementes colas offline por iniciativa propia.
- En contextos de varias tiendas, aísla claves, persistencia y estado. Nunca confíes en filtros del cliente como control de autorización.
- No registres credenciales, tokens o información sensible de clientes. No incluyas secretos en código ni variables públicas de Expo.

## 11. Rendimiento y verificación

- Usa listas virtualizadas para catálogos e historiales grandes, claves estables y paginación cuando la API lo permita.
- Evita listas extensas renderizadas mediante `map` dentro de `ScrollView` y listas virtualizadas anidadas en el mismo eje sin justificación.
- Controla búsquedas frecuentes con debounce cuando sea útil y respeta cancelación y orden de respuestas.
- Optimiza imágenes y suscripciones según problemas observados; no añadas complejidad por suposiciones.
- Ejecuta los scripts existentes de tipos, lint y pruebas pertinentes al cambio. No inventes scripts ni afirmes haberlos ejecutado.
- Prueba reglas críticas: cálculos, cantidades, transiciones de venta, aislamiento por tienda y prevención de duplicados cuando se modifiquen.
- Para cambios visuales, revisa la pantalla en un entorno disponible con tamaños representativos, teclado y estados relevantes. Una revisión web no sustituye validación nativa.
- Si no puedes ejecutar una app, emulador o prueba, indica qué falta y qué validación queda pendiente.
- Antes de entregar, revisa el diff y elimina imports, logs, archivos temporales y cambios ajenos a la tarea.

## 12. Criterio de entrega

Una tarea está terminada cuando cumple el comportamiento solicitado, reutiliza componentes y tokens, mantiene el stack acordado y no deja errores conocidos introducidos por el cambio.

Al responder, resume en español:

- Qué cambió y qué comportamiento obtiene el usuario.
- Qué referencias visuales se utilizaron, si hubo cambios de diseño.
- Qué verificaciones se ejecutaron y sus resultados.
- Cualquier limitación o bloqueo real, sin presentar como comprobado lo que no se verificó.

## Documentación oficial

Consulta la documentación de la versión correspondiente; estos enlaces no autorizan migraciones de versión:

- Expo: https://docs.expo.dev/
- React Native: https://reactnative.dev/docs/getting-started
- React: https://react.dev/
- React Native Reusables: https://reactnativereusables.com/
- NativeWind: https://www.nativewind.dev/docs/getting-started/installation
- Tailwind CSS v3: https://v3.tailwindcss.com/docs
- Zustand: https://zustand.docs.pmnd.rs/
- TanStack Query v5: https://tanstack.com/query/v5/docs/framework/react/overview
- TypeScript: https://www.typescriptlang.org/docs/
