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

let totalOBJ = document.querySelector('#total');
let topCatOBJ = document.querySelectorAll('#top-cat');
let topCatAmtOBJ = document.querySelectorAll('#top-cat-amt');

console.log(totalOBJ);
console.log(topCatOBJ);
console.log(topCatAmtOBJ);

DB.u.get(getCookie('email')).then((user) => {
    console.log(user);
    let totals = user.totals;
    const d = new Date();
    let month = d.getFullYear().toString() + '-' + (d.getMonth()+1 < 10 ? "0" : '') + (d.getMonth()+1).toString();
    let total = (
      ((totals['a'] && totals['a'][month]) || 0) +
      ((totals['b'] && totals['b'][month]) || 0) +
      ((totals['c'] && totals['c'][month]) || 0) +
      ((totals['d'] && totals['d'][month]) || 0) +
      ((totals['e'] && totals['e'][month]) || 0) +
      ((totals['f'] && totals['f'][month]) || 0) +
      ((totals['g'] && totals['g'][month]) || 0) +
      ((totals['h'] && totals['h'][month]) || 0) +
      ((totals['i'] && totals['i'][month]) || 0) +
      ((totals['j'] && totals['j'][month]) || 0) +
      ((totals['k'] && totals['k'][month]) || 0) +
      ((totals['l'] && totals['l'][month]) || 0) +
      ((totals['other'] && totals['other'][month]) || 0)
    );
    totalOBJ.innerHTML = "$" + total.toFixed(2).toString();
});

let topCats = ['Food', 'Transport', 'Entertainment'];
let topCatAmts = [10, 5, 5];

topCatOBJ.forEach((topCatOBJ, i) => {
    topCatOBJ.innerHTML = topCats[i];
})
topCatAmtOBJ.forEach((topCatAmtOBJ, i) => {
    topCatAmtOBJ.innerHTML = topCatAmts[i].toFixed(2).toString();
})