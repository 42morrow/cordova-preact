import 'bootstrap/dist/css/bootstrap.min.css';
import {h, render} from 'preact';
import {Router, Link, route} from 'preact-router';
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

import UserStatus from './components/userStatus';
import Connexion from './components/connexion';
import Footer from './components/footer';
import User from './pages/user';
import Salons from './pages/salons';
import Interventions from './pages/interventions';
import Intervention from './pages/intervention';
import Dump from './pages/dump';

import { createTables, dbGetUser } from './db/db';

import {synchroInterventions} from './lib/synchroInterventions';
import {synchroSurveyjsConfig} from './lib/synchroSurveyjsConfig';


export var testAppState = false;

function App() {


    const [syncIsFinished, setSyncIsFinished] = useState(true);

    function changeSyncIsFinished(syncIsFinished) {
        console.log("changeSyncIsFinished");
        setSyncIsFinished(syncIsFinished);
    }

    function btnSyncClick() {
        console.log(btnSyncIsClicked);
        setBtnSyncIsClicked(true);
    }

    const [btnSyncIsClicked, setBtnSyncIsClicked] = useState(false);
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


    // STATUT CONNEXION (DISPLAY ON TOP RIGHT)

    const [statutConnexionForDisplay, setStatutConnexionForDisplay] = useState(navigator.onLine);

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


    // SYNCHRO INTERVENTIONS + SYNCHRO SURVEYJS CONFIG + GET USER

    const [synchroDone, setSynchroDone] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {

        console.log("synchroDone useEffect");
        console.log("statutConnexionForDisplay: "+(statutConnexionForDisplay ? "oui" : "non"));

        if(statutConnexionForDisplay) {

            if(user != null) {
                changeSyncIsFinished(false);

                synchroInterventions()
                .then( () => synchroSurveyjsConfig() )
                .then( () => {
                    setSynchroDone(true);
                    changeSyncIsFinished(true);
                } )
                .then( () => {
                    setSynchroDone(false);
                    route('/index.html');
                } )
                .catch( (error) => { console.log("CATCH ERROR"); console.log(error); })
                ;
            }
            else {
                route('/user');
            }

        }
        else {
            setSynchroDone(false);
        }

    }, [statutConnexionForDisplay, callSync, user]);



    const [updateUser, setUpdateUser] = useState(false);

    useEffect(() => {

        console.log("user useEffect");

        createTables().then( () => dbGetUser().then( user => {
            setUpdateUser(false);
            setUser(user);
            if(user == null) {
                route('/user');
            }
            else {
                route('/index.html');
            }
        }));

    }, [updateUser]);


    function callUpdateUser() {
        setUpdateUser(true);
    }


    return (
        <div class="p-1 wrapper" style="">
            <div class="content">
                <div class="top-bar p-1 mb-2">
                    <div class="flex-1 pl-1 pt-1">
                        <UserStatus user={user} statutConnexionForDisplay={statutConnexionForDisplay} />
                    </div>
                    <div class="pl-1 pt-1">
                        <Connexion statutConnexionForDisplay={statutConnexionForDisplay} btnSyncClick={btnSyncClick} syncIsFinished={syncIsFinished} />
                    </div>
                </div>
                <Router>
                    <User user={user} callUpdateUser={callUpdateUser} path="/user" />
                    <Salons user={user} synchroDone={synchroDone} path="/" />
                    <Salons user={user} synchroDone={synchroDone} path="/index.html" />
                    <Interventions user={user} synchroDone={synchroDone} path="/interventions/:salonId" />
                    <Intervention user={user} path="/intervention/:salonId/:salonNbInterventions/:interventionId" />
                    <Dump path="/dump" />
                </Router>
            </div>
            <Footer />
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

