var express = require("express")
var app = express()
const PORT = 3000

var path = require("path")
var session = require("express-session")
app.use(session({
    secret: 'super-tajny-klucz',
    resave: false,
    saveUninitialized: false,
}))

var bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: true }));

// zmienne
let games = []
let uid = 1
let gid = 0
let colors = ["red", "blue", "green", "yellow"]

// funkcje
function search(uid) {
    let activeGame = false
    for (let i = 0; i < games.length; i++) {
        for (let j = 0; j < games[i].players.length; j++) {
            if (games[i].players[j].uid == uid) {
                activeGame = true
                break
            }
        }
    }
    return activeGame
}
function returnGame(gid) {
    for (let i = 0; i < games.length; i++) {
        if (games[i].gid == gid) {
            return games[i]
        }
    }
}
function returnUser(uid) {
    for (let i = 0; i < games.length; i++) {
        for (let j = 0; j < games[i].players.length; j++) {
            if (games[i].players[j].uid == uid) {
                return games[i].players[j]
            }
        }
    }
}
function nextPlayer(game) {
    game.players[game.activePlayer].status = 2
    game.players[game.activePlayer].diceValue = 0
    if (!!game.players[game.activePlayer].lastActivity && new Date().getTime() - game.players[game.activePlayer].lastActivity >= 30000) {
        // jeśli gracz nie wykazuje aktywności to kończy gre
        game.players[game.activePlayer].status = 4
    }
    if (game.activePlayer == game.players.length - 1) game.activePlayer = 0
    else game.activePlayer++

    game.players[game.activePlayer].status = 3
    //ostatnia aktywność
    if (!game.players[game.activePlayer].lastActivity) {
        game.players[game.activePlayer].lastActivity = new Date().getTime()
    }
    game.players[game.activePlayer].time = new Date().getTime()
}
function isStanding(game, nr, withPlayer) {
    let checkersStanding = false
    for (let i = 0; i < game.players.length; i++) {
        if (game.activePlayer != i || withPlayer) {
            for (let j = 0; j < game.players[i].checkers.length; j++) {
                if (nr == game.players[i].checkers[j]) {
                    if (!checkersStanding) checkersStanding = []
                    checkersStanding.push({ i: i, j: j })
                }
            }
        }
    }
    return checkersStanding
}
function returnGameIndex(gid) {
    for (let i = 0; i < games.length; i++) {
        if (games[i].gid == gid) {
            return i
        }
    }
}

app.get("/", function (req, res) {
    if (!req.session.uid) {
        req.session.uid = uid++
        res.sendFile(path.join(__dirname + "/static/login.html"))
    } else {
        if (search(req.session.uid)) {
            res.sendFile(path.join(__dirname + "/static/index.html"))
        } else if (!req.session.gid) {
            res.sendFile(path.join(__dirname + "/static/login.html"))
        } else {
            res.sendFile(path.join(__dirname + "/static/login.html"))
        }
    }
})

app.post("/login", function (req, res) {
    if (!req.session.uid) {
        res.send()
    } else {
        if (games.length == 0 || games[games.length - 1].status > 0) {
            let random = Math.floor(Math.random() * colors.length)
            gid++
            games.push({
                gid: gid,
                interval: null,
                colors: [...colors],
                status: 0, // 0 - oczekiwanie na graczy, 1 - podczas gry
                players: [{ uid: req.session.uid, nick: req.body.nick, color: colors[random], status: 0, diceValue: 0 }]
            })
            games[games.length - 1].colors.splice(random, 1)
            req.session.gid = gid
            res.send()
        } else {
            let random = Math.floor(Math.random() * games[games.length - 1].colors.length)
            games[games.length - 1].players.push({ uid: req.session.uid, nick: req.body.nick, color: games[games.length - 1].colors[random], status: 0, diceValue: 0 })
            games[games.length - 1].colors.splice(random, 1)
            req.session.gid = gid
            res.send()
        }
    }
})

