function updateContactsList(contacts, id) {
    let contentAll = "";
    for (let i = 0; i < contacts.length; i++) {
        let content = `<div class='contact-card'>
                    <div class='upper'>
                        <div class='avatar' style="background-color: ${getAvatarColor(contacts[i].name)}">
                            ${getAvatar(contacts[i].name)}
                        </div>
                        <div class='name'>
                            ${contacts[i].name}
                        </div>
                    </div>
                        <div class='lower'>
                            <div></div>
                            <div>
                                <button class='btn' onclick='editContact("${contacts[i].id}")'><i class='fa fa-pencil'></i></button>
                                <button class='btn' onclick='deleteContact("${contacts[i].id}")'><i class='fa fa-trash'></i></button>
                            </div>
                        </div>
                    </div>`;
        contentAll += content;
    }
    if(contacts.length==0)contentAll="<div style='text-align:center'><i>No Contacts added.</i></div>"
    document.getElementById(id).innerHTML = contentAll;
}
/* 
<button class='btn' onclick='setCallee(\"" +
            contacts[i].roomID +
            "\")'><i class='fa fa-commenting'></i></button>\
            <button class='btn' onclick='setCallee(\"" +
            contacts[i].roomID +
            "\")'><i class='fa fa-video-camera'></i></button>\ */