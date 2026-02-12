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
const trackDistanceInput = document.getElementById('track-distance');
const trackLapOutput = document.getElementById('track-lap-output');
const trackLapDetail = document.getElementById('track-lap-detail');
const trackLiveTime = document.getElementById('track-live-time');
const trackStartButton = document.getElementById('track-start-btn');
const trackPath = document.getElementById('track-path');
const trackRunner = document.getElementById('track-runner');
const trackMarkers = document.getElementById('track-markers');
const trackSplitsContainer = document.getElementById('track-splits');

let trackAnimationFrame = 0;
let currentTrackSplits = [];

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
trackDistanceInput.addEventListener('input', updateTrackTab);
trackDistanceInput.addEventListener('blur', normalizeTrackDistanceInput);
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
  const targetMeters = getTrackDistanceMeters();
  const paceSeconds = getPaceSeconds(trackPaceMinutesInput, trackPaceSecondsInput);
  if (Number.isFinite(targetMeters) && targetMeters > 0) {
    currentTrackSplits = buildTrackSplits(targetMeters);
    renderTrackSplits(currentTrackSplits);
  } else {
    currentTrackSplits = [];
    renderTrackSplits([]);
  }

  if (paceSeconds <= 0 || targetMeters <= 0) {
    trackLapOutput.textContent = '--:--';
    trackLapDetail.textContent = 'Set a valid distance and pace.';
    trackLiveTime.textContent = '0:00.0';
    setRunnerByDistance(0);
    return;
  }

  const targetSeconds = (paceSeconds * targetMeters) / 1000;
  const lapCount = targetMeters / 400;

  trackLapOutput.textContent = formatDuration(Math.round(targetSeconds));
  trackLapDetail.textContent =
    `${targetMeters}m at ${formatClock(paceSeconds)} min/km (${lapCount.toFixed(2)} laps of 400m).`;

  currentTrackSplits.forEach((split) => {
    const item = trackSplitsContainer.querySelector(`[data-split="${split}"] strong`);
    if (item) {
      item.textContent = formatSplit((paceSeconds * split) / 1000);
    }
  });

  cancelAnimationFrame(trackAnimationFrame);
  trackLiveTime.textContent = '0:00.0';
  setRunnerByDistance(0);
}

function setupTrackMarkers() {
  if (!trackPath || !trackMarkers) return;

  trackMarkers.innerHTML = '';
  const marks = [100, 200, 300, 400];
  marks.forEach((meters) => {
    const marker = buildTrackMarker(meters);
    if (marker) {
      trackMarkers.append(marker.line, marker.label);
      if (meters === 400) {
        trackMarkers.append(marker.startLabel);
      }
    }
  });
}

function buildTrackMarker(meters) {
  const point = getPointForLapFraction((meters % 400) / 400);
  const prev = getPointForLapFraction(((meters % 400) / 400) - 0.002);
  const next = getPointForLapFraction(((meters % 400) / 400) + 0.002);
  if (!point || !prev || !next) return null;

  let tangentX = next.x - prev.x;
  let tangentY = next.y - prev.y;
  const tangentLen = Math.hypot(tangentX, tangentY) || 1;
  tangentX /= tangentLen;
  tangentY /= tangentLen;

  let normalX = -tangentY;
  let normalY = tangentX;
  const centerX = 260;
  const centerY = 130;
  const outwardDot = normalX * (point.x - centerX) + normalY * (point.y - centerY);
  if (outwardDot < 0) {
    normalX *= -1;
    normalY *= -1;
  }

  const inner = 20;
  const outer = 28;
  const x1 = point.x - normalX * inner;
  const y1 = point.y - normalY * inner;
  const x2 = point.x + normalX * outer;
  const y2 = point.y + normalY * outer;

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', String(x1));
  line.setAttribute('y1', String(y1));
  line.setAttribute('x2', String(x2));
  line.setAttribute('y2', String(y2));
  line.setAttribute('class', 'track-marker-line');

  const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  label.setAttribute('x', String(point.x + normalX * (outer + 8)));
  label.setAttribute('y', String(point.y + normalY * (outer + 6)));
  label.setAttribute('class', 'track-marker-label');
  label.textContent = String(meters);

  const startLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  startLabel.setAttribute('x', String(point.x - normalX * (inner + 36)));
  startLabel.setAttribute('y', String(point.y - normalY * (inner + 6)));
  startLabel.setAttribute('class', 'track-marker-start');
  startLabel.textContent = 'START';

  return { line, label, startLabel };
}

