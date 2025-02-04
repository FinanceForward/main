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

function signin() {
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

  // values
  let email = emailOBJ.value;
  let pass = passOBJ.value;

  // errors
  if (email == '') return errormsg('EMAIL REQUIRED');
  if (pass == '') return errormsg('PASSWORD REQUIRED');
  DB.u.exists(email).then(exists => {
    !exists ? errormsg('ACCOUNT DOES NOT EXIST') : null

    DB.u.get(email).then(user => {
      if (user.pass != pass) {
        errormsg('INCORRECT PASSWORD');
        return;
      }

      // cookie
      let date = new Date();
      date.setDate(date.getDate() + 1);
      document.cookie = `email=${email}; path=/; expires=${date.toUTCString()}`;
      errormsg('Signed In!')
      console.log('cookie set:', document.cookie);
      location.href = '../dashboard'
    });
  });
}

function signup() {
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

  // values
  let email = emailOBJ.value;
  let pass = passOBJ.value;

  // errors
  if (email == '') return errormsg('EMAIL REQUIRED');
  if (pass == '') return errormsg('PASSWORD REQUIRED');
  DB.u.exists(email).then(exists => {
    exists ? errormsg('ACCOUNT ALREADY EXISTS') : null
    // create account
    DB.u.create(email, pass).then(user => {
      console.log('user created:', user);
    }).catch(err => {
      console.error('error creating user:', err);
    });
  
    // cookie
    let date = new Date();
    date.setDate(date.getDate() + 1);
    document.cookie = `email=${email}; path=/; expires=${date.toUTCString()}`;
    errormsg('Account Created!')
    console.log('cookie set:', document.cookie);
    location.href = '../dashboard'
  });
}

let name = "email=";
let ca = decodeURIComponent(document.cookie).split(';');
for(let i = 0; i <ca.length; i++) {
  let c = ca[i];
  while (c.charAt(0) == ' ') {
  c = c.substring(1);
  }
  if (c.indexOf(name) == 0) {
  if (getCookie('email') != '') {
      document.querySelector('.sign-in').style.display = 'none';
  }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('.sign-in').addEventListener('click', function() {
      window.location.href = '../sign-in';
  });
});