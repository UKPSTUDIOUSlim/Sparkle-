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
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
}

/***************************************
 * Recently Played History
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
  // Remove previous instance
  history = history.filter(item => item.index !== songIndex);
  // Add new at the beginning
  history.unshift({ index: songIndex, time: new Date().toISOString() });
  // Limit to 10
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
      currentSongIndex = entry.index;
      playSong(entry.index);
      addToHistory(entry.index);
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
  document.getElementById("liked-songs-panel").style.display = "none";
  document.getElementById("bookmarks-panel").style.display = "none";
  document.getElementById("history-panel").style.display = "flex";
  updateHistoryList();
}
function backToMenu() {
  document.getElementById("history-panel").style.display = "none";
  document.getElementById("liked-songs-panel").style.display = "none";
  document.getElementById("bookmarks-panel").style.display = "none";
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
 * Liked Songs
 ***************************************/
function getLikedSongs() {
  const cookie = getCookie("likedSongs");
  if (cookie) {
    try {
      return JSON.parse(cookie);
    } catch (e) {
      return [];
    }
  }
  return [];
}
function setLikedSongs(liked) {
  setCookie("likedSongs", JSON.stringify(liked), 365);
}
function toggleLikeSong(songIndex) {
  let liked = getLikedSongs();
  if (liked.includes(songIndex)) {
    // remove
    liked = liked.filter(i => i !== songIndex);
  } else {
    liked.push(songIndex);
  }
  setLikedSongs(liked);
}
function updateLikedSongsList() {
  const likedList = document.getElementById("liked-songs-list");
  const liked = getLikedSongs();
  if (liked.length === 0) {
    likedList.innerHTML = "<p>No liked songs.</p>";
    return;
  }
  likedList.innerHTML = "";
  liked.forEach(songIndex => {
    const song = songs[songIndex];
    const div = document.createElement("div");
    div.className = "liked-item";
    div.onclick = () => {
      currentSongIndex = songIndex;
      playSong(songIndex);
    };
    div.innerHTML = `
      <img src="${song.image}" alt="${song.name}">
      <div class="liked-info">
        <p>${song.name} by ${song.author}</p>
      </div>
      <button class="delete-liked" onclick="event.stopPropagation(); removeLikedItem(${songIndex});">X</button>
    `;
    likedList.appendChild(div);
  });
}
function removeLikedItem(songIndex) {
  let liked = getLikedSongs();
  liked = liked.filter(i => i !== songIndex);
  setLikedSongs(liked);
  updateLikedSongsList();
}
function clearLikedSongs() {
  setLikedSongs([]);
  updateLikedSongsList();
}
function showLikedSongsPanel() {
  document.querySelector(".menu-content").style.display = "none";
  document.getElementById("history-panel").style.display = "none";
  document.getElementById("bookmarks-panel").style.display = "none";
  document.getElementById("liked-songs-panel").style.display = "flex";
  updateLikedSongsList();
}

/***************************************
 * Bookmarks
 ***************************************/
function getBookmarks() {
  const cookie = getCookie("bookmarks");
  if (cookie) {
    try {
      return JSON.parse(cookie);
    } catch (e) {
      return [];
    }
  }
  return [];
}
function setBookmarks(bookmarks) {
  setCookie("bookmarks", JSON.stringify(bookmarks), 365);
}
function toggleBookmarkSong(songIndex) {
  let bookmarks = getBookmarks();
  if (bookmarks.includes(songIndex)) {
    // remove
    bookmarks = bookmarks.filter(i => i !== songIndex);
  } else {
    bookmarks.push(songIndex);
  }
  setBookmarks(bookmarks);
}
function updateBookmarksList() {
  const bookmarksList = document.getElementById("bookmarks-list");
  const bookmarks = getBookmarks();
  if (bookmarks.length === 0) {
    bookmarksList.innerHTML = "<p>No bookmarks yet.</p>";
    return;
  }
  bookmarksList.innerHTML = "";
  bookmarks.forEach(songIndex => {
    const song = songs[songIndex];
    const div = document.createElement("div");
    div.className = "bookmark-item";
    div.onclick = () => {
      currentSongIndex = songIndex;
      playSong(songIndex);
    };
    div.innerHTML = `
      <img src="${song.image}" alt="${song.name}">
      <div class="bookmark-info">
        <p>${song.name} by ${song.author}</p>
      </div>
      <button class="delete-bookmark" onclick="event.stopPropagation(); removeBookmarkItem(${songIndex});">X</button>
    `;
    bookmarksList.appendChild(div);
  });
}
function removeBookmarkItem(songIndex) {
  let bookmarks = getBookmarks();
  bookmarks = bookmarks.filter(i => i !== songIndex);
  setBookmarks(bookmarks);
  updateBookmarksList();
}
function clearBookmarks() {
  setBookmarks([]);
  updateBookmarksList();
}
function showBookmarksPanel() {
  document.querySelector(".menu-content").style.display = "none";
  document.getElementById("history-panel").style.display = "none";
  document.getElementById("liked-songs-panel").style.display = "none";
  document.getElementById("bookmarks-panel").style.display = "flex";
  updateBookmarksList();
}

