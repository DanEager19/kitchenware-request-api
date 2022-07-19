import { Application } from 'express';
import { Routes } from '../api/routes';
import express from 'express';

const app: Application = express();

app.use(express.json());

app.use(
    express.urlencoded({
        extended:true, 
    })
);
Routes(app);

export default app;