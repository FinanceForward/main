document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar');
    const openSidebar = document.querySelector('.logo');

    openSidebar.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });

    document.getElementById('img').addEventListener('change', function() {
        var fileName = this.files[0] ? this.files[0].name : "No file selected";
        document.querySelector('.file-name').textContent = fileName;
    });
    
    document.getElementById('go').addEventListener('click', e => {
        e.preventDefault()
        let imgOBJ = document.getElementById('img')
        let motOBJ = document.getElementById('mot')
        let catOBJ = document.getElementById('cat')
        OCR(imgOBJ).then(txt => extractTotal(txt)).then(total => {
            if (total == null) {
                document.getElementById('go').textContent = 'Sorry, Could not get total from this receipt...'
                setTimeout(() => {
                    document.getElementById('go').outerHTML = '<button id="go"><a href="./manual-total.html">Press Here To Manually Enter The Total</a></button>'
                }, 750);
                return;
            }
            let month = motOBJ.value
            let category = catOBJ.value
    
            console.log({total, month, category})
        })
    });
});