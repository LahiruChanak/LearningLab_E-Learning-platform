$(document).ready(function () {
  function setGreeting() {
    const now = new Date();
    const hours = now.getHours();
    const greeting =
      hours < 12 ? "Morning" : hours < 16 ? "Afternoon" : "Evening";

    $("#greeting").text(greeting);
  }

  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const timeString = `${hours}:${minutes}:${seconds}`;

    $("#clock").text(timeString);
  }

  setInterval(updateClock, 1000);
  updateClock();
  setGreeting();
});
