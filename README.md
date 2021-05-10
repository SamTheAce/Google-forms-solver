# Google-forms-bruteforcer
Brute-forces google forms to get full possible score.

# Things to know before use:
* This only works for quizzes on Google Forms.
* This will only work if the quiz you are trying to brute-force allows you to edit your response and view your score.
* At the moment this will only brute-force multiple-choice questions. 

# Installation
* Clone the repo.
* `cd` into where the repo is stored.
* `npm install`
* Download GeckoDriver from [here](https://github.com/mozilla/geckodriver/releases) for your os, and place it in your system's path (or whatever).

# Usage
* Fill out a form selecting only the top answer on the multi-choice boxes, the other ones you need to fill in the answer.
* After submitting, copy the "View Score" link, and the "Edit Your Response link". Replace `formUrl` on line 3 with the url to edit. Replace `scoreUrl` on line 4 with the url to view the score.
* Start the program by executing `node .`
* Wait for the program to finish brute-forcing your google forms.

# Supports:
* Multiple-choice questions.

# Todo:
[ ] Add support for dropdown questions.
[ ] Add support for checkbox questions.
[ ] Add support for linear scale questions.
[ ] Add support for multiple choice grid questions.
[ ] Add support for checkbox grid questions.
[ ] Make the code look prettier.
[ ] If the user needs to be logged in to view the form, prompt them to log in.
