# APPETIX BACKEND

> Backend MVC en TypeScript para gestionar restaurantes, usuarios y promociones dentro del ecosistema **APPETIX**.

## 📚 Tabla de contenidos
- [Visión general](#-visión-general)
- [Características clave](#-características-clave)
- [Arquitectura y stack](#-arquitectura-y-stack)
- [Requisitos previos](#-requisitos-previos)
- [Configuración rápida](#-configuración-rápida)
- [Variables de entorno](#-variables-de-entorno)
- [Scripts disponibles](#-scripts-disponibles)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Recursos API principales](#-recursos-api-principales)
- [Colección Postman](#-colección-postman)
- [Buenas prácticas de desarrollo](#-buenas-prácticas-de-desarrollo)
- [Contribuir](#-contribuir)

## 🌟 Visión general
Este proyecto implementa un backend escalable con **Express** y **TypeORM**, preparado para integrarse con aplicaciones móviles o web que necesiten administrar restaurantes, usuarios, promociones y valoraciones. Incluye autenticación con JWT, manejo de archivos para imágenes de restaurantes y un enfoque modular para servicios, controladores y rutas.

## 🚀 Características clave
- ✅ Arquitectura MVC escrita 100% en TypeScript.
- ✅ Conexión a **MySQL** mediante TypeORM y configuración centralizada.
- ✅ Autenticación con **JWT** (tokens de acceso y refresco).
- ✅ Módulos dedicados para usuarios, restaurantes, categorías, promociones, calificaciones y más.
- ✅ Servido de archivos estáticos para contenido subido (p. ej. fotos de restaurantes).
- ✅ Endpoints documentados mediante colecciones Postman listas para importar.

## 🧱 Arquitectura y stack
- **Runtime:** Node.js ≥ 18 (compatible con LTS vigentes).
- **Framework:** Express.
- **ORM:** TypeORM con DataSource y entidades tipadas.
- **Base de datos:** MySQL (se recomienda 8.x).
- **Autenticación:** JSON Web Tokens (JWT) con secretos independientes para access y refresh tokens.
- **Validación:** Zod para validar payloads y reglas de negocio.
- **Gestión de archivos:** Multer para subir y gestionar imágenes.
- **Otros:** BcryptJS para hashing de contraseñas, CORS habilitado por defecto.

## 🛠️ Requisitos previos
Asegúrate de contar con:
- [Node.js](https://nodejs.org/) 18.x o superior.
- [npm](https://www.npmjs.com/) (incluido con Node.js) o [pnpm](https://pnpm.io/) si prefieres.
- Servidor **MySQL** accesible y con permisos para crear/alterar tablas.

## ⚡ Configuración rápida
1. **Clona el repositorio**
   ```bash
   git clone https://github.com/<tu-organizacion>/APPETIXBACK.git
   cd APPETIXBACK
   ```
2. **Instala las dependencias**
   ```bash
   npm install
   ```
3. **Crea el archivo `.env`** (ver sección siguiente) con tus credenciales de base de datos y llaves JWT.
4. **Levanta el servidor en modo desarrollo**
   ```bash
   npm run dev
   ```
5. Accede a `http://localhost:4000/health` para verificar que el servicio responde.

> 💡 Al iniciar, TypeORM valida la conexión con MySQL y registra la salida en consola. Si existe la tabla `RESTAURANTES` sin la columna `fotoPerfil`, el proyecto la añadirá automáticamente.

## 🔐 Variables de entorno
Crea un archivo `.env` en la raíz del proyecto con al menos las siguientes variables:

```ini
PORT=4000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=tu_contraseña
DB_NAME=APP_RESTAURANTES

JWT_ACCESS_SECRET=tu_secreto_super_seguro
JWT_REFRESH_SECRET=tu_secreto_refresh_aun_mas_largo
```

> ⚠️ `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET` son **obligatorios**. El servidor se detendrá durante el arranque si faltan, por lo que debes definirlos explícitamente en todos los entornos (desarrollo, pruebas y producción).

Puedes ajustar los valores según tu infraestructura. Para entornos productivos, recuerda utilizar secretos robustos y restringir el acceso a la base de datos.

## 📦 Scripts disponibles
| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor con recarga en caliente usando `ts-node-dev`. |
| `npm run build` | Transpila el código TypeScript a JavaScript en la carpeta `dist/`. |
| `npm start` | Ejecuta la versión compilada desde `dist/server.js`. |

## 🗂️ Estructura del proyecto
```
APPETIXBACK/
├── docs/
│   └── postman/           # Colecciones de Postman listas para importar
├── src/
│   ├── app.ts             # Configuración principal de Express
│   ├── server.ts          # Punto de entrada y conexión a la base de datos
│   ├── config/            # DataSource, migraciones y configuración
│   ├── controller/        # Controladores HTTP (capa de presentación)
│   ├── service/           # Lógica de negocio reutilizable
│   ├── model/             # Entidades de TypeORM
│   ├── routes/            # Definición y composición de rutas
│   ├── middleware/        # Middleware personalizados (autenticación, validaciones, etc.)
│   ├── utils/             # Utilidades compartidas (JWT helpers, etc.)
│   └── view/              # Vistas o respuestas específicas (si aplica)
└── tsconfig.json
```

## 🛣️ Recursos API principales
Las rutas están agrupadas bajo `/api`. Algunos recursos destacados son:

- `POST /api/auth/login` & `POST /api/auth/refresh` para autenticación y renovación de tokens.
- `GET /api/usuarios` para listar usuarios, con soporte para creación/actualización vía métodos REST.
- `GET /api/restaurantes` para explorar restaurantes y administrar sus datos e imágenes.
- `GET /api/categorias` y `GET /api/promociones` para gestionar catálogos.
- `POST /api/calificaciones` para registrar valoraciones.
- `GET /api/logs` y `GET /api/sesiones` para auditoría y seguimiento de sesiones de usuario.

Revisa los controladores correspondientes en `src/controller` para conocer validaciones adicionales y reglas de negocio.

## 🧪 Colección Postman
En `docs/postman/` encontrarás varias colecciones (`APPETIX API.postman_collection.json`, etc.) que documentan y prueban los endpoints principales. Importa la colección en Postman/Insomnia, ajusta las variables de entorno (URL base, tokens) y estarás listo para probar la API.

## 🧭 Buenas prácticas de desarrollo
- Ejecuta `npm run build` antes de desplegar para asegurarte de que la compilación TypeScript no produce errores.
- Mantén actualizado el esquema de la base de datos; las entidades TypeORM reflejan la estructura esperada.
- Usa ramas de características y Pull Requests para mantener un historial limpio.
- Documenta nuevos endpoints agregándolos a la colección de Postman y actualiza este README cuando corresponda.

## 🤝 Contribuir
1. Haz un fork del repositorio.
2. Crea una rama descriptiva: `git checkout -b feature/nueva-funcionalidad`.
3. Realiza tus cambios y asegúrate de que `npm run build` se ejecute sin errores.
4. Abre un Pull Request describiendo claramente la funcionalidad agregada o problema resuelto.

---

Hecho con ❤️ por el equipo de APPETIX.
