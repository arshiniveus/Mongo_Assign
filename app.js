const express = require('express');
const bodyparser = require('body-parser');
// const User = require('./user');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const mongoose = require('./db.js');

const router = express.Router();
const app = express();
const uri = require('./mongoConnection.js');

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.use(express.json()); // Middleware for parsing JSON bodies
app.use(express.urlencoded({ extended: true })); // Middleware for parsing URL-encoded bodies

async function run () {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect();

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("MongoDB Connected");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);

app.post('/user/insert', async (req, res) => {
    try {
        await client.connect();

        const db = client.db("people");
        const collection = db.collection("user");

        // Insert the user
        const result = await collection.insertOne(req.body);
        console.log({ result });
        if (result.insertedId) {
            console.log("Inserted IDs:", result.insertedId);
            res.status(200).send({
                status: 200,
                result,
                message: "Records inserted successfully"
            });
        } else {
            res.status(401).send({
                status: 401,
                message: "Failed to insert records"
            });
        }

    } catch (e) {
        // Handle duplicate key error (email already exists)
        if (e.code === 11000) {
            console.log("  message: Email already exists");
            res.status(400).send({
                status: 400,
                message: "Email already exists"
            });
        } else {
            console.error(e);
            res.status(500).send({
                status: 500,
                message: "An error occurred while processing the request"
            });
        }
    } finally {

        await client.close();
    }
});

app.put('/user/update', async (req, res) => {
    try {
        console.log("ss", req.body);
        await client.connect();

        const db = client.db("people");
        const collection = db.collection("user");

        const result = await collection.updateOne(
            { _id: new ObjectId(req.body.id) },
            {
                $set: {
                    "name": req.body.name,
                    "gender": req.body.gender,
                    "location": req.body.location
                }
            }
        );
        if (result.matchedCount > 0) {
            res.status(200).send({
                status: 200,
                message: "Record updated successfully"
            });
        } else {
            res.status(404).send({
                status: 404,
                message: "Record not found"
            });
        }
    } catch (e) {
        console.error(e);
        res.status(500).send({
            status: 500,
            message: "An error occurred while updating the record"
        });
    } finally {
        await client.close();
    }
});

app.get('/user/getAllUser', async (req, res) => {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        console.log("All Users:", req.body);
        await client.connect();
        // Now you can interact with your database through the client object
        const db = client.db("people");
        const collection = db.collection("user");
        // Example: Insert a document
        const result = await collection.find({}).toArray();
        console.log(result);
        if (result) {
            res.send({
                status: 200,
                data: result,
                message: "record found"
            })
        } else {
            res.status(404).send({
                status: 404,
                data: [],
                message: "Record not found"
            });
        }
    } catch (e) {
        console.error(e);
        res.status(500).send({
            status: 500,
            message: "An error occurred while loading the record"
        });
    }
    finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
})

app.listen(8009, () => {
    console.log(`connecting to the server....http://localhost:8009`);
})

module.exports = {
    app
}