// welcome text
title = document.querySelector(".title");

tic = () => {
  title.innerHTML = "Tic";
};
tac = () => {
  clearTimeout();
  title.innerHTML = title.innerHTML + " Tac";
};
toe = () => {
  clearTimeout();
  title.innerHTML = title.innerHTML + " Toe";
};

setTimeout("tic()", 1500);
setTimeout("tac()", 2000);
setTimeout("toe()", 2500);

// initialize game
roundWon = false;
score = [];
let startingPlayer;
let gamePaused = false;
let tileValue = ["", "", "", "", "", "", "", "", ""];

// any player can start the game, could either be player "x" or "o"

// let playerTurn = document.querySelector(".player-turn");
let player = document.querySelector(".player-turn");
(function () {
  startingPlayerRandom = Math.ceil(Math.random() * 2);
  startingPlayer = startingPlayerRandom === 1 ? "x" : "o";
  player.innerHTML = "Player " + startingPlayer + " starts";
  // score();
  // document.querySelector(".score-display").innerHTML = score[0];
  return (startingPlayer = startingPlayer);
})();

// update/change player
let currentplayer = startingPlayer;
changeplayer = () => {
  currentplayer = currentplayer === "x" ? "o" : "x";
};

//handle score

let x = 0;
let o = 0;
score = (winner) => {
  if (winner === "x") {
    x = ++x;
  } else if (winner === "o") {
    o = ++o;
  } else if (winner === null) {
    x = x;
    o = o;
  }
  let score = [x, o];
  return score;
};

//display score
displayScore = () => {
  score();
  document.querySelector(".score-display").innerHTML = score[0];
};

// game structure

handleClick = (e) => {
  let clickedTile = parseInt(e.target.id);

  handleClickedTile = (clickedTile) => {
    tileValue[clickedTile] = currentplayer;
  };

  if (tileValue[clickedTile] !== "" || gamePaused) {
    notClickableAddColor = () => {
      document.getElementById(clickedTile.toString()).style.color = "#ed143d";
    };
    notClickableRemoveColor = () => {
      document.getElementById(clickedTile.toString()).style.color =
        "blueviolet";
    };
    setTimeout(" notClickableAddColor()", 100);
    setTimeout(" notClickableRemoveColor()", 300);
    return;
  } else {
    handleClickedTile(clickedTile);
    document.getElementById(clickedTile.toString()).innerHTML = currentplayer;
    winningValidation();
    changeplayer();
    playerTurn();
  }
};

restartGame = () => {
  tileValue = ["", "", "", "", "", "", "", "", ""];
  document.querySelector(".modal-container").style.display = "none";
  let tile = document.querySelectorAll(".tile");
  for (i = 1; i <= tile.length; ++i) {
    document.querySelector(`.tile:nth-child(${i})`).innerHTML = "";
  }
  roundWon = false;
  playerTurn();
};

handleWin = (winner, score) => {
  document.querySelector(".modal-container ").style.display = "flex";
  document.querySelector(".winner-title ").innerHTML =
    "&#127881 Player " + winner + " Won";
  document.querySelector(".player-x-score ").innerHTML = score[0];
  document.querySelector(".player-o-score ").innerHTML = score[1];

  player.innerHTML = "Round Won";
  return;
};
handleDraw = (score) => {
  document.querySelector(".modal-container ").style.display = "flex";
  document.querySelector(".winner-title ").innerHTML =
    "&#129309 It's A Draw Guys";
  player.innerHTML = "Round Drawn";
  document.querySelector(".player-x-score ").innerHTML = score[0];
  document.querySelector(".player-o-score ").innerHTML = score[1];
  return;
};

winningValidation = () => {
  let winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  // let roundWon = false;
  for (i = 0; i <= 7; ++i) {
    const condition = winningConditions[i];
    let a = tileValue[condition[0]];
    let b = tileValue[condition[1]];
    let c = tileValue[condition[2]];
    if (a === "" || b === "" || c === "") {
      continue;
    }

    if (a === b && b === c) {
      roundWon = true;
      let winner = currentplayer;
      handleWin(winner, score(winner));
    }

    let playedAllTiles = tileValue.some((tileValue) => tileValue === "");
    if (!playedAllTiles) {
      roundWon = true;
      let winner = null;
      handleDraw(score(winner));
    }
  }
};

pauseGame = () => {
  gamePaused = !gamePaused;
  selectTile = document.querySelectorAll(".tile");
  playButton = document.querySelector(".play-button");
  gameContainer = document.querySelector(".container");
  if (gamePaused) {
    playButton.innerHTML = "Play";
    playButton.style.background = "green";
    gameContainer.style.opacity = 0.4;
    selectTile.forEach((tile) =>
      tile.removeEventListener("click", handleClick)
    );
    title.innerHTML = "Game Paused";
  } else {
    playButton.innerHTML = "Pause";
    playButton.style.background = "crimson";
    gameContainer.style.opacity = 1;
    selectTile.forEach((tile) => tile.addEventListener("click", handleClick));
    title.innerHTML = "Tic Tac Toe";
  }
};

playerTurn = () => {
  if (!roundWon) {
    player.innerHTML = "player " + currentplayer + "'s " + " turn";
  }
};

winningMessage = () => {
  player.innerHTML = "player" + currentplayer + " won";
};

drawMessage = () => {
  player.innerHTML = "It's a Tie Guys";
};

document
  .querySelectorAll(".tile")
  .forEach((tile) => tile.addEventListener("click", handleClick));
