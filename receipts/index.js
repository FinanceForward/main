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
    // if (user['premium'] == undefined) {
    //     alert('You need to be a premium user to access this feature');
    //     return location.href = '../dashboard'
    // };
    user['c_categories'].forEach(c_category =>{
        CATdict[c_category] = c_category
    })
    let m = new Date().toISOString().slice(0, 7);
    let rlist = user['receipts'][m] || [];
    rlist.forEach((receipt) => {
        let li = document.createElement('li')
        li.innerHTML = `<strong>${CATdict[receipt[1]] || `Marked as OTHER <small>(Used to be custom category)</small>`}</strong> - ${receipt[0]} - <button onclick="removeReceipt(${receipt[1]}, ${receipt[0]}, null)">Remove Receipt</button>`
        rlistOBJ.appendChild(li)
    })
})

function removeReceipt(catID, total, month) {
    console.log(`Removing A Receipt Under Category "${CATdict[catID]}" For A Total Amount Of "${total}" On The Month Of "${month}"`)
}