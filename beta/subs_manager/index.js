const getCookie = (name) => {
    return document.cookie.split("; ")
        .find(row => row.startsWith(name + "="))
        ?.split("=")[1] || null;
};

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

document.addEventListener('DOMContentLoaded', function() {
    const subList = document.getElementById('sub-list'); // subscription list
    // new inputs
    const subNameInput = document.getElementById('sub-name'); // name
    const subPriceInput = document.getElementById('sub-price'); // price
    // frequency
    const subFrequencyInput = document.getElementById('sub-frequency'); // frequency select
    const subDetailDate = document.getElementById('sub-detail-date');  // For Day of Year (or Date)
    const subDetailDOW = document.getElementById('sub-detail-dow');  // For Day of Week (abreviated as DOW)
    const subDetailDOM = document.getElementById('sub-detail-dom');  // For Day of Month (abreviated as DOM)
    // btns
    const addSubBtn = document.getElementById('add-sub'); // add button

    subDetailDate.style.display = 'none';
    subDetailDOW.style.display = 'unset';
    subDetailDOM.style.display = 'none';

    // EACH SUB CONTAINS: name, price, frequency, freq_value
    let subs = []; /* TO DO: DELETE THIS */

    async function renderSubscriptions() {
        let subscriptions = await DB.uDoc.allDocs(getCookie('hash'), 'subscriptions')
        console.log(JSON.stringify(subscriptions))
        subList.innerHTML = '';
        subscriptions.forEach(sub => {
            const li = document.createElement('li');
            li.innerHTML = `<h3 style="margin-right:10px">${sub.name}</h3> $${sub.price} - ${sub.frequency} - ${sub.freq_value}`;
            console.log(sub)
            console.log(Sub.processTotal(sub))
            
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove Subsription';
            removeBtn.classList.add('remove-sub');
            removeBtn.onclick = function() {
                removeBtn.innerHTML = 'Removing...'
                DB.uDoc.deleteDoc(getCookie('hash'), 'subscriptions', sub.name)
                renderSubscriptions();
            };
            
            li.appendChild(removeBtn);
            subList.appendChild(li);
        });
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
        let subscription = {};
        subscription['name'] = subNameInput.value.trim();
        subscription['price'] = parseFloat(subPriceInput.value.trim());
        subscription['frequency'] = subFrequencyInput.value;
        switch(setting) {
            case('weekly'):
                subscription['freq_value'] = subDetailDOW.value;
                console.log('Current Setting: WEEKLY');
                break;

            case('monthly'):
                subscription['freq_value'] = Number(subDetailDOM.value);
                console.log('Current Setting: MONTHLY');
                console.log('Day of Month:', subDetailDOM.value);
                break;

            case('yearly'):
                const dateParts = subDetailDate.value.split('-');
                subscription['freq_value'] = [parseInt(dateParts[2]), parseInt(dateParts[1])];
                console.log('Current Setting: YEARLY');
                console.log('Date:', subscription.freq_value);
                break;

            default:
                console.error('Error: Setting Error');
                break;
        }

        /* TO DO: Add a confirmation that the subscription doesn't exist already */
        if (subscription.name && !isNaN(subscription.price) && subscription.price > 0 && subscription.freq_value) {
            DB.uDoc.newDoc(getCookie('hash'), 'subscriptions', subscription.name, subscription)
            renderSubscriptions();
            
            subNameInput.value = '';
            subPriceInput.value = '';
            subDetailDate.value = '';  // Clear the date input
        }
    });

    renderSubscriptions();
});