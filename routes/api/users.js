const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const key = require('../../config/keys').secret;
const User = require('../../models/User')

/**
 * @route POST api/users/register
 * @desc Register the user
 * @access Public
 */
router.post('/register', (req, res) => {
    let {
        name,
        email,
        username,
        password,
        confirm_password
    } = req.body
    if (!name || !email || !username || !password || !confirm_password) {
        return res.status(400).json({
            msg: "Please enter all fields"
        })
    }
    //Check is password is the same as confirm password
    if (password.length < 8) {
        return res.status(400).json({
            msg: "Password needs to be atleast 8 characters long"
        })
    }
    if (password !== confirm_password) {
        return res.status(400).json({
            msg: "Password does not match"
        });
    }

    //Check for unique Email
    User.findOne({ email: email })
        .then(user => {
            if (user) {
                return res.status(400).json({
                    msg: "Email already exists"
                })
            }
        });
    // Check for unique username
    User.findOne({ username: username })
        .then(user => {
            if (user) {
                return res.status(400).json({
                    msg: "Username already exists"
                })
            }
        });
    //The data is valid and we can register the user
    let newUser = new User({
        name,
        email,
        username,
        password
    });

    //Hash password
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save().then(user => {
                return res.status(201).json({
                    success: true,
                    msg: "User is now registered"
                });
            });
        });
    });
});

/**
 * @route POST api/users/login
 * @desc Login the user
 * @access Public
 */
router.post('/login', (req, res) => {
    User.findOne({ username: req.body.username }).then(user => {
        if (!user) {
            return res.status(404).json({
                msg: "Username not found.",
                success: false
            });
        }
        // ELSE if there is user then compare password
        bcrypt.compare(req.body.password, user.password)
            .then(isMatch => {
                if (isMatch) {
                    //User's password is correct and we need to send the JSON Token for that user
                    const payload = {
                        _id: user._id,
                        username: user.username,
                        name: user.name,
                        email: user.email
                    }
                    jwt.sign(payload, key, { expiresIn: 604800 }, (err, token) => {
                        res.status(200).json({
                            success: true,
                            token: `Bearer ${token}`,
                            user: user,
                            msg: "You are now logged in."
                        })
                    })
                } else {
                    return res.status(404).json({
                        msg: "Incorrect Password.",
                        success: false
                    });
                }
            })
    })
})

/**
 * @route GET api/users/profile
 * @desc Return users data
 * @access Private
 */
router.get('/profile', passport.authenticate
    ('jwt', { session: false }),
    (req, res) => {
        return res.json({
            user: req.user
        })
    })

module.exports = router;
