import { Application } from 'express';
import { Client } from 'pg';
import { Routes } from '../api/routes';
const express = require('express');
const dotenv = require('dotenv');
const request = require('supertest');
dotenv.config();

const app: Application = express();

app.use(express.json());

app.use(
    express.urlencoded({
        extended:true, 
    })
);

const client = new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432
})

client.connect()

Routes(client, app);

describe('Testing all routes.', () => {
    let server: any;

    beforeEach(() => {
        server = app.listen(3000, () => {
            console.log('Listening on port 3000')
        });
    });

    afterEach(async () => {
        await server.close();
    });

    it('POST /items - Should return status code 201 with a confirmation message of item creation.', async () => {
        const res = await request(app)
            .post('/items')
            .send({
                name: 'pan',
                description: 'stainless steel, 9 inch',
                inventory: 5
            });
        expect(res.statusCode).toEqual(201);
    });

    it('GET /items - Should return status code 200 with list of items.', async () => {
        const res = await request(app)
            .get('/items')
            .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeDefined();
    });

    it('GET /reserve - Should return status code 200 with list of reservations.', async () => {
        const res = await request(app)
            .get('/reserve')
            .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeDefined();
    });

    it('POST /reserve - Should return status code 201 with a success message or 403 on weekends.', async () => {
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

    it('POST /return - Should return status code 200 with a success message regarding a successful return.', async () => {
        const res = await request(app)
            .post('/return')
            .send({
                id: 1,
                itemId: 1
            });
        expect(res.statusCode).toEqual(200);
    });

    it('PUT /items - Should return status code 200 with a confirmation message of updated item.', async () => {
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
    
    it('DELETE /items - Should return status code 200 with a confirmation message of deleted item.', async () => {
        const res = await request(app)
            .delete('/items')
            .send({
                id: 1
            });
        expect(res.statusCode).toEqual(200);
    });
});

afterAll(async () => {
    client.end()
})
