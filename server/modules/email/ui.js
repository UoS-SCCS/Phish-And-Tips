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
 * Contains a number of UI functions used by the email client
 */

/**
 * Generates a new toast alert to the user
 */
var toastElList = [].slice.call(document.querySelectorAll('.toast'))
var toastList = toastElList.map(function (toastEl) {
    return new bootstrap.Toast(toastEl)
})
var popoverFeedback = null;
/**
 * Hides the popup if it is showing and the button pressed wasn't the popup button
 * @param Event evt 
 */
function hidePopUp(evt) {
    if (evt.target.id !== "popoverHelp") {
        popover.hide()
    }
    //console.log("hidePopUp:" + evt.target.id);
    
    if (evt.target.id !== "popoverHeader" && popoverHeader != null) {
        //console.log("hidePopUp2");
        //popoverHeader.hide()
        //popoverHeader.dispose();
        //popoverHeader =null;
    }
    //if(popoverFeedback!=null){
    //    popoverFeedback.hide();
    //    popoverFeedback=null;
    // }
}
/**
 * Selects email address and puts into the system clipboard
 */
function selectEmailAddress() {
    window.getSelection().selectAllChildren(document.getElementById("accountEmailAddress"));
    document.execCommand("copy");

    var tooltip = new bootstrap.Tooltip(document.getElementById("accountEmailAddress"));
    tooltip.show();
    window.setTimeout(function () { tooltip.hide() }, 1500);
}

/**
 * variable to hold current toast
 */
var currentToast = null;

/**
 * variable to keep reference to popover
 */
var popover;

var popoverHeader;
/**
 * Hide the new email toast
 */
function hideNewEmailToast() {
    if (currentToast !== null) {
        currentToast.hide();
    }
}

/**
 * Show the new email toast pointing to the tag that received the new email
 * @param string tag    that received new email and will be linked to in the toast
 */
function showNewEmailToast(tag) {

    var myToastEl = document.getElementById('newEmailToast');
    var myToast = bootstrap.Toast.getOrCreateInstance(myToastEl);
    document.getElementById("toast-message").innerHTML = "New email received in <a class=\"text-light\" onclick=\"loadTag('" + tag + "')\" href=\"#\">" + tag + "<a/>";
    currentToast = myToast;
    if (currentToast !== null) {
        currentToast.show();
    }
}

/**
 * Show and email
 * @param string tag    Unused
 * @param int index     Unused
 */
function showEmail(tag, index) {
    document.getElementById("email-list").classList.remove("d-block");
    document.getElementById("email-list").classList.add("d-none");
    document.getElementById("email-viewer").classList.add("d-block");
    document.getElementById("email-viewer").classList.remove("d-none");
}

function processHeaders(email, headers, container) {
    for (var i = 0; i < headers.length; i++) {
        const header = headers[i];
        var labelString = "";
        var contentString = "";
        var hasHeader = false;

        if (email.hasOwnProperty(header)) {
            labelString = header;
            contentString = email[header];
            hasHeader = true;
        } else if (header in email.headers) {
            labelString = header;
            contentString = email.headers[header];
            hasHeader = true;
        }

        if (hasHeader) {
            var htmlContent = null;
            if (header == "date") {

                var d = new Date(Date.parse(contentString));
                var dateString = d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear() + ", " + prependZero(d.getHours()) + ":" + prependZero(d.getMinutes());
                contentString = dateString;
            } else if (header == "from") {
                htmlContent = document.createElement("div");
                const fromName = document.createElement("span");
                fromName.className = "sccs-email-from-name";
                fromName.innerText = contentString.name;
                htmlContent.appendChild(fromName);
                htmlContent.appendChild(document.createTextNode('\u00A0'));
                htmlContent.appendChild(document.createTextNode('\u00A0'));
                const fromAddress = document.createElement("span");
                fromAddress.className = "sccs-email-from";
                fromAddress.innerText = "<" + contentString.address + ">";
                htmlContent.appendChild(fromAddress);
            }
            const divRow = document.createElement("tr");

            divRow.className = "sccs-table-row";
            const label = document.createElement("td");
            label.innerText = labelString + ":";
            label.className = "header-popover-label sccs-table-cell"
            divRow.appendChild(label);
            const content = document.createElement("td");
            if (htmlContent != null) {
                content.appendChild(htmlContent);
            } else {
                content.innerText = contentString;
            }

            content.className = "header-popover-content sccs-table-cell"
            divRow.appendChild(content);
            container.appendChild(divRow);
        }
    }
}

