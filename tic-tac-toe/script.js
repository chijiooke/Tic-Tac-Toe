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

// ========================= HTML ELEMENTS =========================

title = document.querySelector(".title");
const inviteLinkWrapper = document.querySelector(".invite--wrapper");
const loadingNarutoGif = document.querySelector(".waiting__gif");
const welcomeTitle = document.querySelector(".welcome-title");
const loader = document.querySelector(".loader");
const startGameBtn = document.querySelector(".game--start--btn");
const welcomeInstruction = document.querySelector(".welcome--instruction");
const welcomeModal = document.querySelector(".welcome-modal ");
const modalBackground = window.document.querySelector(".modal-container");
const loadingModal = window.document.querySelector(".loading--modal");

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

// Player Roles
const PLAYER_X = "x";
const PLAYER_O = "o";

roundWon = false;
score = [];
let startingPlayer = PLAYER_X;
let gamePaused = false;
let tileValue = ["", "", "", "", "", "", "", "", ""];

//====================== Handle Waiting For Player ===================================
const handleWaitingForOtherPlayer = (waitingText) => {
  loadingNarutoGif.style.display = "block";
  welcomeTitle.innerHTML = waitingText;
  welcomeTitle.style.animation = "simulateLoading 1s linear infinite";
  welcomeTitle.style.fontSize = "0.8rem";
  welcomeTitle.appendChild(loader);
};

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
  setTimeout("toggleAlertVisiblilty()", 3500);
  toggleAlertVisiblilty = () => {
    clearTimeout();
    alertBar.style.right = "-30rem";
    classList.remove(variant);
  };
};

//====================== CREATE GAME CHANNEL =========================================
/****
 * CREATE CHANNEL: a function to create a game on the websuckit(web socket engine)
 */

let isCreating = false;
let passkey = "";
let gameId = "";
let sharableLink;
let channelId = "";

const inviteLinkField = document.getElementById("invite-link");
inviteLinkField.disabled = true;

const createGameChannel = () => {
  isCreating = true;
  playerRole = PLAYER_X;

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
  if (channelId || sharableLink?.length) {
    ws.deleteChannel({ channelId });
  }
  ws.createChannel({ channel: crypto.randomUUID(), max_connections: 2 }).then(
    (res) => {
      showAlert(
        sharableLink?.length
          ? "new link generated"
          : "Game Created Successfully"
      );
      toggleButtonDisability();
      endCreation();

      gameId = res.channel.name;
      passkey = res.channel.pass_key;
      channelId = res.channel.id;

      sharableLink = `${window.location}?${new URLSearchParams({
        passkey,
        gameId,
        channelId,
      })}`;

      inviteLinkField.value = sharableLink;
      inviteLinkWrapper.style.display = "flex";
      startGameBtn.innerHTML = "Regenerate URL";
    },
    (err) => {
      showAlert("😞 oops, failed to create...", alertVariants.ERROR);
      toggleButtonDisability();
      endCreation();
    }
  );
};

// ============================= COPY GAME URL & INITIALIZE GAME ====================================
/*
 *Copy game URL
 *Initialize the gamesocket(Websucket backend) using game id and passkey
 *start listening for JOINER
 */

const copyLink = () => {
  showAlert("📋 Copied to clipboard..");
  navigator.clipboard.writeText(sharableLink);
  handleWaitingForOtherPlayer("Ready player 1, Waiting for player 2...");
  const connectionUrl = ws.getConnectionUrl({
    channelName: gameId,
    channelPassKey: passkey,
  });

  try {
    gameSocket = new WebSocket(connectionUrl.value);
    playerRole = PLAYER_X;
  } catch (error) {
    gameSocket.addEventListener("error", handleDisconnect());
  }

  setGameSocket();
};

/*====================== Display Player Turn =========================================*/
let player = document.querySelector(".player-turn");
player.innerHTML = "Player " + startingPlayer + " starts";

/*====================== SET GAMESOCKET =========================================
manage all actions from the websocket event listener*/

