const express = require('express')
const router = express.Router();
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const mongoose = require('mongoose')



// router.get("/",async(req,res)=>{
//     try{

//         const productList= await Product.find().populate('category');
//         res.send(productList)
//     }catch(err){
//         res.status(500).json({
//             error:err,
//             success:false
//         })}
// })


router.get("/:id", async (req, res) => {
    try {

        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(500).json({ success: false })
        }
        res.send(product)
    } catch (err) {
        res.status(500).json({
            error: err,
            success: false
        })
    }
})

router.post(`/`, async (req, res) => {
    if (!req.body.category || req.body.category.length < 24) {
        return res.status(400).send('Invalid Category')
    }
    const category = await Category.findById(req.body.category);
    console.log(category)
    if (!category) return res.status(400).send('Invalid Category')
    /*
    {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        brand: req.body.brand,
        image: req.body.image,
        images:req.body.images,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    }
    */
    let product = new Product(req.body)
    product = await product.save();
    if (!product)
        return res.status(500).send('The Product cannot be created')
    return res.send(product)
    //    product.save().then((createdProduct)=>{
    //     res.status(201).json(createdProduct)
    //    }).catch((err)=>{
    //     res.status(500).json({
    //         error:err,
    //         success:false
    //     })})
})

// update

router.put('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid categor id')
    }
    if (!req.body.category || req.body.category.length < 24) {
        return res.status(400).send('Invalid Category')
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category')
    const product = await Product.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        brand: req.body.brand,
        image: req.body.image,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    }, { new: true })
    if (!product)
        return res.status(400).send('the product cannot be updated')

    res.send(product)
})

// deleted

router.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id).then(product => {
        if (product) {
            return res.status(200).json({ success: true, message: 'the product is  deleted' })
        }
        else {
            return res.status(404).json({ success: false, message: "product not found" })
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err })
    })
})

router.get('/get/count', async (req, res) => {

    const productCount = await Product.countDocuments()
    if (!productCount) {
        return res.status(500).json({ success: false })
    }
    return res.send({ productCount })
})


router.get('/get/featured', async (req, res) => {

    const product = await Product.find({ isFeatured: true })
    if (!product) {
        return res.status(500).json({ success: false })
    }
    return res.send({ product })
})
//http://localhost:5658/api/v1/products/get/featured/3
router.get('/get/featured', async (req, res) => {
    const count = req.params.count ? req.params.count : 0
    const product = await Product.find({ isFeatured: true }).limit(+count);
    if (!product) {
        return res.status(500).json({ success: false })
    }
    return res.send({ product })
})


// filetr by many cotegory and find all 
// http://localhost:5658/api/v1/products?categories=2356869857
router.get('/', async (req, res) => {
    let filetr = {};
    if (req.query.categories) {
        filetr = { category: req.query.categories.split(",") }
    }

    const productList = await Product.find(filetr).populate('category')
    //  const product=await Product.find({isFeatured:true})
    if (!productList) {
        return res.status(500).json({ success: false })
    }
    return res.send({ productList })
})


// search 

router.get('/search/:key', async (req, res) => {
    let search = req.params.key
    try {
        const productList = await Product.find({
            "$or": [
                { "name": { $regex: ".*" + search + ".*", $options: 'i' } },
                { "description": { $regex: ".*" + search + ".*", $options: 'i' } },
                { "brand": { $regex: ".*" + search + ".*", $options: 'i' } }
            ]
        })
        if (productList.length > 0) {
            return res.status(200).send({ productList })

        }
        return res.status(500).send("Product Not found!!!!!!")

    } catch (error) {
        console.log(error)
    }

})

module.exports = router