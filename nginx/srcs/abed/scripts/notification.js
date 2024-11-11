export const notifDiv = document.querySelector("#notif");
let clicked = 0;
let parentDiv = null;

import { requestsFunction, friendsFunction } from "./friends.js";

export const notificationFunction = async (username, image) => {
    // first thing is to display the parent block which will hold all the notification elementsl;
    if (!clicked) {
        clicked = 1;
        parentDiv = document.createElement("div");
        parentDiv.id = "notifications";
            parentDiv.style.display = "flex";
        const homeNavbar = document.querySelector("#home-navbar");
        homeNavbar.insertAdjacentElement("afterend", parentDiv);
        let htmlCode = `
            <img src="${image}" alt="user image" class="request-notif">
            <h3>${username}</h3>
            <button class="btn btn-sm acc-req">accept</button>
            <button class="btn btn-sm ref-req">refuse</button>
        `;
        let trimmedHTML = document.createElement("div");
        trimmedHTML.classList.add("req-notif");
        trimmedHTML.innerHTML = htmlCode.trim();
        parentDiv.append(trimmedHTML);
        console.log(parentDiv);
    } else {
        if (parentDiv) {
            parentDiv.style.display = "none";
            parentDiv.remove();
        }
        clicked = 0;
    }
}


notifDiv.addEventListener("click", () => {
    const bellNotif = document.querySelector("#bell-notif");
    if (bellNotif) {
        bellNotif.remove();
        bellNotif.style.display = "none";
    }
    requestsFunction();
});
