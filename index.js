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
  const date = req.body.data || new Date().toDateString();

  console.log(req.body);
  if(!user_id || !description || !duration) {
    return res.json({
      error: "Invalid input data"
    })
  }

  try {
    const user = await User.findById(user_id);
    console.log(user);
    
    Exercise.create({
      username: user_id,
      description: description,
      duration: duration,
      date: date
    })
    .then((response) => {

      return res.json({
        username: user.username,
        _id: user._id,
        description: response.description,
        duration: response.duration,
        date: response.date
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

    Exercise.find({username: user_id})
    .select('duration date description')
    .then((response) => {    
      
      res.json({
        user: user,
        log: [...response],
        count: response.length
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
