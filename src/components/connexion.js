import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import $ from 'jquery';

import {log} from '../lib/log';

export default function Connexion({user, statutConnexionForDisplay, btnSyncClick, syncIsFinished}) {

    useEffect(() => {
        log(user, "info", "IN COMPONENT CONNEXION");
    }, []);

    function refresh() {
        log(user, "info", "IN COMPONENT CONNEXION >>> REFRESH CALL");
        btnSyncClick();
    }

    function logConnexion() {
        log(user, "info", "IN COMPONENT CONNEXION >>> navigator.connection.type = "+navigator.connection.type);
        console.log(navigator);
    }

    useEffect(() => {
        log(user, "info", "IN COMPONENT CONNEXION >>> statutConnexionForDisplay changed to : "+(statutConnexionForDisplay ? "true" : "false"));
    }, [statutConnexionForDisplay]);

    return (
        <span>
            <i
                class={`fas fa-sync mr-2 ${syncIsFinished === false && 'color-red'} ${statutConnexionForDisplay != null && statutConnexionForDisplay && syncIsFinished === true && 'color-555'} ${statutConnexionForDisplay != null && statutConnexionForDisplay === false && syncIsFinished === true  && 'color-silver'} `}
                onClick={refresh}
                role={`${statutConnexionForDisplay != null && statutConnexionForDisplay === true && 'button'}`}
            >
            </i>
            <i
                class={`fas ${statutConnexionForDisplay != null && statutConnexionForDisplay === true && 'fa-signal color-555'} ${statutConnexionForDisplay != null && statutConnexionForDisplay === false && 'fa-times-circle color-silver'} `}
                onClick={logConnexion}
            >
            </i>
        </span>
    );
};

