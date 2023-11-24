import {h} from 'preact';
import {Link, route} from 'preact-router';
import {useState, useEffect} from 'preact/hooks';

require('../db/db');

import {apiGetInterventions, apiSetInterventions} from '../api/api';
import {dbGetSalons, dbGetInterventions, dbGetInterventionsATransferer, update, insertRows, deleteIds} from '../db/db';
import {log} from '../lib/log';

import {structureIntervention} from '../config/structureIntervention';

export default function Salons({user, synchroInterventionsDone}) {

    useEffect(() => {
        log(user, "info", "IN SALONS >>> >>> >>> >>> >>> >>> >>> >>> >>> >>> >>> >>> synchroInterventionsDone changed to "+(synchroInterventionsDone ? "true" : "false"));
    }, [synchroInterventionsDone]);

    useEffect(() => {
        log(user, "info", "IN SALONS, ENTER");
    }, []);

    if(user == null) {
        route('/user');
    }

    const [salons, setSalons] = useState(false);

    useEffect(() => {

        log(user, "info", "IN SALONS >>> USE EFFECT synchroInterventionsDone: "+(synchroInterventionsDone ? "true" : "false"));

        if(synchroInterventionsDone) {
            dbGetSalons().then( (salons) => { log(user, "info", "IN SALONS >>> setSalons, nb : "+salons.length); setSalons(salons); } );
        }

    }, [synchroInterventionsDone]);


    if(!salons) {
        return <div className="text-center color-silver font-italic p-3">Veuillez patienter</div>
    }
    else if(salons.length == 0) {
        return <div className="text-center p-3">Aucun salon en cours</div>
    }
    else {
        return (
            <div>
                <Link className="btn btn-dark w-100 p-3 mb-2 text-uppercase" href="/index.html">
                    Salons
                </Link>
                {salons.map( (salon) => (
                    <Link className="btn btn-client-outline-primary w-100 p-3 mb-2" href={'/interventions/'+salon.id}>
                        {salon.nom} <span class="ml-2 color-silver">({salon.nbInterventions}) <span class="color-white ml-2" style="font-size: 7px;">{Date.now()}</span></span>
                    </Link>
                ))}
            </div>
        );
    }

};
