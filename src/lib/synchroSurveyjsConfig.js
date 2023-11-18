import {createTables, deleteAll, insertRows} from '../db/db';
import {apiGetSurveyjsConfig} from '../api/api';

var synchroSurveyjsConfigEncours = false;

export function synchroSurveyjsConfig() {

    if(synchroSurveyjsConfigEncours) {
        console.log(" >>> SYNCHRO SURVEYJS PARAMS::BYPASS");
        return Promise.resolve();
    }
    else {
        synchroSurveyjsConfigEncours = true;
    }

    console.log(" >>> SYNCHRO SURVEYJS PARAMS::START");
    return createTables()
    .then( () => deleteAll('surveyjs_config') )
    .then( () => {
        console.log(" >>> SYNCHRO SURVEYJS PARAMS::deleteAll surveyjs_config en db done, now : apiGetSurveyjsConfig");
        return apiGetSurveyjsConfig();
    })
    .then( surveyjsConfig => {
        if(surveyjsConfig.hasOwnProperty("message")) {
            alert(surveyjsConfig.message);
            Promise.reject();
        }
        console.log(" >>> SYNCHRO SURVEYJS PARAMS::apiGetSurveyjsConfig done ("+surveyjsConfig.length+"), now : formatage db, résultat :");
        let surveyjsConfigDbFormatted = [];
        surveyjsConfig.map( config => {
            let arraySurveyjsConfig = [
                null,
                config.survey_id,
                config.json_questions,
                config.date_maj,
            ];
            surveyjsConfigDbFormatted.push(arraySurveyjsConfig);
        });
        console.log(surveyjsConfigDbFormatted);
        return surveyjsConfigDbFormatted;
    } )
    .then( surveyjsConfigDbFormatted => {
        console.log(" >>> SYNCHRO SURVEYJS PARAMS::formatage done, now : création db ("+surveyjsConfigDbFormatted.length+")");
        return insertRows('surveyjs_config', surveyjsConfigDbFormatted);
    })
    .then( () => {
        synchroSurveyjsConfigEncours = false;
        return Promise.resolve();
    })
    .catch( error => { console.log("IN SYNCHRO SURVEYJS PARAMS CATCH ERROR"); console.log(error); } )

}


