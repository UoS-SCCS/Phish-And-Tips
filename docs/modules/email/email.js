/*******************************************************************************
*                                                                              *
* (C) Copyright 2021-2022 University of Surrey                                 *
*                                                                              *
* Redistribution and use in source and binary forms, with or without           *
* modification, are permitted provided that the following conditions are met:  *
*                                                                              *
* 1. Redistributions of source code must retain the above copyright notice,    *
* this list of conditions and the following disclaimer.                        *
*                                                                              *
* 2. Redistributions in binary form must reproduce the above copyright notice, *
* this list of conditions and the following disclaimer in the documentation    *
* and/or other materials provided with the distribution.                       *
*                                                                              *
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"  *
* AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE    *
* IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE   *
* ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE    *
* LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR          *
* CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF         *
* SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS     *
* INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN      *
* CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)      *
* ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE   *
* POSSIBILITY OF SUCH DAMAGE.                                                  *
*                                                                              *
*******************************************************************************/
/**
 * Base config of email client
 * 
 * - canSend            currently false as simulating that functionality has not
 *                      been implemented yet.
 * 
 * - tagDisplay         Folders on the left, Inbox is always shown, these are 
 *                      additional tags to show.
 * 
 * - tagIcons           JSONObject mapping tagDisplay names to Font-Awesome icons,
 *                      defaults to a folder icon if not set
 * 
 * - tags               Tags which email can be placed into, this is larger than
 *                      tagDisplay because there are three tags in Inbox
 *                      Primary, Social, and Promotions
 * 
 * - inboxCategories    Which tags are the categories within the Inbox
 * 
 * - inboxCategoryIcons JSONObject mapping inbox categories to font-awesome
 *                      icons, default is folder
 */
const default_config = {
    "canSend": false,
    "tagDisplay": ["Drafts", "Sent", "Spam"],
    "tagIcons": {
        "Inbox": "fa-inbox",
        "Sent": "fa-paper-plane",
        "Drafts": "fa-file",
        "__default": "fa-folder"

    },
    "tags": {
        "Primary": [],
        "Social": [],
        "Promotions": [],
        "Drafts": [],
        "Sent": [],
        "Spam": []
    },
    "inboxCategories": ["Primary", "Social", "Promotions"],
    "inboxCategoryIcons": {
        "Primary": "fa-inbox",
        "Social": "fa-user-friends",
        "Promotions": "fa-tag",
        "__default": "fa-folder"

    },
}
/**
 * List of months
 */
 const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Currently loaded email account
 */
var currentEmailAccount;

/**
 * Tracking variables for current and previously selected emails
 */
var previousEmailObject = null;
var currentEmailObject = null;

/**
 * Top level function to render the specified email account. This will load the
 * email account from localStorage and then call the necessary render functions
 * 
 * The emailAddress parameter is currently unused as we have switched to retrieving
 * this information from either the URL or localStorage
 * 
 * @param string emailAddress - email address to render - currently Unusued
 * @param string selectedCat - currently selected category that should still be selected
 *                              after the render, if null will default to inbox
 */
function renderEmail(emailAddress = null,selectedCat=null) {
    console.log("In render email");
    
    const urlParams = new URLSearchParams(window.location.search);
    currentEmailAccount = urlParams.get("email");
    if (currentEmailObject !== null) {
        previousEmailObject = currentEmailObject;
    }
    if (currentEmailAccount !== null) {
        (currentEmailObject = virtualEmailServer.getAccount(decodeURIComponent(currentEmailAccount))).render(selectedCat);
    } else {
        currentEmailAccount = window.localStorage.getItem("sccs_current");

        if (currentEmailAccount !== null) {
            currentEmailAccount = window.localStorage.getItem("sccs_current");
            (currentEmailObject = virtualEmailServer.getAccount(currentEmailAccount)).render(selectedCat);
        }
    }
    console.log(JSON.stringify(currentEmailObject));
}


/**
 * Class to represent a Virtual Email Server that can handle calls to receive
 * email, create accounts and access those account objects. Data is stored
 * within localStorage.
 */
class VirtualEmailServer {
    /**
     * Construct a new VirtualEmailServer.
     * 
     * This will initialise the server and allow it to receive email, as well
     * as adding a listener for storage events
     * 
     * @param string storageKey -   name of the key in localStorage to store data under
     *                              defaults to sccs_email
     */
    constructor(storageKey = "sccs_email") {
        this.storageKey = storageKey;
        this.accounts = {};
        this.#init();
        window.addEventListener("storage", this.updatedStorage.bind(this), false);
    }

