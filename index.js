const express = require('express');
const cookieParser = require('cookie-parser');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'monolito',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
});

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

app.get('/logout', (req, res) => {
  res.clearCookie('user');
  res.clearCookie('role');
  console.log('logged out');
  res.redirect('/');
});

app.post('/login', async (req, res) => {
  const { user, password } = req.body;
  try {
    const result = await client.query(
      'SELECT username, password, role FROM users WHERE username = $1',
      [user],
    );

    const dbuser = result.rows[0];
    if (!dbuser) {
      console.log('Usuario no encontrado');
      return res.redirect('/');
    }

    const ok = await bcrypt.compare(password, dbuser.password);
    if (!ok) {
      console.log('ContraseÃ±a incorrecta');
      return res.redirect('/');
    }

    res.cookie('user', dbuser.username, { httpOnly: true });
    res.cookie('role', dbuser.role, { httpOnly: true });

    console.log(`${dbuser.role} logged in`);
    return res.redirect(dbuser.role === 'admin' ? '/admin' : '/home');
  } catch (err) {
    console.error('Login error:', err);
    return res.redirect('/');
  }
});

async function start() {
  try {
    await client.connect();
    console.log('Conectado a la base de datos');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL
      );
    `);

    const adminHash = await bcrypt.hash('adminpass', 10);
    const userHash = await bcrypt.hash('userpass', 10);

    await client.query(
      `INSERT INTO users (username, password, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO NOTHING`,
      ['admin', adminHash, 'admin'],
    );

    await client.query(
      `INSERT INTO users (username, password, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO NOTHING`,
      ['user', userHash, 'user'],
    );

    app.listen(port, () => {
      console.log('Servidor escuchando');
      console.log('Usuarios de prueba: admin/adminpass y user/userpass');
    });
  } catch (err) {
    console.error('Error inicializando base de datos:', err);
    process.exit(1);
  }
}

start();
