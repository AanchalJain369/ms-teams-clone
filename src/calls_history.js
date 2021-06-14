function updateHistory(history, id){
    let contentAll="";
    for(let i=0;i<history.length;i++){
        let content="<div class='contact-card'>\
                    <div class='upper'>\
                        <div>\
                            <div class='avatar'>"+
                                getAvatar(history[i].name)+
                                "</div>\
                            <span class='name'>"+
                                history[i].name+
                                "</span>\
                        </div>\
                        <div>\
                            <button onclick='setCallee(\""+
                                history[i].name+
                                "\")'><i class='fa fa-video-camera'></i></button>\
                            <button><i class='fa fa-phone'></i></button>\
                        </div>\
                    </div>\
                    <div class='lower'>\
                        <span class='time'>"+
                            history[i].start_time
                        +"</span>\
                    </div>\
                <div>";
        contentAll+=content;
    }
    document.getElementById(id).innerHTML=contentAll;
}