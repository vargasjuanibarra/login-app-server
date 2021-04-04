const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const cors = require('cors')
const passport = require('passport')


const app = express()

//Middleware
//Form Data Middleware
app.use(express.urlencoded({ extended: false }))
//JSON body middleware
app.use(express.json());
// Cors Middleware
app.use(cors())
//Setting up static directory
app.use(serveStatic(__dirname + "/dist"));
app.use(express.static(path.join(__dirname, 'public')))

// Use Passport Middleware
app.use(passport.initialize())
//Bring in the Passport Strategy
require('./config/passport')(passport);


// Bring in the DB config and connect with database
const db = require('./config/keys').mongoURI;
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log(`Database connected successfully ${db}`)
}).catch(err => console.log(`Unable to connect to database ${err}`))

// routes
// app.get('/', (req, res) => {
//     return res.send('<h1> titing gurang</h1>')
// })

//Bring in users route
const users = require('./routes/api/users')
app.use('/api/users', users)


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
})

// create port
const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server now running on port ${port}`))