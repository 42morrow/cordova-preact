import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {Link} from 'preact-router';

export default function Interventions({interventionsParSalon, salons, salonSlug}) {

    console.log("IN INTERVENTIONS, salonSlug:: "+salonSlug);
    console.log("IN INTERVENTIONS, interventionsParSalon:: ");
    console.log(interventionsParSalon);

    const salon = salons.find(salon => salon.slug === salonSlug);
    const interventions = interventionsParSalon[salonSlug];

    Object.keys(interventions).forEach( (uneDate) => {
        console.log("uneDate");
        console.log(uneDate);
        console.log("interventions");
        console.log(interventions[uneDate]);
    });

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
                        <Link className="btn btn-primary w-100 p-3 mb-2" href={'/intervention/'+salonSlug+"/"+intervention.id}>
                            <div class="">
                                <div class="float-left text-left">
                                    <div>{intervention.heure}</div>
                                    <div>{intervention.societe}</div>
                                </div>
                                <div class="float-right">
                                    <div class={`statut ${intervention.statut == "En attente" ? " color-orange " : ""} ${intervention.statut == "Terminée" ? " color-green " : ""} ${intervention.statut == "Transférée" ? " color-555 " : ""} `}>
                                        {intervention.statut}
                                    </div>
                                </div>
                            </div>
                            <div class="" style="clear: both; text-align: left; font-size: 7px;">
                                {!!(intervention.bon_intervention != null) ?
                                        intervention.bon_intervention
                                :
                                        'NULL'
                                }
                            </div>
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

