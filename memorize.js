window.addEventListener("load", function(){
    var playground = document.getElementById('playground');
    var map = createMap();
    var engine = createEngine(map);
    draw(map);
    
    function createCard(i, j, cardnr) {
        var card = document.createElement("div");

        card.onclick = function () {
            if(this.className == "card flip") {
                this.className = "card flipback";
            } else {
                this.className = "card flip";
            }            
            engine.click(this); 
        }
        card.hit = function () {
            console.log("hit")  
            //this.childNodes[0].style.background = "green";
            this.onclick = function() {};
        };
        card.flipback = function () {
            this.className = "card flipback";
        }
        
        card.setAttribute("cardnr", cardnr);
        card.className = "card";
        card.style.left = (i * 70) + "px";
        card.style.top = ((j * 70) + 50) + "px";

        var front = document.createElement("div");
        front.className = "front";
        var hint = document.createElement("span");
        hint.appendChild(document.createTextNode(cardnr));
                        
        front.appendChild(hint);
        var img = document.createElement("img");
        img.src = "back.jpg";
        front.appendChild(img);
        
        var back = document.createElement("div");
        back.className = "back";
        var img2 = document.createElement("img");
        img2.src = "img"+ cardnr + ".jpg";              
        back.appendChild(img2);

        card.appendChild(back);
        card.appendChild(front);
        
        playground.appendChild(card);
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
    
    function draw(map, engine) {
        for (var i = 0; i < map.length; i++) {
            for (var j = 0; j < map[i].length; j++) {
                createCard(i,j, map[i][j], engine);
            }
        }
    }
    
    function createEngine(map) {
        var engine = {
            lastclick: null,
            pairsleft: (map.length * map[0].length) / 2,
            
            click: function(div) {
                if(this.lastclick) {
                    var sameNodes = div.childNodes[1] === this.lastclick.childNodes[1];
                    if(sameNodes) {
                        this.lastclick = null;
                        return;
                    }
                    var lastValue = div.getAttribute("cardnr");
                    var currentValue = this.lastclick.getAttribute("cardnr");
                    
                    if(lastValue == currentValue) { //hit    
                        div.hit();
                        this.lastclick.hit();
                        this.pairsleft--;
                        if(this.pairsleft == 0) {
                            alert('Finished! Congrats.');
                        }
                    } else {
                        var last = this.lastclick;
                        setTimeout(function() {
                            last.flipback();
                            div.flipback();
                        }, 500);
                    }
                    this.lastclick = null; 
                } else {
                    this.lastclick = div; 
                }
            }
        }
        return engine;
    }
}, false);