const setGameSocket = () => {
  gameSocket.addEventListener("error", (e) => {
    gameSocket.send(
      JSON.stringify({
        action: actions.DISCONNECT,
        payload: { player: playerRole },
      })
    );
    handleDisconnect();
  });

  gameSocket.addEventListener("message", (e) => {
    const response = JSON.parse(e?.data);
    const modal = window.document.querySelector(".modal-container");
    switch (response.action) {
      case actions.PLAYER_JOINED:
        modal.style.display = "none";
        document.querySelector(".welcome-modal").style.display = "none";
        loadingModal.style.display = "none";
        welcomeModal.style.display = "none";
        break;

      case actions.PLAYED:
        const clickedTile = response?.payload?.clickedTile;
        playMove(clickedTile);

        break;
      case actions.DISCONNECT:
        loadingModal.style.display = "flex";
        handleDisconnect();
        break;
      default:
        break;
    }
  });
};

(() => {
  if (!!gameSocket) {
    setGameSocket();
  }
})();

// ========================================= LISTEN FOR TAB CLOSE ==============================
window.addEventListener("beforeunload", (event) => {
  gameSocket.send(
    JSON.stringify({
      action: actions.DISCONNECT,
      payload: { player: playerRole },
    })
  );
});

//====================== HANDLE GAME DISCONNECT =========================================
const handleDisconnect = () => {
  loadingModal.style.display = "flex";
  if (ws) {
    console.log({ ws });
    new Promise((resolve, reject) => {
      fetch(ws?.deleteChannel({ channelId }))
        .then((res) => {
          console.log({ res });
          showAlert("Player Disconnected from game", alertVariants.ERROR);
          restartGame();
          score = [];
          inviteLinkField.value = "";
          inviteLinkWrapper.style.display = "none";
          document.querySelector(".welcome-modal ").style.display = "grid";
          const modal = window.document.querySelector(".modal-container");
          modal.style.display = "flex";
          welcomeModal.style.display = "grid";

          document.querySelector(
            ".score--board--modal--wrapper"
          ).style.display = "none";
        })
        .then(() => {
          playerRole = undefined;
          if (location.href.includes("?")) {
            history.pushState({}, null, location.href.split("?")[0]);
          }
          loadingModal.style.display = "none";
        })
        .catch((err) => {
          console.log({ err });
          showAlert(
            "failed to diconnect kindly refrech browser/ clear chache",
            alertVariants.ERROR
          );
        });

      console.log({ resolve, reject });
    });
  } else {
    if (location.href.includes("?")) {
      history.pushState({}, null, location.href.split("?")[0]);
    }
    window.location.reload();
  }
};

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
    welcomeModal.style.display = "none";
    loadingModal.style.display = "flex";
    try {
      connectionUrl = ws.getConnectionUrl({
        channelName: gameId,
        channelPassKey: passkey,
      });

      gameSocket = new WebSocket(connectionUrl.value);
      if (gameSocket.readyState === 3) {
        showAlert("Connection Failed");
        throw new Error("failed to connect");
      }
      gameSocket.addEventListener("open", () => {
        playerRole = PLAYER_O;
        modalBackground.style.display = "none";

        gameSocket.send(
          JSON.stringify({
            action: actions.PLAYER_JOINED,
            payload: null,
          })
        );
        setGameSocket();
      });
      if (gameSocket && (playerRole === PLAYER_O || !playerRole)) {
        gameSocket.addEventListener("close", () => handleDisconnect());
        gameSocket.addEventListener("error", () => handleDisconnect());
      }
    } catch (error) {
      if (!connectionUrl?.value) {
        showAlert("error connecting", alertVariants.ERROR);
        playerRole = undefined;
        if (window.location.href.includes("?")) {
          history.pushState({}, null, location.href.split("?")[0]);
        }
        return;
      }
    }
  }
})();

// ============ GAME LOGIC =========================

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
};

const playMove = (clickedTile) => {
  handleClickedTile = (clickedTile) => {
    tileValue[clickedTile] = currentplayer;
    gameSocket.send(
      JSON.stringify({
        action: actions.PLAYED,
        payload: {
          player: currentplayer,
          clickedTile,
        },
      })
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
