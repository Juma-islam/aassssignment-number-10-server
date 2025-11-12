const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ecxm2rv.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const db = client.db("clean-connect");
    const issuesCollection = db.collection("issues");
    const contributionsCollection = db.collection("contributions");

    // all issues
    app.get("/issues", async (req, res) => {
      const { category, status } = req.query;
      const filter = {};
      if (category) {
        filter.category = category;
      }
      if (status) {
        filter.status = status;
      }
      const result = await issuesCollection.find(filter).toArray();
      res.send(result);
    });

    // issue details
    app.get("/issues/:id", async (req, res) => {
      const { id } = req.params;
      console.log(id);
      const objectId = new ObjectId(id);
      const result = await issuesCollection.findOne({ _id: objectId });
      res.send({
        success: true,
        result,
      });
    });

    // add issue
    app.post("/issues", async (req, res) => {
      const data = req.body;
      // console.log(data)
      const result = await issuesCollection.insertOne(data);
      res.send({
        success: true,
        result,
      });
    });


    // modal contribution
    app.post("/contributions", async (req, res) => {
      const data = req.body;
      const result = await contributionsCollection.insertOne(data);
      res.send({ success: true, result });
    });


    // modal contribution id
    app.get("/contributions-by-issue/:issueId", async (req, res) => {
      const issueId = req.query.issueId;
      const result = await contributionsCollection.find({ issueId }).toArray();
      res.send({ success: true, result });
    });


    // My issue
    app.get("/my-issues/:email", async (req, res) => {
      const { email } = req.params;
      const result = await issuesCollection.find({ email }).toArray();
      res.send({ success: true, result });
    });


    // update issue
    app.put("/issues/:id", async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;
      const objectId = new ObjectId(id);
      const filter = { _id: objectId };
      const update = {
        $set: updateData,
      };
      const result = await issuesCollection.updateOne(filter, update);
      res.send({ success: true, result });
    });


    // delete issue
    app.delete("/issues/:id", async (req, res) => {
      const { id } = req.params;
      const result = await issuesCollection.deleteOne({ _id: new ObjectId(id) });
      res.send({ success: true, result });
    });


    //  all contributions
    app.get("/contributions", async (req, res) => {
      const email = req.query.email;
      const query = email ? { email } : {};
      const result = await contributionsCollection.find(query).toArray();
      res.send({ success: true, result });
    });


    // latest-issue
    app.get("/latest-issues", async (req, res) => {
      const result = await issuesCollection.find().sort({ date: "desc" }).limit(6).toArray();
      res.send(result);
    });

    // client db
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server running is fine!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
