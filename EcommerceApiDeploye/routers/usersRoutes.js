const User = require("../models/usersModel");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
// console.log(bcrypt.hashSync)
const jwt = require("jsonwebtoken");
require("dotenv").config();

const secret = process.env.secret;

// find all users
router.get("/", async (req, res) => {
  const userList = await User.find().select("-passwordHash");

  if (!userList) {
    return res.status(500).json({ success: false });
  }
  return res.send({ userList });
});

// find user by id

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");

  if (!user) {
    return res.status(500).json({ success: false });
  }
  return res.send({ user });
});

// user login

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  console.log(user);
  if (!user) {
    return res.status(400).send("the user not found");
  }

  if (
    user &&
    bcrypt.compareSync(req.body.passwordHash + "mysecrit", user.passwordHash)
  ) {
    console.log(user.id);
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      {
        expiresIn: "1d",
      }
    );
    res.status(200).send({ user: user.email, token });
  } else {
    return res.status(400).send("Email and password is wrong");
  }
});

// user register
router.post("/register", async (req, res) => {
  let email = req.body.email;
  const usr= await User.findOne({ email: email })
  if (!usr) {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        color: req.body.color,
        passwordHash: bcrypt.hashSync(req.body.passwordHash + "mysecrit"),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        apprtment: req.body.apprtment,
        street: req.body.street,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
      });
      user = await user.save();
      if (!user) {
        return res.status(400).send("the user cannot be created");
      } else {
        console.log(user.id);
        const token = jwt.sign(
          {
            userId: user.id,
            isAdmin: user.isAdmin,
          },
          secret,
          {
            expiresIn: "1d",
          }
        );
        res.status(201).send({ user: user.email, token });
      }
  }else{

   return res.status(400).send({msg:"Email already exists ..."})
  }


  
});

// deleted

router.delete("/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "the user is  deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "user not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get("/get/count", async (req, res) => {
  const userCount = await User.countDocuments();
  if (!userCount) {
    return res.status(500).json({ success: false });
  }
  return res.send({ userCount });
});

module.exports = router;
