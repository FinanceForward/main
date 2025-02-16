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
  let time = (10000 + (Math.random() * 6000 - 3000))
  let startTime = Date.now();
  setTimeout(function() {
    window.location.href = '../dashboard';
  }, time);
  let interval = setInterval(function() {
    let percentDone = (((Date.now() - startTime) / time) * 100) + (Math.random() * 10 - 5);
    console.log(`Loading: ${percentDone.toFixed(2)}%`);
    progressBar.style.width = percentDone.toFixed(0) + '%';
    progressBar.textContent = percentDone.toFixed(0) + '%';
    if (Date.now() - startTime >= time) {
      clearInterval(interval);
    }
  }, 1000);
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

if (document.querySelector('.sign-in').style.display != 'none') {
  window.location.href = '../sign-in';
} else {
  let date = new Date();
  date.setDate(date.getDate() + 7);
  document.cookie = `hash=${getCookie('hash')}; path=/; expires=${date.toUTCString()}`;
}