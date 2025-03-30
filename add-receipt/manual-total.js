// Utility function to get a cookie value
function getCookie(name) {
  return document.cookie.split('; ').reduce((acc, cookie) => {
      const [key, value] = cookie.split('=');
      return key === name ? decodeURIComponent(value) : acc;
  }, '');
}

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

// Fetch and update category options
document.addEventListener('DOMContentLoaded', async () => {
  const catSelect = document.getElementById('cat');
  const hash = getCookie('hash');
  if (!hash) return;

  try {
      const categories = Object.keys(await DB.uCompute.all(hash, 'other', 'categories') || {});

      (categories || []).forEach(category => {
          const option = new Option(category, category);
          catSelect.appendChild(option);
      });
      catSelect.innerHTML += '<option value="category_manager">Manage Categories +</option>';
  } catch (error) {
      console.error('Error fetching categories:', error);
  }
});

// Redirect to category manager
document.getElementById('cat').addEventListener('change', event => {
  if (event.target.value === 'category_manager') {
      location.href = '../category_manager';
  }
});

// Handle receipt submission
document.getElementById('go').addEventListener('click', async event => {
  event.preventDefault();
  const total = document.getElementById('amt').value.trim();
  const month = document.getElementById('mot').value.trim();
  const category = document.getElementById('cat').value;
  const hash = getCookie('hash');

  if (!total || !month || !hash) return document.getElementById('fail-audio').play();
  if (!hash) location.href = '../sign-in'

  try {
      document.getElementById('go').innerHTML = "CALCULATING..."
      let newTotal = await DB.uCompute.get(hash, 'totals', month, category);
      if (newTotal === null) newTotal = 0;
      newTotal += Number(total);
      document.getElementById('go').innerHTML = "ADDING TOTAL..."
      await DB.uCompute.add(hash, 'totals', month, category, newTotal);
      document.getElementById('go').innerHTML = "ADDING RECEIPT..."
      const receiptID = '#' + Math.random().toString(36).substring(2, 10).padEnd(8, '0');
      await DB.uCompute.add(hash, 'receipts', month, category + receiptID, total);
      document.getElementById('go').innerHTML = "DONE!"
      document.getElementById('continue-audio').play();
      document.getElementById('continue-audio').onended = _=> {location.href = '../dashboard'};
  } catch (error) {
      console.error('Error submitting receipt:', error);
      document.getElementById('fail-audio').play();
  }
});

// Check authentication and redirect if necessary
if (!getCookie('hash')) {
  window.location.href = '../sign-in';
} else {
  document.cookie = `hash=${getCookie('hash')}; path=/; expires=${new Date(Date.now() + 7 * 864e5).toUTCString()}`;
}
