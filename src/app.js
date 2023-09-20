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

import Connexion from './components/connexion';
import Salons from './pages/salons';
import Interventions from './pages/interventions';
import Intervention from './pages/intervention';

export var testAppState = false;

function App() {

    function changeSyncIsFinished(syncIsFinished) {
        console.log("changeSyncIsFinished");
        setSyncIsFinished(syncIsFinished);
    }

    function btnSyncClick() {
        console.log(btnSyncIsClicked);
        setBtnSyncIsClicked(true);
    }

    const [btnSyncIsClicked, setBtnSyncIsClicked] = useState(false);
    const [syncIsFinished, setSyncIsFinished] = useState(true);

    const [statutConnexionForDisplay, setStatutConnexionForDisplay] = useState(navigator.onLine);
    const [callSync, setCallSync] = useState(false);

    useEffect(() => {
        console.log("USE EFFECT setCallSync");
        if(btnSyncIsClicked) {
            setCallSync(true);
            setBtnSyncIsClicked(false);
        }
        else {
            setCallSync(false);
        }
    }, [btnSyncIsClicked]);


    useEffect(() => {

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

        console.log("statutConnexionForDisplay useEffect:");
        console.log(statutConnexionForDisplay);

    }, [statutConnexionForDisplay]);

    return (
        <div class="p-1">
            <div class="top-bar overflow-hidden p-1 mb-2">
                <div class="float-left">
                </div>
                <div class="float-right pl-1 pt-1">
                    <Connexion statutConnexionForDisplay={statutConnexionForDisplay} btnSyncClick={btnSyncClick} syncIsFinished={syncIsFinished} />
                </div>
            </div>
            <Link className="btn btn-dark w-100 p-3 mb-2 text-uppercase" href="/index.html">
                Salons
            </Link>
            <Router>
                <Salons statutConnexionForDisplay={statutConnexionForDisplay} callSync={callSync} changeSyncIsFinished={changeSyncIsFinished} path="/" />
                <Salons statutConnexionForDisplay={statutConnexionForDisplay} callSync={callSync} changeSyncIsFinished={changeSyncIsFinished} path="/index.html" />
                <Interventions path="/interventions/:salonSlug" />
                <Intervention path="/intervention/:salonSlug/:interventionId" />
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

