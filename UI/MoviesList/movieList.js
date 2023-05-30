window.onload = function() {

    fetch('http://localhost:5041/moviesapi/api/get/showing', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        const data = response.json();
        console.log(data);
        return data;
    })
    .then(data => {
        console.log(data);
        let movies = data.movies;
        let moviesContainer = document.getElementById('movies-container');

        movies.forEach(movie => {
            let movieDiv = document.createElement('div');
            movieDiv.classList.add('movie');
            movieDiv.onclick = function() {
                localStorage.setItem('selectedMovie', movie.uuid);
                window.location.href = "../MoviePage/moviePage.html"; //Redirect to movie page
            };

            let title = document.createElement('h2');
            title.textContent = movie.title;

            let description = document.createElement('p');
            description.textContent = movie.description;

            let runtime = document.createElement('p');
            runtime.textContent = 'Runtime: ' + movie.runtime + ' minutes';

            let rating = document.createElement('p');
            rating.textContent = 'Rating: ' + movie.rating;

            let isShowing = document.createElement('p');
            isShowing.textContent = 'Currently Showing: ' + (movie.isShowing ? 'Yes' : 'No');

            movieDiv.appendChild(title);
            movieDiv.appendChild(description);
            movieDiv.appendChild(runtime);
            movieDiv.appendChild(rating);
            movieDiv.appendChild(isShowing);

            moviesContainer.appendChild(movieDiv);
        });
    })
    .catch(error => console.error('Error:', error));
}
