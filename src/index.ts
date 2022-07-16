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

const port: Number = 3000;
app.listen(port, () => {
    console.log(`Express server started on port ${port}`);
});
export default app;