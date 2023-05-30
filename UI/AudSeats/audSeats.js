let selectedSchedule = JSON.parse(sessionStorage.getItem('selectedSchedule'));
console.log(selectedSchedule);
console.log(JSON.stringify(selectedSchedule));

const auditorium = document.getElementById('auditorium');
let selectedSeatNumbers = [];
let selectedSeatUUIDs = [];

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
        if(seat.status === "Available") {
            seatButton.onclick = function() {
                if(seat.status === "Available") {
                    seatButton.className = 'seat selected';
                    selectedSeatNumbers.push(seat.seat_num);
                    selectedSeatUUIDs.push(seat.uuid);
                    seat.status = "Selected";
                }
                else if(seat.status === "Selected") {
                    seatButton.className = 'seat available';
                    selectedSeatNumbers = selectedSeatNumbers.filter(num => num !== seat.seat_num);
                    selectedSeatUUIDs = selectedSeatUUIDs.filter(uuid => uuid !== seat.uuid);
                    seat.status = "Available";
                }
            }
        } else {
            seatButton.disabled = true;
        }
    
        auditorium.appendChild(seatButton);
    });
    // data.seats.forEach(seat => {
    //     // Create a new button for each seat
    //     const seatButton = document.createElement('button');
    //     seatButton.className = 'seat ' + seat.status.toLowerCase();
    //     seatButton.innerText = seat.seat_num;
    //     seatButton.id = seat.uuid;
        
    //     // Listen for click events
    //     seatButton.onclick = function() {
    //         if(seat.status === "Available") {
    //             seatButton.className = 'seat selected';
    //             selectedSeatNumbers.push(seat.seat_num);
    //             selectedSeatUUIDs.push(seat.uuid);
    //             seat.status = "Selected";
    //         }
    //         else if(seat.status === "Selected") {
    //             seatButton.className = 'seat available';
    //             selectedSeatNumbers = selectedSeatNumbers.filter(num => num !== seat.seat_num);
    //             selectedSeatUUIDs = selectedSeatUUIDs.filter(uuid => uuid !== seat.uuid);
    //             seat.status = "Available";
    //         }
    //     }

    //     auditorium.appendChild(seatButton);
    // });
})
.catch(error => console.error('Error:', error));

document.getElementById("confirmSelection").addEventListener("click", function() {
    sessionStorage.setItem('selectedSeatNumbers', JSON.stringify(selectedSeatNumbers));
    sessionStorage.setItem('selectedSeatUUIDs', JSON.stringify(selectedSeatUUIDs));
    window.location.href = '../OrderPage/orderPage.html';
});
