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
    let email = getCookie('email');

    // errors
    if (total == '') return console.error('unfinished receipt: total required');
    if (month == '') return console.error('unfinished receipt: month required');
    if (email == '' || !DB.u.exists(email)) return console.error('user error: not logged in or does not exist');
  
    // receipt log
    console.log({total, month, category, email});

    // send-in receipt
    DB.u.get(email).then(user => {
      if (user['totals'] == undefined || user.totals[category] == undefined || user.totals[category][month] == undefined) {
        DB.u.update(email, {
          'totals': {
            [category]: {
              [month]: Number(total)
            }
          }
        });
      } else {
        DB.u.update(email, {
          'totals': {
            [category]: {
              [month]: Number(user.totals[category][month]) + Number(total)
            }
          }
        });
      }
      location.href = '../dashboard';
    });
  });
});

let name = "email=";
let ca = decodeURIComponent(document.cookie).split(';');
for(let i = 0; i <ca.length; i++) {
  let c = ca[i];
  while (c.charAt(0) == ' ') {
  c = c.substring(1);
  }
  if (c.indexOf(name) == 0) {
  if (getCookie('email') != '') {
      document.querySelector('.sign-in').style.display = 'none';
  }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('.sign-in').addEventListener('click', function() {
      window.location.href = '../sign-in';
  });
});