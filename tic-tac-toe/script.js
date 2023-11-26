
const config = {
  PUBLIC_KEY: `-----BEGIN RSA PUBLIC KEY-----
  MIIBCgKCAQEArEfY9bkwc08J7gQE8wzjb+ZZTNB6HCPfNKiXqjkYLO3DQXe+KCTt
  dzLPVHZlD+gFT2wpe1U4zjB3gXrrctLpbIGcgF5GNQxQyRlr2HeLdwrHLcxk3Uf5
  cP5LJykvkSQydp7VGwkBXNnH5vUn49yHIsVVHZK/2CnWSUJbwE4KLxufWnlX+f5R
  F0P7Q/CxE/sOpVPtl/cr6vAGn/rRshTN/9OqdyB7IICLXQCRpZbdrJl6HTf3zj+b
  YK+veMScMzg0yzjuoVsAwxJKAmPLyNkwYrDZiPOyBvWCFA1RJxni3LlvThyaXlJf
  xt7vR+jfX3XvdLEuk7vo/gQYAOGtSIoK/QIDAQAB
  -----END RSA PUBLIC KEY-----
  `,
  USER_ID: "30e9ff20-61cf-43a7-9464-b608bbd62c01",
  ACCESS_KEY: "QbxvGDo33Z4TIBxyRe8H",
};

const ws = new Websuckit({
  userId: config.USER_ID,
  accessKey: config.ACCESS_KEY,
  publicKey: config.PUBLIC_KEY,
});

const activePlayers = [];
let playerRole;
let gameSocket;

const actions = {
  SET_ACTIVE_PLAYERS: "SET_ACTIVE_PLAYERS",
  PLAYER_JOINED: "PLAYER_JOINED",
  START_GAME: "START_GAME",
  END_GAME: "END_GAME",
  DISCONNECT: "DISCONNECT",
  RESTART: "RESTART",
  PLAYED: "PLAYED",
  GAME_FULL: "GAME_FULL",
};

const alertVariants = {
  ERROR: "error--variant",
  SUCCESS: "success--variant",
  WARNING: "warning--variant",
};
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
  const body = document.querySelector("body");
  body.prepend(alertBar);
  alertBar.id = "alert";
  alertBar.setAttribute("id", "alert");
  alertBar.setAttribute("class", "alert");

  const classList = alertBar.classList;
  if (variant) {
    classList.add(variant);
  }

  alertBar.innerHTML = alertMessage;

  alertBar.style.transform = "translateX('31rem')";
  alertBar.style.right = "1rem";
  // alertBar.style.display = "flex";
  setTimeout("toggleAlertVisiblilty()", 3500);
  toggleAlertVisiblilty = () => {
    clearTimeout();
    alertBar.style.right = "-30rem";
    classList.remove(variant);
  };
};

//====================== CREATE CHANNEL =========================================
/****
 * CREATE CHANNEL: a funtion to create a game on the websuckit(web socket engine)
 */

let isCreating = false;
let passkey = "";
let gameId = "";
let sharableLink;
let channelId = "";

const show = () => console.log({ channelId }, "looooo");

const inviteLinkField = document.getElementById("invite-link");
inviteLinkField.disabled = true;

const createGameChannel = () => {
  isCreating = true;

  const startGameBtn = document.querySelector(".game--start--btn");
  startGameBtn.appendChild(loader);
  startGameBtn.style.opacity = 0.4;
  startGameBtn.disabled = true;
  loader.style.display = "block";

  const toggleButtonDisability = () => {
    startGameBtn.style.opacity = 1;
    startGameBtn.disabled = false;
    loader.style.display = "none";
  };

  const endCreation = () => {
    isCreating = false;
    toggleButtonDisability();
  };

  showAlert("🚀 Initializing Game...");

  ws.createChannel({ channel: crypto.randomUUID(), max_connections: 2 }).then(
    (res) => {
      showAlert("Game Created Successfully");
      toggleButtonDisability();
      endCreation();

      gameId = res.channel.name;
      passkey = res.channel.pass_key;
      channelId = res.channel.id;
      show();

      sharableLink = `${window.location}?${new URLSearchParams({
        passkey,
        gameId,
        channelId,
      })}`;

      inviteLinkField.value = sharableLink;
    },
    (err) => {
      showAlert("😞 oops, failed to create...", alertVariants.ERROR);
      toggleButtonDisability();
      endCreation();
    }
  );
};

// initialize game
const PLAYER_X = "x";
const PLAYER_O = "o";

roundWon = false;
score = [];
let startingPlayer = PLAYER_X;
let gamePaused = false;
let tileValue = ["", "", "", "", "", "", "", "", ""];

// any player can start the game, could either be player "x" or "o"
let player = document.querySelector(".player-turn");
player.innerHTML = "Player " + startingPlayer + " starts";