function prepHeaderPopover(email) {
    const popContents = document.createElement("div");
    popContents.id = "popheadercontents";
    popContents.className = "header-popover";

    var headers = ["from", "reply-to", "to", "cc", "date", "subject", "mailing-list", "mailed-by", "signed-by", "security"]
    for (var header in email.headers) {
        if (!headers.includes(header) && !header.startsWith("_")) {
            headers.push(header);
        }
    }
    const container = document.createElement("table");
    container.className = "sccs-headers-table"
    processHeaders(email, headers, container);
    popContents.appendChild(container);

    if (popoverHeader != null) {
        try {
            //TODO this causes a problem 

            //popoverHeader.hide();
            //popoverHeader.dispose();
        } catch (error) {
            console.log("popover already removed");
        }
    }

    popoverHeader = new bootstrap.Popover(document.getElementById("popoverHeader"), {
        container: 'body',
        content: popContents,
        trigger: 'focus',
        template: '<div class="popover sccs-popover-headers" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>'
    });
    //console.log(popoverHeader);
    document.getElementById("popoverHeader").addEventListener('shown.bs.popover', function () {
        
        //document.getElementById("popoverHeader").addEventListener('click', hidePopHeader);
        
    });
    document.getElementById("popoverHeader").addEventListener('hidden.bs.popover', function () {
        //document.getElementById("popoverHeader").removeEventListener("click",hidePopHeader);
        
    });
    

    document.getElementById("popoverHeader").addEventListener('click', function (evt) {
        //evt.stopPropagation();
        
    })
}
function hidePopHeader(){
    //console.log("hide called");
    popoverHeader.hide();
}

/**
 * Prepare the help icon popover that provides access to training
 * information. If the email module is to be used outside the
 * training hub remove this part.
 */
function prepPopover() {
    window.name = "SCCSEmailWindow";
    const popContents = document.createElement("div");
    popContents.id = "popcontents";
    popContents.className = "help-popover";
    const divMb = document.createElement("div");
    divMb.className = "mb-3";
    const label = document.createElement("div");
    label.innerText = "Email Address:";
    divMb.appendChild(label);
    const addressHolder = document.createElement("div");
    addressHolder.id = "accountEmailAddress";
    addressHolder.className = "form-control form-control-sm";
    addressHolder.innerText = currentEmailAccount;
    addressHolder.setAttribute("data-bs-toggle", "tooltip");
    addressHolder.setAttribute("data-bs-placement", "bottom");
    addressHolder.setAttribute("data-bs-trigger", "manual");
    addressHolder.title = "Email address copied";


    divMb.appendChild(addressHolder);
    popContents.appendChild(divMb);
    const helpButtonDiv = document.createElement("div");
    helpButtonDiv.className="mb-3";
    const helpButton = document.createElement("a");
    helpButton.className = "btn btn-info";
    helpButton.href = "#";
    helpButton.role = "button";
    helpButton.innerText = "Show Instructions";
    helpButton.id = "openHelpBtnPop"
    helpButtonDiv.appendChild(helpButton);
    popContents.appendChild(helpButtonDiv);
    const emailButton = document.createElement("a");
    emailButton.className = "btn btn-info";
    emailButton.href = "#";
    emailButton.role = "button";
    emailButton.innerText = "Return to Training Site";
    emailButton.id = "openEmailBtnPop"
    popContents.appendChild(emailButton);

    popover = new bootstrap.Popover(document.getElementById("popoverHelp"), {
        container: 'body',
        content: popContents,
    });
    document.getElementById("popoverHelp").addEventListener('shown.bs.popover', function () {

        document.getElementById("accountEmailAddress").addEventListener("click", function () {
            return selectEmailAddress();
        });
        document.getElementById("openEmailBtnPop").addEventListener("click", function () {
            popover.hide()
            return openTraining();
        });
        document.getElementById("openHelpBtnPop").addEventListener("click", function () {
            popover.hide()
            return showWelcomeModal();
        });
    });
    document.getElementById("popoverHelp").addEventListener('click', function (evt) {
        evt.stopPropagation();
    })
}

/**
 * Changes focus back to the training tab if possible
 * @returns false
 */
function openTraining() {
    window.location = "../../index.html";
    
    /**if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        window.open("", "SCCSPasswordTraining");
    }

    window.opener.focus()
    window.open("", "SCCSPasswordTraining");
    if ('GestureEvent' in window && !showniOSWarning) {
        alert("Safari on iOS currently blocks tab switching from within the page. Please manually switch tabs.");
        showniOSWarning = true
    }**/
    return false;

}

