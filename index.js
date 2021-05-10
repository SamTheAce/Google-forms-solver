'use strict'

const { JSDOM } = require('jsdom');
const {Builder, By, Key, until, Browser} = require('selenium-webdriver');

const formUrl  = "<YOUR FORM EDIT URL HERE>";
const scoreUrl = "<YOUR VIEW SCORE URL HERE>";

const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_';
const charactersLength = characters.length;

function genRandomString(length) {
    let result = [];
    for ( var i = 0; i < length; i++ )
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
   return result.join('');
}

(async() => {
    let driverForm = await new Builder().forBrowser('firefox').build();
    let driverScore = await new Builder().forBrowser('firefox').build();

    // navigate to the form's score and resubmission form
    await driverForm.get(formUrl)
    await driverScore.get(scoreUrl)

    let complete = false;

    while (!complete)
    {
        const formDom = new JSDOM(await driverScore.getPageSource())
        const scoreDom = new JSDOM(await driverScore.getPageSource())
        const questions = scoreDom.window.document.getElementsByClassName("freebirdFormviewerViewNumberedItemContainer");

        complete = true;

        for (let i = 0; i < questions.length ; i++) {
            const eQuestionScore = questions[i];

            const correct = eQuestionScore.getElementsByClassName("freebirdFormviewerViewItemsRadioCorrect").length > 0;
            console.log(`Question ${i} is ${correct ? "correct" : "not correct"}`)

            if (correct)
                continue;    
            else {
                // Sleep to not get flagged by re-captcha.
                await driverForm.sleep(1000);
                complete = false;
            }

            const functionName = genRandomString(60);
            const id = genRandomString(60)

            try {

                await driverForm.executeScript(`function ${functionName}() { const selection = document.getElementsByClassName("freebirdFormviewerViewItemsRadiogroupRadioGroup")[${i}].getElementsByClassName("isChecked")[0]; const selectionIndex = Array.prototype.slice.call(selection.parentElement.parentElement.children).indexOf(selection.parentElement); const selectionPlusOne = selection.parentElement.parentElement.children[selectionIndex + 1]; selectionPlusOne.id = "${id}" } try{ ${functionName}(); } catch(e) {console.log(e)}`)
                const element = await driverForm.findElement(By.id(id))
                const elementRect = await element.getRect();
                await driverForm.executeScript(`window.scrollTo(${elementRect.x}, ${elementRect.y})`);
                await driverForm.actions().click(element).perform();

            } catch (e)
            {
                console.log('There was an trying to select answer.' , e);
            }

            try {
                const submit = await driverForm.findElement(By.xpath('//span[@class="appsMaterialWizButtonPaperbuttonLabel quantumWizButtonPaperbuttonLabel exportLabel" and text()="Submit"]'))
                const submitRect = await submit.getRect();
                await driverForm.executeScript(`window.scrollTo(${submitRect.x}, ${submitRect.y})`);
                await driverForm.actions().click(submit).perform();
            } catch (e)
            {
                console.log('There was an trying to submit.' , e);
            }

            // Sleep before we reload so the submission actually goes through.
            await driverForm.sleep(500);

            driverScore.get(scoreUrl);
            driverForm.get(formUrl);
        }
    }

    driverForm.quit();
    driverScore.quit();
    
    console.log("Complete brute-forcing.")
})();