    /**
     * Gets the data from localStorage
     */
    #init() {
        if (localStorage.getItem(this.storageKey) != null) {
            Object.assign(this, JSON.parse(localStorage.getItem(this.storageKey)));

        }
    }

    /**
     * Store the server data back to localStorage
     */
    _store() {
        localStorage.setItem(this.storageKey, JSON.stringify(this, render_replacer));
    }

    /**
     * Reload from localStorage
     */
    reloadDb() {
        Object.assign(this, JSON.parse(localStorage.getItem(this.storageKey)));
    }

    /**
     * Deletes the specified email account from the server
     * 
     * @param string account - account name (email address) to delete
     */
    delete(account) {
        this.reloadDb();
        if (account in this.accounts) {
            delete this.accounts[account];
            this._store();
        }
    }
    updatedStorage() {
        
    }

    /**
     * Create a new account with the specified email address. This does not
     * allow overwriting of existing accounts. If you want to replace an
     * account first delete the existing account and then create a new one
     * 
     * On creation this will send a welcome email to the virtual account so
     * all new accounts start with at least one email in.
     * 
     * @param string emailAddress - email address to create
     * @param JSONOBject config - base configuration of account, i.e categories, etc.
     */
    createAccount(emailAddress, config = default_config, sendWelcome=true) {
        if (!(emailAddress in this.accounts)) {
            const account = new Account(emailAddress, config);
            this.#addAccount(account);
            //TODO we need to move this to PUP specific code
            localStorage.setItem("sccs_current", emailAddress);

            this._store();
            if(sendWelcome){
                const builder = new EmailBuilder();
                builder.setFromName("Training Email Service").setFromAddress("training@example.com").setTo(emailAddress).setSubject("Welcome to the Training Email Service").setMessage("Welcome to the training email service. This is service provides a training email service that can receive emails within the training site.");
                //welcomeEmail.init("Training Email Service", emailAddress, "Welcome to the Training Email Service", "Welcome to the training email service. This is service provides a training email service that can receive emails within the training site.");
                const welcomeEmail = new Email(builder);
                
                this.receiveEmail(welcomeEmail);
            }
        } else {
            alert("Email account already exists");
        }
    }

    /**
     * Gets an Email Account from the email server
     * 
     * @param string emailAddress - email address of the account to retrieve
     * @returns Account object containing the email account or throws an error if it doesn't exist
     */
    getAccount(emailAddress) {
        this.reloadDb();
        if (emailAddress in this.accounts) {
            localStorage.setItem("sccs_current", emailAddress);
            return new Account(emailAddress, this.accounts[emailAddress]);
        } else {
            throw new EmailError("Account not found");
        }
    }

    /**
     * Internal method to add the account to the internal storage
     * 
     * @param Account account - account object to add
     */
    #addAccount(account) {
        this.accounts[account.emailAddress] = account;
    }
    /**
     * This should be used to add a new received email, i.e., an email into the 
     * Inbox. It should not be used for adding sent or draft emails which 
     * should user addEmail instead.
     * 
     * This method will add the email to the account specified in the to field
     * only
     * 
     * @param Email email - email to add, should be to an account that exist on the server
     */
    receiveEmail(email) {
        if (email.to in this.accounts) {
            this.getAccount(email.to).receiveEmail(email);
            this._store();
        } else {
            alert("Email address not recognised by server");
        }
    }

    /**
     * Function add draft or sent emails to an account. This should not be used to
     * add emails to an inbox.
     * 
     * This method will add the email to the account specified in the from field
     * only
     * @param Email email 
     */
    addEmail(email) {
        if (email.to in this.accounts) {
            this.getAccounts(email.from.address).sendEmail(email);
            this._store();
        } else {
            alert("Email address not recognised by server");
        }
    }

}

/**
 * Used to remove internal __render__ values from the object to prevent
 * them being stored in localStorage during saving
 * 
 * @param string key key that will be rendered
 * @param {*} value being rendered
 * @returns 
 */
function render_replacer(key, value) {
    // Filtering out properties
    if (key.startsWith("__render__")) {
        return undefined;
    }
    return value;
}
function prependZero(value){
    if(value<10){
        return "0" + value;
    }
    return value;
}

/**
 * Email object that represents a single email
 */
class Email {
    /**
     * Construct a new Email object either from existing data or a 
     * new empty email object for populating
     * 
     * @param JSONObject emailData - data to load, empty by default
     */
    constructor(emailData = {}) {
        this.uid = null;
        this.from = null;
        this.to = null;
        this.subject = null;
        this.date = null;
        this.message = null;
        this.isHtml = false;
        this.tags = null;
        this.unread = true;
        this.headers = {};
        Object.assign(this, emailData);
        if (this.date !== null && !(this.date instanceof Date)) {
            this.date = new Date(this.date);
        }
        /**
         * This is currently unused - if we need unique IDs uncomment
         * to generate random unique IDs.
         */
        if (this.uid === null) {
            this.uid = crypto.randomUUID();
        }
    }
    /**
     * Initialise a new email object with the specified values
     * @param {} from       email address and name of sender
     * @param string to         email address of recipient
     * @param string subject    subject of the email
     * @param string message    message content, can be text, if HTML set isHtml=true
     * @param boolean isHtml    if true message is rendered as HTML
     * @param Date date         date email was received
     * @param {*} tags - currently Unused
     */
    init(from, to, subject, message, isHtml = false, date = new Date(), headers = {},tags = null) {
        this.from = from;
        this.to = to;
        this.subject = subject;
        this.message = message;
        this.isHtml = isHtml;
        this.headers = headers;
        this.date = date;
        if (!(this.date instanceof Date)) {
            this.date = new Date(this.date);
        }
    }

