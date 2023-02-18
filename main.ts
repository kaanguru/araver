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
    console.log(pauseReminder.getTimeForLogging().concat(": state change, new state ", newState));
    if (newState != "active") {
      pauseReminder.timeWithoutBreak += Math.round((now.getTime() - pauseReminder.lastStateChangeTimestamp) / (60 * 1000));
      chrome.alarms.clearAll();
    } else if (newState == "active") {
      let diff: number = now.getTime() - pauseReminder.lastStateChangeTimestamp;
      let minutes: number = Math.round(diff / (1000 * 60));
      if (minutes >= pauseReminder.settings.breakDuration - 1) {
        // because 1 minute passes bewfore we go in idle srare
        console.log(pauseReminder.getTimeForLogging().concat(": away for ", (diff / (1000 * 60)).toString(), "m reseting break timer"));
        pauseReminder.timeWithoutBreak = 0;
      } else {
        console.log(pauseReminder.getTimeForLogging().concat(": short break for ", minutes.toString(), " minutes"));
        pauseReminder.timeWithoutBreak -= minutes;
      }
      chrome.alarms.create("reminder_alarm", { periodInMinutes: pauseReminder.settings.remindInterval });
    }
    pauseReminder.lastStateChangeTimestamp = now.getTime();
  }
  onAlarmFired(alarm: chrome.alarms.Alarm): void {
    pauseReminder.timeWithoutBreak += pauseReminder.settings.remindInterval;
    if (pauseReminder.timeWithoutBreak >= pauseReminder.settings.breakInterval) {
      console.log(pauseReminder.getTimeForLogging().concat(": Uzun Ara, without break since ", pauseReminder.timeWithoutBreak.toString(), " minutes"));
      chrome.notifications.create("ara_ver", { type: "basic", title: breakTitle, iconUrl: "icons/icons8_stretching_64px.png", message: breakContent(pauseReminder.settings.breakDuration.toString()) });
    } else {
      console.log(pauseReminder.getTimeForLogging().concat(": Kısa Ara, without break since ", pauseReminder.timeWithoutBreak.toString(), " minutes"));
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
          pauseReminder.settings = s;
          pauseReminder.init(s);
        } else {
          console.error("Error loading settings ".concat(chrome.runtime.lastError.message));
        }
      }
    );
  }
  onSettingsChanged(change: { [key: string]: chrome.storage.StorageChange }, area: string): void {
    chrome.alarms.clearAll();
    pauseReminder.settings.remindInterval = change["remindInterval"].newValue;
    pauseReminder.settings.breakInterval = change["breakInterval"].newValue;
    pauseReminder.settings.breakDuration = change["breakDuration"].newValue;
    chrome.alarms.create("reminder_alarm", { periodInMinutes: pauseReminder.settings.remindInterval });
  }
  getTimeForLogging(): string {
    let now: Date = new Date();
    let hours: string = now.getHours() > 9 ? now.getHours().toString() : "0" + now.getHours().toString();
    let minutes: string = now.getMinutes() > 9 ? now.getMinutes().toString() : "0" + now.getMinutes().toString();
    return "[".concat(hours, ":", minutes, "]");
  }
}

const pauseReminder: PauseScreen = new PauseScreen();
pauseReminder.loadSettings();
