import 'bootstrap/dist/css/bootstrap.min.css';
import {h, render} from 'preact';
import {Router, Link, Route} from 'preact-router';
import {useState, useEffect} from 'preact/hooks';
import $ from 'jquery';
import Popper from 'popper.js';

import 'bootstrap/dist/js/bootstrap.bundle.min';
import '../assets/css/app.css';

import '../assets/fontawesome/css/all.css';
import '../assets/fontawesome/webfonts/fa-brands-400.eot';
import '../assets/fontawesome/webfonts/fa-brands-400.svg';
import '../assets/fontawesome/webfonts/fa-brands-400.ttf';
import '../assets/fontawesome/webfonts/fa-brands-400.woff';
import '../assets/fontawesome/webfonts/fa-brands-400.woff2';
import '../assets/fontawesome/webfonts/fa-regular-400.eot';
import '../assets/fontawesome/webfonts/fa-regular-400.svg';
import '../assets/fontawesome/webfonts/fa-regular-400.ttf';
import '../assets/fontawesome/webfonts/fa-regular-400.woff';
import '../assets/fontawesome/webfonts/fa-regular-400.woff2';
import '../assets/fontawesome/webfonts/fa-solid-900.eot';
import '../assets/fontawesome/webfonts/fa-solid-900.svg';
import '../assets/fontawesome/webfonts/fa-solid-900.ttf';
import '../assets/fontawesome/webfonts/fa-solid-900.woff';
import '../assets/fontawesome/webfonts/fa-solid-900.woff2';

import {apiGetInterventions, checkConnexion} from './api/api';
import {dbGetInterventions, insert} from './db/db';

import Connexion from './components/connexion';
import Salons from './pages/salons';
import Interventions from './pages/interventions';
import Intervention from './pages/intervention';

export var interventionsUpdatedInApp = false;

function App() {

    const [statutConnexionForDisplay, setStatutConnexionForDisplay] = useState(navigator.onLine);
    const [interventionsUpdatedFromApi, setInterventionsUpdatedFromApi] = useState(false);
    const [allInterventions, setAllInterventions] = useState([]);
    const [interventionsParSalon, setInterventionsParSalon] = useState([]);
    const [salons, setSalons] = useState([]);

    useEffect(() => {

        console.log("statutConnexionForDisplay useEffect");

        window.addEventListener("offline", function() {
            setTimeout(function() {
                console.log(" ================> OFFLINE : "+navigator.connection.type);
                setStatutConnexionForDisplay(false);
            }, 500);
        }, false);

        window.addEventListener("online", function() {
            setTimeout(function() {
                setStatutConnexionForDisplay(true);
                console.log(" ================> ONLINE : "+navigator.connection.type);
            }, 500);
        }, false);

    }, [statutConnexionForDisplay]);


    useEffect(() => {

        console.log("interventionsUpdatedFromApi useEffect");

        if(statutConnexionForDisplay) {
            apiGetInterventions()
            .then( allInterventions => {
                let arrayInterventions = [];
                allInterventions.map( intervention => {
                    let arrayIntervention = [
                        null,
                        intervention.salon,
                        intervention.salonSlug,
                        intervention.societe,
                        intervention.date,
                        intervention.dateFr,
                        intervention.heure,
                        intervention.statut,
                        null,
                        '',
                        '',
                    ];
                    arrayInterventions.push(arrayIntervention);
                });
                console.log("allInterventions.map, arrayInterventions:");
                console.log(arrayInterventions);
                insert('intervention', arrayInterventions).then( () => { setInterventionsUpdatedFromApi(true); console.log("THEN THEN THEN THEN THEN THEN THEN THEN THEN THEN THEN "); });
            } )
            ;

        }
        else {
            setInterventionsUpdatedFromApi(false);
        }

    }, [statutConnexionForDisplay]);


    useEffect(() => {

        console.log("allInterventions useEffect");

        if(interventionsUpdatedFromApi) {
            dbGetInterventions().then( (allInterventions) => setAllInterventions(allInterventions) );

            console.log(" ==================> SETALLINTERVENTIONS");
        }

    }, [interventionsUpdatedFromApi, interventionsUpdatedInApp]);


    useEffect(() => {

        console.log("interventionsParSalon useEffect : allInterventions");
        console.log(allInterventions);

        let interventionsParSalonWork = {};

        allInterventions.map( intervention => {
            if(!interventionsParSalonWork.hasOwnProperty(intervention.salon_slug)) {
                interventionsParSalonWork[intervention.salon_slug] = {};
            }
            if(!interventionsParSalonWork[intervention.salon_slug].hasOwnProperty(intervention.date_fr)) {
                interventionsParSalonWork[intervention.salon_slug][intervention.date_fr] = [];
            }
            interventionsParSalonWork[intervention.salon_slug][intervention.date_fr].push(intervention);
        });

        console.log("interventionsParSalonWork");
        console.log(interventionsParSalonWork);

        setInterventionsParSalon(interventionsParSalonWork);

    }, [allInterventions]);


    useEffect(() => {

        console.log("useEffect salons : salonsWork, allInterventions =");
        console.log(allInterventions);

        let salonsWork = [];

        allInterventions.forEach( (intervention) => {
            let obj = salonsWork.find(salon => salon.slug === intervention.salon_slug);
            if(typeof obj == "undefined") {
                salonsWork.push({
                    slug: intervention.salon_slug,
                    nom: intervention.salon
                });
            }
        });

        setSalons(salonsWork);

        console.log(salonsWork);

    }, [allInterventions]);


    return (
        <div class="p-1">
            <div class="top-bar overflow-hidden p-1 mb-2">
                <div class="float-left">
                </div>
                <div class="float-right pl-1 pt-1">
                    <Connexion statutConnexionForDisplay={statutConnexionForDisplay} />
                </div>
            </div>
            <Link className="btn btn-dark w-100 p-3 mb-2 text-uppercase" href="/index.html">
                Salons
            </Link>
            <Router>
                <Salons interventionsParSalon={interventionsParSalon} salons={salons} path="/" />
                <Salons interventionsParSalon={interventionsParSalon} salons={salons} path="/index.html" />
                <Interventions interventionsParSalon={interventionsParSalon} salons={salons} path="/interventions/:salonSlug" />
                <Intervention allInterventions={allInterventions} path="/intervention/:salonSlug/:interventionId" />
            </Router>
        </div>
    )
}

 var app = {

    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        //statutConnexion = {statut: navigator.connection.type};
        /*
        document.addEventListener("offline", onOffline, false);
        document.addEventListener("online", onOnline, false);
        */
        render(<App />, document.getElementById('app'));
    },
  };

  app.initialize();

