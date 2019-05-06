'use-strict';

function formatCafe(cafe) {
    console.log('formatCafe ran');

    return `
        <li class="list-item">${cafe}</li>
    `;
}

function renderCafes(searchResults) {
    console.log('renderCafes ran');

    console.log(searchResults);

    searchResults.restaurants.forEach(cafe => {
        $('.search-results__list').append(formatCafe(cafe.restaurant.name));
    })
}

function fetchCafes(coords) {
    console.log('fetchCafes ran');

    const lat = coords.lat;
    const long = coords.long;

    const url = `https://developers.zomato.com/api/v2.1/search?lat=${lat}&lon=${long}&radius=8000&establishment_type=286`;
    const apiKey = 'bf3a734186bb3b42c6dfa0df0eb323f5';
    const options =  {
        headers: new Headers({
            'user-key': apiKey
        })
    };

    fetch(url, options)
        .then(response => response.json())
        .then(responseJson => renderCafes(responseJson));
}

function handleGeolocationSearch() {
    console.log('handleGeolocationSearch ran');
    if ('geolocation' in navigator) {
        console.log('geolocation in navigator');
        navigator.geolocation.getCurrentPosition(position => {
            const coords = {
                lat: position.coords.latitude,
                long: position.coords.longitude
            }        
            fetchCafes(coords);
        });
    } else {
        console.log('prompt user to input location');
    }
}

function convertToLatLong(responseJson) {
    console.log('convertToLatLong ran');
    const coords = {
        lat: responseJson.results[0].geometry.location.lat,
        long: responseJson.results[0].geometry.location.lng
    }
    fetchCafes(coords);
}

function fetchLocation(location) {
    console.log('fetchLocation ran');

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=AIzaSyAkVfjrsbDT63PPJiJ10m3lNEiEy6Yjhao`;

    fetch(url)
        .then(response => response.json())
        .then(responseJson => convertToLatLong(responseJson));
}

function handleLocationSearch() {
    console.log('handleLocationSearch ran');

    let location = $('.cafe-search__input').val();
    console.log(location);
    fetchLocation(location);
}

function submitClickListener() {
    console.log('submitClickListener ran');

    $('.cafe-search__location-form').submit(event => {
        console.log('click location');
        event.preventDefault();
        handleLocationSearch();
    })

    $('.cafe-search__geolocation-form').submit(event => {
        console.log('click geolocation');
        event.preventDefault();
        handleGeolocationSearch();
    })
}

function runApp() {
    submitClickListener();
}

$(runApp);