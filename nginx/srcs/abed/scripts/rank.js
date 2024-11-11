export const rankBtn = document.querySelector("#rank");
export const rankPart = document.querySelector("#rank-part");

import { main } from "./home.js";
import { settingPage } from "./setting.js";
import { chatPage } from "./chat.js";
import { profileId } from "./profile.js";
import { friendsPart } from "./friends.js";

export const rankFunct = () => {
    main.style.display = "none";
    settingPage.style.display = "none";
    chatPage.style.display = "none";
    profileId.style.display = "none";
    friendsPart.style.display = "none";
    rankPart.style.display = "flex";
    // document.querySelector("#online-friends").style.display = "none";
}

// rankBtn.addEventListener("click", rankFunct);