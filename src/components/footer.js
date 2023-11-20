import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {Link} from 'preact-router';
import $ from 'jquery';

export default function Footer() {

    console.log("IN COMPONENT FOOTER:");

    /*
	console.log('BuildInfo.baseUrl        =' + BuildInfo.baseUrl);
	console.log('BuildInfo.packageName    =' + BuildInfo.packageName);
	console.log('BuildInfo.basePackageName=' + BuildInfo.basePackageName);
	console.log('BuildInfo.displayName    =' + BuildInfo.displayName);
	console.log('BuildInfo.name           =' + BuildInfo.name);
	console.log('BuildInfo.version        =' + BuildInfo.version);
	console.log('BuildInfo.versionCode    =' + BuildInfo.versionCode);
	console.log('BuildInfo.debug          =' + BuildInfo.debug);
	console.log('BuildInfo.buildType      =' + BuildInfo.buildType);
	console.log('BuildInfo.flavor         =' + BuildInfo.flavor);
	console.log('BuildInfo.buildDate      =' + BuildInfo.buildDate);
	console.log('BuildInfo.installDate    =' + BuildInfo.installDate);
    */

    var buildDate =
    BuildInfo.buildDate.toISOString().slice(0,10).split("-").reverse().join("/")
    +" "
    +BuildInfo.buildDate.toTimeString().slice(0,8)
    ;

    return (
        <footer class="page-footer">
            <div class="float-left">
                <span class="font-size-0dot5em">BUILD {buildDate}</span>
            </div>
            <div class="float-right text-right">
                <Link class="color-silver hover-777 mr-3" href="/query">
                    <i class="fas fa-terminal"></i> QUERY
                </Link>
                <Link class="color-silver hover-777" href="/dump">
                    <i class="fas fa-terminal"></i> DUMP
                </Link>
            </div>
        </footer>
    );
};

