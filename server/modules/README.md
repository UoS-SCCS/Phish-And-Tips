# JavaScript Modules
Contains the following modules:

## Storage
The storage module contains classes to handle the storage and retrieval of user data. There is an abstract database class and a concrete localStorage implementation.

## Server
The server module contains classes to provide an interface to the server. There is an abstract server class that defines the minimal functions that need to be implemented as well as a LocalSimulatedServer that simulates a server using local storage and JavaScript.

## Email
The email module simulates an email account both visually and functionally (receiving only). This provides an email service within the training sandbox within which the created user can receive and view emails. It is intended to be able to reused in future projects and is therefore intended to be able operate as standalone as possible, with some UI exceptions - i.e. the popup menu that allows returning to the training site. 

## CAPTCHA
The CAPTCHA module provides a local simulation of a CAPTCHA involving selecting images containing particular types of objects. It is configurable my modifying the JSON defined in the captcha.js to include additional images.