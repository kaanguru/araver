/// <reference path="options.ts" />

class PauseScreen {
  settings: PauseScreenSettings = null;
  timeWithoutBreak: number = 0;
  lastStateChangeTimestamp: number = 0;
  messages = {
    longNotificationTitle: chrome.i18n.getMessage("longNotificationTitle"),
    shortNotificationTitle: chrome.i18n.getMessage("shortNotificationTitle"),
    shortNotificationContent: chrome.i18n.getMessage("shortNotificationContent"),
  };
  init(settings: PauseScreenSettings): void {
    chrome.idle.setDetectionInterval(10);
    chrome.storage.onChanged.addListener(this.onSettingsChanged);
    chrome.idle.onStateChanged.addListener(this.onStateChanged);
    chrome.alarms.onAlarm.addListener(this.onAlarmFired);
    chrome.browserAction.onClicked.addListener(() => {
      chrome.runtime.openOptionsPage();
    });
    this.lastStateChangeTimestamp = Date.now();
    chrome.alarms.create("reminder_alarm", {
      periodInMinutes: settings.remindInterval,
    });
  }
  onStateChanged(newState: string): void {
    let now: Date = new Date();
    console.log(pauseScreen.getTimeForLogging().concat(": state change, new state ", newState));
    if (newState != "active") {
      pauseScreen.timeWithoutBreak += Math.round((now.getTime() - pauseScreen.lastStateChangeTimestamp) / (60 * 1000));
      chrome.alarms.clearAll();
    } else if (newState == "active") {
      let diff: number = now.getTime() - pauseScreen.lastStateChangeTimestamp;
      let minutes: number = Math.round(diff / (1000 * 60));
      if (minutes >= pauseScreen.settings.breakDuration - 1) {
        // because 1 minute passes bewfore we go in idle srare
        console.log(pauseScreen.getTimeForLogging().concat(": away for ", (diff / (1000 * 60)).toString(), "m reseting break timer"));
        pauseScreen.timeWithoutBreak = 0;
      } else {
        console.log(pauseScreen.getTimeForLogging().concat(": short break for ", minutes.toString(), " minutes"));
        pauseScreen.timeWithoutBreak -= minutes;
      }
      chrome.alarms.create("reminder_alarm", { periodInMinutes: pauseScreen.settings.remindInterval });
    }
    pauseScreen.lastStateChangeTimestamp = now.getTime();
  }
  onAlarmFired(alarm: chrome.alarms.Alarm): void {
    pauseScreen.timeWithoutBreak += pauseScreen.settings.remindInterval;
    if (pauseScreen.timeWithoutBreak >= pauseScreen.settings.breakInterval) {
      console.log(pauseScreen.getTimeForLogging().concat(": Uzun Ara, without break since ", pauseScreen.timeWithoutBreak.toString(), " minutes"));
      chrome.notifications.create("ara_ver", {
        type: "basic",
        title: "uzun ara",
        iconUrl: "icons/icons8_pause_64px.png",
        // message: chrome.i18n.getMessage("longNotificationContent",pauseScreen.settings.breakDuration.toString())
        message: "Lütfen,".concat(pauseScreen.settings.breakDuration.toString(), " dakika Ara Ver"),
      });
    } else {
      console.log(pauseScreen.getTimeForLogging().concat(": Kısa Ara, without break since ", pauseScreen.timeWithoutBreak.toString(), " minutes"));
      chrome.notifications.create("ara_ver", {
        type: "basic",
        title: "kısa ara başlık",
        iconUrl: "icons/icons8_pause_64px.png",
        message: "kısa ara mesajı",
      });
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
          pauseScreen.settings = s;
          pauseScreen.init(s);
        } else {
          console.error("Error loading settings ".concat(chrome.runtime.lastError.message));
        }
      }
    );
  }
  onSettingsChanged(change: { [key: string]: chrome.storage.StorageChange }, area: string): void {
    chrome.alarms.clearAll();
    pauseScreen.settings.remindInterval = change["remindInterval"].newValue;
    pauseScreen.settings.breakInterval = change["breakInterval"].newValue;
    pauseScreen.settings.breakDuration = change["breakDuration"].newValue;
    chrome.alarms.create("reminder_alarm", { periodInMinutes: pauseScreen.settings.remindInterval });
  }
  getTimeForLogging(): string {
    let now: Date = new Date();
    let hours: string = now.getHours() > 9 ? now.getHours().toString() : "0" + now.getHours().toString();
    let minutes: string = now.getMinutes() > 9 ? now.getMinutes().toString() : "0" + now.getMinutes().toString();
    return "[".concat(hours, ":", minutes, "]");
  }
}

const pauseScreen: PauseScreen = new PauseScreen();
pauseScreen.loadSettings();
