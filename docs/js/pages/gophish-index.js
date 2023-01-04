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

goPhishGame = new GoPhishGame();
goPhishGame.refresh();

/**
 * Confirm with the user they wish reset their current training.
 * 
 * This does not clear the training site config, i.e. their email account, 
 * only their training progress.
 * 
 * @returns false
 */
function resetTraining() {
    const result = window.confirm("Are you sure you want to reset your training progress?\n\nThis will clear your current training progress and allow you to try all the training again.");
    if (result) {
        window.location = "index.html#traininglist";


    }
    return false;
}

/**
 * Finish the training and delete all locally stored data.
 * 
 * Confirm the user wish to proceed then delete data from
 * localStorage
 * @returns false
 */
function finish() {
    const result = window.confirm("Are you sure you want to end your training?\n\nThis will delete your training account and training email address. You will be able to try the training again, but will need to repeat the setup and registration steps.");
    if (result) {
        virtualEmailServer.delete(window.localStorage.getItem("sccs_gophish_current"));
        server.delete(window.localStorage.getItem("sccs_gophish_current"));
        goPhishGame.clear();
        window.localStorage.removeItem("sccs_gophish_current");
        loadAccountsList(null);
        closeEmailWindow();

        window.location = "index.html#introduction";
        window.location.reload();

    }
    return false;
}

/**
 * Create a new training account having checked the account name is valid
 * @param Event evt 
 * @returns true if created, false if name is invalid
 */
function configureGoPhishAccount(evt) {
    if (document.getElementById("accountName").reportValidity()) {
        const accountName = document.getElementById("accountName").value.toLowerCase();
        if (accountName === null || accountName === "") {
            alert("You need to enter a name for your account");
            return false;
        } else {
            virtualEmailServer.createAccount(accountName + "@example.com");
            document.getElementById("newAccount").innerText = accountName + "@example.com";
            localStorage.setItem("sccs_gophish_current", accountName + "@example.com");
            loadAccountsList(accountName + "@example.com");

            
            return true;
        }
    } else {
        evt.preventDefault();
        evt.stopPropagation()
        document.getElementById("accountName").classList.add("invalid");
    }
}
function generateGoPhishEmails(evt){

    var checkElems = document.querySelectorAll('input[type="checkbox"].cat-select-checkbox');
    var emailCats = [];
    if(document.getElementById("EmailCatAll").checked){
        emailCats.push("All");
    }else{
        for(var x=0;x<checkElems.length;x++){
            if(checkElems[x].id=="EmailCatAll"){
                continue;
            }
            if(checkElems[x].checked){
                emailCats.push(checkElems[x].value);
            }
        }
    }
    goPhishGame = new GoPhishGame();
    goPhishGame.refresh();
    if(!goPhishGame.hasEmails()){
        goPhishGame.generateEmails(emailCats);
    }
}
/**
 * Reference to popover elements
 */
var popover;

/**
 * Variable to hold reference to accounts dropdown
 */
var accountsList;

/**
 * Render the training landing page, including the help popover.
 * 
 * Note this is a slightly different popover to the standard because
 * it is only shown after the email account setup and doesn't contain
 * a link to the training site, since we are already on the training
 * site
 */
