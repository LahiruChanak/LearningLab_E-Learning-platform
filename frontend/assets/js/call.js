// Call UI Elements
let callContainer;
let callerAvatar;
let callerName;
let callStatus;
let callTimer;
let videoContainer;
let localVideo;
let remoteVideo;

// Call State
let isCallActive = false;
let isVideoCall = false;
let isMuted = false;
let isVideoEnabled = true;
let callStartTime;
let timerInterval;

// Initialize call UI elements
document.addEventListener("DOMContentLoaded", () => {
  // Create call container
  const callHTML = `
    <div class="call-container">
      <div class="call-header">
        <div class="call-timer">00:00</div>
      </div>
      <div class="caller-info">
        <img src="" alt="Caller" class="caller-avatar">
        <div class="caller-name"></div>
        <div class="call-status">Calling...</div>
      </div>
      <div class="video-container">
        <video class="remote-video" autoplay></video>
        <video class="local-video" autoplay muted></video>
      </div>
      <div class="call-actions">
        <button class="call-action-btn" onclick="toggleMute()" id="muteBtn">
          <i class="hgi-stroke hgi-mic-02"></i>
        </button>
        <button class="call-action-btn" onclick="toggleVideo()" id="videoBtn">
          <i class="hgi-stroke hgi-video-02"></i>
        </button>
        <button class="call-action-btn end-call" onclick="endCall()">
          <i class="hgi-stroke hgi-call-02"></i>
        </button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", callHTML);

  // Initialize UI elements
  callContainer = document.querySelector(".call-container");
  callerAvatar = callContainer.querySelector(".caller-avatar");
  callerName = callContainer.querySelector(".caller-name");
  callStatus = callContainer.querySelector(".call-status");
  callTimer = callContainer.querySelector(".call-timer");
  videoContainer = callContainer.querySelector(".video-container");
  localVideo = callContainer.querySelector(".local-video");
  remoteVideo = callContainer.querySelector(".remote-video");
});

// Start video call
function startVideoCall() {
  isVideoCall = true;
  startCall();
}

// Start voice call
function startVoiceCall() {
  isVideoCall = false;
  startCall();
}

// Start call
function startCall() {
  const selectedContact = contacts.find((c) => c.id === currentChatId);

  // Update UI
  callerAvatar.src = selectedContact.avatar;
  callerName.textContent = selectedContact.name;
  callContainer.classList.add("active");

  if (isVideoCall) {
    videoContainer.classList.add("active");
    setupVideoStream();
    isVideoEnabled = true;
    updateVideoButton();
  }

  // Reset states
  isMuted = false;
  updateMuteButton();

  // Start timer
  callStartTime = new Date();
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);

  isCallActive = true;
}

// Toggle mute
function toggleMute() {
  isMuted = !isMuted;
  const muteBtn = document.getElementById("muteBtn");
  const muteIcon = muteBtn.querySelector("i");

  // Update UI
  muteIcon.className = isMuted
    ? "hgi-stroke hgi-mic-off-02"
    : "hgi-stroke hgi-mic-02";
  muteBtn.classList.toggle("active", isMuted);

  // Update audio track state
  if (localVideo.srcObject) {
    localVideo.srcObject.getAudioTracks().forEach((track) => {
      track.enabled = !isMuted;
    });
  }
}

// Toggle video
function toggleVideo() {
  isVideoEnabled = !isVideoEnabled;
  const videoBtn = document.getElementById("videoBtn");
  const videoIcon = videoBtn.querySelector("i");

  // Update UI
  videoIcon.className = isVideoEnabled
    ? "hgi-stroke hgi-video-02"
    : "hgi-stroke hgi-video-off";
  videoBtn.classList.toggle("active", !isVideoEnabled);

  if (!isVideoCall && isCallActive) {
    // Initialize video if it wasn't a video call
    isVideoCall = true;
    videoContainer.classList.add("active");
    setupVideoStream();
  } else if (localVideo.srcObject) {
    // Toggle video track state
    localVideo.srcObject.getVideoTracks().forEach((track) => {
      track.enabled = isVideoEnabled;
    });
    localVideo.style.display = isVideoEnabled ? "block" : "none";
  }
}

// Update mute button UI
function updateMuteButton() {
  const muteBtn = document.getElementById("muteBtn");
  const muteIcon = muteBtn.querySelector("i");
  muteIcon.className = isMuted
    ? "hgi-stroke hgi-mic-02"
    : "hgi-stroke hgi-mic-off-02";
  muteBtn.classList.toggle("active", isMuted);
}

// Update video button UI
function updateVideoButton() {
  const videoBtn = document.getElementById("videoBtn");
  const videoIcon = videoBtn.querySelector("i");
  videoIcon.className = isVideoEnabled
    ? "hgi-stroke hgi-video-02"
    : "hgi-stroke hgi-video-off";
  videoBtn.classList.toggle("active", !isVideoEnabled);
}

// End call
function endCall() {
  callContainer.classList.remove("active");
  videoContainer.classList.remove("active");
  clearInterval(timerInterval);

  // Reset states
  isMuted = false;
  isVideoEnabled = true;
  updateMuteButton();
  updateVideoButton();

  if (isVideoCall) {
    stopVideoStream();
  }

  isCallActive = false;
}

// Update timer
function updateTimer() {
  const now = new Date();
  const diff = now - callStartTime;
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  callTimer.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

// Setup video stream
async function setupVideoStream() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideo.srcObject = stream;

    // In a real application, you would send this stream to the remote peer
    // For demo purposes, we'll just show the same stream in remote video
    // setTimeout(() => {
    //   remoteVideo.srcObject = stream;
    //   callStatus.textContent = "Connected";

    //   // Set initial states for audio and video tracks
    //   stream.getAudioTracks().forEach((track) => (track.enabled = !isMuted));
    //   stream
    //     .getVideoTracks()
    //     .forEach((track) => (track.enabled = isVideoEnabled));
    // }, 1000);
  } catch (err) {
    console.error("Error accessing media devices:", err);
    endCall();
  }
}

// Stop video stream
function stopVideoStream() {
  if (localVideo.srcObject) {
    localVideo.srcObject.getTracks().forEach((track) => track.stop());
    localVideo.srcObject = null;
  }
  if (remoteVideo.srcObject) {
    remoteVideo.srcObject = null;
  }
}
