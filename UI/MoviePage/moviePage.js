window.onload = function() {
    let movieUuid = localStorage.getItem('selectedMovie');
    
    // Fetch movie details
    fetch('localhost:5041/moviesapi/api/' + movieUuid, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(movieDetails => {
        // Display the movie details
        document.getElementById('movie-title').textContent = movieDetails.title;
        document.getElementById('movie-description').textContent = movieDetails.description;
        document.getElementById('movie-runtime').textContent = "Runtime: " + movieDetails.runtime + " minutes";
        document.getElementById('movie-rating').textContent = "Rating: " + movieDetails.rating;
        document.getElementById('movie-showing').textContent = "Currently Showing: " + (movieDetails.isShowing ? 'Yes' : 'No');
    })
    .catch(error => console.error('Error:', error));
}

function fetchMovieSchedule() {
    let movieUuid = localStorage.getItem('selectedMovie');
    let movieDate = document.getElementById('movie-date-picker').value;

    let scheduleRequestBody = {
        date: movieDate
    };

    fetch('localhost:5041/moviesapi/api/schedule/aud-schedules', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleRequestBody)
    })
    .then(response => response.json())
    .then(data => {
        let movieScheduleContainer = document.getElementById('movie-schedule-container');

        data.auditorium_schedules.forEach(auditorium_schedule => {
            auditorium_schedule.schedules.forEach(schedule => {
                if(schedule.movie_uuid == movieUuid) {
                    let startTime = new Date(schedule.start_time.seconds * 1000); //Convert from Unix timestamp to JavaScript Date object
                    let endTime = new Date(schedule.end_time.seconds * 1000); //Convert from Unix timestamp to JavaScript Date object

                    let scheduleElement = document.createElement('div');
                    scheduleElement.textContent = `Showing in Auditorium ${schedule.auditorium_num} from ${startTime.toLocaleTimeString()} to ${endTime.toLocaleTimeString()}`;

                    scheduleElement.onclick = function() {
                        localStorage.setItem('selectedSchedule', JSON.stringify(schedule));
                        //Redirect to next page
                    };

                    movieScheduleContainer.appendChild(scheduleElement);
                }
            });
        });
    })
    .catch(error => console.error('Error:', error));
}
