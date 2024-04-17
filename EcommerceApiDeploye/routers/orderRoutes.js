const Order=require('../models/ordersModel')
const OrderItem=require('../models/order-item')
const express=require('express')
const router=express.Router();

router.get('/', async (req,res)=>{
    const orderList=await Order.find().populate("user",'name')
    .populate('orderItems')
    .sort({"dateOrdered":-1});

    if(!orderList){
        res.status(500).json({success:false})
    }
    res.send(orderList)
})




router.get('/:id', async (req,res)=>{
    const order=await Order.findById(req.params.id)
    .populate("user",'name')
    .populate({path:'orderItems', populate:{path:'product',populate:'category'}})
    // .populate({path:'orderItems', populate:'product'});

    if(!order){
        res.status(500).json({success:false})
    }
    res.send(order)
})

router.post('/',async (req,res)=>{

    const orderItemsIds =Promise.all(req.body.orderItems.map(async orderItem =>{
        let newOrderItem = new OrderItem({
            quantity:orderItem.quantity,
            product:orderItem.product
        })
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id
    }))
    // console.log(orderItemsIds)
    const orderItemsIdsResolved = await orderItemsIds

    const totalPrices= await Promise.all(orderItemsIdsResolved.map(async (orderItemId)=>{
        const orderItem= await OrderItem.findById(orderItemId).populate('product','price')
        const totalPrice=orderItem.product.price*orderItem.quantity;
   
        return totalPrice
    }))
//   const check=await totalPrices 
//     console.log("dsfsdf",check)
    const totalPrice=totalPrices.reduce((a,b)=>a +b,0)
    console.log(totalPrice)

    let order = new Order({
        orderItems:orderItemsIdsResolved,
        shippingAddress1:req.body.shippingAddress1,
        shippingAddress2:req.body.shippingAddress2,
        city:req.body.city,
        zip:req.body.zip,
        country:req.body.country,
        phone:req.body.phone,
        status:req.body.status,
        totalPrice:totalPrice,
        user:req.body.user
    })
    order= await order.save();
    if(!order)
    return res.status(400).send('The Order cannot be created !')
    res.send(order)
})


router.put('/:id',async(req,res)=>{
    const order = await Order.findByIdAndUpdate(req.params.id, {
       status:req.body.status
    }, {new :true})
    if(!order)
    return res.status(400).send('the order cannot be created')

    res.send(order)
})



router.delete('/:id',(req,res)=>{
    Order.findByIdAndRemove(req.params.id).then(async order=>{
        if(order){
            await order.orderItem.map(async orderItem=>{
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({success:true, message:'the order is deleted'})
        }
        else{
            return res.status(404).json({success:false, message:"order not found"})
        }
    }).catch(err=>{
        return res.status(400).json({success:false, error:err})
    })
})


// total sales 
router.get('/get/totalsales',async (req,res)=>{
    const totalSales= await Order.aggregate([
        {$group:{_id:null , totalSales:{$sum:'$totalPrice'}}}
    ])
    if(!totalSales){
        return res.status(400).send('The order sales cannot be generated')
    }
    res.send({totalSales:totalSales.pop().totalSales})
})

// how many order places in my shop
router.get('/get/count', async (req,res)=>{
   
    const orderCount=await Order.countDocuments()
    if(!orderCount){
       return  res.status(500).json({success:false})
        }
        return res.send({orderCount})
})

module.exports=router;





// {
//     "orderItems":[{
//         "quantity":3,
//         "product":"638852f941ec21959cfe2429"
//     },
//     {
//         "quantity":3,
//         "product":"638dd84c69653dd1acbaba73"
//     }
//     ],
//     "shippingAddress1": "Flowers Street , 45",
//     "shippingAddress2": "1-B",
//     "city":"koklata",
//     "zip":"000000",
//     "country":"india",
//     "phone":"+919955887877",
//     "user":"638db1b868753ebe873b9f21"
// }