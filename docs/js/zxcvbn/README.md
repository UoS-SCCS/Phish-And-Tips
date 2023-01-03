# Modified zxcvbn
This folder contains a modified version of zxcvbn. It has been modified to solely look for words within the passwords to assist in determining whether the user has used the three random words approach. It should not be used outside of this usage, in particular, the metric calculation may incorrect based on the change to focus only on word count.

There have been a number of changes made to override the normal behaviour. 