function syncLyric(lyrics, time) {
  const scores = [];

  lyrics.forEach((lyric) => {
    // get the gap or distance or we call it score
    const score = time - lyric.time;

    // only accept score with positive values
    if (score >= 0) scores.push(score);
  });

  if (scores.length == 0) return null;

  // get the smallest value from scores
  const closest = Math.min(...scores);

  // return the index of closest lyric
  return scores.indexOf(closest);
}

function parseLyric(lrc) {
  // will match "[00:00.00] ooooh yeah!"
  // note: i use named capturing group
  const regex = /^\[(?<time>\d{2}:\d{2}(.\d{2})?)\](?<text>.*)/;

  // split lrc string to individual lines
  const lines = lrc.split("\n");

  const output = [];

  lines.forEach((line) => {
    const match = line.match(regex);

    // if doesn't match, return.
    if (match == null) return;

    const { time, text } = match.groups;

    output.push({
      time: parseTime(time),
      text: text.trim(),
    });
  });

  // parse formated time
  // "03:24.73" => 204.73 (total time in seconds)
  function parseTime(time) {
    const minsec = time.split(":");

    const min = parseInt(minsec[0]) * 60;
    const sec = parseFloat(minsec[1]);

    return min + sec;
  }

  return output;
}

const playBtn = document.getElementById("play");
const music = new Audio();
music.src = "./song.mp3";

playBtn.addEventListener("click", playing);

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

// !async function main() {
//     "use strict";

//     const dom = {
//         lyric: document.querySelector(".lyric"),
//         player: document.querySelector(".player")
//     };

//     // load lrc file
//     const res = await fetch("./s.lrc");
//     const lrc = await res.text();

//     const lyrics = parseLyric(lrc);

//     dom.player.src = "./song.mp3";

//     dom.player.ontimeupdate = () => {
//         const time = dom.player.currentTime;
//         const index = syncLyric(lyrics, time);

//         if (index == null) return;

//         dom.lyric.innerHTML = lyrics[index].text;
//     };

// }();
