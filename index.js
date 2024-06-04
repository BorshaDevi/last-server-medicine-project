const express=require('express')
const app=express()
const cors=require('cors')
require('dotenv').config()
const port=process.env.PORT || 5000


// middleware
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_Name}:${process.env.DB_pass}@cluster0.uqcmivv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();
    
    const userCollection = client.db("MedicineDB").collection("users");
    app.get('/users',async(req,res)=>{
      const result = userCollection.find().toArray()
      console.log(result)
      res.send(result)
    })
    app.post('/user',async(req,res)=>{
      const user=req.body
      console.log(user)
      const query={email :req.body.email}
      const result=await userCollection.findOne(query)
      if(result){
        return res.send('You are already here.')
      }
      const userData= await userCollection.insertOne(user)
      console.log(userData)
      res.send(userData)
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);














app.get('/',(req,res)=>{
    res.send('Medicine site running')
})
app.listen(port , () => {
    console.log(`Medicine website on port ${port}`)
})