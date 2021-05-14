'use strict'

const { JSDOM } = require('jsdom');
const { Builder, By, Key, until, Browser, WebDriver } = require('selenium-webdriver');
const prompt = require('prompt-sync')();

const formUrl = "";
const scoreUrl = "";

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_';
const charactersLength = characters.length;

function genRandomString(length) {
    let result = [];
    for (var i = 0; i < length; i++)
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    return result.join('');
}

function getQuestionType(el) {
    if (el.getElementsByClassName("freebirdFormviewerViewItemsRadiogroupRadioGroup").length > 0)
        return "radio";
    if (el.getElementsByClassName("freebirdFormviewerViewItemsCheckboxChoicesContainer").length > 0)
        return "checkbox";
}

(async () => {

    // Create drivers for the edit form page and view score page.
    let driverForm = await new Builder()
        .forBrowser('firefox')
        .build();

    let driverScore = await new Builder()
        .forBrowser('firefox')
        .build();
    
    // navigate to the form's score and resubmission form
    await driverForm.get(formUrl)
    await driverScore.get(scoreUrl)
    
    // Log-in checks.
    if ((await driverScore.getCurrentUrl()).includes("accounts.google.com")) {
        console.log("You must log-in to continue.");
        console.log("Sign in on the firefox window, then press enter to continue.");
        await prompt("");
    }
    
    if ((await driverForm.getCurrentUrl()).includes("accounts.google.com")) {
        console.log("You must log-in to continue.");
        console.log("Sign in on the firefox window, then press enter to continue.");
        await prompt("");
    }
    
    let complete = false;
    
    while (!complete) {         
        // Create JSDOM manager for the score page.
        let scoreDom = new JSDOM(await driverScore.getPageSource())

        // Get an array of all of the questions.
        const questions = scoreDom.window.document.getElementsByClassName("freebirdFormviewerViewNumberedItemContainer");
        
        // We will exit the upper while loop if the complete variable is unchanged after the for loop finishes running.
        complete = true;

        // For each of the questions.
        for (let i = 0; i < questions.length; i++) {
            const eQuestion = questions[i];
            
            const correct = eQuestion.getElementsByClassName("freebirdFormviewerViewItemsItemCorrectnessIcon")[0].getAttribute("aria-label") == "Correct";
            console.log(`Question ${i} is ${correct ? "correct" : "not correct"}`);
            
            if (correct)
                continue;
            else {
                // Sleep to let everything load in.
                await driverForm.sleep(1000);
                
                // Set the complete variable to false if we encounter a wrong question.
                complete = false;
            }
            
            const functionName = genRandomString(60);
            const id = genRandomString(60);

            switch (getQuestionType(eQuestion)) {
                case "radio":
                    try {
                        // Execute a script to find the selection, find the one after it, and set the id to a random string 60 char long (probably just a bit overkill).
                        await driverForm.executeScript(`function ${functionName}() { const selection = document.getElementsByClassName("freebirdFormviewerComponentsQuestionBaseRoot")[${i}].children[1].children[1].children[0].children[0].children[0].getElementsByClassName("isChecked")[0]; const selectionIndex = Array.prototype.slice.call(selection.parentElement.parentElement.children).indexOf(selection.parentElement); const selectionPlusOne = selection.parentElement.parentElement.children[selectionIndex + 1]; selectionPlusOne.id = "${id}" } try{ ${functionName}(); } catch(e) {console.log(e)}`) 
                        
                        // Find the element from the id, then get the element's location.
                        const element = await driverForm.findElement(By.id(id));
                        const elementRect = await element.getRect();
        
                        // Scroll to the element so we do not raise and error when trying to click it, and click it.
                        await driverForm.executeScript(`window.scrollTo(${elementRect.x}, ${elementRect.y})`);
                        await driverForm.actions().click(element).perform();
                    } catch (e) {
                        console.log('There was an trying to select answer.', e);
                    }
                    
                    try {
                        // Find the submit button, and its location.
                        const submit = await driverForm.findElement(By.xpath('//span[@class="appsMaterialWizButtonPaperbuttonLabel quantumWizButtonPaperbuttonLabel exportLabel" and text()="Submit"]'))
                        const submitRect = await submit.getRect();
                        
                        // Scroll to the element, then click it.
                        await driverForm.executeScript(`window.scrollTo(${submitRect.x}, ${submitRect.y})`);
                        await driverForm.actions().click(submit).perform();
                    } catch (e) {
                        console.log('There was an trying to submit.', e);
                    }
                    
                    // Sleep before we reload so the submission actually goes through.
                    await driverForm.sleep(500);
                    
                    // Refresh the pages.
                    driverScore.get(scoreUrl);
                    driverForm.get(formUrl);
                    break;

                case "checkbox":
                    // Execute script to set all of the checkboxes to have our 'id'.
                    await driverForm.executeScript(`function ${functionName}() { const boxes = document.getElementsByClassName("freebirdFormviewerViewNumberedItemContainer")[${i}].children[0].children[0].children[1].children[1].children; for (let i = 0; i < boxes.length; i++) { if (boxes[i].children[0].classList.contains("isChecked")) continue; boxes[i].id = "${id}" } } ${functionName}();`)
                    
                    // Find the elements marked with the id.
                    const elements = await driverForm.findElements(By.id(id));
                    
                    elements.forEach(async (e) => {
                        // Get the position of the element.
                        const rect = await e.getRect();
                        // Scroll to the element.
                        await driverForm.executeScript(`window.scrollTo(${rect.x}, ${rect.y})`);
                        // Click the element.
                        await driverForm.actions().click(e).perform();
                    })

                    // Find the submit button, and its location.
                    const submit = await driverForm.findElement(By.xpath('//span[@class="appsMaterialWizButtonPaperbuttonLabel quantumWizButtonPaperbuttonLabel exportLabel" and text()="Submit"]'))
                    const submitRect = await submit.getRect();
                    
                    // Scroll to the element, then click it.
                    await driverForm.executeScript(`window.scrollTo(${submitRect.x}, ${submitRect.y})`);
                    await driverForm.actions().click(submit).perform();

                    // Sleep before we reload so the submission actually goes through.
                    await driverForm.sleep(500);
                    
                    // Refresh the pages.
                    driverScore.get(scoreUrl);
                    driverForm.get(formUrl);

                    // Wait for everything to load in.
                    await driverForm.sleep(500);

                    // Refresh the JSDOM manager for the score page.
                    let scoreDom = new JSDOM(await driverScore.getPageSource())

                    // Refresh the questions.
                    const questions = scoreDom.window.document.getElementsByClassName("freebirdFormviewerViewNumberedItemContainer");

                    // Buffer for correctness values.
                    let isCorrect = [];

                    const eChildren = questions[i].children[0].children[2].children;

                    for (let i = 0; i < eChildren.length; i++) {
                        const correct = eChildren[i].children[0].classList.contains("freebirdFormviewerViewItemsCheckboxCorrect")
                        isCorrect[i] = correct;   
                    }

                    // Execute script to set all of the incorrect to have our 'id'.
                    await driverForm.executeScript(`const correct = [${isCorrect}]; function ${functionName}() { const boxes = document.getElementsByClassName("freebirdFormviewerViewNumberedItemContainer")[${i}].children[0].children[0].children[1].children[1].children; for (let i = 0; i < boxes.length; i++) { if (!correct[i]) { boxes[i].children[0].children[0].id = "${id}" } } } ${functionName}();`)
                    
                    // Find the elements marked with our id.
                    const boxes = await driverForm.findElements(By.id(id));

                    //Uncheck the wrong ones.
                    boxes.forEach(async (e) => {
                        // Get the position of the element.
                        const rect = await e.getRect();
                        // Scroll to the element.
                        await driverForm.executeScript(`window.scrollTo(${rect.x}, ${rect.y})`);
                        // Click the element.
                        await driverForm.actions().click(e).perform();
                    })

                    // Find the submit button, and its location.
                    const submitelem = await driverForm.findElement(By.xpath('//span[@class="appsMaterialWizButtonPaperbuttonLabel quantumWizButtonPaperbuttonLabel exportLabel" and text()="Submit"]'))
                    const submitelemRect = await submitelem.getRect();
                    
                    // Scroll to the element, then click it.
                    await driverForm.executeScript(`window.scrollTo(${submitelemRect.x}, ${submitelemRect.y})`);
                    await driverForm.actions().click(submitelem).perform();

                    // Sleep to let the form submit.
                    await driverForm.sleep(500);

                    // Refresh everything.
                    await driverScore.get(scoreUrl);
                    await driverForm.get(formUrl);
                    break;
            }
        }
    }
    
    // We are complete, exit the browsers.
    driverForm.quit();
    driverScore.quit();
    
    console.log("Complete brute-forcing.")
})();
