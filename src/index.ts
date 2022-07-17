import { Application } from 'express';
import express = require('express');
import { Client } from 'pg';
import { Routes } from './api/routes';
const dotenv = require('dotenv');
dotenv.config();

const app: Application = express();

app.use(express.json());

app.use(
    express.urlencoded({
        extended:true, 
    })
);

const client =  new Client({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432
});
client.connect();

Routes(client, app);

const port: Number = 3000;
app.listen(port, () => {
    console.log(`Express server started on port ${port}`);
});
