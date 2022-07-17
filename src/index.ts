import { Request, Response, Application } from 'express';
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
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PASSWORD,
    port: 5432
});
client.connect();

Routes(client, app);

const port: Number = 3000;
app.listen(port, () => {
    console.log(`Express server started on port ${port}`);
});
