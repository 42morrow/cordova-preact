import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {Link, route} from 'preact-router';
import $ from 'jquery';

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

    }, [synchroInterventionsDone, init]);


    function getHeure(intervention) {
        if(intervention.heure != null && intervention.heure != '23:59') {
            return <span class=""><i class="fas fa-clock mr-1"></i>{intervention.heure}</span>;
        }
        else {
            return <span class="color-silver">Horaire non précisé</span>;
        }
    }

    function getPrecisionsSalon(intervention) {
        if(intervention.precisions_salon != null) {
            return  <div class="row">
                        <div class="col-md-12 text-left mb-2">
                            <span class="mr-1">Précisions salon</span>
                            <span class=" color-aaa">{intervention.precisions_salon}</span>
                        </div>
                    </div>
        }
    }

    function getPrecisionsIntervention(intervention) {
        if(intervention.precisions != null) {
            return  <div class="row">
                        <div class="col-md-12 text-left mb-2">
                            <span class="mr-1">Précisions intervention</span>
                            <span class=" color-aaa">{intervention.precisions}</span>
                        </div>
                    </div>
        }
    }

    function toggleDate(caller) {
        let date = $(caller).prop("tagName") == "SPAN" ? $(caller).parent().attr("data-date") : $(caller).attr("data-date");
        $(".inter-date-"+date).each(function() {
            $(this).toggleClass("d-none");
        });
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
                    <div
                        class="badge badge-secondary font-size-1em mb-2 py-3 w-100"
                        data-date={uneDate.replaceAll("/", "")}
                        onClick={ (e) => {toggleDate(e.target)} }
                        role="button"
                    >
                        {uneDate}
                        <span
                            class="font-weight-normal ml-2"
                        >
                            ({interventions[uneDate].length})
                        </span>
                    </div>
                    {interventions[uneDate].map(intervention  => (
                        <Link
                            class={`btn inter-date-${uneDate.replaceAll("/", "")} ${statutsIntervention[intervention.statut].class} w-100 p-3 mb-2 d-none`}
                            href={'/intervention/'+salonId+"/"+salonNbInterventions+"/"+intervention.id}
                        >
                            <div class="row">
                                <div class="col-md-8 text-left mb-2">
                                    <div>{getHeure(intervention)} <span class="ml-3">N°</span><span class="color-aaa">{intervention.roid}</span></div>
                                    <div>{intervention.client}</div>
                                    <div class="font-italic color-aaa">{intervention.type_label}</div>
                                </div>
                                <div class="col-md-4 mb-2">
                                    <div class={`statut w-100 ${statutsIntervention[intervention.statut].couleur}`}>
                                        {statutsIntervention[intervention.statut].libelle}
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-12 text-left mb-2">
                                    <span class="mr-1">Hall</span>
                                    <span class=" color-aaa">{intervention.hall != null ? intervention.hall : 'non précisé'}</span>
                                    <span class="ml-3 mr-1">Stand</span>
                                    <span class=" color-aaa">{intervention.stand != null ? intervention.stand : 'non précisé'}</span>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-12 text-left mb-2">
                                    <span class="mr-1">Contact</span>
                                    <span class=" color-aaa">{intervention.contact_salon != null ? intervention.contact_salon : 'non précisé'}</span>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-12 text-left mb-2">
                                    <span class="mr-1">Téléphone</span>
                                    <span class=" color-aaa">{intervention.telephone != null ? intervention.telephone : 'non précisé'}</span>
                                </div>
                            </div>

                            {getPrecisionsSalon(intervention)}

                            {getPrecisionsIntervention(intervention)}

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