//====================== SET GAMESOCKET =========================================
const setGameSocket = () =>
  gameSocket.addEventListener("message", (e) => {
    const response = JSON.parse(e?.data);
    const modal = window.document.querySelector(".modal-container");

    switch (response.action) {
      case actions.PLAYER_JOINED:
        modal.style.display = "none";
        document.querySelector(".welcome-modal ").style.display = "none";
        break;

      case actions.PLAYED:
        const clickedTile = response?.payload?.clickedTile;
        playMove(clickedTile);

        break;
      case actions.DISCONNECT:
        try {
          ws.deleteChannel({ channelId });
          showAlert("Player Disconnected from game", alertVariants.ERROR);
          restartGame();
          score = [];
          // playerRole !== PLAYER_X ? (inviteLinkField.value = "") : null;
          inviteLinkField.value = ""
          document.querySelector(".welcome-modal ").style.display = "grid";
          const modal = window.document.querySelector(".modal-container");
          modal.style.display = "flex";

          document.querySelector(
            ".score--board--modal--wrapper"
          ).style.display = "none";

          playerRole = undefined;
          if (location.href.includes("?")) {
            history.pushState({}, null, location.href.split("?")[0]);
          }
        } catch (error) {
          showAlert(JSON.stringify(error), alertVariants.ERROR);
        }

        break;

      default:
        break;
    }
  });

(() => {
  if (!!gameSocket) {
    setGameSocket();
  }
})();

window.addEventListener("beforeunload", (event) => {
  gameSocket.send(
    JSON.stringify({
      action: actions.DISCONNECT,
      payload: { player: playerRole },
    })
  );
});

//====================== Connect WIth URL =========================================

(() => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const passkey = urlParams.get("passkey");
  const gameId = urlParams.get("gameId");

  if (!!urlParams.get("channelId")) {
    channelId = urlParams.get("channelId");
  }

  let connectionUrl;
  if (passkey && gameId && channelId) {
    connectionUrl = ws.getConnectionUrl({
      channelName: gameId,
      channelPassKey: passkey,
    });

    console.log(
      "wert",
      ws.getConnectionUrl({
        channelName: gameId,
        channelPassKey: passkey,
      })
    );
    if (!connectionUrl.value) {
      showAlert("error connecting", alertVariants.ERROR);
      playerRole = undefined;
      if (window.location.href.includes("?")) {
        history.pushState({}, null, location.href.split("?")[0]);
      }
      return;
    }

    gameSocket = new WebSocket(connectionUrl.value);
    console.log(gameSocket);

    gameSocket.addEventListener("open", () => {
      document.querySelector(".welcome-modal ").style.display = "none";
      const modal = window.document.querySelector(".modal-container");
      modal.style.display = "none";
      playerRole = PLAYER_O;
      gameSocket.send(
        JSON.stringify({
          action: actions.PLAYER_JOINED,
          payload: null,
        })
      );
      setGameSocket();
    });

    gameSocket.addEventListener("close", (e) => {
      gameSocket.send(
        JSON.stringify({
          action: actions.DISCONNECT,
          payload: { player: playerRole },
        })
      );
    });
  }
})();

const welcomeTitle = document.querySelector(".welcome-title");
const loader = document.querySelector(".loader");

// ============================= COPY GAME URL & INITIALIZE GAME ====================================
{
  /*
   *Copy game URL
   *Initialize the gamesocket(Websucket backend) using game id and passkey
   *start listening for JOINER
   */
}
const copyLink = () => {
  showAlert("📋 Copied to clipboard..");
  const narutoSasukeImage = document.querySelector(".waiting__gif");
  narutoSasukeImage.style.display = "block";
  navigator.clipboard.writeText(sharableLink);
  welcomeTitle.innerHTML = "Ready player 1, Waiting for player 2...";
  welcomeTitle.style.animation = "scroll-left 20s linear infinite";
  welcomeTitle.style.fontSize = "1rem";
  const connectionUrl = ws.getConnectionUrl({
    channelName: gameId,
    channelPassKey: passkey,
  });

  gameSocket = new WebSocket(connectionUrl.value);
  playerRole = PLAYER_X;
  setGameSocket();
};

// ============ DELETE GAME INSTANCE (GAME SOCKET) ON CONNECTION CLOSE =========================

// update/change player
let currentplayer = startingPlayer;
const changeplayer = () => {
  currentplayer = currentplayer === PLAYER_X ? PLAYER_O : PLAYER_X;
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
  if (currentplayer !== playerRole) {
    return;
  }
  let clickedTile = parseInt(e.target.id);
  playMove(clickedTile);
  gameSocket.send(
    JSON.stringify({ action: actions.PLAYED, payload: { clickedTile } })
  );
};

const playMove = (clickedTile) => {
  // console.log({ currentplayer });
  handleClickedTile = (clickedTile) => {
    tileValue[clickedTile] = currentplayer;
    gameSocket.send(
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
  document.querySelector(".score--board--modal--wrapper").style.display =
    "grid";

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
  document.querySelector(".score--board--modal--wrapper").style.display =
    "grid";
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
