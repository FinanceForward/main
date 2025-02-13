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
  const cont_aud = () => {document.querySelector('#continue-audio').play()};
  const fail_aud = () => {document.querySelector('#fail-audio').play()};

  // sidebar open/close
  openSidebar.addEventListener('click', function() {
    sidebar.classList.toggle('active');
  });
  
  // submit event listener
  document.getElementById('go').addEventListener('click', e => {
    e.preventDefault();
    
    // elements
    let amtOBJ = document.getElementById('amt');
    let motOBJ = document.getElementById('mot');
    let catOBJ = document.getElementById('cat');

    // values
    let total = amtOBJ.value;
    let month = motOBJ.value;
    let category = catOBJ.value;
    let hash = getCookie('hash');

    // errors
    if (total == '') return fail_aud();
    if (month == '') return fail_aud();
    if (hash == '' || !DB.u.exists(hash)) return fail_aud();
  
    // receipt log
    console.log({total, month, category, hash});

    // send-in receipt
    DB.u.get(hash).then(user => {
      if (user == undefined) fail_aud();
      if (user['totals'] == undefined || user.totals[category] == undefined || user.totals[category][month] == undefined) {
        DB.u.update(hash, {
          'totals': {
            [category]: {
              [month]: Number(total)
            }
          }
        });
      } else {
        DB.u.update(hash, {
          'totals': {
            [category]: {
              [month]: Number(user.totals[category][month]) + Number(total)
            }
          }
        });
      }
      cont_aud();
      location.href = '../dashboard';
    });
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

if (document.querySelector('.sign-in').style.display != 'none') {
  window.location.href = '../sign-in';
}