import { get_csrf_token } from "./register.js";
import { socket, flag } from "./socket.js";
export let isLogOut = 0;

export const logoutBtn = document.querySelector("#logout");

export const logoutFuntion = async (event) => {
    event.preventDefault();
    try {
        const token = await get_csrf_token();
        const response = await fetch('/logout/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': token, // Include the CSRF token
            },
        });
        if (response.ok) {
            const jsonResponse = await response.json();
            if (jsonResponse.status === "success") {
                showLogin();
                if (flag) {
                    socket.close();
                }
                localStorage.clear();
            }
            return jsonResponse;
        }
    }
    catch(err) {
        console.error(err);
    }
}
logoutBtn.addEventListener("click", logoutFuntion);

import { singIn_function } from "./login.js";

export const showLogin = ()=> {
    document.querySelector("#login-parent").style.display = "flex";
    document.querySelector("#full-container").style.display = "none";
    singIn_function();
}