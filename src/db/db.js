import { newPromiseHelper } from 'sql-promise-helper';
import { dbDefineTables } from '../config/dbDefineTables';

import {log} from '../lib/log';

var db = null;
var helper = null;
var tx = null;

document.addEventListener('deviceready', function() {

    db = openDb();
    helper = newPromiseHelper(db);

});


function openDb() {
    return window.sqlitePlugin.openDatabase({
        name: 'my.db',
        location: 'default',
    });
}

function dropTableIfExist(table) {

    log(null, "info", "db/db.js >>> dropTableIfExist");

    let dropTableInterventionQuery = 'DROP TABLE IF EXISTS '+table;

    tx = helper.newBatchTransaction();
    tx.executeStatement(dropTableInterventionQuery);
    return tx.commit();

}

export function getTables() {

    let query = 'SELECT * FROM sqlite_master where type="table";';

    tx = helper.newBatchTransaction();
    return tx.commit().then(function() {
        return helper.executeStatement(query, null);
    }).then(function(res) {
        return new Promise( (resolve) => resolve(res.rows));
    });

}

export function createTables() {

    return createTable("intervention")
    .then( () => createTable("user"))
    .then( () => createTable("surveyjs_config"))
    .then( () => createTable("log"))
    ;

}


function createTable(table) {

    let tableInfos = dbDefineTables[table];
    let createQuery = 'CREATE TABLE IF NOT EXISTS '+table+' ('+"\n";
    let period = "";
    Object.keys(tableInfos).forEach( columnName => {
        createQuery += period+columnName+" "+tableInfos[columnName];
        period = ",\n";
    })
    createQuery += "\n"+');';

    //console.log("db/db.js >>> createTable "+createQuery);

    //dropTableIfExist(table);

    tx = helper.newBatchTransaction();
    return tx.commit().then(function() {
        return helper.executeStatement(createQuery, null);
    });

}


export function insertRows (table, rows) {

    /*
    tx = helper.newBatchTransaction();
    tx.commit().then(function() {
        return helper.executeStatement('SELECT * FROM intervention', null);

    }).then(function(rs) {
        alert('GOT RESULT LENGTH: ' + rs.rows.length + ' FIRST: ' + JSON.stringify(rs.rows.item(0)));

    });
    */

    if(table != "log") {
        log(null, "info", "db/db.js >>> insertRows in "+table+", nb rows : "+rows.length);
    }

    if(rows.length == 0) {
        return;
    }

    let pointsInterrogation = [];
    for(let i = 0; i < rows[0].length; i++) {
        pointsInterrogation[i] = '?';
    }
    let insertQuery =
    'INSERT INTO '+table+' VALUES ('+pointsInterrogation.join(',')+')'
    ;

    tx = helper.newBatchTransaction();
    rows.map( row => {
        tx.executeStatement(insertQuery, row);
    });

    return tx.commit();

}


export function deleteIds (table, ids) {

    if(ids.length == 0) {
        return;
    }

    log(null, "info", "db/db.js >>> deleteIds in "+table+", ids : "+ids.join(", "));

    let deleteQuery =
    'DELETE FROM '+table+' WHERE id IN ('+ids.join(',')+')'
    ;

    tx = helper.newBatchTransaction();
    ids.map( row => {
        tx.executeStatement(deleteQuery);
    });

    return tx.commit();

}


export function deleteAll(table) {

    let deleteQuery = 'DELETE FROM '+table;

    tx = helper.newBatchTransaction();
    tx.executeStatement(deleteQuery);

    return tx.commit();

}


