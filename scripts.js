'use-strict';

function formatCafe(cafe) {
    console.log('formatCafe ran');

    return `
        <li>${cafe}</li>
    `;
}

function renderCafes(searchResults) {
    console.log('renderCafes ran');

    console.log(searchResults);

    searchResults.restaurants.forEach(cafe => {
        $('.search-results__list').append(formatCafe(cafe.restaurant.name));
    })
}

function fetchCafes(location) {
    console.log('fetchCafes ran');

    const url = 'https://developers.zomato.com/api/v2.1/search?entity_id=287&entity_type=city&establishment_type=286';
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

function handleSearch() {
    console.log('handleSearch ran');

    let location = $('.cafe-search__input').val();
    fetchCafes(location);
}

function submitClickListener() {
    console.log('submitClickListener ran');

    $('.cafe-search__form').submit(event => {
        event.preventDefault();
        handleSearch();
    })
}

function runApp() {
    submitClickListener();
}

$(runApp);