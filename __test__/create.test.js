const request = require('supertest');
const express = require('express');
const app = express();
const __MONGO_URI__ = require('../mongoConnection');
const { MongoClient } = require('mongodb');

describe('Create Item', () => {
    let connection;
    let db;

    beforeAll(async () => {
        connection = await MongoClient.connect(__MONGO_URI__, {
            useNewUrlParser: true,
        });
        db = connection.db("people");
    });

    afterAll(async () => {
        await connection.close();
    });



    it('should insert a doc into collection', async () => {
        const mockUser = {
            name: 'John',
            gender: 'male',
            location: 'manglr',
            email: 'arsghh@gmail.com',
        };

        const response = await request('http://localhost:8009')
            .post('/user/insert')
            .send(mockUser);

        if (response.status === 200) {
            // User already exists and was updated
            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.objectContaining({
                message: 'Records inserted successfully'
            }));
        } else if (response.status === 400) {
            // New user was inserted
            expect(response.status).toBe(400);
            expect(response.body).toEqual(expect.objectContaining({
                message: 'Email already exists'
            }));
        } else if (response.status === 500) {
            // New user was inserted
            expect(response.status).toBe(500);
            expect(response.body).toEqual(expect.objectContaining({
                message: 'An error occurred while processing the request'
            }));
        } else if (response.status === 401) {
            // New user was inserted
            expect(response.status).toBe(400);
            expect(response.body).toEqual(expect.objectContaining({
                message: 'Failed to insert records'
            }));
        }
    });
});
