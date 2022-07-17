const request = require('supertest');
import app from '../api/server'

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

});