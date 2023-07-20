export { Pole, EnemyChecker }
import { game } from './top.js'

var settings = {
    size: 40,
    spacing: 10
}

class EnemyChecker {
    constructor(i, color) {
        this.element = null
        this.x = game.board[i - 1].x
        this.y = game.board[i - 1].y
        this.init(color)
    }
    init(color) {
        let div = document.createElement("div")
        div.classList.add("checker")
        div.style.top = this.y * (settings.size + settings.spacing) + "px"
        div.style.left = this.x * (settings.size + settings.spacing) + "px"
        div.style.backgroundColor = color
        this.element = div
        document.getElementById("board").appendChild(this.element)
    }
    changePosition(i) {
        this.x = game.board[i - 1].x
        this.y = game.board[i - 1].y
        this.element.style.top = this.y * (settings.size + settings.spacing) + "px"
        this.element.style.left = this.x * (settings.size + settings.spacing) + "px"
    }
}

class Pole {
    constructor(i) {
        this.element = null
        this.x = game.board[i].x
        this.y = game.board[i].y
        this.nr = i + 1
        this.init()
    }
    init() {
        let div = document.createElement("div")
        div.classList.add("pole")
        div.style.width = settings.size + "px"
        div.style.height = settings.size + "px"
        div.style.top = this.y * (settings.size + settings.spacing) + "px"
        div.style.left = this.x * (settings.size + settings.spacing) + "px"
        switch (this.nr) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 57:
            case 58:
            case 59:
            case 60:
                div.style.backgroundColor = "lightcoral"
                break;
            case 5:
            case 6:
            case 7:
            case 8:
            case 61:
            case 62:
            case 63:
            case 64:
                div.style.backgroundColor = "lightblue"
                break;
            case 9:
            case 10:
            case 11:
            case 12:
            case 65:
            case 66:
            case 67:
            case 68:
                div.style.backgroundColor = "lightgreen"
                break;
            case 13:
            case 14:
            case 15:
            case 16:
            case 69:
            case 70:
            case 71:
            case 72:
                div.style.backgroundColor = "lightgoldenrodyellow"
                break;
            case 17:
                div.style.backgroundColor = "red"
                break;
            case 27:
                div.style.backgroundColor = "blue"
                break;
            case 37:
                div.style.backgroundColor = "green"
                break;
            case 47:
                div.style.backgroundColor = "yellow"
                break;

        }

        this.element = div
        document.getElementById("board").appendChild(this.element)
    }
}