function showTrainingLanding() {

    window.name = "SCCSGoPhishTraining";
    const currentUser = window.localStorage.getItem("sccs_gophish_current");
    if (currentUser !== null) {
        document.getElementById("createNewHolder").classList.remove("d-none");
        document.getElementById("createNewHolder").classList.add("d-block");
    }

    const popContents = document.createElement("div");
    popContents.id = "popcontents";
    popContents.className = "help-popover text-black";

    const divMb = document.createElement("div");
    divMb.className = "mb-3 text-black";
    const label = document.createElement("div");
    label.innerText = "Current Account:";
    divMb.appendChild(label);
    accountsList = document.createElement("select");
    accountsList.id = "currentAccount";
    accountsList.className = "form-select-sm text-black";
    accountsList.style.width = "100%";
    accountsList.innerText = "Email Address";
    accountsList.setAttribute("data-bs-toggle", "tooltip");
    accountsList.setAttribute("data-bs-placement", "bottom");
    accountsList.setAttribute("data-bs-trigger", "manual");
    accountsList.title = "Email address copied";
    loadAccountsList(currentUser);




    divMb.appendChild(accountsList);
    popContents.appendChild(divMb);

    const divHelpBtn = document.createElement("div");
    divHelpBtn.className = "mb-3 d-flex justify-content-center";
    const helpLinkButton = document.createElement("a");
    helpLinkButton.className = "btn btn-info text-black";
    helpLinkButton.href = "https://uos-sccs.github.io/PUPS/lessons/setup/";
    helpLinkButton.target = "_blank";
    helpLinkButton.role = "button";
    helpLinkButton.innerText = "Help with Setting up your Training Account";

    helpLinkButton.id = "helpLinkButton"
    divHelpBtn.style.display = "none";
    divHelpBtn.appendChild(helpLinkButton);
    popContents.appendChild(divHelpBtn);


    const emailButton = document.createElement("a");
    emailButton.className = "btn btn-info text-black";
    emailButton.href = "#";
    emailButton.role = "button";
    emailButton.innerText = "Open Training Email Account";
    emailButton.id = "openEmailBtnPop"
    popContents.appendChild(emailButton);



    popover = new bootstrap.Popover(document.getElementById("popoverHelp"), {
        container: 'body',
        content: popContents,
    });

    document.getElementById("popoverHelp").addEventListener('click', function (evt) {
        evt.stopPropagation();
    })
    document.getElementById("popoverHelp").addEventListener('shown.bs.popover', function () {

        document.getElementById("currentAccount").addEventListener("change", function () {
            changeAccount(document.getElementById("currentAccount").value);
        });

        document.getElementById("openEmailBtnPop").addEventListener("click", function (evt) {
            evt.preventDefault();
            popover.hide();
            return openEmailAccount();
        });
        document.getElementById("helpLinkButton").addEventListener("click", function (evt) {
            popover.hide();
        });
    });


    if (currentUser !== null) {
        //addressHolder.innerText = currentUser;
        accountName.value = currentUser.substr(0, currentUser.indexOf("@"));
        document.getElementById("newAccount").innerText = currentUser;

    }
    var accounts = goPhishGame.getConfigAccounts();
    if (!(window.location.hash.length)) {
        if (accounts.length > 1 || (accounts.length > 0 && currentUser === null)) {
            const selectElement = document.getElementById("multiAccountSelect");
            const placholderOption = document.createElement("option");
            placholderOption.innerText = "----";
            placholderOption.value = "";
            if (currentUser === null) {
                placholderOption.selected = true;
            }
            selectElement.appendChild(placholderOption);

            for (var i = 0; i < accounts.length; i++) {
                const option = document.createElement("option");
                option.innerText = accounts[i];
                option.value = accounts[i];
                if (currentUser != null && accounts[i] === currentUser) {
                    option.selected = true;
                }
                selectElement.appendChild(option);

            }
            const myModal = new bootstrap.Modal(document.getElementById('messageModal'));
            myModal.show();
        }
    }

    const categories = document.getElementById("category-selection");
    const templateNames = Object.keys(templates);
    const setObj = {};
    for(var x=0;x<templateNames.length;x++){
        setObj[templates[templateNames[x]].category]=true;
    }
    
    var checkDiv = document.createElement("div");
    checkDiv.className="all-check-div";
    var checkBoxElem = document.createElement("input");
    checkBoxElem.type="checkbox";
    checkBoxElem.value="All";
    checkBoxElem.name="EmailCatAll";
    checkBoxElem.checked=true;
    checkBoxElem.id="EmailCatAll";
    checkBoxElem.className = "form-check-input cat-select-checkbox";
    checkBoxElem.addEventListener("click",selectAllCats);
    var labelElem = document.createElement("label");
    labelElem.htmlFor ="EmailCatAll";
    labelElem.innerText="All";
    labelElem.className = "form-check-label cat-select-label";
    checkDiv.appendChild(checkBoxElem);
    checkDiv.appendChild(labelElem);
    categories.appendChild(checkDiv);
    const catNames = Object.keys(setObj);
    for(var x=0;x<catNames.length;x++){
        var checkDiv = document.createElement("div");
    
        var catName = catNames[x];
        var checkBoxElem = document.createElement("input");
        checkBoxElem.type="checkbox";
        checkBoxElem.value=catName;
        checkBoxElem.id = "EmailCat" + catName;
        checkBoxElem.name="EmailCat" + catName;
        checkBoxElem.checked=true;
        checkBoxElem.className = "form-check-input cat-select-checkbox";
        checkBoxElem.addEventListener("click", checkCatSelection);
        var labelElem = document.createElement("label");
        labelElem.htmlFor ="EmailCat" + catName;
        labelElem.innerText=catName;
        labelElem.className = "form-check-label cat-select-label";
        checkDiv.appendChild(checkBoxElem);
        checkDiv.appendChild(labelElem);
        categories.appendChild(checkDiv);
    }
    //document.getElementById("traininglist").classList.add("show");
    //if (currentUser !== null) {
    //    window.location = "#traininglist";
    //}

    updateTrainingList();
}
function checkCatSelection(){
    var checkElems = document.querySelectorAll('input[type="checkbox"].cat-select-checkbox');
    var checkCount=0;
    var totalCount=0;
    for(var x=0;x<checkElems.length;x++){
        if(checkElems[x].id=="EmailCatAll"){
            continue;
        }
        totalCount++;
        if(checkElems[x].checked){
            checkCount++;
        }
    }
    if(checkCount==totalCount){
        document.getElementById("EmailCatAll").indeterminate=false;
        document.getElementById("EmailCatAll").checked=true;
    }else if(checkCount==0){
        document.getElementById("EmailCatAll").checked=false;
        document.getElementById("EmailCatAll").indeterminate=false;
    }else{
        document.getElementById("EmailCatAll").checked=false;
        document.getElementById("EmailCatAll").indeterminate=true;            
    }

}
function selectAllCats(){
    const checkValue = document.getElementById("EmailCatAll").checked;
    var checkElems = document.querySelectorAll('input[type="checkbox"].cat-select-checkbox');
    for(var x=0;x<checkElems.length;x++){
        if(checkElems[x].id=="EmailCatAll"){
            continue;
        }
        checkElems[x].checked=checkValue;
    }
}
/**
 * Populate the accounts list dropdown
 * @param string currentUser email of current user
 */
