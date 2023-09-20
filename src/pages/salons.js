import {h} from 'preact';
import {Link} from 'preact-router';
import {useState, useEffect} from 'preact/hooks';

require('../db/db');

import {apiGetInterventions, apiSetInterventions} from '../api/api';

import {dbGetSalons, dbGetInterventions, dbGetInterventionsATransferer, update} from '../db/db';
import {insertRows, deleteIds} from '../db/db';


export default function Salons({statutConnexionForDisplay, callSync, changeSyncIsFinished}) {

    console.log("IN SALONS");

    const [interventionsUpdatedFromApi, setInterventionsUpdatedFromApi] = useState(false);
    //const [interventionsASupprimer, setInterventionsASupprimer] = useState([]);
    const [salons, setSalons] = useState([]);

    var interventionsASupprimer = [];

    if(!salons) {
        return <div className="text-center p-3">Aucun salon en cours</div>
    }

    useEffect(() => {

        console.log("interventionsUpdatedFromApi useEffect");

        if(statutConnexionForDisplay) {
            changeSyncIsFinished(false);
            dbGetInterventionsATransferer()
            .then( interventionsATransferer => {
                if(interventionsATransferer.length > 0) {
                    let apiFields = [];
                    interventionsATransferer.forEach( intervention => {
                        console.log("Une intervention à transférer:");
                        console.log(intervention);
                        apiFields.push({
                            id: intervention.id,
                            interventionId: intervention.roid,
                            heureReaDebut: intervention.heure_rea_debut,
                            heureReaFin: intervention.heure_rea_fin,
                            signature: intervention.signature,
                            statut: 'signee',
                        });
                    });
                    return apiSetInterventions(apiFields);
                }
                else {
                    return Promise.resolve([]);
                }
            })
            .then( (apiFields) => {
                console.log("APRÈS apiSetInterventions");
                console.log(apiFields);
                apiFields.forEach( intervention => update('intervention', intervention.id, {statut: 'signee'}));
            })
            .then( () => apiGetInterventions())
            .then( interventionsApi => {
                let interventionsApiDbFormatted = [];
                interventionsApi.map( intervention => {
                    let arrayIntervention = [
                        null,
                        intervention.id,
                        intervention.salon,
                        intervention.salonSlug,
                        intervention.societe,
                        intervention.date,
                        intervention.dateFr,
                        intervention.heure,
                        intervention.statut,
                        intervention.heureReaDebut,
                        intervention.heureReaFin,
                        intervention.signature,
                        '',
                        '',
                    ];
                    interventionsApiDbFormatted.push(arrayIntervention);
                });
                console.log("interventionsApi.map, interventionsApiDbFormatted:");
                console.log(interventionsApiDbFormatted);
                return interventionsApiDbFormatted;
            } )
            .then( (interventionsApi) => { return dbGetInterventions(interventionsApi) })
            .then( ({interventionsDb, interventionsApi}) => {
                let interventionsACreer = [];
                interventionsApi.forEach(interventionApi => {
                    let interventionDb = interventionsDb.find( intervention => intervention.roid === interventionApi[1]);
                    if(typeof interventionDb === "undefined") {
                        interventionsACreer.push(interventionApi);
                    }
                    else {
                        if(interventionApi[8] != 'afaire' // en théorie impossible car on envoie que les afaire
                        && interventionDb.statut != 'signeeatransferer'
                        && interventionDb.maj_local.substring(0, 9) != new Date().toISOString().substring(0, 9)
                        ) {
                            console.log("À ASUPPRIMER CAS 1 : "+interventionDb.id);
                            interventionsASupprimer.push(interventionDb.id);
                        }
                    }
                });
                interventionsDb.forEach(interventionDb => {
                    let interventionApi = interventionsApi.find( intervention => intervention[1] === interventionDb.roid);
                    if(typeof interventionApi === "undefined"
                    && interventionDb.statut != 'signeeatransferer'
                    && interventionDb.maj_local.substring(0, 9) != new Date().toISOString().substring(0, 9)
                    ) {
                        console.log("À ASUPPRIMER CAS 2 : "+interventionDb.id);
                        interventionsASupprimer.push(interventionDb.id);
                    }
                });
                return interventionsACreer;
            })
            .then( interventionsACreer => {return insertRows('intervention', interventionsACreer) })
            .then( () => {return deleteIds('intervention', interventionsASupprimer) })
            .then( () => {
                interventionsASupprimer = [];
                setInterventionsUpdatedFromApi(true);
                changeSyncIsFinished(true);
            } )
            .then( () => {
                setInterventionsUpdatedFromApi(false);
            } )
            .catch( (error) => console.log(error) )
            ;

        }
        else {
            setInterventionsUpdatedFromApi(false);
        }

    }, [statutConnexionForDisplay, callSync]);

    useEffect(() => {

        console.log("useEffect salons : salons");

        dbGetSalons().then( (salons) => { console.log(salons); setSalons(salons); } );

    }, [interventionsUpdatedFromApi]);


    return (
        <div>
            {salons.map( (salon) => (
                <Link className="btn btn-primary w-100 p-3 mb-2" href={'/interventions/'+salon.slug}>
                    {salon.nom} <span class="ml-2 color-silver">({salon.nbInterventions}) <span class="color-white ml-2" style="font-size: 7px;">{Date.now()}</span></span>
                </Link>
            ))}
        </div>
    );
};