app.post("/checkPlayers", function (req, res) {
    if (!req.session.uid) {
        res.send()
    } else {
        let user = returnUser(req.session.uid)
        let game = returnGame(req.session.gid)
        // gotowość
        if (game.status == 0) {
            if (req.body.game_now == "true") user.status = 1
            else user.status = 0


            let warunek = true //jeśli ktoś jest nie gotowy
            for (let i = 0; i < game.players.length; i++) {
                if (game.players[i].status == 0) warunek = false
            }

            if (game.players.length == 4 || (warunek && game.players.length >= 2)) { //jeśli wszystkie miejsca są zapełnione lub wszyscy są gotowi
                let pomTab = [] //sortowanie po kolorach w jakiej kolejności mają grać
                let kololki = ["red", "blue", "green", "yellow"]
                for (let k = 0; k < kololki.length; k++) {
                    for (let i = 0; i < game.players.length; i++) {
                        if (game.players[i].color == kololki[k]) {
                            game.players[i].status = 2
                            game.players[i].id = i
                            game.players[i].checkers = [1 + (4 * k), 2 + (4 * k), 3 + (4 * k), 4 + (4 * k)]
                            pomTab.push(game.players[i])
                        }
                    }
                }
                game.players = pomTab
                game.players[0].status = 3
                game.players[0].time = new Date().getTime()
                game.activePlayer = 0
                game.status = 1
            }
        }
        res.send({ game: game, user: user, games: games })
    }
})
app.post("/get", function (req, res) {
    if (!req.session.uid) {
        res.send()
    } else {
        let user = returnUser(req.session.uid)
        let game = returnGame(req.session.gid)
        let tru = true
        let xD = game.interval
        if (xD === null) {
            let actualGame = game
            let thinkTimes = 0
            xD = setInterval(function () {
                thinkTimes = Math.round(((new Date().getTime()) - actualGame.players[actualGame.activePlayer].time) / 1000)
                if (thinkTimes >= 20) {
                    nextPlayer(actualGame)
                }
            }, 1000)
        }
        //wykrywanie końca gry
        for (let x = 0; x <= 12; x += 4) {
            let ilePionkow = 0
            for (let i = 57 + x; i <= 60 + x; i++) {
                if (isStanding(game, i, true)) ilePionkow++
            }
            if (ilePionkow == 4) {
                if (user.status == 3) {
                    setTimeout(function () {
                        games.splice(returnGameIndex(req.session.gid), 1)
                    }, 1000)
                }
                res.send({ user: user, end: true, winner: colors[x / 4] })
                tru = false
                break
            }
        }
        if (tru) {
            let thinkTime = Math.round(((new Date().getTime()) - user.time) / 1000)
            res.send({ game: game, user: user, time: thinkTime, end: false })
        }
    }
})

app.post("/rzut", function (req, res) {
    if (!req.session.uid) {
        res.send()
    } else {
        let user = returnUser(req.session.uid)
        let game = returnGame(req.session.gid)

        if (user.status == 3 && user.diceValue == 0) {
            //ostatnia aktuwność
            user.lastActivity = new Date().getTime()

            let randomNumber = Math.ceil(Math.random() * 6)
            user.diceValue = randomNumber
            let warunek = true //sprawdza czy wszystkie pionki są w bazie
            for (let i = 0; i < user.checkers.length; i++) {
                if (user.checkers[i] > 16) {
                    warunek = false
                    break
                }
            }
            if (warunek && user.diceValue != 1 && user.diceValue != 6) {
                nextPlayer(game)
            }
            res.send({ game: game, user: user, number: randomNumber })
        } else res.send()
    }
})

