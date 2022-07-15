import { Request, Response, Application } from 'express';
import express = require('express');
import { Routes } from './api/routes';

const app: Application = express();

app.use(express.json());

app.use(
    express.urlencoded({
        extended:true, 
    })
);

Routes(app);

app.listen(3000, () => {
    console.log('Express server started on port 3000');
});