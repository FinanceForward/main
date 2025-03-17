// ✅ Optimized Cookie Retrieval
const getCookie = (name) => {
    return document.cookie.split("; ")
        .find(row => row.startsWith(name + "="))
        ?.split("=")[1] || null;
};

// ✅ Single Object for Categories (No Duplication)
const DEFAULT_CATEGORIES = new Set(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "other"]);
const categoryNames = {
    "a": "Groceries", "b": "Food Out", "c": "Snacks", "d": "Kitchenware",
    "e": "Bathroomware", "f": "Livingware", "g": "Appliances", "h": "Gardenware",
    "i": "Bills/Subscriptions", "j": "Pets", "k": "Health", "l": "Books", "other": "OTHER"
};

const categoryList = document.getElementById("category-list");
let userCategories = new Set(); // ✅ Using a Set for quick lookups
let userx;

// ✅ Fetch User & Categories Efficiently
DB.u.get(getCookie('hash')).then(user => {
    if (!user) return (location.href = '../sign-in');
    if (!user.premium) return alert('Premium required.') || (location.href = '../dashboard');

    // ✅ Add user's categories
    userCategories = new Set(user.c_categories);
    userx = user;
    renderCategories();
});

// ✅ Render Categories Efficiently (No Reloads)
function renderCategories() {
    categoryList.innerHTML = ""; // ✅ Clear previous list

    [...DEFAULT_CATEGORIES, ...userCategories].forEach(category => {
        const li = document.createElement("li");
        const isRemovable = !DEFAULT_CATEGORIES.has(category);

        li.innerHTML = `
            <strong>${categoryNames[category] || category}</strong> 
            ${isRemovable ? `<button class="remove-btn" data-category="${category}">Remove</button>` : "(Fixed Category)"} 
        `;

        categoryList.appendChild(li);
    });

    // ✅ Add Input Field for New Categories
    categoryList.innerHTML += `
        <li>
            <input type="text" placeholder="New Category" id="new-category" />
            <button id="add-category">Add</button>
        </li>
    `;
}

// ✅ Event Delegation (Only One Listener for All Buttons)
categoryList.addEventListener("click", (e) => {
    if (e.target.matches(".remove-btn")) removeCategory(e.target.dataset.category);
    if (e.target.id === "add-category") addCategory();
});

// ✅ Efficient Category Removal (No Page Reload)
let x;
function removeCategory(category) {
    userCategories.delete(category); // remove the category from userCategories

    let cx = userx['totals'][category] // category totals for all months
    let totalsk = userx['totals'] // totals for all categories and months;

    console.log("PRELOOP cx:")
    console.log(JSON.stringify(cx))
    console.log("PRELOOP totalsk:")
    console.log(JSON.stringify(totalsk))

    if (cx) {
        Object.keys(cx).forEach((monthz, i) => {
            x = totalsk
            let totalz = cx[monthz]; // for each month of the category, monthz is the month and totalz is the total of the month
            let hasPropertyOther = false
            if (totalsk.hasOwnProperty('other') && (hasPropertyOther = true) && totalsk['other'].hasOwnProperty(monthz)) totalsk['other'][monthz] = (totalsk['other'][monthz] || 0) + (totalz || 0) // set the category 'other' in the month monthz to the original or 0 plus the totalz or 0
            else if (hasPropertyOther) totalsk['other'][monthz] = totalz || 0
            else {
                totalsk['other'] = {};
                totalsk['other'][monthz] = totalz;
            }
            cx[monthz] = 0 // set the deleted category's total for month monthz to 0
            console.log(`RUN ${i} cx:`)
            console.log(JSON.stringify(cx))
            console.log(`RUN ${i} totalsk:`)
            console.log(JSON.stringify(totalsk))
        })
        totalsk[category] = null;

        console.log("POSTLOOP cx:")
        console.log(JSON.stringify(cx))
        console.log("POSTLOOP totalsk:")
        console.log(JSON.stringify(totalsk))

        DB.u.update(getCookie('hash'), {
            'totals': totalsk
        })
    }

    
    updateDatabase();
}

// ✅ Efficient Category Addition
function addCategory() {
    const newCategory = document.getElementById("new-category").value.trim();
    if (!newCategory || userCategories.has(newCategory) || DEFAULT_CATEGORIES.has(newCategory)) return;

    userCategories.add(newCategory);
    updateDatabase();
}

// ✅ Update Database Efficiently
function updateDatabase() {
    DB.u.update(getCookie('hash'), {
        'c_categories': [...userCategories], // update categories
    });
    renderCategories(); // ✅ Re-render instead of reloading
}