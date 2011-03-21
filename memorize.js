var memorize = {
    containerClassName: "memorize",
    initFunctions: [],
    initFuncArguments: [],
    images: null,

    init: function(domNode, cols, rows) {
        this.domNode = domNode;
        this.numCols = cols;
        this.numRows = rows;

        domNode.innerHTML = "";
        domNode.className = this.containerClassName + " loading";

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

        // add Loading message
        var loadingMsg = doc.createElement("p");
        loadingMsg.className = "loading-message";
        loadingMsg.appendChild(doc.createTextNode("Loading \u2026"));
        domNode.appendChild(loadingMsg);

        // register image fetching function
        this.addInitFunc(this.getImages, [rows * cols]);

        // call initialization functions
        var initFunctions = this.initFunctions;
        var initFuncArguments = this.initFuncArguments;
        for (var i = 0, initFunc; (initFunc = initFunctions[i]); i++) {
            initFunc.apply(null, initFuncArguments[i]);
        }
    },


    // ----------------------------------- initialization function registration

    addInitFunc: function(initFunc, args) {
        var initFunctions = this.initFunctions;
        if (initFunctions.indexOf(initFunc) === -1) {
            initFunctions.push(initFunc);
            this.initFuncArguments.push(args);
        }
    },

    initFuncDone: function(initFunc) {
        var initFunctions = this.initFunctions;
        var index = initFunctions.indexOf(initFunc);

        if (index !== -1) {
            initFunctions.splice(index, 1);
            this.initFuncArguments.splice(index, 1);

            if (this.isReady()) {
                this.domNode.className = this.containerClassName;
                this.buildGame();
            }
        }
    },

    isReady: function() {
        return this.initFunctions.length === 0;
    },

    // ---------------------------------------------------------- game building

    buildGame: function() {
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
                        if(this.pairsLeft == 0) {
                            alert('Finished! Congrats.');
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
                var card = this.createCard(i,j, map[i][j], engine.click);
                cells[j].appendChild(card);
            }
        }

        //domNode.innerHTML = "";
        //domNode.appendChild(grid);

        /*
            To prevent iPhone 3g (iOS 3.1.3) from crashing, we need to insert
            the dom nodes, wait for the repaint, and apply perspective after
            that.
        */
        //setTimeout(function(){
        //    grid.className += " hw-accell";
        //}, 1);
    },

    createCard: function(i, j, cardNo, onclickCallback) {
        var doc = this.domNode.ownerDocument,
            card = doc.createElement("div"),
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
    },

    //
    getImages: function getImages(numImages) {
        var images = [];
        for (; numImages; numImages--) {
            images.unshift("img" + numImages + ".jpg");
        }

        memorize.images = images;
        memorize.initFuncDone(getImages);
    },
};

window.addEventListener("load", function() {
    memorize.init(document.getElementById('playground'), 4, 4);
}, false);

window.addEventListener("load", function(){
    return;
    var playground = document.getElementById('playground');
    var map = createMap();
    var engine = createEngine(map);
    draw(map, engine, playground);

    function createCard(i, j, cardNo, onclickCallback, doc) {
        var card = doc.createElement("div"),
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

        for (var i = 0; i < map.length; i++) {
            var row = grid.insertRow(i);
            for (var j = 0; j < map[i].length; j++) {
                var card = createCard(i,j, map[i][j], engine.click, doc);
                row.insertCell(j).appendChild(card);
            }
        }

        domNode.appendChild(grid);
        /*
            To prevent iPhone 3g (iOS 3.1.3) from crashing, we need to insert
            the dom nodes, wait for the repaint, and apply perspective after
            that.
        */
        setTimeout(function(){
            grid.className += " hw-accell";
        }, 1);
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
