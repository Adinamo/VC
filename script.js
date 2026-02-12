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
const raceModeNote = document.getElementById('race-mode-note');
const trackPaceMinutesInput = document.getElementById('track-pace-minutes');
const trackPaceSecondsInput = document.getElementById('track-pace-seconds');
const trackLapOutput = document.getElementById('track-lap-output');
const trackLapDetail = document.getElementById('track-lap-detail');
const trackLiveTime = document.getElementById('track-live-time');
const trackStartButton = document.getElementById('track-start-btn');
const trackPath = document.getElementById('track-path');
const trackRunner = document.getElementById('track-runner');
const trackMarkers = document.getElementById('track-markers');
const split100 = document.getElementById('track-split-100');
const split200 = document.getElementById('track-split-200');
const split300 = document.getElementById('track-split-300');
const split400 = document.getElementById('track-split-400');
const splitCards = Array.from(document.querySelectorAll('.split-item'));

let trackAnimationFrame = 0;

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
trackPaceMinutesInput.addEventListener('input', updateTrackTab);
trackPaceSecondsInput.addEventListener('input', updateTrackTab);
trackStartButton.addEventListener('click', runTrackAnimation);

function updateConverter() {
  const speed = parseLocaleNumber(speedInput.value);

  if (!Number.isFinite(speed) || speed <= 0) {
    paceOutput.textContent = '--:-- min/km';
    return;
  }

  const paceMinutes = 60 / speed;
  const totalSeconds = Math.round(paceMinutes * 60);

  paceOutput.textContent = `${formatClock(totalSeconds)} min/km`;
}

function syncDistance(rawValue) {
  let distance = parseLocaleNumber(rawValue);
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
  const distanceMeters = parseLocaleNumber(distanceInput.value) || 0;
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

  raceModeNote.textContent = isGoalToPace
    ? 'Enter your target finish time and see the pace you need.'
    : 'Enter your target pace and estimate the final race time.';
  updateRacePlanner();
}

function updateRacePlanner() {
  const distanceKm = parseLocaleNumber(raceDistanceKmInput.value);

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
  const hours = Math.max(0, Math.floor(parseLocaleNumber(goalHoursInput.value) || 0));
  const minutes = Math.max(0, Math.min(59, Math.floor(parseLocaleNumber(goalMinutesInput.value) || 0)));
  const seconds = Math.max(0, Math.min(59, Math.floor(parseLocaleNumber(goalSecondsInput.value) || 0)));

  goalHoursInput.value = String(hours);
  goalMinutesInput.value = String(minutes);
  goalSecondsInput.value = String(seconds);

  return hours * 3600 + minutes * 60 + seconds;
}

function getPaceSeconds(minutesInput, secondsInput) {
  const minutes = Math.max(0, Math.floor(parseLocaleNumber(minutesInput.value) || 0));
  const seconds = Math.max(0, Math.min(59, Math.floor(parseLocaleNumber(secondsInput.value) || 0)));

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

function parseLocaleNumber(value) {
  return Number(String(value).trim().replace(',', '.'));
}

function updateTrackTab() {
  const paceSeconds = getPaceSeconds(trackPaceMinutesInput, trackPaceSecondsInput);

  if (paceSeconds <= 0) {
    trackLapOutput.textContent = '--:--';
    trackLapDetail.textContent = 'Set a valid pace above 0:00 min/km.';
    trackLiveTime.textContent = '0:00.0';
    [split100, split200, split300, split400].forEach((item) => {
      item.textContent = '--';
    });
    return;
  }

  const lapSeconds = paceSeconds * 0.4;
  const splitTimes = [paceSeconds * 0.1, paceSeconds * 0.2, paceSeconds * 0.3, lapSeconds];

  trackLapOutput.textContent = formatClock(Math.round(lapSeconds));
  trackLapDetail.textContent = `Based on ${formatClock(paceSeconds)} min/km pace.`;
  split100.textContent = formatSplit(splitTimes[0]);
  split200.textContent = formatSplit(splitTimes[1]);
  split300.textContent = formatSplit(splitTimes[2]);
  split400.textContent = formatSplit(splitTimes[3]);
  trackLiveTime.textContent = '0:00.0';
  splitCards.forEach((card) => card.classList.remove('reached'));
  setRunnerProgress(0);
}

function setupTrackMarkers() {
  if (!trackPath || !trackMarkers) return;

  const total = trackPath.getTotalLength();
  const marks = [
    { fraction: 0, label: 'Start/400' },
    { fraction: 0.25, label: '100m' },
    { fraction: 0.5, label: '200m' },
    { fraction: 0.75, label: '300m' }
  ];

  trackMarkers.innerHTML = '';
  marks.forEach((mark) => {
    const point = trackPath.getPointAtLength(total * mark.fraction);
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', String(point.x));
    dot.setAttribute('cy', String(point.y));
    dot.setAttribute('r', '5');
    dot.setAttribute('class', 'track-marker-dot');

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(point.x + 8));
    text.setAttribute('y', String(point.y - 8));
    text.setAttribute('class', 'track-marker-label');
    text.textContent = mark.label;

    trackMarkers.append(dot, text);
  });
}

function runTrackAnimation() {
  const paceSeconds = getPaceSeconds(trackPaceMinutesInput, trackPaceSecondsInput);
  if (paceSeconds <= 0) {
    return;
  }

  const lapSeconds = paceSeconds * 0.4;
  const splitThresholds = [lapSeconds * 0.25, lapSeconds * 0.5, lapSeconds * 0.75, lapSeconds];
  const visualDurationMs = Math.max(6000, Math.min(20000, lapSeconds * 1000 * 0.2));
  const startedAt = performance.now();

  cancelAnimationFrame(trackAnimationFrame);
  splitCards.forEach((card) => card.classList.remove('reached'));
  setRunnerProgress(0);

  function frame(now) {
    const elapsed = now - startedAt;
    const progress = Math.min(elapsed / visualDurationMs, 1);
    const simulatedSeconds = lapSeconds * progress;

    setRunnerProgress(progress);
    trackLiveTime.textContent = formatSplit(simulatedSeconds);

    splitThresholds.forEach((threshold, index) => {
      if (simulatedSeconds >= threshold) {
        splitCards[index].classList.add('reached');
      }
    });

    if (progress < 1) {
      trackAnimationFrame = requestAnimationFrame(frame);
    }
  }

  trackAnimationFrame = requestAnimationFrame(frame);
}

function setRunnerProgress(progress) {
  const total = trackPath.getTotalLength();
  const point = trackPath.getPointAtLength(total * progress);
  trackRunner.setAttribute('cx', String(point.x));
  trackRunner.setAttribute('cy', String(point.y));
}

function formatSplit(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(1).padStart(4, '0');
  return `${minutes}:${seconds}`;
}

updateConverter();
syncDistance(distanceInput.value);
updateRaceMode();
setupTrackMarkers();
updateTrackTab();
panelContainer.dataset.theme = 'converter';
