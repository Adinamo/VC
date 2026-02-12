const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');

const speedInput = document.getElementById('speed-input');
const paceOutput = document.getElementById('pace-output');
const paceOutputDetail = document.getElementById('pace-output-detail');

const distanceRange = document.getElementById('distance-range');
const distanceInput = document.getElementById('distance-input');
const distanceValue = document.getElementById('distance-value');
const paceMinutesInput = document.getElementById('pace-minutes');
const paceSecondsInput = document.getElementById('pace-seconds');
const timeOutput = document.getElementById('time-output');
const timeOutputDetail = document.getElementById('time-output-detail');

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
  });
});

speedInput.addEventListener('input', updateConverter);
distanceRange.addEventListener('input', () => syncDistance(distanceRange.value));
distanceInput.addEventListener('input', () => syncDistance(distanceInput.value));
paceMinutesInput.addEventListener('input', updateDistanceTime);
paceSecondsInput.addEventListener('input', updateDistanceTime);

function updateConverter() {
  const speed = Number(speedInput.value);

  if (!Number.isFinite(speed) || speed <= 0) {
    paceOutput.textContent = '--:-- min/km';
    paceOutputDetail.textContent = 'Enter a valid speed above 0';
    return;
  }

  const paceMinutes = 60 / speed;
  const totalSeconds = Math.round(paceMinutes * 60);

  paceOutput.textContent = `${formatClock(totalSeconds)} min/km`;
  paceOutputDetail.textContent = `${paceMinutes.toFixed(2)} min/km`;
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
  const minutes = Math.max(0, Number(paceMinutesInput.value) || 0);
  const seconds = Math.max(0, Number(paceSecondsInput.value) || 0);
  const normalizedSeconds = Math.min(59, Math.floor(seconds));
  const secondsPerKm = Math.floor(minutes) * 60 + normalizedSeconds;

  paceSecondsInput.value = String(normalizedSeconds);

  if (secondsPerKm <= 0) {
    timeOutput.textContent = '--:--';
    timeOutputDetail.textContent = 'Set a pace above 0:00 min/km';
    return;
  }

  const timeInSeconds = Math.round((secondsPerKm * distanceMeters) / 1000);

  timeOutput.textContent = formatDuration(timeInSeconds);
  timeOutputDetail.textContent = `for ${distanceMeters}m at ${formatClock(secondsPerKm)} min/km`;
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

updateConverter();
syncDistance(distanceInput.value);
