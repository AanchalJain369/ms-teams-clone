function updateContactsList(contacts, id) {
    let contentAll = "";
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
                            <button onclick='setCallee(\"" +
            contacts[i].id +
            "\")'><i class='fa fa-video-camera'></i></button>\
            <button onclick='editContact(\"" +
            i +
            "\")'><i class='fa fa-pencil'></i></button>\
            <button onclick='deleteContact(\"" +
            i +
            "\")'><i class='fa fa-trash'></i></button>\
                        </div>\
                    </div>\
                </div>";
        contentAll += content;
    }
    document.getElementById(id).innerHTML = contentAll;
}