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
                </div></div>\
                <div class='lower'>\
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

function createRemoteVideo(participant) {
    let videos = document.getElementById('videos');
    let i = videos.children.length - 1;
    if (i >= 3) return -1;
    let newVideo = document.createElement('div');
    newVideo.className = 'video';
    newVideo.innerHTML = "<video id='remoteVideo" + i + "' autoplay playsinline></video>\
    <div class='sub-controls'>\
        <i class='fa fa-thumb-tack'></i>\
    </div>\
    <div class='name'>" + (participant.screen ? "(Presenting) " : "") + participant.name + "</div>";
    videos.appendChild(newVideo);
    return i;
}

function removeRemoteVideo(index, participants) {
    document.getElementById('videos').children[index + 1].remove();
    participants.splice(index + 1, 1);
    console.log(participants);
}