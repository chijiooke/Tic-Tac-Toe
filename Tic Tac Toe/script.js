// import { v4 as uuidv4 } from 'https://jspm.dev/uuid';uuidv4
/*
 * INITIALIZE WEBSOCKET CONNECTION
 */
const publicKey = `-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEArEfY9bkwc08J7gQE8wzjb+ZZTNB6HCPfNKiXqjkYLO3DQXe+KCTt
dzLPVHZlD+gFT2wpe1U4zjB3gXrrctLpbIGcgF5GNQxQyRlr2HeLdwrHLcxk3Uf5
cP5LJykvkSQydp7VGwkBXNnH5vUn49yHIsVVHZK/2CnWSUJbwE4KLxufWnlX+f5R
F0P7Q/CxE/sOpVPtl/cr6vAGn/rRshTN/9OqdyB7IICLXQCRpZbdrJl6HTf3zj+b
YK+veMScMzg0yzjuoVsAwxJKAmPLyNkwYrDZiPOyBvWCFA1RJxni3LlvThyaXlJf
xt7vR+jfX3XvdLEuk7vo/gQYAOGtSIoK/QIDAQAB
-----END RSA PUBLIC KEY-----
`;

const ws = new Websuckit({
  userId: "30e9ff20-61cf-43a7-9464-b608bbd62c01",
  accessKey: "QbxvGDo33Z4TIBxyRe8H",
  publicKey,
});

const connectionUrl = ws.getConnectionUrl({
  channelName: "tic-tac-toe",
  channelPassKey: "kHNw3H4aC4iPOhvqB2JK",
});

const socket = new WebSocket(connectionUrl.value);

const activePlayers = [];

const actions = {
  SET_ACTIVE_PLAYERS: "SET_ACTIVE_PLAYERS",
  START_GAME: "START_GAME",
  END_GAME: "END_GAME",
  RESTART: "RESTART",
  PLAYED: "PLAYED",
  GAME_FULL: "GAME_FULL",
};
const playerID = Math.random();

socket.addEventListener("open", (event) => {
  socket.send(
    JSON.stringify({
      action: actions.SET_ACTIVE_PLAYERS,
      payload: activePlayers,
    })
  );
  if (activePlayers.length === 0) {
    activePlayers.push(playerID);
  } else if (activePlayers.length === 1) {
    activePlayers.push(playerID);
    startgame();
  } else
    socket.send(
      JSON.stringify({
        action: actions.GAME_FULL,
        payload: "No more than two users",
      })
    );
});

socket.addEventListener("message", (event) => {});

const startgame = () => {};

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

//====================== ALERT NOTIFICATIONS =========================================
const alertBar = document.createElement("div");

const showAlert = (alertMessage = "hello", variant) => {
  const welcomeModal = document.querySelector(".welcome-modal");
  welcomeModal.prepend(alertBar);
  alertBar.id = "alert";
  alertBar.setAttribute("id", "alert");
  alertBar.setAttribute("class", "alert");

  const classList = alertBar.classList;
  if (variant) {
    classList.add(variant);
  }

  alertBar.innerHTML = alertMessage;
  alertBar.style.display = "flex";
  setTimeout("toggleAlertVisiblilty()", 3000);
  toggleAlertVisiblilty = () => {
    clearTimeout();
    alertBar.style.display = "none";
    classList.remove(variant);
  };
};

//====================== CREATE CHANNEL =========================================
/****
 * CREATE CHANNEL: a funtion to create a game on the websuckit(web socket engine)


*/
let isCreating = false;
let inviteLink = "";
let passkey = "";
let gameId = "";
let userId = "";
let sharableLink;

const inviteLinkField = document.getElementById("invite-link");

// inviteLinkField.placeholder = sharableLink;
inviteLinkField.disabled = true;

const createGameChannel = () => {
  isCreating = true;
  const buttons = document.querySelectorAll("button");
  const toggleButtonDisability = () =>
    buttons.forEach((btn) => (btn.disabled = isCreating));

  const endCreation = () => {
    isCreating = false;
    toggleButtonDisability();
  };
  showAlert("Initializing Game");
  ws.createChannel({ channel: crypto.randomUUID(), max_connections: 2 }).then(
    (res) => {
      showAlert("Game Created Successfully");
      toggleButtonDisability();
      endCreation();

      gameId = res.channel.name;
      passkey = res.channel.pass_key;
      userId = res.channel.user_id;

      console.log({ gameId, passkey, userId });

      sharableLink = `${window.location}?${new URLSearchParams({
        passkey,
        gameId,
      })}`;

      inviteLinkField.value = sharableLink;
    },
    (err) => {
      showAlert("failed to create", "error--variant");
      toggleButtonDisability();
      endCreation();
    }
  );
};

// {
//   "channel": {
//     "id": "9b157811-b3b6-42d3-8ba5-d2e95a950bc3",
//     "name": "0542fb91-c969-4a9e-b7ea-6b5b0025c102",
//     "pass_key": "c1Vg5ZCTnSTrEhwPB8eQ",
//     "user_id": "30e9ff20-61cf-43a7-9464-b608bbd62c01",
//     "max_connections": null,
//     "created_at": "2023-11-06T22:44:07.673084Z",
//     "updated_at": "2023-11-06T22:44:07.596020Z"
//   }
// }

// initialize game
const PLAYER_X = "x";
const PLAYER_O = "o";

roundWon = false;
score = [];
let startingPlayer;
let gamePaused = false;
let tileValue = ["", "", "", "", "", "", "", "", ""];

// any player can start the game, could either be player "x" or "o"
let player = document.querySelector(".player-turn");
(function () {
  startingPlayerRandom = Math.ceil(Math.random() * 2);
  startingPlayer = startingPlayerRandom === 1 ? PLAYER_X : PLAYER_O;
  player.innerHTML = "Player " + startingPlayer + " starts";
  return (startingPlayer = startingPlayer);
})();

//======================Connect WIth URL =========================================

(() => {
  console.log(window.location);
})();

const welcomeTitle = document.querySelector(".welcome-title");

const copyLink = () => {
  showAlert("Copied to clipboard");
  navigator.clipboard.writeText(sharableLink);
  welcomeTitle.innerHTML = "Ready player 1, Waiting for player 2...";
  welcomeTitle.style.animation = "scroll-left 20s linear infinite";
  welcomeTitle.style.fontSize = "1rem";
};

// update/change player
let currentplayer = startingPlayer;
changeplayer = () => {
  currentplayer = currentplayer === PLAYER_O ? PLAYER_X : PLAYER_O;
};

//handle score
let x = 0;
let o = 0;
score = (winner) => {
  if (winner === PLAYER_X) {
    x = ++x;
  } else if (winner === PLAYER_O) {
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
    socket.send(
      JSON.stringify({ player: currentplayer, tileNumber: clickedTile })
    );
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
  document
    .querySelectorAll(".player-x-score ")
    .forEach((el) => (el.innerHTML = score[0]));
  document
    .querySelectorAll(".player-o-score ")
    .forEach((el) => (el.innerHTML = score[1]));

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