function loadAccountsList(currentUser) {
    var accounts = goPhishGame.getConfigAccounts();
    accountsList.innerHTML = "";

    const option = document.createElement("option");
    option.innerText = "Create New Account";
    option.value = "CreateNew";
    if (currentUser != null && accounts[i] === currentUser) {
        option.selected = true;
    }
    accountsList.appendChild(option);
    const placholderOption = document.createElement("option");
    placholderOption.innerText = "----";
    placholderOption.value = "";
    if (currentUser === null) {
        placholderOption.selected = true;
    }
    accountsList.appendChild(placholderOption);

    for (var i = 0; i < accounts.length; i++) {
        const option = document.createElement("option");
        option.innerText = accounts[i];
        option.value = accounts[i];
        if (currentUser != null && accounts[i] === currentUser) {
            option.selected = true;
        }
        accountsList.appendChild(option);

    }
}
/**
 * Change the current account and reload
 * @param string newAccount account name to change to (email)
 */
function changeAccount(newAccount) {
    if (newAccount === "CreateNew") {
        createNewTrainingAccount();
    } else if (newAccount === "") {
        //do nothing it is a placeholder
    } else {
        goPhishGame.changeAccount(newAccount);
        window.location.href = "#introduction";
        window.location.reload(true);
    }

}
/**
 * Check if we need to change the account or create a new one. If so
 * trigger the change
 */
function checkChangeAccount() {
    const currentUser = window.localStorage.getItem("sccs_gophish_current");
    const selectValue = document.getElementById("multiAccountSelect").value;
    if (selectValue === "CreateNew") {
        createNewTrainingAccount();
    } else if (selectValue === "") {
        //placeholder
    } else if (selectValue !== currentUser) {
        changeAccount(selectValue);
    }
}
/**
 * Update the rendering of the training list based on what has been 
 * completed. Disables those lessons (Registration) that cannot
 * be repeated without a reset. Those that are completed and can
 * be redone are left enabled but with a green tick overlay
 * 
 * Lessons that are inaccessible until the previous lesson is
 * completed are disabled and faded.
 */
function updateTrainingList() {
    const currentUser = window.localStorage.getItem("sccs_gophish_current");

}
/**
 * Create a new training account by clearing the current config
 */
function createNewGoPhishTrainingAccount() {
    const result = window.confirm("Are you sure you want to create a new Phish and Tips! training account?\n\nThis will clear your current training progress and allow you to try all the training again.");
    if (result) {
        
        window.localStorage.removeItem("sccs_email");
        window.localStorage.removeItem("__sccs_gophish");
        window.localStorage.removeItem("__sccs_config");
        window.localStorage.removeItem("__sccs_gophish_user_config");
        window.localStorage.removeItem("__sccs_user_config");
        
        window.localStorage.removeItem("sccs_current");
        window.localStorage.removeItem("sccs_gophish_current");
        
        
        window.location = "index.html";


    }
    return false;

   

}