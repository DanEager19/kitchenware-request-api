const request = require('supertest');
import { Request, Response, Application } from 'express';
import express = require('express');
import { Client } from 'pg';
import { Routes } from '../api/routes';

const app: Application = express();

app.use(express.json());

app.use(
    express.urlencoded({
        extended:true, 
    })
);

const client =  new Client({
    user: 'user',
    host: 'localhost',
    database: 'api',
    password: 'Password1!',
    port: 5432
})
client.connect()

Routes(client, app);

describe('POST /items', () => {
    it('Should return status code 201 with a confirmation message of item creation.', async () => {
        const res = await request(app)
            .post('/items')
            .send({
                name: 'pan',
                description: 'stainless steel, 9 inch',
                inventory: 5
            });
        expect(res.statusCode).toEqual(201);
    });
});

describe('GET /items', () => {
    it('Should return status code 200 with list of items.', async () => {
        const res = await request(app)
            .get('/items')
            .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeDefined();
    });
});

describe('GET /reserve', () => {
    it('Should return status code 200 with list of reservations.', async () => {
        const res = await request(app)
            .get('/reserve')
            .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeDefined();
    })
});

describe('POST /reserve', () => {
    it('Should return status code 201 with a success message or 403 on weekends.', async () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);

        const res = await request(app)
            .post('/reserve')
            .send({
                itemName: 'pan',
                itemId: 1,
                email: 'foo@bar.com',
            });

        if(d.getDay() === 0 || d.getDay() === 6) {
            expect(res.statusCode).toEqual(403);
        } else {
            expect(res.statusCode).toEqual(201)
        }
    });
});

describe('POST /return', () => {
    it('Should return status code 200 with a success message regarding a successful return.', async () => {
        const res = await request(app)
            .post('/return')
            .send({
                id: 1,
                itemId: 1
            });
        expect(res.statusCode).toEqual(200);
    });
});

describe('PUT /items', () => {
    it('Should return status code 200 with a confirmation message of updated item.', async () => {
        const res = await request(app)
            .put('/items')
            .send({
                id: 1,
                name: 'pan',
                description: 'stainless steel, 9 inch',
                inventory: 6
            });
        expect(res.statusCode).toEqual(200);
    });
});

describe('DELETE /items', () => {
    it('Should return status code 200 with a confirmation message of deleted item.', async () => {
        const res = await request(app)
            .delete('/items')
            .send({
                id: 1
            });
        expect(res.statusCode).toEqual(200);
    });
});

afterAll(async () => {
    await client.end()
})
