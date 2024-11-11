import { reloadFunction } from "../script.js";
import { get_csrf_token } from "./register.js";


export const profileAlert2 = (status, jsonData)=> {
    if (status === "success") {
        reloadFunction(jsonData);
        document.querySelector("#update-alert2").style.display = "none";
    } else{
        document.querySelector("#passwordHelpBlock").style.display = "none";
        document.querySelector("#update-alert-failed2").style.display = "none";
    }
}

const updatePasswordForm = document.querySelector("#password-form");

const updatePassword = async (event)=> {
    event.preventDefault();
    const formData = new FormData(updatePasswordForm);
    const token = await get_csrf_token();
    const response = await fetch('/user/ChangePass/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': token,
        },
        body: formData
    });
    if (response.ok) {
        const jsonResponse = await response.json();
        if (jsonResponse.status === "success") {
            document.querySelector("#passwordHelpBlock").style.display = "none";
            document.querySelector("#update-alert2").style.display = "block";
            setTimeout(() => profileAlert2("success", jsonResponse.data), 3000);
        } else if (jsonResponse.status === "bad-username") {
            document.querySelector("#update-alert-failed2").style.display = "block";
            setTimeout(() => profileAlert2("failed", jsonResponse.data), 3000);
        }
        else {
            document.querySelector("#passwordHelpBlock").style.display = "block";
            setTimeout(() => profileAlert2("failed", jsonResponse.data), 10000);
        }
        return jsonResponse.data;
    }
};

updatePasswordForm.addEventListener("submit", updatePassword);