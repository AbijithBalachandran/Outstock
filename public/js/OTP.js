  
 //required modules for set timer for resending OTP 

const getsendOTP = document.getElementById('OTP-timer');
const getStart = document.getElementById('start');
const getresendOTP = document.getElementById('resendOTP');
const getresend = document.getElementById('resend');

//------------------------------------------------------------------


 let startTime = 120;

  // -----------function for update the timer for the otp---------
 function updateTimer(){
      startTime --;
      getStart.textContent =startTime;

      if (startTime === 0) {
            clearInterval(timer);
            getsendOTP.style.display ="none";
            getresendOTP.style.display ="inline"
      }
 }

 //---------initializing the timer

 let timer = setInterval(updateTimer,1000);


 //---------addEventListener for  resending otp
 getresend.addEventListener('click',()=>{

      startTime =120;
      getStart.textContent =startTime;
      getsendOTP.style.display='inline';
      getresendOTP.style.display='none';
      timer = setInterval(updateTimer,1000);
 });
