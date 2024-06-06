const express=require('express')
const app=express()
const cors=require('cors')
require('dotenv').config()
const port=process.env.PORT || 5000


// middleware
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const categoryCollection = client.db("MedicineDB").collection("category");
    const medicinesCollection = client.db("MedicineDB").collection("medicines");
    app.get('/categorySeller',async(req,res)=> {
      const result=await categoryCollection.find().toArray()
      res.send(result)
    })
    app.get('/categorySection',async(req,res)=>{
      const result=await categoryCollection.find().toArray()
      res.send(result)
    })
   app.get('/categoryUpdate/:id',async(req,res)=>{
    const Id=req.params.id
    const query={_id : new ObjectId(Id)}
    const result=await categoryCollection.findOne(query)
    res.send(result)
   })
    app.get('/categoryAdmin',async(req,res)=>{
      const result=await categoryCollection.find().toArray()
      res.send(result)
    })

    app.get('/usersForAdmin',async(req,res)=>{
      const result=await userCollection.find().toArray()
      console.log(result)
      res.send(result)
    })
    app.get('/users/:email',async(req,res)=>{
      const email=req.params.email
      const query={email : email}
      const result = await userCollection.findOne(query)
      res.send(result)
    })
    app.post('/medicines',async(req,res)=>{
      const data=req.body
      const result=await medicinesCollection.insertOne(data)
      res.send(result)
    })
    app.post('/addCategory',async(req,res)=>{
      const data=req.body
      const result=await categoryCollection.insertOne(data)
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
    app.put('/updateCategory/:id',async(req,res)=>{
      const data=req.body
      const Id=req.params.id
      const query={_id : new ObjectId (Id)}
      const options = { upsert: true }
      const updateDoc={
        $set:{
          categoryName:data.categoryName,
          photo:data.photo,
        }
      }
      const result=await categoryCollection.updateOne(query,updateDoc,options)
      res.send(result)
    })
    app.delete('/categoryDelete/:id',async(req,res)=>{
      const Id=req.params.id
      const query={_id : new ObjectId(Id)}
      const result=await categoryCollection.deleteOne(query)
      res.send(result)
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