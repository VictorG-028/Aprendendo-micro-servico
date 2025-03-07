#!/bin/bash
set -e

# Criar banco de dados
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE apsoo_db_product;
    GRANT ALL PRIVILEGES ON DATABASE apsoo_db_product TO $POSTGRES_USER;
    CREATE DATABASE apsoo_db_payment;
    GRANT ALL PRIVILEGES ON DATABASE apsoo_db_payment TO $POSTGRES_USER;
    CREATE DATABASE apsoo_db_user;
    GRANT ALL PRIVILEGES ON DATABASE apsoo_db_user TO $POSTGRES_USER;
EOSQL
