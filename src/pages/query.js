import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {Link, route} from 'preact-router';
import $ from 'jquery';

import { dbTables } from '../config/dbTables';
import {rawQuery} from '../db/db';

export default function Query() {

    console.log("IN QUERY");

    function login() {

        $("#error").html("");

        if($("#query").val() == "") {
            $("#error").html("Vous devez saisir une requête");
            return;
        }

        rawQuery($("#query").val())
        .then( () => {
            route('/dump');
        })
        .catch( error => $("#error").html(error) )
        ;

    }


    function dropTables() {

        var queries = [];
        Object.keys(dbTables).map( (dbTable) => {
            queries.push(rawQuery("DROP TABLE IF EXISTS "+dbTable));
        });

        $("#error").html("");

        Promise.all(queries)
        .then( () => {
            route('/dump');
        })
        .catch( error => $("#error").html(error) )
        ;

    }


    return (
        <div>
            <div>
                <div class="form-inline mb-2">
                    <input type="text" id="query" placeholder="Requête sql" class="form-control w-100" />
                </div>
                <div class="form-inline mb-2">
                    <button type="button" onClick={login} class="btn btn-client-primary pl-5 pr-5">Exécuter</button>
                </div>

                <div id="error" class="color-red"></div>

                <div class="form-inline mt-5">
                    <button type="button" onClick={dropTables} class="btn btn-dark pl-5 pr-5">DROP TABLES</button>
                </div>

            </div>
        </div>
    );
};

