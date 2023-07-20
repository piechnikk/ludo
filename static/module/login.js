function login() {
    let nick = document.getElementById("nick").value

    if (nick.length > 9 || nick.length < 3) {
        window.alert("Podaj prawidłowy nick (od 3 do 12 znaków)")
    } else {
        let xhttp = new XMLHttpRequest()
        xhttp.open("POST", "/login", true)

        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                window.location = "/"
            }
        }

        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        xhttp.send("nick=" + nick)
    }
}