/**
 * Shows an modal alert to warn the user they cannot compose within 
 * the virtual email server
 */
function compose() {
    showModal("Compose new email", "The compose feature is disabled within the training site. The training email address is solely used to receive emails as part of training scenarios.", "OK");
}

/**
 * Refresh the current account
 */
function refreshCurrent() {
    hideNewEmailToast();
    renderEmail();
}

/**
 * Load a particular tag by simulating a click on that tags nav component
 * @param string tag    to show
 */
function loadTag(tag) {
    document.getElementById(tag.toLowerCase() + "Nav").click();
    if (currentToast != null) {
        currentToast.hide();
    }
}
function selectElement(evt) {
    if (evt.currentTarget.classList.contains("selected")) {
        evt.currentTarget.classList.remove("selected");
        goPhishGame.removeSelected(document.getElementById("emailContentsDate").dataset.uid, getXPath(evt.currentTarget))
    } else {
        evt.currentTarget.classList.add("selected");
        goPhishGame.storeSelected(document.getElementById("emailContentsDate").dataset.uid, getXPath(evt.currentTarget))

    }

}
function addSelectableListeners() {
    if (document.getElementById("emailContentsBody").getElementsByClassName("selectable").length > 0) {

        var elems = document.getElementsByClassName("selectable");
        for (var i = 0; i < elems.length; i++) {
            const elem = elems[i];
            elem.addEventListener('click', selectElement);
            /**function(evt){
                if(evt.target.classList.contains("selected")){
                    evt.target.classList.remove("selected");
                }else{
                    evt.target.classList.add("selected");
                }
            });*/
        }
        var elems = document.getElementsByClassName("selectable-placeholder");
        for (var i = 0; i < elems.length; i++) {
            const elem = elems[i];
            elem.addEventListener('click', selectElement);
            elem.classList.add("selectable");
        }
        goPhishGame.updateSelected(document.getElementById("emailContentsDate").dataset.uid);
        if (goPhishGame.isChecked(document.getElementById("emailContentsDate").dataset.uid)) {
            scoreSelectable();
        }
    } else {
        var elems = document.getElementsByClassName("selectable-placeholder");
        for (var i = 0; i < elems.length; i++) {
            const elem = elems[i];
            elem.removeEventListener('click', selectElement);
            elem.classList.remove("selectable");
        }

    }

}
var feedbackPops = [];
function scoreSelectable(forceReScore = false) {
    var reloadScore = false;
    var scoreObj;
    if (goPhishGame.isChecked(document.getElementById("emailContentsDate").dataset.uid)) {
        reloadScore = true;
        scoreObj = goPhishGame.getScore(document.getElementById("emailContentsDate").dataset.uid);
    }

    const emailId = document.getElementById("emailContentsDate").dataset.uid;
    goPhishGame.setChecked(document.getElementById("emailContentsDate").dataset.uid);
    const btnElem = document.querySelector('[data-sccs-email-id="' + document.getElementById("emailContentsDate").dataset.uid + '"]');
    btnElem.classList.remove("btn-info");
    btnElem.classList.remove("btn-info");
    btnElem.classList.add("btn-success");

    const resultElem = btnElem.getElementsByTagName("span")[0];


    const iconElem = btnElem.getElementsByTagName("i")[0];
    iconElem.classList.remove("fa-question-circle");
    iconElem.classList.add("fa-check-circle");

    var elems = document.getElementsByClassName("selectable");
    var targetCount = 0;
    var correctCount = 0;
    var incorrectCount = 0;
    var missedCount = 0;


    for (var i = 0; i < elems.length; i++) {
        const elem = elems[i];
        if (elem.classList.contains("sccs-should-select")) {
            targetCount++;
            if (elem.classList.contains("selected")) {
                correctCount++;
                elem.classList.add("sccs-correct");
            } else {
                missedCount++;
                elem.classList.add("sccs-missed");
            }
        } else if (elem.classList.contains("selected")) {
            incorrectCount++;
            elem.classList.add("sccs-incorrect");
        }
    }
    for (var i = elems.length - 1; i >= 0; i--) {
        const elem = elems[i];
        elem.classList.remove("selectable");
        elem.classList.add("selectable-disabled");
        elem.removeEventListener("click", selectElement);


    }
    var elems = document.getElementsByClassName("sccs-correct");
    for (var i = 0; i < elems.length; i++) {
        const elem = elems[i];
        const icon = document.createElement("i");
        icon.className = "fas fa-check-circle sccs-validate-icon sccs-correct-icon";
        elem.insertBefore(icon, elem.firstChild);
        if (elem.dataset.explain != null) {
            icon.dataset.toggle = "popover";
            icon.dataset.bsContent = elem.dataset.explain;
            if (elem.classList.contains("selectable-placeholder")) {
                icon.dataset.bsPlacement = "bottom";
            } else {
                icon.dataset.bsPlacement = "top";
            }
            icon.dataset.bsTrigger = "focus";

            icon.tabIndex = -1;
            icon.title = "Explanation";//elem.dataset.explain;
            const bsTemp = new bootstrap.Popover(icon);
            feedbackPops.push(bsTemp);
            elem.addEventListener("click", function (evt) {
                icon.focus();
                //bsTemp.show();
                //popoverFeedback = bsTemp;

            });
        }
    }
    var elems = document.getElementsByClassName("sccs-incorrect");
    for (var i = 0; i < elems.length; i++) {
        const elem = elems[i];
        const icon = document.createElement("i");
        icon.className = "fas fa-times-circle sccs-validate-icon sccs-incorrect-icon";
        elem.insertBefore(icon, elem.firstChild);
    }
    var elems = document.getElementsByClassName("sccs-missed");
    for (var i = 0; i < elems.length; i++) {
        const elem = elems[i];
        const icon = document.createElement("i");
        icon.className = "fas fa-arrow-alt-circle-right sccs-validate-icon sccs-missed-icon";
        elem.insertBefore(icon, elem.firstChild);
        if (elem.dataset.explain != null) {
            icon.dataset.toggle = "popover";
            icon.dataset.bsContent = elem.dataset.explain;
            icon.dataset.bsTrigger = "focus";
            if (elem.classList.contains("selectable-placeholder")) {
                icon.dataset.bsPlacement = "bottom";
            } else {
                icon.dataset.bsPlacement = "top";
            }
            icon.tabIndex = -1;
            icon.title = "Explanation";//elem.dataset.explain;
            const bsTemp = new bootstrap.Popover(icon);
            feedbackPops.push(bsTemp);
            elem.addEventListener("click", function (evt) {
                icon.focus();
                //if(popoverFeedback!=null){
                //    popoverFeedback.hide();
                //    popoverFeedback=null;
                //}
                //popoverFeedback = bsTemp;
                //bsTemp.show();
                //evt.preventDefault();
                //evt.stopPropagation();
            });
        }
    }
    //console.log("CorrectCount:" + correctCount);
    //console.log("MissedCount:" + missedCount);
    //console.log("IncorrectCOunt:" + incorrectCount);
    //console.log("TargetCount:" + targetCount);
    if (!reloadScore) {
        scoreObj = new GoPhishGameScore();
        scoreObj.init(targetCount, correctCount, incorrectCount, missedCount);
        goPhishGame.setScore(emailId, scoreObj);
        resultElem.innerText = scoreObj.getPercentageScore() + "%";
    }

    
    //console.log(feedbackPops);

    //for(var i=0;i<feedbackPops.length;i++){
    //    feedbackPops[i].show();
    //}
    if (!reloadScore || forceReScore) {
        document.getElementById("correctScore").innerText = " " + scoreObj.getCorrectCount() + " out of " + scoreObj.getTargetCount();
        document.getElementById("incorrectScore").innerText = " " + scoreObj.getIncorrectCount();
        document.getElementById("missedScore").innerText = " " + scoreObj.getMissedCount();
        const options = {};
        options["backdrop"] = "static";
        options["keyboard"] = false;

        const scoreModal = new bootstrap.Modal(document.getElementById('reviewScoreModal'), options)
        scoreModal.show();
    }
    updateProgress();
}
var currentMoveNextModal = null;
var welcomeModal = null;
function updateProgress(isLoading=false){
    const progressElem = document.getElementById("overall-progress");
    const total = goPhishGame.getEmails().length;
    const checked = goPhishGame.getCheckedCount();
    progressElem.innerText="Completed " + checked + " of " + total;

    const nextBtn =  document.getElementById("scoreNextEmailBtn");
    const currentId = goPhishGame.getCurrentEmail();

    if (currentId != null && !goPhishGame.isChecked(currentId)) {
        nextBtn.innerText = "Score Current Email";
    }else if(total>checked && goPhishGame.getNextEmailId() !=null){
        nextBtn.innerText = "Open Next Email";
    }else if(total >= checked){
        nextBtn.innerText = "Return to Training Hub";
    }
}
function scoreNextEmailTask(){
    const total = goPhishGame.getEmails().length;
    const checked = goPhishGame.getCheckedCount();
    const nextId = goPhishGame.getNextEmailId();
    const currentId = goPhishGame.getCurrentEmail();

    if (currentId != null && !goPhishGame.isChecked(currentId)) {
        scoreSelectable()
    }else if(total>checked && goPhishGame.getNextEmailId() !=null){
        moveNextEmailTask();
    }else if(total >= checked){
        window.location ="../../index.html#trainingsummary";
    }
    
}
function showWelcomeModal(){
    const options = {};
    options["backdrop"] = "static";
    options["keyboard"] = false;
    welcomeModal = new bootstrap.Modal(document.getElementById('welcomeModal'), options)
    welcomeModal.show();
}
function moveNextEmailTask() {
    const nextId = goPhishGame.getNextEmailId();
    const currentId = goPhishGame.getCurrentEmail();

    if (nextId != null) {
        if (!goPhishGame.isChecked(currentId) && currentId != null) {
            const options = {};
            options["backdrop"] = "static";
            options["keyboard"] = false;

            currentMoveNextModal = new bootstrap.Modal(document.getElementById('nextWithoutScoreModal'), options)
            currentMoveNextModal.show();
        } else {
            loadEmail(nextId);
        }
        //
    }

}
var targetMoveEmailId=null;
function checkSafeToMove(targetUid,toInbox=false){
    const currentId = goPhishGame.getCurrentEmail();
    targetMoveEmailId = targetUid;
        if (!goPhishGame.isChecked(currentId) && currentId != null) {
            const options = {};
            options["backdrop"] = "static";
            options["keyboard"] = false;
            if(toInbox){
                currentMoveNextModal = new bootstrap.Modal(document.getElementById('listWithoutScoreModal'), options)
                currentMoveNextModal.show();                
            }else{
                currentMoveNextModal = new bootstrap.Modal(document.getElementById('nextWithoutScoreModal'), options)
                currentMoveNextModal.show();  
            }
            return false;
        } else {
            return true;
        }
        //
    
}
function contReturn(){
    if (currentMoveNextModal != null) {

        currentMoveNextModal.hide();

        currentMoveNextModal = null;
    }
    goPhishGame.setCurrentEmail(null);
    goback(true);
}
function contMoveNext() {
    if (currentMoveNextModal != null) {

        currentMoveNextModal.hide();

        currentMoveNextModal = null;
    }
    
    //const nextId = goPhishGame.getNextEmailId();
    if (targetMoveEmailId != null) {
        loadEmail(targetMoveEmailId,true);
    }
}
function scoreCurrentFirst() {
    if (currentMoveNextModal != null) {
        currentMoveNextModal.hide();
        //currentMoveNextModal.dispose();
        currentMoveNextModal = null;
    }
    scoreSelectable();
}

