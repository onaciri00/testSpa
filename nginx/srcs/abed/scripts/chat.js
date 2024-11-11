export const chatButton = document.querySelector("#chat");
export const chatPage = document.querySelector("#chat-part");

import { profileId } from "./profile.js";
import { main } from "./home.js";
import {settingPage} from "./setting.js";
import { rankPart } from "./rank.js";
import { friendsPart } from "./friends.js";

export const chatFunction = () => {
    // document.querySelector("#online-friends").style.display = "none";
    profileId.style.display = "none";
    main.style.display = "none";
    settingPage.style.display = "none";
    rankPart.style.display = "none";
    friendsPart.style.display = "none";
    chatPage.style.display = "block";
}

// chatButton.addEventListener("click", chatFunction);

const data_example = async() => { // get characters.
    try {
        const data = await fetch("https://dattebayo-api.onrender.com/characters");
        if (data.ok)
        {
            const json_data = await data.json();
            return json_data.characters;
        }
    } catch (err) {
        console.error(err);
    }
}

const container = document.querySelector("#msgs");

const scrollToBottom = ()=> {
    container.scrollTop = container.scrollHeight;
    
}

const data_characters = async () => {
    const characters = await data_example();
    const chats1 = document.querySelector("#chats");
    const chats2 = document.querySelector("#chats2");

    characters.forEach(character => {
        const user = document.createElement("div");
        const user2 = document.createElement("div");

        user.innerHTML = character.name;
        user2.innerHTML = character.name;

        chats1.appendChild(user);
        chats2.appendChild(user2);

        const handleUserClick = (userElement) => {
            const users = document.querySelectorAll("#chats div, #chats2 div");
            users.forEach(userr => {
                userr.classList.remove("selected-user");
                userr.style.width = "90%";
                userr.style.boxShadow = "0 0 5px #0e2c2e";
            });
            userElement.style.width = "95%";
            userElement.style.boxShadow = "0 0 5px #9bf9ff";
            userElement.classList.add("selected-user");
            document.querySelector("#chat-pic").style.backgroundImage = `url("${character.images[0]}")`;
            document.querySelector("#secondd h3").innerHTML = character.name;
        };

        user.addEventListener("click", () => handleUserClick(user));
        user2.addEventListener("click", () => handleUserClick(user2));
    });
};

const sendMsg = document.querySelector("#something");

const frontChat = (event)=> {
    if (event.key === "Enter" && sendMsg.value != "") {
        if (sendMsg.value != "friend" && sendMsg.value != "alaykum salam") {
            const msg = document.createElement("div");
            msg.classList.add("my-msg");
            document.querySelector("#msgs").appendChild(msg);
            msg.innerHTML = `${sendMsg.value}`;
            sendMsg.value = "";
            scrollToBottom();
        } else {
            const msg = document.createElement("div");
            document.querySelector("#msgs").appendChild(msg);
            msg.classList.add("friend-msg");
            msg.innerHTML = `${sendMsg.value}`;
            sendMsg.value = "";
            scrollToBottom();
        }
    }
}

const frontChat2 = (event)=> {
    if (sendMsg.value != "") {
        if (sendMsg.value != "friend" && sendMsg.value != "alaykum salam") {
            const msg = document.createElement("div");
            msg.classList.add("my-msg");
            document.querySelector("#msgs").appendChild(msg);
            msg.innerHTML = `${sendMsg.value}`;
            sendMsg.value = "";
            scrollToBottom();
        } else {
            const msg = document.createElement("div");
            document.querySelector("#msgs").appendChild(msg);
            msg.classList.add("friend-msg");
            msg.innerHTML = `${sendMsg.value}`;
            sendMsg.value = "";
            scrollToBottom();
        }
    }
}

sendMsg.addEventListener("keyup", frontChat);
const sendMsgBtn = document.querySelector("#input-group-text-chat");
sendMsgBtn.addEventListener("click", frontChat2);

data_characters();
