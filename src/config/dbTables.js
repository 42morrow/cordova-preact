export const dbTables = {
    intervention:
        'CREATE TABLE IF NOT EXISTS intervention ('
        +'id INTEGER PRIMARY KEY AUTOINCREMENT, '
        +'roid INTEGER NOT NULL, '
        +'salon TEXT NOT NULL, '
        +'salon_id TEXT NOT NULL, '
        +'client TEXT NOT NULL, '
        +'date TEXT NOT NULL, '
        +'date_fr TEXT NOT NULL, '
        //+'heure TEXT NOT NULL, '
        +'type TEXT NOT NULL, '
        +'typeLabel TEXT NOT NULL, '
        +'statut TEXT NOT NULL, '
        +'heure_rea_debut TEXT NULL, '
        +'heure_rea_fin TEXT NULL, '
        +'signature TEXT NULL, '
        +'maj_local TEXT NOT NULL, '
        +'maj_remote TEXT NOT NULL'
        +')',
    user:
        'CREATE TABLE IF NOT EXISTS user ('
        +'id INTEGER PRIMARY KEY AUTOINCREMENT, '
        +'username TEXT NOT NULL, '
        +'nom TEXT NOT NULL, '
        +'date_connexion TEXT NOT NULL '
        +');',
    surveyjs_config:
        'CREATE TABLE IF NOT EXISTS surveyjs_config ('
        +'id INTEGER PRIMARY KEY AUTOINCREMENT, '
        +'survey_id TEXT NOT NULL, '
        +'json TEXT NOT NULL, '
        +'date_maj TEXT NOT NULL '
        +');',
};


