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
      return res.json({
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

app.get('/api/users', function(req, res) {
  User.find().then((response) => {
    return res.json(response)
  })
  .catch((err) => {
    return res.json({
      error: err
    })
  })
})

app.post('/api/users/:_id/exercises', async function(req, res) {
  const user_id = req.body[':_id'];
  const description = req.body.description;
  const duration = Number(req.body.duration);
  let date = new Date(req.body.date).toDateString()
  
  if(new Date(req.body.date).toDateString() === "Invalid Date") {
    date = new Date().toDateString();
  }

  console.log(req.body);
  if(!user_id || !description || !duration) {
    return res.json({
      error: "Invalid input data"
    })
  }

  try {
    const user = await User.findById(user_id);
    
    Exercise.create({
      username: user_id,
      description: description,
      duration: duration,
      date: new Date(date).toDateString()
    })
    .then((response) => {

      return res.json({
        _id: user._id,
        username: user.username,
        date: new Date(response.date).toDateString(),
        duration: response.duration,
        description: response.description,
      })
    })
    .catch((err) => {
      return res.json({
        error: "Unexptected error"
      })
    })

  }
  catch(err) {
    return res.json({
      error: "Invalid user ID"
    })
  }
})

app.get('/api/users/:_id/logs', async function(req, res) {
  const user_id = req.params._id;
  
  try {
    const user = await User.findById(user_id);

    Exercise.find({username: user_id}, 
      { _id: 0, description: 1, date: 1, duration: 1 })
    .then((response) => {    
      
      res.json({
        _id: user._id,
        username: user.username,
        count: response.length,
        log: [...response],
      })
    })
    .catch((err) => {
      return res.json({
        error: "Invalid user ID"
      })
  })
  }
  catch(err) {
    res.json({
      error: "Invalid user ID"
    })
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