app.post("/ruch", function (req, res) {
    if (!req.session.uid) {
        res.send()
    } else {
        let user = returnUser(req.session.uid)
        let game = returnGame(req.session.gid)
        if (!req.body.skipMove) {
            if (user.status == 3 && user.diceValue != 0) {
                // wychodzenie ze startu
                if (user.checkers[req.body.checker] <= 16) {
                    if (user.diceValue == 1 || user.diceValue == 6) {
                        user.checkers[req.body.checker] = 17 + (10 * colors.indexOf(user.color))

                        if (isStanding(game, user.checkers[req.body.checker], false)) {
                            let brokenCheckers = isStanding(game, user.checkers[req.body.checker], false)
                            for (let i = 0; i < brokenCheckers.length; i++) {
                                game.players[brokenCheckers[i].i].checkers[brokenCheckers[i].j] = (4 * colors.indexOf(game.players[brokenCheckers[i].i].color)) + (brokenCheckers[i].j + 1)
                            }
                        }

                        user.lastActivity = new Date().getTime()
                        nextPlayer(game)
                        res.send({ game: game, user: user })
                    } else {
                        res.send()
                    }
                } // zbliżanie się do zatoczki
                else if (user.color != "red" && user.checkers[req.body.checker] > 10 + (10 * colors.indexOf(user.color)) && user.checkers[req.body.checker] < 17 + (10 * colors.indexOf(user.color))) {
                    if (!(user.checkers[req.body.checker] + user.diceValue > 20 + (10 * colors.indexOf(user.color)))) {
                        if (user.checkers[req.body.checker] + user.diceValue > 16 + (10 * colors.indexOf(user.color))) {
                            let nextPlace = user.checkers[req.body.checker] + user.diceValue - (10 * colors.indexOf(user.color)) + 40 + (4 * colors.indexOf(user.color))
                            if (!isStanding(game, nextPlace, true)) {
                                user.checkers[req.body.checker] = nextPlace

                                user.lastActivity = new Date().getTime()
                                nextPlayer(game)
                                res.send({ game: game, user: user })
                            } else res.send()
                        } else {
                            user.checkers[req.body.checker] += user.diceValue

                            user.lastActivity = new Date().getTime()
                            nextPlayer(game)
                            res.send({ game: game, user: user })
                        }
                    } else res.send()
                } // zbliżanie się do zatoczki dla czerwonego
                else if (user.color == "red" && user.checkers[req.body.checker] > 50 && user.checkers[req.body.checker] < 57) {
                    if (!(user.checkers[req.body.checker] + user.diceValue > 60)) {
                        if (user.checkers[req.body.checker] + user.diceValue > 56) {
                            let nextPlace = user.checkers[req.body.checker] + user.diceValue
                            if (!isStanding(game, nextPlace, true)) {
                                user.checkers[req.body.checker] = nextPlace

                                user.lastActivity = new Date().getTime()
                                nextPlayer(game)
                                res.send({ game: game, user: user })
                            } else res.send()
                        } else {
                            user.checkers[req.body.checker] += user.diceValue

                            user.lastActivity = new Date().getTime()
                            nextPlayer(game)
                            res.send({ game: game, user: user })
                        }
                    } else res.send()
                } // ruchy w zatoczce
                else if (user.checkers[req.body.checker] > 56 + (4 * colors.indexOf(user.color))) {
                    if (!(user.checkers[req.body.checker] + user.diceValue > 60 + (4 * colors.indexOf(user.color)))) {
                        let nextPlace = user.checkers[req.body.checker] + user.diceValue
                        if (!isStanding(game, nextPlace, true)) {
                            user.checkers[req.body.checker] = nextPlace

                            user.lastActivity = new Date().getTime()
                            nextPlayer(game)
                            res.send({ game: game, user: user })
                        } else res.send()
                    } else res.send()
                } //normalne chodzenie 
                else {
                    user.checkers[req.body.checker] += user.diceValue
                    if (user.checkers[req.body.checker] > 56) user.checkers[req.body.checker] -= 40

                    if (isStanding(game, user.checkers[req.body.checker], false)) {
                        let brokenCheckers = isStanding(game, user.checkers[req.body.checker], false)
                        for (let i = 0; i < brokenCheckers.length; i++) {
                            game.players[brokenCheckers[i].i].checkers[brokenCheckers[i].j] = (4 * colors.indexOf(game.players[brokenCheckers[i].i].color)) + (brokenCheckers[i].j + 1)
                        }
                    }

                    user.lastActivity = new Date().getTime()
                    nextPlayer(game)
                    res.send({ game: game, user: user })
                }
            } else res.send()
        } else if (user.status == 3) {
            user.lastActivity = new Date().getTime()
            nextPlayer(game)
            res.send({ game: game, user: user })
        }
    }
})

app.use(express.static('static'))

app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT)
})