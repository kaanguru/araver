/// <reference path="options.ts" />

const breakTitle = chrome.i18n.getMessage("breakTitle");
function breakContent(s: string): string {
  return chrome.i18n.getMessage("breakContent", s);
}
const reminderTitle = chrome.i18n.getMessage("reminderTitle");
const reminderContent = chrome.i18n.getMessage("reminderContent");

class PauseScreen {
  settings: PauseScreenSettings = null;
  timeWithoutBreak: number = 0;
  lastStateChangeTimestamp: number = 0;

  init(settings: PauseScreenSettings): void {
    chrome.idle.setDetectionInterval(60);
    chrome.storage.onChanged.addListener(this.onSettingsChanged);
    chrome.idle.onStateChanged.addListener(this.onStateChanged);
    chrome.alarms.onAlarm.addListener(this.onAlarmFired);
    chrome.browserAction.onClicked.addListener(() => {
      chrome.runtime.openOptionsPage();
    });
    this.lastStateChangeTimestamp = Date.now();
    chrome.alarms.create("reminder_alarm", { periodInMinutes: settings.remindInterval });
    console.log("addon loaded");
  }
  onStateChanged(newState: string): void {
    let now: Date = new Date();
    console.log(blinkReminder.getTimeForLogging().concat(": state change, new state ", newState));
    if (newState != "active") {
      blinkReminder.timeWithoutBreak += Math.round((now.getTime() - blinkReminder.lastStateChangeTimestamp) / (60 * 1000));
      chrome.alarms.clearAll();
    } else if (newState == "active") {
      let diff: number = now.getTime() - blinkReminder.lastStateChangeTimestamp;
      let minutes: number = Math.round(diff / (1000 * 60));
      if (minutes >= blinkReminder.settings.breakDuration - 1) {
        // because 1 minute passes bewfore we go in idle srare
        console.log(blinkReminder.getTimeForLogging().concat(": away for ", (diff / (1000 * 60)).toString(), "m reseting break timer"));
        blinkReminder.timeWithoutBreak = 0;
      } else {
        console.log(blinkReminder.getTimeForLogging().concat(": short break for ", minutes.toString(), " minutes"));
        blinkReminder.timeWithoutBreak -= minutes;
      }
      chrome.alarms.create("reminder_alarm", { periodInMinutes: blinkReminder.settings.remindInterval });
    }
    blinkReminder.lastStateChangeTimestamp = now.getTime();
  }
  onAlarmFired(alarm: chrome.alarms.Alarm): void {
    blinkReminder.timeWithoutBreak += blinkReminder.settings.remindInterval;
    if (blinkReminder.timeWithoutBreak >= blinkReminder.settings.breakInterval) {
      console.log(blinkReminder.getTimeForLogging().concat(": Uzun Ara, without break since ", blinkReminder.timeWithoutBreak.toString(), " minutes"));
      chrome.notifications.create("ara_ver", { type: "basic", title: breakTitle, iconUrl: "icons/icons8_pause_64px.png", message: breakContent(blinkReminder.settings.breakDuration.toString()) });
    } else {
      console.log(blinkReminder.getTimeForLogging().concat(": Kısa Ara, without break since ", blinkReminder.timeWithoutBreak.toString(), " minutes"));
      chrome.notifications.create("ara_ver", { type: "basic", title: reminderTitle, iconUrl: "icons/icons8_pause_64px.png", message: reminderContent });
    }
  }
  loadSettings(): void {
    chrome.storage.local.get(
      {
        remindInterval: 20,
        breakInterval: 60,
        breakDuration: 10,
      },
      (s: PauseScreenSettings) => {
        if (!chrome.runtime.lastError) {
          blinkReminder.settings = s;
          blinkReminder.init(s);
        } else {
          console.error("Error loading settings ".concat(chrome.runtime.lastError.message));
        }
      }
    );
  }
  onSettingsChanged(change: { [key: string]: chrome.storage.StorageChange }, area: string): void {
    chrome.alarms.clearAll();
    blinkReminder.settings.remindInterval = change["remindInterval"].newValue;
    blinkReminder.settings.breakInterval = change["breakInterval"].newValue;
    blinkReminder.settings.breakDuration = change["breakDuration"].newValue;
    chrome.alarms.create("reminder_alarm", { periodInMinutes: blinkReminder.settings.remindInterval });
  }
  getTimeForLogging(): string {
    let now: Date = new Date();
    let hours: string = now.getHours() > 9 ? now.getHours().toString() : "0" + now.getHours().toString();
    let minutes: string = now.getMinutes() > 9 ? now.getMinutes().toString() : "0" + now.getMinutes().toString();
    return "[".concat(hours, ":", minutes, "]");
  }
}

const blinkReminder: PauseScreen = new PauseScreen();
blinkReminder.loadSettings();
