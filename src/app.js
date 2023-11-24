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
import Query from './pages/query';
import Log from './pages/log';

import { createTables, dbGetUser, getTables } from './db/db';

import {synchroInterventions} from './lib/synchroInterventions';
import {synchroSurveyjsConfig} from './lib/synchroSurveyjsConfig';
import {log} from './lib/log';


export var testAppState = false;

function App() {

    useEffect(() => {
        log(user, "info", "IN APP.JS, ENTER");
        log(user, "info", "IN APP.JS >>> UUID : "+device.uuid);
    }, []);

    window.onError = function(error, url, line) {
        log(user, "error", error+", url "+url+", line "+line);
    };

    const [syncIsFinished, setSyncIsFinished] = useState(true);

    function changeSyncIsFinished(syncIsFinished) {
        setSyncIsFinished(syncIsFinished);
    }

    function btnSyncClick() {
        setBtnSyncIsClicked(true);
    }


    const [btnSyncIsClicked, setBtnSyncIsClicked] = useState(false);
    const [callSync, setCallSync] = useState(false);
    const [synchroInterventionsDone, setSynchroInterventionsDone] = useState(false);
    const [user, setUser] = useState(null);


    useEffect(() => {
        if(btnSyncIsClicked) {
            setSynchroInterventionsDone(false);
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
                log(user, "info", " ================> OFFLINE : "+navigator.connection.type);
                setStatutConnexionForDisplay(false);
            }, 500);
        }, false);

        window.addEventListener("online", function() {
            setTimeout(function() {
                setStatutConnexionForDisplay(true);
                log(user, "info", " ================> ONLINE : "+navigator.connection.type);
            }, 500);
        }, false);

    }, [statutConnexionForDisplay]);


    // SYNCHRO INTERVENTIONS + SYNCHRO SURVEYJS CONFIG + GET USER

    useEffect(() => {

        if(statutConnexionForDisplay) {

            if(user != null) {
                changeSyncIsFinished(false);

                setSynchroInterventionsDone(false);
                synchroInterventions(user)
                .then( (synchroStatus) => {
                    log(user, "info", "IN APP.JS >>> synchroInterventions done, setSynchroInterventionsDone(true)");
                    if(synchroStatus == "done") {
                        setSynchroInterventionsDone(true);
                        route('/index.html');
                    }
                    return synchroSurveyjsConfig();
                } )
                .then( () => {
                    log(user, "info", "IN APP.JS >>> synchroSurveyjsConfig done");
                    changeSyncIsFinished(true);
                } )
                .then( () => {
                    //setSynchroInterventionsDone(false);
                } )
                .catch( (error) => { log(user, "error", typeof error == "string" ? error : error.toString()); })
                ;
            }
            else {
                route('/user');
            }

        }
        else {
            //setSynchroInterventionsDone(false);
        }

    }, [statutConnexionForDisplay, callSync, user]);


    useEffect(() => {
        log(user, "info", "IN APP.JS >>> >>> >>> >>> >>> >>> >>> >>> >>> >>> >>> >>> synchroInterventionsDone changed to "+(synchroInterventionsDone ? "true" : "false"));
    }, [synchroInterventionsDone]);



    const [updateUser, setUpdateUser] = useState(false);

    useEffect(() => {

        createTables().then( () => dbGetUser().then( user => {
            setUpdateUser(false);
            if(user != null) {
                user.toString = function() {
                    let userString = [];
                    for (var key of Object.keys(this)) {
                        if(["string", "number"].includes(typeof this[key])) {
                            userString.push(key+": "+this[key]);
                        }
                    }
                    return userString.join(", ");
                }
            }
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


    function home() {
        route('/index.html');
    }


    return (
        <div class="p-1 wrapper" style="">
            <div class="content">
                <div class="top-bar p-1 mb-2">
                    <div class="flex-1 pl-1 pt-1">
                        <UserStatus user={user} statutConnexionForDisplay={statutConnexionForDisplay} />
                    </div>
                    <div class="pl-1 pt-1">
                        <i class="fas fa-home color-555 mr-2" role="button" onClick={home}></i>
                        <Connexion user={user} statutConnexionForDisplay={statutConnexionForDisplay} btnSyncClick={btnSyncClick} syncIsFinished={syncIsFinished} />
                    </div>
                </div>
                <Router>
                    <User user={user} callUpdateUser={callUpdateUser} path="/user" />
                    <Salons user={user} synchroInterventionsDone={synchroInterventionsDone} path="/" />
                    <Salons user={user} synchroInterventionsDone={synchroInterventionsDone} path="/index.html" />
                    <Interventions user={user} synchroInterventionsDone={synchroInterventionsDone} path="/interventions/:salonId" />
                    <Intervention user={user} path="/intervention/:salonId/:salonNbInterventions/:interventionId" />
                    <Dump path="/dump" />
                    <Query callUpdateUser={callUpdateUser} path="/query" />
                    <Log user={user} path="/log" />
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

