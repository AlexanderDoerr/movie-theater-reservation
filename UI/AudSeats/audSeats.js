let selectedSchedule = JSON.parse(sessionStorage.getItem('selectedSchedule'));
console.log(selectedSchedule);

console.log(JSON.stringify(selectedSchedule));

const auditorium = document.getElementById('auditorium');
let selectedSeats = [];

fetch('http://localhost:5041/moviesapi/api/schedule/seats', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(selectedSchedule)
})
.then(response => response.json())
.then(data => {
    console.log(data);
    data.seats.forEach(seat => {
        // Create a new button for each seat
        const seatButton = document.createElement('button');
        seatButton.className = 'seat ' + seat.status.toLowerCase();
        seatButton.innerText = seat.seat_num;
        seatButton.id = seat.uuid;
        
        // Listen for click events
        seatButton.onclick = function() {
            if(seat.status === "Available") {
                seatButton.className = 'seat selected';
                selectedSeats.push(seat.uuid);
                seat.status = "Selected";
            }
            else if(seat.status === "Selected") {
                seatButton.className = 'seat available';
                selectedSeats = selectedSeats.filter(uuid => uuid !== seat.uuid);
                seat.status = "Available";
            }
        }

        auditorium.appendChild(seatButton);
    });
})
.catch(error => console.error('Error:', error));

document.getElementById("confirmSelection").addEventListener("click", function() {
    sessionStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
    window.location.href = '../OrderPage/orderPage.html';
});
