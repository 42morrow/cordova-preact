import $ from 'jquery';

function fetchCollection(path) {

    return fetch(ENV_API_ENDPOINT + path, {
        headers: { "Authorization": "ApiKey "+ENV_API_KEY },
    }).then(resp => { return Promise.resolve(resp.json()); } );

}

export function apiGetSalons() {
    let collection = fetchCollection('get-salons');
    return collection;
}

export function apiGetInterventionsSalon(salonSlug) {
    let collection = fetchCollection('interventions/'+salonSlug);
    return collection;
}

export function apiGetInterventions() {
    let collection = fetchCollection('interventions');
    return collection;
}

export function apiGetSurveyjsConfig() {
    let collection = fetchCollection('surveyjs-config');
    return collection;
}

export function apiSetInterventions(data) {

    return new Promise((resolve, reject) => {
        $.ajax({
            headers: { "Authorization": "ApiKey "+ENV_API_KEY },
            type: 'POST',
            url: ENV_API_ENDPOINT + "set-interventions",
            data: JSON.stringify(data),
            error: ( error ) => { console.log('AJAX ERROR'); reject(error); },
            success: (data) => { console.log('AJAX SUCCESS'); resolve(data); },
        })
    });

}

export function apiLogin(username, password) {

    return new Promise((resolve, reject) => {
        $.ajax({
            headers: { "Authorization": "ApiKey "+ENV_API_KEY },
            type: 'POST',
            url: ENV_API_ENDPOINT + "login",
            data: JSON.stringify({
                username: username,
                password: password,
            }),
            error: ( error ) => { console.log('AJAX ERROR'); console.log(error); reject(error.responseJSON); },
            success: ( data ) => { console.log('AJAX SUCCESS'); resolve(data); },
        })
    });

}


