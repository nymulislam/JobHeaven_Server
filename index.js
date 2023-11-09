const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


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

        // create data
        app.post('/jobs', async (req, res) => {
            const newJobs = req.body;
            console.log(newJobs)
            const result = await jobsCollection.insertOne(newJobs);
            res.send(result)
        })

        // read data
        app.get('/jobs', async (req, res) => {
            const cursor = jobsCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        // get data
        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await jobsCollection.findOne(query);
            res.send(result)
        })

        //update data
        app.put('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateJob = req.body;
            const job = {
                $set: {
                    user: updateJob.user,
                    title: updateJob.title,
                    type: updateJob.type,
                    salary: updateJob.salary,
                    applicant: updateJob.applicant,
                    description: updateJob.description,
                    url: updateJob.url,
                    date: updateJob.date,
                    deadline: updateJob.deadline,
                }
            }
            const result = await jobsCollection.updateOne(query, job, options)
            res.send(result)
        })

        // delete data
        app.delete('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await jobsCollection.deleteOne(query);
            res.send(result)
        })

        
        //All Jobs
        const allJobsCollection = client.db("jobsDB").collection("allJobs")

        // add cart
        app.post('/allJobs/add', async (req, res) => {
            const selectedCar = req.body;
            const result = await allJobsCollection.insertOne(selectedCar);
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

        // delete car from cart
        app.delete('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await allJobsCollection.deleteOne(query)
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