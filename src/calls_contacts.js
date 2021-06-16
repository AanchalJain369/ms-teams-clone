function updateContactsList(contacts, id){
    let contentAll="";
    for(let i=0;i<contacts.length;i++){
        let content="<div class='contact-card'>\
                    <div class='upper'>\
                        <div>\
                            <div class='avatar'>"+
                                getAvatar(contacts[i].name)+
                                "</div>\
                            <span class='name'>"+
                                contacts[i].name+
                                "</span>\
                        </div>\
                        <div>\
                            <button onclick='setCallee(\""+
                                contacts[i].name+
                                "\")'><i class='fa fa-video-camera'></i></button>\
                            <button><i class='fa fa-phone'></i></button>\
                        </div>\
                    </div>\
                </div>";
        contentAll+=content;
    }
    document.getElementById(id).innerHTML=contentAll;
}