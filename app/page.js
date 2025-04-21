'use client'

import './page.css'
import React, { useState, useEffect } from 'react'
import { Button, Paper, Stack, TextField } from '@mui/material'

export default function page() {
  return (
    <div className='center' style={{ textAlign: 'center' }}>
      <h1>Minigame App</h1><br/>
      <h3>6606405 Jittipon Pannak</h3>
      <h3>6606250 Phoorepath Phooraya</h3>
      <h3>6606502 Thannatee Tepkumgan</h3>
      <MainScene/><br/><br/>
      <Leaderboard/>
    </div>
  )
}

function Leaderboard() {
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)
 
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}api/leaderboard`)
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        setLoading(false)
      })
  }, [])
 
  if (isLoading) return <p>Loading...</p>
  if (!data) return <p>No data</p>

  data.forEach(player => {
    console.log(player)
  });

  return (
    <Stack>
      <Paper><h2>Leaderboard</h2></Paper><br/>
      <Stack spacing={{ xs: 1, sm: 1 }} useFlexGap>
        {data.map((player) => {return <Paper key={player.ID}> {player.NAME} {player.SCORE} </Paper>})}
      </Stack>
    </Stack>
  )
}

function MainScene() {
  const [uid, setUID] = useState(-1);
  const [mode, setMode] = useState("casual");
  const [scene, setScene] = useState("");
  const [score, setScore] = useState(0);
  const [name, setName] = useState("");
  const [gameOver, setGameOver] = useState(false);

  const state = {
    uid: uid
  , mode: mode
  , scene: scene
  , score: score
  , name: name
  , gameOver: gameOver

  , setUID: setUID
  , setMode: setMode
  , setScene: setScene
  , setScore: setScore
  , setName: setName
  , setGameOver: setGameOver
  }

  let content;

  switch (state.scene) {
    case "main":
      if (!state.gameOver) {
        const nextGame = () => {
          const games = ["quickMath", "pictureMatch"]
          const game = games[Math.floor(Math.random() * games.length)];
          state.setScene(game);
        }

        content = (<Button onClick={nextGame}>Next Stage</Button>)
      } else {
        content = (
          <div>
            <h1>GAME OVER</h1>
            <h3>Final Score : {state.score}</h3>
          </div>
        )
      }

      if (state.mode === "ranked") {
        updateUser(state);
      }

      break;
    case "quickMath":
      content = (
        <div>
          <Timer state={state} value={10}/>
          <QuickMath state={state}/>
        </div>
      )
      break;
    case "pictureMatch":
      content = (
        <div>
          <Timer state={state} value={60}/>
          <PictureMatchHeader state={state}/>
        </div>
      )
      break;
    default:
      const proceed = async (mode) => {
        const name = document.getElementById("usernameField").value.trim();
        
        if (name === "") {
          alert("Please Input Username");
          return;
        }

        if (mode === "ranked") {
          const res = (await postNewUser(name));
          if (!res.ID) {
            alert("Error while creating user! Please prefer playing Casual games.");
            return;
          }

          state.setUID(res.ID);
        }

        state.setName(name);
        state.setMode(mode);
        state.setScene("main");
      }

      content = (
        <div>
          <TextField id={"usernameField"} label={"Username"} defaultValue={""} InputProps={{ style: {color: 'white'}}}></TextField><br/><br/>
          <Button variant='contained' id={"casualBTN"} onClick={() => proceed("casual")}>Casual</Button> {" "}
          <Button variant='contained' id={"rankedBTN"} onClick={() => proceed("ranked")}>Ranked</Button>
        </div>
      )
      break;
  }

  return (
    <div>
      <br/>Mode: {state.mode}
      <br/>Username: {state.name} | Score: {state.score}
      <br/><br/><br/>{content}
    </div>
  )
}

async function postNewUser(name) {
  const data = {
    NAME: name
  , SCORE: 0
  , DATE: null
  , GAMEOVER: false
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  return await res.json()
}
async function updateUser(state) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api`, {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ID: state.uid, NAME: state.name, SCORE: state.score, DATE: state.date, GAMEOVER: state.gameOver }),
  })

  if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Failed to update')
  }
}

function gameSuccess(state) {
  state.setScore((old) => old + 10);
  state.setScene("main");

}
function gameFailed(state) {
  state.setGameOver(true);
  state.setScene("main");
}

function Timer({state, value}) {
  const [timer, setTimer] = React.useState(value);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  React.useEffect(() => {
    if (timer <= 0) {
      gameFailed(state);
    }
  })
  
  return <h2>{timer}</h2>
}

function QuickMath({state}) {
  const number1 = Math.floor(Math.random() * 20);
  const number2 = Math.floor(Math.random() * 20);
  const operand = Math.floor(Math.random() * 3);
  const answerCalculator = (n1, n2, op) => {
    switch (op) {
      case 0:
        return n1 + n2
      case 1:
        return n1 - n2
      case 2:
        return n1 * n2
      default:
        return 0;
    }
  }
  const answer = answerCalculator(number1, number2, operand)
  const options = [ answer ];
  const optionElementFactory = (n) => {
    return <Button key={n} variant='contained' onClick={() => { n === answer ? gameSuccess(state) : gameFailed(state) }}>{n}</Button>
  }
  const optionsElements = [ optionElementFactory(answer) ];

  while (options.length < 5) {
    const number =  answerCalculator(Math.floor(Math.random() * 20), Math.floor(Math.random() * 20), Math.floor(Math.random() * 3));
    if (!options.includes(number)) {
      options.push(number);
      optionsElements.push(optionElementFactory(number));
    }
  }

  shuffleArray(optionsElements)

  let operandString;
  switch (operand) {
    case 0:
      operandString = "+"
      break;
    case 1:
      operandString = "-"
      break;
    case 2:
      operandString = "×"
      break;
  }

  return (<div>
    <br/><Paper><h2>{number1} {operandString} {number2} = ?</h2></Paper>
    <br/>{optionsElements}
  </div>)
}
function PictureMatchHeader({state}) {
  const source = [ "▣", "⁜", "※", "⌂", ];
  const rawElements = source.concat(source);
  shuffleArray(rawElements);
  
  return <PictureMatch state={state} data={rawElements}/>
}
function PictureMatch({state, data}) {
  const [selectedA, setSelectedA] = useState(-1);
  const [completes, setCompletes] = useState([]);
  const [tries, setTries] = useState(10);

  const rawElements = data;
  const elements = [];

  for (let index = 0; index < rawElements.length; index++) {
    const raw = rawElements[index];
    const callback = () => {
      if (selectedA === index || completes.includes(index)) {
        return;
      }

      if (selectedA === -1) {
        setSelectedA(index);
        return;
      }

      let selectedB = index;
      if (rawElements[selectedA] === rawElements[selectedB]) {
        setCompletes([...completes, selectedA, selectedB])
      } else {
        setTries((prev) => prev - 1);
        if (tries <= 0) {
          gameFailed(state);
          return;
        }
      }

      setSelectedA(-1);
    }

    elements.push(<Button id={"pictureMatchBTN" + index} key={"pictureMatchBTN" + index} onClick={() => callback()} variant='contained'>
                                                               {selectedA === index || completes.includes(index) ? raw : "?"}</Button>);
  }
  
  useEffect(() => {
    if (completes.length >= rawElements.length) {
      gameSuccess(state);
    }
  })

  return (<div>
    <br/>{elements}<br/>
    <br/>Tries Left : {tries}<br/><br/>
    </div>);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}