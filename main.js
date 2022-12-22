function syncLyric(lyrics, time) {
  const scores = [];
  lyrics.forEach((lyric) => {
    const score = time - lyric.time;
    if (score >= 0) scores.push(score);
  });
  if (scores.length == 0) return null;
  const closest = Math.min(...scores);
  return scores.indexOf(closest);
}

function parseLyric(lrc) {
  const regex = /^\[(?<time>\d{2}:\d{2}(.\d{2})?)\](?<text>.*)/;
  const lines = lrc.split("\n");
  const output = [];
  lines.forEach((line) => {
    const match = line.match(regex);
    if (match == null) return;
    const { time, text } = match.groups;
    output.push({
      time: parseTime(time),
      text: text.trim(),
    });
  });

  function parseTime(time) {
    const minsec = time.split(":");
    const min = parseInt(minsec[0]) * 60;
    const sec = parseFloat(minsec[1]);
    return min + sec;
  }
  return output;
}


const preloader = document.querySelector(".preloader");
const playBtn = document.getElementById("play");
const progress = document.querySelector(".progress");
const music = new Audio();
music.src = "./song.mp3";
music.currentTime = 68;
playBtn.addEventListener("click", playing);

window.addEventListener("load", () => {
  setTimeout(() => {
    preloader.style.display = "none";
  }, 3000);
});

async function playing() {
  "use strict";

  const lyric = document.querySelector(".lyric");
  const res = await fetch("./s.lrc");
  const lrc = await res.text();
  const lyrics = parseLyric(lrc);

  if (music.paused) {
    music.play();
    playBtn.setAttribute("class", "fa fa-pause");
  } else {
    music.pause();
    playBtn.setAttribute("class", "fa fa-play");
  }

  music.ontimeupdate = () => {
    const time = music.currentTime;
    const index = syncLyric(lyrics, time);

    if (index == null) return;

    lyric.innerHTML = lyrics[index].text;
  };
}

music.addEventListener('timeupdate', updateDurationMusic)

function updateDurationMusic() {
  let newDuration = music.currentTime * (100 / music.duration);
  progress.style.height = `${newDuration}%`;
}