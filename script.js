

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
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)  // using my port number in online where my  respository are present we are fetching from online
    let response = await a.text(); //here my DOM convert in the form of text where my songs are located, we are converting it to take out songs
    let div = document.createElement("div");
    div.innerHTML = response  //store whole dom(html document) where my all songs are presents in table form
    // document.body.append(div) we will not put it into our webpage
    let as = div.getElementsByTagName("a")  // as will now have all a element present in div's innerhtml
    songs = []  // make songs array to store all songs
    for (let index = 0; index < as.length; index++) {   //we will run for loop to get a element whose href endwith .mp3 it means it is a element who have song link so we store that element's href into songs array
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);  //this will split my href link into two parts based on given point("folder")left and right
        }
    }
    //show all songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]; //it will return collection of ul even if there is only one ul in songList so to get first index's ul we wrote [0]  or instead of collection one can just return first element using document.querySelector(".songList ul")
    songUL.innerHTML = ""  // to make sure new song's list will load
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + ` <li>
                            <img class="invert" src="music.svg" width="22px" height="22px" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Anant</div>
                            </div>
                            <div class="playnow">
                                <span> Play Now</span>
                                <img class="invert" src="play.svg" alt="">
                                
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
    currentSong.src = `/${currFolder}/` + track  // it will send request to songs folder to get track(means it will become something like this https://127.0.0.1/3000/songs/track) then i will give me that track's link from songs folder and put into currentSong.src means in Audio object's src to play
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);//decode the url
    document.querySelector(".songtime").innerHTML = "00:00/00:00"


}
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)  //this will give me my songs whole folder into stream of byts
    let response = await a.text();  //this will convert my stream of byts into text which seems like html document
    let div = document.createElement("div");
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]

            //get metadata of folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)  //all folders have info.json which holds meta data of folder
            let response2 = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
                        <div class="play">
                            <img src="spoti.svg" alt="Play Icon" width="20px">
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response2.title}</h2>
                        <p>${response2.description}</p>
                    </div>`


        }
    }
    //load playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        })
    })
}


async function main() {     //we create async function main because we don't want promise we want direct array for that we have to await for getsongs and for await i have to create async function
    //get the list of all songs
    await getSongs("songs/ncs")    //it will now not return promise pending or some thing it will wait for songs array and then store in variable songs then print
    playMusic(songs[0], true)

    //display all songs on the page
    displayAlbums()
    //Attach an event listener to play, next, and previous
    // let play = document.querySelector(".songbuttons>.play");
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "play.svg"

        }
    })
    //Listen for time update event (if time is updating of something then this event will trigger)
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";  //it will increase left's value according to currenttime value of duration
    })
    //Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        // console.log(e.offsetX) //offsetX means distance in x direction according to viewport, every click event in different position has different properties
        // The getBoundingClientRect() method returns the size of an element and its position relative to the viewport
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
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {   //should execute till 0th index
            playMusic(songs[index - 1]);
        }

    })
    //Add event listener to next
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {  //should execut till last index of songs array
            playMusic(songs[index + 1]);
        }
    })
    // Add event listner to set volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Your Music's volume is", e.target.value, "/100")
        currentSong.volume = parseInt(e.target.value) / 100;   //volume attribute take only value from 0 to 1 that's why /100
    })

    //add event listner to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{
        console.log(e.target)
        if(e.target.src.includes("volume.svg")){
            console.log("im clicking the volume")
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume =0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10
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











