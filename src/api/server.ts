import { Request, Response, Application } from 'express';
import express = require('express');
import { Routes } from './routes';

const app: Application = express();

app.use(express.json());

app.use(
    express.urlencoded({
        extended:true, 
    })
);

Routes(app);

export default app;