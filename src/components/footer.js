import {h} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {Link} from 'preact-router';
import $ from 'jquery';

export default function Footer() {

    console.log("IN COMPONENT FOOTER:");

    return (
        <footer class="page-footer">
            <div class="text-right">
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

