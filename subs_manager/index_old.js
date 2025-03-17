const getCookie = (name) => {
    return document.cookie.split("; ")
        .find(row => row.startsWith(name + "="))
        ?.split("=")[1] || null;
};

document.addEventListener('DOMContentLoaded', function() {
    const subList = document.getElementById('sub-list');
    const newSubInput = document.getElementById('new-sub');
    const addSubBtn = document.getElementById('add-sub');

    let subs = [];

    function loadSubscriptions() {
        DB.u.get(getCookie('hash')).then(user => {
            subs = user['subs'] || [];
            renderSubscriptions();
        });
    }

    function renderSubscriptions() {
        subList.innerHTML = '';
        subs.forEach(sub => {
            const li = document.createElement('li');
            li.textContent = sub;
            
            const removeBtn = document.createElement('button');
            removeBtn.textContent = '×';
            removeBtn.classList.add('remove-sub');
            removeBtn.onclick = function() {
                subs = subs.filter(s => s !== sub);
                renderSubscriptions();
                updateDatabase();
            };
            
            li.appendChild(removeBtn);
            subList.appendChild(li);
        });
    }

    function updateDatabase() {
        const hash = getCookie('hash');
        if (!hash) return;
        DB.u.update(hash, { subs });
    }

    addSubBtn.addEventListener('click', function() {
        const newSub = newSubInput.value.trim();
        if (newSub && !subs.includes(newSub)) {
            subs.push(newSub);
            renderSubscriptions();
            updateDatabase()
            newSubInput.value = '';
        }
    });

    loadSubscriptions();
});