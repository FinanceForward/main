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

function updatePassword() {
    alert("Password update functionality would be implemented here.");
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
    let type = document.getElementById('confirmationMessage').innerText.includes('data') ? 'data' : 'account';
    alert(`Deleting ${type === 'data' ? 'data' : 'account'}. This action cannot be undone.`);
    if (type == 'account') {DB.u.delete(getCookie('hash')); document.cookie = 'hash=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'; alert('Account deleted');}
    else if (type == 'data') {DB.u.delete(getCookie('hash')); DB.u.create(getCookie('hash'));}
    document.getElementById('confirmationDialog').style.display = 'none';
}

document.getElementById('editForm').addEventListener('submit', function(event) {
    event.preventDefault();
    alert("Email updated successfully!");
    // Here you would handle the actual email update
});
