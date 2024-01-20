import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {Link, route} from 'preact-router';
import $ from 'jquery';

import {createTables, getTables, getRows} from '../db/db';
import {apiGetInterventions} from '../api/api';
import {log} from '../lib/log';

export default function Dump({user}) {

    useEffect(() => {
        log(user, "info", "IN DUMP, ENTER");
    }, []);

    const [dbTables, setDbTables] = useState([]);
    const [dbInterventions, setDbInterventions] = useState([]);
    const [dbUsers, setDbUsers] = useState([]);
    const [dbSurveyjsConfig, setDbSurveyjsConfig] = useState([]);
    const [apiInterventions, setApiInterventions] = useState([]);

    useEffect(() => {
        createTables()
        .then( () => getTables() )
        .then( (rows) => {
            let dbTables = [];
            if(rows.length > 0) {
                for(let i = 0; i < rows.length; i++) {
                    if(rows.item(i).name != "sqlite_sequence") {
                        dbTables.push(rows.item(i));
                    }
                }
            }
            setDbTables(dbTables);
        })
        .then( () => getRows("intervention") )
        .then( rows => {
            let interventions = [];
            if(rows.length > 0) {
                for(let i = 0; i < rows.length; i++) {
                    interventions.push(rows.item(i));
                }
            }
            setDbInterventions(interventions);
        })
        .then( () => getRows("user") )
        .then( rows => {
            let users = [];
            if(rows.length > 0) {
                for(let i = 0; i < rows.length; i++) {
                    users.push(rows.item(i));
                }
            }
            setDbUsers(users);
        })
        .then( () => getRows("surveyjs_config") )
        .then( rows => {
            let surveyjsConfig = [];
            if(rows.length > 0) {
                for(let i = 0; i < rows.length; i++) {
                  surveyjsConfig.push(rows.item(i));
                }
            }
            setDbSurveyjsConfig(surveyjsConfig);
        })
        .then( () => {
            return apiGetInterventions();
        })
        .then( apiInterventions => {
            setApiInterventions(apiInterventions);
        })
        .then( () => log(user, "info", "IN DUMP >>> all récups done") )
        ;
    }, []);

    return (
        <div>
            <div class="font-weight-bold text-12px mt-4">DB, tables avec structure</div>
            {
                dbTables.map( (table) => (
                    <div class="mt-3">
                        <div class="font-weight-bold text-8px monospace">{table.name}</div>
                        <div class="text-8px monospace">{table.sql}</div>
                    </div>
                ))
            }
            <div class="font-weight-bold text-12px mt-4">Interventions API : {apiInterventions.length}</div>
            {
                apiInterventions.map( (intervention) => (
                    <div class="mt-3">
                        {Object.keys(intervention).map( (donnee) => ( <div class="text-8px monospace"><span class="color-silver mr- 2">{donnee}</span> {intervention[donnee]}</div> ) ) }
                    </div>
                ))
            }
            <div class="font-weight-bold text-12px mt-4">Interventions DB : {dbInterventions.length}</div>
            {
                dbInterventions.map( (intervention) => (
                    <div class="mt-3">
                        {Object.keys(intervention).map( (donnee) => ( <div class="text-8px monospace"><span class="color-silver mr- 2">{donnee}</span> {intervention[donnee]}</div> ) ) }
                    </div>
                ))
            }
            <div class="font-weight-bold text-12px mt-4">Users DB : {dbUsers.length}</div>
            {
                dbUsers.map( (user) => (
                    <div class="mt-3">
                        {Object.keys(user).map( (donnee) => ( <div class="text-8px monospace"><span class="color-silver mr- 2">{donnee}</span> {user[donnee]}</div> ) ) }
                    </div>
                ))
            }
            <div class="font-weight-bold text-12px mt-4">Surveyjs Config DB : {dbSurveyjsConfig.length}</div>
            {
                dbSurveyjsConfig.map( (config) => (
                    <div class="mt-3">
                        {Object.keys(config).map( (donnee) => ( <div class="text-8px monospace"><span class="color-silver mr- 2">{donnee}</span> {config[donnee]}</div> ) ) }
                    </div>
                ))
            }
        </div>
    );
};

