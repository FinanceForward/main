document.querySelector('.dashboard').classList.add('display-none')
document.querySelector('.loader').classList.remove('display-none')
setTimeout(() => {
  document.querySelector('.loader').classList.add('display-none')
  document.querySelector('.dashboard').classList.remove('display-none')
}, 1000)

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
    document.querySelectorAll('.premium-feature').forEach((el) => {
      el.style.background = 'linear-gradient(45deg, #FF9B07, gold)';
      let angle = 45;
      setInterval(() => {
        angle = (angle + 1) % 360;
        document.querySelectorAll('.premium-feature').forEach((el) => {
          el.style.background = `linear-gradient(${angle}deg, #FF9B07, gold)`;
        });
      }, 10);
    });
  }

if (document.querySelector('.sign-in').style.display != 'none') {
  window.location.href = '../sign-in';
} else {
  let date = new Date();
  date.setDate(date.getDate() + 7);
  document.cookie = `hash=${getCookie('hash')}; path=/; expires=${date.toUTCString()}`;
}

let totalOBJ = document.querySelector('#total');
let topCatOBJ = document.querySelectorAll('#top-cat');
let topCatAmtOBJ = document.querySelectorAll('#top-cat-amt');

let hash = getCookie('hash');

DB.u.get(hash).then((user) => {
    if (user['premium'] == undefined) document.querySelectorAll('.premium-feature').forEach((el) => el.style.display = 'none');
    console.log(user);
    let totals = user.totals;
    let currency = user['currency'];
    if (currency.includes('*')) {
      currency = currency.replace('*', '');
    }
    const after = user['currency'].includes('*');
    if (after) {
      document.querySelectorAll('.c_after').forEach((el) => {
        el.innerHTML = ' ' + currency;
        console.log(el, currency);
      });
      document.querySelectorAll('.c').forEach((el) => {
        el.innerHTML = '';
        console.log(el, currency);
      });
    } else {
      document.querySelectorAll('.c').forEach((el) => {
        el.innerHTML = currency;
        console.log(el, currency);
      });
    }
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
    totalOBJ.innerHTML = total.toFixed(2).toString();

    let mo = new Date().toISOString().slice(0, 7);

    let top3AMT = Object.values(totals).map(t => t[mo] || 0).sort((a, b) => b - a).slice(0, 3)
    let top3CAT = Object.keys(totals)
        .map(key => ({ key, value: totals[key][mo] || 0 }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 3)
        .map(item => item.key);

    let CATdict = {
      "a": "Groceries",
      "b": "Food Out",
      "c": "Snacks",
      "d": "Kitchenware",
      "e": "Bathroomware",
      "f": "Livingware",
      "g": "Appliances",
      "h": "Gardenware",
      "i": "Bills/Subcriptions",
      "j": "Pets",
      "k": "Health",
      "l": "Books",
      "other": "OTHER"
    }
    user['c_categories'].forEach(c_category =>{
      CATdict[c_category] = c_category;
    })
    top3CAT = top3CAT.map(v => CATdict[v]);

    topCatOBJ.forEach((topCatOBJ, i) => {
        topCatOBJ.innerHTML = top3CAT[i] || "N/A";
    })
    topCatAmtOBJ.forEach((topCatAmtOBJ, i) => {
        topCatAmtOBJ.innerHTML = top3AMT[i].toFixed(2).toString();
    })
});