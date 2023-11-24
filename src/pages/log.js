import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {Link, route} from 'preact-router';
import $ from 'jquery';

import {createTables, getRows, rawQuery} from '../db/db';
import {apiSetLog} from '../api/api';
import {log} from '../lib/log';

export default function Log({user}) {

    console.log("IN LOG");

    const [logLines, setLogLines] = useState([]);
    const [logIsSync, setLogIsSync] = useState(false);
    const [refresh, setRefresh] = useState(true);

    useEffect(() => {

        log(user, "info", "IN LOG, ENTER");

        if(!refresh) {
            return;
        }

        createTables()
        .then( () => getRows("log") )
        .then( rows => {
            let logLines = [];
            if(rows.length > 0) {
                for(let i = 0; i < rows.length; i++) {
                    logLines.push(rows.item(i));
                }
                setLogLines(logLines);
            }
        })
        .then( () => getRows("log", "WHERE sync IS FALSE") )
        .then( rows => {
            log(user, "info", "IN LOG >>> getRows + WHERE sync IS FALSE, nb rows : "+rows.length);
            let logLines = [];
            if(rows.length > 0) {
                for(let i = 0; i < rows.length; i++) {
                    let logLine = rows.item(i);
                    logLine.uuid = device.uuid;
                    logLines.push(logLine);
                }
            }
            return logLines;
        })
        .then( logLines => {
            log(user, "info", "IN LOG >>> apiSetLog, nb lignes log : "+logLines.length);
            if(logLines.length > 0) {
                return apiSetLog({userId: user != null ? user.id : 0, logLines: logLines});
            }
        })
        .then( () => rawQuery("UPDATE log SET sync = TRUE") )
        .then( () => {
            setLogIsSync(true);
            setRefresh(false);
        })
        .catch( (error) => { log(user, "error", typeof error == "string" ? error : error.toString()); })
        ;

    }, [refresh]);


    function deleteLog() {
        rawQuery("DELETE FROM log")
        .then( (result) => {
            setRefresh(true)
        });
    }


    function getUser(userId) {
        return userId == "--" ? <span>--</span> : <span><i class='fas fa-user mr-1'></i>{userId}</span>
    }


    return (
        <div class="mt-3 mb-5">
            <div
                class="my-2 color-silver hover-777 font-size-0dot5em"
                role="button"
                onClick={deleteLog}
            >
                <i class="fas fa-trash"></i> Supprimer le log
            </div>
            <div class="query-result monospace font-size-0dot3em">
                {
                logLines.map( (row) => (
                    <div class="">
                        <span class="color-777 mr-1">{row.dthe}</span>
                        <span class="color-777 mr-1">{getUser(row.user_id)}</span>
                        <span class={row.type == "error" ? "color-red mr-1" : "color-green mr-1"}>{row.type}</span>
                        <span class="color-555 mr-1">{row.log}</span>
                        {/* <span class="color-silver mr-1">{row.sync == "true" ? "sync" : "not sync"}</span> */}
                    </div>
                ))
                }
            </div>
        </div>
    );
};

