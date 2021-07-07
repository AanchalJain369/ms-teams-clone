const callee = localStorage.getItem("callee");
let roomID = window.location.search.substr(6, window.location.search.length - 1);
console.log(roomID);
let connection = null;
let localStream = null;
let remoteStream = new MediaStream();
let remoteID = null;
let roomDB = null;
var firebaseConfig = {
    apiKey: "AIzaSyAoThvyDnMKikCSZTzd00zp0_03lekKgGs",
    authDomain: "ms-teams-clone-3687d.firebaseapp.com",
    projectId: "ms-teams-clone-3687d",
    storageBucket: "ms-teams-clone-3687d.appspot.com",
    messagingSenderId: "35666250286",
    appId: "1:35666250286:web:b24086e604e7338629adbf",
    measurementId: "G-0DKCPEVW7W"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const RTCconfig = {
    iceServers: [{
        urls: [
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
        ]
    }, ],
    iceCandidatePoolSize: 10
};

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
    localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    });
    console.log(localStream);
    localStream.getTracks().forEach(track => connection.addTrack(track, localStream));
    document.getElementById('localVideo').srcObject = localStream;
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
if (roomID === '') {
    call();
} else {
    joinRoom(roomID);
}

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
        roomDB.collection(localStorage.getItem('uid')).doc("details").set({muted:true}, {merge:true});
    }
    else {
        document.querySelector('.video .fa-microphone-slash').className = 'fa fa-microphone';
        document.querySelector('.video-controls .fa-microphone-slash').className = "fa fa-microphone";
        roomDB.collection(localStorage.getItem('uid')).doc("details").set({muted:false}, {merge:true});
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
    roomDB.collection(localStorage.getItem('uid')).doc("details").set({reaction:className}, {merge:true});
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

function onAddIceCandidate(event, candidatesCollection) {
    if (event.candidate) {
        const json = event.candidate.toJSON();
        console.log("iceCandidate", json);
        roomDB.collection(localStorage.getItem('uid')).add(json);
    }
}

function registerPeerConnectionListeners(peerConnection, remoteStream) {
    let index=null;
    peerConnection.addEventListener('icecandidate', (e) => onAddIceCandidate(e))
    peerConnection.addEventListener('icegatheringstatechange', () => {
        console.log(
            `ICE gathering state changed: ${peerConnection.iceGatheringState}`);
    });

    peerConnection.addEventListener('connectionstatechange', () => {
        switch (peerConnection.connectionState) {
            case 'connected':
                index=onConnectionStateChange();
                break;
            case 'failed':
                console.log('failed', index)
                if(index!==null) removeRemoteVideo(index, participants);
                break;
            case 'disconnected':
                break;

        }
        console.log(`Connection state change: ${peerConnection.connectionState}`, peerConnection);
    });

    peerConnection.addEventListener('signalingstatechange', () => {
        switch (peerConnection.signalingState) {
            case "stable":
                break;
        }
        console.log(`Signaling state change: ${peerConnection.signalingState}`);
    });

    peerConnection.addEventListener('iceconnectionstatechange ', () => {
        switch (peerConnection.iceConnectionState) {
            case 'complete':
                break;

        }
        console.log(
            `ICE connection state change: ${peerConnection.iceConnectionState}`);
    });
    peerConnection.addEventListener('track', e => {
        e.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
        console.log('Receiving')
    })
}