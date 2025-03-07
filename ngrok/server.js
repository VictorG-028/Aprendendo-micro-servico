// import express, { json } from "express";
const express = require("express");
const { json } = require("express");
const app = express();
const PORT = 8080;

app.use(json());

// app.post("/", (req, res) => {
//   const { topic, id } = req.query; // Captura os parâmetros da URL
//   console.log(`Notificação recebida: topic=${topic}, id=${id}`);

//   res.status(200).json({ message: "Servidor NGROK está rodando na porta 8080!" });
// });
// app.post("", (req, res) => {
//   const { topic, id } = req.query; // Captura os parâmetros da URL
//   console.log(`Notificação recebida: topic=${topic}, id=${id}`);

//   res.status(200).json({ message: "Servidor NGROK está rodando na porta 8080!" });
// });
// app.all("", (req, res) => {
//   const { topic, id } = req.query; // Captura os parâmetros da URL
//   console.log(`Notificação recebida: topic=${topic}, id=${id}`);

//   res.status(200).json({ message: "Servidor NGROK está rodando na porta 8080!" });
// });

// https://certain-seasnail-entirely.ngrok-free.app -> http://localhost:8080 
app.post("/notify", (req, res) => {
  const { topic, id } = req.query; // Captura os parâmetros da URL
  console.log(`Notificação recebida: topic=${topic}, id=${id}`);

  res.status(200).json({ message: "Servidor NGROK está rodando na porta 8080!" });
});

app.get("/", (req, res) => { res.json({ message: "Servidor NGROK está rodando na porta 8080!" }); });

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
