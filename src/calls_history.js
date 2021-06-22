function updateHistory(history, id) {
    let contentAll = "";
    for (let i = 0; i < history.length; i++) {
        let content = "<div class='contact-card'>\
                    <div class='upper'>\
                            <div class='avatar' style=\"background-color:" +
            getAvatarColor(history[i].name) +
            "\">" +
            getAvatar(history[i].name) +
            "</div>\
                            <div class='name'>" +
            history[i].name +
            "</div>\
                        </div>\
                    <div class='lower'>\
                        <span class='time'>" +
            history[i].start_time +
            "</span>\
            <div>\
                            <button class='btn' onclick='setCallee(\"" +
            history[i].id +
            "\")'><i class='fa fa-video-camera'></i></button>\
                        </div>\
                    </div>\
                </div>";
        contentAll += content;
    }
    document.getElementById(id).innerHTML = contentAll;
}