'use-strict';

function initMap(coords, cafes) {
    let map = new google.maps.Map(document.getElementById('map'), {
        center: coords,
        zoom: 14
    });

    function markCafe(cafe) {
        let marker = new google.maps.Marker({
            map: map,
            position: {
                lat: cafe.venue.location.lat,
                lng: cafe.venue.location.lng
            },
            title: cafe.venue.name
        });
    }

    cafes.response.groups[0].items.forEach(cafe => markCafe(cafe));
}

// can't continue now. api quota reached
// function getCafePhoto(cafe) {
//     console.log('getCafePhoto ran');

//     const venueId = cafe.venue.id;
//     const endPoint = `https://api.foursquare.com/v2/venues/${venueId}/photos`;
//     const params = {
//         client_id: 'UVNI2LYVJN3GTR54P55RXNVXM3FQGOJCULNOF1QWPGSTW31F',
//         client_secret: '4BGOSAW1EB2KJUSOIPALLMNMVFZYIB3FJ20RT5WRC3G2XYSC',
//         v: '20180323'
//     }
//     const queryString = formatQueryParams(params);
//     const url = endPoint + '?' + queryString;

//     fetch(url)
//         .then(response => response.json())
//         .then(responseJson => console.log(responseJson)
//     );
// }

function handleMoreInfo() {
    console.log('handleMoreInfo ran');
    $('.search-results__list').on('click', '.more-info', () => {
        renderMoreInfo()
    })
}

function formatCafe(cafe) {
    // return `
    //     <li style="background-image: url(${getCafePhoto(cafe)});" class="list-item">${cafe.venue.name}</li>
    // `;

    return `
        <li class="list-item">
            ${cafe.venue.name}
            <button class="more-info">More Info</button>
        </li>
    `;
}

function renderCafes(searchResults, coords) {
    console.log(searchResults);

    $('.search-results__list').empty();
    initMap(coords, searchResults);
    searchResults.response.groups[0].items.forEach(cafe => {
        $('.search-results__list').append(formatCafe(cafe));
    });
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
        ll: `${coords.lat},${coords.lng}`,
        query: 'coffee'
    }
    const queryString = formatQueryParams(params);
    const url = endPoint + '?' + queryString;

    fetch(url)
        .then(response => response.json())
        .then(responseJson => renderCafes(responseJson, coords));
}

function fetchUserLocation() {
    if ('geolocation' in navigator) {
        console.log('geolocation in navigator');

        navigator.geolocation.getCurrentPosition(position => {
            const coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            }        
            fetchCafes(coords);
            // initMap(coords);
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
    handleMoreInfo();
}

$(handleUserSearch);