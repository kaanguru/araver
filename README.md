# Pause Screen

WebExtension for Firefox. Set reminders to take...

* **Short Breaks** from work to look around
* **Long Breaks** to stretch, get stronger and chat with your colleagues and friends.

## Install

The addon is available on Mozialla addons page <https://addons.mozilla.org/en-US/firefox/addon/blink-reminder/>

### PauseScreen Class Documentation
The 
PauseScreen
 class is responsible for managing the settings, time without break, and last state change timestamp of the application. It also contains methods to initialize the application, detect state changes, handle alarm firings, and load settings.

Properties
settings
 - A 
PauseScreenSettings
 object that stores the application settings
timeWithoutBreak
 - An integer that stores the amount of time without a break
lastStateChangeTimestamp
 - An integer that stores the last time the state of the application changed
Methods
init()
This method is responsible for initializing the application. It sets the detection interval, adds listeners for settings changes, state changes, and alarm firings. It also creates an alarm with the 
remindInterval
 from the settings.

onStateChanged()
This method is responsible for handling state changes. It calculates the amount of time spent in the new state and either resets the break timer or subtracts the amount of time spent in the new state from the break timer.

onAlarmFired()
This method is responsible for handling alarm firings. It adds the 
remindInterval
 from the settings to the 
timeWithoutBreak
 and then creates a notification based on the amount of time without a break.

loadSettings()
This method is responsible for loading the settings from storage. It sets the 
settings
 property with the settings from storage and then calls the 
init()
 method.

onSettingsChanged()
This method is responsible for handling settings changes. It clears all alarms, updates the 
settings
 property, and then creates an alarm with the updated 
remindInterval
.

getTimeForLogging()
This method is responsible for getting the current time in a format suitable for logging.

---

forked from [blinkreminder](https://github.com/ge0rgi/blinkreminder)
