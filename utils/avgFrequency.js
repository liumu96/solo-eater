export function avgFrequency(peaks, currentTime, windowSize) {
  if (!peaks || peaks.length === 0) {
    return 0;
  }

  // Calculate window size in milliseconds
  const windowSizeInMilliseconds = windowSize * 1000;

  // Calculate the start of the time window
  const timeWindowStart = currentTime - windowSizeInMilliseconds;
  // console.log("Current Time (ms):", currentTime);
  // console.log("Time Window Start (ms):", timeWindowStart);

  // Filter peaks based on the time window
  const totalPeaksCount = peaks.filter(
    (peak) => peak.time.getTime() > timeWindowStart
  ).length;
  // console.log("Filtered Peaks Count:", totalPeaksCount);

  if (totalPeaksCount === 0) {
    return 0;
  }

  // Calculate frequency in peaks per second and convert to BPM
  const frequency = totalPeaksCount / windowSize;
  return Math.round(frequency * 60); // Convert to BPM
}
export function avgFreq(peaks, currentTime, windowSize, alpha) {
  if (!peaks || peaks.length === 0) {
    return 0;
  }

  // Calculate the EMA for the peaks
  const emaPeaks = calculateEMA(peaks, alpha);

  // Calculate window size in milliseconds
  const windowSizeInMilliseconds = windowSize * 1000;

  // Calculate the start of the time window
  const timeWindowStart = currentTime - windowSizeInMilliseconds;

  // Filter EMA peaks based on the time window
  const totalPeaksCount = emaPeaks.filter(peak => peak.time.getTime() > timeWindowStart).length;

  if (totalPeaksCount === 0) {
    return 0;
  }

  // Calculate frequency in peaks per second and convert to BPM
  const frequency = totalPeaksCount / windowSize;
  return Math.round(frequency * 60); // Convert to BPM
}



export function calculateEMA(peaks, alpha) {
  if (!peaks || peaks.length === 0) {
    return [];
  }

  const emaPeaks = [];
  let previousEMA = peaks[0].value;

  emaPeaks.push({ ...peaks[0], ema: previousEMA });

  for (let i = 1; i < peaks.length; i++) {
    const currentEMA = alpha * peaks[i].value + (1 - alpha) * previousEMA;
    emaPeaks.push({ ...peaks[i], ema: currentEMA });
    previousEMA = currentEMA;
  }

  return emaPeaks;
}
