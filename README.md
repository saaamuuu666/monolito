# Sistema de Login con Roles (Node.js + Express + SQLite + EJS)

Este proyecto es una aplicación web sencilla que implementa **autenticación con roles** utilizando:

- Node.js + Express
- EJS
- SQLite (better-sqlite3) Base de datos
- bcrypt Hash seguro de contraseñas.
- Cookies Para mantener la sesión y roles del usuario.

---

## Funcionalidades

- Registro inicial de usuarios (admin y user) en la base de datos con contraseñas hasheadas.
- Login con validación de credenciales.
- Autenticación:
  - `isAuth`: asegura que un usuario esté logueado.
  - `isAdmin`: asegura que solo el administrador pueda entrar a ciertas rutas.
- Manejo de cookies para persistir la sesión.
- Rutas protegidas por rol:
  - `/home` → accesible para usuarios logueados.
  - `/admin` → accesible solo para administradores.
- Logout para cerrar sesión.

## Estructura del proyecto

├── views/ # Plantillas EJS
│ ├── login.ejs # Formulario de login
│ ├── home.ejs # Página privada para usuarios
│ ├── admin.ejs # Página privada para admin
│ └── index.ejs # Página de prueba
│
├── database.sqlite3 # Base de datos SQLite
├── init-db.js # Script para inicializar la BD y crear usuarios
├── index.js # Servidor principal (Express)
├── package.json # Dependencias y scripts
└── .gitignore

## Imagenes

### Login

<img src="./capturas/login.png" alt="Login" width="400">
- Login para usuarios y administradores

### Home

<img src="./capturas/home.png" alt="Home" width="400">
- Pagina de usuarios en la que cuando ya estamos dentro no podemos ir a la de administradores

### Admin

<img src="./capturas/admin.png" alt="Admin" width="400">
- Pagina de administradores en la que cuando ya estamos dentro no podemos ir a la de usuarios

### Reflexión

- Las plantillas EJS permiten reutilizar HTML dinámico.

- La base de datos SQLite hace que la app sea liviana y fácil de portar.

- Con bcrypt aseguramos que las contraseñas nunca se guarden en texto plano.

- El uso de roles da un control granular de accesos.

- Las cookies permiten mantener la sesión sin necesidad de loguearse cada vez.
