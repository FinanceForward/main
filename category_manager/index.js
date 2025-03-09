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

// ✅ Fetch User & Categories Efficiently
DB.u.get(getCookie('hash')).then(user => {
    if (!user) return (location.href = '../sign-in');
    if (!user.premium) return alert('Premium required.') || (location.href = '../dashboard');

    // ✅ Add user's categories
    userCategories = new Set(user.c_categories);
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
function removeCategory(category) {
    userCategories.delete(category);
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
    DB.u.update(getCookie('hash'), { c_categories: [...userCategories] });
    renderCategories(); // ✅ Re-render instead of reloading
}