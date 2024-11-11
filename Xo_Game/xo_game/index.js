// static/js/app.js
// static/js/app.js

document.addEventListener("DOMContentLoaded", () =>  {
    const app = document.getElementById("app");
    const startContainer = document.createElement("div");
    const gameContainer = document.createElement("div");
    const waitContainer = document.createElement("div");
    const showResult = document.createElement("div");
    let is_gameOver = false;
    let socket;
    // const leftGameContainer = document.createElement("div");

    startContainer.className = "start-container";
    gameContainer.className = "game-container";
    waitContainer.className = "wait-container";
    showResult.className = "show-Result";
    // gameContainer.className = "leftGame-container";


    startContainer.innerHTML = `
        <h1>Welcome to Tic Tac Toe</h1>
        <button class="select" id="startGame">Start a Game</button>
    `;


    gameContainer.innerHTML = `
            <div class="first_container">
            <h3> Turn For</h3>
            <div class="first_box align">X</div>
            <div class="first_box align">O</div>
            <div class="bg"></div>
        </div>
        <div id="game-board">
            <div class="square align" data-index="0"></div>
            <div class="square align" data-index="1"></div>
            <div class="square align" data-index="2"></div>
            <div class="square align" data-index="3"></div>
            <div class="square align" data-index="4"></div>
            <div class="square align" data-index="5"></div>
            <div class="square align" data-index="6"></div>
            <div class="square align" data-index="7"></div>
            <div class="square align" data-index="8"></div>
        </div>
        <div id="alert_move">Your are </div>
        <button id="play-again">Play Again</button> <!-- Moved here -->
    `;
    waitContainer.innerHTML=`
        <div class="loader-container">
            <div class="loading-text">Loading<span class="dots"></span></div>
        </div>
        `;
    showResult.innerHTML = `
        <h2 id="result" ></h2>
        `;
    app.appendChild(startContainer);
    app.appendChild(gameContainer);
    app.appendChild(waitContainer);
    app.appendChild(showResult);
    let charChoice = null;
    let roomCode =null;
    let currentTurn = 'X'; 
    let room_is_created = false;
function fetchRoom() {
    fetch('http://127.0.0.1:8001/api/rooms/')
    .then(response => {
        if (!response.ok) {
            console.log("No available rooms, creating a new room...");
            createRoom();
            room_is_created = true;
            console.log("room was created");
        }
        console.log("we are about to return ");
        return response.json();
    })
        .then(data => {
            if (data && !room_is_created) {
                const room = data;
                console.log("the room is ", room.code, " and num of player ", room.players);
                if (room.players < 2) {
                    console.log("********************************inside room num ", room.code, " and num of player ", room.players);
                    roomCode = room.code;  
                    console.log("Joining existing room with code: ", roomCode); 
                    wait_page();
                    connectWebSocket();
                    return ;
                }
                else {
                    console.log("Room is full, creating a new room...");
                    createRoom();  
                }
            }
            // else {
            //     console.log("there is no room");
            //     createRoom();
            // }
        })
        .catch(error => {
            console.error("Error fetching rooms:", error);
        });
}


function createRoom() {
    fetch('http://127.0.0.1:8001/api/rooms/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({"code": generateRoomCode()})
    })
    .then(response => response.json())
    .then(data => {
        roomCode = data.code;
        console.log("Created new room with code: ", roomCode); 
        wait_page();
        connectWebSocket();
    })
    .catch(error => {
        console.error("Error creating room:", error);
    });
}

function disconnect() {
    socket.close();
}


function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}
    document.getElementById("startGame").addEventListener("click", function() {
        wait_page();
        fetchRoom();
    });

    function wait_page()
    {
        console.log("wait fuction");
        waitContainer.classList.add("active");
        startContainer.classList.remove("active");
        showResult.classList.remove("active");
        startContainer.style.display = "none";
    }
    function startGame() {
        console.log("start fuction");

        startContainer.classList.remove("active");
        gameContainer.classList.add("active");
        waitContainer.classList.remove("active");
    }

    function connectWebSocket() {
        socket = new WebSocket(`ws://127.0.0.1:8001/ws/play/${roomCode}/`);

        socket.onopen = function() {
            console.log('WebSocket connection established.');
            socket.send(JSON.stringify({
                "event": "START",
                "message": ""
            }));
        };

        socket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            const message = data.message;
            const eventType = data.event;

            console.log("event type is ", eventType, "message is ", message);
            switch (eventType) {
                case "CHOICE":
                    charChoice = message; 
                    wait_page();
                    break;
                case "START":
                    initializeGame();
                    break;
                case "MOVE":
                    console.log("Handle Move");
                    handleMove(message);
                    break;
                case "TURN":
                    console.log('TURN ', message, 'with ', eventType)
                    if (message.includes('X')) {
                        currentTurn = 'X';
                    } else {
                        currentTurn = 'O';
                    }
                    document.getElementById("alert_move").textContent = message;
                    document.getElementById("alert_move").textContent = `Your are ${currentTurn}`;

                    break;
                case "END":
                    console.log('game over ', message, 'with ', eventType)
                    resetGame();
                    if (message.includes(charChoice)) {
                        document.querySelector("#result").innerHTML = currentTurn + " win";
                        // keep curent turn here
                    } 
                    else {
                        if (currentTurn === 'X')
                        {
                            document.querySelector("#result").innerHTML = 'O' + " loss";
                        }
                        else
                        {
                            document.querySelector("#result").innerHTML = 'X' + " loss";
                        }
                    }
                    break;
                case "wait":
                    wait_page(message);
                    break;
                case "DRAW":
                    console.log('game Draw ', message, 'with ', eventType)
                    resetGame();
                    break;
                case "OVER":
                    left_game(message);
                    break;
            }
        };

        document.querySelectorAll('.square').forEach((element, index) => {
            element.addEventListener('click', function() {
                if (validMove(index) && isPlayerTurn()) {
                    console.log("this is Handle");
                    element.innerHTML = currentTurn;
                    const moveData = {
                        "event": "MOVE",
                        "message": {
                            "index": index,
                            "player": currentTurn
                        }
                    };
                    socket.send(JSON.stringify(moveData));
                }
            });
        });

        function validMove(index) {
                console.log("Valid Move is ", !is_gameOver,  "and it is ", document.querySelector(`.square[data-index='${index}']`).textContent === '');
                if (!is_gameOver)
                    return document.querySelector(`.square[data-index='${index}']`).textContent === '';
                else
                    return false;
        }
        function isPlayerTurn() {
            console.log("it is player ", charChoice === currentTurn)
            return charChoice === currentTurn;
        }
        
        function handleMove(message) {
            const index = message.index;
            const player = message.player;
        
            document.querySelector(`.square[data-index='${index}']`).textContent = player;
            console.log("from HM     player is ", player, "and indx is ", index);
            if (currentTurn === 'X') {
                currentTurn = 'O';
                document.querySelector(".bg").style.left = "85px";
                document.querySelector(".bg").style.backgroundColor = "#08D9D6";
                gameContainer.classList.add('player-o-turn');
            } else {
                currentTurn = 'X';
                document.querySelector(".bg").style.left = "0";
                document.querySelector(".bg").style.backgroundColor = "#FF2E63";
                gameContainer.classList.remove('player-o-turn');
            }
            
        }
        function initializeGame() {
            console.log("intitialze fuction");
            document.getElementById("alert_move").textContent = `Your are ${charChoice}`;

            startGame();
        }

        function left_game(message){
            if (message === 'X')
            {
                    document.querySelector("#result").innerHTML = 'O' + " won";
            }
            else
            {
                document.querySelector("#result").innerHTML = 'X' + " won";
            }
            resetGame();
            console.log("this one left");
        }
        function resetGame() {
            // document.querySelectorAll('.square').forEach((element) => {
            //     element.textContent = '';
            // });
            is_gameOver = true;
            console.log('this restGame');

            showResult.classList.add("active");
            showResult.style.display = "block";
            document.querySelector("#play-again").style.display = "block";
            let WinCondation = [
                [0, 1, 2],
                [3, 4, 5],
                [6, 7, 8],
                [0, 3, 6],
                [1, 4, 7],
                [2, 5, 8],
                [0, 4, 8],
                [2, 4, 6]
            ];
            let boxes = document.querySelectorAll('.square');
            // console.log('this boxes');
            for (let i = 0; i < WinCondation.length; i++)
            {
                // console.log('this boxes', i);
                let v0 = boxes[WinCondation[i][0]].innerHTML;
                let v1 = boxes[WinCondation[i][1]].innerHTML;
                let v2 = boxes[WinCondation[i][2]].innerHTML;
                console.log("the winner is ", v0);
                if (v0 != "" && v0 === v1 && v0 === v2){
                    alert("fill the boxes.");
                    // console.log('winner Chose');
                    for (let j = 0; j < 3; j++)
                    {
                        boxes[WinCondation[i][j]].style.backgroundColor = "#00ffa2";
                        boxes[WinCondation[i][j]].style.color = "#000";
                    }
                    // boxes.forEach(e =>
                    //     {
                    //         e.classList.add('filled');
                    //     })
                }
            }

        }
    }
    const playAgain = ()=> {
        is_gameOver = false;
        currentTurn = 'X'; 

        console.log('playAgain');
        gameContainer.classList.remove('player-o-turn');
        room_is_created = false;
        startContainer.classList.add("active");
        gameContainer.classList.remove("active");
        startContainer.style.display = "block";
        showResult.classList.remove("active");
        document.getElementById("alert_move").textContent = `Your are ${charChoice}`;
        document.querySelector(".bg").style.left = "0";
        document.querySelector("#result").innerHTML = "";
        document.querySelector("#play-again").style.display = "none";
        document.querySelector(".bg").style.backgroundColor = "#FF2E63";
        // gameContainer.classList.remove('player-o-turn'); 
        document.querySelectorAll('.square').forEach((element) => {
            // element.classList.remove('filled');
            element.textContent = '';
            element.style.removeProperty("background-color");
        });
    }
    document.querySelector("#play-again").addEventListener("click", playAgain);
    // const app = document.querySelector("#app");
    const freeze = document.querySelector("#freeze");

    const displayXoFunction = () => {
        freeze.classList.add("unclick");
        app.style.display = "block";
        const design = document.querySelector("#design");
        design.style.filter = "blur(3px)";
        const games = document.querySelector("#games");
        games.style.filter = "blur(3px)";
        const nav = document.querySelector("#nav");
        nav.style.filter = "blur(3px)";
    }

    const xoImgBtn = document.querySelector("#XO");
    xoImgBtn.addEventListener("click", displayXoFunction);

    const closeGame = () => {
        freeze.classList.remove("unclick");
        disconnect()
        playAgain();
        app.style.display = "none";
        document.querySelector("#design").style.filter = "blur(0px)";
        document.querySelector("#games").style.filter = "blur(0px)";
        document.querySelector("#nav").style.filter = "blur(0px)";
    }

    const escapeFunction = (event)=> {
        if (event.key === "Escape") {
            closeGame();
        }
    }

    document.addEventListener("keyup", escapeFunction);

    const closeBtn = document.querySelector(".btn-close");
    closeBtn.addEventListener("click", closeGame);
});
/********  new    ********* */



