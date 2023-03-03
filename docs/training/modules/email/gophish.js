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
class GoPhish {
    /**
     * Construct a new GoPhish instance
     * 
     * This will initialise the GoPhish phishing email generator
     * 
     */
    constructor() {
        this.config = go_phish_config;
        this.#init();
    }
    #init() {

    }
    generateEmailsOld(count = null, target, emailCats) {
        var genCount = count
        if (count == null) {
            genCount = this.config["emailsToGenerate"];
        }
        var emailIds = [];
        for (var i = 0; i < genCount; i++) {
            const eb = new EmailBuilder();
            const emailContent = document.createElement("div");
            emailContent.innerHTML = "<h3 class='selectable'>Welcome to my email</h3><p class='selectable sccs-should-select' data-explain='Explanation: Imprecise to field'>To someone</p><p class='selectable sccs-should-select' data-explain='Explanation: Overly friendly comment' >I hope this email finds your well.</p><p class='selectable'>" + "This is a short message number " + i.toString() + "</p><a class='selectable sccs-should-select' data-explain='Explanation: Address and URL do not match' href='https://www.google.com'>www.bing.com</a><p class='selectable'>your sincereely</p><p class='selectable'>bob</p>";
            eb.setFromAddress("alice@example.com").setFromName("Alice").setTo(target).setSubject("Message " + i.toString()).setMessage(emailContent).setHeader("reply-to", "test@example.com").setHeader("mailing-list", false)
            eb.setHeader("_suspicious", ["_To", "_From"]);
            const email = new Email(eb);
            //email.init({name:"Alice",address:"alice@example.com"}, "bob@example.com", "Message " + i.toString(), "This is a short message number " + i.toString(),undefined,undefined,{"reply-to":"test@example.com"});
            virtualEmailServer.receiveEmail(email);
            emailIds.push(email.uid);
        }
        return emailIds;
    }
    generateEmails(count = null, target, emailCats) {
        
        var genCount = count
        if (count == null) {
            genCount = this.config["emailsToGenerate"];
        }
        //console.log("Generate Email:" + genCount);
        var emailIds = [];
        const emailGenerator = new EmailGenerator();
        
        var templateNames = Object.keys(templates);
        
        if(!emailCats.includes("All")){
            templateNames = templateNames.filter(function(e) { return  emailCats.includes(templates[e].category)})
        }
        //console.log(templateNames);
        const wrg = new WeightedRandomGenerator(templateNames);
        for (var i = 0; i < genCount; i++) {
            //emailGenerator.constructEmail("shopping",target);
            
            //const eb = emailGenerator.constructEmail(emailGenerator.randomItem(templateNames), target);//new EmailBuilder();
            //const emailContent = document.createElement("div");
            //emailContent.innerHTML = "<h3 class='selectable'>Welcome to my email</h3><p class='selectable sccs-should-select' data-explain='Explanation: Imprecise to field'>To someone</p><p class='selectable sccs-should-select' data-explain='Explanation: Overly friendly comment' >I hope this email finds your well.</p><p class='selectable'>" + "This is a short message number " + i.toString() + "</p><a class='selectable sccs-should-select' data-explain='Explanation: Address and URL do not match' href='https://www.google.com'>www.bing.com</a><p class='selectable'>your sincereely</p><p class='selectable'>bob</p>";
            //eb.setFromAddress("alice@example.com").setFromName("Alice").setTo(target).setSubject("Message " + i.toString()).setMessage(emailContent).setHeader("reply-to", "test@example.com").setHeader("mailing-list", false)
            //eb.setHeader("_suspicious", ["_To", "_From"]);
            var eb=null;
            while(eb==null){
                eb = emailGenerator.constructEmail(wrg.getRandomItem(), target);//new EmailBuilder();    
                //console.log(JSON.stringify(eb));
            }
            //console.log("Generated Email");
            const email = new Email(eb);
            //email.init({name:"Alice",address:"alice@example.com"}, "bob@example.com", "Message " + i.toString(), "This is a short message number " + i.toString(),undefined,undefined,{"reply-to":"test@example.com"});
            virtualEmailServer.receiveEmail(email);
            //console.log("Sent Email");
            emailIds.push(email.uid);
            //console.log("Added ID");
        }
        return emailIds;
    }
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
class WeightedRandomGenerator{
    constructor(list, total){
        this.list = list;
        this.usedList = [];
    }
    _randomInt(max, min = 0) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }
    
    getRandomItem(){
        const itemIdx = this._randomInt(this.list.length, 0);
        const item = this.list[itemIdx];
        this.list.splice(itemIdx,1);
        this.usedList.push(item);
        if(this.list.length==0){
            this.list = this.usedList.slice();
            this.usedList = [];
        }
        return item;
    }
}
class Generator {
    constructor() {
        this.placeholder = new RegExp('(%\S+%)');
        this.explanation = "Missing Explanation";
    }
    randomInt(max, min = 0) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }
    randomItem(array) {
        return array[this.randomInt(array.length, 0)];
    }
    processHeaders(emailBuilder) {
        return;
    }
    processContent(idx, selectedContent, claimed) {
        return;
    }
    init(suspicious) {
        return;
    }
}

