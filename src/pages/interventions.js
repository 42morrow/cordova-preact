import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {Link} from 'preact-router';

import {dbGetInterventionsSalon, dbGetSalon} from '../db/db';
import {statutsIntervention} from '../config/statutsIntervention';

export default function Interventions({salonSlug}) {

    console.log("IN INTERVENTIONS, salonSlug:: "+salonSlug);
console.log("statutsIntervention");
console.log(statutsIntervention);

    const [salon, setSalon] = useState(null);
    const [interventions, setInterventions] = useState(null);

    useEffect(() => {
        console.log("useEffect setSalon");
        dbGetSalon(salonSlug).then( (salon) => { console.log(salon); setSalon(salon); } );
    }, []);

    useEffect(() => {
        console.log("useEffect setInterventions");
        dbGetInterventionsSalon(salonSlug).then( (interventions) => {
            console.log(interventions);
            let interventionsParDate = {};
            interventions.map( intervention => {
                if(!interventionsParDate.hasOwnProperty(intervention.date_fr)) {
                    interventionsParDate[intervention.date_fr] = [];
                }
                interventionsParDate[intervention.date_fr].push(intervention);
            });
            console.log("interventionsParDate:");
            console.log(interventionsParDate);
            setInterventions(interventionsParDate);
        });
    }, []);


    if(!interventions || !salon) {
        return <div className="text-center p-3">Veuillez patienter</div>
    }

    console.log("NB: "+Object.keys(interventions).length);

    return (
        <div>
            <Link className="btn btn-secondary w-100 p-3 mb-2 text-uppercase" href={'/interventions/'+salonSlug}>
                {salon.nom}
            </Link>
            {!!(interventions && Object.keys(interventions).length > 0) ?
            Object.keys(interventions).map( (uneDate) => (
                <div>
                    <div class="badge badge-secondary mb-1">{uneDate}</div>
                    {interventions[uneDate].map(intervention  => (
                        <Link class={`btn  ${statutsIntervention[intervention.statut].class} w-100 p-3 mb-2`} href={'/intervention/'+salonSlug+"/"+intervention.id}>
                            <div class="">
                                <div class="float-left text-left">
                                    <div>{intervention.heure}</div>
                                    <div>{intervention.societe}</div>
                                </div>
                                <div class="float-right">
                                    <div class={`statut ${statutsIntervention[intervention.statut].couleur}`}>
                                        {statutsIntervention[intervention.statut].libelle}
                                    </div>
                                </div>
                            </div>

                                {!!(intervention.signature != null) ?
                                    <div class="" style="clear: both; text-align: left; font-size: 7px;">
                                        <img src={intervention.signature} />
                                    </div>
                                :
                                    ''
                                }

                        </Link>
                    )
                    )}
                </div>
            ))
            :
            'NULL'
            }
        </div>
    );
};

