const callee = localStorage.getItem("callee");
let roomID = window.location.search.substr(6, window.location.search.length - 1);
console.log(roomID);
let connection = null;
let localStream = null;
let remoteStream = null;
let remoteId = null;
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
        ],
    }, ],
    iceCandidatePoolSize: 10
};

async function collectIceCandidates(roomRef, peerConnection,
    localName, remoteName) {
    console.log(localName)
    console.log(remoteName)

    roomRef.collection(remoteName).onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                const candidate = new RTCIceCandidate(change.doc.data());
                peerConnection.addIceCandidate(candidate);
                console.log("RemoteiceCandidate", candidate);
            }
        });
    })
}
async function call() {
    //create room and save config
    const db = firebase.firestore();
    connection = new RTCPeerConnection(RTCconfig);
    registerPeerConnectionListeners(connection);
    /* connection.addEventListener('connectionstatechange', (e) => onConnectionStateChange(e)) */
    startMedia().then(async() => {
        const offer = await connection.createOffer();
        await connection.setLocalDescription(offer);
        const room = {
            offer: {
                type: offer.type,
                sdp: offer.sdp,
                id: localStorage.getItem("id")
            }

        }

        console.log(room)
        const roomDB = await db.collection('rooms').add(room);
        roomID = roomDB.id;
        console.log(roomID);

        console.log("Adding IceCandidatesto DB", iceCandidates.length)
        const candidatesCollection = roomDB.collection(localStorage.getItem('id'));
        while (iceCandidates.length) {
            candidatesCollection.add(iceCandidates.pop());
        }
        console.log("remaining", iceCandidates.length);

        /* connection.addEventListener('track', e => {
            console.log(e.streams[0])
            e.streams[0].getTracks().forEach(track => remoteStream.addTrack(track))
        }) */
        roomDB.onSnapshot(async(snapshot) => {
            const data = snapshot.data();
            if (!connection.currentRemoteDescription && data.answer) {
                remoteId = data.answer.id;
                console.log('Set remote description: ', data.answer);
                const answer = new RTCSessionDescription(data.answer)
                await connection.setRemoteDescription(answer);
                await collectIceCandidates(roomDB, connection, localStorage.getItem("id"), data.answer.id);

            }
        })
    })
}

//start camera and microphone and inject in localVideo
async function startMedia() {
    localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    });
    remoteStream = new MediaStream();
    console.log(localStream);
    localStream.getTracks().forEach(track => connection.addTrack(track, localStream));
    document.getElementById('localVideo').srcObject = localStream;
}
async function joinRoom(roomID) {
    const db = firebase.firestore();
    let roomDB = await db.collection('rooms').doc(roomID);
    roomDB.get().then(async(doc) => {
        if (doc.exists) {
            const offer = doc.data().offer;
            console.log(offer);
            connection = new RTCPeerConnection(RTCconfig);
            registerPeerConnectionListeners(connection);
            await startMedia();
            await connection.setRemoteDescription(offer);

            const answer = await connection.createAnswer();


            await connection.setLocalDescription(answer);
            const room = {
                answer: {
                    type: answer.type,
                    sdp: answer.sdp,
                    id: localStorage.getItem("id")
                }
            }
            console.log(room)
            console.log("Adding IceCandidatesto DB", iceCandidates.length)
            const candidatesCollection = roomDB.collection(localStorage.getItem('id'));
            while (iceCandidates.length) {
                candidatesCollection.add(iceCandidates.pop());
            }
            console.log("remaining", iceCandidates.length);

            await roomDB.set(room);
            await collectIceCandidates(roomDB, connection, localStorage.getItem("id"), offer.id);
            remoteId = offer.id;
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
    let index = createRemoteVideo({ id: remoteId });

    document.getElementById('remoteVideo' + index).srcObject = remoteStream;
    /*document.getElementById('remoteVideo' + index).playsInline = true;
    document.getElementById('remoteVideo' + index).muted = true; */
    console.log('Received and adding in remoteVideo' + index)
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
let iceCandidates = [];

function onAddIceCandidate(event, candidatesCollection) {
    if (event.candidate) {
        const json = event.candidate.toJSON();
        iceCandidates.push(json);
        console.log("iceCandidate", json);
    }
}

function registerPeerConnectionListeners(peerConnection) {
    peerConnection.addEventListener('icecandidate', (e) => onAddIceCandidate(e))
    peerConnection.addEventListener('icegatheringstatechange', () => {
        console.log(
            `ICE gathering state changed: ${peerConnection.iceGatheringState}`);
    });

    peerConnection.addEventListener('connectionstatechange', () => {
        console.log(`Connection state change: ${peerConnection.connectionState}`);
    });

    peerConnection.addEventListener('signalingstatechange', () => {
        switch (peerConnection.signalingState) {
            case "stable":
                onConnectionStateChange();
        }
        console.log(`Signaling state change: ${peerConnection.signalingState}`);
    });

    peerConnection.addEventListener('iceconnectionstatechange ', () => {
        console.log(
            `ICE connection state change: ${peerConnection.iceConnectionState}`);
    });
    peerConnection.addEventListener('track', e => {
        e.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
        console.log('Receiving')
    })
}