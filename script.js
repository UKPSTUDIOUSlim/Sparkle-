/***************************************
 * Cookie Helpers
 ***************************************/
function getCookie(name) {
  const dc = document.cookie;
  const prefix = name + "=";
  let begin = dc.indexOf("; " + prefix);
  if (begin === -1) {
    begin = dc.indexOf(prefix);
    if (begin !== 0) return null;
  } else {
    begin += 2;
  }
  let end = document.cookie.indexOf(";", begin);
  if (end === -1) {
    end = dc.length;
  }
  return decodeURIComponent(dc.substring(begin + prefix.length, end));
}

function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days*24*60*60*1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
}

/***************************************
 * Recently Played History Functions
 ***************************************/
function getHistory() {
  const cookie = getCookie("recentHistory");
  if (cookie) {
    try {
      return JSON.parse(cookie);
    } catch (e) {
      return [];
    }
  }
  return [];
}

function setHistory(history) {
  setCookie("recentHistory", JSON.stringify(history), 365);
}

function addToHistory(songIndex) {
  let history = getHistory();
  // Remove any previous instance of this song
  history = history.filter(item => item.index !== songIndex);
  // Add new entry at the beginning with current time
  history.unshift({ index: songIndex, time: new Date().toISOString() });
  // Limit history to 10 entries
  if (history.length > 10) {
    history = history.slice(0, 10);
  }
  setHistory(history);
}

function updateHistoryList() {
  const historyList = document.getElementById("history-list");
  const history = getHistory();
  if (history.length === 0) {
    historyList.innerHTML = "<p>No recently played songs.</p>";
    return;
  }
  historyList.innerHTML = "";
  history.forEach((entry, i) => {
    const song = songs[entry.index];
    const playedTime = new Date(entry.time).toLocaleString();
    const div = document.createElement("div");
    div.className = "history-item";
    div.onclick = () => {
      playSong(entry.index);
      addToHistory(entry.index); // update history timestamp
      updateHistoryList();
    };
    div.innerHTML = `
      <img src="${song.image}" alt="${song.name}">
      <div class="history-info">
        <p>${song.name} by ${song.author}</p>
        <span>${playedTime}</span>
      </div>
      <button class="delete-history" onclick="event.stopPropagation(); deleteHistoryItem(${i});">X</button>
    `;
    historyList.appendChild(div);
  });
}

function showHistoryPanel() {
  document.querySelector(".menu-content").style.display = "none";
  document.getElementById("history-panel").style.display = "flex";
  updateHistoryList();
}

function backToMenu() {
  document.getElementById("history-panel").style.display = "none";
  document.querySelector(".menu-content").style.display = "flex";
}

function deleteHistoryItem(idx) {
  let history = getHistory();
  history.splice(idx, 1);
  setHistory(history);
  updateHistoryList();
}

function clearHistory() {
  setHistory([]);
  updateHistoryList();
}

/***************************************
 * Main Functions
 ***************************************/
// Function to toggle sliding menu
function toggleMenu() {
  const menu = document.getElementById('sliding-menu');
  menu.classList.toggle('open');
}

// Function to handle login/signup
function handleLogin() {
  window.location.href = "login.html";
}

// Function to show suggestions (now includes the song image)
function showSuggestions() {
  const query = document.getElementById("search-input").value.toLowerCase();
  const suggestionBox = document.getElementById("suggestion-box");
  suggestionBox.innerHTML = ""; // Clear previous suggestions
  if (query) {
    const suggestions = songs.filter(song => song.name.toLowerCase().includes(query));
    suggestions.forEach(song => {
      const li = document.createElement("li");
      // Create an image element for the song image
      const img = document.createElement("img");
      img.src = song.image;
      img.alt = song.name;
      img.className = "suggestion-image"; // Add styling via CSS as needed

      // Create a span for the song name
      const span = document.createElement("span");
      span.textContent = song.name;

      // Append image and text to the list item
      li.appendChild(img);
      li.appendChild(span);

      li.onclick = () => {
        document.getElementById("search-input").value = song.name;
        suggestionBox.innerHTML = ""; // Hide suggestions
        searchSong();
      };
      suggestionBox.appendChild(li);
    });
  }
}