export function update (table, id, data) {

    let updateQuery = 'UPDATE '+table+' SET ';
    let period = "";
    for(let key in data) {
        updateQuery += period+key+" = '"+data[key].replace(/'/g, "\\'")+"'";
        period = ",";
    }
    updateQuery += " WHERE id = "+id+";";

    tx = helper.newBatchTransaction();
    tx.executeStatement(updateQuery);
    return tx.commit().then( () => { console.log("THEN update"); });

}


export function rawQuery (query) {

    /*
    tx = helper.newBatchTransaction();
    tx.executeStatement(query);
    return tx.commit();
    */

    tx = helper.newBatchTransaction();
    return tx.commit().then(function() {
        return helper.executeStatement(query, null);

    })
    .catch( error => error )
    ;

}


export function getColumns(table) {

    tx = helper.newBatchTransaction();
    return tx.commit().then(function() {
        log(null, "info", "getColumns >>> table : "+table);
        return helper.executeStatement('PRAGMA table_info('+table+')', null);

    }).then(function(res) {
        var columns = [];
        if(res.rows.length > 0) {
            for(let i = 0; i < res.rows.length; i++) {
                columns.push(res.rows.item(i).name);
            }
        }
        log(null, "info", "db/db.js >>> getColumns, columns : "+columns.join(", "));
        return new Promise( (resolve) => resolve({name: table, columns: columns}));

    })
    .catch( error => error )
    ;

}


export function getRows(table, where = "") {

    tx = helper.newBatchTransaction();
    return tx.commit().then(function() {
        log(null, "info", "getRows >>> query : "+'SELECT * FROM '+table+" "+where);
        return helper.executeStatement('SELECT * FROM '+table+" "+where, null);

    }).then( res => res.rows);

}


export function dbGetSalons() {

    tx = helper.newBatchTransaction();
    return tx.commit().then(function() {
        return helper.executeStatement('SELECT salon, salon_id, COUNT(*) AS nb FROM intervention GROUP BY salon_id', null);

    }).then(function(res) {
        var salons = [];
        if(res.rows.length > 0) {
            for(let i = 0; i < res.rows.length; i++) {
                salons.push({
                    nom: res.rows.item(i).salon,
                    id: res.rows.item(i).salon_id,
                    nbInterventions: res.rows.item(i).nb,
                });
            }
        }
        log(null, "info", "db/db.js >>> dbGetSalons, nb : "+salons.length);

        return new Promise( (resolve) => resolve(salons));

    });

}


export function dbGetSalon(salonId) {

    tx = helper.newBatchTransaction();
    return tx.commit().then(function() {
        return helper.executeStatement('SELECT salon, salon_id, COUNT(*) AS nb FROM intervention WHERE salon_id = ? GROUP BY salon_id', [salonId]);
    }).then(function(res) {

        let salon = {
            nom: '',
            id: '',
            nbInterventions: 0,
        };

        if(res.rows.length == 1) {
            salon = {
                nom: res.rows.item(0).salon,
                id: res.rows.item(0).salon_id,
                nbInterventions: res.rows.item(0).nb,
            };
            log(null, "info", "db/db.js >>> dbGetSalon, id : "+salon.id);
        }

        return new Promise( (resolve) => resolve(salon));

    });

}


export function dbGetInterventions(interventionsApi) {

    tx = helper.newBatchTransaction();
    return tx.commit().then(function() {
        return helper.executeStatement('SELECT * FROM intervention', null);

    }).then(function(res) {
        var interventionsDb = [];
        if(res.rows.length > 0) {
            for(let i = 0; i < res.rows.length; i++) {
               interventionsDb.push(res.rows.item(i));
            }
        }

        log(null, "info", "db/db.js >>> dbGetInterventions, nb : "+interventionsDb.length);

        return new Promise( (resolve) => resolve({interventionsDb, interventionsApi}));

    });

}


export function dbGetInterventionsSalon(salonId) {

    tx = helper.newBatchTransaction();
    return tx.commit().then(function() {
        return helper.executeStatement('SELECT * FROM intervention WHERE salon_id = ? ORDER BY date, heure, client', [salonId]);

    }).then(function(res) {
        var interventions = [];
        if(res.rows.length > 0) {
            for(let i = 0; i < res.rows.length; i++) {
                interventions.push(res.rows.item(i));
            }
        }

        log(null, "info", "db/db.js >>> dbGetInterventionsSalon, id : "+salonId+", nb : "+interventions.length);

        return new Promise( (resolve) => resolve(interventions));

    });

}


export function dbGetInterventionsATransferer() {

    tx = helper.newBatchTransaction();
    return tx.commit().then(function() {
        return helper.executeStatement('SELECT * FROM intervention WHERE statut = ?', ['termineeatransferer']);
    }).then(function(res) {
        var interventions = [];
        if(res.rows.length > 0) {
            for(let i = 0; i < res.rows.length; i++) {
                interventions.push(res.rows.item(i));
            }
        }

        log(null, "info", "db/db.js >>> dbGetInterventionsATransferer, nb : "+interventions.length);

        return new Promise( (resolve) => resolve(interventions));

    })
    .catch( error => { console.log("IN dbGetInterventionsATransferer CATCH ERROR"); log(null, "error", error); } )
    ;

}


export function dbGetIntervention(interventionId) {

    tx = helper.newBatchTransaction();
    return tx.commit().then(function() {
        return helper.executeStatement('SELECT * FROM intervention WHERE id = ?', [interventionId]);
    }).then(function(res) {
        let intervention = res.rows.item(0);

        log(null, "info", "db/db.js >>> dbGetIntervention, id : "+intervention.id);

        return new Promise( (resolve) => resolve(intervention));
    });

}


export function dbGetUser() {

    let user = null;

    tx = helper.newBatchTransaction();
    return tx.commit().then(function() {
        return helper.executeStatement('SELECT * FROM user', null);

    }).then(function(res) {
        let user = res.rows.length > 0 ? res.rows.item(0) : null;

        log(null, "info", "db/db.js >>> dbGetUser");

        return new Promise( (resolve) => resolve(user));
    });

}


export function dbSetUser() {

}


export function dbGetSurveyjsAllConfigs() {

    tx = helper.newBatchTransaction();
    return tx.commit().then(function() {
        return helper.executeStatement('SELECT survey_id, json_questions FROM surveyjs_config', null);

    }).then(function(res) {
        let surveyjsQuestionsBySurveyjsId = [];
        if(res.rows.length > 0) {
            for(let i = 0; i < res.rows.length; i++) {
                surveyjsQuestionsBySurveyjsId[res.rows.item(i).survey_id] = res.rows.item(i).json_questions;
            }
        }

        log(null, "info", "db/db.js >>> dbGetSurveyjsAllConfigs, nb : "+surveyjsQuestionsBySurveyjsId.length);

        return new Promise( (resolve) => resolve(surveyjsQuestionsBySurveyjsId));

    })
    .catch( error => { log(null, "error", error); })
    ;

}


export function dbGetSurveyjsConfig(surveyjsId) {

    tx = helper.newBatchTransaction();
    return tx.commit().then(function() {
        return helper.executeStatement('SELECT json_questions FROM surveyjs_config WHERE survey_id = "'+surveyjsId+'"', null);

    }).then(function(res) {
        let surveyjsJsonQuestions = res.rows.length > 0 ? res.rows.item(0).json_questions : null;

        log(null, "info", "db/db.js >>> dbGetSurveyjsConfig, id : "+surveyjsId);

        return new Promise( (resolve) => resolve(surveyjsJsonQuestions));

    })
    .catch( error => { log(null, "error", error); } )
    ;

}








