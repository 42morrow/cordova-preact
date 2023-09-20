import {h} from 'preact';
import {Link} from 'preact-router';
import {useState, useEffect} from 'preact/hooks';

//import {apiGetSalons} from '../api/api'; // Pas utilisé

require('../db/db');

export default function Salons({salons, interventionsParSalon}) {

    console.log("IN SALONS");
    console.log(salons);

    if(!salons) {
        return <div className="text-center p-3">Aucun salon en cours</div>
    }

    let salonsEtNbInterventions = [];
    for(let salonSlug in interventionsParSalon) {
        let salon = salons.find( salon => salon.slug === salonSlug );
        let nb = 0;
        for( let date in interventionsParSalon[salonSlug]) {
            nb += interventionsParSalon[salonSlug][date].length;
        }
        salonsEtNbInterventions.push({
            slug: salonSlug,
            nom: salon.nom,
            nbInterventions: nb,
        });
    }

    console.log("salonsEtNbInterventions:");
    console.log(salonsEtNbInterventions);
    
    return (
        <div>
            {salonsEtNbInterventions.map( (salon) => (
                <Link className="btn btn-primary w-100 p-3 mb-2" href={'/interventions/'+salon.slug}>
                    {salon.nom} <span class="ml-2 color-silver">({salon.nbInterventions})</span>
                </Link>
            ))}
        </div>
    );
};
