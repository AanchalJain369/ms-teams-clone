function getAvatar(name){
    let avatar=name[0].toUpperCase();
    let index=name.indexOf(' ');
    if(index!=-1) avatar+=name[index+1].toUpperCase();
    return avatar;
}

function search(data, searchString){
    searchString = searchString.toLowerCase();
    for (const key in data) {
        let x = String(data[key]).toLowerCase();
        if (x.includes(searchString)) return true;
    }
    return false;
}

function filter(data, searchString){
    let updates=[];
    for(let i=0;i<data.length;i++){
        if(search(data[i], searchString)){
            updates.push(data[i]);
        }
    }
    return updates;
}

function formToJSON(form){
    let res={};
    let formData=new FormData(form);
    console.log(formData)
    formData.forEach((val,key)=>res[key]=val);
    return res;
}