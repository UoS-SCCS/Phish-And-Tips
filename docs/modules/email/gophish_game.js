goPhish = new GoPhish();

class GoPhishGame {

    constructor() {
        this.emails = [];
        this.selected = {};
        this.checked = {};
        this.scores = {};
        this.profileCats = [];
    }

    hasEmails() {
        if (this.emails.length > 0) {
            return true;
        }
        return false;
    }
    generateEmails(emailCats) {
        this.setProfileCats(emailCats);
        this.emails = goPhish.generateEmails(null, window.localStorage.getItem("sccs_gophish_current"),emailCats);
        this.#store();
    }
    /**
    * Load page config from localStorage or query parameter, with query parameter
    * taking precedence.
    */
    refresh() {
        var jsonConfig = null;
        const pageConfigLocal = window.localStorage.getItem("__sccs_gophish");
        if (pageConfigLocal !== null) {
            jsonConfig = JSON.parse(pageConfigLocal);
        }
        const urlParams = new URLSearchParams(window.location.search);
        const config = urlParams.get("config");
        if (config !== null) {
            jsonConfig = JSON.parse(decodeURIComponent(config));
        }
        if (jsonConfig !== null) {
            Object.assign(this, jsonConfig);
        }
        this.#store();


    }
    /**
     * Create a new default config and save the existing config to user config
     * @param dict config starting config
     */
    createNew(config = {}) {
        this.#store();
        Object.keys(this).forEach(key => delete this[key]);
        window.localStorage.removeItem("sccs_gophish_current");
        this.#store();

    }
    storeSelected(uid, xpath){
        var emailSelected = [];
        if(uid in this.selected){
            emailSelected = this.selected[uid];
        }else{
            this.selected[uid] = emailSelected;
        }
        emailSelected.push(xpath);
        this.#store();
    }
    removeSelected(uid, xpath){
        if(uid in this.selected){
            var emailSelected = this.selected[uid];
            var index = emailSelected.indexOf(xpath);
            if (index !== -1) {
                emailSelected.splice(index, 1);
            }
            this.#store();
        }
    }
    updateSelected(uid){
        if(uid in this.selected){
            var emailSelected = this.selected[uid];
            
            for(var i=0;i<emailSelected.length;i++){
                var results = document.evaluate(emailSelected[i], document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
                results.snapshotItem(0).classList.add("selected");
                
                
            }
            
            
        }
    }
    /**
     * Get a list of config account names
     * @returns list of account name
     */
    getConfigAccounts() {
        var results = [];
        var userConfig = window.localStorage.getItem("__sccs_gophish_user_config");
        if (userConfig === null) {
            return results;
        } else {
            userConfig = JSON.parse(userConfig);
            Object.keys(userConfig).forEach(key => results.push(key));
            return results;
        }
    }
    clear() {
        const current = window.localStorage.getItem("sccs_gophish_current");
        if (current !== null) {
            var userConfig = window.localStorage.getItem("__sccs_gophish_user_config");
            if (userConfig !== null) {
                userConfig = JSON.parse(userConfig);
                delete userConfig[current];
                window.localStorage.setItem("__sccs_gophish_user_config", JSON.stringify(userConfig));
            }

        }
        window.localStorage.removeItem("__sccs_gophish");
    }
    /**
     * Change to a different account by exchanging the config files
     * @param string newAccount target account name (email)
     * @returns 
     */
    changeAccount(newAccount) {

        this.#store();
        Object.keys(this).forEach(key => delete this[key]);
        window.localStorage.setItem("sccs_gophish_current", newAccount);
        var userConfig = window.localStorage.getItem("__sccs_gophish_user_config");
        if (userConfig !== null) {
            userConfig = JSON.parse(userConfig);
        } else {
            return;
        }
        if (userConfig.hasOwnProperty(newAccount)) {
            Object.assign(this, JSON.parse(userConfig[newAccount]));
        }
        this.#store();
    }
    /**
     * Store the config file to localStorage
     */
    #store() {
        window.localStorage.setItem("__sccs_gophish", JSON.stringify(this));
        if (window.localStorage.getItem("sccs_gophish_current") != null) {
            var userConfig = window.localStorage.getItem("__sccs_gophish_user_config");
            if (userConfig === null) {
                userConfig = {};
            } else {
                userConfig = JSON.parse(userConfig);
            }
            userConfig[window.localStorage.getItem("sccs_gophish_current")] = JSON.stringify(this);
            window.localStorage.setItem("__sccs_gophish_user_config", JSON.stringify(userConfig));
        }

    }
    /**
     * Set a field in the config
     * @param string field field name
     * @param string value value to store
     */
    setField(field, value) {
        this[field] = value;
        this.#store();
    }
    /**
     * Gets the value from the config if it exists or returns the
     * value specified in def
     * 
     * @param {string} field name
     * @param {*} def default value to return if not present
     * @returns field value or def of not found
     */
    getField(field, def) {
        if (field in this) {
            return this[field];
        }
        return def;
    
    }
    setScore(emailId, score){
        this.scores[emailId] = score;
        this.#store();
    }
    getScore(emailId){
        if(this.scores.hasOwnProperty(emailId)){

            return new GoPhishGameScore(this.scores[emailId]);
        }
        return null;
    }
    
