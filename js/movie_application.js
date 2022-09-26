(function (){
    "use strict"
    const submitEditBtn = $('#submit-edit-btn');

    // object that is used to gather data from modal to transfer to glitch database
    const movieData = {};

    // Grabs Live Node Value from rendering/rendered card to use to auto-fill Edit details
    function populateEdit(data) {
        for (let i = 0; i < data.length; ++i) {
            $(`#edit-btn${[i]}`).click(event => {
                // Traversing Card for Title, Rating, Director, & Genre
                movieData.title = $(`#movies-card${[i]}`).children().children().children().html()
                movieData.director = $(`#movies-card${[i]}`).children().children().children().next().html()
                movieData.genre = $(`#movies-card${[i]}`).children().children().children().next().next().html()
                movieData.rating = $(`#movies-card${[i]}`).children().children().children().next().next().next().html()
                movieData.id = $(`#movies-card${[i]}`).children().children().children().next().next().next().next().html()

                $('#input-title').val(movieData.title)
                $('#input-director').val(movieData.director)
                $('#input-genre').val(movieData.genre)
                $('#input-rating').val(movieData.rating)
            })
        }
        // Delete Event that is triggered by remove button on modal
        // Deletes movie by id from glitch database
        submitEditBtn.click(event => {
            movieData.title = $('#input-title').val()
            movieData.director = $('#input-director').val()
            movieData.genre = $('#input-genre').val()
            movieData.rating = $('#input-rating').val()
            console.log(movieData.id)

            const url = `https://trusted-lavish-roadway.glitch.me/movies/${movieData.id}`;
            const options = {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(movieData),
            };
            fetch(url, options)
                .then(response => {
                    response

                }) /* review was created successfully */
                .catch(error => console.error(error));
        })
        $('#remove-movie').click(event=>{
            console.log(movieData.id);
            const url = `https://trusted-lavish-roadway.glitch.me/movies/${movieData.id}`;
            const options = {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(movieData),
            };
            fetch(url, options)
                .then(response => response) /* review was created successfully */
                .catch(error => console.error(error));
            fetch(`https://trusted-lavish-roadway.glitch.me/movies`)
                .then(response => response.json())
                .then(data =>{
                    console.log(data);
                    let filtered_movies = filterMovies(data);
                    let allMoviesHTML = renderHTML(filtered_movies);
                    $('#movies-card').html(allMoviesHTML);
                })
        })
    }

    // Renders card with movie info to webpage
    function renderHTML(data){
        let html = '';
        for (let i = 0; i < data.length; ++i){
            html +=
                `<div class="d-flex flex-row mx-auto "id="movies-card${[i]}">\n` +
                '    <div class="card " style="width: 22rem;">\n' +
                `    <img src="${data[i].poster}" className="card-img-top" alt="movie poster">\n` +
                '        <div class="card-body bg-light" id="card-body">\n' +
                `            <h3 class="card-text" id="card-movie-title">` + data[i].title + '</h3>\n' +
                `            <h5 class="card-text" id="card-movie-director">` + data[i].director + '</h5>\n' +
                `            <h5 class="card-text" id="card-movie-genre">` + data[i].genre + '</h5>\n' +
                `            <h5 class="card-text" id="card-movie-rating">` + data[i].rating + '</h5>\n' +
                `            <p class="card-text" id="card-movie-rating" style="visibility: hidden">` + data[i].id + '</p>\n' +
                `            <button type="button" id="edit-btn${[i]}" class="btn btn-dark position-absolute bottom-0 end-0" style="font-family: Bungee Shade, cursive" data-bs-toggle="modal" data-bs-target="#staticBackdrop">\n` +
                '                Edit\n' +
                '            </button>\n' +
                '        </div>\n' +
                '    </div>\n' +
                '</div>';
        }
        return html;
    }

    // Filters duplicates, & by posters, rating, and title
    function filterMovies(movies) {
        // reduce duplicate titles to one single instance of movie to display in browser
        // if (key) is already in map replace with the one we're adding
        let reduced_movies = [...movies.reduce((map, movie) => map.set(movie.title, movie), new Map()).values()];
        return title_rating(reduced_movies);
        // console.log(title_rating(reduced_movies));
    }

    // Filters database for all movies with a title and rating to later render to page
    function title_rating(movies){
        let reduce_movies = [];
        movies.filter(movie => {
            if(movie.title && movie.rating && movie.poster ) {
                if(typeof movie.genre === "undefined"){
                    movie.genre = "";
                    if(typeof movie.director === "undefined"){
                        movie.director = "";
                    }
                }
                reduce_movies.push(movie)
            }

        })
        return reduce_movies;
    }
    // Data Manipulation of glitch database
    fetch('https://trusted-lavish-roadway.glitch.me/movies')
        .then(response => response.json())
        .then(data =>{
            let filtered_movies = filterMovies(data);
            let allMoviesHTML = renderHTML(filtered_movies)
            $('#movies-card').html(allMoviesHTML)
            filterMovies(data);
            populateEdit(filtered_movies);
            sortMovies(data);
            return filtered_movies;
        })
        .then(filtered_movies =>{
            $('#s-btn').click(event =>{
                let search_input = $('#s-input').val()
                let search_match = []
                filtered_movies.filter((movie, index) =>{
                    if(search_input === movie.title) {
                        search_match.push(movie);
                        console.log(search_match);
                        let allMoviesHTML = renderHTML(search_match);
                        $('#movies-card').html(allMoviesHTML);
                    }
                })
                if(search_match.length === 0){
                    $('#movies-card').html(placeholder()).css("fontSize", '20px').css("text-align", "center");
                }
            })
        })
    // When search for movies is not found
    function placeholder(){
        let html = '';
        html +=
            '<div id="movies-card">\n' +
            '    <small style="text-align: center">...Movie not found :(</small>\n' +
            '        <button type="button" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#staticBackdropAdd" style="font-family: Bungee Shade, cursive">\n' +
            '               Add Movie\n' +
            '       </button>\n' +
            '</div>';

        return html;
    }
    // Adding movie to glitch database and then rendering to page
    $('#submit-add-button').click(event => {
        let title = $('#input-add-title').val();
        let director = $('#input-add-director').val();
        let genre = $('#input-add-genre').val();
        let rating = $('#input-add-rating').val();
        movieData.title = title;
        movieData.director = director;
        movieData.genre = genre;
        movieData.rating = rating;
        const OMBD_PROMISE = fetch(`https://www.omdbapi.com/?s=${title}&apikey=${KEY}&`);
        const GLITCH_PROMISE = fetch('https://trusted-lavish-roadway.glitch.me/movies');
        Promise.all([OMBD_PROMISE, GLITCH_PROMISE])
            .then(values => {
                return Promise.all(values.map(r => r.json()));
            })
            .then(([movies_db, glitch]) => {
                movieData.poster = movies_db.Search[0].Poster
                console.log(movieData);
                console.log(glitch);
                const url = `https://trusted-lavish-roadway.glitch.me/movies/`;
                const options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(movieData),
                };
                fetch(url, options)
                    .then( response => response.json())/* review was created successfully */
                    .catch(error => error)
                return fetch('https://trusted-lavish-roadway.glitch.me/movies')
                    .then(response => response.json())
                    .then(data => {
                        let filtered_movies = filterMovies(data);
                        let allMoviesHTML = renderHTML(filtered_movies)
                        $('#movies-card').html(allMoviesHTML)
                    })
            })
    })

    //Sorting events
    function sortMovies(movies) {
        $('#action').click(event => {
            let action_movies = [];
            movies.filter(function (movie) {
                if (movie.genre === "action") {
                    action_movies.push(movie);
                }
            })
            return $('#movies-card').html(renderHTML(action_movies));
        })
        $('#drama').click(event => {
            let drama_movies = [];
            movies.filter(function (movie) {
                if (movie.genre === "drama") {
                    drama_movies.push(movie);
                }
            })
            return $('#movies-card').html(renderHTML(drama_movies));
        })
        $('#comedy').click(event => {
            let comedy_movies = [];
            movies.filter(function (movie) {
                if (movie.genre === "comedy") {
                    comedy_movies.push(movie);
                }
            })
            return $('#movies-card').html(renderHTML(comedy_movies));
        })
        $('#romance').click(event => {
            let romance_movies = [];
            movies.filter(function (movie) {
                if (movie.genre === "romance") {
                    romance_movies.push(movie);
                }
            })
            return $('#movies-card').html(renderHTML(romance_movies));
        })
        $('#horror').click(event => {
            let horror_movies = [];
            movies.filter(function (movie) {
                if (movie.genre === "horror") {
                    horror_movies_movies.push(movie);
                }
            })
            return $('#movies-card').html(renderHTML(horror_movies));
        })
        $('#sci-fi').click(event => {
            let sci_fi_movies = [];
            movies.filter(function (movie) {
                if (movie.genre === "sci-fi") {
                    sci_fi_movies.push(movie);
                }
            })
            return $('#movies-card').html(renderHTML(sci_fi_movies));
        })
        $('#all').click(event => {
            let filtered_movies = filterMovies(movies);
            let allMoviesHTML = renderHTML(filtered_movies)
            return $('#movies-card').html(allMoviesHTML);
        })
        $('#favorites').click(event =>{
            let favorites_movies = [];
            movies.filter(function (movie) {
                if (movie.rating > 4) {
                    favorites_movies.push(movie);
                }
            })
            let filtered_movies = filterMovies(favorites_movies);
            return $('#movies-card').html(renderHTML(filtered_movies));
        })
    }
})();




