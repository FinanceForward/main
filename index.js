// cookie script
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
// end cookie script

document.addEventListener('DOMContentLoaded', function() {
    // elements
    const sidebar = document.querySelector('.sidebar');
    const openSidebar = document.querySelector('.logo');

    // sidebar open/close
    openSidebar.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
});

document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('.sign-in').addEventListener('click', function() {
      window.location.href = './sign-in';
  });
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

window.addEventListener('scroll', function() {
    document.getElementById('fadeDiv').style.opacity = '0';
    document.getElementById('fadeDiv').style.transition = 'opacity 1s';
});