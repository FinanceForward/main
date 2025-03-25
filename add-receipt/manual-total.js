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
      const user = await DB.u.get(hash);
      if (!user) return;

      (user.c_categories || []).forEach(category => {
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

  try {
      const user = await DB.u.get(hash);
      if (!user) return document.getElementById('fail-audio').play();
      
      const updatedTotals = user.totals || {};
      updatedTotals[category] = updatedTotals[category] || {};
      updatedTotals[category][month] = (Number(updatedTotals[category][month]) || 0) + Number(total);
      
      const updatedReceipts = user.receipts || {};
      updatedReceipts[month] = updatedReceipts[month] || [];
      updatedReceipts[month].push([total, category]);

      // await DB.u.update(hash, { totals: updatedTotals, receipts: updatedReceipts });
      let newTotal = await DB.uCompute.get(hash, 'totals', month, category);
      if (newTotal === null) newTotal = 0;
      newTotal += Number(total);
      await DB.uCompute.add(hash, 'totals', month, category, newTotal);
      await DB.uCompute.add(hash, 'receipts', month, category, total);
      document.getElementById('continue-audio').play();
      location.href = '../dashboard';
  } catch (error) {
      console.error('Error submitting receipt:', error);
      document.getElementById('fail-audio').play();
  }
});

// Check authentication and redirect if necessary
if (!getCookie('hash')) {
  window.location.href = '../sign-in';
} else {
  document.querySelector('.sign-in').style.display = 'none';
  document.cookie = `hash=${getCookie('hash')}; path=/; expires=${new Date(Date.now() + 7 * 864e5).toUTCString()}`;
}
