# La Hermandad POS

Aplicación de punto de venta desarrollada con React Native, Expo y TypeScript. Consume la API del backend de La Hermandad.

## Requisitos previos

- Git, Node.js y pnpm instalados.
- Backend de La Hermandad en ejecución y accesible desde el dispositivo donde probarás la aplicación.
- Un emulador de Android, un simulador de iOS (requiere macOS) o un dispositivo físico con una versión de Expo Go compatible con el proyecto.

## Pasos para levantar el proyecto

### 1. Clonar el proyecto

```bash
git clone https://github.com/alvarorcdev-12/la-hermandad-pos-app.git
cd la-hermandad-pos-app
```

### 2. Copiar el archivo `.env.example` y renombrar la copia a `.env`

En Linux o macOS:

```bash
cp .env.example .env
```

En Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

### 3. Cambiar las variables de entorno

Abre `.env` y ajusta las direcciones según dónde se ejecute tu backend. Por ejemplo, para un backend local en el puerto `3000`, usando el simulador de iOS o el emulador de Android Studio:

```dotenv
EXPO_PUBLIC_STAGE=dev
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
EXPO_PUBLIC_API_URL_IOS=http://localhost:3000/api/v1
EXPO_PUBLIC_API_URL_ANDROID=http://10.0.2.2:3000/api/v1
```

| Variable | Uso |
| --- | --- |
| `EXPO_PUBLIC_STAGE` | Usa `dev` para desarrollo o `prod` para producción. |
| `EXPO_PUBLIC_API_URL` | URL de la API cuando `EXPO_PUBLIC_STAGE=prod`. |
| `EXPO_PUBLIC_API_URL_IOS` | URL de la API para iOS en desarrollo. |
| `EXPO_PUBLIC_API_URL_ANDROID` | URL de la API para Android en desarrollo. La configuración actual también la usa en web. |

Para probar en un dispositivo físico, reemplaza `localhost` o `10.0.2.2` por la IP local de la computadora donde corre el backend, por ejemplo `http://192.168.1.100:3000/api/v1`. Conecta ambos equipos a la misma red y asegúrate de que el backend acepte conexiones desde ella.

Si pruebas en web desde la misma computadora que ejecuta el backend, configura `EXPO_PUBLIC_API_URL_ANDROID=http://localhost:3000/api/v1`.

Ajusta también el puerto y la ruta `/api/v1` si tu backend utiliza otros valores. Las direcciones de `.env.example` son ejemplos y deben reemplazarse por las de tu entorno.

### 4. Instalar las dependencias

Desde la carpeta del proyecto:

```bash
pnpm install
```

### 5. Iniciar el proyecto

```bash
pnpm dev
```

Este comando inicia el servidor de desarrollo de Expo y limpia su caché.

### 6. Abrir la aplicación

Desde la terminal de Expo:

- Presiona `a` para abrir Android con un emulador configurado.
- Presiona `i` para abrir el simulador de iOS en macOS.
- Presiona `w` para abrir la versión web.
- Para un dispositivo físico, escanea el código QR con Expo Go compatible con el SDK del proyecto.

También puedes iniciar directamente la plataforma que necesitas:

```bash
pnpm android
pnpm ios
pnpm web
```

Ejecuta solo el comando correspondiente a tu plataforma. Si cambias las variables de entorno, detén el servidor con `Ctrl+C` y vuelve a ejecutar `pnpm dev`.
