export const settingButton = document.querySelector("#setting");
export const settingPage = document.querySelector("#setting-part");

import { profileId } from "./profile.js";
import { main } from "./home.js";
import { chatPage } from "./chat.js";
import { rankPart } from "./rank.js";
import { friendsPart } from "./friends.js";

export const settingFunction = (dataObj) => {
    profileId.style.display = "none";
    main.style.display = "none";
    chatPage.style.display = "none";
    rankPart.style.display = "none";
    friendsPart.style.display = "none";
    settingPage.style.display = "block";
    // document.querySelector("#online-friends").style.display = "none";
    // alert(dataObj);
    if (dataObj != undefined)
    {
        document.querySelector("#first-container h5").innerHTML = `${dataObj.firstname} ${dataObj.lastname}`;
        if (dataObj.imageProfile != undefined) {
            document.querySelector("#setting-pic").style.backgroundImage = `url(${dataObj.imageProfile})`;
        }
        if (dataObj.email != undefined) {
            // alert("dont enter.");
            document.querySelector("#first-container p").innerHTML = `${dataObj.email}`;
        }
    }
}

// settingButton.addEventListener("click", settingFunction);

// nav manipulation style.
const settingNavBtn = document.querySelectorAll(".setting-nav-btn");
settingNavBtn[0].classList.add('styled-nav-btn');

settingNavBtn.forEach ((frdNavBtn)=> {
    frdNavBtn.addEventListener("click", (event)=> {
        settingNavBtn.forEach (frdNavBtn => {frdNavBtn.classList.remove('styled-nav-btn')});
        frdNavBtn.classList.add('styled-nav-btn');
    })
});

const profileSetting = document.querySelector("#profile-setting");
const logSec = document.querySelector("#log-sec");
const general = document.querySelector("#general");

settingNavBtn[0].addEventListener("click", (event)=> {
    profileSetting.style.display = "flex";
    general.style.display = "none";
    logSec.style.display = "none";
})

settingNavBtn[1].addEventListener("click", ()=> {
    profileSetting.style.display = "none";
    general.style.display = "none";
    logSec.style.display = "flex";
})

settingNavBtn[2].addEventListener("click", ()=> {
    profileSetting.style.display = "none";
    general.style.display = "flex";
    logSec.style.display = "none";
})

// upload button logic;

const uploadBtn = document.querySelector("#change-img");
const fileInput = document.querySelector("#file-input");

uploadBtn.addEventListener("click", ()=> {
    fileInput.click();
})

