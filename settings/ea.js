function getCookie(cname) {
    let name = cname + "=";
    return decodeURIComponent(document.cookie).split(';').map(c => c.trim()).find(c => c.startsWith(name))?.substring(name.length) || "";
}

document.addEventListener('keydown', function(event) {
    const shortcuts = {
        'D': '../dashboard',
        'R': '../add-receipt',
        'V': '../report',
        'P': '../printout',
        'L': '../links'
    };
    if (event.shiftKey && shortcuts[event.key]) {
        window.location.href = shortcuts[event.key];
    }
});

async function sha256(message) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// * DONE
async function updateAccount(email, pass) {
    const oldhash = getCookie('hash');
    const newhash = await sha256(email + pass);
    const currency = document.getElementById('currency').value;
    await DB.u.update(oldhash, { 'hash': newhash });
    await DB.u.update(oldhash, { 'currency': currency });
    document.cookie = `hash=${newhash}; path=/; expires=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()}`;
    location.href = '../dashboard'
}

// TODO - remove this
async function signout() {
    toggleDialog('sign-out')
}

function toggleDialog(type) {
    const isDelete = type === 'delete';
    document.getElementById('confirmationDialog').style.display = 'block';
    document.getElementById('confirm-delete-account').style.display = isDelete ? 'block' : 'none';
    document.getElementById('confirm-sign-out').style.display = isDelete ? 'none' : 'block';
}

function cancel() {
    document.getElementById('confirmationDialog').style.display = 'none';
}

function proceed() {
    const isDelete = document.getElementById('confirm-delete-account').style.display === 'block';
    if (isDelete) {
        DB.u.delete(getCookie('hash')).then(_=> {
            document.cookie = "hash=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            location.href = '../dashboard';
        })
    } else {
        document.cookie = "hash=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        location.href = '../dashboard';
    }
}

// * DONE
document.addEventListener('DOMContentLoaded', function() {
    const hash = getCookie('hash');
    if (!hash) return (window.location.href = '../sign-in');

    DB.u.get(hash).then(user => {
        user && (document.getElementById('premium').checked = !!(user['premium'] ?? false));
        user && (document.getElementById('currency').value = (user['currency'] ?? ''));
    });
});