// # Movies Application
//
// For this project, we will be building a single page movie application (SPA). It
// will allow users to add, edit, and delete movies, as well as rate them. We will
// be using [`json-server`](https://github.com/typicode/json-server) to mock a
// database and our backend, so that we can just worry about the front end and AJAX
// requests.
//
//     `json-server` is configured to have a delay of 1.2 seconds, so you can see what
// your application might actually look like, instead of serving instantaneous
// reponses. You can modify this behavior by changing (or removing) the number
// after the `-d` flag inside of the npm `dev` script.
//
// ## Setup
//
// 1. <a href="https://glitch.happyfox.com/kb/article/23-what%E2%80%99s-remixing/" target="_blank">Remix</a> this project to your own glitch account.
// 1. Create a Github organization and create a repository to put your code in there.
// 1. Use your own remixed URL to `fetch` results inside of your project to perform RESTful API requests, it should look like: `https://your-random-url.glitch.me/movies`.
// 1. Keep it in mind that the `json-server` doesn't update in real-time the `db.json` file, but it does respond with the latest information. Always rely on the endpoint that looks like this [https://codeup-json-server.glitch.me/movies](https://codeup-json-server.glitch.me/movies)
//
// ## Specification
//
// Your application should:
//
//     On page load:
//
//     - Display a "loading..." message
// - Make an AJAX request to get a listing of all the movies
// - When the initial AJAX request comes back, remove the "loading..." message
// and replace it with HTML generated from the json response your code
// receives
//
// Allow users to add new movies
//
// - Create a form for adding a new movie that has fields for the movie's title
// and rating
// - When the form is submitted, the page should **not** reload / refresh,
//     instead, your javascript should make a POST request to `/movies` with the
//     information the user put into the form
//
// Allow users to edit existing movies
//
// - Give users the option to edit an existing movie
// - A form should be pre-populated with the selected movie's details
// - Like creating a movie, this should not involve any page reloads, instead
// your javascript code should make an ajax request when the form is
// submitted.
//
//     Delete movies
//
// - Each movie should have a "delete" button
// - When this button is clicked, your javascript should send a `DELETE` request
//
// ### Bonuses
//
// - Add a `disabled` attribute to buttons while their corresponding ajax request
// is still pending.
// - Show a loading animation instead of just text that says "loading...".
// - Use modals for the creating and editing movie forms.
// - Add a `genre` property to every movie.
// - Allow users to sort the movies by rating, title, or genre (if you have it).
// - Allow users to search through the movies by rating, title, or genre (if you
//     have it).
// - Use a free movie API like <a href="http://www.omdbapi.com" target="_blank">OMDB</a> to include extra info or render movie posters.
//
// ## Helpful Hints
//
// - The id property of every movie should not be edited by hand. The purpose of
// this property is to uniquely identify that particular movie. That is, if we
//     want to delete or modify an existing movie, we can specify what movie we want
// to change by referencing it's id. When a new movie is created (i.e.  when you
// send a `POST` request to `/movies` with a title and a rating), the server
// will respond with the movie object that was created, including a generated id.
// - Take a look at the other branches in this repository, as they have
// configuration/setup for common scenarios, such as including bootstrap in your
// application.