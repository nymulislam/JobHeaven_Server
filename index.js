const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();

const port = process.env.PORT || 5000;

const corsOptions = {
    origin: 'https://job-heaven.vercel.app',
    credentials: true,
};

app.use(cors(corsOptions));


app.use(express.json());
app.use(cookieParser());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tloczwa.mongodb.net/?retryWrites=true&w=majority`;

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

        const jobsCollection = client.db("jobsDB").collection("jobs");

        // Auth Related api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            console.log('user for token', user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_KEY, {
                expiresIn: "1h"
            });
            res.header('Access-Control-Allow-Origin', 'https://job-heaven.vercel.app/');
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

        // get job as user
        app.get('/allJobs/user', async (req, res) => {
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await allJobsCollection.find(query).toArray();
            res.send(result);
        })

        // get data
        app.get('/allJobs/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await allJobsCollection.findOne(query);
            res.send(result)
        })

        //update data
        app.put('/allJobs/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updateJob = req.body;
            const job = {
                $set: {
                    employer: updateJob.employer,
                    title: updateJob.title,
                    category: updateJob.category,
                    salaryRange: updateJob.salaryRange,
                    applicantsNumber: updateJob.applicantsNumber,
                    description: updateJob.description,
                    pictureUrl: updateJob.pictureUrl,
                    postingDate: updateJob.postingDate,
                    applicationDeadline: updateJob.applicationDeadline,
                },
                $inc: { applicantsNumber: 1 } // Increment the applicantsNumber by 1
            }
            const options = { upsert: true };
            const result = await allJobsCollection.updateOne(query, job, options)
            res.send(result)
        })


        // delete data
        app.delete('/allJobs/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await allJobsCollection.deleteOne(query);
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
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("JobHeaven Server is Running...")
})

app.listen(port, () => {
    console.log(`JobHeaven Server is Running on ${port}`);
})