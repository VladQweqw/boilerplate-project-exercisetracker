const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const { User, Exercise } = require("./models")

const mongoose = require('mongoose')

const dbURI = "mongodb+srv://vladpoienariu:admin123@lists.5vhezvm.mongodb.net/exercise-tracker?retryWrites=true&w=majority&appName=lists";
mongoose.connect(dbURI)
.then((result) => {
    console.log(`Succesfully connected to DB`);
})
.catch((err) => {
    console.log(`Error while connecting to DB: ${err}`);
})

app.use(cors())
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', function(req, res) {
    let username = req.body.username
    User.create({
      username,
    })
    .then((response) => {
      res.json({
        username: username,
        _id: response._id
      })
    })
    .catch((err) => {
      if(err.code === 11000) {
        return res.json({
          error: "Username Already exists"
        })
      }

      return res.json({
        error: "Unexpected error"
      })
    })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
