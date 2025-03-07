# Usa uma imagem base do Node.js
FROM node:23-slim

RUN npm install -g ngrok

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Dá permissão de execução ao script start.sh
COPY server.js start.sh ./
RUN chmod +x start.sh

EXPOSE 8080

CMD ["sh", "./start.sh"]
