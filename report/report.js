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

if (getCookie('hash') == '') {
  window.location.href = '../sign-in';
}

// shortcuts
document.addEventListener('keydown', function(event) {
  // SHIFT + D = DASHBOARD
  if (event.shiftKey && event.key === 'D') {
    window.location.href = '../dashboard'
  }

  // SHIFT + R = ADD RECEIPT
  if (event.shiftKey && event.key === 'R') {
    window.location.href = '../add-receipt';
  }

  // SHIFT + V = VIEW REPORT
  if (event.shiftKey && event.key === 'V') {
    window.location.href = '../report';
  }

  // SHIFT + P = PRINTOUT REPORT
  if (event.shiftKey && event.key === 'P') {
    window.location.href = '../printout';
  }

  // SHIFT + L = LINKS
  if (event.shiftKey && event.key === 'L') {
    window.location.href = '../links';
  }
});