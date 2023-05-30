window.onload = function() {
    let selectedSchedule = JSON.parse(sessionStorage.getItem('selectedSchedule'));
    let selectedSeats = JSON.parse(sessionStorage.getItem('selectedSeats'));
    let userInfo = JSON.parse(sessionStorage.getItem('userInfo'));

    console.log(selectedSchedule);
    console.log(selectedSeats);
    console.log(userInfo);

    // Format and display the movie information
    let movieDate = new Date(selectedSchedule.start_time.seconds * 1000).toISOString().split('T')[0];
    let movieTime = new Date(selectedSchedule.start_time.seconds * 1000).toISOString();
    let movieInfoElement = document.getElementById('movieInfo');
    movieInfoElement.innerHTML = `<p>Movie: ${selectedSchedule.movieUuid}</p><p>Date: ${movieDate}</p><p>Time: ${movieTime}</p>`;

    // Display the selected seats
    let seatInfoElement = document.getElementById('seatInfo');
    seatInfoElement.innerHTML = '<p>Seats: ' + selectedSeats.join(', ') + '</p>';

    // Handle the order confirmation
    let confirmOrderButton = document.getElementById('confirmOrder');
    confirmOrderButton.onclick = function() {
        // Construct the order payload
        let orderPayload = {
            "UserUuid": userInfo.uuid,
            "Seats": selectedSeats,
            "TheaterRoom": selectedSchedule.auditorium_num,
            "MovieTime": movieTime,
            "MovieDate": movieDate,
            "IsPaid": true,
            "UserName": userInfo.name,
            "UserEmail": userInfo.email,
            "MovieTitle": selectedSchedule.movieUuid // TODO: Replace this with the actual movie title if available
        };

        // Send the POST request to create the order
        fetch('http://localhost:5041/ordersapi/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderPayload)
        })
        .then(response => response.json())
        .then(data => {
            alert("Thank you for placing your order, we hope you enjoy your movie!");
        })
        .catch(error => console.error('Error:', error));
    };
};
