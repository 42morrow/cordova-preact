import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {Link} from 'preact-router';
import $ from 'jquery';

export default function UserStatus({user, statutConnexionForDisplay}) {

    console.log("IN COMPONENT USER:");
    console.log(user);
    

    var userInfos = null;

    if(user != null) {
        userInfos = <span><i class="fas mr-2 fa-user color-primary"></i><span class="font-size-3vw">{user.nom}</span></span>;
    }
    else {
        userInfos = <i class="fas mr-2 fa-user-slash color-silver"></i>;
    }

    return (
        <Link href={'/user'}>
            {userInfos}
        </Link>
    );
};