class EmailGenerator extends Generator {
    constructor() {
        super();
    }

    constructEmail(type, target, altMaxSuspiciousElements = Number.MAX_VALUE) {
        const realName = target.substring(0, 1).toUpperCase() + target.substring(1, target.indexOf("@"));
        const genericGenerator = new GenericGenerator();
        const template = templates[type];
        const generators = [];
        const sender = this.randomItem(template.senders);
        const eb = new EmailBuilder();
        //console.log("rand:" + this.randomInt(10,1));
        if(this.randomInt(10,1)>7){
            const subjectSpellingGenerator = new SubjectSpellingGrammarGenerator();
            subjectSpellingGenerator.init(true);
            const subjectArr = [this.randomItem(template.subject)];
            const originalSubject = subjectArr[0];
            subjectSpellingGenerator.processContent(0,subjectArr,[]);
            eb.setSubject(subjectArr[0]);
            if(subjectArr[0]!=originalSubject){
                //console.log(subjectArr[0] + "!=" + originalSubject);
                subjectSpellingGenerator.processHeaders(eb);
            }
            
        }else{
            const subject = this.randomItem(template.subject);
            eb.setSubject(subject);
        }
        const buttonText = this.randomItem(template.buttons);
        const urgencyText = this.randomItem(template.content.urgency);
        const content = template.content.lines;
        
        const emailContent = document.createElement("div");
        var claimed = new Array(content.length);
        var selectedContent = new Array(content.length);
        var suspiciousGens = {};
        const susGens = new Array(go_phish_config.suspiciousGenerators.length);
        const randElems = this.randomInt(Math.min(susGens.length, go_phish_config.maxSuspiciousElements, altMaxSuspiciousElements), go_phish_config.minimumSuspiciousElements);
        for (var i = 0; i < susGens.length; i++) {
            if (i < randElems) {
                susGens[i] = true;
            } else {
                susGens[i] = false;
            }
        }
        shuffleArray(susGens);
        //console.log(susGens);
        for (var i = 0; i < go_phish_config.suspiciousGenerators.length; i++) {
            const genName = go_phish_config.suspiciousGenerators[i];
            switch (genName) {
                case "To":
                    suspiciousGens[genName] = susGens[i];
                    var generator = new ToGenerator(realName);
                    generator.init(suspiciousGens);
                    generators.push(generator);
                    break;
                case "URL":
                    suspiciousGens[genName] = susGens[i];
                    var generator = new URLGenerator(sender, buttonText);
                    generator.init(suspiciousGens);
                    generators.push(generator);
                    break;
                case "Sender":
                    suspiciousGens[genName] = susGens[i];
                    var generator = new SenderGenerator(sender);
                    generator.init(suspiciousGens);
                    generators.push(generator);
                    break;
                case "Urgency":
                    suspiciousGens[genName] = susGens[i];
                    var generator = new UrgencyGenerator(urgencyText);
                    generator.init(suspiciousGens);
                    generators.push(generator);
                    break;
                case "SpellingGrammar":
                    suspiciousGens[genName] = susGens[i];
                    var generator = new SpellingGrammarGenerator();
                    generator.init(suspiciousGens);
                    generators.push(generator);
                    break;
                
            }
        }



        for (var i = 0; i < content.length; i++) {
            const line = content[i];
            var textLine = "";
            if (line.length > 1) {
                textLine = this.randomItem(line);
            } else {
                textLine = line[0];
            }
            selectedContent[i] = textLine;
        }
        //console.log("SelectedContent:");
        //console.log(selectedContent);
        for (var i = 0; i < selectedContent.length; i++) {
            for (var j = 0; j < generators.length; j++) {
                generators[j].processContent(i, selectedContent, claimed);
            }
        }
        //console.log(claimed);
        for (var i = 0; i < selectedContent.length; i++) {
            var resp = null;
            if (claimed[i] != null && claimed[i] != undefined) {
                resp = claimed[i].format(selectedContent[i]);
            } else {
                resp = genericGenerator.format(selectedContent[i]);
            }
            if (resp != null) {
                emailContent.appendChild(resp);
            }
        }

        for (var j = 0; j < generators.length; j++) {
            generators[j].processHeaders(eb);
        }
        
        eb.setTo(target);
        eb.setHeader("mailing-list", false);
        eb.setMessage(emailContent);
        //console.log("Claimed:");
        //console.log(claimed);
        var isNull =true;
        for(var i=0;i<claimed.length;i++){
            if(claimed[i]!=undefined && claimed[i]!=PROTECTED){
                isNull = false;
                break;
            }
        }
        if(isNull){
            return null;
        }else{
            return eb;
        }
        //emailContent.innerHTML = "<h3 class='selectable'>Welcome to my email</h3><p class='selectable sccs-should-select' data-explain='Explanation: Imprecise to field'>To someone</p><p class='selectable sccs-should-select' data-explain='Explanation: Overly friendly comment' >I hope this email finds your well.</p><p class='selectable'>"+"This is a short message number " + i.toString() +"</p><a class='selectable sccs-should-select' data-explain='Explanation: Address and URL do not match' href='https://www.google.com'>www.bing.com</a><p class='selectable'>your sincereely</p><p class='selectable'>bob</p>";
        //eb.setFromAddress("alice@example.com").setFromName("Alice").setTo(target).setSubject("Message " + i.toString()).setMessage(emailContent).setHeader("reply-to", "test@example.com").setHeader("mailing-list", false)
        //eb.setHeader("_suspicious", ["_To", "_From"]);
    }
}


