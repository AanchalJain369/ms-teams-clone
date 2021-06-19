function showAddParticipants(id) {
    let contentAll = '';
    for (let i = 0; i < contacts.length; i++) {
        let content = "<div class='contact-card'>\
            <div class='upper'>\
                <div>\
                    <div class='avatar'>" +
            getAvatar(contacts[i].name) +
            "</div>\
                    <span class='name'>" +
            contacts[i].name +
            "</span>\
                </div>\
                <div>\
                    <button onclick='sendInvite(\"" +
            contacts[i].id +
            "\")'><i class='fa fa-video-camera'></i> Invite</button>\
               </div>\
            </div>\
        </div>";
        contentAll += content;
    }
    document.getElementById(id).innerHTML = contentAll;
}

function updateParticipants(participants) {
    let contentAll = '';
    let id = 'participantsList';
    for (let i = 0; i < participants.length; i++) {
        let content = "<div class='contact-card'>\
            <div class='upper'>\
                <div>\
                    <div class='avatar'>" +
            getAvatar(participants[i].name) +
            "</div>\
                    <span class='name'>" +
            participants[i].name +
            "</span>\
                </div>\
                <div>\
                <button onclick='pinToScreen(\"" +
            participants[i].id +
            "\")'><i class='fa fa-thumb-tack'></i></button>\
                    <button onclick='removeParticipant(\"" +
            participants[i].id +
            "\")'>Remove <i class='fa fa-close'></i> </button>\
               </div>\
            </div>\
        </div>";
        contentAll += content;
    }
    document.getElementById(id).innerHTML = contentAll;
}

function createRemoteVideo() {
    let videos = document.getElementById('videos');
    let i = videos.children.length - 1;
    if (i >= 3) return -1;
    let newVideo = document.createElement('video');
    newVideo.setAttribute('autoplay', true);
    newVideo.id = 'remoteVideo' + i;
    videos.appendChild(newVideo);
    return i;
}

function removeRemoteVideo(index, participants) {
    document.getElementById('remoteVideo' + index).remove();
    participants.splice(index + 1, 1);
    console.log(participants);
}