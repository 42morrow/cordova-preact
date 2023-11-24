import {createTables, dbGetInterventions, dbGetInterventionsATransferer, update, insertRows, deleteIds, dbGetSurveyjsAllConfigs} from '../db/db';
import {apiGetInterventions, apiSetInterventions} from '../api/api';
import {log} from '../lib/log';

import {structureIntervention} from '../config/structureIntervention';

var synchroInterventionsEncours = false;

export function synchroInterventions(user) {

    if(synchroInterventionsEncours) {
        log(user, "info", " >>> SYNCHRO INTERVENTIONS::BYPASS");
        return Promise.resolve("bypass");
    }
    else {
        synchroInterventionsEncours = true;
    }

    var interventionsASupprimer = [];
    var globalSurveyjsQuestionsBySurveyjsId = null;

    log(user, "info", " >>> SYNCHRO INTERVENTIONS::START");
    return createTables()
    .then( () => dbGetSurveyjsAllConfigs() )
    .then( (surveyjsQuestionsBySurveyjsId) => {
        globalSurveyjsQuestionsBySurveyjsId = surveyjsQuestionsBySurveyjsId;
        return dbGetInterventionsATransferer();
    })
    .then( interventionsATransferer => {
        log(user, "info", " >>> SYNCHRO INTERVENTIONS::dbGetInterventionsATransferer done ("+interventionsATransferer.length+")")
        if(interventionsATransferer.length > 0) {
            let apiFields = [];
            interventionsATransferer.forEach( intervention => {
                log(user, "info", " >>> SYNCHRO INTERVENTIONS::une intervention à transférer sur le backend, roid : "+intervention.roid);
                apiFields.push({
                    id: intervention.id,
                    interventionId: intervention.roid,
                    surveyjsQuestionnaireId: intervention.surveyjs_id,
                    surveyjsJsonQuestions: intervention.surveyjs_id in globalSurveyjsQuestionsBySurveyjsId ? globalSurveyjsQuestionsBySurveyjsId[intervention.surveyjs_id] : null,
                    surveyjsJsonReponses: intervention.surveyjs_json_reponses,
                });
            });
            return apiSetInterventions({ userId: user.roid, interventions: apiFields });
        }
        else {
            return Promise.resolve([]);
        }
    })
    .then( (apiFields) => {
        log(user, "info", " >>> SYNCHRO INTERVENTIONS::apiSetInterventions done, now : update des interventions en db ("+apiFields.length+")");
        if(apiFields.length > 0) {
            console.log(apiFields);
        }
        apiFields.forEach( intervention => update('intervention', intervention.id, {statut: 'terminee'}));
    })
    .then( () => {
        log(user, "info", " >>> SYNCHRO INTERVENTIONS::update des interventions en db done, now : apiGetInterventions");
        return apiGetInterventions();
    })
    .then( interventionsApi => {
        if(interventionsApi.hasOwnProperty("message")) {
            alert(interventionsApi.message);
            Promise.reject();
        }
        console.log(" >>> SYNCHRO INTERVENTIONS::apiGetInterventions done ("+interventionsApi.length+"), now : formatage des interventions api avec la structure db, résultat :");
        let interventionsApiDbFormatted = [];
        interventionsApi.map( intervention => {
            let arrayIntervention = [
                null,
                intervention.id,
                intervention.salon,
                intervention.salonId,
                intervention.client,
                intervention.date,
                intervention.dateFr,
                intervention.heure,
                intervention.type,
                intervention.typeLabel,
                intervention.surveyjsId,
                intervention.surveyjsReponses,
                intervention.statut,
                new Date().toISOString().substring(0, 17),
                intervention.maj,
            ];
            interventionsApiDbFormatted.push(arrayIntervention);
        });
        console.log(interventionsApiDbFormatted);
        return interventionsApiDbFormatted;
    } )
    .then( (interventionsApi) => {
        log(user, "info", " >>> SYNCHRO INTERVENTIONS::formatage des interventions api avec la structure db done, now : dbGetInterventions");
        return dbGetInterventions(interventionsApi);
    })
    .then( ({interventionsDb, interventionsApi}) => {
        log(user, "info", " >>> SYNCHRO INTERVENTIONS::dbGetInterventions done ("+interventionsDb.length+"), now : APPAREILLAGE INTERVENTIONS API ("+interventionsApi.length+") / DB ("+interventionsDb.length+")");
        let interventionsACreer = [];
        interventionsApi.forEach(interventionApi => {
            let interventionDb = interventionsDb.find( intervention => intervention.roid === interventionApi[structureIntervention.roid.index]);
            if(typeof interventionDb === "undefined") {
                interventionsACreer.push(interventionApi);
            }
            else {
                if(interventionApi[structureIntervention.statut.index] != 'afaire' // en théorie impossible car on envoie que les afaire
                && interventionDb.statut != 'termineeatransferer'
                && interventionDb.maj_local.substring(0, 10) != new Date().toISOString().substring(0, 10)
                ) {
                    log(user, "info", " >>> SYNCHRO INTERVENTIONS::INTERVENTIONS API / DB, À ASUPPRIMER CAS 1 : "+interventionDb.id);
                    interventionsASupprimer.push(interventionDb.id);
                }
            }
        });
        interventionsDb.forEach(interventionDb => {
            let interventionApi = interventionsApi.find( intervention => intervention[structureIntervention.roid.index] === interventionDb.roid);
            if(typeof interventionApi === "undefined"
            && interventionDb.statut != 'termineeatransferer'
            && interventionDb.maj_local.substring(0, 10) != new Date().toISOString().substring(0, 10)
            ) {
                log(user, "info", " >>> SYNCHRO INTERVENTIONS::INTERVENTIONS API / DB, À ASUPPRIMER CAS 2 : "+interventionDb.id);
                interventionsASupprimer.push(interventionDb.id);
            }
        });
        return interventionsACreer;
    })
    .then( interventionsACreer => {
        // LOG
        let roids = [];
        interventionsACreer.forEach( itv => roids.push(itv[1]));
        log(user, "info", " >>> SYNCHRO INTERVENTIONS::APPAREILLAGE INTERVENTIONS API / DB done, now : création db des interventions manquantes ("+interventionsACreer.length+"), roids = "+roids.join(", "));
        // END LOG
        return insertRows('intervention', interventionsACreer);
    })
    .then( () => {
        log(user, "info", " >>> SYNCHRO INTERVENTIONS::création db des interventions manquantes done, now : suppression db des interventions en trop("+interventionsASupprimer.length+")");
        return deleteIds('intervention', interventionsASupprimer);
    })
    .then( () => {
        log(user, "info", " >>> SYNCHRO INTERVENTIONS::END OK, now returns done");
        synchroInterventionsEncours = false;
        return "done";
    })
    .catch( error => {
        log(user, "error", ">>> SYNCHRO INTERVENTIONS::CATCH ERROR"+typeof error == "string" ? error : error.toString());
        synchroInterventionsEncours = false;
        return "done";
    })
    ;

}


