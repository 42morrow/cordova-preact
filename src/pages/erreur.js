import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {Link, route} from 'preact-router';
import $ from 'jquery';

import {log} from '../lib/log';

export default function Log({user, fatalError}) {

    useEffect(() => {
        log(user, "info", "IN ERREUR, ENTER");
    }, []);

    return (
        <div class="mt-3 mb-5">
            <div class=" color-red">Une erreur fatale a été rencontrée :</div>
            <div class=" monospace">{fatalError.message}</div>
            <div class=" color-red">Prévenir le développeur</div>
        </div>
    );
};

