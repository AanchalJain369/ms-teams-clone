const callee = localStorage.getItem("callee");
console.log(roomID);
const localUuid=localStorage.getItem('uid');
let connection = null;
let localStream = null;
let remoteStream = new MediaStream();
let remoteID = null;
let nickNames={};
let contacts=[];
let participants=[];
let connections={};
const RTCconfig = {
    iceServers: [{
        urls: [
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
        ]
    }, ],
    iceCandidatePoolSize: 20
};
const db=firebase.firestore();
const roomDB=db.collection('rooms').doc(roomID);
let lastMessageID=null;

function init(){
    Promise.all([fetchContacts(), fetchParticipants(roomID), startMedia()]).then((values)=>{
        console.log('done')
        contacts=values[0];
        contacts.forEach((contact)=>nickNames[contact['uid']]=(contact['name']===undefined?contact['email']:contact['name']))
        participants=values[1];
        roomDB.collection('messages').where("time",">=", new Date()).onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change)=>{
                if(change.type=='added'){
                    gotMessageFromServer(change.doc.data())
                }
            })
        })
        sendMessage({}, 'all')
    })
}
function sendMessage(msg, to){
    roomDB.collection('messages').add({
        from:localUuid,
        ...msg,
        to:to,
        time: new Date()
    })
}
init();

async function createdDescription(description, peerUuid){
    await connections[peerUuid].pc.setLocalDescription(description);
    
    sendMessage({sdp: {type:description.type, sdp:description.sdp}}, peerUuid)
}
function setUpPeer(peerUuid, initCall = false) {
    connections[peerUuid] = {'name':nickNames[peerUuid], 'pc': new RTCPeerConnection(RTCconfig) };
    connections[peerUuid].pc.onicecandidate = event => gotIceCandidate(event, peerUuid);
    connections[peerUuid].pc.ontrack = event => gotRemoteStream(event, peerUuid);
    connections[peerUuid].pc.oniceconnectionstatechange = event => checkPeerDisconnect(event, peerUuid);
    connections[peerUuid].pc.addStream(localStream);
   
    if (initCall) {
      connections[peerUuid].pc.createOffer().then(description => createdDescription(description, peerUuid)).catch(errorHandler);
    }
  }

function checkPeerDisconnect(event, peerUuid) {
    let state = connections[peerUuid].pc.iceConnectionState;
    console.log(`connection with peer ${peerUuid} ${state}`);
    if (state === "failed" || state === "closed" || connections[peerUuid].pc.connectionState==='failed') {
        delete connections[peerUuid];
        removeVideo(peerUuid)
        window.location.reload();
        /* updateLayout(); */
    }
}
function gotRemoteStream(event, peerUuid, screenShare=false){
    console.log(`got remote stream, peer ${peerUuid}`);
    console.log(event.streams[0])
    //assign stream to new HTML video element
    
    let video = document.getElementById(peerUuid);
    if(video==null){
        createVideo(connections[peerUuid].name, screenShare, peerUuid)
        video=document.getElementById(peerUuid);
    }
    /* event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
    video.srcObject = remoteStream; */
    video.srcObject=event.streams[0]

    /* updateLayout(); */
}

function errorHandler(error){
    console.log(error)
}
function gotMessageFromServer(signal) {
    console.log(signal)
    const signalLength=Object.keys(signal).length;
    let peerUuid = signal.from;
   
    // Ignore messages that are not for us or from ourselves
    if (peerUuid == localUuid || (signal.to != localUuid && signal.to != 'all')) return;
   
    if (signalLength==3  && signal.to == 'all') {
      // set up peer connection object for a newcomer peer
      setUpPeer(peerUuid, false);
      sendMessage({}, peerUuid);
   
    } else if (signalLength==3 && signal.to == localUuid) {
      // initiate call if we are the newcomer peer
      setUpPeer(peerUuid, true);
   
    } else if (signal.sdp) {
      connections[peerUuid].pc.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(function () {
        // Only create answers in response to offers
        if (signal.sdp.type == 'offer') {
          connections[peerUuid].pc.createAnswer().then(description => createdDescription(description, peerUuid)).catch(errorHandler);
        }
      }).catch(errorHandler);
   
    } else if (signal.ice) {
        console.log('RemoteIce Candidate', signal.ice, typeof signal.ice)
      connections[peerUuid].pc.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler);
    }
  }

