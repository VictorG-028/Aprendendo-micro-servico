
# Como executar conteneirizado

1. Abra o Docker Desktop
2. Execute
    ```bash
    docker-compose up --build
    ```
# Como executar no terminal
Observação: o serviço de Discovery deve ser executado primeiro ou dentro de 30 segundos para que os outros serviços não desistam de se registrar.

1. Abra o Docker Desktop
2. Execute o postgress sozinho:
    ```bash
        docker-compose -f docker-compose-only-db.yml up --build
    ```
3. Execute em cada serviço.
    ```bash
    npm i
    npx prisma generate
    npx prisma migrate dev --name init
    npm run dev
    ```

# Serviços

- Discovery (gateway)
- Product
- User
- Payment
- NGROK (redirecionador de requisições externas)

