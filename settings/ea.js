function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// sha256 hash function
async function sha256(message) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);                    

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string                  
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}
// end sha256 hash function

async function updateAccount(email, pass) {
    let oldhash = getCookie('hash');
    let newhash = await sha256(email + pass);
    DB.u.update(oldhash, { hash: newhash });
    alert("Account updated successfully!");
}

function confirmDelete(type) {
    document.getElementById('confirmationDialog').style.display = 'block';
    let message = type === 'data' ? 
        "Are you sure you want to delete your account data? This action will erase all your stored data but keep your account." :
        "Are you sure you want to delete your account? This action will permanently delete your account and all associated data.";
    document.getElementById('confirmationMessage').innerText = message;
}

function cancelDelete() {
    document.getElementById('confirmationDialog').style.display = 'none';
}

function proceedDelete() {
    let type = document.getElementById('confirmationMessage').innerText.includes('keep') ? 'data' : 'account';
    alert(`Deleting ${type === 'data' ? 'data' : 'account'}. This action cannot be undone.`);
    DB.u.delete(hash)
    let hash = getCookie('hash')
    if (type == 'account') {
        DB.u.create(hash)
    }
    document.getElementById('confirmationDialog').style.display = 'none';
}

document.getElementById('editForm').addEventListener('submit', function(event) {
    event.preventDefault();
    alert("Email updated successfully!");
    // Here you would handle the actual email update
});

let name = "hash=";
let ca = decodeURIComponent(document.cookie).split(';');
for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
    c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
        if (getCookie('hash') != '') {
            document.querySelector('.sign-in').style.display = 'none';
        }
    }
}