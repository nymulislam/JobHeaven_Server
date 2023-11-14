const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();

const port = process.env.PORT || 5000;


app.use(cors({
    origin: [
        'http://localhost:5173'
    ],
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());



const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.tloczwa.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const jobsCollection = client.db("jobsDB").collection("jobs");

        // Auth Related api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            console.log('user for token', user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_KEY, {
                expiresIn: "1h"
            });
            res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
            res.header('Access-Control-Allow-Credentials', true);

            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
            })
            res.send({ success: true });
        });

        app.post("/logout", async (req, res) => {
            const user = req.body;
            console.log('loggedOut:', user);
            res.clearCookie('token', { maxAge: 0 }).send({ success: true })
        })

        // //update data
        // app.put('/jobs/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) };
        //     const options = { upsert: true };
        //     const updateJob = req.body;
        //     const job = {
        //         $set: {
        //             user: updateJob.user,
        //             title: updateJob.title,
        //             type: updateJob.type,
        //             salary: updateJob.salary,
        //             applicant: updateJob.applicant,
        //             description: updateJob.description,
        //             url: updateJob.url,
        //             date: updateJob.date,
        //             deadline: updateJob.deadline,
        //         }
        //     }
        //     const result = await jobsCollection.updateOne(query, job, options)
        //     res.send(result)
        // })

        // // delete data
        // app.delete('/jobs/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) }
        //     const result = await jobsCollection.deleteOne(query);
        //     res.send(result)
        // })


        //All Jobs
        const allJobsCollection = client.db("jobsDB").collection("allJobs")

        // add Job
        app.post('/allJobs/add', async (req, res) => {
            const selectedJob = req.body;
            const result = await allJobsCollection.insertOne(selectedJob);
            res.send(result)
        })

        // read data 
        app.get('/allJobs/add', async (req, res) => {
            const cursor = allJobsCollection.find();
            const result = await cursor.toArray()
            res.send(result);
        })

        // get data
        app.get('/allJobs/add/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await allJobsCollection.findOne(query);
            res.send(result)
        })


        // Applied Jobs
        const appliedJobsCollection = client.db("jobsDB").collection("appliedJobs")

        app.get('/appliedJobs', async (req, res) => {
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await appliedJobsCollection.find(query).toArray();
            res.send(result);
        })
        // Store Applied Jobs
        app.post('/appliedJobs/add', async (req, res) => {
            const appliedJob = req.body;
            console.log(appliedJob);
            const result = await appliedJobsCollection.insertOne(appliedJob)
            res.send(result)
        })

        // Read Applied Jobs
        app.get('/appliedJobs/add', async (req, res) => {

            const cursor = appliedJobsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("JobHeaven Server is Running...")
})

app.listen(port, () => {
    console.log(`JobHeaven Server is Running on ${port}`);
})