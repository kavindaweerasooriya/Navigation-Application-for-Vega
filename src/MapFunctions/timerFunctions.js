// timeFunction.js
//! calculating the remaining time
function formatRemainingTime(timeInSeconds) {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.round((timeInSeconds % 3600) / 60);
  
    if (hours >= 1) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    }
  }
  
  //! calculating the expected arrival time
  function formatExpectedArrival(remainingTimeInSeconds) {
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + remainingTimeInSeconds * 1000);
  
    const hours = arrivalTime.getHours();
    const minutes = arrivalTime.getMinutes();
  
    return `${formatTwoDigits(hours)}:${formatTwoDigits(minutes)}`;
  }
  
  //! formatting the time
  function formatTwoDigits(value) {
    return value < 10 ? `0${value}` : value;
  }
  
  export { formatRemainingTime, formatExpectedArrival, formatTwoDigits };
  