function updateAddParticipants(id, participants) {
    let contentAll = '';
    for (let i = 0; i < participants.length; i++) {
        let content = `<div class='contact-card'>
            <div class='upper'>
                <div>\
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

function createParticipantCard(participant) {
        let content = `<div id="${"participant"+participant.docID}" class="contact-card">
            <div class='upper'>
                    <div class='avatar' style="background-color: ${getAvatarColor(nickNames[participant.id]===undefined?"Unknown":nickNames[participant.id])}">
            ${getAvatar(nickNames[participant.id]===undefined?"Unknown":nickNames[participant.id])}
            </div>
                    <span class='name'>
            ${nickNames[participant.id]===undefined?"Unknown":nickNames[participant.id]}
            </span>
                </div>
                <div class='lower'>
                    ${localStorage.getItem('uid')!==participant.id?`<button onclick='removeParticipant("${participant.id}", "${participant.docID}")'>Remove <i class='fa fa-close'></i> </button>`:""}
               </div>
            </div>`;
    return content;
}

function createRoomCard(room) {
        let content = `<div class='contact-card' id=${"room"+room.id} style='cursor:pointer' onclick="setRemoteChat('${room.id}', '${room.name}')">
                    <div class='upper'>
                    <div class='avatar' style="background-color:
            ${getAvatarColor(room.id)}">
            ${getAvatar(room.name)}</div>
                    <div class='name'> ${room.name}</div>
                        </div>
                        <div class='lower'>
                            <div></div>
                        </div>
                </div>`;
        
    return content;
}