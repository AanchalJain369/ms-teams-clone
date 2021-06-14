const callee=localStorage.getItem("callee");
let localStream=null;
let remoteStream=null;
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

const RTCconfig={
    iceServers: [
        {
          urls: [
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
          ],
        },
      ],
      iceCandidatePoolSize: 10
};
async function call(){
    startMedia();
    //create room and save config
    const db=firebase.firestore();
    let connection=new RTCPeerConnection(RTCconfig);
    const offer=await connection.createOffer();
    const room={
        type:offer.type,
        sdp:offer.sdp
    }
    console.log(room)
    const roomDB=await db.collection('rooms').add(room);
    const roomID=roomDB.id;
    console.log(roomID);

    
}

//start camera and microphone and inject in localVideo
async function startMedia(){
    const stream=await navigator.mediaDevices.getUserMedia({
        video:true,
        audio:true
    });
    console.log(stream);
    localStream=stream;
    document.getElementById('localVideo').srcObject=stream;
}
call();