class ToGenerator extends Generator {
    constructor(realName) {
        super();
        this.realName = realName;
        this.explanation = "Phishers may not know your real name, so they use generic terms instead of a name";
        this.generic = ["Valued Customer", "Customer", "Priority Customer", "Member", "Valued Member"];
        this._gen_name = "To";
        this.recipientName = null;
        this.isSuspicious = false;
        this.placeholderName = "%RECIPIENT%";
        this.targetName = "";
    }
    init(suspicious) {
        if (this._gen_name in suspicious && suspicious[this._gen_name]) {
            this.isSuspicious = true;
            this.targetName = this.randomItem(this.generic);
        } else {
            this.targetName = this.realName;
        }

    }
    processContent(idx, selectedContent, claimed) {
        if (selectedContent[idx].indexOf(this.placeholderName) >= 0) {
            //Placeholder to replace
            selectedContent[idx] = selectedContent[idx].replaceAll(this.placeholderName, this.targetName);
            if(this.isSuspicious){
                claimed[idx] = this;
            }else{
                claimed[idx] = PROTECTED;
            }
        }
    }
    format(content) {
        const pElem = document.createElement("p");
        pElem.innerHTML = content;
        pElem.classList.add("selectable");
        if (this.isSuspicious) {
            pElem.classList.add("sccs-should-select");
            pElem.dataset.explain = this.explanation;
        }
        return pElem;
    }
}


