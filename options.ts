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
function setFormTitles(){
   console.log("set form titles")
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
