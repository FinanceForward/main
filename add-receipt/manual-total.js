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
    document.getElementById('go').addEventListener('click', e => {
        e.preventDefault()
        
        // elements
        let amtOBJ = document.getElementById('amt')
        let motOBJ = document.getElementById('mot')
        let catOBJ = document.getElementById('cat')

        // values
        let total = amtOBJ.value
        let month = motOBJ.value
        let category = catOBJ.value
        let email = getCookie('email')

        // errors
        if (total == '') return console.error('unfinnished receipt: total required')
        if (month == '') return console.error('unfinnished receipt: month required')
        if (email == '' || !ExistsUser(email)) return console.error('user error: not logged in or could not find account')
    
        // receipt log
        console.log({total, month, category, email})

        // send-in receipt
    });
});