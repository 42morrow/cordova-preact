import $ from 'jquery';

function fetchCollection(path) {

    /*
    fetch(ENV_API_ENDPOINT + path)
    .then(res => { console.log(res); return res.json(); })
    .then(txt => console.log(txt))
    .catch(err => console.error(err));
    */

    return fetch(ENV_API_ENDPOINT + path).then(resp => resp.json()).then( json => { console.log("fetchCollection "+path+":"); console.log(json.data); return json.data; });

}

export function apiGetSalons() {
    let collection = fetchCollection('salons');
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

export function apiSetInterventions(data) {

    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'POST',
            url: ENV_API_ENDPOINT + "set-interventions",
            data: JSON.stringify(data),
            error: ( error ) => { console.log('AJAX ERROR'); reject(error); },
            success: () => { console.log('AJAX SUCCESS'); resolve(data); },
        })
    });

  }


