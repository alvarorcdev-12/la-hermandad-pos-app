# Pedidos y cobros reales

Contratos contrastados con `../Sistema-La-Hermandad/la-hermandad-backend/src/orders/` (controlador, DTO, servicio y mapper). No se hicieron solicitudes de escritura al backend real.

- `POST /orders`: cliente opcional, productos y cantidades; crea `OPEN/PENDING`, calcula precios y descuenta stock en su propia transacción. Se llama al confirmar el primer abono o guardar sin pagar, nunca al abrir el cobro.
- `POST /orders/:id/payment`: `amount` aplicado al pedido y `method` (`CASH` o `QR`). Devuelve `amount`, `method`, `remainingBalance` como importes decimales. El servicio valida el exceso sobre el saldo, aunque el comentario OpenAPI todavía dice lo contrario. Su transacción no incluye la creación del pedido.
- `GET /orders/:id` y `GET /orders`: recuperan pedidos y estados financieros; no incluyen pagos ni saldo pendiente de los pedidos parciales.
- Efectivo recibido y cambio no forman parte del DTO. Se calculan en centavos para la UI. Un abono de 20 con recibido 50 envía únicamente 20. El QR es manual: se usa el QR externo de la tienda y el cajero confirma el ingreso antes de registrar el pago.

## Responsabilidades y recuperación

`cart.store` conserva el carrito, el cliente, un ID de pedido, un bloqueo y una revisión de sesión; no hace HTTP. Bloquea todas las ediciones desde que comienza la creación. Una creación rechazada explícitamente libera el bloqueo sin borrar productos ni cliente.

`use-checkout` coordina una mutación de TanStack Query sin reintentos ni cola offline. `checkout-flow` guarda el ID antes del primer pago y conserva cada respuesta confirmada en la caché de la sesión. Los pagos siguientes usan siempre ese ID; el saldo de la respuesta es autoritativo. El contador solo avanza tras respuestas confirmadas. Un cerrojo síncrono y el contador esperado impiden envíos duplicados locales, incluso antes del próximo render.

Se puede cerrar un cobro parcial y retomarlo pulsando Pagar en el mismo carrito, o desde su entrada en Pedidos. No se limpia ni desbloquea ese carrito. Al cerrar el resumen de un pedido pagado o guardado sin pagar, `finishCheckout` es el único punto de limpieza; el pedido queda accesible en el listado real. Desde ese listado también se pueden retomar pedidos abiertos sin pagos cuando el carrito está vacío.

Las claves incluyen usuario y tienda disponibles en autenticación (`id` y `storeName`). Las operaciones capturan su token original; respuestas de revisiones anteriores no escriben estado ni inician nuevos pagos. Un cambio de sesión limpia el carrito y las consultas sensibles. La API sigue siendo responsable de la autorización por `storeId`.

## Límites del backend

No hay creación con primer pago atómico, idempotencia, identificador de operación consultable ni historial de pagos. `reference` existe en el DTO de pago pero no es único ni consultable; enviarlo no brindaría idempotencia.

Ante un timeout, error de red, error 5xx o respuesta inválida de una escritura, se bloquea el reenvío. Si se conoce el ID se consulta el pedido: `PAID` permite finalizar, sin inventar un recibo para la solicitud incierta. `PENDING` o `PARTIALLY_PAID` no demuestran qué pasó con esa solicitud; se mantiene el bloqueo y se ofrece consultar nuevamente. Si la creación no devolvió ID, se exige verificación en Pedidos y no se infiere un pedido por coincidencia de cliente, fecha o total.

El estado de recuperación se conserva en memoria durante la sesión, no tras reiniciar la app o cerrar sesión. Los pedidos siguen guardados en el servidor y visibles en Pedidos; los parciales sin su carrito activo requieren verificación porque la API no permite reconstruir su saldo. Para retomarlos automáticamente, resolver una creación incierta y garantizar ausencia de duplicados entre dispositivos se necesita soporte adicional del backend: idempotencia duradera, consulta por operación y pagos/saldo en la lectura del pedido. El frontend no puede proporcionar esas garantías mediante dos solicitudes ni bloqueando botones.

## Verificación local

- `node tests/payment-preview.test.cjs`: entrada, centavos, efectivo recibido/cambio, QR, confirmación remota y reapertura parcial.
- `node tests/checkout-flow.test.cjs`: contratos con mocks, efectivo, QR, dividido, sin pagar, rechazos, timeouts, recuperación, dobles pulsaciones, cambio de precios y aislamiento de sesión.
- `pnpm exec tsc --noEmit --ignoreDeprecations 6.0`: el flag evita la advertencia existente de `baseUrl` en TypeScript 6 sin cambiar la configuración del proyecto.
- No existen scripts de lint ni pruebas en `package.json`. No se agregaron dependencias ni se cambió el lockfile.

La exportación web de Expo se completó correctamente (`EXPO_OFFLINE=1 pnpm exec expo export --platform web --output-dir /tmp/la-hermandad-checkout-web`). No equivale a una revisión visual ni nativa. `adb devices` no detectó dispositivos o emuladores; quedan pendientes la revisión renderizada en tamaños representativos, el escalado de texto y la interacción nativa. Se conservaron los componentes y tokens, consultando `cart-screen.jpeg`, `payment-options.jpeg` y `payment-entry.jpeg`.
