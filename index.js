const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.ygtr7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const productCollection = client.db("Baby-Shop").collection("products");
    const userCollection = client.db("Baby-Shop").collection("users");
    const reviewCollection = client.db("Baby-Shop").collection("reviews");

    //Product Collection

    app.get("/all-products", async (req, res) => {
      const sort = req.query.sort;
      let sortPrice = -1;
      if (sort === "desc") {
        sortPrice = 1;
      }
      const result = await productCollection
        .find()
        .sort({ price: sortPrice })
        .toArray();
      res.send(result);
    });

    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    //add product
    app.post("/add-product", async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne({
        ...newProduct,
        Timestamp: Date.now(),
      });
      res.send(result);
    });

    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    //=== Product Reviews ===//
    app.get("/all-reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { product_id: id };
      const result = await reviewCollection.find(query).toArray();
      res.send(result);
    });
    app.post("/review", async (req, res) => {
      const newReview = req.body;
      const result = await reviewCollection.insertOne(newReview);
      res.send(result);
    });

    //====User Collection ===//
    app.get("/all-users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const query = { email: newUser?.email };
      const isExist = await userCollection.findOne(query);
      if (isExist) {
        return res.send({ message: "User Already Existed", insertedId: null });
      }
      const result = await userCollection.insertOne({
        ...newUser,
        role: "User",
        Timestamp: Date.now(),
      });
      res.send(result);
    });

    app.patch("/user/:email", async (req, res) => {
      const email = req.params.email;
      const role = req.body;
      const filter = { email };
      let updatedRole = {
        $set: { role: role.role },
      };
      const result = await userCollection.updateOne(filter, updatedRole);
      res.send(result);
    });

    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
