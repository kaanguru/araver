interface PauseScreenSettings {
  remindInterval: number;
  breakInterval: number;
  breakDuration: number;
}

interface GetSettingsCallback {
  (settings: PauseScreenSettings): void;
}

function loadOptions(): void {
  chrome.storage.local.get(
    {
      remindInterval: 20,
      breakInterval: 60,
      breakDuration: 10,
    },
    optionsLoaded
  );
}

function setFormTitles(): void {
  const titles = {
    optionsTitle: chrome.i18n.getMessage("optionsTitle"),
    shortRemTitle: chrome.i18n.getMessage("shortRemTitle"),
    longRemTitle: chrome.i18n.getMessage("longRemTitle"),
    longRemMinMessage: chrome.i18n.getMessage("longRemMinMessage"),
    submitMessage: chrome.i18n.getMessage("submitMessage"),
  };

    document.querySelector("legend").innerHTML = titles.optionsTitle;
    document.getElementById("shortRemTitle").innerHTML = titles.shortRemTitle;
    document.getElementById("longRemTitle").innerHTML = titles.longRemTitle;
    document.getElementById("longRemMinMessage").innerHTML = titles.longRemMinMessage;
    document.querySelector("button").innerHTML = titles.submitMessage;
}

function optionsLoaded(settings: PauseScreenSettings) {
  (document.querySelector("#remindInterval") as HTMLInputElement).value = settings.remindInterval.toString();
  (document.querySelector("#breakInterval") as HTMLInputElement).value = settings.breakInterval.toString();
  (document.querySelector("#breakDuration") as HTMLInputElement).value = settings.breakDuration.toString();
  document.querySelector("#settingsForm").addEventListener("submit", saveOptions);
  setFormTitles();
}

function saveOptions() {
  console.log("saving settings");
  let newSettings: PauseScreenSettings = {
    remindInterval: parseInt((document.querySelector("#remindInterval") as HTMLInputElement).value, 10),
    breakInterval: parseInt((document.querySelector("#breakInterval") as HTMLInputElement).value, 10),
    breakDuration: parseInt((document.querySelector("#breakDuration") as HTMLInputElement).value, 10),
  };
  chrome.storage.local.set(newSettings, settingSavedCallback);
}

function settingSavedCallback() {
  if (chrome.runtime.lastError) {
    console.error("Error saving settings ".concat(chrome.runtime.lastError.message));
  } else {
    console.log("Settings saved");
  }
}

document.addEventListener("DOMContentLoaded", loadOptions);
