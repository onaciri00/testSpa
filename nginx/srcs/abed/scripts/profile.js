export const profileButton = document.querySelector("#profile");
export const profileId = document.querySelector("#profile-part");

import { main } from "./home.js";
import {settingPage} from "./setting.js";
import { chatPage } from "./chat.js";
import { rankPart } from "./rank.js";
import { friendsPart } from "./friends.js";

export const profileFunction = (dataObj) => {
    main.style.display = "none";
    settingPage.style.display = "none";
    chatPage.style.display = "none";
    rankPart.style.display = "none";
    friendsPart.style.display = "none";
    profileId.style.display = "flex";
    if (dataObj != undefined)
    {
        if (dataObj.username != undefined) {
            document.querySelector("#us h3").innerHTML = `${dataObj.username}`;
        }
        if (dataObj.imageProfile != undefined) {
            document.querySelector("#user-picture").style.backgroundImage = `url(${dataObj.imageProfile})`;
        }
        document.querySelector("#welcome > h1").innerHTML = `Welcome ${dataObj.firstname} ${dataObj.lastname}!`;
    }
}

// profileButton.addEventListener("click", profile);