async function collectRemoteIceCandidates(roomRef, peerConnection,
    localName, remoteName) {
    console.log(localName)
    console.log(remoteName)

    roomRef.collection(remoteName).onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added" && change.doc.id!=="details") {
                const candidate = new RTCIceCandidate(change.doc.data());
                peerConnection.addIceCandidate(candidate);
                console.log("RemoteiceCandidate", candidate);
            }
        });
    })
}

async function collectDetails(roomRef, remoteName, index) {
    console.log(remoteName)
    roomRef.collection(remoteName).doc("details").onSnapshot((snapshot) => {
        setDetails(index,snapshot.data());
    })
}

function setDetails(index, details){
    console.log(index)
    if(details){
        if(details.reaction){
            document.getElementsByClassName('video')[index+1].querySelector('.sub-controls i:last-child').className=details.reaction;
        }
        else{
            document.getElementsByClassName('video')[index+1].querySelector('.sub-controls i:last-child').className='';
        }
        if(details.muted){
            document.getElementsByClassName('video')[index+1].querySelector('.sub-controls i:first-child').className='fa fa-microphone-slash';
        }
        else{
            document.getElementsByClassName('video')[index+1].querySelector('.sub-controls i:first-child').className='';
        }
    }
    else{
        document.getElementsByClassName('video')[index+1].querySelector('.sub-controls i:last-child').className='';
        document.getElementsByClassName('video')[index+1].querySelector('.sub-controls i:first-child').className='';
    }
}

async function call() {
    //create room and save config
    const db = firebase.firestore();
    connection = new RTCPeerConnection(RTCconfig);
    registerPeerConnectionListeners(connection, remoteStream);
    startMedia().then(async() => {
        const offer = await connection.createOffer();
        const room = {
            offer: {
                type: offer.type,
                sdp: offer.sdp,
                id: localStorage.getItem("uid")
            }

        }
        console.log(room)
        db.collection('rooms').add(room).then(async(temp)=>{
            roomDB=temp;
            roomID = roomDB.id;
            console.log(roomID);
            await connection.setLocalDescription(offer);
            roomDB.onSnapshot(async(snapshot) => {
                const data = snapshot.data();
                if (data.answer) {
                    remoteID = data.answer.id;
                    console.log('Set remote description: ', data.answer);
                    const answer = new RTCSessionDescription(data.answer)
                    await connection.setRemoteDescription(answer);
                    await collectRemoteIceCandidates(roomDB, connection, localStorage.getItem("uid"), data.answer.id);
                }
            })
        })
    })
}

//start camera and microphone and inject in localVideo
async function startMedia() {
    if (navigator.mediaDevices.getUserMedia){
        return navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then((stream)=>{
            localStream = stream;
            document.getElementById('localVideo').srcObject = localStream;
            console.log(localStream)
        }).catch(errorHandler);
    }
    else{
        alert('Your browser does not support getUserMedia API');
    }
}

async function joinRoom(roomID) {
    const db = firebase.firestore();
    roomDB = await db.collection('rooms').doc(roomID);
    roomDB.get().then(async(doc) => {
        if (doc.exists) {
            const offer = doc.data().offer;
            remoteID = offer.id;
            console.log(offer);
            connection = new RTCPeerConnection(RTCconfig);
            registerPeerConnectionListeners(connection, remoteStream);
            await connection.setRemoteDescription(new RTCSessionDescription(offer));
            startMedia().then(async()=>{
                const answer = await connection.createAnswer();
//if aner eit 
                await connection.setLocalDescription(answer);
                const room = {
                    answer: {
                        type: answer.type,
                        sdp: answer.sdp,
                        id: localStorage.getItem("uid")
                    }
                }
                console.log(room)
                await roomDB.update(room);
                await collectRemoteIceCandidates(roomDB, connection, localStorage.getItem("uid"), offer.id);
            })
        }
    })
}
/* if (roomID === '') {
    call();
} else {
    joinRoom(roomID);
} */