/***************************************
 * Main Player Logic
 ***************************************/
let currentSongIndex = 0;
let isPlaying = false;
const audioPlayer = document.getElementById("audio-player");
const progressBar = document.getElementById("progress-bar");

/** Format seconds to MM:SS **/
function formatTime(seconds) {
  if (isNaN(seconds)) return "00:00";
  let m = Math.floor(seconds / 60);
  let s = Math.floor(seconds % 60);
  if (m < 10) m = "0" + m;
  if (s < 10) s = "0" + s;
  return m + ":" + s;
}

/** Update time display + progress bar **/
function updateTime() {
  const current = audioPlayer.currentTime;
  const total = audioPlayer.duration;
  document.getElementById("time-current").textContent = formatTime(current);
  document.getElementById("time-total").textContent = formatTime(total);

  // Update slider position
  const percent = (current / total) * 100;
  progressBar.value = percent || 0;
}

/** Audio event listeners **/
audioPlayer.addEventListener("timeupdate", updateTime);
audioPlayer.addEventListener("loadedmetadata", updateTime);

/** Seek bar events (fully interactive) **/
progressBar.addEventListener("input", () => {
  if (!isNaN(audioPlayer.duration)) {
    const newTime = (progressBar.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = newTime;
  }
});

/** Toggle sliding menu **/
function toggleMenu() {
  const menu = document.getElementById('sliding-menu');
  menu.classList.toggle('open');
}

/** Handle login **/
function handleLogin() {
  window.location.href = "login.html";
}

/** Show suggestions while typing **/
function showSuggestions() {
  const query = document.getElementById("search-input").value.toLowerCase();
  const suggestionBox = document.getElementById("suggestion-box");
  suggestionBox.innerHTML = "";
  if (query) {
    const suggestions = songs.filter(song => song.name.toLowerCase().includes(query));
    suggestions.forEach(song => {
      const li = document.createElement("li");
      const img = document.createElement("img");
      img.src = song.image;
      img.alt = song.name;
      img.className = "suggestion-image";
      const span = document.createElement("span");
      span.textContent = song.name;
      li.appendChild(img);
      li.appendChild(span);
      li.onclick = () => {
        document.getElementById("search-input").value = song.name;
        suggestionBox.innerHTML = "";
        searchSong();
      };
      suggestionBox.appendChild(li);
    });
  }
}

/** Search for a song or by author **/
function searchSong() {
  const query = document.getElementById("search-input").value.toLowerCase();
  const searchResult = document.getElementById("search-result");
  let resultsHTML = "";

  if (query.startsWith("author:")) {
    const authorQuery = query.substring("author:".length).trim();
    const results = songs.filter(song => song.author.toLowerCase() === authorQuery);
    if (results.length > 0) {
      resultsHTML += `<p>Found ${results.length} song(s) by ${results[0].author}:</p>`;
      results.forEach(song => {
        const songIndex = songs.indexOf(song);
        resultsHTML += `
          <div class="result-item" onclick="playSong(${songIndex}); hideSearchResults();">
            <img src="${song.image}" alt="${song.name}" class="search-result-image">
            <div>
              <p>${song.name} by ${song.author}</p>
            </div>
          </div>
        `;
      });
    } else {
      resultsHTML = `<p>Sorry, no songs found for that author (Error code: 402)</p>`;
    }
  } else {
    const result = songs.find(song => song.name.toLowerCase().includes(query));
    if (result) {
      const songIndex = songs.indexOf(result);
      resultsHTML += `
        <div class="result-item" onclick="playSong(${songIndex}); hideSearchResults();">
          <img src="${result.image}" alt="${result.name}" class="search-result-image">
          <div>
            <p>Found: ${result.name} by ${result.author}</p>
          </div>
        </div>
      `;
    } else {
      resultsHTML = `<p>Sorry, we couldn't find the song. (Error code: 402)</p>`;
    }
  }

  // Build the full-page overlay with a header and back button
  searchResult.innerHTML = `
    <div class="search-result-header">
      <button id="back-button" onclick="hideSearchResults()">Back</button>
      <h2>Search Results</h2>
    </div>
    <div class="search-result-content">
      ${resultsHTML}
    </div>
  `;
  searchResult.style.display = "flex";
}

function hideSearchResults() {
  document.getElementById("search-result").style.display = "none";
}

/** Load all songs into the list **/
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
    songItem.onclick = () => {
      currentSongIndex = index;
      playSong(index);
    };
    songList.appendChild(songItem);
  });
}

