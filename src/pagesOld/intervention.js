import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {Link, route} from 'preact-router';
import $ from 'jquery';

import * as Survey from 'survey-jquery';
import 'survey-jquery/defaultV2.css';

import {update} from '../db/db';

import {interventionsUpdatedInApp} from '../app';

import paramQuestionnaire from '../../config/paramQuestionnaire.json';

export default function Intervention({allInterventions, salonSlug, interventionId}) {

    console.log("IN INTERVENTION, interventionId:: "+interventionId);
    console.log("IN INTERVENTION, allInterventions:: ");
    console.log(allInterventions);

console.log("interventionsUpdatedInApp 1");
console.log(interventionsUpdatedInApp);
    const intervention = allInterventions.find( intervention => intervention.id === parseInt(interventionId) )

    function setInterventionsUpdatedInApp() {
console.log("interventionsUpdatedInApp 3");
console.log(interventionsUpdatedInApp);
console.log(typeof interventionsUpdatedInApp);
        interventionsUpdatedInApp = true;
    };

    useEffect(() => {

console.log("interventionsUpdatedInApp 2");
console.log(interventionsUpdatedInApp);
        const survey = new Survey.Model(paramQuestionnaire);
        survey.onComplete.add((sender, options) => {
            console.log(JSON.stringify(sender.data, null, 3));
            update('intervention', interventionId, { bon_intervention: JSON.stringify(sender.data, null, 3)}).then( () => { setInterventionsUpdatedInApp(); route('/interventions/'+salonSlug); });
        });

        $("#surveyElement").Survey({ model: survey });

        console.log("Intervention useEffect");

    }, []);

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