class UrgencyGenerator extends Generator {
    constructor(urgencyText) {
        super();
        this.explanation = "Phishers may use urgent language to try and persuade you to react or engage with the email.";
        this.isSuspicious = false;
        this._gen_name = "Urgency";
        this.placeholderName = ["%URGENCYSKIP%", "%URGENCYTOP%", "%URGENCYBOTTOM%"];
        this.placement = 0;
        this.targetUrgency = urgencyText;

    }
    init(suspicious) {
        if (this._gen_name in suspicious && suspicious[this._gen_name]) {
            this.isSuspicious = true;
            this.placement = this.randomInt(2, 0);

        } else {
            this.placement = 0;
        }

    }
    processContent(idx, selectedContent, claimed) {
        if (selectedContent[idx].indexOf(this.placeholderName[this.placement]) >= 0) {
            //Placeholder to replace
            selectedContent[idx] = selectedContent[idx].replaceAll(this.placeholderName[this.placement], this.targetUrgency);
            if(this.isSuspicious){
                claimed[idx] = this;
            }else{
                claimed[idx] = PROTECTED;
            }

        }
    }
    format(content) {
        const pElem = document.createElement("p");
        pElem.innerHTML = content;
        pElem.classList.add("selectable");
        if (this.isSuspicious) {
            pElem.classList.add("sccs-should-select");
            pElem.dataset.explain = this.explanation;
        }
        return pElem;
    }
}