function closeWelcome() {
    if (welcomeModal != null) {
        welcomeModal.hide();
        welcomeModal = null;
    }
    
}

function showCorrect() {

}
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
function checkButtonIsVisible(emailId) {
    document.querySelector('[data-sccs-email-id="' + emailId + '"]').scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'start' });
    //if(!isInViewport(document.querySelector('[data-sccs-email-id="' + emailId + '"]'))){
    //   console.log("Is not in viewport");
    //   document.querySelector('[data-sccs-email-id="' + emailId + '"]').scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    //}
    //console.log("Is in viewport");

}
!function (e, n) { "object" == typeof exports && "undefined" != typeof module ? module.exports = n() : "function" == typeof define && define.amd ? define(n) : (e = e || self).getXPath = n() }(this, function () { return function (e) { var n = e; if (n && n.id) return '//*[@id="' + n.id + '"]'; for (var o = []; n && Node.ELEMENT_NODE === n.nodeType;) { for (var i = 0, r = !1, d = n.previousSibling; d;)d.nodeType !== Node.DOCUMENT_TYPE_NODE && d.nodeName === n.nodeName && i++, d = d.previousSibling; for (d = n.nextSibling; d;) { if (d.nodeName === n.nodeName) { r = !0; break } d = d.nextSibling } o.push((n.prefix ? n.prefix + ":" : "") + n.localName + (i || r ? "[" + (i + 1) + "]" : "")), n = n.parentNode } return o.length ? "/" + o.reverse().join("/") : "" } });
