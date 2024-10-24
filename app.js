const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

app.get('/players/', async (request, response) => {
  const getAllPlayerDetails = `
  SELECT * FROM cricket_team ORDER BY player_id`

  const playersArray = await db.all(getAllPlayerDetails)
  response.send(
    playersArray.map(eachPlayer => ({
      playerId: eachPlayer.player_id,
      playerName: eachPlayer.player_name,
      jerseyNumber: eachPlayer.jersey_umber,
      role: eachPlayer.role,
    })),
  )
})

// post method
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const addPlayer = `
  INSERT INTO
  cricket_team (player_name,
    jersey_number,
    role)
    VALUES (
      ${playerName},
      ${jerseyNumber}
      ${role}

      );`

  const dbResponse = await db.run(addPlayer)
  const playerId = dbResponse.lastID
  response.send('Player Added to Team')
})

// get player

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayer = `
  SELECT 
    * 
  FROM 
   cricket_team 
  WHERE 
   player_id = ${playerId};`
  const player = await db.get(getPlayer)
  response.send(player)
})

// put player
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const updateDetails = `
   UPDATE
    cricket_team
    SET 
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  WHERE 
   player_id = ${playerId};`

  await db.run(updateDetails)
  response.send(`Player Details Updated`)
})

// delete
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params

  const deletePlayer = `
  DELETE FROM cricket_team WHERE player_id = ${playerId};`
  await db.run(deletePlayer)
  response.send('Player Removed')
})

module.exports = app
