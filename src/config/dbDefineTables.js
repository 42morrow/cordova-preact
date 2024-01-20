export const dbDefineTables = {
    intervention: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        roid: 'INTEGER NOT NULL',
        salon: 'TEXT NOT NULL',
        salon_id: 'TEXT NOT NULL',
        client: 'TEXT NOT NULL',
        date: 'TEXT NOT NULL',
        date_fr: 'TEXT NOT NULL',
        heure: 'TEXT NULL',
        type: 'TEXT NOT NULL',
        type_label: 'TEXT NOT NULL',
        precisions: 'TEXT NULL',
        hall: 'TEXT NULL',
        stand: 'TEXT NULL',
        contact_salon: 'TEXT NULL',
        telephone: 'TEXT NULL',
        precisions_salon: 'TEXT NULL',
        surveyjs_id: 'TEXT NULL',
        surveyjs_json_reponses: 'TEXT NULL',
        statut: 'TEXT NOT NULL',
        maj_local: 'TEXT NOT NULL',
        maj_remote: 'TEXT NOT NULL',
        //maj_NONVOULUE: 'TEXT NOT NULL', // Pour test cohérence
    },
    user: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        roid: 'INTEGER NOT NULL',
        username: 'TEXT NOT NULL',
        nom: 'TEXT NOT NULL',
        date_connexion: 'TEXT NOT NULL',
    },
    surveyjs_config: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        survey_id: 'TEXT NOT NULL',
        json_questions: 'TEXT NOT NULL',
        date_maj: 'TEXT NOT NULL',
    },
    log: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        user_id: 'INTEGER NULL',
        dthe: 'TEXT NOT NULL',
        type: 'TEXT NOT NULL',
        log: 'TEXT NOT NULL',
        sync: 'INTEGER NOT NULL',
    }
};