    /**
     * Mark the email as read when rendered
     */
    markAsRead() {
        this.unread = false;
        if (this.__render__anchor !== null && this.__render__anchor!== undefined) {
            this.__render__anchor.classList.remove("unread");
            this.__render__anchor.classList.add("read");
        }
        virtualEmailServer._store();//TODO remove global reference
    }

    renderHeader(){
        //console.log("Render Header called");
    }
    /**
     * Render the contents of this email into the appropriate location
     * 
     * This will be called when the email is being read, as such this
     * will automatically mark the email as read. 
     * 
     */
    renderContents() {
        this.markAsRead();
        hideNewEmailToast();
        //Reset selectable
        this.#resetSelectable();
        document.getElementById("emailContentsSubject").innerText = this.subject;
        document.getElementById("emailContentsFromName").innerText = this.from.name;
        document.getElementById("emailContentsFrom").innerText = "<" + this.from.address + ">";
        prepHeaderPopover(this);
        //document.getElementById("downCaret").addEventListener("click", this.renderHeader.bind(this));
        if(this.to == currentEmailAccount){
            document.getElementById("emailContentsTo").innerText = "to me";
        }else{
            document.getElementById("emailContentsTo").innerText = "to " + this.to;
        }
        
        var dateString = this.date.getDate() + " " + months[this.date.getMonth()] + " " + this.date.getFullYear() + ", " + prependZero(this.date.getHours()) + ":" + prependZero(this.date.getMinutes()); 
                
        document.getElementById("emailContentsDate").dataset.uid = this.uid;
        document.getElementById("emailContentsDate").innerText = dateString;
        if (this.isHtml) {
            document.getElementById("emailContentsBody").innerHTML = this.message;
        } else {
            document.getElementById("emailContentsBody").innerText = this.message;
        }

        document.getElementById("email-list").classList.remove("d-block");
        document.getElementById("email-list").classList.add("d-none");
        document.getElementById("email-viewer").classList.add("d-block");
        document.getElementById("email-viewer").classList.remove("d-none");
        
        
        var anchors = document.getElementById("emailContentsBody").getElementsByTagName("a");
        for(var i=0;i<anchors.length;i++){
            anchors[i].addEventListener('click',function(evt){
                evt.preventDefault();
                return false;
            });
        }
        if("_suspicious" in this.headers){
            const suspiciousHeader = this.headers["_suspicious"];
            for(var i=0;i<suspiciousHeader.length;i++){
                const sHeader = suspiciousHeader[i];
                
                if(sHeader.startsWith("_")){
                    
                    if(sHeader =="_From"){
                        //console.log("Adding should-select to header");
                        document.getElementById("emailContents" + sHeader.substr(1)).parentElement.classList.add("sccs-should-select");
                        if("_suspicious-explain_From" in this.headers){
                            document.getElementById("emailContents" + sHeader.substr(1)).parentElement.dataset.explain = this.headers["_suspicious-explain_From"];
                        }

                    }else{
                        document.getElementById("emailContents" + sHeader.substr(1)).classList.add("sccs-should-select");
                        if("_suspicious-explain" + sHeader in this.headers){
                            document.getElementById("emailContents" + sHeader.substr(1)).dataset.explain = this.headers["_suspicious-explain" + sHeader];
                        }
                    }
                }
            }
        }
        var emailButtons = document.getElementsByClassName('email-task');
        for(var i=0;i<emailButtons.length;i++){
            //reset any selected button
            if(emailButtons[i].classList.contains("btn-info")){
                if(goPhishGame.isChecked(emailButtons[i].dataset.sccsEmailId)){
                    emailButtons[i].classList.remove("btn-info");
                    emailButtons[i].classList.add("btn-success");
                }else{
                    emailButtons[i].classList.remove("btn-info");
                    emailButtons[i].classList.add("btn-primary");
                }
                
            }
            if(emailButtons[i].dataset.sccsEmailId == this.uid){
                emailButtons[i].classList.remove("btn-primary");
                emailButtons[i].classList.add("btn-info");
                
                emailButtons[i].scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'start' });
                //emailButtons[i].scrollIntoView(true);
                //window.scrollTo(0,0);
                //const currentButton = emailButtons[i];
                //window.setTimeout(function(){
                //    checkButtonIsVisible(currentButton.dataset.sccsEmailId);
                //},200);
                
            }
        }
        addSelectableListeners();
        if(goPhishGame != undefined && goPhishGame !=null){
            goPhishGame.setCurrentEmail(this.uid);
        }
    }
    #resetSelectable() {
        const selectableClasses = ["selectable","selectable-disabled","sccs-should-select","sccs-missed","sccs-correct","sccs-incorrect","selected"];
        for(var i=0;i<selectableClasses.length;i++){
            this.#findAndRemoveSelectableClass(selectableClasses[i]);
        }
        var elems = document.getElementsByClassName("sccs-validate-icon");
        for(var i=elems.length-1;i>=0;i--){
            elems[i].parentElement.removeChild(elems[i]);
        }
    }
    #findAndRemoveSelectableClass(className){
        var elems = document.getElementsByClassName(className);
        for(var i=elems.length-1;i>=0;i--){
            elems[i].classList.remove(className);
        }
    }
    /**
     * Internal function to render the checkboxes. These are currently disabled
     * but in future work will be expanded to allow selection and manipulation
     * of emails in the inbox
     * 
     * TODO - enabled checkbox selection functionality
     * 
     * @returns HTMLDivElement containing the checkbox
     */
    #renderCheckbox() {
        const div = document.createElement("div");
        div.className = "checkbox";
        //const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "checkbox";
        input.disabled = true;
        input.title="Select email";
        //label.appendChild(input);
        div.appendChild(input);
        return div;


    }
    /**
     * Renders a star object to mimic GMail
     * @returns HTMLiElement contain star icon
     */
    #renderStar() {
        const icon = document.createElement("i");
        icon.className = "far fa-star";
        return icon;
    }
    /**
     * Render the form portion of the email
     * @returns HTMLSpanELement containing from
     */
    #renderFrom() {
        const span = document.createElement("span");
        span.className = "from";
        span.appendChild(document.createTextNode(this.from.name));
        return span;

    }
    /**
     * Render the subject
     * @returns HTMLSpanELement containing subject
     */
    #renderSubject() {
        const span = document.createElement("span");
        span.className = "subject";
        span.appendChild(document.createTextNode(this.subject));
        return span;
    }
    /**
     * Render a spacer character
     * @returns HTMLSpanELement containing a space/hyphen
     */
    #renderSpacer() {
        const span = document.createElement("span");
        span.appendChild(document.createTextNode("\u00A0-\u00A0"));
        return span;
    }
    /**
     * Used to render a portion of the email in the email list.
     * 
     * Where it is an HTML email, the element is rendered and the text
     * extracted via innerText
     * 
     * @returns HTMLSpanELement containing a text representation of the email
     */
    #renderMsg() {
        const span = document.createElement("span");
        const placeholder = document.getElementById("textPlaceholder");
        span.className = "msg";
        if (this.isHtml) {
            //Render to HTML to extract text with line breaks
            placeholder.innerHTML = this.message;
            span.innerText=placeholder.innerText.replaceAll("\n", " ");
            placeholder.innerHTML = "";
        } else {
            span.appendChild(document.createTextNode(this.message));
        }
        return span;
    }
    /**
     * Render the time/date portion of the email. This currently shows
     * the full date/time always. 
     * 
     * Future work is to only show the full date if it is different from
     * today.
     * 
     * @returns HTMLSpanELement containing time of email
     */
    #renderTime() {
        const span = document.createElement("span");
        span.className = "badge float-end";
        //TODO Render just time if same day
        var dateString = this.date.getDate() + " " + months[this.date.getMonth()];
        span.appendChild(document.createTextNode(dateString));
        return span;
    }

    /**
     * Renders this email for the folder list, note this is not rendering the email
     * for reading, just for seeing in the list of emails. It will call the
     * necessary render functions to create the equivalent of a single row for this
     * email.
     * 
     * The output will be wrapped in an anchor element with appropriate onclick
     * event listener already bound to the renderContents function of this object.
     * As such, clicking the email triggers this email objects renderContents 
     * function to render the actual email.
     * 
     * @returns HTMLAnchorElement wrapping the email list rendering for this email
     */
    render() {
        const anchor = document.createElement("a");
        anchor.addEventListener("click", this.renderContents.bind(this));

        anchor.className = "list-group-item sccs-email-item";
        if (this.unread) {
            anchor.classList.add("unread");
        } else {
            anchor.classList.add("read");
        }
        anchor.href = "#";
        anchor.appendChild(this.#renderCheckbox());
        anchor.appendChild(document.createTextNode("\n"));//We add newlines to get correct whitespace
        anchor.appendChild(this.#renderStar());
        anchor.appendChild(document.createTextNode("\n"));
        anchor.appendChild(this.#renderFrom());
        anchor.appendChild(document.createTextNode("\n"));
        const contentSpan = document.createElement("span");
        contentSpan.className = "sccs-email-list-content-span";

        contentSpan.appendChild(this.#renderSubject());
        //contentSpan.appendChild(document.createTextNode("\n"));
        contentSpan.appendChild(this.#renderSpacer());
        //contentSpan.appendChild(document.createTextNode("\n"));
        contentSpan.appendChild(document.createTextNode(this.#renderMsg().innerText));
        anchor.appendChild(contentSpan);
        anchor.appendChild(document.createTextNode("\n"));
        anchor.appendChild(this.#renderTime());
        this.__render__anchor = anchor;
        return anchor;
    }

}

class EmailBuilder {
    constructor(){
        this.from = {};
        this.to="";
        this.subject="";
        this.message="";
        this.isHtml= false;
        this.headers = {};
        this.date = new Date();
        this.tags = null;
    }
    setTo(to){
        this.to=to;
        return this;
    }
    setFromName(fromName){
        this.from["name"] = fromName;
        return this;
    }
    setFromAddress(fromAddress){
        this.from["address"] = fromAddress;
        return this;
    }
    setSubject(subject){
        this.subject = subject;
        return this;
    }
    setMessage(content, isHtml = false){
        if((content instanceof String || typeof content == "string") && isHtml == false){
            this.message = content;
        }else if((content instanceof String || typeof content == "string") && isHtml){
            this.message = content;
            this.isHtml = isHtml;
        }else if(content instanceof Element){
            this.message = content.outerHTML;
            this.isHtml = true;
        }
        return this;
    }
    hasHeader(header){
        return header in this.headers;
    }
    getHeader(header){
        return this.headers[header];
    }
    appendToHeader(header, value){
        if(!(header in this.headers)){
            this.headers[header] = [];
        }
        this.headers[header].push(value);
    }
    setHeaders(headers){
        this.headers = headers;
        return this;
    }
    setHeader(name, value){
        this.headers[name]=value;
        return this;
    }
    setDate(date){
        this.date = date;
        return this;
    }
}


/**
 * Email Account object representing a single email account
 */
class Account {

    /**
     * Creates a new Account or initialises an existing with
     * the data specified.
     * 
     * This will load the relevant data and convert any email
     * object data in Email objects
     * 
     * @param string emailAddress   email address of this account
     * @param JSONObject emailData  data to be loaded into the account,
     *                              for example, data from the server
     */
    constructor(emailAddress, emailData = default_config) {
        this.__render__tagList = {};
        this.emailAddress = emailAddress;
        Object.assign(this, emailData);
        var eml;
        var tag;
        this.idIndex = {};
        //convert emails into objects
        for (tag in this.tags) {
            var tempEmls = [];
            for (eml of this.tags[tag]) {
                const tempEmail = new Email(eml)
                tempEmls.push(tempEmail);
                this.idIndex[tempEmail.uid]=tempEmail;
            }
            this.tags[tag] = tempEmls;
        }
    }

    /**
     * Called to receive an email into this account. The specified
     * Email object will be checked and then added to the list of emails
     * associated with this account. The email.to field must match
     * this accounts email address otherwise an error will be thrown
     * 
     * Sets defaults in the Email account for this account, for example,
     * if no tag is set this will set it to Primary.
     * 
     * @param Email email   email object to be received
     */
    receiveEmail(email) {
        if (email.to !== this.emailAddress) {
            throw new EmailError("Invalid to address in received email");
        }
        if (email.tags === null) {
            //set default tag to Primary
            email.tags = ["Primary"];
        } else if (!(email.tags instanceof Array)) {
            //convert single string to array
            email.tags = [email.tags];
        }
        var tag;
        //TODO handle emails in multiple tags. Currently they are duplicated 
        //this creates a problem when reading the email because it will only
        //be marked as read in one folder
        for (tag of email.tags) {
            //Add the email to all tags, creating if necessary
            if (!(tag in this.tags)) {
                //If the tag doesn't exist create it
                this.tags[tag] = [];
            }
            this.tags[tag].unshift(email);
        }
        this.idIndex[email.id]=email;

    }
    getEmailByUid(id){
        if(this.idIndex.hasOwnProperty(id)){
            return this.idIndex[id];
        }else{
            return null;
        }
    }
    /**
     * Adds an email from this account to one of its tags. This should only
     * be used for arranging email within this account, for example, adding
     * a sent message to a sent folder, or a draft email to a draft folder.
     * 
     * If the from address does not equal this accounts email address an
     * error will be raised.
     * 
     * @param Email email email object to add to the account, must be from this account
     */
    addEmail(email) {
        if (email.from.address !== this.emailAddress) {
            throw new EmailError("Invalid from address in add email");
        }
        if (email.tags === null) {
            throw new EmailError("Tags cannot be null when adding emails")
        } else if (!(email.tags instanceof Array)) {
            //convert single string to array
            email.tags = [email.tags];
        }
        for (tag of email.tags) {
            //Add the email to all tags, creating if necessary
            if (!(tag in this.tags)) {
                //If the tag doesn't exist create it
                this.tags[tag] = [];
            }
            this.tags[tag].unshift(email);
        }
    }

    /**
     * Render this email account, this includes all tags, categories and emails
     * 
     * @param string selectedTag    the currently selected tag null for default
     * @param string selectedCat    the currently selected category null for default
     */
    render(selectedTag = null, selectedCat = null) {
        document.getElementById("accountName").innerText = this.emailAddress;
        const tagList = document.getElementById("tagList");
        tagList.innerHTML = "";
        var isSelected = false;
        if (selectedTag === null || selectedTag =="Inbox") {
            selectedTag = "Inbox";
            isSelected = true;
        }
        tagList.appendChild(this.#renderTag("Inbox", isSelected));
        isSelected = false;
        var tag;
        const childList = document.getElementById("mailbox-content").children;
        for (var i = childList.length-1; i >0; i--) {
            document.getElementById("mailbox-content").removeChild(childList[i]);
        }
        for (tag of this.tagDisplay) {
            if (tag === selectedTag) {
                isSelected = true;
            }
            tagList.appendChild(this.#renderTag(tag, isSelected));
            document.getElementById("mailbox-content").appendChild(this.#renderTagContents(tag,isSelected));

            isSelected = false;
        }

        const tabList = document.getElementById("inboxTabList");
        tabList.innerHTML = "";
        const inboxTabContainer = document.getElementById("inboxTabContainer");
        inboxTabContainer.innerHTML = "";
        var inboxCat;
        var styleCounter = 1;
        var styleTag = "default-tab";
        var catSelected = false;
        for (inboxCat of this.inboxCategories) {
            if (selectedCat === null && styleCounter === 1) {
                catSelected = true;
            } else if (inboxCat === selectedCat) {
                catSelected = true;
            } else {
                catSelected = false;
            }
            if (styleCounter > 3) {
                styleTag = "default-tab";
            } else {
                styleTag = "tab" + inboxCat;//styleCounter.toString();
            }
            tabList.appendChild(this.#renderInboxCat(inboxCat, styleTag, catSelected));
            const tabContainer = this.#renderInboxCatTab(inboxCat, catSelected)
            const emailList = this.#renderTagListGroup(inboxCat);
            this.__render__tagList[inboxCat] = emailList;
            var eml;
            for (eml of this.tags[inboxCat]) {
                emailList.appendChild(eml.render());
            }
            if (this.tags[inboxCat] !== null && this.tags[inboxCat].length === 0) {
                const emptySpan = document.createElement("span");
                emptySpan.className = " text-center";
                emptySpan.appendChild(document.createTextNode("No emails to display"));
                emailList.appendChild(emptySpan);

            }

            const tempdiv = document.createElement("div");
            tempdiv.appendChild(emailList);

            tabContainer.appendChild(tempdiv);
            inboxTabContainer.appendChild(tabContainer);
            styleCounter++;
        }
        if(selectedTag == "Inbox"){
            document.getElementById("inbox-pane").classList.add("active");
            document.getElementById("inbox-pane").classList.add("show");
        }
        var emailButtons = document.getElementsByClassName('email-task');
        for(var i=0;i<emailButtons.length;i++){
            //reset any selected button
            if(emailButtons[i].classList.contains("btn-info")){
                emailButtons[i].classList.remove("btn-info");
                emailButtons[i].classList.add("btn-primary");
            }
        }
    }
    /**
     * Render an inbox category, i.e Primary, Social
     * 
     * @param string cat        category to render
     * @param boolean activeCat true if this is the currently active category
     * @returns  HTMLDivElement containing the category tab
     */
    #renderInboxCatTab(cat, activeCat) {

        const div = document.createElement("div");
        div.className = "tab-pane fade in";
        if (activeCat) {
            div.classList.add("show");
            div.classList.add("active");
        }
        div.id = cat;
        div.setAttribute("role", "tabpanel");
        div.setAttribute("aria-labelledby", "tab"+cat);
        return div;
    }
    /**
     * Render a tag list-group
     * @param string tag    unused
     * @returns HTMLDivElement containing a list-group
     */
    #renderTagListGroup(tag) {

        const div = document.createElement("div");
        div.className = "list-group";
        return div;
    }

    /**
     * Renders the emails contained by a particular tag. All tags are 
     * rendered in advanced and then hidden. As such, moving between 
     * tags does not cause a page or dynamic reload.
     * 
     * @param string tag            tag name to render
     * @param boolean isSelected    true if the tag is currently selected
     * @returns 
     */
    #renderTagContents(tag,isSelected) {

        const tagContainer = document.createElement("div");
        tagContainer.id = tag.toLowerCase() + "-pane";
        tagContainer.setAttribute("role", "tabpanel");
        tagContainer.setAttribute("aria-labelledby", tag.toLowerCase() + "Nav");
        tagContainer.classList.add("tab-pane");
        //tagContainer.classList.add("fade"); REMOVED due to it causing Illegal Invocation errors
        //Possibly due to the fade still running after the element has been deleted
        if(isSelected){
            tagContainer.classList.add("active");
            tagContainer.classList.add("show");
        }
        const listingContainer = document.createElement("div");
        listingContainer.id = tag.toLowerCase() + "Container";
        listingContainer.className = "email-listing";
        const emailList = this.#renderTagListGroup(tag);
        this.__render__tagList[tag] = emailList;
        var eml;
        for (eml of this.tags[tag]) {
            emailList.appendChild(eml.render());
        }
        if (this.tags[tag] !== null && this.tags[tag].length === 0) {
            const emptySpan = document.createElement("span");
            emptySpan.className = " text-center";
            emptySpan.appendChild(document.createTextNode("No emails to display"));
            emailList.appendChild(emptySpan);

        }

        const tempdiv = document.createElement("div");
        tempdiv.appendChild(emailList);
        listingContainer.appendChild(tempdiv);
        tagContainer.appendChild(listingContainer);
        return tagContainer;
    }

    /**
     * Render the inbox category tab component
     * @param string cat        category being rendered
     * @param string styleTag   additional styling tag, defaults to default-tab
     * @param boolean activeCat true if this is the actively selected category
     * @returns HTMLLiElement containing a tab component for this category
     */
    #renderInboxCat(cat, styleTag = "default-tab", activeCat = false) {
        const li = document.createElement("li");
        li.className = "nav-item";
        li.setAttribute("role", "presentation");
        const anchor = document.createElement("a");

        anchor.className = "nav-link";
        if (activeCat) {
            anchor.classList.add("active");
        }
        anchor.classList.add(styleTag);
        anchor.href = "#" + cat;
        anchor.setAttribute("data-bs-toggle", "tab");
        anchor.setAttribute("data-bs-target", "#" + cat);
        anchor.setAttribute("role", "tab");
        anchor.setAttribute("aria-controls", cat);
        anchor.setAttribute("aria-selected", activeCat);
        anchor.id=styleTag;
        anchor.addEventListener("show.bs.tab", this.showTab);

        var iconImg = "fa-folder";
        if (cat in this.inboxCategoryIcons) {
            iconImg = this.inboxCategoryIcons[cat];
        } else if ("__default" in this.inboxCategoryIcons) {
            iconImg = this.inboxCategoryIcons["__default"];
        }

        const icon = document.createElement("i");
        icon.classList.add("fas");
        icon.classList.add(iconImg);
        icon.classList.add("cat-icon");
        anchor.appendChild(icon);
        anchor.appendChild(document.createTextNode(cat));
        li.appendChild(anchor);
        return li;
    }
    /**
     * Event that is called when a tab is clicked, we don't take any
     * actions as it is handled by bootstrap, but we could add 
     * additional processing here
     * 
     * @param Event evt event object
     */
    showTab(evt) {
        const targetTab = evt.target.getAttribute("aria-controls");
        //console.log("showTab called:" + targetTab);

    }
    /**
     * Renders a category
     * 
     * This hides the existing email view and renders an email list view
     * 
     * @param string sccsTag    tag to be rendered
     */
    showCat(sccsTag) {
        
        //const sccsTag = evt.currentTarget.dataset.sccsTag;
        document.getElementById("email-list").classList.remove("d-none");
        document.getElementById("email-list").classList.add("d-block");
        document.getElementById("email-viewer").classList.add("d-none");
        document.getElementById("email-viewer").classList.remove("d-block");
        hideNewEmailToast();
        renderEmail(null,sccsTag);
        

    }

    /**
     * Render a tag in the list of tabs. This will also calculate how many emails
     * are unread and render that number. Additionally, it will detect if any
     * new emails have been received since the last render and show a toast
     * to alert the user if they have been.
     * 
     * @param string tag        tag to be rendered
     * @param boolean activeTag true if this tag is currently selected
     * @returns HTMLAnchorElement containing 
     */
    #renderTag(tag, activeTag = false) {
        const anchor = document.createElement("a");
        anchor.href = "#";
        anchor.id = tag.toLowerCase() + "Nav";
        anchor.setAttribute("data-bs-toggle", "pill");
        anchor.setAttribute("role", "tab");
        anchor.setAttribute("data-bs-target", "#" + tag.toLowerCase() + "-pane");
        anchor.setAttribute("data-sccs-tag", tag);
        anchor.className = "nav-item nav-link";
        anchor.addEventListener("click", _=>this.showCat(tag));
        var unreadCount = 0;
        var eml;
        if (tag === "Inbox") {
            var cat;
            for (cat of this.inboxCategories) {
                for (eml of this.tags[cat]) {
                    if (eml.unread) {
                        unreadCount++;
                    }
                }
            }
            if (previousEmailObject != null) {
                var previousUnreadCount = 0;
                for (cat of previousEmailObject.inboxCategories) {
                    for (eml of previousEmailObject.tags[cat]) {
                        if (eml.unread) {
                            previousUnreadCount++;
                        }
                    }
                }
                if (unreadCount !== previousUnreadCount) {
                    //console.log("unreadCount:" + unreadCount + " - Previous:" + previousUnreadCount);
                    showNewEmailToast("Inbox");

                }
            }

        } else {
            for (eml of this.tags[tag]) {
                if (eml.unread) {
                    unreadCount++;
                }
            }
            if (previousEmailObject != null) {
                var previousUnreadCount = 0;
                for (eml of previousEmailObject.tags[tag]) {
                    if (eml.unread) {
                        previousUnreadCount++;
                    }
                }

                if (unreadCount !== previousUnreadCount) {
                    //console.log("unreadCount:" + unreadCount + " - Previous:" + previousUnreadCount);
                    showNewEmailToast("Inbox");

                }
            }
        }
        var iconImg = "fa-folder";
        if (tag in this.tagIcons) {
            iconImg = this.tagIcons[tag];
        } else if ("__default" in this.tagIcons) {
            iconImg = this.tagIcons["__default"];
        }

        const icon = document.createElement("i");
        icon.classList.add("fas");
        icon.classList.add(iconImg);
        icon.classList.add("cat-icon");
        anchor.appendChild(icon);
        anchor.appendChild(document.createTextNode(tag));

        if (unreadCount > 0) {
            anchor.classList.add("unread");
            const badge = document.createElement("span");
            badge.className = "badge float-end";
            badge.innerText = unreadCount;
            anchor.appendChild(badge);
        }
        if (activeTag) {
            anchor.classList.add("active");
        }
        return anchor;

    }
}

/**
 * Generic email error object
 */
class EmailError extends Error {

    constructor(message) {
        super(message);
        this.name = "EmailError";
    }

}

/**
 * ===================================================
 * Globals
 * ===================================================
 * TODO Ideally we'd like to remove these globals, but
 * for the moment they are sufficient
 */


/**
 * Single reference to the virtualEmailServer
 */
const virtualEmailServer = new VirtualEmailServer();

/**
 * Storage listener to update the email render when new
 * emails are received
 */
function addStorageListener() {
    window.addEventListener('storage', storageChanged);
}

/**
 * Triggers a new render when emails are received
 * @param Event evt     storage event that triggered this function
 */
function storageChanged(evt) {
    
    if (evt.key === "sccs_email") {
        renderEmail();
    }
}

/**
 * Go back function within the email UI
 */
function goback(skipTest=false) {
    if(!skipTest && !checkSafeToMove(undefined,true)){
        return;
    }
    document.getElementById("email-list").classList.remove("d-none");
    document.getElementById("email-list").classList.add("d-block");
    document.getElementById("email-viewer").classList.add("d-none");
    document.getElementById("email-viewer").classList.remove("d-block");
    hideNewEmailToast();
    renderEmail();
    
}

/**
 * =======================================================================
 * Test function demonstrating how to create an account and send a message
 * 
 * This is left here for documentation purposes, but is not used in normal
 * operation.
 * =======================================================================
 */

function prepareTest() {
    virtualEmailServer.createAccount("bob@example.com");
    for (var i = 0; i < 30; i++) {
        email = new Email();
        email.init({name:"Alice",address:"alice@example.com"}, "bob@example.com", "Message " + i.toString(), "This is a short message number " + i.toString(),undefined,undefined,{"reply-to":"test@example.com"});
        virtualEmailServer.receiveEmail(email);
    }
}
function prepareTestAlt() {
    virtualEmailServer.createAccount("bob@example.com");
    const goPhish = new GoPhish();
    goPhish.generateEmails();
    /**for (var i = 0; i < 30; i++) {
        const eb = new EmailBuilder();
        const emailContent = document.createElement("div");
        emailContent.innerHTML = "<h3 class='selectable'>Welcome to my email</h3><p class='selectable sccs-should-select' data-explain='Explanation: Imprecise to field'>To someone</p><p class='selectable sccs-should-select' data-explain='Explanation: Overly friendly comment' >I hope this email finds your well.</p><p class='selectable'>"+"This is a short message number " + i.toString() +"</p><a class='selectable sccs-should-select' data-explain='Explanation: Address and URL do not match' href='https://www.google.com'>www.bing.com</a><p class='selectable'>your sincereely</p><p class='selectable'>bob</p>";
        eb.setFromAddress("alice@example.com").setFromName("Alice").setTo("bob@example.com").setSubject("Message " + i.toString()).setMessage(emailContent).setHeader("reply-to","test@example.com").setHeader("mailing-list",false)
        email = new Email(eb);
        //email.init({name:"Alice",address:"alice@example.com"}, "bob@example.com", "Message " + i.toString(), "This is a short message number " + i.toString(),undefined,undefined,{"reply-to":"test@example.com"});
        virtualEmailServer.receiveEmail(email);
    }*/
}
function devReset(){
    window.localStorage.clear();
    window.location.reload();
}
function devTest(){
    prepareTestAlt();
    window.location = window.location.origin + window.location.pathname + "?email=bob@example.com";
}