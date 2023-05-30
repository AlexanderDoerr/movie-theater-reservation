function register() {
    let Firstname = document.getElementById('first-name').value;
    let Lastname = document.getElementById('last-name').value;
    let Email = document.getElementById('register-email').value;
    let Password = document.getElementById('register-password').value;
    let ConfirmPassword = document.getElementById('confirm-password').value;

    if(Password !== ConfirmPassword) {
        alert('Passwords do not match');
        return;
    }

    let userDetails = {
        Firstname,
        Lastname,
        Email,
        Password
    }

    fetch('http://localhost:5041/usersapi/user', {
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
    console.log(email);
    console.log(password);

    let userDetails = {
        email: email,
        password: password
    }

    fetch("http://localhost:5041/usersapi/user/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userDetails)
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            console.log(data);
            user = {
                token: data.token,
                userGuid: data.user.userGuid,
                email: data.user,
                firstName: data.user.firstname,
                lastName: data.user.lastname,
                password: password
            }
            sessionStorage.setItem('UserInfo', user);
            window.location.href = "../MoviesList/movieList.html";  //Redirect to new page
        } else {
            alert('Error logging in');
        }
    })
    .catch(error => console.error('Error:', error));
}


