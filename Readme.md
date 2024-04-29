[![Node.js CI](https://github.com/jay-bhogayata/stremify/actions/workflows/CI.yaml/badge.svg?branch=master)](https://github.com/jay-bhogayata/stremify/actions/workflows/CI.yaml) 
[![codecov](https://codecov.io/gh/jay-bhogayata/stremify/graph/badge.svg?token=TX4OV0SUR3)](https://codecov.io/gh/jay-bhogayata/stremify)

# Stremify

## Description

- A backend api for video streaming platform.


## Requirements

- Node.js
- npm
- AWS SES - for sending emails.
- Docker - for running the database's in a container.


> [!IMPORTANT]  
> Start databases and do migrations before running the server. [DB + Migrations](#db--migrations)

## How to run

- Clone the repository
- Run `npm install` or your favorite package manager to install the dependencies.
- rename `.env.example` to `.env` and update the values accordingly.
- Run `npm start` to start the server.
- For development, run `npm run dev` to start the development server.
- The server will be running on `http://localhost:3000` by default.
- To run the tests, run `npm test`.

## DB + Migrations

- start postgres container using `docker run --name stremify-db -e POSTGRES_PASSWORD=pg123 -e POSTGRES_DB=stremify -p 5432:5432 -d postgres:15`
- run redis container using `docker run --name stremify-redis -p 6379:6379 -d redis`
- generate the migration using `npm run db:generate`
- Run `npm run db:migrate` to run the migrations.