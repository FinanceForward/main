document.querySelector('.dashboard').classList.add('display-none')
document.querySelector('.loader').classList.remove('display-none')
let startTime = Date.now()
setTimeout(() => {
  document.querySelector('.loader').classList.add('display-none')
  document.querySelector('.dashboard').classList.remove('display-none')
  console.log('Backup load executed.')
}, 5000)
document.querySelector('#beta_icon').innerHTML = version

class DateConfig {
  static today = () => [new Date().getDate(), new Date().getMonth() + 1] // 0 -> DATE ; 1 -> MONTH

  static getWeekdaysPassed(targetDay) {
      const today = new Date();
      return Array.from({ length: today.getDate() }, (_, i) => new Date(today.getFullYear(), today.getMonth(), i + 1))
          .filter(date => date.getDay() === targetDay).length;
  }
}

class Sub {
  static DOW = x => ({'sunday':0 , 'monday':1 , 'tuesday':2 , 'wednesday':3 , 'thursday':4 , 'friday':5 , 'saturday':6})[x]

  static weekly(price, DOW) {
      return DateConfig.getWeekdaysPassed(DOW %7)*price
  }

  static monthly(price, date) {
      return (DateConfig.today()[0] >= date ? price : 0)
  }

  static yearly(price, date) {
      return ((DateConfig.today()[1] == date[1] && DateConfig.today()[0] >= date[0]) ? price : 0)
  }

  static processTotal(sub) {
      switch (sub.frequency) {
          case 'weekly':
              return Sub.weekly(sub.price, Sub.DOW(sub.freq_value));

          case 'monthly':
              return Sub.monthly(sub.price, sub.freq_value);

          case 'yearly':
              return Sub.yearly(sub.price, sub.freq_value);
      
          default:
              console.error('ERROR: Sub.processTotal() error')
              return;
      }
  }

  static processGrandTotal(subs) {
      return subs.reduce((p, n) => p+Sub.processTotal(n), 0)
  }
}

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
  if (user['version'] != version) {
    alert(`Welcome to ${version}, ${versionNOTES}`)
    DB.u.update(hash, { 'version' : version})
  }
  user['c_categories'] = user['c_categories'] || [];
  console.log(user);
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

  DB.uCompute.all(hash, 'totals', month).then(async (totals) => {
    let subscriptions = await DB.uDoc.allDocs(hash, 'subscriptions');
    subscriptions.forEach(subscription => {
      totals[subscription.name] = Sub.processTotal(subscription);
    })
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