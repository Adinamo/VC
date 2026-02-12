const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');
const panelContainer = document.querySelector('.panel');

const speedInput = document.getElementById('speed-input');
const paceOutput = document.getElementById('pace-output');

const distanceRange = document.getElementById('distance-range');
const distanceInput = document.getElementById('distance-input');
const distanceValue = document.getElementById('distance-value');
const paceMinutesInput = document.getElementById('pace-minutes');
const paceSecondsInput = document.getElementById('pace-seconds');
const timeOutput = document.getElementById('time-output');
const timeOutputDetail = document.getElementById('time-output-detail');

const raceDistanceKmInput = document.getElementById('race-distance-km');
const raceModeInput = document.getElementById('race-mode');
const goalTimeGroup = document.getElementById('goal-time-group');
const targetPaceGroup = document.getElementById('target-pace-group');
const goalHoursInput = document.getElementById('goal-hours');
const goalMinutesInput = document.getElementById('goal-minutes');
const goalSecondsInput = document.getElementById('goal-seconds');
const targetPaceMinutesInput = document.getElementById('target-pace-minutes');
const targetPaceSecondsInput = document.getElementById('target-pace-seconds');
const raceOutput = document.getElementById('race-output');
const raceOutputDetail = document.getElementById('race-output-detail');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;

    tabs.forEach((button) => {
      const isActive = button === tab;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    });

    panels.forEach((panel) => {
      const isActive = panel.id === target;
      panel.classList.toggle('active', isActive);
      panel.hidden = !isActive;
    });

    panelContainer.dataset.theme = target;
  });
});

speedInput.addEventListener('input', updateConverter);
distanceRange.addEventListener('input', () => syncDistance(distanceRange.value));
distanceInput.addEventListener('input', () => syncDistance(distanceInput.value));
paceMinutesInput.addEventListener('input', updateDistanceTime);
paceSecondsInput.addEventListener('input', updateDistanceTime);
raceDistanceKmInput.addEventListener('input', updateRacePlanner);
raceModeInput.addEventListener('change', updateRaceMode);
goalHoursInput.addEventListener('input', updateRacePlanner);
goalMinutesInput.addEventListener('input', updateRacePlanner);
goalSecondsInput.addEventListener('input', updateRacePlanner);
targetPaceMinutesInput.addEventListener('input', updateRacePlanner);
targetPaceSecondsInput.addEventListener('input', updateRacePlanner);

function updateConverter() {
  const speed = Number(speedInput.value);

  if (!Number.isFinite(speed) || speed <= 0) {
    paceOutput.textContent = '--:-- min/km';
    return;
  }

  const paceMinutes = 60 / speed;
  const totalSeconds = Math.round(paceMinutes * 60);

  paceOutput.textContent = `${formatClock(totalSeconds)} min/km`;
}

function syncDistance(rawValue) {
  let distance = Number(rawValue);
  if (!Number.isFinite(distance)) {
    distance = 0;
  }

  distance = Math.max(0, Math.min(1000, Math.round(distance / 10) * 10));

  distanceRange.value = String(distance);
  distanceInput.value = String(distance);
  distanceValue.textContent = String(distance);

  updateDistanceTime();
}

function updateDistanceTime() {
  const distanceMeters = Number(distanceInput.value) || 0;
  const secondsPerKm = getPaceSeconds(paceMinutesInput, paceSecondsInput);

  if (secondsPerKm <= 0) {
    timeOutput.textContent = '--:--';
    timeOutputDetail.textContent = 'Set a pace above 0:00 min/km';
    return;
  }

  const timeInSeconds = Math.round((secondsPerKm * distanceMeters) / 1000);

  timeOutput.textContent = formatDuration(timeInSeconds);
  timeOutputDetail.textContent = `for ${distanceMeters}m at ${formatClock(secondsPerKm)} min/km`;
}

function updateRaceMode() {
  const isGoalToPace = raceModeInput.value === 'goal-to-pace';
  goalTimeGroup.hidden = !isGoalToPace;
  targetPaceGroup.hidden = isGoalToPace;
  updateRacePlanner();
}

function updateRacePlanner() {
  const distanceKm = Number(raceDistanceKmInput.value);

  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    raceOutput.textContent = '--';
    raceOutputDetail.textContent = 'Enter a valid race distance above 0 km.';
    return;
  }

  if (raceModeInput.value === 'goal-to-pace') {
    const goalSeconds = getGoalTimeSeconds();

    if (goalSeconds <= 0) {
      raceOutput.textContent = '--:-- min/km';
      raceOutputDetail.textContent = 'Set a valid goal time above 0.';
      return;
    }

    const paceSecondsPerKm = Math.round(goalSeconds / distanceKm);
    raceOutput.textContent = `${formatClock(paceSecondsPerKm)} min/km`;
    raceOutputDetail.textContent = `For ${formatDistance(distanceKm)} in ${formatDuration(goalSeconds)}.`;
    return;
  }

  const paceSecondsPerKm = getPaceSeconds(targetPaceMinutesInput, targetPaceSecondsInput);

  if (paceSecondsPerKm <= 0) {
    raceOutput.textContent = '--:--';
    raceOutputDetail.textContent = 'Set a valid pace above 0:00 min/km.';
    return;
  }

  const goalSeconds = Math.round(distanceKm * paceSecondsPerKm);
  raceOutput.textContent = formatDuration(goalSeconds);
  raceOutputDetail.textContent = `${formatDistance(distanceKm)} at ${formatClock(paceSecondsPerKm)} min/km.`;
}

function getGoalTimeSeconds() {
  const hours = Math.max(0, Math.floor(Number(goalHoursInput.value) || 0));
  const minutes = Math.max(0, Math.min(59, Math.floor(Number(goalMinutesInput.value) || 0)));
  const seconds = Math.max(0, Math.min(59, Math.floor(Number(goalSecondsInput.value) || 0)));

  goalHoursInput.value = String(hours);
  goalMinutesInput.value = String(minutes);
  goalSecondsInput.value = String(seconds);

  return hours * 3600 + minutes * 60 + seconds;
}

function getPaceSeconds(minutesInput, secondsInput) {
  const minutes = Math.max(0, Math.floor(Number(minutesInput.value) || 0));
  const seconds = Math.max(0, Math.min(59, Math.floor(Number(secondsInput.value) || 0)));

  minutesInput.value = String(minutes);
  secondsInput.value = String(seconds);

  return minutes * 60 + seconds;
}

function formatClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function formatDuration(totalSeconds) {
  if (totalSeconds < 3600) {
    return formatClock(totalSeconds);
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatDistance(distanceKm) {
  if (Number.isInteger(distanceKm)) {
    return `${distanceKm}km`;
  }

  return `${distanceKm.toFixed(1)}km`;
}

updateConverter();
syncDistance(distanceInput.value);
updateRaceMode();
panelContainer.dataset.theme = 'converter';
