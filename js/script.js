let currentSong = new Audio();
let currFolder;
let songs;

//function to convert seconds to minutes and seconds
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

//fetching the songs from a div of texts
async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${currFolder}/`);
  let b = await a.text();
  let div = document.createElement("div");
  div.innerHTML = b;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${currFolder}/`)[1]);
    }
  } 

  //show all the songs in the playlist
  let songList = document.querySelector(".songList").getElementsByTagName("ul")[0];
  songList.innerHTML = ""
  for (const song of songs) {
    // let finesong = song.replaceAll("%20", " ")
    songList.innerHTML = songList.innerHTML +`<li><img class="invert" src="img/music.svg" alt="">
                            <div class="songinfo">
                                <p>${song.replaceAll("%20", " ")}</p>
                                <p>Artist Name</p>
                            </div>
                            <div class="play">
                                <p>Play Now</p>
                                <img class="invert" src="img/play2.svg" alt="">
                            </div>
                        </li>`;
  }

  //attach an event listner to each song
  Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
      e.addEventListener("click", element =>{
      playMusic(e.querySelector(".songinfo").firstElementChild.innerHTML.trim())
      
    })
  })
  
  return songs
}


const playMusic = (track, pause=false)=>{
  currentSong.src = `${currFolder}/` + track;
  if(!pause){
      currentSong.play()
      play.src = "img/pause.svg"
  }
  document.querySelector(".songdetails").innerHTML = decodeURI(track)
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums(){
  let a = await fetch(`/songs`);
  let b = await a.text();
  let div = document.createElement("div");
  div.innerHTML = b;
  let anchors = div.getElementsByTagName("a")
  let cardContainer = document.querySelector(".cardContainer")
  let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
      const e = array[index];

      if(e.href.includes("/songs/") && !e.href.includes(".htaccess")){
        let folder = e.href.split('/').slice(-1)[0]
        // get the metadata of the folder
        let a = await fetch(`/songs/${folder}/info.json`);
        let b = await a.json();
        cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
        <div class="playbtn">
            <img src="img/play1.svg" alt="" />
        </div>
        <img src="/songs/${folder}/cover.jpg" alt="" />
        <h2>${b.title}</h2>
        <p>${b.description}</p>
        </div>`
      }
    }
    //load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
    e.addEventListener('click', async item=>{
    songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
    playMusic(songs[0])
    })
  })
}
async function main() {
   // Get the list of all the songs
  await getSongs("songs/Trending");
  playMusic(songs[0], true)

  //display all the albums on the page
  await displayAlbums();

  //add an event listener to playbar btns
  play.addEventListener('click', ()=>{
    if(currentSong.paused){
        currentSong.play()
        play.src = "img/pause.svg"
    }
    else{
        currentSong.pause()
        play.src = "img/play1.svg"
    }
  })

  //listen for time update event
  currentSong.addEventListener('timeupdate', ()=>{
    document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
    document.querySelector('.circle').style.left = (currentSong.currentTime /currentSong.duration) * 100 + "%";
    document.querySelector('.seekbar3').style.width = (currentSong.currentTime /currentSong.duration) * 100 + "%";
  })

  //add an event listner to seekbar2 
  document.querySelector(".seekbar2").addEventListener("click", e=>{
    let percent  = (e.offsetX/e.target.getBoundingClientRect().width) * 100 
    document.querySelector(".circle").style.left = (percent) + "%";
    document.querySelector(".seekbar3").style.width = (percent) + "%";
    currentSong.currentTime = ((currentSong.duration)*percent)/100;
  })
  //add an event listener to hamburger
  document.querySelector('.hamburger').addEventListener("click", ()=>{
    document.querySelector("#left").style.left = "0"
  })
   // Add an event listener for close button
  document.querySelector('.closebtn').addEventListener("click", ()=>{
    document.querySelector("#left").style.left = "-100%"
  })
  // Add an event listener to previous
  previous.addEventListener("click", ()=>{
    console.log("Previous Clicked")
    let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
    if((index-1) >= 0){
      playMusic(songs[index-1])
    }
  })
  // Add an event listener to next
  next.addEventListener("click", ()=>{
    console.log("Next Clicked")
    // currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
    if((index+1) < songs.length){
      playMusic(songs[index+1])
    }
  })

  // Add an event to volume
  range.addEventListener("change", (e)=>{
    currentSong.volume = parseInt(e.target.value) / 100
  })

  //Add an event to pause/play with spacebar 
  document.body.onkeydown = function spacekey(event) {
    if(event.code === "Space"){
      event.preventDefault();
      if (currentSong.paused) {
        currentSong.play();
        play.src = "img/pause.svg";

    } else {
        currentSong.pause();
        play.src = "img/play1.svg";
    }
    }   
  }
  let storedVolume;
  //add an event to mute the track
  document.getElementById("unmute").addEventListener("click", e=>{
    if(currentSong.volume != 0){
      storedVolume = currentSong.volume;
      currentSong.volume = 0;
      unmute.src = "img/mute.svg"
      range.value = 0
    }
    else if(currentSong.volume == 0){
      currentSong.volume = storedVolume;
      unmute.src = "img/unmute.svg"
      range.value = currentSong.volume*100;
    }
  })






}
main();
