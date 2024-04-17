const express=require('express');
const app=express();
const bodyparser=require('body-parser')
const morgan=require('morgan');
const mongoose=require('mongoose');
const cors=require('cors')
require('dotenv').config();
const atuhJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler')


// middleware
app.use(cors());
app.options("*", cors());
app.use(bodyparser.json());
app.use(morgan('tiny'));
app.use(atuhJwt());
// app.use((err,req,res,next) =>{
//     if(err){
//         res.status(500).json({message:err})
//     }
// })
app.use(errorHandler)


//Routers
const CategoriesRoutes=require('./routers/CategoriesRoutes')
const productRouters=require('./routers/productsRouter')
const usersRoutes=require('./routers/usersRoutes')
const orderRoutes=require('./routers/orderRoutes');

const api=process.env.ApI_URL
const PORT = process.env.PORT || 5658 ;
// console.log(api)

app.use(`${api}/categories`,CategoriesRoutes)
app.use(`${api}/products`,productRouters)
app.use(`${api}/users`,usersRoutes)
app.use(`${api}/orders`,orderRoutes)





//Databse connection

mongoose.connect("mongodb+srv://ManojKumar:ManojKumar@cluster0.jir7wgl.mongodb.net/mydb?retryWrites=true&w=majority").then(()=>{
    // pritam link
    //mongodb+srv://ManojKumar:ManojKumar@cluster0.jir7wgl.mongodb.net/pritamDatabase?retryWrites=true&w=majority
    console.log('Database connection is ready .....')
}).catch((err)=>{
    console.log(err)
})

// Server
app.listen(PORT,()=>{
    console.log(`server is running http://localhost:${[PORT]}`)
})
