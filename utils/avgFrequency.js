export function avgFrequency(peaks, m) {
    if (!peaks || peaks.length <= 1) {
        return 0;
    }

    let totalTimeDifference = 0;
    const calculatedPeaks = peaks.slice(-m); // Get last m peaks
    const validPeaksLength = calculatedPeaks.length <= 1 ? 1 : calculatedPeaks.length - 1;

    for (let i = 1; i < calculatedPeaks.length; i++) {
        totalTimeDifference += calculatedPeaks[i].time - calculatedPeaks[i - 1].time;
    }

    const averageTimeDistance = totalTimeDifference / validPeaksLength; // in milliseconds
    const averageTimeDistanceInSeconds = averageTimeDistance / 1000;
    const frequency = 1 / averageTimeDistanceInSeconds;

    return Math.round(frequency * 60);
}