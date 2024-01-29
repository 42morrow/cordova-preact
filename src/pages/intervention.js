import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {Link, route} from 'preact-router';
import $ from 'jquery';

import * as Survey from 'survey-jquery';
import 'survey-jquery/defaultV2.css';
import {surveyjsTheme} from '../config/surveyjsTheme';

import {dbGetIntervention, update, dbGetSurveyjsConfig} from '../db/db';
import {apiSetInterventions} from '../api/api';
import {log} from '../lib/log';

export default function Intervention({user, salonId, salonNbInterventions, interventionId}) {

    useEffect(() => {
        log(user, "info", "IN INTERVENTION, ENTER, , interventionId:: "+interventionId+", salonNbInterventions: "+salonNbInterventions);
    }, []);


    if(user == null) {
        route('/user');
    }


    const [intervention, setIntervention] = useState(null);
    const [survey, setSurvey] = useState(null);
    const [surveyjsJsonQuestions, setSurveyjsJsonQuestions] = useState(null);

    useEffect(() => {
        dbGetIntervention(interventionId)
        .then( itv => {
            setIntervention(itv);
            log(user, "info", "IN INTERVENTION >>> setIntervention "+itv.id+" done");
            return dbGetSurveyjsConfig(itv.surveyjs_id);
        })
        .then( (surveyjsJsonQuestions) => {
            const survey = new Survey.Model(surveyjsJsonQuestions);
            survey.applyTheme(surveyjsTheme);
            setSurvey(survey);
            setSurveyjsJsonQuestions(surveyjsJsonQuestions);
            log(user, "info", "IN INTERVENTION >>> surveyjsJsonQuestions : "+(surveyjsJsonQuestions == null ? "null" : surveyjsJsonQuestions));
            log(user, "info", "IN INTERVENTION >>> surveyjsJsonQuestions done");
        });

    }, []);


    useEffect(() => {

        if(intervention == null || survey == null) {
            return;
        }

        survey.onComplete.add((sender, options) => {
            let majLocal = new Date().toISOString();
            let dbFields = {
                surveyjs_json_reponses: JSON.stringify(sender.data).replace(/'/g, ' '),
                statut: 'termineeatransferer',
                maj_local: majLocal,
            };
            update('intervention', interventionId, dbFields)
            .then( () => {
                log(user, "info", "IN INTERVENTION >>> maj intervention DB (statut termineeatransferer) done");
                let majUneIntervention = {
                    userId: user.roid,
                    interventions: [{
                    interventionId: intervention.roid,
                    surveyjsQuestionnaireId: intervention.surveyjs_id,
                    surveyjsJsonQuestions: surveyjsJsonQuestions,
                    surveyjsJsonReponses: JSON.stringify(sender.data),
                    majMobile: majLocal,
                    }],
                };
                return apiSetInterventions(majUneIntervention);
            })
            .then( () => {
                log(user, "info", "IN INTERVENTION >>> maj intervention API done");
                let dbFields = {
                    statut: 'terminee',
                    maj_local: new Date().toISOString(),
                };
                update('intervention', interventionId, dbFields);
            })
            .then( () => {
                log(user, "info", "IN INTERVENTION >>> maj intervention DB (statut terminee) done");
            })
            .catch( (error) => { console.log(error); log(user, "error", typeof error == "string" ? error : error.toString()); })
            .finally( () => {
                log(user, "info", "IN INTERVENTION >>> finally : route /interventions/"+salonId);
                route('/interventions/'+salonId);
            })
            ;
        });

        $("#surveyElement").Survey({ model: survey });

        if(intervention.statut != "afaire") {
            let reponses = JSON.parse(intervention.surveyjs_json_reponses);
            Object.keys(reponses).map( (donnee) => {
                survey.setValue(donnee, reponses[donnee]);
            });
        }

    }, [survey, intervention]);


    if(intervention == null || survey == null) {
        return <div className="text-center p-3">Veuillez patienter <span class="color-silver">(intervention)</span></div>
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

