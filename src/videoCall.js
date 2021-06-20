const callee = localStorage.getItem("callee");
let roomID = window.location.search.substr(6, window.location.search.length - 1);
console.log(roomID);
let connection = null;
let localStream = null;
let remoteStream = null;
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
async function call() {
    //create room and save config
    const db = firebase.firestore();
    connection = new RTCPeerConnection(RTCconfig);
    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);
    const room = {
        type: offer.type,
        sdp: offer.sdp
    }
    console.log(room)
    const roomDB = await db.collection('rooms').add(room);
    roomID = roomDB.id;
    console.log(roomID);

    localStream.getTracks().forEach(track => connection.addTrack(track));

    connection.addEventListener('track', e => {
        e.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
    })
    roomDB.onSnapshot(async(snapshot) => {
        const data = snapshot.data();
        if (!connection.currentRemoteDescription && data.answer) {
            console.log('Set remote description: ', data.answer);
            const answer = new RTCSessionDescription(data.answer)
            await connection.setRemoteDescription(answer);
        }
    })

}

//start camera and microphone and inject in localVideo
async function startMedia() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    });
    remoteStream = new MediaStream();
    console.log(stream);
    localStream = stream;
    document.getElementById('localVideo').srcObject = stream;
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
async function joinRoom(roomID) {
    const db = firebase.firestore();
    let roomDB = db.collection('rooms').doc(roomID).get();
    if (roomDB.exists) {
        connection = new RTCPeerConnection(RTCconfig);

        localStream.getTracks().forEach(track => connection.addTrack(track));

        connection.addEventListener('track', e => {
            e.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
        })

    }
}
startMedia();
if (roomID === '') {
    call();
} else {
    joinRoom(roomID);
}