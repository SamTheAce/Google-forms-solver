# Google Forms Brute-Forcer (aka. FartForcer)
Brute-forces google forms to get full possible score.

https://user-images.githubusercontent.com/65917727/117733423-8b5e1200-b1bf-11eb-8e7c-620093afa297.mp4

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
* After submitting, copy the "View Score" link, and the "Edit Your Response link". Replace `formUrl` on line 7 with the url to edit. Replace `scoreUrl` on line 8 with the url to view the score.
* Start the program by executing `node .`
* Wait for the program to finish brute-forcing your google forms.

# Supports:
* Multiple-choice questions.
* Checkbox questions.

# Todo:
* [ ] Add support for dropdown questions.
* [x] ~~Add support for checkbox questions.~~
* [ ] Add support for quizzes that have multiple sections.
* [ ] Add support for multiple choice grid questions.
* [ ] Add support for checkbox grid questions.
* [ ] Make the code look prettier.
* [x] ~~If the user needs to be logged in to view the form, prompt them to log in.~~
