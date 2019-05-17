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
    infoWindow.setContent(`${cafe.venue.name}`);
    infoWindow.setPosition({
        lat: cafe.venue.location.lat,
        lng: cafe.venue.location.lng
    });
    infoWindow.open(map);
}

function markUserLocation(map, infoWindow, coords) {
    let userLocation = new google.maps.Marker({
        position: coords,
        title: 'My location',
        icon: 'http://maps.google.com/mapfiles/kml/paddle/red-circle-lv.png'
    });
    userLocation.setMap(map);
    userLocation.addListener('click', () => {
        infoWindow.setContent('My location');
        infoWindow.setPosition(coords);
        infoWindow.open(map);
    });
}

function highlighSelectionOnMap(cafes, map, infoWindow) {
    $('.search-results__list').on('click mouseenter mouseleave', '.search-results__list-item', () => {
        $('.search-results__list')
            .children()
            .removeClass('hover-styles');
        $(event.target)
            .closest('.search-results__list-item')
            .toggleClass('hover-styles');

        let cafesArr = cafes.response.groups[0].items;
        let venueId = $(event.target).closest('.search-results__list-item').attr('id');

        for (let i = 0; i < cafesArr.length; i++) {
            if (venueId === cafesArr[i].venue.id) {
                showInfoWindow(cafesArr[i], map, infoWindow);
                break;
            } 
        }
    });
}

function addMarkerListeners(marker, cafe, map, infoWindow) {
    function removeClassHover() {
        return $('.search-results__list').children().removeClass('hover-styles'); 
    }  

    function toggleClassHover() {
        return $('.search-results__list').children(`#${cafe.venue.id}`).toggleClass('hover-styles');
    } 

    marker.addListener('mouseover', () => {
        showInfoWindow(cafe, map, infoWindow);
        removeClassHover();
        toggleClassHover();
        
    });
    marker.addListener('click', () => {
        showInfoWindow(cafe, map, infoWindow);
        removeClassHover();
        toggleClassHover();
    });
}

function renderMapMarkers(cafes, map, infoWindow, coords) {
    markUserLocation(map, infoWindow, coords);  
    highlighSelectionOnMap(cafes, map, infoWindow);  

    cafes.response.groups[0].items.forEach(cafe => {
        let marker = markCafe(cafe);
        marker.setMap(map);
        addMarkerListeners(marker, cafe, map, infoWindow);
    });
}

function initMap(coords, cafes) {
    let map = new google.maps.Map(document.getElementById('map'), {
        center: coords,
        zoom: 15
    });
    let infoWindow = new google.maps.InfoWindow({
        maxWidth: 100
    });
    renderMapMarkers(cafes, map, infoWindow, coords);
}

function formatCafePicUrl(cafe) {
    const prefix = cafe.response.venue.bestPhoto.prefix;
    const suffix = cafe.response.venue.bestPhoto.suffix;
    const dimensions = '100x100';
    const url = prefix + dimensions + suffix;
    return url;
}

function renderCafe(cafe) {
    const cafeData = cafe.response.venue;
    $('.search-results__list').append(`
        <li id="${cafeData.id}" class="search-results__list-item">
            <div class="search-results__list-item__info">
                <h3>${cafeData.name}</h3>
                <p>${cafeData.rating}/10<i class="fas fa-star"></i>(${cafeData.ratingSignals})</p>
                <p>${cafeData.location ? cafeData.location.address : '-'}</p>
                <p>${cafeData.hours ? cafeData.hours.status : '-'}</p>    
                <a href="${cafeData.url}" target="_blank"><button class="search-results__list-item__btn">Website</button></a>
            </div>
            <div>                
                <img class="search-results__list-item__img" src="${formatCafePicUrl(cafe)}" alt="Image of ${cafeData.name}">
            </div>
        </li>
    `);
}

function fetchCafeInfo(cafeId) {
    const endPoint = `https://api.foursquare.com/v2/venues/${cafeId}`;
    const params = {
        client_id: 'UVNI2LYVJN3GTR54P55RXNVXM3FQGOJCULNOF1QWPGSTW31F',
        client_secret: '4BGOSAW1EB2KJUSOIPALLMNMVFZYIB3FJ20RT5WRC3G2XYSC',
        v: '20180323',
    };
    const queryString = formatQueryParams(params);
    const url = endPoint + '?' + queryString;

    fetch(url)
        .then(handleError)
        .then(response => response.json())
        .then(responseJson => {
            renderCafe(responseJson);
        })
        .catch(error => {
            alert('There was an error in accessing cafe information. Please look at console for more info.');
        });
}

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
}

function handleError(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

function fetchCafes(coords) {
    const endPoint = 'https://api.foursquare.com/v2/venues/explore';
    const params = {
        client_id: 'UVNI2LYVJN3GTR54P55RXNVXM3FQGOJCULNOF1QWPGSTW31F',
        client_secret: '4BGOSAW1EB2KJUSOIPALLMNMVFZYIB3FJ20RT5WRC3G2XYSC',
        v: '20180323',
        ll: `${coords.lat},${coords.lng}`,
        query: 'coffee',
        limit: 5
    };
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
        alert('There was an error in determining your location. Search by input instead');
    }
}

function fetchUserCoords(userInput) {
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
            alert('There was an error in finding your location');
        });
}

function handleUserSearchByLocationInput() {
    $('.js-user-input').click(event => {
        event.preventDefault();
        $('.search-results__list').empty();
        let userInput = $('input').val();
        fetchUserCoords(userInput);
    })
}

function handleUserSearchByGeolocation() {
    $('.js-geolocation').click(event => {
        event.preventDefault();
        $('.search-results__list').html('');
        fetchUserLocation();
    })
}

function showUserForm() {
    $('.header__btn__input').click(() => {
        $('.header__btn__input').toggleClass('hidden');
        $('.header__form').toggleClass('hidden');
    })
}

function renderApp() {
    handleUserSearchByGeolocation();
    handleUserSearchByLocationInput();
    showUserForm();
}

$(renderApp);