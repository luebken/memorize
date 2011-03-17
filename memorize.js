window.addEventListener("load", function(){
    var playground = document.getElementById('playground');
    var map = createMap();
    var engine = createEngine(map);
    draw(map, engine, playground);

    function createCard(i, j, cardNo, onclickCallback, doc) {
        var card = doc.createElement("td"),
            back = doc.createElement("div"),
            front = doc.createElement("div"),
            hint = doc.createElement("span"),
            backImg = doc.createElement("img"),
            frontImg = doc.createElement("img");

        card.onclick = function() {
            if(this.className == "card flip") {
                this.flipToBack();
            } else {
                this.flipToFront();
            }
            onclickCallback(this);
        }
        card.hit = function() {
            this.onclick = null; // removing previous connected event listener
        };
        card.flipToFront = function() {
            this.className = "card flip";
        }
        card.flipToBack = function() {
            this.className = "card flipback";
        }

        card.setAttribute("cardNo", cardNo);
        card.className = "card";

        back.className = "back";
        hint.appendChild(doc.createTextNode(cardNo));

        back.appendChild(hint);
        backImg.src = "back.jpg";
        back.appendChild(backImg);

        front.className = "front";
        frontImg.src = "img"+ cardNo + ".jpg";
        front.appendChild(frontImg);

        card.appendChild(front);
        card.appendChild(back);

        return card;
    }

    function createMap() {
        var cards = ['1', '1', '2', '2', '3', '3', '4', '4', '5', '5', '6','6', '7', '7' , '8', '8'];
        var map = [];
        for (var i = 0; i < 4; i++) {
            map[i] = [];
            for (var j = 0; j < 4; j++) {
                var r = Math.floor(Math.random() * cards.length);
                map[i][j] = cards.splice(r, 1);
            }
        }
        return map;
    }

    function draw(map, engine, domNode) {
        var doc = domNode.ownerDocument;

        var grid = doc.createElement("table");
        grid.className = "grid";
        domNode.appendChild(grid);

        for (var i = 0; i < map.length; i++) {
            var row = grid.insertRow(i);
            for (var j = 0; j < map[i].length; j++) {
                var card = createCard(i,j, map[i][j], engine.click, doc);
                row.appendChild(card);
            }
        }
    }

    function createEngine(map) {
        var engine = {
            lastClick: null,
            pairsLeft: (map.length * map[0].length) / 2,

            click: function(div) {
                if(this.lastClick) {
                    var sameNodes = div.childNodes[1] === this.lastClick.childNodes[1];
                    if(sameNodes) {
                        this.lastClick = null;
                        return;
                    }
                    var lastValue = div.getAttribute("cardNo");
                    var currentValue = this.lastClick.getAttribute("cardNo");

                    if(lastValue == currentValue) { //hit
                        div.hit();
                        this.lastClick.hit();
                        this.pairsLeft--;
                        if(this.pairsLeft == 0) {
                            alert('Finished! Congrats.');
                        }
                    } else {
                        var last = this.lastClick;
                        setTimeout(function() {
                            last.flipToBack();
                            div.flipToBack();
                        }, 1500);
                    }
                    this.lastClick = null;
                } else {
                    this.lastClick = div;
                }
            }
        }
        return engine;
    }
}, false);