// Function to search for a song or songs by author (includes song image in results)
function searchSong() {
  const query = document.getElementById("search-input").value.toLowerCase();
  const searchResult = document.getElementById("search-result");

  // Check if the query is for an author search
  if (query.startsWith("author:")) {
    const authorQuery = query.substring("author:".length).trim();
    const results = songs.filter(song => song.author.toLowerCase() === authorQuery);
    if (results.length > 0) {
      searchResult.innerHTML = `<p>Found ${results.length} song(s) by ${results[0].author}:</p>`;
      results.forEach(song => {
        const songIndex = songs.indexOf(song);
        searchResult.innerHTML += `
          <div class="search-result">
            <img src="${song.image}" alt="${song.name}" class="search-result-image">
            <div>
              <p>${song.name} by ${song.author}</p>
              <button onclick="playSong(${songIndex})">Play</button>
            </div>
          </div>
        `;
      });
    } else {
      searchResult.innerHTML = `<p>Sorry, we couldn't find any songs by that author (Error code : 402)</p>`;
    }
  } else {
    // Normal song name search
    const result = songs.find(song => song.name.toLowerCase().includes(query));
    if (result) {
      searchResult.innerHTML = `
        <div class="search-result">
          <img src="${result.image}" alt="${result.name}" class="search-result-image">
          <div>
            <p>Found: ${result.name} by ${result.author}</p>
            <button onclick="playSong(${songs.indexOf(result)})">Play</button>
          </div>
        </div>
      `;
    } else {
      searchResult.innerHTML = `<p>Sorry, we couldn't find the song due to lack of data !(Error code : 402)</p>`;
    }
  }
}

// Function to play a song
function playSong(index) {
  const song = songs[index];
  // Add to recently played history
  addToHistory(index);
  document.getElementById("song-player").style.display = "flex";
  document.getElementById("song-title").textContent = song.name;
  document.getElementById("song-author").textContent = song.author;
  const audioPlayer = document.getElementById("audio-player");
  audioPlayer.src = song.link;
  audioPlayer.play();
  // Update the song image in the player
  document.getElementById("song-image").src = song.image;
}

// Function to close the song player
function closePlayer() {
  document.getElementById("song-player").style.display = "none";
  const audioPlayer = document.getElementById("audio-player");
  audioPlayer.pause();
  audioPlayer.src = "";
}

// Load Songs
function loadSongs() {
  const songList = document.getElementById("song-list");
  songs.forEach((song, index) => {
    const songItem = document.createElement("div");
    songItem.className = "song-item";
    songItem.innerHTML = `
      <img src="${song.image}" alt="${song.name}">
      <div>
        <h3>${song.name}</h3>
        <p>${song.author}</p>
      </div>
    `;
    songItem.onclick = () => playSong(index);
    songList.appendChild(songItem);
  });
}

// Function to show the notification
function showNotification() {
  document.getElementById("notification").style.display = "block";
}

// Function to close the notification
function closeNotification() {
  document.getElementById("notification").style.display = "none";
}

// Initial Setup
window.onload = () => {
  // Show loading screen for 2 seconds
  setTimeout(() => {
    document.getElementById("loading-screen").style.display = "none";
    document.getElementById("app-container").style.display = "block";
    loadSongs();

    // Check if the user is on an Android device
    if (navigator.userAgent.toLowerCase().indexOf("android") > -1) {
      showNotification();
    }
  }, 2000);
};

function showEmail() {
  window.location.href = "mailto:contact@sparkle.com"; // Replace with your actual email
}

const songs = [
  {
    name: "Suzume",
    author: "Radwimps",
    image: "suzume-no-tojimari-anime-46@1@k-phone-4k.jpg",
    link: "Suzume No Tojimari Title Track(PagalWorld.com.so).mp3"
  },
  {
    name: "Sparkle",
    author: "Radwimps",
    image: "desktop-wallpaper-your-name-2022-movie.jpg",
    link: "Your-Name-Sparkle.mp3"
  },
  {
    name: "grunge",
    author: "Demon slayer",
    image: "images (5).jpeg",
    link: " Demon-Slayer.mp3"
  },
  {
    name: " Dark Aria",
    author: "solo levelling",
    image: "images (4).jpeg",
    link: "DARK-ARIA-LV2.mp3"
  },
  {
    name: "solo levelling Season 2 theme song",
    author: "solo levelling",
    image: "images (4).jpeg",
    link: "Solo-Leveling-Season-2-Opening-FULL-ReawakeR-by-LiSA.mp3"
  }
];
