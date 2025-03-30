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

// ✅ Optimized Cookie Retrieval
const hash = document.cookie.split('; ').find(row => row.startsWith('hash='))?.split('=')[1];
if (!hash) location.href = '../sign-in'

// render(): renders the categories
async function render() {
    let cList = document.getElementById('category-list');
    let uCats = ['Groceries', 'Food Out', 'Snacks', 'Kitchenware', 'Bathroomware', 'Livingware', 'Appliances', 'Gardenware', 'Pets', 'Health', 'Books', 'OTHER']; // unchangable categories
    let cCats = Object.keys(await DB.uCompute.all(hash, 'other', 'categories')); // all changeable categories
    let cats = [...uCats, ...cCats]; // all categories

    cList.innerHTML = '<li>Default Categories Are Not Shown...</li>'
    cats.forEach(category => {
        let obj = document.createElement('li');
        let removeBTN = document.createElement('button');
        obj.textContent = category + ' - ' + (!uCats.includes(category)? '':'(Default Category)');
        removeBTN.textContent = 'Remove Category';
        removeBTN.onclick = _=> {removeBTN.textContent = 'Deleting, Please Wait...'; remove(category)};
        if (!uCats.includes(category)) obj.appendChild(removeBTN);
        !uCats.includes(category)? cList.appendChild(obj) : ''
    })
}

// add(): takes the category name and adds it to FIRE, then re-renders
async function add(name) {
    await DB.uCompute.add(hash, 'other', 'categories', name, true).then(render)
}

// remove(): takes the category name and removes it from FIRE, then re-renders
async function remove(name) {
    await DB.uCompute.deleteF(hash, 'other', 'categories', name).then(render)
}

render();