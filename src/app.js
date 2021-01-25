require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())
app.use(express.json());

// let passItUp = "Hello Client, from Server"
// app.get('/test', (req, res) => {
//   res.send({message: passItUp})
// })

// app.post('/test', (req, res) => {

//   console.log(req.body);
//   res.send({message: "Message received:"})
// })

app.get('/play', (req, res) => {
  // res.send({gameBoard: [['O',' ','O'],['X',' ','X'],['O',' ','O']]})
  
  req.app.get('db')('game_states')
    .where({})
    .then((gameStates) => {
      res.send({gameBoard: JSON.parse(gameStates[0].game_board)})
    })
})

app.post('/play', (req, res) => {
  console.log(req.body);
  req.app.get('db')('game_states')
    .where({})
    .then((gameStates) => {
      // console.log(gameStates);

      if (gameStates.length === 0) {
        req.app.get('db')('game_states').insert({
          game_board: JSON.stringify(req.body.gameBoard),
          player_one_wins: req.body.playerOneWins,
          player_two_wins: req.body.playerTwoWins,
        })
        .returning('*')
        .then(game_state => {
          res.send({message: "Message received"})
        })
      } else{
        req.app.get('db')('game_states').where({id: gameStates[0].id}).update({
          game_board: JSON.stringify(req.body.gameBoard),
          player_one_wins: req.body.playerOneWins,
          player_two_wins: req.body.playerTwoWins,
        })
        .returning('*')
        .then(game_state => {
          res.send({message: "Message received"})
        })
      }
    })
  


  // return db('game_state')
  //   .update(partType, partName)
  //   .where({ id: shipId })
  //   .returning('*')



  
})



app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = { app }