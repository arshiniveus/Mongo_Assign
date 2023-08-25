const request = require('supertest');
const express = require('express');
const app = express();
const __MONGO_URI__ = require('../mongoConnection');
const { MongoClient } = require('mongodb');

describe('Update Item', () => {
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



    it('should get all user from doc in collection', async () => {
        const users = db.collection('user');

        const response = await request('http://localhost:8009')
            .put('/user/getAllUser')
            .send(await users.find({}).toArray());

        if (response.status === 200) {
            // User already exists and was updated
            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.objectContaining({
                message: 'record found'
            }));
        } else if (response.status === 400) {
            // New user was updateed
            expect(response.status).toBe(400);
            expect(response.body).toEqual(expect.objectContaining({
                message: 'Record not found'
            }));
        } else if (response.status === 500) {
            // New user was updateed
            expect(response.status).toBe(500);
            expect(response.body).toEqual(expect.objectContaining({
                message: 'An error occurred while loading the record'
            }));
        }
    });
});
