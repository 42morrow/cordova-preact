import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {Link, route} from 'preact-router';
import $ from 'jquery';

import { dbTables } from '../config/dbTables';
import {rawQuery} from '../db/db';

export default function Query({callUpdateUser}) {

    console.log("IN QUERY");

    const [queryResultRows, setQueryResultRows] = useState(null);
    const [queryResultFormated, setQueryResultFormated] = useState([]);

    useEffect(() => {
        let rowsFormated = [];
        if(queryResultRows != null) {
            if(queryResultRows.length > 0) {
                for(let i = 0; i < queryResultRows.length; i++) {
                    console.log(queryResultRows.item(i));
                    rowsFormated.push("ROW "+(i + 1));
                    for (var prop in queryResultRows.item(i)) {
                        if (Object.prototype.hasOwnProperty.call(queryResultRows.item(i), prop)) {
                            rowsFormated.push(prop+" : "+queryResultRows.item(i)[prop]);
                        }
                    }
                }
            }
            else {
                rowsFormated.push("Aucun résultat");
            }
        }
        setQueryResultFormated(rowsFormated);
    }, [queryResultRows]);


    function query() {

        setQueryResultRows(null);

        $("#error").html("");

        if($("#query").val() == "") {
            $("#error").html("Vous devez saisir une requête");
            return;
        }

        rawQuery($("#query").val())
        .then( (res) => {
            console.log(res);
            if(typeof res == "object"
            && res.hasOwnProperty("rows")
            && typeof res.rows == "object"
            && res.rows.length >= 0
            ) {
                setQueryResultRows(res.rows);
            }
            else if(typeof res == "object"
            && res.hasOwnProperty("message")
            ) {
                $("#error").html(res.message);
            }
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
            callUpdateUser();
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
                    <button type="button" onClick={query} class="btn btn-client-primary pl-5 pr-5">Exécuter</button>
                </div>

                <div id="error" class="color-red"></div>

                <code class="query-result color-777 font-size-0dot3em">
                    {
                    queryResultFormated.map( (row) => (
                        <div class={row.indexOf("ROW") == 0 ? 'font-weight-bold mt-3 border-bottom-silver' : ''}>
                            {row}
                        </div>
                    ))
                    }
                </code>

                <div class="form-inline mt-5">
                    <button type="button" onClick={dropTables} class="btn btn-dark pl-5 pr-5"><i class="fas fa-exclamation-triangle mr-1"></i>DROP TABLES</button>
                </div>

            </div>
        </div>
    );
};

