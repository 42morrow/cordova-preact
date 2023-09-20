import {newPromiseHelper} from 'sql-promise-helper';

var db = null;
var helper = null;
var tx = null;

document.addEventListener('deviceready', function() {

    console.log(" =====================> DEVICE READY !");

    db = openDb();
    helper = newPromiseHelper(db);
    // TODO : transférer interventions signées au préalable
    createTablesIfNotExist();

});


function openDb() {
    return window.sqlitePlugin.openDatabase({
        name: 'my.db',
        location: 'default',
    });
}

function dropTableIfExist() {

    console.log("dropTableIfExist");

    let dropTableInterventionQuery = 'DROP TABLE IF EXISTS intervention';

    tx = helper.newBatchTransaction();
    tx.executeStatement(dropTableInterventionQuery);
    return tx.commit();

}

function createTablesIfNotExist() {

    console.log("createTablesIfNotExist");

    //dropTableIfExist();
    let createTableInterventionQuery =
    'CREATE TABLE IF NOT EXISTS intervention ('
    +'id INTEGER PRIMARY KEY AUTOINCREMENT, '
    +'roid TEXT NOT NULL, '
    +'salon TEXT NOT NULL, '
    +'salon_slug TEXT NOT NULL, '
    +'societe TEXT NOT NULL, '
    +'date TEXT NOT NULL, '
    +'date_fr TEXT NOT NULL, '
    +'heure TEXT NOT NULL, '
    +'statut TEXT NOT NULL, '
    +'heure_rea_debut TEXT NULL, '
    +'heure_rea_fin TEXT NULL, '
    +'signature TEXT NULL, '
    +'maj_local TEXT NOT NULL, '
    +'maj_remote TEXT NOT NULL'
    +')'
    ;

    tx = helper.newBatchTransaction();
    tx.executeStatement(createTableInterventionQuery);
    return tx.commit();

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

    console.log("DANS INSERT, ROWS: "+rows.length);
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

    console.log("DANS DELETE, IDS: "+ids.length);
    if(ids.length == 0) {
        return;
    }

    let deleteQuery =
    'DELETE FROM '+table+' WHERE id IN ('+ids.join(',')+')'
    ;

    tx = helper.newBatchTransaction();
    ids.map( row => {
        tx.executeStatement(deleteQuery);
    });

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


export function dbGetSalons() {

    tx = helper.newBatchTransaction();
    return tx.commit().then(function() {
        return helper.executeStatement('SELECT salon, salon_slug, COUNT(*) AS nb FROM intervention GROUP BY salon_slug', null);

    }).then(function(res) {
        var salons = [];
        if(res.rows.length > 0) {
            console.log(" =======================> IF: "+res.rows.length)
            console.log(res.rows);
            for(let i = 0; i < res.rows.length; i++) {
                salons.push({
                    nom: res.rows.item(i).salon,
                    slug: res.rows.item(i).salon_slug,
                    nbInterventions: res.rows.item(i).nb,
                });
                console.log("dbGetSalons:");
                console.log(salons);
            }
        }
        else {
            console.log(" =======================> RESULT + ZÉRO")
        }

        return new Promise( (resolve) => resolve(salons));

    });

}


export function dbGetSalon(salonSlug) {

    tx = helper.newBatchTransaction();
    return tx.commit().then(function() {
        return helper.executeStatement('SELECT salon, salon_slug, COUNT(*) AS nb FROM intervention WHERE salon_slug = ? GROUP BY salon_slug', [salonSlug]);
    }).then(function(res) {

        let salon = {
            nom: '',
            slug: '',
            nbInterventions: 0,
        };

        if(res.rows.length == 1) {
            salon = {
                nom: res.rows.item(0).salon,
                slug: res.rows.item(0).salon_slug,
                nbInterventions: res.rows.item(0).nb,
            };
            console.log("dbGetSalon:");
            console.log(salon);
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
            console.log(" =======================> IF: "+res.rows.length)
            console.log(res.rows);
            for(let i = 0; i < res.rows.length; i++) {
               interventionsDb.push(res.rows.item(i));
                console.log("Get intervention from DB: "+res.rows.item(i).id+" : "+res.rows.item(i).date_fr);
            }
        }
        else {
            console.log(" =======================> RESULT + ZÉRO")
        }

        return new Promise( (resolve) => resolve({interventionsDb, interventionsApi}));

    });

}


export function dbGetInterventionsSalon(salonSlug) {

    tx = helper.newBatchTransaction();
    return tx.commit().then(function() {
        return helper.executeStatement('SELECT * FROM intervention WHERE salon_slug = ?', [salonSlug]);

    }).then(function(res) {
        var interventions = [];
        if(res.rows.length > 0) {
            console.log(" =======================> dbGetInterventionsSalon: "+res.rows.length)
            console.log(res.rows);
            for(let i = 0; i < res.rows.length; i++) {
                interventions.push(res.rows.item(i));
            }
        }
        else {
            console.log(" =======================> dbGetInterventionsSalon: auncune intervention")
        }

        return new Promise( (resolve) => resolve(interventions));

    });

}


export function dbGetInterventionsATransferer() {

    tx = helper.newBatchTransaction();
    return tx.commit().then(function() {
        return helper.executeStatement('SELECT * FROM intervention WHERE statut = ?', ['signeeatransferer']);

    }).then(function(res) {
        var interventions = [];
        if(res.rows.length > 0) {
            console.log(" =======================> dbGetInterventionsATransferer: "+res.rows.length)
            console.log(res.rows);
            for(let i = 0; i < res.rows.length; i++) {
                interventions.push(res.rows.item(i));
            }
        }
        else {
            console.log(" =======================> dbGetInterventionsATransferer: auncune intervention")
        }

        return new Promise( (resolve) => resolve(interventions));

    });

}


export function dbGetIntervention(interventionId) {

    tx = helper.newBatchTransaction();
    return tx.commit().then(function() {
        return helper.executeStatement('SELECT * FROM intervention WHERE id = ?', [interventionId]);
    }).then(function(res) {
        let intervention = res.rows.item(0);
        return new Promise( (resolve) => resolve(intervention));
    });

}