function onConnectionStateChange() {
    console.log(connection.connectionState);
    let index = -1;
    for (let i = 0; i < participants.length; i++) {
        console.log(participants[i])
        console.log(remoteID)
        if (participants[i]['id'] == remoteID) {
            index = i-1;
            break;
        }
    }
    if (index == -1) {
        let participant = { id: remoteID };
        index = createRemoteVideo(participant);
        if (index === -1) {
            showAlert("danger", "Cannot add more participants. Please remove one to continue.", "fa-close");
            return;
        }
        participants[index + 1] = participant;
    }
    document.getElementById('remoteVideo' + index).srcObject = remoteStream;
    collectDetails(roomDB,remoteID, index);
    /*document.getElementById('remoteVideo' + index).playsInline = true;
    document.getElementById('remoteVideo' + index).muted = true; */
    console.log('Received and adding in remoteVideo' + index)
    return index;
}

function toggleAudio() {
    const microphone = document.querySelector('.video .fa-microphone');
    if (microphone) {
        microphone.className = "fa fa-microphone-slash";
        document.querySelector('.video-controls .fa-microphone').className = "fa fa-microphone-slash";
        roomDB.collection(localUuid).doc("details").set({muted:true}, {merge:true});
    }
    else {
        document.querySelector('.video .fa-microphone-slash').className = 'fa fa-microphone';
        document.querySelector('.video-controls .fa-microphone-slash').className = "fa fa-microphone";
        roomDB.collection(localUuid).doc("details").set({muted:false}, {merge:true});
    }

    localStream.getAudioTracks().forEach(
        track => track.enabled = !track.enabled
    );
}

function toggleVideo() {
    const camera = document.querySelector('.video-controls i.fa.fa-video-camera')
    if (camera.style.display !== 'none') {
        camera.style.display = 'none';
        document.querySelector('.video-controls .fa.fa-video-camera-slash').style.display = 'inline';
    } else {
        camera.style.display = 'inline';
        document.querySelector('.video-controls .fa.fa-video-camera-slash').style.display = 'none';
    }

    localStream.getVideoTracks().forEach(
        track => track.enabled = !track.enabled
    );
}

function toggleReaction(className){
    document.querySelector('.sub-controls i:last-child').className=className;
    document.querySelector('.video-controls .dropdown i').className=className;
    roomDB.collection(localUuid).doc("details").set({reaction:className}, {merge:true});
}

async function shareScreen(index) {
    try {
        if (!navigator.mediaDevices | typeof(navigator.mediaDevices.getDisplayMedia !== 'function')) {
            showAlert("danger", "Action not supported on this device.", "fa-close");
            return;
        }
        const screenStream = await navigator.mediaDevices.getDisplayMedia();
        document.getElementById('remoteVideo' + index).srcObject = screenStream;
        screenStream.getVideoTracks()[0].onended = () => removeRemoteVideo(index, participants);
    } catch (e) {
        removeRemoteVideo(index, participants);
    }
}

function gotIceCandidate(event, peerUuid) {
    if (event.candidate) {
        sendMessage({'ice': event.candidate.toJSON()}, peerUuid);
        console.log("iceCandidate", event.candidate);
    }
}

function registerPeerConnectionListeners(peerConnection, remoteStream) {
    let index=null;
    /* peerConnection.addEventListener('icecandidate', (e) => gotIceCandidate(e)) */
    peerConnection.addEventListener('icegatheringstatechange', () => {
        console.log(
            `ICE gathering state changed: ${peerConnection.iceGatheringState}`);
    });

    peerConnection.addEventListener('connectionstatechange', () => {
        /* switch (peerConnection.connectionState) {
            case 'connected':
                index=onConnectionStateChange();
                break;
            case 'failed':
                console.log('failed', index)
                if(index!==null) removeRemoteVideo(index, participants);
                break;
            case 'disconnected':
                break;

        } */
        console.log(`Connection state change: ${peerConnection.connectionState}`, peerConnection);
    });

    peerConnection.addEventListener('signalingstatechange', () => {
        /* switch (peerConnection.signalingState) {
            case "stable":
                break;
        } */
        console.log(`Signaling state change: ${peerConnection.signalingState}`);
    });

    peerConnection.addEventListener('iceconnectionstatechange ', () => {
        /* switch (peerConnection.iceConnectionState) {
            case 'complete':
                break;

        } */
        console.log(
            `ICE connection state change: ${peerConnection.iceConnectionState}`);
    });
    /* peerConnection.addEventListener('track', e => {
        e.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
        console.log('Receiving')
    }) */
}