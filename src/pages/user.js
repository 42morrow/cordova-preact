import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {Link, route} from 'preact-router';
import $ from 'jquery';

import {insertRows, deleteAll} from '../db/db';
import {apiLogin} from '../api/api';

export default function User({user, callUpdateUser}) {

    console.log("IN USER");

    function setUser() {
        insertRows('user', [ [null, "laurent.lagarde@gmail.com" , "Laurent Lagarde avec un nom super long", "2023-11-10" ] ])
        .then( () => callUpdateUser() )
        ;
    }

    function login() {

        $("#error").html("");

        if($("#identifiant").val() == "" || $("#mdp").val() == "") {
            $("#error").html("Vous devez saisir un identifiant et un mot de passe");
            return;
        }

        apiLogin($("#identifiant").val(), $("#mdp").val())
        .then( user => {
            insertRows('user', [ [null, user.username , user.nom, user.date_connexion ] ])
        })
        .then( () => callUpdateUser() )
        .catch( (data) => {
            let message = typeof data === "object" && data.hasOwnProperty("message") ? data.message : "Une erreur a été rencontrée";
            $("#error").html(message)
        })
        ;

    }

    function logout() {
        deleteAll("user")
        .then( () => {
            callUpdateUser();
        })
        ;
    }

    return (
        <div>
            {
                user == null

                ?

                <div>
                    <div class="form-inline mb-2">
                        <input type="text" id="identifiant" placeholder="Identifiant" class="form-control" />
                    </div>

                    <div class="form-inline mb-2">
                        <input type="password" id="mdp" placeholder="Mot de passe" class="form-control" />
                    </div>

                    <div class="form-inline mb-2">
                        <button type="button" onClick={login} class="btn btn-client-primary pl-5 pr-5">Valider</button>
                    </div>

                    <div id="error" class="color-red"></div>

                    {/*
                    <div class="mt-5">
                        <button class="btn btn-primary" onClick={setUser}>
                            &gt;&gt; Set user
                        </button>
                    </div>
                    */}
                </div>

                :

                <div class="wrapper-user">
                    <div class="table-responsive">
                        <table class="table">
                            <tr class="">
                                <td class=" color-silver border-top-none"><i class="fas fa-angle-right mr-1"></i>Nom</td>
                            </tr>
                            <tr class="">
                                <td class="">{user.nom}</td>
                            </tr>
                            <tr class="">
                                <td class=" color-silver"><i class="fas fa-angle-right mr-1"></i>Username</td>
                            </tr>
                            <tr class="">
                                <td class="">{user.username}</td>
                            </tr>
                            <tr class="">
                                <td class=" color-silver"><i class="fas fa-angle-right mr-1"></i>Dernière connexion</td>
                            </tr>
                            <tr class="">
                                <td class="">{user.date_connexion}</td>
                            </tr>
                        </table>
                    </div>
                    <div class="row mt-3">
                        <div class="col-md-12">
                            <button class="btn btn-danger" onclick={logout}>Déconnexion</button>
                        </div>
                    </div>
                </div>

            }
        </div>
    );
};

