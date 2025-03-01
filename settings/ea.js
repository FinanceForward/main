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
    let currency = document.getElementById('currency').value;
    DB.u.update(oldhash, { hash: newhash, currency: currency });
    document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
    document.cookie = `hash=${newhash}`;
    setTimeout(() => {
        location.href = '../sign-in';
    }, 500);
}

function signout() {
    document.getElementById('confirmationDialog').style.display = 'block';
    document.getElementById('confirm-delete-account').style.display = 'none';
    document.getElementById('confirm-sign-out').style.display = 'block';
}

function deleteAccount() {
    document.getElementById('confirmationDialog').style.display = 'block';
    document.getElementById('confirm-delete-account').style.display = 'block';
    document.getElementById('confirm-sign-out').style.display = 'none';
}

function cancel() {
    document.getElementById('confirm-delete-account').style.display = 'block';
    document.getElementById('confirm-sign-out').style.display = 'block';
    document.getElementById('confirmationDialog').style.display = 'none';
}

function proceed() {
    let type = document.getElementById('confirm-delete-account').style.display === 'block' ? 'account-delete' : 'sign-out';
    let hash = getCookie('hash')
    if (type === 'account-delete') {
        // delete account
        DB.u.delete(hash);
    }
    // clear cookies
    document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
    location.href = '../';
    document.getElementById('confirmationDialog').style.display = 'none';
    document.getElementById('confirm-delete-account').style.display = 'block';
    document.getElementById('confirm-sign-out').style.display = 'block';
}

document.getElementById('editForm').addEventListener('submit', function(event) {
    event.preventDefault();
    alert("Email updated successfully!");
    // Here you would handle the actual email update
});

// document.getElementById('premium').addEventListener('change', function() {
//     if (this.checked) {
//         // Here you would handle the premium subscription
//         DB.u.update(getCookie('hash'), { premium: true }).then(() => {
//             location.href = '../dashboard';
//         });
//     } else {
//         // Here you would handle the premium unsubscription
//         DB.u.update(getCookie('hash'), { premium: null}).then(() => {
//             location.href = '../dashboard';
//         });
//     }
// })

// document.addEventListener('DOMContentLoaded', function() {
//     DB.u.get(getCookie('hash')).then((user) => {
//         document.getElementById('premium').checked = (user['premium'] == undefined) ? false : true;
//     });
// });

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

if (document.querySelector('.sign-in').style.display != 'none') {
    window.location.href = '../sign-in';
} else {
    let date = new Date();
    date.setDate(date.getDate() + 7);
    let c = `hash=${getCookie('hash')}; path=../; expires=${date.toUTCString()}`;
    document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
    document.cookie = c;
  }

document.addEventListener('DOMContentLoaded', function() {
    // elements
    const sidebar = document.querySelector('.sidebar');
    const openSidebar = document.querySelector('.logo');

    // sidebar open/close
    openSidebar.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });

    // set default currency
    DB.u.get(getCookie('hash')).then(user => {
        document.getElementById('currency').value = user['currency'];
    });
});