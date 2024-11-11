var socket;

document.addEventListener("DOMContentLoaded", () =>  {
	
	const canvas = document.getElementById('canvas');
	canvas.width = 600; 
	canvas.height = 300;
	const ctx = canvas.getContext('2d');
	const img = new Image();
	img.src = "./img2.jpg";
	
	let ballPosition = { x: 400, y: 200 }; // Initial position, will be updated by server
	let ballRadius = 10;
	let paddle1 = {
        x: 10,        // Starting x-position of the paddle
        y: 110,       // Starting y-position of the paddle
        w: 5,        // Width of the paddle
        h: 80,        // Height of the paddle
    };
	let paddle2 = {
        x: 10,        // Starting x-position of the paddle
        y: 110,       // Starting y-position of the paddle
        w: 5,        // Width of the paddle
        h: 80,        // Height of the paddle
    };
	/*******************************************************************************************************/
	//																	My change
	/*******************************************************************************************************/
	const startContainer = document.createElement("div");
	const waitContainer = document.createElement("div");
	const app = document.getElementById('pingpong-game');
	const main_counter = document.getElementById("main_counter");
	const gameContainer = document.getElementById("game-container1")
	const game_over = document.getElementById("game_over"); 
	startContainer.className = "start-container1";
	waitContainer.className = "wait-container1";

	let roomCode;
	let room_is_created = false;
	let pad_num;

	startContainer.innerHTML = `
	<h1>Welcome to PONG</h1>
	<button class="select" id="startGame1">Start a Game</button>
	`;

	waitContainer.innerHTML=`
	<div class="loader-container1">
		<div class="loading-text1">Loading<span class="dots1"></span></div>
	</div>
	`;

	app.appendChild(startContainer);
	app.appendChild(waitContainer);

	document.getElementById("startGame1").addEventListener("click", function() {
		wait_page();
		fetchRoom();
	});


	function createRoom() {
	    fetch('http://127.0.0.1:8002/api/rooms/', {
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

	function fetchRoom() {
	    fetch('http://127.0.0.1:8002/api/rooms/')
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
	        }) 
	        .catch(error => {
	            console.error("Error fetching rooms:", error);
	        });
	}

	function connectWebSocket() {
		socket = new WebSocket(`ws://127.0.0.1:8002/ws/play/${roomCode}/`);

		socket.onopen = function() {
			console.log('WebSocket connection established.');
		};
		socket.close = function(){
			console.log("in End")
			
		}
		socket.onmessage = function(event) {
			const data = JSON.parse(event.data);
			console.log("Event is ", data.event);
			if (data.type === "GAME_STATE") {
				// Extract ball and paddle data
				const ball = data.ball;
				const paddle_serv1 = data.paddle1;
				const paddle_serv2 = data.paddle2;
				ballPosition.x = ball.x;
				ballPosition.y = ball.y;
				ballRadius = 10;
				paddle1.x = paddle_serv1.x;
				paddle1.y = paddle_serv1.y;
				paddle2.x = paddle_serv2.x;
				paddle2.y = paddle_serv2.y;
				document.getElementById("player1Score").innerHTML = paddle_serv1.score;
				document.getElementById("player2Score").innerHTML = paddle_serv2.score;
				renderGame();
			}
			else if (data.type === 'ASSIGN_PAD_NUM') {
				console.log("in PadNum");
				pad_num = data.pad_num;
				console.log("pad num is ", pad_num)
			}
			else if (data.event == 'START')
				start_game();
			else if (data.event == 'END')
				Game_over(data.message);
			else if (data.event == "LEFT")
				console.log("the messqge is ", data.message);
		};
		

	}
	

	function wait_page()
	{
	    console.log("wait fuction");
	    waitContainer.classList.add("active");
	    startContainer.classList.remove("active");
	    startContainer.style.display = "none";
	}


	function start_game(){
		console.log("start")
        startContainer.classList.remove("active");
		waitContainer.classList.remove("active");
		main_counter.style.display = "block";
		runAnimation();
		setTimeout(() => {
			socket.send(JSON.stringify({ type: "start"}));
			gameContainer.style.display = "block";
			renderGame();
			
		}, 3000)
	}

	function Game_over(winner)
	{
		if (pad_num == parseInt(winner)){
			gameContainer.style.display = "none";
			game_over.style.display = "block";
			if (pad_num == 0)
				game_over.style.backgroundColor = "#0095DD";
		}
		else{
			gameContainer.style.display = "none";
			game_over.style.display = "block";
			document.getElementById("result1").innerHTML = "You lose";
			if (pad_num == 0)
				game_over.style.backgroundColor = "#0095DD";
		}
	}
	function generateRoomCode() {
	    return Math.random().toString(36).substring(2, 8).toUpperCase();
	}

	const nums = document.querySelectorAll('.nums span');
	const counter = document.querySelector('.counter');
	const repl = document.getElementById('replay');


	function resetDOM() {
		counter.classList.remove('hide');
	
		nums.forEach(num => {
			num.classList.value = '';
		});

	    nums[0].classList.add('in');
	}

	function runAnimation() {
		nums.forEach((num, idx) => {
			const penultimate = nums.length - 1;
			num.addEventListener('animationend', (e) => {
				if(e.animationName === 'goIn' && idx !== penultimate){
					num.classList.remove('in');
					num.classList.add('out');
				} else if (e.animationName === 'goOut' && num.nextElementSibling){
					num.nextElementSibling.classList.add('in');
				} else {
					counter.classList.add('hide');
				}
			});
		});

	}

	document.addEventListener("keydown", (event) => {
		if (event.key === "ArrowUp") {
			socket.send(JSON.stringify({ 
				type: "move", 
				move: "Up", 
				pad_num: pad_num 
			}));
		} else if (event.key === "ArrowDown") {
			socket.send(JSON.stringify({ 
				type: "move", 
				move: "Down", 
				pad_num: pad_num 
			}));
		}
	});
	
	document.addEventListener("keyup", (event) => {
		if (event.key === "ArrowUp" || event.key === "ArrowDown") {
			socket.send(JSON.stringify({ 
				type: "move", 
				move: "Stop", 
				pad_num: pad_num
			}));
		}
	});



	function renderGame() {
		// Clear the canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	
		// Draw the paddle
		ctx.fillStyle = "#ff0000";
		ctx.fillRect(paddle1.x, paddle1.y, paddle1.w, paddle1.h);
		ctx.fillStyle = "#0095DD";
		ctx.fillRect(paddle2.x, paddle2.y, paddle2.w, paddle2.h);
	
		// Draw the ball
		ctx.beginPath();
		ctx.arc(ballPosition.x, ballPosition.y, ballRadius, 0, Math.PI * 2);
		ctx.fillStyle = "#0095DD";
		ctx.fill();
		ctx.closePath();
		ctx.stroke();
	
		// Request the next frame
		requestAnimationFrame(renderGame);
	}
	/* ************************************ Abed Changes ******************************************* */

	const handlePlayBtn = () => {
		const bodyElement = document.querySelector("body");
		const header = document.createElement("h1");
		header.id = "header-mode";
		header.innerHTML = `CHOOSE MODE`;
		const parent = document.createElement("div");
		const container = document.createElement("div");
		container.id = "cont-modes";
		parent.id = "choose-mode";
		const twoPlayers = document.createElement("div");
		twoPlayers.id = "two-players";
		twoPlayers.classList.add("mode");
		twoPlayers.innerHTML = `Two Players.`
		const tournament = document.createElement("div");
		tournament.id = "tournament";
		tournament.classList.add("mode");
		tournament.innerHTML = `Tournament.`;
		const remote = document.createElement("div");
		remote.id = "remote";
		remote.classList.add("mode");
		remote.innerHTML = `Remote.`
		container.append(twoPlayers, tournament, remote);
		parent.append(header, container);
		bodyElement.append(parent);
		parent.style.display = "flex";
		const handleRemoteGame = () => {
			container.style.display = "none";
			header.style.display = "none";
			parent.append(app);
			app.style.display = "flex";
		}
		remote.addEventListener("click", handleRemoteGame);
	}

	const play_button = document.querySelector("#play-button");
	play_button.addEventListener("click", handlePlayBtn);

});
