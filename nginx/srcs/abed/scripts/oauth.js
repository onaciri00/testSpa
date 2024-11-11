import { get_csrf_token, showHome } from "./register.js";
import { flag, socketFunction } from "./socket.js";
const oauthFunction = async (event)=> {
    event.preventDefault(); // Prevent the default form submission
    const response = await fetch('/oauth/');
    console.log(response.ok);
    if (response.ok) {
        const jsonResponse = await response.json();
        if (jsonResponse.status == 'success') {
            location.href = jsonResponse.full_authoriztion_url; // redirect to a new url; (which is intra url);
        }
    }
    else {
        console.error("error happened.");
    }
}

const intraBtn = document.querySelector('.intra');
intraBtn.addEventListener('click', oauthFunction);
const oauthCallback = async ()=> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) 
    {
        let token = await get_csrf_token();
        // console.log(`token is: ${token}`);
        let response = await fetch('/oauth/callback/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': token,
            },
            body: JSON.stringify({ code: code })
        })
        if (response.ok) {
            const jsonResponse = await response.json();
            console.log('status ==> ', jsonResponse.status )
            if (jsonResponse.status == 'success') {
                const sideBtns = document.querySelectorAll(".nav-button");
                sideBtns[0].classList.add('link');
                showHome(jsonResponse.data);
                localStorage.setItem('isLoggedIn', 'true');
                if (!flag) {
                    socketFunction();
                }
            }
        }
        else {
            console.error('Error:', error);
        }
    }
}
oauthCallback();
