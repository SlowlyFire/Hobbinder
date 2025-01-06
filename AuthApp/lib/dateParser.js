function getAppFormattedDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
  
  const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
  return formattedDateTime;
}

function getFormattedDate(datetime) {
const date = new Date(datetime);
const year = date.getUTCFullYear();
const month = String(date.getUTCMonth() + 1).padStart(2, '0');
const day = String(date.getUTCDate()).padStart(2, '0');

return `${day}/${month}/${year}`;
}

// Function to get only the time in HH:mm:ss format
function getFormattedTime(datetime) {
const date = new Date(datetime);
const hours = String(date.getUTCHours()).padStart(2, '0');
const minutes = String(date.getUTCMinutes()).padStart(2, '0');
const seconds = String(date.getUTCSeconds()).padStart(2, '0');

return `${hours}:${minutes}:${seconds}`;
}

function getFormattedTimeNonSeconds(datetime) {
  const date = new Date(datetime);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

function formatChatTimestamp(datetime) {
  const inputDate = new Date(datetime);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const isToday = 
    inputDate.getFullYear() === today.getFullYear() &&
    inputDate.getMonth() === today.getMonth() &&
    inputDate.getDate() === today.getDate();

  const isYesterday =
    inputDate.getFullYear() === yesterday.getFullYear() &&
    inputDate.getMonth() === yesterday.getMonth() &&
    inputDate.getDate() === yesterday.getDate();

  if (isToday) {
    const hours = String(inputDate.getHours()).padStart(2, '0');
    const minutes = String(inputDate.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } else if (isYesterday) {
    return 'Yesterday';
  } else {
    const day = String(inputDate.getDate()).padStart(2, '0');
    const month = String(inputDate.getMonth() + 1).padStart(2, '0');
    const year = inputDate.getFullYear();
    return `${day}/${month}/${year}`;
  }
}

function calculateAge(birthday) {
  const today = new Date();
  const birthDate = new Date(birthday);
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  const dayDifference = today.getDate() - birthDate.getDate();

  // Adjust if the birthday hasn't happened yet this year
  if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
    age--;
  }

  return age;
}

const isAgeValid = (birthday) => {
  if (!birthday) return false;
  
  const today = new Date();
  const age = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();
  const dayDiff = today.getDate() - birthday.getDate();

  // Adjust age if the current month and day are before the birth month and day
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    return age - 1 >= 16;
  }

  return age >= 16;
};


export default { getAppFormattedDate, getFormattedDate, getFormattedTime, calculateAge, formatChatTimestamp, getFormattedTimeNonSeconds, isAgeValid }