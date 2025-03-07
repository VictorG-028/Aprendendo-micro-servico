FROM node:23-slim

# Para usar o prisma precisa das bibliotecas openssl e libssl-dev
RUN apt-get update && apt-get install -y openssl libssl-dev

# Para usar CURL dentro do container
RUN apt-get -y install curl 

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate
# RUN npx prisma migrate deploy

EXPOSE 8002

CMD ["npm", "run", "dev-container"]
# CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev-container"]
