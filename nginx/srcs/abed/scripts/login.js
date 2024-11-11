
const singUp = document.querySelector("#signup");
const singIn = document.querySelector("#signin")
const one = document.querySelector("#one");
const two = document.querySelector("#two");
const three = document.querySelector("#three");

function singUp_function(event)
{
    event.preventDefault();
    one.style.display = "none";
    three.style.display = "block";
}

export function singIn_function()
{
    three.style.display = "none";
    one.style.display = "block";
}

singUp.addEventListener("click", singUp_function);
singIn.addEventListener("click", singIn_function);

import { get_csrf_token, showHome } from "./register.js";
// import { profileFunction } from "./profile.js";
import { reloadFunction } from "../script.js";
import { flag, socketFunction } from "./socket.js";
export let dataObject;

const updateData = async () => {
    if(localStorage.getItem("isLoggedIn") === "true")
    {
        try {
            const response = await fetch('/user/get_user_info/');
            if (response.ok) {
                const jsonResponse = await response.json();
                if (jsonResponse.status === "success") {
                    dataObject = jsonResponse.data;
                    reloadFunction(dataObject);
                }
            }
        } catch(err) {
            console.error(err);
        }
    }
}
updateData();

export const displayErrorMsg = (message, target, type) => {
    const userError = document.createElement("div");
    userError.classList.add("error");
    if (type === "array") {
        message.forEach(element => {
            userError.innerHTML += `${element}<br>`;
        });
    } else {
        userError.innerHTML = `${message}`;
    }
    userError.style.color = "red";
    userError.style.marginBottom = "12px";
    target.insertAdjacentElement("afterend", userError);
}

const loginForm = document.querySelector("#login-form");
const loginPassword = document.querySelector("#login-password");

const loginFunction = async (event) => {
    event.preventDefault();
    const token =  await get_csrf_token();
    const formData = new FormData(loginForm);
    const response = await fetch('/login/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': token,
        },
        body: formData
    });
    const jsonResponse = await response.json();
    if (response.ok) {
        if (jsonResponse.status === "success") {
            const sideBtns = document.querySelectorAll(".nav-button");
            sideBtns[0].classList.add('link');
            showHome(jsonResponse.data);
            localStorage.setItem('isLoggedIn', 'true');
            console.log("flag: ", flag);
            if (!flag) {
                socketFunction();
            }
        }
        return jsonResponse.data;
    }
    else {
        const existingErrors = document.querySelectorAll(".error");
        existingErrors.forEach(error => {
            error.remove();
        });
        displayErrorMsg(jsonResponse.error, loginPassword, "");
    }
}

loginForm.addEventListener("submit", loginFunction);
