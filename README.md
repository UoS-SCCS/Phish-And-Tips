# Phishing Training
This repository is effectively a fork of the PUPs repository to build on the email module to provide the phishing training. The development aims to be compatible with the PUPs implementation to allow these changes to be integrated with PUPs or kept standalone. 

To view the current development release, switch to email-ui-updates branch and then open ./server/modules/email/email.html in Chrome. There is a dev toolbox on the bottom left to reset and create a test account. (The UI is designed to work in Firefox as well, it is just some of the dev functionality works better in Chrome - i.e. the reset/page refresh in the dev toolbox, hence the recommendation to open in Chrome)

# Practice Using Passwords

This repository contains the Practice Using Passwords training site. The site is a collection of static HTML, JavaScript, CSS, and Images that together form the training system. The contents are designed to be able to served from a simple HTTP server, via a localhost server, or run directly from with the browser.

The Practice Using Passwords training is intended to promote the usage of the three random words password generation technique. This training site provides a sandbox for practising the generation and use of such passwords.

## Design Ethos
The system is designed to provide a safe sandbox within which users can follow a number of lessons on creating and using passwords in common online scenarios. As part of this we have developed simulated registration, login, Email Account, 2FA, and CAPTCHA. All these functions run entirely within the browser with data being stored in localStorage. Nothing is submitted to a server to protect user privacy and to ensure that the sandboxed training environment cannot impact on services outside of it. 

When designing simulations of services like email, 2FA and CAPTCHA the intent is to create something that is both visually and cognitively similar or identical to the real thing. They are not intended to be "secure" variants, for example, the CAPTCHA result is checked locally, which in a real situation would be useless. As such, these are not secure components they are simulations that should only be used for training purposes. 

## Cross-Browser Analysis
An analysis of cross-browser analysis can be found in [docs/crossbrowser.md](./docs/crossbrowser.md)

## Extending the Training Site
An overview and guide to extending the training site can be found in [docs/extending.md](./docs/extending.md)

## Current Status
The project is in active development but the core lessons are stable.

**Implemented Functionality:**
* Training landing page to guide the user through the setup of their training environment and the various lessons
* Lesson 2-5 [Registration, Login, 2FA, CAPTCHA]
* Simulated email account
    * Provides multiple folders with per email viewing and rendering
    * Automatic synchronisation when new emails are created
    * _**Does not provide the ability to send email**_
* Training reset and restart
* Customised zxcvbn password analysis to evaluate if three words technique is being used
* Password Reset
* Switch from URL based config to localStorage to clean up address bar

**Under Development:**
* Documentation of components and refactoring to allow re-use in future projects
* Email deletion and moving
* Additional error handling

## Questions and Queries
Any questions or queries should be filed as issues on the GitLab repository.