(function() {
    var canvas = document.getElementById('canvas');
    canvas.width = 320;
    canvas.height = 420;
    var gamePaused = false,
        score = 0,
        longpress = 0.9,
        longJump = false,
        hiscore = 0,
        gameTimer = 0,
        enemyTimer = 0,
        touching = false,
        moueDownVal = false,
        jumpVal = 2,
        ctx = canvas.getContext('2d'),
        allSpriteArray = [],
        allEnemyArray = [],
        mySprite = {
            x: 20,
            y: 20,
            width: 10,
            height: 10,
            speed: 0.5,
            color: '#c00',
            intersects: function(otherObject) {
                return !(otherObject.x > (this.x + this.width) || (otherObject.x + otherObject.width) < this.x || otherObject.y > (this.y + this.height) || (otherObject.y + otherObject.height) < this.y);
            }
        },
        myBG = {
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height,
            color: '#ccc'
        },
        myPlateform = {
            x: 0,
            y: canvas.height - 10,
            width: canvas.width,
            height: 10,
            color: '#222'
        },
        keysDown = {},
        time = Date.now(),
        jump = function() {
            if (touching) {
                touching = false;
                jumpVal = -6;
                longJump = true;
            }
            if (longJump) {
                longpress = 1.1;
                if (jumpVal < -8) {
                    longpress = 0.0;
                    jumpVal = -8;
                    longJump = false;
                } else {
                    jumpVal *= longpress;
                }
            }
        },
        gameOver = function() {
            gamePaused = true;
            allEnemyArray = [];
            allSpriteArray = [];
            clearInterval(gameTimer);
            clearTimeout(enemyTimer);
        },
        update = function(mod) {
            if (38 in keysDown) {
                jump();
            }
            jumpVal += mySprite.speed;
            if (jumpVal > 15) {
                jumpVal = 15;
            }
            if ((mySprite.y + jumpVal) > canvas.height - 20) {
                touching = true;
                mySprite.y = canvas.height - 20;
            } else if (!touching) {
                mySprite.y += jumpVal;
            }
            for (var i = allEnemyArray.length - 1; i >= 0; i--) {
                var enemy = allEnemyArray[i];
                enemy.x -= enemy.speed * mod;
                if (mySprite.intersects(enemy)) {
                    gameOver();
                }
                if (enemy.x < 0) {
                    score++;
                    removeFromArray(enemy, allSpriteArray);
                    removeFromArray(enemy, allEnemyArray);
                }
            }
        },
        makeEnemy = function() {
            var startXpos = canvas.width,
                height = (Math.random() * 50) + 10,
                enemy = {
                    x: startXpos,
                    y: canvas.height - 10 - height,
                    width: 10,
                    height: height,
                    speed: 200,
                    color: '#c00'
                };

            allEnemyArray.push(enemy);
            allSpriteArray.push(enemy);

            if (!gamePaused) {
                enemyTimer = setTimeout(makeEnemy, (1000 * Math.random()) + 200);
            }
        },
        createSprite = function(sprite) {
            ctx.fillStyle = sprite.color;
            ctx.fillRect(sprite.x, sprite.y, sprite.width, sprite.height);
        },
        render = function() {
            if (!gamePaused) {
                var length = allSpriteArray.length,
                    i = 0;
                for (i = 0; i < length; i++) {
                    createSprite(allSpriteArray[i]);
                }
                ctx.font = "10px Arial";
                ctx.fillText("Score :" + score + " : Hi : " + hiscore, 10, 50);
            }else{
                ctx.font = "10px Arial";
                ctx.fillText("GameOver Press spacebar or", 100, 50);
                ctx.fillText("Mouse-click to restart", 100, 70);
            }
        },
        run = function() {
            update((Date.now() - time) / 1000);
            render();
            time = Date.now();
            if (moueDownVal) {
                jump();
            }
        },
        initMyGame = function() {
            allSpriteArray.push(myBG);
            allSpriteArray.push(myPlateform);
            allSpriteArray.push(mySprite);
            makeEnemy();
            if (score > hiscore) {
                hiscore = score;
            }
            score = 0;
            jumpVal = 2;
            gameTimer = setInterval(run, 10);
        },
        removeFromArray = function(obj, arr) {
            return arr.splice(arr.indexOf(obj), 1);
        };
    window.addEventListener('keydown', function(e) {
        if (gamePaused && (e.keyCode === 32)) {
            gamePaused = false;
            initMyGame();
        } else {
            keysDown[e.keyCode] = true;
        }
    });
    window.addEventListener('mousedown', function() {
        if (gamePaused) {
            gamePaused = false;
            initMyGame();
        } else {
            moueDownVal = true;
        }
    });
    window.addEventListener('mouseup', function() {
        longpress = 1.0;
        longJump = false;
        moueDownVal = false;
    });
    window.addEventListener('keyup', function(e) {
        longpress = 1.0;
        longJump = false;
        delete keysDown[e.keyCode];
    });
    initMyGame();
})();
