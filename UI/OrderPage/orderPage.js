window.onload = function() {
    let selectedSchedule = JSON.parse(sessionStorage.getItem('selectedSchedule'));
    let selectedSeats = JSON.parse(sessionStorage.getItem('selectedSeatNumbers'));
    let selectedSeatUUIDs = JSON.parse(sessionStorage.getItem('selectedSeatUUIDs'));
    let movieTitle = sessionStorage.getItem('movieTitle');
    const userString = sessionStorage.getItem('UserInfo');
    const userInfo = JSON.parse(userString);

    console.log(selectedSchedule);
    console.log(selectedSeats);
    console.log(userInfo);
    console.log(movieTitle);

    // Convert the Unix timestamp into date and time
    let movieDate = new Date(Number(selectedSchedule.time.seconds) * 1000).toISOString().split('T')[0];
    let movieTime = new Date(Number(selectedSchedule.time.seconds) * 1000).toISOString();

    // Display the movie information
    let movieInfoElement = document.getElementById('movieInfo');
    movieInfoElement.innerHTML = `<p>Movie: ${movieTitle}</p><p>Date: ${movieDate}</p><p>Time: ${movieTime}</p>`;

    // Display the selected seats
    let seatInfoElement = document.getElementById('seatInfo');
    seatInfoElement.innerHTML = '<p>Seats: ' + selectedSeats.join(', ') + '</p>';

    // Handle the order confirmation
    let confirmOrderButton = document.getElementById('confirmOrder');
    confirmOrderButton.onclick = function() {
        // Construct the order payload
        let orderPayload = {
            "UserUuid": userInfo.userGuid,
            "Seats": selectedSeats,
            "TheaterRoom": selectedSchedule.auditorium_num,
            "MovieTime": movieTime,
            "MovieDate": movieDate,
            "IsPaid": true,
            "UserName": userInfo.firstName + ' ' + userInfo.lastName,
            "UserEmail": userInfo.email,
            "MovieTitle": movieTitle // TODO: Replace this with the actual movie title if available
        };
        console.log(orderPayload);

        // Send the POST request to create the order
        fetch('http://localhost:5041/ordersapi/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderPayload)
        })
        .then(response => {
            console.log(response);
            alert("Thank you for placing your order, we hope you enjoy your movie!");

            // After order is confirmed, reserve the seats
            selectedSeatUUIDs.forEach(uuid => {
                fetch('http://localhost:5041/moviesapi/api/schedule/seat', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({uuid: uuid})
                })
                .catch(error => console.error('Error:', error));
            });
        })
        .catch(error => console.error('Error:', error));
    };
};
