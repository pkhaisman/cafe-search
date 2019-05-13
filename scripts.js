'use-strict';

function handleCafeInfoQuery() {
    $('.search-results__list').on('click', () => {
        $(event.target)
            .children('.search-results__list-item__info')
            .toggleClass('hidden');
    })
}

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
        zoom: 12
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

function formatCafe(cafe) {
    console.log('formatCafe ran');

    return `
        <li id="${cafe.response.venue.id}" class="search-results__list-item">
            <div>
                ${cafe.response.venue.name}
                <img class="search-results__list-item__img" src="${formatCafePicUrl(cafe)}" alt="Image of ${cafe.response.venue.name}">
                <ul class="search-results__list-item__info hidden">
                    <li>Rating: ${cafe.response.venue.rating}</li>
                    <li>City: ${cafe.response.venue.location.city}</li>
                    <li>Price: ${cafe.response.venue.price.message}</li>
                </ul>
            </div>
        </li>
    `;
}

function renderCafe(cafe) {
    console.log('renderCafes ran');

    $('.search-results__list').append(formatCafe(cafe));
}

function formatHardCodedCafes() {
    return `
        <li class="search-results__list-item">
            <div>
                Cafe Name
                <img class="search-results__list-item__img" src="#" alt="Image of 'Cafe Name'">
                <ul class="search-results__list-item__info hidden">
                    <li>Rating: rating</li>
                    <li>City: city</li>
                    <li>Price: price</li>
                </ul>
            </div>
        </li>
    `;
}

function renderHardCodedCafes() {
    $('.search-results__list').append(formatHardCodedCafes());
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
            alert('There was an error in accessing cafe information. Rendering hard coded results instead.');
            renderHardCodedCafes();
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
        limit: 2
    }
    const queryString = formatQueryParams(params);
    const url = endPoint + '?' + queryString;

    fetch(url)
        .then(handleError)
        .then(response => response.json())
        .then(responseJson => {
            responseJson.response.groups[0].items.forEach(cafe => {
                fetchCafeInfo(cafe.venue.id);
            });
            initMap(coords, responseJson);
        })
        .catch(error => {
            alert('There was an error in accessing cafes near you. Please try again later.');
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
        alert('There was an error in determining your location');
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