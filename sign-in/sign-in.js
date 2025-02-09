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

// sha256 hash function
async function sha256(message) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);                    

  // hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string                  
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
// end sha256 hash function

let createUserHash = async (email, pass) => sha256(email+pass);

document.addEventListener('DOMContentLoaded', function() {
  // elements
  const sidebar = document.querySelector('.sidebar');
  const openSidebar = document.querySelector('.logo');

  // sidebar open/close
  openSidebar.addEventListener('click', function() {
    sidebar.classList.toggle('active');
  });
  
  // submit event listener
  const signinBtn = document.getElementById('signin-btn');
  const signupBtn = document.getElementById('signup-btn');
  
  if (signinBtn) {
    signinBtn.addEventListener('click', signin);
  } else {
    console.error('internal error: signin button not found');
  }

  if (signupBtn) {
    signupBtn.addEventListener('click', signup);
  } else {
    console.error('internal error: signup button not found');
  }
});

async function signin() {
  // elements
  let emailOBJ = document.getElementById('email');
  let passOBJ = document.getElementById('pass');
  let errs = document.getElementById('si-errs');

  function errormsg(err) {
    errs.innerHTML = err;
    errs.style.display = 'block';
    setTimeout(() => {errs.innerHTML = ''}, 2000);
  }

  errormsg("PLEASE WAIT...")

  if (!emailOBJ || !passOBJ) {
    errormsg('INTERNAL ERROR: <small>email or password input not found</small>');
    return console.error('user error: email or password input not found');
  }

  createUserHash(emailOBJ.value, passOBJ.value).then(hash => {
    // errors
    if (emailOBJ.value == '') return errormsg('EMAIL REQUIRED');
    if (passOBJ.value == '') return errormsg('PASSWORD REQUIRED');
    DB.u.exists(hash).then(exists => {
      if (!exists) {
        errormsg('ACCOUNT NOT FOUND');
        return;
      }
      errormsg('SIGNED IN');
      console.log('signed in:', emailOBJ.value);
    });

    // set cookie
    let date = new Date();
    date.setDate(date.getDate() + 1);
    document.cookie = `hash=${hash}; path=/; expires=${date.toUTCString()}`;
    errormsg('Cookie Set!');
    console.log('cookie set:', document.cookie);

    // redirect
    // location.href = '../dashboard';
  });
}

async function signup() {
  // elements
  let emailOBJ = document.getElementById('email_up');
  let passOBJ = document.getElementById('pass_up');
  let errs = document.getElementById('su-errs');

  function errormsg(err) {
    errs.innerHTML = err;
    errs.style.display = 'block';
    setTimeout(() => {errs.innerHTML = ''}, 2000);
  }

  errormsg("PLEASE WAIT...")

  if (!emailOBJ || !passOBJ) {
    errormsg('INTERNAL ERROR: <small>email or password input not found</small>');
    return console.error('user error: email or password input not found');
  }

  createUserHash(emailOBJ.value, passOBJ.value).then(hash => {
    // errors
    if (emailOBJ.value == '') return errormsg('EMAIL REQUIRED');
    if (passOBJ.value == '') return errormsg('PASSWORD REQUIRED');
    DB.u.exists(hash).then(exists => {
      if (exists) {
        errormsg('ACCOUNT ALREADY EXISTS');
        return;
      }
      DB.u.create(hash, passOBJ.value).then(() => {
        errormsg('ACCOUNT CREATED');
        console.log('account created:', emailOBJ.value);
      });
    });

    // set cookie
    let date = new Date();
    date.setDate(date.getDate() + 1);
    document.cookie = `hash=${hash}; path=/; expires=${date.toUTCString()}`;
    errormsg('Signed Up and Cookie Set!');
    console.log('cookie set:', document.cookie);

    // redirect
    // location.href = '../dashboard';
  });
}

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

document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('.sign-in').addEventListener('click', function() {
      window.location.href = '../sign-in';
  });
});