
var socket;

document.addEventListener("DOMContentLoaded", () =>  {
	
	const canvas = document.getElementById('canvas');
	canvas.width = 600; 
	canvas.height = 300;
	const ctx = canvas.getContext('2d');
	const img = new Image();
	let pad_num;
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
	const app = document.getElementById('app');
	const main_counter = document.getElementById("main_counter");
	const gameContainer = document.getElementById("game-container")

	startContainer.className = "start-container";
	waitContainer.className = "wait-container";

	let roomCode;
	let room_is_created = false;

	startContainer.innerHTML = `
	<h1>Welcome to PONG</h1>
	<button class="select" id="startGame">Start a Game</button>
	`;


	waitContainer.innerHTML=`
	<div class="loader-container">
		<div class="loading-text">Loading<span class="dots"></span></div>
	</div>
	`;


	app.appendChild(startContainer);
	app.appendChild(waitContainer);

	document.getElementById("startGame").addEventListener("click", function() {
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
			socket.send(JSON.stringify({
				"type": "START",
				"message": ""
			}));
		};
		socket.onmessage = function(event) {
			const data = JSON.parse(event.data);
			if (data.type === "GAME_STATE") {
				// Extract ball and paddle data
				const ball = data.ball;
				const paddle_serv1 = data.paddle1;
				const paddle_serv2 = data.paddle2;
				ballPosition.x = ball.x;
				ballPosition.y = ball.y;
				ballRadius = ball.r;
				//paddle1.x = paddle_serv1.x;
				//paddle1.y = paddle_serv1.y;
				paddle2.x = paddle_serv2.x;
				paddle2.y = paddle_serv2.y;
				renderGame();
			}
			else if (data.event == 'START')
				pad_num = data.pad_num;
				start_game();
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
	//del if no need
	repl.addEventListener('click', () => {
		resetDOM();
		runAnimation();
	});


	
	// Draw ball
	function put_center()
	{
	    ctx.beginPath();
	    ctx.fillStyle = "white";
	    ctx.moveTo(width / 2, 0);
	    ctx.lineTo(width / 2, height);
	    ctx.stroke();
	}
	
	// Function to handle key 

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
		ctx.fillStyle = "#0095DD";
		ctx.fillRect(paddle2.x, paddle2.y, paddle2.w, paddle2.h);
		//ctx.fillRect(paddle1.x, paddle1.y, paddle1.w, paddle1.h);
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

	/*******************************************************************************************************/
	/*
	function sendGameStateToServer() {
		if (socket.readyState === WebSocket.OPEN) {
			const message = {
				type: 'game_state',
				ball_positionx: ballPosition.x,
				ball_positiony: ball.position.y,
				paddle1_positionx: paddleN1.position.x,
				paddle1_positiony: paddleN1.position.y,
				paddle2_positionx: paddleN2.position.x,
				paddle2_positiony: paddleN2.position.y,
			};
			socket.send(JSON.stringify(message));
		}
	}
	function coordination(x, y)
	{
		return {x:x, y:y};
	}

	function edgeCollision()
	{
		if (ball.position.y + ball.radius >= canvas.height - 20)
		{
			ball.speed.y *= -1;
		}
		if (ball.position.y - ball.radius <= 0 + 105)
		{
			ball.speed.y *= -1;
		}
		// if (ball.position.x + ball.radius >= canvas.width)
		// {
		// 	ball.speed.x *= -1;
		// }
		// if (ball.position.x - ball.radius <= 0)
		// {
		// 	ball.speed.x *= -1;	console.log("start fuction");
		// }
	}

	function paddleCollision(paddle)
	{
		if (paddle.position.y <= 80)
		{
			paddle.position.y = 100;
		}
		if (paddle.position.y + paddle.height >= canvas.height - 10)
		{
			paddle.position.y = canvas.height - paddle.height - 10;
		}
	}

	function Ballinfo(position, speed, radius, paddle1, paddle2)
	{
		this.position = position;
		this.speed = speed;
		this.radius = radius;
		this.cfalse = 0;

		this.update = function () {
			// console.log("hereeeeeee");
			this.position.x += this.speed.x;
			this.position.y += this.speed.y;
		};

		this.draw = function() {
			if (paddle1.score < 4 && paddle2.score < 4)
			{
				ctx.fillStyle = "rgba(0,0,255)";
				ctx.strokeStyle = "rgba(0,0,255)";
			}
			else
			{
				ctx.fillStyle = "red";
				ctx.strokeStyle = "red";
			}
			ctx.beginPath();
			ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
		};
	}

	const keyPressed = [];

	const key_Up_P1 = 87;
	const key_Down_P1 = 83;

	const key_Up_P2 = 38;
	const key_Down_P2 = 40;

	window.addEventListener('keydown', function(e){
		keyPressed[e.keyCode] = true;
	});

	window.addEventListener('keyup', function(e){
		keyPressed[e.keyCode] = false;
	});

	function paddleInfo(position, speed, width, height, color)
	{
		this.position = position;
		this.speed = speed;
		this.height = height;
		this.width = width;
		this.info = 0;
		this.score = 0;

		this.update = function() 
		{
			if (this.info == 1)
			{
				if (keyPressed[key_Up_P1])
				{
					this.position.y -= this.speed.y;
				}
				if (keyPressed[key_Down_P1])
				{
					this.position.y += this.speed.y;
				}
			}
			if (this.info == 2)
			{
				if (keyPressed[key_Up_P2])
				{
					this.position.y -= this.speed.y;
				}
				if (keyPressed[key_Down_P2])
				{
					this.position.y += this.speed.y;
				}
			}
		};

		this.draw = function()
		{
			ctx.fillStyle = color;
			ctx.fillRect(this.position.x , this.position.y, this.width, this.height);
		};

		this.HalfWidth = function() {
			return this.width / 2;
		};

		this.HalfHeight = function() {
			return this.height / 2;
		}

		// console.log(this.HalfHeight());

		this.center = function()
		{
			return coordination(
				this.position.x + this.HalfWidth(),
				this.position.y + this.HalfHeight(),
			);
		};
	}


	function scoring(ball, paddle1, paddle2)
	{
		if (ball.position.x <= -ball.radius)
		{
			paddle2.score += 1;
			document.getElementById("player2Score").innerHTML = paddle2.score;
			ball.position.x = canvas.width / 2;
			ball.position.y = canvas.height / 2;
			ball.speed.x *= -1;
			ball.speed.y *= -1;
		}
		if (ball.position.x >= canvas.width + ball.radius)
		{
			paddle1.score += 1;
			document.getElementById("player1Score").innerHTML = paddle1.score;
			ball.position.x = canvas.width / 2;
			ball.position.y = canvas.height / 2;
			ball.speed.x *= -1;
			ball.speed.y *= -1;
		}
	}

	function boleanCollision(ball, paddle)
	{
		paddle.up = paddle.position.y;
		paddle.bot = paddle.position.y + paddle.height;
		paddle.left = paddle.position.x;
		paddle.right = paddle.position.x + paddle.width;

		ball.up = ball.position.y - ball.radius;
		ball.bot = ball.position.y + ball.radius;
		ball.left = ball.position.x - ball.radius;
		ball.right = ball.position.x + ball.radius;

		return ball.bot > paddle.up && ball.up < paddle.bot && ball.left < paddle.right && ball.right > paddle.left;
	}


	function ballAndPaddleCollision(ball, paddle)
	{
		let dx = Math.abs(ball.position.x - paddle.center().x);
		let dy = Math.abs(ball.position.y - paddle.center().y);


		paddle.bot = paddle.position.y + paddle.height;
		paddle.up = paddle.position.y;
		paddle.left = paddle.position.x;
		paddle.right = paddle.position.x + paddle.width;

		ball.bot = ball.position.y + ball.radius;
		ball.up = ball.position.y - ball.radius;
		ball.left = ball.position.x - ball.radius;
		ball.right = ball.position.x + ball.radius;
		// console.log(dx);
		// console.log(dy);
		// if (paddle.info == 1)
		// 	{
		// 		if (paddle.position.x <= ball.position.x - ball.radius && paddle.position.y <= ball.position.y - ball.radius)
		// 		// if (boleanCollision(ball, paddle))
		// 		{
		// 		// 	console.log("heeere");
		// 			// ball.speed.x *= -1;
		// 			// ball.speed.y *= -1;
		// 		}
		// 	}
		// if (paddle.x <= )
		// if (dx <= (paddle.HalfWidth() + ball.radius) && dy <= (paddle.HalfHeight() + ball.radius))
		// {
			if (boleanCollision(ball, paddle))
			{
				// if (paddle.info == 1)
				// {
				// 	if (ball.position.x - ball.radius - ball.speed.x <= paddle.position.x + paddle.height && ball.position.y - ball.radius - ball.speed.y >= ball.position)
				// 	{

				// 	}
				// }
				ball.speed.y *= -1;
				if (ball.position.y > paddle.position.y && ball.position.y < paddle.position.y + paddle.height && ball.position.x + ball.radius >= paddle.position.x + paddle.width)
				{
					ball.speed.x *= -1;
					ball.speed.y *= -1;
				}
			}

			// ball.speed.x *= -1;
		// }

	// 	if (paddle.info = 1)
	// 	{
	// 		if (ball.position.x - ball.radius >= paddle.position.x)
	// 		{
	// 			ball.speed.x *= -1;
	// 		}
	// 	}
	}


	const paddleN1 = new paddleInfo(coordination(0, 100), coordination(10, 10), 20, 160, "red");
	paddleN1.info = 1;
	const paddleN2 = new paddleInfo(coordination(canvas.width - 20, 100), coordination(10, 10), 20, 160, "blue");
	paddleN2.info = 2;

	const ball = new Ballinfo(coordination(canvas.width / 2, canvas.height / 2), coordination(10, 10), 10, paddleN1, paddleN2);

	function gameScenery()
	{
		ctx.strokeStyle = "rgb(75,0,130)";

		ctx.beginPath();
		ctx.lineWidth = 20;
		ctx.moveTo(0,80);
		ctx.lineTo(canvas.width, 80);
		ctx.stroke();

		ctx.beginPath();
		ctx.lineWidth = 20;
		ctx.moveTo(0,canvas.height);
		ctx.lineTo(canvas.width,canvas.height);
		ctx.stroke();

		ctx.beginPath();
		ctx.lineWidth = 10;
		ctx.moveTo(canvas.width / 2,0);
		ctx.lineTo(canvas.width / 2,canvas.height);
		ctx.stroke();

		ctx.beginPath()
		ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, Math.PI * 2);
		ctx.stroke();



	}

	function updating()
	{
		ball.update();
		paddleN1.update();
		paddleN2.update();
		paddleCollision(paddleN1);
		paddleCollision(paddleN2);
		edgeCollision();
		ballAndPaddleCollision(ball, paddleN1);
		ballAndPaddleCollision(ball, paddleN2);
		scoring(ball, paddleN1, paddleN2);

		// onaciri
		sendGameStateToServer();
	}

	function drawing()
	{
		gameScenery();
		ball.draw();

		paddleN1.draw();
		paddleN2.draw();

	}

	function looping()
	{
		ctx.drawImage(img, 0, 0, canvas.width , canvas.height + 100);
		ctx.fillStyle = "rgba(0,0,0,0.2)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		window.requestAnimationFrame(looping);

		ctx.shadowColor = "rgba(255,255,255,0.8)";
		ctx.shadowBlur = 18;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		// console.log("hereeeeeee");
		updating();
		drawing();
		}*/
	});
