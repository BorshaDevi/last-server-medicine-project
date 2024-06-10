const express=require('express')
const app=express()
const cors=require('cors')
const jwt = require('jsonwebtoken');
const stripe=require('stripe')('sk_test_51PMkfTP67aUCtjqbgj1LoUx9FgbOHQaEdNXw93IwVr5Kp8mbUjxIKwAtjle2Av7cITmJHliLpES5nGgSRFAHSztW00a8b3piJD')
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
    const cartsCollection = client.db("MedicineDB").collection("carts");
    const paymentsCollection = client.db("MedicineDB").collection("payments");
   

    const verifyToken=(req,res,next)=>{
      console.log('Verify Token',req.headers.authorization )
      if(!req.headers.authorization){
        return res.status(401).send({message: ''})
      }
      const token=req.headers.authorization.split(' ')[1]
      jwt.verify(token, process.env.JW_token_secret, (err, decoded) =>{
        if(err){
          console.log('error ....',err)
          return res.status(401).send({message: ''})
        }
        console.log('decoded',decoded)
        req.decoded=decoded
        next()
      })
    }
   const verifyAdmin=async(req,res,next)=>{
    const email=req.decoded.email
    const query={email : email}
   
    const user=await userCollection.findOne(query)
   
    const isAdmin=user?.role === 'admin'
    if(!isAdmin){
      return res.status(403).send({message : 'forbidden'})
    }
    next()
   }
   const verifySeller=async(req,res,next)=>{
    const email=req.decoded.email
    const query={email : email}
   
    const user=await userCollection.findOne(query)
   
    const isSeller=user?.role === 'seller'
    if(!isSeller){
      return res.status(403).send({message : 'forbidden'})
    }
    next()
   }

    // app.get('/adminRevenue',verifyToken,verifyAdmin,async(req,res)=>{
    //   const paid=await paymentsCollection.find().toArray()
    //   console.log(paid)
    //   const paidRevenue= paid.status === 'paid'.reduce((total,item) => total + item.price ,0)
    //   if
    //   const pendingRevenue= pending.status === 'pending'.reduce((total,item) => total + item.price ,0)
    //   res.send({paidRevenue ,pendingRevenue,paid})
    // })

   app.get('/salesReport',verifyToken,verifyAdmin,async(req,res)=>{
       const status=req.query.status
       const query={status : status}
       const result=await paymentsCollection.find(query).toArray()
    res.send(result)
   })    
  app.get('/userPaymentHistory/:email',verifyToken,async(req,res)=>{
    const email=req.params.email
    const query={buyerEmail :email}
    const result=await paymentsCollection.find(query).toArray()
    res.send(result)
  })
  app.get('/sellerPaymentHistory/:email',verifyToken,verifySeller,async(req,res)=>{
    const email=req.params.email
    const query={sellerEmail :email}
    const result=await paymentsCollection.find(query).toArray()
    res.send(result)
  })

  app.get('/adminPaymentHistory',verifyToken,verifyAdmin,async(req,res)=>{
    const result=await paymentsCollection.find().toArray()
    res.send(result)
  })  
  app.get('/cart/:email',verifyToken,async(req,res)=>{
    const sort=req.query.sort
    console.log(sort)
    const email=req.params.email
    const query={buyerEmail :email}
    let option={}
    if(sort){
      option.quantity = sort === 'asc'?1:-1
    }
    const result=await cartsCollection.find(query).sort(option).toArray()
    res.send(result)
  })
    app.get('/discount',async(req,res)=>{
      const result=await medicinesCollection.find().toArray()
      res.send(result)
    })

    app.get('/detailCategory/:category',verifyToken,async(req,res)=>{
      
      const category=req.params.category
      const query={category :category}
      const result =await medicinesCollection.find(query).toArray()
      res.send(result)
    })


   app.get('/medicineDetail/:id',async(req,res)=>{
    const id=req.params.id
    const query={_id : new ObjectId(id)}
    const result=await medicinesCollection.findOne(query)
    res.send(result)
   })
    app.get('/shopMedicines',async(req,res)=>{
      const result=await medicinesCollection.find().toArray()
      console.log(result)
       res.send(result)
    })
    app.get('/medicinesSeller/:email',verifyToken,verifySeller,async(req,res)=>{
      const email=req.params.email
      const query ={sellerEmail :email}
      const result=await medicinesCollection.find(query).toArray()
      console.log(result)
      res.send(result)
    })
    app.get('/categorySeller',verifyToken,verifySeller,async(req,res)=> {
      const result=await categoryCollection.find().toArray()
      res.send(result)
    })
    app.get('/categorySection',async(req,res)=>{
      const result=await categoryCollection.find().toArray()
      res.send(result)
    })
   app.get('/categoryUpdate/:id',verifyToken,async(req,res)=>{
    const Id=req.params.id
    const query={_id : new ObjectId(Id)}
    const result=await categoryCollection.findOne(query)
    res.send(result)
   })
    app.get('/categoryAdmin',verifyToken,verifyAdmin,async(req,res)=>{
      const result=await categoryCollection.find().toArray()
      res.send(result)
    })

    app.get('/usersForAdmin',verifyToken,verifyAdmin,async(req,res)=>{
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

  app.post('/payment',verifyToken,async(req,res)=>{
    const payment=req.body
    const result=await paymentsCollection.insertOne(payment)
   const deleteCarts={_id :
    {
      $in : payment.cartIds.map(id => new ObjectId(id) )
    }
   }
   const updateDoc=await cartsCollection.deleteMany(deleteCarts)
    res.send({result , updateDoc})
  })
  //  payment method
  app.post('/create-payment-intent',verifyToken,async(req,res)=>{
    const {price}=req.body
    const amount=price * 100
    const paymentIntent=await stripe.paymentIntents.create({
      amount:amount,
      currency: "eur",
      payment_method_types:[
        'card'
      ]
    })
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  })
  

  //jwt
  app.post('/jwt',async(req,res)=>{
    const email=req.body
    console.log('from jwt',email)
    const token=jwt.sign(email, process.env.JW_token_secret, { expiresIn: '1h' })
    res.send({token})
  })



    app.post('/medicines',verifyToken,verifySeller,async(req,res)=>{
      const data=req.body
      const result=await medicinesCollection.insertOne(data)
      res.send(result)
    })
    
    app.post('/addCart',verifyToken,async(req,res)=>{
      const cart=req.body
       const result=await cartsCollection.insertOne(cart)
       console.log(result)
       res.send(result)
    })
    app.post('/addCategory',verifyToken,verifyAdmin,async(req,res)=>{
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
    app.put('/updateCategory/:id',verifyToken,verifyAdmin,async(req,res)=>{
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
    app.patch('/statusUpdate/:id',verifyToken,verifyAdmin,async(req,res)=>{
      const Id=req.params.id
      const query={_id : new ObjectId(Id)}
      const updateDoc={
        $set:{
          status:'paid',
        }
      }
      const result=await paymentsCollection.updateOne(query,updateDoc)
      res.send(result)
    })
    app.patch('/roleUpdate/:Id',verifyToken,verifyAdmin,async(req,res)=>{
      const Id=req.params.Id
      const {role}=req.body
      const query={_id :new ObjectId (Id)}
      const updateDoc={
       $set:{

         role:role,
       }
      
        
      }
      const result=await userCollection.updateOne(query,updateDoc)
      console.log(role)
      res.send(result)
    })
    app.delete('/deleteCart/:id',verifyToken,async(req,res)=>{
      const Id=req.params.id
      const query={_id : new ObjectId(Id)}
      const result=await cartsCollection.deleteOne(query)
      res.send(result)
    })
    app.delete('/categoryDelete/:id',verifyToken,verifyAdmin,async(req,res)=>{
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