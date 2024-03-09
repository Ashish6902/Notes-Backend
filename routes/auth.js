const express = require('express');
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require('express-validator');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser')

const JWT_SECRET = 'this_is_secret_key';//add in enviorment variable

// Route 1:Create user using: POST "api/auth/createuser". Doesn't require authentication 
router.post('/createUser', [
    body('email').isEmail(),
    body('name').isLength({ min: 3 }),
    body('password').isLength({ min: 5 }),
], async (req, res) => {
    //check validations
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
        return res.status(400).json({ errors: [{ msg: 'Email already exists' }] });
    }
    //hashing Password
    const salt = await bcrypt.genSalt(10);
    const SecPass = await bcrypt.hash(req.body.password, salt);
    // Create a new user
    try {
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: SecPass
        });
    
        const data = {
            id: newUser.id
        };
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({ authtoken });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }    
});

//Route 2:Authentication a user using post : "/api/auth/login"
router.post('/login', [
    body('email','enter valid emial').isEmail(),
    body('password','password cannot be balnk').exists(),
], async (req, res) => {
     //check validations
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
     }

     const { email, password } = req.body;
     try{
        let user =  await User.findOne({ email});
        if(!user){
            return res.status(400).json("Login with correct Credentials");
        }
        const comparePassword = await bcrypt.compare(password,user.password);
        if(!comparePassword){
            return res.status(400).json("Login with correct Credentials");
        }
        const data = {
            id: user.id
        };
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({ authtoken });
     }catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }    
});

//Route 3 Get user Deails using post : "/api/auth/getuser" login required
router.post('/getuser', fetchuser,  async (req, res) => {
    try {
      userId = req.user.id;
      const user = await User.findById(userId).select("-password")
      res.send(user)
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  })
  module.exports = router
