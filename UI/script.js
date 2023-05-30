function register() {
    let firstName = document.getElementById('first-name').value;
    let lastName = document.getElementById('last-name').value;
    let email = document.getElementById('register-email').value;
    let password = document.getElementById('register-password').value;
    let confirmPassword = document.getElementById('confirm-password').value;

    if(password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    let userDetails = {
        firstName,
        lastName,
        email,
        password
    }

    fetch('http://yourwebsite.com/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userDetails)
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            alert('Registration successful!');
        } else {
            alert('Error registering');
        }
    })
    .catch(error => console.error('Error:', error));
}

function login() {
    let email = document.getElementById('login-email').value;
    let password = document.getElementById('login-password').value;

    let userDetails = {
        email,
        password
    }

    fetch('http://yourwebsite.com/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userDetails)
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            localStorage.setItem('token', data.token);
            window.location.href = "/newpage.html";  //Redirect to new page
        } else {
            alert('Error logging in');
        }
    })
    .catch(error => console.error('Error:', error));
}
