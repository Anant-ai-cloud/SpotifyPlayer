

let songs;
let currFolder;
let currentSong = new Audio();// define global variable to make sure object is will being created once to avoid multiple songs play in one go
function secondsToMinutesSeconds(seconds) {
    if (Number.isNaN(seconds) || seconds < 0) {
        return "00:00"
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0'); //it will pad my string with 0 untill it reaches length 2
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');  //it will pad my string with 0 untill it reaches length 2
    return `${formattedMinutes}:${formattedSeconds}`
}


async function getSongs(folder) {
     folder = folder.replace(/\\/g, "/");
    currFolder = folder;
    // let a = await fetch(`http://127.0.0.1:3000/${folder}/`)  // using my port number in online where my  respository are present we are fetching from online
    let a = await fetch(`/songs/ncs/`);
 
    console.log(`http://127.0.0.1:3000/${folder}/`) 
    let response = await a.text(); //here my DOM convert in the form of text where my songs are located, we are converting it to take out songs
    let div = document.createElement("div");
    div.innerHTML = response  //store whole dom(html document) where my all songs are presents in table form
    // document.body.append(div) we will not put it into our webpage
    let as = div.getElementsByTagName("a")  // as will now have all a element present in div's innerhtml
    
    songs = []  // make songs array to store all songs
    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if (element.href.endsWith(".mp3")) {
            console.log(element)
            
            const decodedHref = decodeURIComponent(element.href);
            
            const normalizedHref = decodedHref.replace(/\\/g, "/");
            console.log(normalizedHref)
            console.log(folder)
            const parts = normalizedHref.split(`/${folder}/`);
            // const parts = decodedHref.split(`/${folder}/`);
            console.log(parts)
            

            songs.push(parts[1]);
        }
    }
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + ` <li>
                            <img class="invert" src="img/music.svg" width="22px" height="22px" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Anant</div>
                            </div>
                            <div class="playnow">
                                <span> Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                                
                            </div>
                        </li> `
    }
    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {

            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })

}
const playMusic = (track, pause = false) => {
    // let audio = new Audio ("/songs/" + track)      // they will make new object again and again that causes multiple songs play at one time
    // audio.play()
    console.log(`/${currFolder}/` + track )
    
    currentSong.src = `/${currFolder}/` + track  // it will send request to songs folder to get track(means it will become something like 
    

    console.log(currentSong.src)
    // this https://127.0.0.1/3000/songs/track) then it will give me that track's link from songs folder and put into currentSong.src means in Audio object's src to play
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);//decode the url
    document.querySelector(".songtime").innerHTML = "00:00/00:00"


}

async function displayAlbums() {
    console.log("displaying albums");

    // Fetch the main songs directory
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = ""; // clear old content

    // Convert to array for easier iteration
    let array = Array.from(anchors);

    for (let e of array) {
        const decoded = decodeURIComponent(e.href).replace(/\\/g, "/");

        // Include only folders under /songs/
        if (decoded.includes("/songs/") && !decoded.endsWith(".htaccess") && !decoded.endsWith(".mp3")) {
            // Extract the folder name correctly
            let parts = decoded.split("/songs/");
            let folder = parts[1].replace(/\/$/, ""); // remove trailing slash if any

            console.log("Detected folder:", folder);

            // Fetch info.json of each folder
            try {
                let infoResponse = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
                if (!infoResponse.ok) continue; // skip if info.json not found

                let info = await infoResponse.json();

                // Add card HTML
                cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card">
                        <div class="play">
                            <img src="img/spoti.svg" alt="Play Icon" width="20px">
                        </div>
                        <img src="songs/${folder}/cover.jpg" alt="not found">
                        <h2>${info.title}</h2>
                        <p>${info.description}</p>
                    </div>`;
            } catch (err) {
                console.warn("Skipping folder (no info.json):", folder);
            }
        }
    }

    // Add click event to load songs on card click
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async (e) => {
            let folder = e.currentTarget.dataset.folder;
            await getSongs(`songs/${folder}`);
            console.log(songs[0])
            playMusic(songs[0]);
        });
    });
}




async function main() {    
    await getSongs("songs/ncs")    
    playMusic(songs[0], true)

    
    displayAlbums()
    
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"

        }
    })
    //Listen for time update event (if time is updating of something then this event will trigger)
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";  //it will increase left's value according to currenttime value of duration
    })
    //Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%"; // it will move my circle in that much percent in x direction by increasing left
        currentSong.currentTime = (currentSong.duration * percent) / 100; // it will forward my song that much percent from total duration

    })
    //add event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0px"
    })

    //Add event listener to close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })
    //Add event listener to previous
    previous.addEventListener("click", () => {
        console.log(songs.indexOf(currentSong.src.split("/").slice(-1)[0]))
        let previousSong =  currentSong.src.split("/").slice(-1)[0].replaceAll("%20", " ")
        let index = songs.indexOf(previousSong);
        if (index - 1 >= 0) {   //should execute till 0th index
            playMusic(songs[index - 1]);
        }

    })
    //Add event listener to next
    next.addEventListener("click", () => {
        // let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        let nextSong = currentSong.src.split("/").slice(-1)[0].replaceAll("%20", " ")
        let index = songs.indexOf(nextSong);
        
        if (index + 1 < songs.length) {  //should execut till last index of songs array
            playMusic(songs[index + 1]);
        }
    })
    // Add event listner to set volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Your Music's volume is", e.target.value, "/100")
        currentSong.volume = parseInt(e.target.value) / 100;   //volume attribute take only value from 0 to 1 that's why /100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    //add event listner to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        console.log(e.target)
        if (e.target.src.includes("volume.svg")) {
            console.log("im clicking the volume")
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50;

        }
    })








    //    #Removed after sometime but important for logic and learning
    // //Play the first
    // var audio = new Audio(songs[0]);
    // // audio.play(); // it will play song after only user interaction
    // audio.addEventListener('loadeddata', () => {
    //     console.log(audio.duration, audio.currentSrc, audio.currentTime)
    //     let duration = audio.duration
    //     console.log(duration);  //the duration variable holds the duration (insecond) of audio clip
    // })
}
main();











