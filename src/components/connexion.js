import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import $ from 'jquery';

export default function Connexion({statutConnexionForDisplay, btnSyncClick, syncIsFinished}) {

    console.log("IN COMPONENT CONNEXION");

    function refresh() {
        console.log("refresh");
        btnSyncClick();
    }

    function logConnexion() {
        alert("navigator.connection.type: "+navigator.connection.type);
        console.log(navigator);
    }

    useEffect(() => {
        console.log("IN CONNEXION USEEFFECT, statutConnexionForDisplay: "+(statutConnexionForDisplay != null ? statutConnexionForDisplay : "null"));
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

