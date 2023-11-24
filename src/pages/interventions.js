import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {Link, route} from 'preact-router';

import {dbGetInterventionsSalon, dbGetSalon} from '../db/db';
import {statutsIntervention} from '../config/statutsIntervention';
import {log} from '../lib/log';

export default function Interventions({user, salonId, synchroInterventionsDone}) {

    useEffect(() => {
        log(user, "info", "IN INTERVENTIONS, ENTER, salonId : "+salonId);
    }, []);


    if(user == null) {
        route('/user');
    }


    const [init, setInit] = useState(false);
    const [salon, setSalon] = useState(null);
    const [interventions, setInterventions] = useState(null);
    const [salonNbInterventions, setSalonNbInterventions] = useState(0);


    useEffect(() => {
        dbGetSalon(salonId).then( (salon) => {
            log(user, "info", "IN INTERVENTIONS >>> setSalon : "+salon); setSalon(salon);
            setInit(true);
        });
    }, []);


    useEffect(() => {

        //if(synchroInterventionsDone) {
            dbGetInterventionsSalon(salonId).then( (interventionsDuSalon) => {
                setSalonNbInterventions(interventionsDuSalon.length);
                log(user, "info", "IN INTERVENTIONS >>> setInterventions : "+interventionsDuSalon.length);
                let interventionsParDate = {};
                interventionsDuSalon.map( intervention => {
                    if(!interventionsParDate.hasOwnProperty(intervention.date)) {
                        interventionsParDate[intervention.date] = [];
                    }
                    interventionsParDate[intervention.date].push(intervention);
                });
                const interventionsParDateOrdonnee = Object.keys(interventionsParDate).sort().reduce(
                    (obj, key) => {
                      obj[key.split("-").reverse().join("/")] = interventionsParDate[key];
                      return obj;
                    },
                    {}
                );
                setInterventions(interventionsParDateOrdonnee);
            });
        //}
    }, [synchroInterventionsDone, init]);


    function getHeure(intervention) {
        if(intervention.heure != null && intervention.heure != '23:59') {
            return <div><i class="fas fa-clock mr-1"></i>{intervention.heure}</div>;
        }
        else {
            return <div class="color-silver">Horaire non précisé</div>;
        }
    }

    if(!interventions || !salon) {
        return <div className="text-center p-3">Veuillez patienter <span class="color-silver">(interventions)</span></div>
    }

    return (
        <div>
            <Link className="btn btn-dark w-100 p-3 mb-2 text-uppercase" href="/index.html">
                Salons
            </Link>
            <Link className="btn btn-client-primary pointer-events-none w-100 p-3 mb-2 text-uppercase" href={'/interventions/'+salonId}>
                {salon.nom} ({salonNbInterventions})
            </Link>
            {!!(interventions && Object.keys(interventions).length > 0) ?
            Object.keys(interventions).map( (uneDate) => (
                <div>
                    <div class="badge badge-secondary mb-1">{uneDate}</div>
                    {interventions[uneDate].map(intervention  => (
                        <Link
                            class={`btn  ${statutsIntervention[intervention.statut].class} w-100 p-3 mb-2`}
                            href={'/intervention/'+salonId+"/"+salonNbInterventions+"/"+intervention.id}
                        >
                            <div class="row">
                                <div class="col-md-8 text-left mb-2">
                                    <div>{getHeure(intervention)}</div>
                                    <div>{intervention.client}</div>
                                    <div class="font-italic color-aaa">{intervention.type_label}</div>
                                </div>
                                <div class="col-md-4">
                                    <div class={`statut w-100 ${statutsIntervention[intervention.statut].couleur}`}>
                                        {statutsIntervention[intervention.statut].libelle}
                                    </div>
                                </div>
                            </div>

                                {!!(intervention.signature != null) ?
                                    <div class="mt-2 ">
                                        <img src={intervention.signature} width="100" />
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

