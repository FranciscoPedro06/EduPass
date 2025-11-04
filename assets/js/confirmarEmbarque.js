 document.addEventListener("DOMContentLoaded", () => {
      const backButton = document.getElementById("backButton");
      const morningBtn = document.getElementById("shiftMorning");
      const afternoonBtn = document.getElementById("shiftAfternoon");
      const nightBtn = document.getElementById("shiftNight");

      if (backButton) {
        backButton.addEventListener("click", () => {
          window.history.back();
        });
      }
      
      function selectShift(shift) {
        sessionStorage.setItem("selectedShift", shift);
        window.location.href = "checklistPresenca.html";
      }

      if (morningBtn) {
        morningBtn.addEventListener("click", () => selectShift('MANHÃ'));
      }
      if (afternoonBtn) {
        afternoonBtn.addEventListener("click", () => selectShift('TARDE'));
      }
      if (nightBtn) {
        nightBtn.addEventListener("click", () => selectShift('NOITE'));
      }
    });