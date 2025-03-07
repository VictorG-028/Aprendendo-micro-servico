FROM node:23-slim

# Para usar o prisma precisa das bibliotecas openssl e libssl-dev
RUN apt-get update && apt-get install -y openssl libssl-dev

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate
# RUN npx prisma migrate deploy

EXPOSE 8001

CMD ["npm", "run", "dev-container"]
