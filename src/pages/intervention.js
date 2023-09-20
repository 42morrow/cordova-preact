import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {Link, route} from 'preact-router';
import $ from 'jquery';

import * as Survey from 'survey-jquery';
import 'survey-jquery/defaultV2.css';

import {dbGetIntervention, update} from '../db/db';
import {apiSetInterventions} from '../api/api';

import paramQuestionnaire from '../../config/paramQuestionnaire.json';

export default function Intervention({salonSlug, interventionId}) {

    console.log("IN INTERVENTION, interventionId:: "+interventionId);

    const [intervention, setIntervention] = useState(null);

    useEffect(() => {
        console.log("Intervention useEffect setIntervention");
        dbGetIntervention(interventionId).then( (intervention) => { console.log(intervention); setIntervention(intervention); } );
    }, []);

    useEffect(() => {

        console.log("Intervention useEffect init Survey");

        const survey = new Survey.Model(paramQuestionnaire);
        survey.onComplete.add((sender, options) => {
            //console.log(JSON.stringify(sender.data, null, 3));
            let dbFields = {
                heure_rea_debut: sender.data.heure_debut,
                heure_rea_fin: sender.data.heure_fin,
                signature: sender.data.signature,
                statut: 'signeeatransferer',
                maj_local: new Date().toISOString(),
            };
            update('intervention', interventionId, dbFields)
            .then( () => {
                let apiFields = [{
                    interventionId: intervention.roid,
                    heureReaDebut: sender.data.heure_debut,
                    heureReaFin: sender.data.heure_fin,
                    signature: sender.data.signature,
                    statut: 'signee',
                }];
                return apiSetInterventions(apiFields);
            })
            .then( () => {
                console.log("SUCCESS + UPDATE SIGNÉE/TRANSFÉRÉE");
                let dbFields = {
                    statut: 'signee',
                    maj_local: new Date().toISOString(),
                };
                update('intervention', interventionId, dbFields);
            })
            .then( () => { console.log("ROUTE AFTER SUCCESS + UPDATE"); route('/interventions/'+salonSlug); } )
            .catch( () => { console.log("ERROR + ROUTE"); route('/interventions/'+salonSlug); } )
            ;
        });

        $("#surveyElement").Survey({ model: survey });

    }, [intervention]);

    if(!intervention) {
        return <div className="text-center p-3">Veuillez patienter</div>
    }

    return (
        <div>
            <Link className="btn btn-secondary w-100 p-3 mb-2 text-uppercase" href={'/interventions/'+intervention.salon_slug}>
                {intervention.salon}
            </Link>
            <Link className="btn btn-primary color-white w-100 p-3 mb-2 text-uppercase" href={'/intervention/'+interventionId}>
                {intervention.date_fr} {intervention.heure} {intervention.societe}
            </Link>
            <div id="surveyElement"></div>
        </div>
    );
};

