document.addEventListener("DOMContentLoaded", () =>  {
    const app = document.getElementById("app");
    const startContainer = document.createElement("div");
    const gameContainer = document.createElement("div");
    const waitContainer = document.createElement("div");
    const showResult = document.createElement("div");
    const Suser = document.createElement("div");
    let is_gameOver = false;
    let socket;
    let crtf;
    let matchdata = 
    {
        id:0,
        level:0,
        user:0,
        opponent:0,
        create_at:"",
        chose:"",
        result:0,
        x_resuSuserlt:"",
    };
    // const leftGameContainer = document.createElement("div");

    startContainer.className = "start-container";
    gameContainer.className = "game-container";
    waitContainer.className = "wait-container";
    showResult.className = "show-Result";
    Suser.className = "same-User"

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
    Suser.innerHTML = `
        <h2 id="sameUser"> you can't Play with yourself</h2>
    `;
    app.appendChild(startContainer);
    app.appendChild(gameContainer);
    app.appendChild(waitContainer);
    app.appendChild(showResult);
    app.appendChild(Suser);
    let charChoice = null;
    let roomCode =null;
    let currentTurn = 'X'; 
    let room_is_created = false;

function fetchUser(){
    fetch('https://localhost/user/get_curr_user/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();  
    })
    .then(data => {
        if (data.status === '400') {
            console.log('User is not authenticated:', data.data);
        } else {
            matchdata.id = data.data.id;
            matchdata.user = data.data.id;
            matchdata.level = data.data.level;
            console.log("LEVEL is ", matchdata.level, " User is ", matchdata.user, matchdata.id)
        }
    })
}
function fetchcrtf(){
    fetch('https://localhost/get_csrf_token/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();  
    })
    .then(data => {
        if (data.status === '400') {
            console.log('User is not authenticated:', data.data);
        } else {
            crtf = data.csrfToken;
        }
    })
}
function postMatch()
{
    if (matchdata.result == 0)
        matchdata.x_result = "lose";
    else if (matchdata.result == 1)
        matchdata.x_result = "won";
    else
        matchdata.x_result = "draw";

    let postdata = 
    {
        id : matchdata.id,
        user : matchdata.id,
        opponent: matchdata.opponent,
        result: matchdata.x_result,
        level: 0
    }
    postdata.level= 1;
    console.log("crtf ", crtf);
    console.log("postdata ",postdata);
    fetch('https://localhost/user/store_match/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': crtf
        },
        body: JSON.stringify(postdata)
    })
}

function fetchRoom() {
    fetch('http://127.0.0.1:8001/api/rooms/')
    .then(response => {
        if (!response.ok) {
            console.log("No available rooms, creating a new room...");
            createRoom();
        }
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
        if (!roomCode)
        {
            roomCode = data.code;
            console.log("Created new room with code: ", roomCode); 
            wait_page();
            connectWebSocket();
        }
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
    console.log("First Wait");
    wait_page();
    fetchRoom();
});

function wait_page()
{
    console.log("wait fuction");
    fetchUser();
    waitContainer.classList.add("active");
    startContainer.classList.remove("active");
    showResult.classList.remove("active");
    startContainer.style.display = "none";
}
function startGame() {
        console.log("start fuction");
        console.log("id", matchdata.id)
        fetchcrtf();
        socket.send(JSON.stringify({
            "event": "START",
            "message": matchdata.id
        }));
        startContainer.classList.remove("active");
        gameContainer.classList.add("active");
        waitContainer.classList.remove("active");
        socket.send(JSON.stringify({
            "event": "DUSER",
            "message": ""
        }));

   }

    function connectWebSocket() {
        socket = new WebSocket(`ws://127.0.0.1:8001/ws/play/${roomCode}/`);

        socket.onopen = function() {
            console.log("Here New pr")
        };

        socket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            const message = data.message;
            const eventType = data.event;
            
            console.log("event type is ", eventType, "message is ", message);
            switch (eventType) {
                case "CHOICE":
                    charChoice = message;
                    matchdata.chose = message;
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
                    if (message.includes(charChoice)) {
                        document.querySelector("#result").innerHTML = currentTurn + " win";
                        if (message.includes(matchdata.chose))
                        {
                                matchdata.result = 1;
                                matchdata.level +=0.1; 
                        }   
                        else
                        {
                            matchdata.result = 0;
                            matchdata.level -=0.1; 
                         }                      
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
                    resetGame();
                    break;
                case "wait":
                    console.log("waitt")
                    wait_page();
                    break;
                case "DRAW":
                    matchdata.result = 2;
                    console.log("this is draw")
                    resetGame();
                    break;
                case "OVER":
                    left_game(message);
                    console.log("this is over")
                    break;
                case "USERS":
                    if (message == 'Suser')
                        hadnleSuser();
                    else
                        updateMatchData(message);
                    break;
            }
        };

        document.querySelectorAll('.square').forEach((element, index) => {

            element.addEventListener('click', function() {
                if (validMove(index) && isPlayerTurn()) {

                    element.innerHTML = currentTurn;
                    const moveData = {
                        "event": "MOVE",
                        "message": {
                            "index": index,
                            "player": currentTurn
                        }
                    };
                    console.log("sending ...");
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
        function updateMatchData(message)
        {
            if (matchdata.id == message.user1)
            {
                matchdata.opponent = message.user2;
            }
            else
            {
                matchdata.opponent = message.user1;
            }
            console.log("Update Match ", matchdata.id, " ope ", matchdata.opponent);
        }
        function hadnleSuser()
        {
            console.log("in Suser");
            gameContainer.classList.remove("active");
            const same = document.querySelector(".same-User");
            same.style.display = "flex";
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
                    if (message === matchdata.chose)
                    {
                            matchdata.result = 0;
                            matchdata.level -=0.1; 
                    }
                    else
                    {
                        matchdata.result = 1;
                        matchdata.level+=0.1; 
                    } 
            }
            else
            {
                document.querySelector("#result").innerHTML = 'X' + " won";
                if (message === matchdata.chose)
                {
                        matchdata.result = 0;
                        matchdata.level -=0.1; 
                }
                else
                {
                    matchdata.result = 1;
                    matchdata.level+=0.1; 
                } 
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
            for (let i = 0; i < WinCondation.length; i++)
            {
                let v0 = boxes[WinCondation[i][0]].innerHTML;
                let v1 = boxes[WinCondation[i][1]].innerHTML;
                let v2 = boxes[WinCondation[i][2]].innerHTML;
                if (v0 != "" && v0 === v1 && v0 === v2){
                    for (let j = 0; j < 3; j++)
                    {
                        boxes[WinCondation[i][j]].style.backgroundColor = "#00ffa2";
                        boxes[WinCondation[i][j]].style.color = "#000";
                    }
                }
            }
            postMatch();
            disconnect();
        }

    }
    const playAgain = ()=> {
        is_gameOver = false;
        currentTurn = 'X'; 

        console.log('playAgain');
        room_is_created = false;
        gameContainer.classList.remove('player-o-turn');
        const same = document.querySelector(".same-User");
        same.style.display = "none";
        waitContainer.classList.remove("active")
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
        const same = document.querySelector(".same-User");
        same.style.display = "none";
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