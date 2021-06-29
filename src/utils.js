function showAlert(type, msg, iconClass) {
    let alert = document.getElementById('alert')
    alert.children[0].innerHTML = msg;
    alert.className = "alert alert-" + type;
    alert.children[1].children[0].className = "fa " + iconClass;
    alert.style.display = 'block';
    setTimeout(() => alert.classList.add('fadeOut'), 2000);
    setTimeout(() => alert.style.display = 'none', 3000);
}

function getAvatar(name) {
    let avatar = name[0].toUpperCase();
    let index = name.indexOf(' ');
    if (index != -1) avatar += name[index + 1].toUpperCase();
    return avatar;
}

function search(data, searchString) {
    searchString = searchString.toLowerCase();
    for (const key in data) {
        let x = String(data[key]).toLowerCase();
        if (x.includes(searchString)) return true;
    }
    return false;
}

function filter(data, searchString) {
    let updates = [];
    for (let i = 0; i < data.length; i++) {
        if (search(data[i], searchString)) {
            updates.push(data[i]);
        }
    }
    return updates;
}

function formToJSON(form) {
    let res = {};
    let formData = new FormData(form);
    formData.forEach((val, key) => res[key] = val);
    return res;
}

function JSONToForm(data) {
    let formData = new FormData();
    for (let key in data) {
        formData.append(key, data[key]);
    }
    return formData;
}

function toggleVisibility(id, displayType) {
    let element = document.getElementById(id);
    if (element.style.display === '' | element.style.display === 'none') {
        element.style.display = displayType;
    } else element.style.display = 'none';
}

function hexToRGB(h) {
    let r = 0,
        g = 0,
        b = 0;
    r = "0x" + h[1] + h[2];
    g = "0x" + h[3] + h[4];
    b = "0x" + h[5] + h[6];
    return "rgb(" + +r + "," + +g + "," + +b + ")";
}

function getAvatarColor(name) {
    const colors = ["#64DFDF", "#F9F871", "#F48B29", "#FB3640", "#E93B81", "#F5ABC9", "#FBC6A4", "#FF8882", "#51C4D3"];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return hexToRGB(colors[sum % (colors.length)]);
}

function logout(){
    firebase.auth().signOut().then(() => {
        localStorage.removeItem('user');
        location.href="/login.html";
    }).catch((error) => {
        console.log(error)
    });
}