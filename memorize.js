var memorize = {
    init: function(domNode, cols, rows, finishCallback) {
        this.domNode = domNode;
        this.numCols = cols;
        this.numRows = rows;
        this.finishCallback = finishCallback;

        domNode.innerHTML = "";
        
        // build grid
        var doc = domNode.ownerDocument;
        var grid = this.gridNode = doc.createElement("table");
        grid.className = "grid";
        for (var i = 0; i < rows; i++) {
            var row = grid.insertRow(i);
            for (var j = 0; j < cols; j++) {
                row.insertCell(j);
            }
        }
        domNode.appendChild(grid);

        // calculate image names if not already defined
        var images = this.images;
        if (!images) {
            this.images = images = [];
            var numImages = rows * cols / 2;
            for (; numImages; numImages--) {
                images.unshift("img" + numImages + ".jpg");
            }
        }

        // simple sync initialization
        this.buildGame();
    },

    buildGame: function() {
        // truncate number of images if too many
        this.images.length = this.numRows * this.numCols / 2;

        var map = this.createMap(this.numCols, this.numRows);
        var engine = this.createEngine(map);
        this.draw(engine, this._domNode);
    },

    createMap: function(cols, rows) {
        var numCards = cols * rows / 2;
        var cards = [];
        for (var cardNo = 1; cardNo <= numCards; cardNo++) {
            cards.push(cardNo, cardNo);
        }

        var map = [];
        for (var i = 0; i < rows; i++) {
            map[i] = [];
            for (var j = 0; j < cols; j++) {
                var r = Math.floor(Math.random() * cards.length);
                map[i][j] = cards.splice(r, 1);
            }
        }
        return map;
    },

    createEngine: function(map) {
        var engine = {
            map: map,
            lastClicked: null,
            pairsLeft: (map.length * map[0].length) / 2,

            click: function(card) {
                if(this.lastClicked) {
                    var sameNodes = card === this.lastClicked;
                    if(sameNodes) {
                        this.lastClicked = null;
                        return;
                    }
                    var lastValue = card.getAttribute("cardNo");
                    var currentValue = this.lastClicked.getAttribute("cardNo");

                    if(lastValue == currentValue) { //hit
                        card.hit();
                        this.lastClicked.hit();
                        this.pairsLeft--;
                        if(this.pairsLeft == 0 && memorize.finishCallback) {
                            memorize.finishCallback();
                        }
                    } else {
                        var last = this.lastClicked;
                        setTimeout(function() {
                            last.flipToBack();
                            card.flipToBack();
                        }, 1500);
                    }
                    this.lastClicked = null;
                } else {
                    this.lastClicked = card;
                }
            }
        }

        return engine;
    },

    draw: function(engine, domNode) {
        var map = engine.map;
        var grid = this.gridNode;

        for (var i = 0; i < map.length; i++) {
            var cells = grid.rows[i].cells;
            for (var j = 0; j < map[i].length; j++) {
                var card = this.createCard(i,j, map[i][j], engine.click, engine);
                var cell = cells[j];
                cell.innerHTML = "";
                cell.appendChild(card);
            }
        }
    },

    createCard: function(i, j, cardNo, onclickCallback, engine) {
        var doc = this.domNode.ownerDocument,
            card = doc.createElement("div"),
            back = doc.createElement("div"),
            front = doc.createElement("div"),
            hint = doc.createElement("span");

        card.onclick = function() {
            if(this.className == "card flip") {
                this.flipToBack();
            } else {
                this.flipToFront();
            }
            onclickCallback.call(engine, this);
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

        back.className = "face back";
        hint.appendChild(doc.createTextNode(cardNo));

        back.appendChild(hint);

        front.className = "face front";
        front.style.backgroundImage = "url("+ this.images[cardNo - 1] + ")";

        card.appendChild(front);
        card.appendChild(back);

        return card;
    }
};


window.addEventListener("load", function() {
    var finalize = function () {
        alert('Congratulations!');
    }
    memorize.init(document.getElementById('playground'), 4, 4, finalize);
}, false);
