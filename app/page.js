"use client";

import "./page.css";
import React, { useState, useEffect } from "react";
import { Button, Paper, Stack, TextField } from "@mui/material";

export default function page() {
  return (
    <div className="center">
      <h1>Minigame App</h1>      <h3>6606405 Jittipon Pannak</h3>     {" "}
      <h3>6606250 Phoorepath Phooraya</h3>     {" "}
      <h3>6606502 Thannatee Tepkumgan</h3>     {" "}
      <div className="game-wrapper">
        <MainScene />
        <br />
        <br />
        <Leaderboard />
      </div>{" "}
    </div>
  );
}

function Leaderboard() {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}api/leaderboard`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>No data</p>;

  return (
    <Stack>
      {" "}
      <Paper className="paper-title">
        <h2>Leaderboard</h2>
      </Paper>
      <br />     {" "}
      <Stack spacing={{ xs: 1, sm: 1 }} useFlexGap>
        {" "}
        {data.map((player) => (
          <Paper key={player.ID}>
            {player.NAME} - {player.SCORE}         {" "}
          </Paper>
        ))}{" "}
      </Stack>{" "}
    </Stack>
  );
}

function MainScene() {
  const [uid, setUID] = useState(-1);
  const [mode, setMode] = useState("casual");
  const [scene, setScene] = useState("");
  const [score, setScore] = useState(0);
  const [name, setName] = useState("");
  const [gameOver, setGameOver] = useState(false);

  const state = {
    uid,
    mode,
    scene,
    score,
    name,
    gameOver,
    setUID,
    setMode,
    setScene,
    setScore,
    setName,
    setGameOver,
  };

  let content;

  switch (state.scene) {
    case "main":
      if (!state.gameOver) {
        const nextGame = () => {
          const games = ["quickMath", "pictureMatch"];
          const game = games[Math.floor(Math.random() * games.length)];
          state.setScene(game);
        };
        content = (
          <Button onClick={nextGame} sx={{ fontSize: 60 }}>
            Next Stage
          </Button>
        );
      } else {
        content = (
          <div>
            <h1>GAME OVER</h1> <h3>Final Score : {state.score}</h3>{" "}
          </div>
        );
      }

      if (state.mode === "ranked") {
        updateUser(state);
      }

      break;

    case "quickMath":
      content = (
        <div>
          {" "}
          <div className="timer-display">
            <Timer state={state} value={10} />
          </div>
          <QuickMath state={state} />       {" "}
        </div>
      );
      break;

    case "pictureMatch":
      content = (
        <div>
          {" "}
          <div className="timer-display">
            <Timer state={state} value={60} />
          </div>
          <PictureMatchHeader state={state} />{" "}
        </div>
      );
      break;

    default:
      const proceed = async (mode) => {
        const name = document.getElementById("usernameField").value.trim();

        if (name === "") {
          alert("Please Input Username");
          return;
        }

        if (mode === "ranked") {
          const res = await postNewUser(name);
          if (!res.ID) {
            alert(
              "Error while creating user! Please prefer playing Casual games."
            );
            return;
          }

          state.setUID(res.ID);
        }

        state.setName(name);
        state.setMode(mode);
        state.setScene("main");
      };

      content = (
        <div className="form-section">
          <TextField
            id="usernameField"
            label="Username"
            defaultValue=""
            InputProps={{ style: { color: "red" } }}
          />
          <br />
          <br />
          <Button variant="contained" onClick={() => proceed("casual")}>
            Casual
          </Button>{" "}
          <Button variant="contained" onClick={() => proceed("ranked")}>
            Ranked
          </Button>
        </div>
      );
      break;
  }

  return (
    <div>
      <p className="">Mode: {state.mode}</p>
      <p className="">Username: {state.name}</p>
      <p className="">Score: {state.score}</p>
      <br /> {content}
    </div>
  );
}

async function postNewUser(name) {
  const data = { NAME: name, SCORE: 0, DATE: null, GAMEOVER: false };
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

async function updateUser(state) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ID: state.uid,
      NAME: state.name,
      SCORE: state.score,
      DATE: state.date,
      GAMEOVER: state.gameOver,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to update");
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

function Timer({ state, value }) {
  const [timer, setTimer] = useState(value);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timer <= 0) gameFailed(state);
  });

  return <h2>{timer}</h2>;
}

function QuickMath({ state }) {
  const number1 = Math.floor(Math.random() * 20);
  const number2 = Math.floor(Math.random() * 20);
  const operand = Math.floor(Math.random() * 3);
  const answer = [number1 + number2, number1 - number2, number1 * number2][
    operand
  ];
  const options = [answer];
  const optionsElements = [optionElementFactory(answer)];

  while (options.length < 5) {
    const num = Math.floor(Math.random() * 60);
    if (!options.includes(num)) {
      options.push(num);
      optionsElements.push(optionElementFactory(num));
    }
  }

  shuffleArray(optionsElements);

  const operandSymbol = ["+", "-", "×"][operand];

  function optionElementFactory(n) {
    return (
      <Button
        key={n}
        variant="contained"
        sx={{ fontSize: 18 }}
        onClick={() => (n === answer ? gameSuccess(state) : gameFailed(state))}
      >
        {n}     {" "}
      </Button>
    );
  }

  return (
    <div className="center">
      <br />     {" "}
      <Paper className="quickmath-question">
        {" "}
        <h2>
          {number1} {operandSymbol} {number2} = ?
        </h2>{" "}
      </Paper>{" "}
      <Stack direction="column" spacing={1}>
        {optionsElements}
      </Stack>{" "}
    </div>
  );
}

function PictureMatchHeader({ state }) {
  const source = ["▣", "⁜", "※", "⌂"];
  const rawElements = shuffleArray([...source, ...source]);
  return <PictureMatch state={state} data={rawElements} />;
}

function PictureMatch({ state, data }) {
  const [selectedA, setSelectedA] = useState(-1);
  const [completes, setCompletes] = useState([]);
  const [tries, setTries] = useState(10);

  const elements = data.map((raw, index) => {
    const callback = () => {
      if (selectedA === index || completes.includes(index)) return;
      if (selectedA === -1) {
        setSelectedA(index);
        return;
      }

      const selectedB = index;
      if (data[selectedA] === data[selectedB]) {
        setCompletes([...completes, selectedA, selectedB]);
      } else {
        const newTries = tries - 1;
        setTries(newTries);
        if (newTries <= 0) {
          gameFailed(state);
          return;
        }
      }

      setSelectedA(-1);
    };

    return (
      <Button
        key={index}
        className="picture-btn"
        onClick={callback}
        sx={{ fontSize: 48 }}
        variant="contained"
      >
        {selectedA === index || completes.includes(index) ? raw : "?"}
      </Button>
    );
  });

  useEffect(() => {
    if (completes.length >= data.length) {
      gameSuccess(state);
    }
  });

  return (
    <div>
      <div className="picture-match-grid">{elements}</div>
      <p style={{ textAlign: "left" }}>Tries Left : {tries}</p>
    </div>
  );
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
