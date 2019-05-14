'use-strict';

function markCafe(cafe) {
    let marker = new google.maps.Marker({
        position: {
            lat: cafe.venue.location.lat,
            lng: cafe.venue.location.lng
        },
        title: cafe.venue.name,
    });

    return marker;
}

function showInfoWindow(cafe, map, infoWindow) {
    infoWindow.setContent(`${cafe.venue.name}`)
    infoWindow.setPosition({
        lat: cafe.venue.location.lat,
        lng: cafe.venue.location.lng
    });
    infoWindow.open(map);
}

function renderMapMarkers(cafes, map, infoWindow) {
    $('.search-results__list').on('mouseenter mouseleave', '.search-results__list-item', () => {
        $(event.target)
            .closest('.search-results__list-item')
            .toggleClass('hover-styles');

        let cafe = null;
        let cafesArr = cafes.response.groups[0].items;
        let venueId = $(event.target).attr('id');

        for (let i = 0; i < cafesArr.length; i++) {
            if (venueId === cafesArr[i].venue.id) {
                cafe = cafesArr[i];
                showInfoWindow(cafe, map, infoWindow);
                break;
            } 
        }
    })

    cafes.response.groups[0].items.forEach(cafe => {
        let marker = markCafe(cafe);
        marker.setMap(map);
        marker.addListener('click', () => {
            console.log('click marker');
            showInfoWindow(cafe, map, infoWindow);
        })
    });
}

function initMap(coords, cafes) {
    console.log('initMap ran');

    let map = new google.maps.Map(document.getElementById('map'), {
        center: coords,
        zoom: 13
    });
    let infoWindow = new google.maps.InfoWindow({});
    renderMapMarkers(cafes, map, infoWindow);
}

function formatCafePicUrl(cafe) {
    console.log('formatCafePicUrl ran');

    const prefix = cafe.response.venue.bestPhoto.prefix;
    const suffix = cafe.response.venue.bestPhoto.suffix;
    const dimensions = '100x100';
    const url = prefix + dimensions + suffix;
    return url;
}

function displayCafeInfo(info) {
    if (info) {
        return info;
    } else {
        return 'Data not found';
    }
}

function formatCafe(cafe) {
    console.log('formatCafe ran');

    return `
        <li id="${cafe.response.venue.id}" class="search-results__list-item">
            <div>
                ${cafe.response.venue.name}
                <img class="search-results__list-item__img" src="#" alt="Image of ${cafe.response.venue.name}">
                <ul class="search-results__list-item__info">
                    <li>Hours: ${displayCafeInfo(cafe.response.venue.hours.status)}</li>
                    <li>Address: ${displayCafeInfo(cafe.response.venue.location.address)}</li>
                    <li>Website: ${displayCafeInfo(cafe.response.venue.url)}</li>
                    <li>Rating: ${displayCafeInfo(cafe.response.venue.rating)}</li>
                    <li>Reviews: ${displayCafeInfo(cafe.response.venue.ratingSignals)}</li>
                </ul>
            </div>
        </li>
    `;
}

function renderCafe(cafe) {
    console.log('renderCafes ran');
    console.log(cafe);

    $('.search-results__list').append(formatCafe(cafe));
}

function formatCafeAlt(cafe) {
    return `
        <li id="${cafe.venue.id}" class="search-results__list-item">
            <div>
                <div class="search-results__list-item__name-rating">
                    <p>${cafe.venue.name}</p>
                    <p>8.9 stars (86)</p>
                </div>
                <div>
                    <p class="search-results__list-item__info">${cafe.venue.location.address}</p>
                    <p class="search-results__list-item__info">Open until 6:00 PM</p>
                    <p class="search-results__list-item__info"><a href="3">Website</a></p>
                </div>
            </div>
            <div>
                <div>
                    <img class="search-results__list-item__img" src="#" alt="Image of ${cafe.venue.name}">
                </div>
            </div>
        </li>
    `;
}

function renderCafeAlt(cafe) {
    console.log('renderCafeAlt ran');
    $('.search-results__list').append(formatCafeAlt(cafe));
}

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
        .then(handleError)
        .then(response => response.json())
        .then(responseJson => {
            renderCafe(responseJson);
        })
        .catch(error => {
            alert('There was an error in accessing cafe information.');
        })
}

function formatQueryParams(params) {
    console.log('formatQueryParams ran');

    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

function handleError(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
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
        limit: 20
    }
    const queryString = formatQueryParams(params);
    const url = endPoint + '?' + queryString;

    fetch(url)
        .then(handleError)
        .then(response => response.json())
        .then(responseJson => {
            console.log(responseJson);
            responseJson.response.groups[0].items.forEach(cafe => {
                renderCafeAlt(cafe);
                // fetchCafeInfo(cafe.venue.id);
            });
            initMap(coords, responseJson);
        })
        .catch(error => {
            alert('There was an error in accessing cafes near you. Please try again later.');
        });
}

function scrollToResults() {
    $('.main-content')
    .removeClass('hidden')
    .addClass('main-content--set-height');

    window.scrollBy({
        top: window.innerHeight,
        behavior: 'smooth'
    });
}

function fetchUserLocation() {
    console.log('fetchUserLocation ran');

    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            const coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            }        
            scrollToResults();
            fetchCafes(coords);
        });
    } else {
        alert('There was an error in determining your location');
    }
}

function fetchUserCoords(userInput) {
    console.log('fetchUserCoords ran');

    const endPoint = 'https://maps.googleapis.com/maps/api/geocode/json'
    const params = {
        key: 'AIzaSyAkVfjrsbDT63PPJiJ10m3lNEiEy6Yjhao',
        address: userInput.split(' ').join('+'),
    }
    const queryString = formatQueryParams(params);
    const url = endPoint + '?' + queryString;

    fetch(url)
        .then(handleError)
        .then(response => response.json())
        .then(responseJson => {
            const coords = {
                lat: responseJson.results[0].geometry.location.lat,
                lng: responseJson.results[0].geometry.location.lng 
            }
            scrollToResults();
            fetchCafes(coords);
        })
        .catch(error => {
            alert('There was an error in getting coordinates');
        });
}

function handleUserSearchByLocationInput() {
    console.log('search by user input');

    $('.js-user-input').click(event => {
        event.preventDefault();
        let userInput = $('input').val();
        fetchUserCoords(userInput);
    })
}

function handleUserSearchByGeolocation() {
    console.log('handleUserSearch ran');

    $('.js-geolocation').click(event => {
        event.preventDefault();
        fetchUserLocation();
    })
}

function renderApp() {
    handleUserSearchByGeolocation();
    handleUserSearchByLocationInput();
}

$(renderApp);