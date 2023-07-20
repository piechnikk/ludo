export { players, game }
import { EnemyChecker } from './klasy.js'
let players = {
    checkingInterval: 0,
    refreshPlayers: function (ob) {
        console.log(ob);
        for (let i = 0; i < ob.game.players.length; i++) {
            let div = document.getElementById(ob.game.players[i].color)
            div.innerText = ob.game.players[i].nick
            let timer = document.createElement("div")
            timer.classList.add("timer")
            div.appendChild(timer)
        }
        document.getElementById(ob.user.color).style.backgroundColor = ob.user.color
    },
    checkPlayers: function () {
        let xhttp = new XMLHttpRequest()
        xhttp.open("POST", "/checkPlayers", true)

        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let ob = JSON.parse(this.responseText)
                players.refreshPlayers(ob)
                if (ob.game.status == 1) {
                    if (ob.user.diceValue != 0) {
                        console.log(ob.user.diceValue);
                        let kostka = document.getElementById("kostka")
                        kostka.style.display = "none"
                        document.getElementById("skip").style.display = "inline-block"
                        let value = document.getElementById("diceValue")
                        value.style.display = "inline-block"
                        value.src = "./kostka/" + ob.user.diceValue + ".png"
                    }
                    document.getElementById("board").style.display = "flex"
                    let pionki = document.getElementsByClassName("checker")
                    for (let i = 0; i < pionki.length; i++) {
                        pionki[i].classList.remove("hidden")
                    }
                    for (let i = 0; i < ob.game.players.length; i++) {
                        if (ob.game.players[i].uid != ob.user.uid) {
                            for (let j = 0; j < ob.game.players[i].checkers.length; j++) {
                                game.checkers[i][j] = new EnemyChecker(ob.game.players[i].checkers[j], ob.game.players[i].color)
                            }
                        }
                    }
                    clearInterval(players.checkingInterval)
                    players.checkingInterval = setInterval(game.get, 1000)
                    document.getElementById("div_now").style.display = "none"
                }
            }
        }

        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        xhttp.send("game_now=" + document.getElementById("game_now").checked)
    },
    load: function () {
        this.checkPlayers()
        this.checkingInterval = setInterval(this.checkPlayers, 3000)
    }

}
let game = {
    synthVoice: {
        speechElement: new SpeechSynthesisUtterance,
        synth: window.speechSynthesis,
        voices: [],
        populteVoiceList: function () {
            game.synthVoice.voices = game.synthVoice.synth.getVoices();
            console.log(game.synthVoice.voices);
            if (game.synthVoice.voices != []) {
                for (let i = 0; i < game.synthVoice.voices.length; i++) {
                    if (game.synthVoice.voices[i].lang == "pl-PL") {
                        game.synthVoice.speechElement.voice = game.synthVoice.voices[i]
                    }
                }
            }
        },
    },
    checkers: [[], [], [], []],
    board: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 },     // 1-4   red start
        { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 9, y: 1 }, { x: 10, y: 1 },   // 5-8   blue start
        { x: 9, y: 9 }, { x: 10, y: 9 }, { x: 9, y: 10 }, { x: 10, y: 10 }, // 9-12  green start
        { x: 0, y: 9 }, { x: 1, y: 9 }, { x: 0, y: 10 }, { x: 1, y: 10 },   // 13-16 yellow start
        { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 4, y: 3 }, { x: 4, y: 2 }, { x: 4, y: 1 }, { x: 4, y: 0 }, { x: 5, y: 0 },    // 17-26
        { x: 6, y: 0 }, { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 }, { x: 7, y: 4 }, { x: 8, y: 4 }, { x: 9, y: 4 }, { x: 10, y: 4 }, { x: 10, y: 5 },  // 27-36
        { x: 10, y: 6 }, { x: 9, y: 6 }, { x: 8, y: 6 }, { x: 7, y: 6 }, { x: 6, y: 6 }, { x: 6, y: 7 }, { x: 6, y: 8 }, { x: 6, y: 9 }, { x: 6, y: 10 }, { x: 5, y: 10 }, // 37-46
        { x: 4, y: 10 }, { x: 4, y: 9 }, { x: 4, y: 8 }, { x: 4, y: 7 }, { x: 4, y: 6 }, { x: 3, y: 6 }, { x: 2, y: 6 }, { x: 1, y: 6 }, { x: 0, y: 6 }, { x: 0, y: 5 },   // 47-56
        { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 },     // 57-60 red end
        { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 4 },     // 61-64 blue end
        { x: 9, y: 5 }, { x: 8, y: 5 }, { x: 7, y: 5 }, { x: 6, y: 5 },     // 65-68 green end
        { x: 5, y: 9 }, { x: 5, y: 8 }, { x: 5, y: 7 }, { x: 5, y: 6 },     // 69-72 yellow end
    ],
    playerDivs: [],
    get: function () {
        let xhttp = new XMLHttpRequest()
        xhttp.open("POST", "/get", true)

        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let ob = JSON.parse(this.responseText)
                console.log(ob)
                if (ob.end) {
                    clearInterval(players.checkingInterval)
                    let baner = document.getElementById("winnerBaner")
                    baner.style.display = "flex"
                    if (ob.winner == ob.user.color) {
                        baner.innerText = "Gratulacje " + ob.user.nick + " wygrałeś!"
                    } else {
                        baner.innerText = "Wygrał gracz " + ob.winner
                    }
                    console.log(ob.winner);
                } else {
                    let timers = document.getElementsByClassName("timer")
                    for (let i = 0; i < ob.game.players.length; i++) {
                        if (ob.game.players[i].status == 3) {
                            timers[i].style.display = "inline"
                            let thinkTime = Math.round(((new Date().getTime()) - ob.game.players[i].time) / 1000)
                            timers[i].innerText = 20 - thinkTime
                        } else {
                            timers[i].style.display = "none"
                        }
                    }
                    let kostka = document.getElementById("kostka")
                    if (ob.user.status == 3 && ob.user.diceValue == 0) {
                        kostka.style.display = "inline-block"
                        document.getElementById("diceValue").style.display = "none"
                        document.getElementById("skip").style.display = "none"
                    } else {
                        kostka.style.display = "none"
                    }

                    let checkers = document.getElementsByClassName("myChecker")
                    for (let i = 0; i < checkers.length; i++) {
                        checkers[i].style.backgroundColor = ob.user.color
                        checkers[i].style.top = game.board[ob.user.checkers[i] - 1].y * 50 + "px"
                        checkers[i].style.left = game.board[ob.user.checkers[i] - 1].x * 50 + "px"
                    }

                    game.zmianaPionkow(ob)
                }
            }
        }

        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        xhttp.send()
    },
    rzut: function () {
        let xhttp = new XMLHttpRequest()
        xhttp.open("POST", "/rzut", true)

        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let ob = JSON.parse(this.responseText)
                let kostka = document.getElementById("kostka")
                kostka.style.display = "none"
                document.getElementById("skip").style.display = "inline-block"
                let value = document.getElementById("diceValue")
                value.style.display = "inline-block"
                value.src = "./kostka/" + ob.number + ".png"
                game.synthVoice.speechElement.text = ob.number
                game.synthVoice.synth.speak(game.synthVoice.speechElement)
            }
        }

        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        xhttp.send()
    },
    skip: function () {
        let xhttp = new XMLHttpRequest()
        xhttp.open("POST", "/ruch", true)

        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("skip").style.display = "none"
            }
        }

        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        xhttp.send("skipMove=true")
    },
    ruch: function (checker) {
        let xhttp = new XMLHttpRequest()
        xhttp.open("POST", "/ruch", true)

        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let ob = JSON.parse(this.responseText)
                if (ob.user.diceValue == 0)
                    document.getElementById("skip").style.display = "none"
            }
        }

        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        xhttp.send("checker=" + checker)
    },
    zmianaPionkow: function (ob) {
        for (let i = 0; i < ob.game.players.length; i++) {
            if (ob.game.players[i].uid != ob.user.uid) {
                for (let j = 0; j < ob.game.players[i].checkers.length; j++) {
                    game.checkers[i][j].changePosition(ob.game.players[i].checkers[j])
                }
            }
        }
    }
}