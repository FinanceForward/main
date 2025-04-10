const hash = (() => {
  let cookieArr = document.cookie.split(";");
  for(let i = 0; i < cookieArr.length; i++) {
    let cookiePair = cookieArr[i].split("=");
    if("hash" == cookiePair[0].trim()) {
      return decodeURIComponent(cookiePair[1]);
    }
  }
  return null;
})();
if (!hash) location.href = '../sign-in'

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

let rlistOBJ = document.querySelector('ul')
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

let month = new Date().toISOString().slice(0, 7);

async function render() {
  if (!hash) return location.href = '../sign-in';
  let c_categories = Object.keys(await DB.uCompute.all(hash, 'custom', 'categories'));
  c_categories.forEach(c_category => CATdict[c_category] = c_category);
  let rlist = await DB.uCompute.all(hash, 'receipts', month);
  let rlistCategories = Object.keys(rlist).map(v => v.split('#')[0]);
  console.log(rlist)
  let rlistValues = Object.values(rlist);
  rlistOBJ.innerHTML = ''
  rlistCategories.forEach((category, index) => {
    let value = rlistValues[index];
    let li = document.createElement('li');
    li.innerHTML = `<strong>${CATdict[category] || `Custom Category: ` +category.toString()}</strong> - ${value} - <button onclick="this.innerHTML='Removing...'; removeReceipt('${category}', '${Object.keys(rlist)[index].split('#')[1]}', '${month}', '${value}')" class="rrbtn">Remove Receipt</button>`;
    rlistOBJ.appendChild(li);
  });
}

async function removeReceipt(category, categoryID, month, amount) {
    console.log(`Removing A Receipt Under Category "${category}" On The Month Of "${month}" With An ID Of "${categoryID}"`)
    console.log(typeof (category+'#'+categoryID))
    console.log(category+'#'+categoryID)
    await DB.uCompute.deleteF(hash, 'receipts', month, category+'#'+categoryID)
    let newTotal = await DB.uCompute.get(hash, 'totals', month, category);
    if (newTotal === null) newTotal = 0;
    newTotal -= Number(amount);
    await DB.uCompute.add(hash, 'totals', month, category, newTotal);
    console.log(`Receipt Deleted`)
    await render();
    console.log(`Rendered`)
}

render();