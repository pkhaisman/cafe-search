'use-strict';

function fetchCafeInfo(cafeId) {
    console.log('fetchCafeInfo ran');
   
    const endPoint = `https://api.foursquare.com/v2/venues/${cafeId}`;
    const params = {
        client_id: 'UVNI2LYVJN3GTR54P55RXNVXM3FQGOJCULNOF1QWPGSTW31F',
        client_secret: '4BGOSAW1EB2KJUSOIPALLMNMVFZYIB3FJ20RT5WRC3G2XYSC',
        v: '20180323',
    }
    const queryString = formatQueryParams(params);
    const url = endPoint + '?' + queryString;

    fetch(url)
        .then(response => response.json())
        .then(responseJson => {
            renderCafe(responseJson);
        });
}

function handleCafeInfoQuery() {
    // add click listener
    $('.search-results__list').on('click', '.search-results__list-item', () => {
        // show more info
        $(event.target)
            .parent()
            .children('.search-results__list-item__info')
            .toggleClass('hidden');
    })
}

function initMap(coords, cafes) {
    console.log('initMap ran');

    let map = new google.maps.Map(document.getElementById('map'), {
        center: coords,
        zoom: 14
    });

    $('#map').addClass('map--style');

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

function formatCafePicUrl(cafe) {
    console.log('formatCafePicUrl ran');

    const prefix = cafe.response.venue.bestPhoto.prefix;
    const suffix = cafe.response.venue.bestPhoto.suffix;
    const dimensions = '100x100';
    const url = prefix + dimensions + suffix;
    return url;
}

function formatCafe(cafe) {
    console.log('formatCafe ran');
    console.log(cafe);

    return `
        <li class="search-results__list-item">
            ${cafe.response.venue.name}
            <button class="search-results__list-item__btn">More Info</button>
            <img class="search-results__list-item__img" src="${formatCafePicUrl(cafe)}" alt="Image of ${cafe.response.venue.name}">
            <ul class="search-results__list-item__info hidden">
                <li>Rating: ${cafe.response.venue.rating}</li>
                <li>City: ${cafe.response.venue.location.city}</li>
                <li>Price: ${cafe.response.venue.price.message}</li>
            </ul>
        </li>
    `;
}

function renderCafe(cafe) {
    console.log('renderCafes ran');

    $('.search-results__list').append(formatCafe(cafe));
}

function formatQueryParams(params) {
    console.log('formatQueryParams ran');

    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

function fetchCafes(coords) {
    console.log('fetchCafes ran');

    const endPoint = 'https://api.foursquare.com/v2/venues/explore'
    const params = {
        client_id: 'UVNI2LYVJN3GTR54P55RXNVXM3FQGOJCULNOF1QWPGSTW31F',
        client_secret: '4BGOSAW1EB2KJUSOIPALLMNMVFZYIB3FJ20RT5WRC3G2XYSC',
        v: '20180323',
        ll: `${coords.lat},${coords.lng}`,
        query: 'coffee',
        limit: 1
    }
    const queryString = formatQueryParams(params);
    const url = endPoint + '?' + queryString;

    fetch(url)
        .then(response => response.json())
        .then(responseJson => {
            initMap(coords, responseJson);
            
            // for each cafe in cafesObj, get the cafe info
            // consider separating into a function
            responseJson.response.groups[0].items.forEach(cafe => {
                fetchCafeInfo(cafe.venue.id);
            });
        });
}

function fetchUserLocation() {
    console.log('fetchUserLocation ran');

    if ('geolocation' in navigator) {
        console.log('geolocation in navigator');

        navigator.geolocation.getCurrentPosition(position => {
            const coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            }        
            fetchCafes(coords);
        });
    } else {
        console.log('prompt user to input location');
    }
}

function handleUserSearch() {
    console.log('handleUserSearch ran');

    $('.header__btn').click(event => {
        event.preventDefault();
        fetchUserLocation();
    })
}

function renderApp() {
    handleUserSearch();
    handleCafeInfoQuery();
}

$(renderApp);