    setProfileCats(cats){
        this.profileCats = cats;
        this.#store();
    }
    getProfileCats(cats){
        return this.profileCats;
    }
    setChecked(emailId){
        this.checked[emailId]=true;
        this.#store();
    }
    isChecked(emailId){
        if(this.checked.hasOwnProperty(emailId) && this.checked[emailId]){
            return true;
        }
        return false;
    }
    getCheckedCount(){
        return Object.keys(this.checked).length;
        
    }
    getEmails() {
        return this.emails;
    }
    addEmailId(emailId) {
        this.emails.push(emailId);
        this.#store();
    }
    setCurrentEmail(emailId){
        this["currentEmailId"] = emailId;
        this.#store();
    }
    getCurrentEmail(){
        var tempEmailId = null;
        if(this.hasOwnProperty("currentEmailId")){
            tempEmailId = this.currentEmailId;
        }
        return tempEmailId;
        
    }
    getNextEmailId(){
        var currentEmailId = this.getCurrentEmail();
        if(currentEmailId!=null){
            for(var i=0;i<this.emails.length;i++){
                if(this.emails[i]==currentEmailId){
                    for(var j=i+1;j<this.emails.length;j++){
                        if(!this.isChecked(this.emails[j])){
                            return this.emails[j];
                        }
                    }
                    for(var j=0;j<i;j++){
                        if(!this.isChecked(this.emails[j])){
                            return this.emails[j];
                        }
                    }        
                }
            }
            return null;
        }else{
            for(var i=0;i<this.emails.length;i++){
                if(!this.isChecked(this.emails[i])){
                    return this.emails[i];
                }
            }
            return null;
        }
    }

}

class GoPhishGameScore {

    constructor(obj=null) {
        
        this.targetCount = 0;
        this.correctCount = 0;
        this.incorrectCount = 0;
        this.missedCount = 0;
        if(obj!=null){
            Object.assign(this, obj);
        }
    }
    init(targetCount,correctCount,incorrectCount,missedCount){
        this.targetCount = targetCount;
        this.correctCount = correctCount;
        this.incorrectCount = incorrectCount;
        this.missedCount = missedCount;
    }
    getTargetCount(){
        return this.targetCount;
    }
    setTargetCount(value){
        this.targetCount=value;
    }
    getCorrectCount(){
        return this.correctCount;
    }
    setCorrectCount(value){
        this.correctCount=value;
    }
    getIncorrectCount(){
        return this.incorrectCount;
    }
    setIncorrectCount(value){
        this.incorrectCount=value;
    }
    getMissedCount(){
        return this.missedCount;
    }
    setMissedCount(value){
        this.missedCount=value;
    }
    
    getPercentageScore(){
        return Math.round((this.correctCount / (this.targetCount + this.incorrectCount))*100);
    }

}
var goPhishGame;
var goPhishEmailAccount;
function loadGoPhish() {
    goPhishEmailAccount = virtualEmailServer.getAccount(window.localStorage.getItem("sccs_gophish_current"));
    var accountName = "" + window.localStorage.getItem("sccs_gophish_current");
    var name = accountName.substr(0, accountName.indexOf("@"));
    name = name.substring(0, 1).toUpperCase() + name.substring(1);
    document.getElementById("profile-title").innerText = name + "'s Profile";
    goPhishGame = new GoPhishGame();
    goPhishGame.refresh();
    goPhishGame.setCurrentEmail(null);
    const emailTaskList = document.getElementById("email-task-list");
    const emailIds = goPhishGame.getEmails();
    for (var i = 0; i < emailIds.length; i++) {
        const button = document.createElement("div");
        button.innerText = "Email " + String(i + 1);
        if(goPhishGame.isChecked(emailIds[i])){
            button.className = "btn btn-success btn-email email-task";
            const resultText = document.createElement("span");
            resultText.className="result-text";
            const scoreObj = goPhishGame.getScore(emailIds[i]);
            if(scoreObj!=null){
                resultText.innerText = scoreObj.getPercentageScore() + "%";
            }
            button.appendChild(resultText);
            const buttonIcon = document.createElement("i");
            buttonIcon.className = "fas fa-check-circle button-icon";
            button.appendChild(buttonIcon);
        }else{
            button.className = "btn btn-primary btn-email email-task";
            const resultText = document.createElement("span");
            resultText.className="result-text";
            button.appendChild(resultText);
            const buttonIcon = document.createElement("i");
            buttonIcon.className = "fas fa-question-circle button-icon";
            button.appendChild(buttonIcon);
        }
        
        button.dataset.sccsEmailId = emailIds[i];
        button.addEventListener('click', function (evt) {
            loadEmail(evt.target.dataset.sccsEmailId);
        });
        emailTaskList.appendChild(button);
    }
    const profileCats = goPhishGame.getProfileCats();
    var templateNames = Object.keys(templates);
    
    if(!profileCats.includes("All")){
        templateNames = templateNames.filter(function(e) { return  profileCats.includes(templates[e].category)})
    }
    const profileStringsSet = {};
    for(var x=0;x<templateNames.length;x++){
        const profileStrings=templates[templateNames[x]].profileStrings;
        for(var y=0;y<profileStrings.length;y++){
            profileStringsSet[profileStrings[y]]=true;
        }
    }
    const profileList = document.getElementById("profileList");
    const profileStringsList = Object.keys(profileStringsSet);
    for(var x=0;x<profileStringsList.length;x++){
        const item = document.createElement("li");
        item.innerText = profileStringsList[x];
        profileList.appendChild(item);
    }
    updateProgress(true);

}
function loadEmail(id, skipCheck=false) {
    if(!skipCheck && !checkSafeToMove(id)){
        return;
    }
    goPhishEmailAccount.getEmailByUid(id).renderContents();
    document.getElementById("emailContentsBody").scrollTop =0;
    updateProgress();
}

