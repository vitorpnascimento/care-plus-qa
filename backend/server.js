// Care Plus - API de serviços de bem-estar
// Sistema enxuto para validação de QA (Sprint 4)
// Funcionalidades: cadastro/login, hidratação, check-in de bem-estar, dicas

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const JWT_SECRET = "care-plus-secret-qa";
const META_AGUA_PADRAO = 2000; // ml por dia

// Banco em memória (sem dependência externa, facilita rodar e testar)
const usuarios = []; // { id, nome, email, senhaHash, metaAgua }
const hidratacao = []; // { usuarioId, dia, totalMl }
const checkins = []; // { usuarioId, dia, humor, horasSono }
let proximoId = 1;

const DICAS = [
  { id: 1, titulo: "Beba água ao acordar", texto: "Um copo de água em jejum ajuda a iniciar o dia hidratado." },
  { id: 2, titulo: "Pausa para alongar", texto: "A cada 1 hora sentado, levante e alongue por 2 minutos." },
  { id: 3, titulo: "Durma melhor", texto: "Evite telas 30 minutos antes de dormir para melhorar o sono." },
];

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

// Middleware de autenticação
function autenticar(req, res, next) {
  const header = req.headers["authorization"] || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ erro: "Token nao informado" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuarioId = payload.id;
    next();
  } catch (e) {
    return res.status(401).json({ erro: "Token invalido" });
  }
}

// --- Autenticação ---

app.post("/auth/register", (req, res) => {
  const { nome, email, senha } = req.body || {};
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "nome, email e senha sao obrigatorios" });
  }
  if (senha.length < 6) {
    return res.status(400).json({ erro: "senha deve ter ao menos 6 caracteres" });
  }
  const jaExiste = usuarios.find((u) => u.email === email);
  if (jaExiste) {
    return res.status(409).json({ erro: "email ja cadastrado" });
  }
  const senhaHash = bcrypt.hashSync(senha, 8);
  const usuario = { id: proximoId++, nome, email, senhaHash, metaAgua: META_AGUA_PADRAO };
  usuarios.push(usuario);
  return res.status(201).json({ id: usuario.id, nome: usuario.nome, email: usuario.email });
});

app.post("/auth/login", (req, res) => {
  const { email, senha } = req.body || {};
  const usuario = usuarios.find((u) => u.email === email);
  if (!usuario || !bcrypt.compareSync(senha || "", usuario.senhaHash)) {
    return res.status(401).json({ erro: "credenciais invalidas" });
  }
  const token = jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: "2h" });
  return res.status(200).json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
});

app.get("/me", autenticar, (req, res) => {
  const usuario = usuarios.find((u) => u.id === req.usuarioId);
  if (!usuario) return res.status(404).json({ erro: "usuario nao encontrado" });
  return res.status(200).json({ id: usuario.id, nome: usuario.nome, email: usuario.email, metaAgua: usuario.metaAgua });
});

// --- Hidratação ---

app.post("/hidratacao", autenticar, (req, res) => {
  const { quantidadeMl } = req.body || {};
  if (typeof quantidadeMl !== "number" || quantidadeMl <= 0) {
    return res.status(400).json({ erro: "quantidadeMl deve ser um numero positivo" });
  }
  const usuario = usuarios.find((u) => u.id === req.usuarioId);
  const dia = hoje();
  let registro = hidratacao.find((h) => h.usuarioId === req.usuarioId && h.dia === dia);
  if (!registro) {
    registro = { usuarioId: req.usuarioId, dia, totalMl: 0 };
    hidratacao.push(registro);
  }
  registro.totalMl += quantidadeMl;
  const progresso = Math.round((registro.totalMl / usuario.metaAgua) * 100);
  return res.status(201).json({
    dia,
    totalMl: registro.totalMl,
    metaMl: usuario.metaAgua,
    progresso, // porcentagem
    metaAtingida: registro.totalMl >= usuario.metaAgua,
  });
});

app.get("/hidratacao/hoje", autenticar, (req, res) => {
  const usuario = usuarios.find((u) => u.id === req.usuarioId);
  const dia = hoje();
  const registro = hidratacao.find((h) => h.usuarioId === req.usuarioId && h.dia === dia);
  const totalMl = registro ? registro.totalMl : 0;
  const progresso = Math.round((totalMl / usuario.metaAgua) * 100);
  return res.status(200).json({
    dia,
    totalMl,
    metaMl: usuario.metaAgua,
    progresso,
    metaAtingida: totalMl >= usuario.metaAgua,
  });
});

// --- Check-in de bem-estar ---

const HUMORES = ["ruim", "neutro", "bom", "otimo"];

app.post("/checkin", autenticar, (req, res) => {
  const { humor, horasSono } = req.body || {};
  if (!HUMORES.includes(humor)) {
    return res.status(400).json({ erro: "humor invalido. Use: ruim, neutro, bom, otimo" });
  }
  if (typeof horasSono !== "number" || horasSono < 0 || horasSono > 24) {
    return res.status(400).json({ erro: "horasSono deve ser um numero entre 0 e 24" });
  }
  const dia = hoje();
  const jaTem = checkins.find((c) => c.usuarioId === req.usuarioId && c.dia === dia);
  if (jaTem) {
    return res.status(409).json({ erro: "check-in de hoje ja registrado" });
  }
  const checkin = { usuarioId: req.usuarioId, dia, humor, horasSono };
  checkins.push(checkin);
  return res.status(201).json(checkin);
});

app.get("/checkin", autenticar, (req, res) => {
  const lista = checkins.filter((c) => c.usuarioId === req.usuarioId);
  return res.status(200).json(lista);
});

// --- Dicas de bem-estar (público) ---

app.get("/dicas", (req, res) => {
  return res.status(200).json(DICAS);
});

app.listen(PORT, () => {
  console.log(`Care Plus API rodando em http://localhost:${PORT}`);
});

module.exports = app;
