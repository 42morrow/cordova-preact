import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {Link, route} from 'preact-router';
import $ from 'jquery';

import * as Survey from 'survey-jquery';
import 'survey-jquery/defaultV2.css';
import {surveyjsTheme} from '../config/surveyjsTheme';

import {dbGetIntervention, update, dbGetSurveyjsConfig} from '../db/db';
import {apiSetInterventions} from '../api/api';

export default function Intervention({user, salonId, salonNbInterventions, interventionId}) {

    console.log("IN INTERVENTION, interventionId:: "+interventionId+", salonNbInterventions: "+salonNbInterventions);

    if(user == null) {
        route('/user');
    }


    const [intervention, setIntervention] = useState(null);
    const [survey, setSurvey] = useState(null);
    const [surveyjsJsonQuestions, setSurveyjsJsonQuestions] = useState(null);

    useEffect(() => {
        console.log("Intervention useEffect setIntervention");
        dbGetIntervention(interventionId)
        .then( intervention => {
            setIntervention(intervention);
            return dbGetSurveyjsConfig(intervention);
        })
        .then( ({intervention, surveyjsJsonQuestions}) => {
            console.log(intervention);
            const survey = new Survey.Model(surveyjsJsonQuestions);
            survey.applyTheme(surveyjsTheme);
            setSurvey(survey);
            setSurveyjsJsonQuestions(surveyjsJsonQuestions);
        });

    }, []);


    useEffect(() => {

        if(intervention == null || survey == null) {
            return;
        }

        console.log("Intervention useEffect init Survey");

        survey.onComplete.add((sender, options) => {
            //console.log(JSON.stringify(sender.data, null, 3));
            let dbFields = {
                surveyjs_json_reponses: JSON.stringify(sender.data),
                statut: 'termineeatransferer',
                maj_local: new Date().toISOString(),
            };
            update('intervention', interventionId, dbFields)
            .then( () => {
                let apiFields = {
                    userId: user.id,
                    interventions: [{
                    interventionId: intervention.roid,
                    surveyjsQuestionnaireId: intervention.surveyjs_id,
                    surveyjsJsonQuestions: surveyjsJsonQuestions,
                    surveyjsJsonReponses: JSON.stringify(sender.data),
                    }],
                };
                return apiSetInterventions(apiFields);
            })
            .then( () => {
                console.log("SUCCESS + UPDATE TERMINÉE/TRANSFÉRÉE");
                let dbFields = {
                    statut: 'terminee',
                    maj_local: new Date().toISOString(),
                };
                update('intervention', interventionId, dbFields);
            })
            .then( () => { console.log("ROUTE AFTER SUCCESS + UPDATE"); route('/interventions/'+salonId); } )
            .catch( () => { console.log("ERROR + ROUTE"); route('/interventions/'+salonId); } )
            ;
        });

        $("#surveyElement").Survey({ model: survey });

        if(intervention.statut != "afaire") {
            let reponses = JSON.parse(intervention.surveyjs_json_reponses);
            Object.keys(reponses).map( (donnee) => {
console.log(donnee+" : "+reponses[donnee]);
                survey.setValue(donnee, reponses[donnee]);
            });
        }

    }, [survey, intervention]);


    if(intervention == null || survey == null) {
        return <div className="text-center p-3">Veuillez patienter</div>
    }

    return (
        <div>
            <Link className="btn btn-dark w-100 p-3 mb-2 text-uppercase" href="/index.html">
                Salons
            </Link>
            <Link className="btn btn-client-primary w-100 p-3 mb-2 text-uppercase" href={'/interventions/'+intervention.salon_id}>
                {intervention.salon} ({salonNbInterventions})
            </Link>
            <div className="btn btn-client-primary pointer-events-none w-100 p-3 mb-2 text-uppercase">
                {intervention.date_fr} <i class="fas fa-clock ml-1 mr-1"></i>{intervention.heure} - {intervention.client} -  {intervention.type_label}
            </div>
            <div id="surveyElement"></div>
        </div>
    );
};

