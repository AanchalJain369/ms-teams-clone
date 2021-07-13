function updateAddParticipants(id, participants) {
    let contentAll = '';
    for (let i = 0; i < participants.length; i++) {
        let content = `<div class='contact-card'>
            <div class='upper'>
                <div>
                    <div class='avatar' style="background-color: ${getAvatarColor(participants[i].name)}">
            ${getAvatar(participants[i].name)}
            </div>
                    <span class='name'>
            ${participants[i].name}
            </span>
                </div></div>
               <div class='lower'>
                    <button onclick='sendInvite("${participants[i].uid}")'>Invite <i class='fa fa-plus'></i> </button>
               </div>
            </div>
        </div>`;
        contentAll += content;
    }
    if(participants.length==0)contentAll="<div style='text-align:center'><i>No Participants to add.<br/>Add contacts.</i></div>"
    document.getElementById(id).innerHTML = contentAll;
}

function createVideo(name, screen, id) {
    let videos = document.getElementById('videos');
    let i = videos.children.length - 1;
    if (i >= 3) return -1;
    let newVideo = document.createElement('div');
    newVideo.id=id+'video';
    newVideo.className = 'video';
    newVideo.innerHTML = "<video id='" + id + "' autoplay playsinline></video>\
    <div class='sub-controls'>\
        <i class='fa fa-microphone-slash'></i>\
        <i class='fa fa-frown-o'></i>\
    </div>\
    <div class='name'>" + (screen ? "(Presenting) " : "") + name + "</div>";
    videos.appendChild(newVideo);
    return i;
}

function removeVideo(id) {
    document.getElementById(id+'video').remove();
}