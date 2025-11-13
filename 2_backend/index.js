const express = require('express');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');
const { Picsum } = require('picsum-photos');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ,
  database: process.env.DB_NAME ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD ,
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended:true }));

const JWT_SECRET = 'secretkey';
async function initDb() {
  await pool.connect(); // ✅ conectar antes de usar pool

  try {
    // ✅ crear tabla users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL
      )
    `);

    // ✅ crear tabla posts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        image_url TEXT NOT NULL,
        content TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id)
      )
    `);
  } catch (error) {
    console.log('Error initializing database', error);
  }

  // ✅ crear post por usuario "pepe" si no existe
  const createPost = async (id, image_url, content, username) => {
    // ⚠️ añadida la consulta que faltaba
    const userResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    // ⚠️ si el usuario no existe, lo creamos automáticamente
    if (userResult.rows.length === 0) {
      const hashed = await bcrypt.hash('1234', 10); // contraseña por defecto
      await pool.query(
        `INSERT INTO users (username, password, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (username) DO NOTHING`,
        [username, hashed, 'user']
      );
      console.log(`Usuario ${username} creado`);
    }

    const user = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    const userId = user.rows[0].id;

    // ⚠️ corregido: la tabla es "posts" (no "post")
    await pool.query(
      `INSERT INTO posts (id, image_url, content, user_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING`,
      [id, image_url, content, userId]
    );
    console.log(`Post by ${username} created or already exists`);
  };

  // crear posts (usando Picsum correctamente)
  await createPost(1, Picsum.url(), 'Contenido del post 1', 'pepe');
  await createPost(2, Picsum.url(), 'Contenido del post 2', 'pepe');
  await createPost(3, Picsum.url(), 'Contenido del post 3', 'pepe');

  console.log('Base de datos inicializada ✅');
}
async function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.sendStatus(403);
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}


function isAdmin(req, res, next) {
  if (req.cookies.user && req.cookies.role === 'admin') return next();
  return res.redirect('/');
}

function isUser(req, res, next) {
  if (req.cookies.user && req.cookies.role === 'user') return next();
  return res.redirect('/');
}

app.get('/', (req, res) => res.render('login'));
app.get('/home', isUser, (req, res) =>
  res.render('home', { user: req.cookies.user }),
);
app.get('/admin', isAdmin, (req, res) =>
  res.render('admin', { user: req.cookies.user }),
);
app.get('/register', (req, res) => res.render('register'));

app.get('/logout', (req, res) => {
  res.clearCookie('user');
  res.clearCookie('role');
  console.log('logged out');
  res.redirect('/');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username])
    .then(async (result) => {
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Usuario no encontrado' });
      }
      const user = result.rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'ContraseÃ±a incorrecta' });
      }
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.json({ token });
    })
    .catch((err) => {
      console.error('Error during login:', err);
      res.status(500).json({ message: 'Error en el servidor' });
    });
});

app.post('/register', async (req, res) => {
  const { user, password } = req.body;

  try {
    const exists = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [user]
    );
    if (exists.rows.length > 0) {
      console.log('El usuario ya existe');
      return res.send('El usuario ya existe. <a href="/register">Volver</a>');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
      [user, hashedPassword, 'user']
    );

    console.log('Usuario registrado:', user);
    res.send(
      `Usuario ${user} registrado correctamente. <a href="/">Iniciar sesión</a>`
    );
  } catch (err) {
    console.error('Error registrando usuario:', err);
    res.send('Error al registrar usuario. <a href="/register">Volver</a>');
  }
});
app.get('/profile', verifyToken, (req, res) => {
  res.json({ message: 'This is a protected profile route', user: req.user})
});

// ⚠️ corregido JOIN (users.id)
app.get('/posts', async (req, res) => {
  const resultado = await pool.query(
    `SELECT posts.id, posts.image_url, posts.content, users.username
     FROM posts
     JOIN users ON posts.user_id = users.id`
  );
  const posts = resultado.rows;
  res.json(posts);
});

initDb();

app.listen(port, () => {
  console.log('Servidor escuchando');
  console.log('Usuarios de prueba: admin/adminpass y user/userpass');
});