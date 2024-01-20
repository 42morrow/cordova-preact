import {createTables, dbGetInterventions, dbGetInterventionsATransferer, update, insertRows, deleteIds, dbGetSurveyjsAllConfigs, getColumns} from '../db/db';
import {apiGetInterventions, apiSetInterventions} from '../api/api';
import {log} from '../lib/log';

import { dbDefineTables } from '../config/dbDefineTables';

import {structureInterventionDb, structureInterventionApi} from '../config/structureIntervention';

var synchroInterventionsEncours = false;


function checkStructureApi(interventionApi) {
    let check = true;
    if(Object.keys(interventionApi).length != Object.keys(structureInterventionApi).length) {
        check = false;
    }
    else {
        Object.keys(interventionApi).forEach( propertyApi => {
            if(typeof Object.keys(structureInterventionApi).find( propertyStructure => propertyStructure == propertyApi) == "undefined") {
                check = false;
            }
        });
    }
    if(check === false) {
        check = "API : "+Object.keys(interventionApi).join(", ")+", APPLI : "+Object.keys(structureInterventionApi).join(", ")
    }
    return check;
}


function checkStructureDb(tableName, tableColumns) {
    log(null, "info", " >>> SYNCHRO INTERVENTIONS::checkStructureDb : "+tableName);
    let check = true;
    if(!dbDefineTables.hasOwnProperty(tableName)) {
        return false;
    }
    let definedColumns = dbDefineTables[tableName];
    log(null, "info", " >>> SYNCHRO INTERVENTIONS::checkStructureDb Nb clés : "+tableColumns.length+" / "+Object.keys(definedColumns).length);
    if(tableColumns.length != Object.keys(definedColumns).length) {
        check = false;
    }
    else {
        tableColumns.forEach( tableColumn => {
            if(typeof Object.keys(definedColumns).find( definedColumn => definedColumn == tableColumn) == "undefined") {
                check = false;
            }
        });
    }
    if(check === false) {
        check = "DB : "+tableColumns.join(", ")+", DÉFINI DANS L'APPLI : "+Object.keys(definedColumns).join(", ")
    }
    return check;
}


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
    .then( () => {
        var queries = [];
        Object.keys(dbDefineTables).map( (dbTable) => {
            queries.push(getColumns(dbTable));
        });
        return Promise.all(queries)
    })
    .then( (promiseAllValues) => {
        console.log("promiseAllValues");
        console.log(promiseAllValues);
        promiseAllValues.forEach( table => {
            let check = checkStructureDb(table.name, table.columns);
            if(check !== true) {
                log(user, "error", " >>> SYNCHRO INTERVENTIONS::checkStructureDb "+table.name+" !== true");
                throw new Error("Structure table db "+table.name+" incorrecte : "+check);
            }
        })
    })
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
                    majMobile: intervention.maj_local,
                });
            });
            return apiSetInterventions({ userId: user.roid, interventions: apiFields });
        }
        else {
            return Promise.resolve([]);
        }
    })
    .then( (apiFields) => {
        log(user, "info", " >>> SYNCHRO INTERVENTIONS::apiSetInterventions done, now : update des interventions en db, statut termineeatransfere => terminee ("+apiFields.length+")");
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
            log(user, "error", " >>> SYNCHRO INTERVENTIONS::apiGetInterventions, erreur : "+interventionsApi.message);
            throw new Error(interventionsApi.message);
        }
        log(user, "info", " >>> SYNCHRO INTERVENTIONS::apiGetInterventions done ("+interventionsApi.length+"), now : formatage des interventions api avec la structure db");
        let interventionsApiDbFormatted = [];
        interventionsApi.map( intervention => {
            let check = checkStructureApi(intervention);
            if(check !== true) {
                log(user, "error", " >>> SYNCHRO INTERVENTIONS::checkStructureApi !== true");
                throw new Error("Structure interventions api incorrecte : "+check);
            }
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
                intervention.precisions,
                intervention.hall,
                intervention.stand,
                intervention.contact_salon,
                intervention.telephone,
                intervention.precisions_salon,
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
            let interventionDb = interventionsDb.find( intervention => intervention.roid === interventionApi[structureInterventionDb.roid.index]);
            if(typeof interventionDb === "undefined") {
                interventionsACreer.push(interventionApi);
            }
            else {
                if(interventionApi[structureInterventionDb.statut.index] != 'afaire' // en théorie impossible car on envoie que les afaire
                && interventionDb.statut != 'termineeatransferer'
                && interventionDb.maj_local.substring(0, 10) != new Date().toISOString().substring(0, 10)
                ) {
                    log(user, "info", " >>> SYNCHRO INTERVENTIONS::INTERVENTIONS API / DB, À ASUPPRIMER CAS 1 : "+interventionDb.id);
                    interventionsASupprimer.push(interventionDb.id);
                }
            }
        });
        interventionsDb.forEach(interventionDb => {
            let interventionApi = interventionsApi.find( intervention => intervention[structureInterventionDb.roid.index] === interventionDb.roid);
            if(typeof interventionApi === "undefined" // Pas dans les inters envoyées par l'api
            && interventionDb.statut != 'termineeatransferer' // termineeatransferer => on doit la transférer d'abord
            && (interventionDb.statut != 'terminee' || interventionDb.maj_local.substring(0, 10) != new Date().toISOString().substring(0, 10)) // Inter à faire et faite sur un autre téléphone, ou inter terminée sur ce téléphone le jour même
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
        log(user, "info", " >>> SYNCHRO INTERVENTIONS::APPAREILLAGE INTERVENTIONS API / DB done, now : création db des interventions manquantes ("+interventionsACreer.length+"), roids = "+(roids.length > 0 ? roids.join(", ") : "none"));
        // END LOG
        return insertRows('intervention', interventionsACreer);
    })
    .then( () => {
        log(user, "info", " >>> SYNCHRO INTERVENTIONS::création db des interventions manquantes done, now : suppression db des interventions en trop("+interventionsASupprimer.length+")");
        return deleteIds('intervention', interventionsASupprimer);
    })
    .then( () => {
        log(user, "info", " >>> SYNCHRO INTERVENTIONS::END OK, now returns \"done\"");
        synchroInterventionsEncours = false;
        return "done";
    })
    .catch( error => {
        log(user, "error", ">>> SYNCHRO INTERVENTIONS::CATCH ERROR : "+error.message);
        synchroInterventionsEncours = false;
        throw error;
    })
    .finally( () => synchroInterventionsEncours = false )
    ;

}