function runTrackAnimation() {
  const targetMeters = getTrackDistanceMeters();
  const paceSeconds = getPaceSeconds(trackPaceMinutesInput, trackPaceSecondsInput);
  if (paceSeconds <= 0 || targetMeters <= 0) {
    return;
  }

  const totalSeconds = (paceSeconds * targetMeters) / 1000;
  const visualDurationMs = Math.max(6500, Math.min(24000, totalSeconds * 180));
  const startedAt = performance.now();

  cancelAnimationFrame(trackAnimationFrame);
  trackSplitsContainer.querySelectorAll('.split-item').forEach((card) => card.classList.remove('reached'));
  setRunnerByDistance(0);

  function frame(now) {
    const elapsed = now - startedAt;
    const progress = Math.min(elapsed / visualDurationMs, 1);
    const simulatedSeconds = totalSeconds * progress;
    const simulatedMeters = targetMeters * progress;

    setRunnerByDistance(simulatedMeters);
    trackLiveTime.textContent = formatSplit(simulatedSeconds);

    currentTrackSplits.forEach((splitMeters) => {
      if (simulatedMeters >= splitMeters) {
        const card = trackSplitsContainer.querySelector(`[data-split="${splitMeters}"]`);
        if (card) card.classList.add('reached');
      }
    });

    if (progress < 1) {
      trackAnimationFrame = requestAnimationFrame(frame);
    }
  }

  trackAnimationFrame = requestAnimationFrame(frame);
}

function setRunnerByDistance(meters) {
  const lapFraction = ((meters % 400) + 400) % 400 / 400;
  const point = getPointForLapFraction(lapFraction);
  if (!point) return;
  trackRunner.setAttribute('cx', String(point.x));
  trackRunner.setAttribute('cy', String(point.y));
}

function getPointForLapFraction(lapFraction) {
  const total = trackPath.getTotalLength();
  const normalized = ((1 - lapFraction) % 1 + 1) % 1;
  return trackPath.getPointAtLength(total * normalized);
}

function formatSplit(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(1).padStart(4, '0');
  return `${minutes}:${seconds}`;
}

function getTrackDistanceMeters() {
  return parseDistanceToMeters(trackDistanceInput.value);
}

function normalizeTrackDistanceInput() {
  const meters = parseDistanceToMeters(trackDistanceInput.value);
  if (!Number.isFinite(meters) || meters <= 0) {
    return;
  }

  if (meters >= 1000 && meters % 1000 === 0) {
    trackDistanceInput.value = `${meters / 1000}km`;
    return;
  }

  trackDistanceInput.value = `${meters}m`;
}

function parseDistanceToMeters(rawValue) {
  const value = String(rawValue).trim().toLowerCase();
  if (!value) return Number.NaN;

  const matched = value.match(/^([0-9]+(?:[.,][0-9]+)?)\s*(km|k|m)?$/i);
  if (!matched) return Number.NaN;

  const amount = Number(matched[1].replace(',', '.'));
  if (!Number.isFinite(amount) || amount <= 0) return Number.NaN;

  const unit = matched[2] || 'm';
  const meters = unit === 'km' || unit === 'k' ? amount * 1000 : amount;
  return Math.round(meters);
}

function buildTrackSplits(targetMeters) {
  if (targetMeters < 1000) {
    const splits = [];
    for (let meter = 100; meter < targetMeters; meter += 100) {
      splits.push(meter);
    }
    if (!splits.includes(targetMeters)) splits.push(targetMeters);
    return splits;
  }

  const splits = [100, 200, 400];
  for (let meter = 800; meter < targetMeters; meter += 400) {
    splits.push(meter);
  }
  if (!splits.includes(targetMeters)) splits.push(targetMeters);
  return splits.filter((value) => value <= targetMeters);
}

function renderTrackSplits(splits) {
  trackSplitsContainer.innerHTML = '';
  splits.forEach((split) => {
    const item = document.createElement('div');
    item.className = 'split-item';
    item.dataset.split = String(split);
    item.innerHTML = `<span>${formatSplitLabel(split)}</span><strong>--</strong>`;
    trackSplitsContainer.append(item);
  });
}

function formatSplitLabel(meters) {
  if (meters >= 1000) {
    return Number.isInteger(meters / 1000) ? `${meters / 1000}km` : `${(meters / 1000).toFixed(1)}km`;
  }

  return `${meters}m`;
}

updateConverter();
syncDistance(distanceInput.value);
updateRaceMode();
setupTrackMarkers();
updateTrackTab();
panelContainer.dataset.theme = 'converter';