class SpellingGrammarGenerator extends Generator {
    constructor() {
        super();
        this.explanation = "It is not uncommon for phishing emails to contain spelling or grammar errors";
        this.isSuspicious = false;
        this._gen_name = "SpellingGrammar";
        this.changes = ["substitution", "missingword", "transpose", "missingletter"];
        this.MAX_SUBSTITUTIONS = 2;
        this.MAX_CHANGES = 4;
        this.MAX_WORDS_TO_CHANGE = 2;
        this.substitutions = {
            "are": ["is"],
            "is": ["are"],
            "there": ["they're", "their"],
            "they're": ["there", "their"],
            "their": ["there", "they're"],
            "your":["you're"],
            "you're":["your"],
            "it's": ["its"],
            "its": ["it's"],
            "accept": ["except"],
            "except": ["accept"],
            "less": ["fewer"],
            "fewer": ["less"],
            "number": ["amount"],
            "amount": ["number"],
            "lose": ["loose"],
            "loose": ["lose"],
            "then": ["than"],
            "than": ["then"],
            "for": ["four"],
            "four": ["for"],
            "three": ["tree"],
            "air": ["heir"],
            "aisle": ["isle"],
            "eye": ["i"],
            "i": ["eye"],
            "bare": ["bear"],
            "be": ["bee"],
            "brake": ["break"],
            "break": ["brake"],
            "buy": ["by"],
            "by": ["buy"],
            "cell": ["sell"],
            "sell": ["cell"],
            "cereal": ["serial"],
            "serial": ["cereal"],
            "course": ["coarse"],
            "coarse": ["course"],
            "complement": ["compliment"],
            "compliment": ["complement"],
            "dear": ["deer"],
            "deer": ["dear"],
            "die": ["dye"],
            "dye": ["die"],
            "fair": ["fare"],
            "fare": ["fair"],
            "fare": ["fair"],
            "flour": ["flower"],
            "flower": ["flour"],
            "hair": ["hare"],
            "hare": ["hair"],
            "heal": ["heel"],
            "heel": ["heal"],
            "hole": ["whole"],
            "whole": ["hole"],
            "hour": ["our"],
            "our": ["hour"],
            "knight": ["night"],
            "night": ["knight"],
            "knot": ["not"],
            "not": ["knot"],
            "know": ["no"],
            "no": ["know"],
            "made": ["maid"],
            "maid": ["made"],
            "meat": ["meet"],
            "meet": ["meat"],
            "none": ["nun"],
            "one": ["won"],
            "won": ["one"],
            "pair": ["pear"],
            "pear": ["pair"],
            "peace": ["piece"],
            "piece": ["peace"],
            "plain": ["plane"],
            "plane": ["plain"],
            "principal": ["principle"],
            "principle": ["principal"],
            "real": ["reel"],
            "right": ["write"],
            "write": ["right"],
            "sail": ["sale"],
            "sale": ["sail"],
            "see": ["sea"],
            "sea": ["see"],
            "sight": ["site"],
            "site": ["sight"],
            "sole": ["soul"],
            "soul": ["sole"],
            "some": ["sum"],
            "sum": ["some"],
            "steal": ["steel"],
            "to": ["too", "two"],
            "too": ["to", "two"],
            "two": ["to", "too"],
            "wait": ["weight"],
            "weight": ["wait"],
            "weak": ["week"],
            "week": ["weak"],
            "wear": ["where"],
            "where": ["wear"]


        };

    }
    init(suspicious) {
        if (this._gen_name in suspicious && suspicious[this._gen_name]) {
            this.isSuspicious = true;
        }

    }
    _processContentSubstitution(idx, selectedContent, claimed) {
        const subs = Object.keys(this.substitutions);
        var foundSubs = new Array();
        for (var i = 0; i < subs.length; i++) {
            if (selectedContent[idx].search(new RegExp("\\b" + subs[i] + "\\b", "gi")) >= 0) {
                foundSubs.push(subs[i])
            }
        }
        var changesMade = 0;
        if (foundSubs.length > 0) {
            shuffleArray(foundSubs);
            const subsToApply = this.randomInt(Math.min(foundSubs.length, this.MAX_SUBSTITUTIONS), 1);

            for (var i = 0; i < subsToApply; i++) {
                var matches = selectedContent[idx].matchAll(new RegExp("\\b" + foundSubs[i] + "\\b", "gi"));
                const matchedArray = new Array();
                for (const nextMatch of matches) {
                    matchedArray.push(nextMatch);
                }
                if (matchedArray.length > 0) {
                    const matchedWord = matchedArray[this.randomInt(matchedArray.length - 1, 0)];
                    const replacementOptions = this.substitutions[foundSubs[i]];
                    const randomReplacementIdx = this.randomInt(replacementOptions.length - 1, 0);
                    var replacementWord = replacementOptions[randomReplacementIdx];
                    if (matchedWord["0"].substring(0, 1) != matchedWord["0"].substring(0, 1).toLowerCase()) {
                        replacementWord = replacementWord.substring(0, 1).toUpperCase() + replacementWord.substring(1);
                    }
                    selectedContent[idx] = selectedContent[idx].substring(0, matchedWord.index) + replacementWord + selectedContent[idx].substring(matchedWord.index + matchedWord["0"].length);
                    changesMade++;
                }

            }
            if(changesMade>0){
                claimed[idx] = this;
            }
        }
        return changesMade;
    }
    _processContentRemoveWord(idx, selectedContent, claimed) {
        var matches = selectedContent[idx].matchAll(new RegExp("\\w+", "gi"));
        var matchedArray = new Array();
        var inTag = false;
        for (const nextMatch of matches) {
            if(nextMatch["0"].startsWith("%") && nextMatch["0"].endsWith("%")){
                continue;
            }else if(nextMatch["0"].startsWith("<\\")){
                inTag = false;
            }else if(nextMatch["0"].startsWith("<")){
                inTag = true;
            }else if(!inTag){
                matchedArray.push(nextMatch);
               
            }
        }
        var changesMade = 0;
        if (matchedArray.length > 3) {
            matchedArray = matchedArray.slice(1, -1);
            const matchedWord = matchedArray[this.randomInt(matchedArray.length - 1, 0)];
            selectedContent[idx] = selectedContent[idx].substring(0, matchedWord.index) + selectedContent[idx].substring(matchedWord.index + matchedWord["0"].length);
            changesMade++;
            claimed[idx] = this;
        }
        return changesMade;

    }
    _processContentRemoveLetter(idx, selectedContent, claimed) {
        var matches = selectedContent[idx].matchAll(new RegExp("\\w+", "gi"));
        var matchedArray = new Array();
        var idxArray = new Array();
        var idxCounter = 0;
        var inTag = false;
        for (const nextMatch of matches) {
            if(nextMatch["0"].startsWith("%") && nextMatch["0"].endsWith("%")){
                continue;
            }else if(nextMatch["0"].startsWith("<\\")){
                inTag = false;
            }else if(nextMatch["0"].startsWith("<")){
                inTag = true;
            }else if(!inTag){
                if(nextMatch.length >=4){
                    matchedArray.push(nextMatch);
                    idxArray.push(idxCounter);
                    idxCounter++;
                }
            }
        }
        var changesMade = 0;
        if (matchedArray.length > 0) {
            const wordsToApplyTo = this.randomInt(Math.min(matchedArray.length, this.MAX_WORDS_TO_CHANGE), 1);
            shuffleArray(idxArray);
            for (var wordIdx = 0; wordIdx < wordsToApplyTo; wordIdx++) {
                const matchedWord = matchedArray[idxArray[wordIdx]];
                var targetWord = matchedWord["0"];
                const randomLetterIdx = this.randomInt(targetWord.length - 1, 0);
                //console.log("RemoveLetterBefore:" + targetWord);
                targetWord = targetWord.slice(0, randomLetterIdx) + targetWord.slice(randomLetterIdx + 1);
                //console.log("RemoveLetterAfter:" + targetWord);
                selectedContent[idx] = selectedContent[idx].substring(0, matchedWord.index) + targetWord + selectedContent[idx].substring(matchedWord.index + matchedWord["0"].length);
                changesMade++;
                claimed[idx] = this;
            }
        }


        return changesMade;

    }
    
