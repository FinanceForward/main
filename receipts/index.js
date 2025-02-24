function getCookie(name) {
    let cookieArr = document.cookie.split(";");
    for(let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");
        if(name == cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}

let rlistOBJ = document.querySelector('ul')
let CATdict = {
    "a": "Groceries",
    "b": "Food Out",
    "c": "Snacks",
    "d": "Kitchenware",
    "e": "Bathroomware",
    "f": "Livingware",
    "g": "Appliances",
    "h": "Gardenware",
    "i": "Bills/Subcriptions",
    "j": "Pets",
    "k": "Health",
    "l": "Books",
    "other": "OTHER"
  }
DB.u.get(getCookie('hash')).then((user) => {
    if (user == undefined) return location.href = '../sign-in';
    if (user['premium'] == undefined) {
        alert('You need to be a premium user to access this feature');
        return location.href = '../dashboard'
    };
    let m = new Date().toISOString().slice(0, 7);
    let rlist = user['receipts'][m] || [];
    rlist.forEach((receipt) => {
        let li = document.createElement('li')
        li.innerHTML = `<strong>${CATdict[receipt[1]]}</strong> - ${receipt[0]}`
        rlistOBJ.appendChild(li)
    })
})