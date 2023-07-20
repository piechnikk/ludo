import { players, game } from './module/top.js'
import { Pole } from './module/klasy.js'

document.body.addEventListener("load", players.load())
document.getElementById("kostka").addEventListener("click", game.rzut)
document.getElementById("skip").addEventListener("click", game.skip)


let pola = []
for (let i = 0; i < 72; i++) {
    pola.push(new Pole(i))
}


window.addEventListener('DOMContentLoaded', (event) => {
    let checkers = document.getElementsByClassName("checker")
    for (let i = 0; i < checkers.length; i++) {
        checkers[i].addEventListener("click", function () {
            game.ruch(i)
        })
    }

    game.synthVoice.populteVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = game.synthVoice.populteVoiceList;
    }
})