    _processContentTranspose(idx, selectedContent, claimed) {
        var matches = selectedContent[idx].matchAll(new RegExp("\\w+", "gi"));
        var matchedArray = new Array();
        var idxArray = new Array();
        var idxCounter = 0;
        var inTag = false;
        for (const nextMatch of matches) {
            if(nextMatch["0"].startsWith("%") && nextMatch["0"].endsWith("%")){
                continue;
            }else if(nextMatch["0"].startsWith("<\\")){
                inTag = false;
            }else if(nextMatch["0"].startsWith("<")){
                inTag = true;
            }else if(!inTag){
                matchedArray.push(nextMatch);
                idxArray.push(idxCounter);
                idxCounter++;
            }
        }
        var changesMade = 0;
        if (matchedArray.length > 0) {
            const wordsToApplyTo = this.randomInt(Math.min(matchedArray.length, this.MAX_WORDS_TO_CHANGE), 1);
            shuffleArray(idxArray);
            for (var wordIdx = 0; wordIdx < wordsToApplyTo; wordIdx++) {
                const matchedWord = matchedArray[idxArray[wordIdx]];
                var targetWord = matchedWord["0"];
                const randomLetterIdx = this.randomInt(targetWord.length - 1, 0);
                if (randomLetterIdx != targetWord.length - 1 && (randomLetterIdx == 0 || this.randomInt(1, 0) == 1)) {
                    //transpose right
                    //console.log("TransposeRightOriginal:" + targetWord);
                    targetWord = targetWord.slice(0, randomLetterIdx) + targetWord.charAt(randomLetterIdx + 1) + targetWord.charAt(randomLetterIdx) + targetWord.slice(randomLetterIdx + 2);
                    //console.log("TransposeRightFinish:" + targetWord);
                } else {
                    //transpose left
                    //console.log("TransposeLeftOriginal:" + targetWord);
                    targetWord = targetWord.slice(0, randomLetterIdx - 1) + targetWord.charAt(randomLetterIdx) + targetWord.charAt(randomLetterIdx - 1) + targetWord.slice(randomLetterIdx + 1);
                    //console.log("TransposeLeftFinish:" + targetWord);
                }
                
                selectedContent[idx] = selectedContent[idx].substring(0, matchedWord.index) + targetWord + selectedContent[idx].substring(matchedWord.index + matchedWord["0"].length);
                changesMade++;
                claimed[idx] = this;
            }
        }
        return changesMade;

    }
    processContent(idx, selectedContent, claimed) {
        var spellingChangeMadeGlobally =0;
            for(var i=0;i<claimed.length;i++){
                if(claimed[i]==this){
                    spellingChangeMadeGlobally++;
                }
            }
        if (spellingChangeMadeGlobally<=1 && selectedContent[idx].search(new RegExp("\\%[^%]*\\%", "gi")) < 0 && selectedContent[idx].search(new RegExp("<[^>]*>", "gi")) < 0 && this.isSuspicious && (claimed[idx] == null || claimed[idx] == undefined)) {
            
            
            //console.log("In Spelling Process Content");
            //console.log(claimed);
            //console.log(claimed[idx]);
            //console.log("Cont Spelling Process Content");

            var operators = this.changes.slice();
            const targetChangesToMake = this.randomInt(this.MAX_CHANGES, 1);
            //console.log(targetChangesToMake);
            var totalChangesMade = 0;
            shuffleArray(operators);
            //console.log(operators);
            for (var i = 0; i < operators.length; i++) {
                if (totalChangesMade >= targetChangesToMake) {
                    break;
                }
                //console.log("changesMade:" + totalChangesMade);
                switch (operators[i]) {
                    case "substitution":
                        totalChangesMade = totalChangesMade + this._processContentSubstitution(idx, selectedContent, claimed);
                        break;
                    case "missingword":
                        totalChangesMade = totalChangesMade + this._processContentRemoveWord(idx, selectedContent, claimed);
                        break;
                    case "transpose":
                        totalChangesMade = totalChangesMade + this._processContentTranspose(idx, selectedContent, claimed);
                        break;
                    case "missingletter":
                        totalChangesMade = totalChangesMade + this._processContentRemoveLetter(idx, selectedContent, claimed);
                        break;
                }
            }

        }
        //else{
        //    this.isSuspicious = false;
        //}

    }
    format(content) {
        //console.log("format Spelling:" + content);
        const pElem = document.createElement("p");
        pElem.innerHTML = content;
        pElem.classList.add("selectable");
        if (this.isSuspicious) {
            pElem.classList.add("sccs-should-select");
            pElem.dataset.explain = this.explanation;
        }
        return pElem;
    }
}


