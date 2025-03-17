const getCookie = (name) => {
    return document.cookie.split("; ")
        .find(row => row.startsWith(name + "="))
        ?.split("=")[1] || null;
};

class DateConfig {
    static today = () => [new Date().getDate(), new Date().getMonth() + 1] // 0 -> DATE ; 1 -> MONTH

    static getWeekdaysPassed(targetDay) {
        const today = new Date();
        return Array.from({ length: today.getDate() }, (_, i) => new Date(today.getFullYear(), today.getMonth(), i + 1))
            .filter(date => date.getDay() === targetDay).length;
    }
}

class Sub {
    static DOW = x => ({'sunday':0 , 'monday':1 , 'tuesday':2 , 'wednesday':3 , 'thursday':4 , 'friday':5 , 'saturday':6})[x.toLowerCase()]

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
                return Sub.weekly(sub.price, Sub.DOW(sub.date));

            case 'monthly':
                return Sub.monthly(sub.price, sub.date);

            case 'yearly':
                return Sub.yearly(sub.price, sub.date);
        
            default:
                console.error('ERROR: Sub.processTotal() error')
                return;
        }
    }

    static processGrandTotal(subs) {
        return subs.reduce((p, n) => p+Sub.processTotal(n), 0)
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const subList = document.getElementById('sub-list');
    const subNameInput = document.getElementById('sub-name');
    const subPriceInput = document.getElementById('sub-price');
    const subFrequencyInput = document.getElementById('sub-frequency');
    const subDetailDate = document.getElementById('sub-detail-date');  // Date input
    const subDetailDOW = document.getElementById('sub-detail-dow');  // DOW input
    const subDetailDOM = document.getElementById('sub-detail-dom');  // DOM input
    const addSubBtn = document.getElementById('add-sub');

    subDetailDate.style.display = 'none';
    subDetailDOW.style.display = 'unset';
    subDetailDOM.style.display = 'none';

    let subs = [];

    function loadSubscriptions() {
        DB.u.get(getCookie('hash')).then(user => {
            subs = user['subs'] || [];
            console.log(Sub.processGrandTotal(subs))
            renderSubscriptions();
        });
    }

    function renderSubscriptions() {
        subList.innerHTML = '';
        subs.forEach(sub => {
            const li = document.createElement('li');
            li.textContent = `${sub.name} - $${sub.price} - ${sub.frequency} - ${sub.date} | `;
            li.textContent += Sub.processTotal(sub).toString();
            
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

    let setting = "weekly";
    subFrequencyInput.addEventListener('change',function() {
        if (subFrequencyInput.value == "weekly") {
            subDetailDate.style.display = "none"
            subDetailDOW.style.display = "unset"
            subDetailDOM.style.display = "none"
        } else if (subFrequencyInput.value == "yearly") {
            subDetailDOW.style.display = "none"
            subDetailDate.style.display = "unset"
            subDetailDOM.style.display = "none"
        } else if (subFrequencyInput.value == "monthly") {
            subDetailDOW.style.display = "none"
            subDetailDate.style.display = "none"
            subDetailDOM.style.display = "unset"
        }
        setting = subFrequencyInput.value
        console.log(setting)
    })

    addSubBtn.addEventListener('click', function() {
        const subName = subNameInput.value.trim();
        const subPrice = parseFloat(subPriceInput.value.trim());
        const subFrequency = subFrequencyInput.value;
        let subDate = null;  // Getting the date from sub-detail input
        switch(setting) {
            case('weekly'):
                subDate = subDetailDOW.value;
                console.log('Current Setting: WEEKLY');
                break;

            case('monthly'):
                subDate = Number(subDetailDOM.value);
                console.log('Current Setting: MONTHLY');
                console.log('Day of Month:', subDate);
                break;

            case('yearly'):
                const dateParts = subDetailDate.value.split('-');
                subDate = [parseInt(dateParts[2]), parseInt(dateParts[1])];
                console.log('Current Setting: YEARLY');
                console.log('Date:', subDate);
                break;

            default:
                console.error('Error: Setting Error');
                break;
        }

        if (subName && !isNaN(subPrice) && subPrice > 0 && subDate && !subs.some(s => s.name === subName)) {
            const newSub = { name: subName, price: subPrice, frequency: subFrequency, date: subDate };
            subs.push(newSub);
            renderSubscriptions();
            updateDatabase();
            
            subNameInput.value = '';
            subPriceInput.value = '';
            subDetailDate.value = '';  // Clear the date input
        }
    });

    loadSubscriptions();
});