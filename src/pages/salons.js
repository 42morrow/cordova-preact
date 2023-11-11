import {h} from 'preact';
import {Link, route} from 'preact-router';
import {useState, useEffect} from 'preact/hooks';

require('../db/db');

import {apiGetInterventions, apiSetInterventions} from '../api/api';

import {dbGetSalons, dbGetInterventions, dbGetInterventionsATransferer, update, insertRows, deleteIds} from '../db/db';

import {structureIntervention} from '../config/structureIntervention';

export default function Salons({user, synchroInterventionsDone}) {

    console.log("IN SALONS, synchroInterventionsDone:");
    console.log(synchroInterventionsDone);

    if(user == null) {
        route('/user');
    }

    const [salons, setSalons] = useState([]);

    if(!salons) {
        return <div className="text-center p-3">Aucun salon en cours</div>
    }

    useEffect(() => {

        console.log("useEffect salons : salons");

        dbGetSalons().then( (salons) => { console.log("salons:"); console.log(salons); setSalons(salons); } );

    }, [synchroInterventionsDone]);


    return (
        <div>
            <Link className="btn btn-dark w-100 p-3 mb-2 text-uppercase" href="/index.html">
                Salons
            </Link>
            {salons.map( (salon) => (
                <Link className="btn btn-primary w-100 p-3 mb-2" href={'/interventions/'+salon.id}>
                    {salon.nom} <span class="ml-2 color-silver">({salon.nbInterventions}) <span class="color-white ml-2" style="font-size: 7px;">{Date.now()}</span></span>
                </Link>
            ))}
        </div>
    );
};
