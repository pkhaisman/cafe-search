'use-strict';

function formatCafe(cafe) {
    return `
        <li class="list-item">${cafe.venue.name}</li>
    `;
}

function renderCafes(searchResults) {
    console.log(searchResults);

    $('.search-results__list').empty();
    searchResults.response.groups[0].items.forEach(cafe => {
        $('.search-results__list').append(formatCafe(cafe));
    })
}

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

function fetchCafes(coords) {
    const endPoint = 'https://api.foursquare.com/v2/venues/explore'
    const params = {
        client_id: 'UVNI2LYVJN3GTR54P55RXNVXM3FQGOJCULNOF1QWPGSTW31F',
        client_secret: '4BGOSAW1EB2KJUSOIPALLMNMVFZYIB3FJ20RT5WRC3G2XYSC',
        v: '20180323',
        ll: `${coords.lat},${coords.long}`,
        query: 'coffee'
    }
    const queryString = formatQueryParams(params);
    const url = endPoint + '?' + queryString;

    fetch(url)
        .then(response => response.json())
        .then(responseJson => renderCafes(responseJson));
}

function fetchUserLocation() {
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

function handleUserSearch() {
    $('.cafe-search__geolocation-form').submit(event => {
        event.preventDefault();
        fetchUserLocation();
    })
}

$(handleUserSearch);