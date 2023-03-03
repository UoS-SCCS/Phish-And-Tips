const go_phish_config = {
    "showFocusGroupUI": false,
    "focusGroupAnalyticsURL":"https://compendium.dev.castellate.com:5500/datasubmit",
    "emailsToGenerate": 8,
    "maxSuspiciousElements":4,
    "minimumSuspiciousElements":1,
    "suspiciousGenerators":[
        "To",
        "URL",
        "Sender",
        "Urgency",
        "SpellingGrammar"
        
    ]
}

const default_go_phish_config = {
    "emailsToGenerate": 10,
    "maxSuspiciousElements":4,
    "minimumSuspiciousElements":1,
    "suspiciousGenerators":[
        "To",
        "URL",
        "Urgency",
        "Spelling",
        "Grammar",
        "Sender",
        "Date"        
    ]
}
