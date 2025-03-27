document.querySelector('.dashboard').classList.add('display-none')
document.querySelector('.loader').classList.remove('display-none')
let startTime = Date.now()
setTimeout(() => {
  document.querySelector('.loader').classList.add('display-none')
  document.querySelector('.dashboard').classList.remove('display-none')
  console.log('Backup load executed.')
}, 5000)
document.querySelector('#beta_icon').innerHTML = version

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
  console.log(user);
  if (user['premium'] == undefined) document.querySelectorAll('.premium-feature').forEach((el) => el.style.display = 'none');
  if (user['version'] != 'beta1.2fire') {
    alert("Welcome to Beta 1.2 Fire, We've migrated to a new database and fixed a couple bugs.")
    DB.u.update(hash, { 'version' : 'beta1.2fire' })
  }
  user['c_categories'] = user['c_categories'] || [];
  console.log(user);
  let totals = user.totals;
  let currency = user['currency'] || '$';
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

  DB.uCompute.all(hash, 'totals', month).then((totals) => {
    let total = Object.values(totals).reduce((sum, value) => sum + value, 0);
    console.log(total);

    totalOBJ.innerHTML = total.toFixed(2).toString();

    let mo = new Date().toISOString().slice(0, 7);

    let top3AMT = Object.values(totals)
      .sort((a, b) => b - a)
      .slice(0, 3);
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
      "j": "Pets",
      "k": "Health",
      "l": "Books",
      "other": "OTHER"
    }
    user['c_categories'].forEach(c_category =>{
      CATdict[c_category] = c_category;
    })
    top3CAT = top3CAT.map(v => CATdict[v] || v);
    console.log(top3CAT, top3AMT);

    topCatOBJ.forEach((topCatOBJ, i) => {
        topCatOBJ.innerHTML = top3CAT[i] || "N/A";
    })
    topCatAmtOBJ.forEach((topCatAmtOBJ, i) => {
        topCatAmtOBJ.innerHTML = (top3AMT[i] || 0).toFixed(2).toString();
    })
    let endTime = Date.now()
    document.querySelector('.loader').classList.add('display-none')
    document.querySelector('.dashboard').classList.remove('display-none')
    console.log(`Page loaded in ${endTime - startTime}ms`)
  });
});

// shortcuts
document.addEventListener('keydown', function(event) {
  // SHIFT = SHOW SHORTCUTS
  if (event.shiftKey) {
    document.querySelector('.shortcuts').style.display = 'block';
    document.querySelector('.dashboard').style.display = 'none';
  }

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

document.addEventListener('keyup', function(event) {
  // RELEASE SHIFT = HIDE SHORTCUTS
  if (!event.shiftKey) {
    document.querySelector('.shortcuts').style.display = 'none';
    document.querySelector('.dashboard').style.display = '';
  }
});