import {createTables, insertRows} from '../db/db';

var getStackTrace = function() {
    var obj = {};
    Error.captureStackTrace(obj, getStackTrace);
    return obj.stack;
};

export function log(user, logType, logEntry, consoleLog = true) {

    if(consoleLog) {
        console.log(logEntry);
    }

    const today = new Date();

    var logDate =
    today.toISOString().slice(0,10).split("-").reverse().join("/")
    +" "
    +today.toTimeString().slice(0,8)
    ;

    return createTables()
    .then( () => { insertRows('log', [[null, (user == null ? "--" : user.roid), logDate, logType, logEntry, false]]) })
    ;

}


