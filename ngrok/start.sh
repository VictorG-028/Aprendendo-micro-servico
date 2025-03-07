#!/bin/sh

# Inicia o servidor Node.js em background
node server.js &

# Aguarda 2 segundos para garantir que o servidor está rodando
sleep 2

# Inicia o ngrok expondo a porta 8080
ngrok http --domain=certain-seasnail-entirely.ngrok-free.app 8080
# ngrok http 8080
