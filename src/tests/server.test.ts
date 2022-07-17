import { Request, Response, Application } from 'express';
import express = require('express');
import { Routes } from '../api/routes';
const request = require('supertest');
const app: Application = express();

app.use(express.json());

app.use(
    express.urlencoded({
        extended:true, 
    })
);
const dbInfo = {   
    user: 'user',
    host: 'localhost',
    database: 'api',
    password: 'Password1!',
    port: 5432
}
Routes(dbInfo, app);

describe('POST /items', () => {
    it('Should return status code 201 with a confirmation message.', async () => {
        const res = await request(app)
            .post('/items')
            .send({
                name: 'pan',
                description: 'stainless steel, 9"',
                inventory: 1
            });
        expect(res.statusCode).toEqual(201);
    });
});

describe('GET /items', () => {
    it('Should return status code 200 with list of items', async () => {
        const res = await request(app)
            .get('/items')
            .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeDefined();
    });
});


describe('PUT /items', () => {

});

describe('DELETE /items', () => {

});

describe('GET /reserve', () => {
    it('Should return status code 200 with list of reservations', async () => {
        const res = await request(app)
            .get('/reserve')
            .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeDefined();
    })
});

describe('POST /reserve', () => {
    it('Should return status code 201 with a success message', async () => {
        const res = await request(app)
            .post('/reserve')
            .send({
                itemName: 'pan',
                itemId: 1,
                email: 'foo@bar.com',
            })
    });
});

describe('POST /return', () => {

});