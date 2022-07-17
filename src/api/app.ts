import { Application } from 'express';
import { Routes } from '../api/routes';
const express = require('express');

const app: Application = express();

app.use(express.json());

app.use(
    express.urlencoded({
        extended:true, 
    })
);
Routes(app);

export default app;