class SubjectSpellingGrammarGenerator extends SpellingGrammarGenerator {
    constructor() {
        super();
    }
    init(suspicious) {
        this.isSuspicious = suspicious;
    }
    format(content) {
        return;
    }
   
    processHeaders(eb) {
        if (this.isSuspicious) {
            eb.appendToHeader("_suspicious", "_Subject");
            eb.appendToHeader("_suspicious-explain_Subject", this.explanation);
        } 

    }
}
class URLGenerator extends Generator {
    constructor(sender, buttonText) {
        super();
        this.sender = sender;
        this.explanation = "Links can have the URLs hidden or made to appear to be going somewhere different to where they really are. For example, the text shown can be different to the actual address in the link. Or the URL can be embedded in a button or piece of text. Hover over the URL and look in the bottom left hand corner to see where the link is really going.";
        this.buttonText = buttonText;
        this._gen_name = "URL";
        this.isSuspicious = false;
        this.visiblePlaceholder = "%VISIBLEURL%";
        this.urlPlaceholder = "%URL%";
        this.buttonClass = "btn btn-primary";
        this.classPlaceholder = "%LINKCLASS%";
    }
    init(suspicious) {
        if (this._gen_name in suspicious && suspicious[this._gen_name]) {
            this.isSuspicious = true;
        }

    }
    processContent(idx, selectedContent, claimed) {

        if (selectedContent[idx].indexOf(this.visiblePlaceholder) >= 0 || selectedContent[idx].indexOf(this.urlPlaceholder) >= 0) {
            //Placeholder to replace
            if (this.isSuspicious && (claimed[idx] == null || claimed[idx] == undefined)) {
                const linkType = this.randomInt(2, 1);
                if(linkType==1){
                    //Hidden URL with Text
                    selectedContent[idx] = selectedContent[idx].replaceAll(this.visiblePlaceholder, this.buttonText);
                }else{
                    //Hidden URL with fake URL
                    selectedContent[idx] = selectedContent[idx].replaceAll(this.visiblePlaceholder, this.sender.fakeWebAddress);
                }
                if(selectedContent[idx].indexOf(this.classPlaceholder) >= 0){
                    //Hidden URL with Button
                    selectedContent[idx] = selectedContent[idx].replaceAll(this.classPlaceholder, this.buttonClass);
                }
                selectedContent[idx] = selectedContent[idx].replaceAll(this.urlPlaceholder, this.sender.realWebAddress);
                claimed[idx] = this;
            } else {
                selectedContent[idx] = selectedContent[idx].replaceAll(this.visiblePlaceholder, this.sender.realWebAddress);
                selectedContent[idx] = selectedContent[idx].replaceAll(this.urlPlaceholder, this.sender.realWebAddress);
                selectedContent[idx] = selectedContent[idx].replaceAll(this.classPlaceholder, "");
            }
        }
    }
    format(content) {
        const pElem = document.createElement("p");
        pElem.innerHTML = content;
        pElem.classList.add("selectable");
        if (this.isSuspicious) {
            pElem.classList.add("sccs-should-select");
            pElem.dataset.explain = this.explanation;
        }
        return pElem;
    }
}
class SenderGenerator extends Generator {
    constructor(sender) {
        super();
        this.sender = sender;
        this.explanation = "Phishing emails will often have fake or misleading from addresses. It is easy to set a fake from address, so you need to check the reply-to address to make sure it is the same or at least from the same organisation.\n\nIt is also important to check that the URL of the address is genuinely for the organisation it claims to be for.";
        this._gen_name = "Sender";
        this.isSuspicious = false;
        this.placeholderName = "%NAME%";
        this.regEx = new RegExp('(%\\S+%)');
    }
    init(suspicious) {
        if (this._gen_name in suspicious && suspicious[this._gen_name]) {
            this.isSuspicious = true;
        }
    }
    processContent(idx, selectedContent, claimed) {
        if (selectedContent[idx].indexOf(this.placeholderName) >= 0) {
            //Placeholder to replace
            if (this.isSuspicious) {
                selectedContent[idx] = selectedContent[idx].replaceAll(this.placeholderName, this.sender.fakeName);
                claimed[idx] = this;
            } else {
                selectedContent[idx] = selectedContent[idx].replaceAll(this.placeholderName, this.sender.realName);
            }

            //We don't claim this because it is not suspicious, we are just inserting an appropriate name
        }
    }
    format(content) {
        //console.log("generic generator:" + content);
        if (!this.regEx.test(content)) {
            const pElem = document.createElement("p");
            pElem.innerHTML = content;
            pElem.classList.add("selectable");
            return pElem;
        }
        return null;
    }
    processHeaders(eb) {
        if (this.isSuspicious) {
            eb.setFromAddress(this.sender.emailAddress).setFromName(this.sender.fakeName).setHeader("reply-to", this.sender.replyAddress);
            eb.appendToHeader("_suspicious", "_From");
            eb.appendToHeader("_suspicious-explain_From", this.explanation);
        } else {
            eb.setFromAddress(this.sender.replyAddress).setFromName(this.sender.realName).setHeader("reply-to", this.sender.replyAddress);
        }

    }
}




class GenericGenerator extends Generator {
    constructor() {
        super();
        this.regEx = new RegExp('(%\\S+%)');
    }
    format(content) {
        //console.log("generic generator:" + content);
        if (!this.regEx.test(content)) {
            const pElem = document.createElement("p");
            pElem.innerHTML = content;
            pElem.classList.add("selectable");
            return pElem;
        }
        return null;
    }
}
const PROTECTED = new GenericGenerator();