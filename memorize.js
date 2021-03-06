var memorize = {
    containerClassName: "memorize",
    numPendingInitFuncs: 0,
    init: function(domNode, cols, rows, finishCallback) {
        this.domNode = domNode;
        this.numCols = cols;
        this.numRows = rows;
        this.finishCallback = finishCallback;

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
        loadingMsg.appendChild(doc.createTextNode("Loading\u2026"));
        domNode.appendChild(loadingMsg);

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
        // this.buildGame();

        // async initialization, give time to register init functions
        this.isInitialized = true;
        this.addInitFunc(function(doneCallback){
            // nothing to do, singalize "ready to go"
            doneCallback();
        });
    },


    // ----------------------------------- initialization function registration

    addInitFunc: function(initFunc, args) {
        this.numPendingInitFuncs += 1;

        args = args || [];
        // last parameter is a "done" callback that is to be fired when the
        // init code is done
        args.push(function() {
            memorize.initFuncDone();
        });

        setTimeout(function() {
            initFunc.apply(null, args);
        }, 0);
    },

    initFuncDone: function() {
        this.numPendingInitFuncs -= 1;
        if (this.isReady()) {
            this.buildGame();
        }
    },

    isReady: function() {
        return this.isInitialized && this.numPendingInitFuncs === 0;
    },

    // ---------------------------------------------------------- game building

    buildGame: function() {
        // remove "loading" class
        this.domNode.className = this.containerClassName;

        // truncate number of images if too many
        this.images.length = this.numRows * this.numCols / 2;

        var map = this.createMap(this.numCols, this.numRows);
        var engine = this.createEngine(map);
        this.draw(engine, this._domNode);
        timer.start();
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
        
        card["ontouchstart" in document ? "ontouchstart" : "onclick"] = function() {
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
            this.className = "card";
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

var timer = {
    start : function () {
        this.startTime = new Date().getTime();
        this.intervalID = setInterval(this.updateDisplay, 1000);
    },
    stop : function () {
        clearInterval(this.intervalID);
    },
    current: function () {
        var diff = new Date(new Date().getTime() - this.startTime);
        var secs = diff.getSeconds() + "";
        if(secs.length < 2) {
            secs = "0" + secs;
        }
        return diff.getMinutes() + ":" + secs;
    },
    updateDisplay : function () {
        document.getElementById('timer').innerHTML = timer.current();
    }
}

var numRows = 4;
var numCols = 4;

window.addEventListener("load", function() {
    var finalize = function () {
        alert('Congratulations you finished in ' + timer.current());
        timer.stop();
    }
    memorize.init(document.getElementById('playground'), numCols, numRows, finalize);
}, false);

var helper = {
    _jsonpId:0,
    _cb:{},
    jsonp: function(url, success, error, callbackParamName){
        /* Simple helper for doing jsonp calls */
        if(! (url && success)){
            return;
        }
        var script = document.createElement("script"),
            callbackParamName = callbackParamName ? callbackParamName : "callback",
            callbackFuncName = '_jsonp'+this._jsonpId++,
            urlAddon = url.indexOf("?")>-1 ? '&' : '?',
            urlAddon = urlAddon + callbackParamName + "=" + "helper._cb." + callbackFuncName;
        this._cb[callbackFuncName] = function(data){
            success(data);
        }
        script.src = url + urlAddon;
        if(error && typeof(error) == "function"){
            script.addEventListener("error", error, true);
        }
        (document.body || document.documentElement).appendChild(script);
    }
}

// Functions for localStorage
var storage = {
    supportsLocalStorage: (function(){
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
          } catch(e){
            return false;
          }
    })(),
    saveImages: function(){
        if(!this.supportsLocalStorage) return;
        localStorage.clear();
        for(var i=0,l=memorize.images.length;i<l;i++){
            localStorage.setItem("image"+i, memorize.images[i]);
        }
    },
    loadImages: function() {
        if(!this.supportsLocalStorage) return;
        for(var i=0,l=localStorage.length;i<l;i++){
            var key = localStorage.key(i),
                value = localStorage.getItem(key);
            if(key.indexOf("image") > -1){
                memorize.images[key.substring(5)] = value;
            }
        }
    }
}

// Get geolocation if available
function getImagesFromFlickrForCity(location, doneCallback) {
    getImagesFromFlickr('text = "' + location + '" and accuracy = 10', doneCallback);
}

function getImagesFromFlickrForGeopos(lat, lon, doneCallback) {
    lat = lat.toFixed(4);
    lon = lon.toFixed(4);
    var query = "place_id in (select place.place_id from flickr.places where lat=" + lat + " and lon=" + lon + ") and accuracy = 6";
    getImagesFromFlickr(query, doneCallback);
}

function getImagesFromFlickr(query, doneCallback) {
    var yqlUrl = "http://query.yahooapis.com/v1/public/yql?format=json&q=";
    query = "select * from flickr.photos.search(" + parseInt(numCols*numRows/2) + ") where " + query + ' and sort = "interestingness-desc"';
    helper.jsonp(yqlUrl + encodeURIComponent(query), yqlFlickrCallback, function(){
        // when an error occurs, we gonna try to get the images from our storage
        storage.loadImages();
    });
    yqlFlickrCallback._doneCallback = doneCallback;
}

function yqlFlickrCallback(json) {
    var flickrImages = json.query.results.photo; // not failsafe!
    var images = memorize.images = [];
    for (var i = 0, image; (image = flickrImages[i]); i++) {
        flickr_image = "http://farm" + image.farm +
            ".static.flickr.com/" + image.server + "/" +
            image.id + "_" + image.secret + "_t.jpg";
        // append images as data-url (being able to save remote images to localstorage)
        helper.jsonp(
            'http://img-to-json.appspot.com/?url='+flickr_image,
            function(j){ return function(imgData){
                images[j] = imgData.data;
                if(memorize.images.length == i){
                    storage.saveImages();
                    yqlFlickrCallback._doneCallback();
                }
            }}(i)
        );
        //images[i] = flickr_image;
    }
    //yqlFlickrCallback._doneCallback();
}

memorize.addInitFunc(function(doneCallback) {
    function noGeo() {
        if (console) { console.log("no geo"); }
        getImagesFromFlickrForCity("M\u00fcnchen", doneCallback);
    }

    function hasGeo(pos) {
        if (console) { console.log("has geo"); }
        var coords = pos.coords;
        getImagesFromFlickrForGeopos(coords.latitude, coords.longitude, doneCallback);
    }

    if (navigator.geolocation && navigator.geolocation.getCurrentPosition) {
        navigator.geolocation.getCurrentPosition(hasGeo, noGeo, {timeout: 10000});
    } else {
        noGeo();
    }
});
