import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {Link} from 'preact-router';
import $ from 'jquery';
import textFit from 'textfit';

import {log} from '../lib/log';

export default function UserStatus({user, statutConnexionForDisplay}) {

    useEffect(() => {
        console.log(user);
        log(user, "info", "IN COMPONENT USER STATUS >>> user : "+(user != null ? user.toString() : "null"));
    }, [user]);

    var userInfos = null;

    if(user != null) {
        userInfos = <span><i class="fas mr-2 fa-user color-primary"></i><span id="text-fit">{user.nom}</span></span>;
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