/** Play a selected song **/
function playSong(index) {
  currentSongIndex = index;
  const song = songs[index];
  addToHistory(index);

  // Show mini-player
  document.getElementById("mini-player").style.display = "flex";
  document.getElementById("mini-song-image").src = song.image;
  document.getElementById("mini-song-title").textContent = song.name;
  document.getElementById("mini-song-author").textContent = song.author;

  // Update full-player info
  document.getElementById("full-song-image").src = song.image;
  document.getElementById("full-song-title").textContent = song.name;
  document.getElementById("full-song-author").textContent = song.author;

  // Audio
  audioPlayer.src = song.link;
  audioPlayer.play();
  isPlaying = true;

  // Update play button text
  document.getElementById("mini-play-btn").textContent = "Pause";
  document.getElementById("play-btn").textContent = "Pause";

  // Update like button
  updateLikeButton(index);
  // Update bookmark button
  updateBookmarkButton(index);
}

/** Expand to full-page player **/
function expandPlayer() {
  document.getElementById("full-player").style.display = "flex";
}

/** Collapse back to mini-player **/
function collapsePlayer() {
  document.getElementById("full-player").style.display = "none";
}

/** Close mini player (stop song & hide) **/
function closeMiniPlayer() {
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  isPlaying = false;
  document.getElementById("mini-play-btn").textContent = "Play";
  document.getElementById("play-btn").textContent = "Play";
  document.getElementById("mini-player").style.display = "none";
}

/** Play / Pause toggle **/
function togglePlayPause() {
  const miniPlayBtn = document.getElementById("mini-play-btn");
  const fullPlayBtn = document.getElementById("play-btn");

  if (isPlaying) {
    audioPlayer.pause();
    isPlaying = false;
    miniPlayBtn.textContent = "Play";
    fullPlayBtn.textContent = "Play";
  } else {
    audioPlayer.play();
    isPlaying = true;
    miniPlayBtn.textContent = "Pause";
    fullPlayBtn.textContent = "Pause";
  }
}

/** Next / Previous song **/
function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  playSong(currentSongIndex);
}
function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  playSong(currentSongIndex);
}

/** Like / Unlike the current song **/
function toggleLikeCurrentSong() {
  toggleLikeSong(currentSongIndex);
  updateLikeButton(currentSongIndex);
}
function updateLikeButton(index) {
  const likeBtn = document.getElementById("like-btn");
  const liked = getLikedSongs();
  if (liked.includes(index)) {
    likeBtn.classList.add("liked");
    likeBtn.textContent = "♥";
  } else {
    likeBtn.classList.remove("liked");
    likeBtn.textContent = "♡";
  }
}

/** Bookmark / Unbookmark current song **/
function toggleBookmarkCurrentSong() {
  toggleBookmarkSong(currentSongIndex);
  updateBookmarkButton(currentSongIndex);
}
function updateBookmarkButton(index) {
  const bookmarkBtn = document.getElementById("bookmark-btn");
  const bookmarks = getBookmarks();
  if (bookmarks.includes(index)) {
    bookmarkBtn.classList.add("bookmarked");
    bookmarkBtn.textContent = "Bookmarked";
  } else {
    bookmarkBtn.classList.remove("bookmarked");
    bookmarkBtn.textContent = "Bookmark";
  }
}

/***************************************
 * Notification
 ***************************************/
function showNotification() {
  document.getElementById("notification").style.display = "block";
}
function closeNotification() {
  document.getElementById("notification").style.display = "none";
}

/***************************************
 * Email
 ***************************************/
function showEmail() {
  window.location.href = "mailto:contact@sparkle.com"; // Replace with your actual email
}

/***************************************
 * On Window Load
 ***************************************/
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

/***************************************
 * Songs Database
 ***************************************/
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
    link: "Demon-Slayer.mp3"
  },
  {
    name: "Dark Aria",
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
