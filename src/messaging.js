function updateRoomsList(rooms, id) {
    let contentAll = "";
    for (let i = 0; i < rooms.length; i++) {
        let content = "<div class='contact-card' style='cursor:pointer' onclick=\"setRemoteChat('"+rooms[i].id+"')\">\
                    <div class='upper'>\
                    <div class='avatar' style=\"background-color:" +
            getAvatarColor(rooms[i].id) +
            "\">" +
            getAvatar(rooms[i].name) +
            "</div>\
                            <div class='name'>" +
            rooms[i].name +
            "</div>\
                        </div>\
                        <div class='lower'>\
                            <div></div>\
                        </div>\
                </div>";
        contentAll += content;
    }
    document.getElementById(id).innerHTML = contentAll;
}