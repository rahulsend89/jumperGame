(function() {
    var canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var gamePaused = false,
        score = 0,
        plateformConst = 200,
        enemyHeightConst = 100,
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
            scale: {
                x: 2.0,
                y: 3.0
            },
            anchorpoint: {
                x: 0.0,
                y: 0.0
            },
            width: 10,
            height: 10,
            speed: 0.5,
            color: '#c00',
            intersects: function(otherObject) {
                return !(getRect(otherObject).x > (getRect(this).x + getRect(this).width) || (getRect(otherObject).x + getRect(otherObject).width) < getRect(this).x || getRect(otherObject).y > (getRect(this).y + getRect(this).height) || (getRect(otherObject).y + getRect(otherObject).height) < getRect(this).y);
            },
            groupSprite: [{
                x: 2,
                y: 2,
                width: 2,
                height: 2,
                color: '#fcf'
            }, {
                x: 6,
                y: 2,
                width: 2,
                height: 2,
                color: '#fcf'
            }, {
                x: 3,
                y: 6,
                width: 4,
                height: 2,
                color: '#fcf'
            }]
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
            y: canvas.height - plateformConst,
            width: canvas.width,
            height: plateformConst,
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
        createSprite = function(sprite) {
            ctx.fillStyle = sprite.color;
            ctx.fillRect(getRect(sprite).x, getRect(sprite).y, getRect(sprite).width, getRect(sprite).height);
        },
        groupSprite = function(parentSprite, sprite) {
            ctx.fillStyle = sprite.color;
            var scale = {
                x: 1.0,
                y: 1.0
            };
            if (sprite.scale !== undefined) {
                scale = sprite.scale;
            } else {
                sprite.scale = {
                    x: 1.0,
                    y: 1.0
                };
            }
            if (parentSprite.scale !== undefined) {
                scale = {
                    x: parentSprite.scale.x * sprite.scale.x,
                    y: parentSprite.scale.y * sprite.scale.y
                };
            } else {
                parentSprite.scale = {
                    x: 1.0,
                    y: 1.0
                };
            }
            ctx.fillRect(parentSprite.x + sprite.x * scale.x, parentSprite.y + sprite.y * scale.y, sprite.width * scale.x, sprite.height * scale.y);
        },
        getRect = function(sprite) {
            var anchorpoint = {
                    x: 0.0,
                    y: 0.0
                },
                scale = {
                    x: 1.0,
                    y: 1.0
                };
            if (sprite.scale !== undefined) {
                scale = sprite.scale;
            }
            if (sprite.anchorpoint !== undefined) {
                anchorpoint = sprite.anchorpoint;
            }
            var width = sprite.width * scale.x,
                height = sprite.height * scale.y;
            return {
                x: sprite.x + (((width) * anchorpoint.x)),
                y: sprite.y - (((height) * anchorpoint.y)),
                width: width,
                height: height
            };
        },
        makeEnemy = function() {
            var startXpos = canvas.width,
                height = 30,
                enemy = {
                    x: startXpos,
                    y: canvas.height - plateformConst,
                    width: 10,
                    height: height,
                    speed: 200,
                    scale: {
                        x: 1.0,
                        y: (Math.random() * 3.0) + 1.0
                    },
                    anchorpoint:{x:0.0,y:1.0},
                    color: '#c00',                    
                };

            allEnemyArray.push(enemy);
            allSpriteArray.push(enemy);

            if (!gamePaused) {
                enemyTimer = setTimeout(makeEnemy, (1000 * Math.random()) + 700);
            }
        },
        render = function() {
            if (!gamePaused) {
                var length = allSpriteArray.length,
                    i = 0;
                for (i = 0; i < length; i++) {
                    createSprite(allSpriteArray[i]);
                    if (allSpriteArray[i].groupSprite !== undefined) {
                        for (var j = allSpriteArray[i].groupSprite.length - 1; j >= 0; j--) {
                            groupSprite(allSpriteArray[i], allSpriteArray[i].groupSprite[j]);
                        }
                    }
                }
                ctx.font = "10px Arial";
                ctx.fillText("Score :" + score + " : Hi : " + hiscore, 10, 50);
            } else {
                ctx.font = "10px Arial";
                ctx.fillText("GameOver Press spacebar or", 100, 50);
                ctx.fillText("Mouse-click to restart", 100, 70);
            }
        },
        update = function(mod) {
            if ((38 in keysDown) || moueDownVal) {
                jump();
            }
            jumpVal += mySprite.speed;
            if (jumpVal > enemyHeightConst / 5) {
                jumpVal = enemyHeightConst / 5;
            }
            if ((getRect(mySprite).y + jumpVal) > canvas.height - getRect(mySprite).height - plateformConst) {
                touching = true;
                mySprite.y = canvas.height - getRect(mySprite).height + (mySprite.y - getRect(mySprite).y) - plateformConst;
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
        run = function() {
            update((Date.now() - time) / 1000);
            render();
            time = Date.now();
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
        gameOver = function() {
            gamePaused = true;
            allEnemyArray = [];
            allSpriteArray = [];
            clearInterval(gameTimer);
            clearTimeout(enemyTimer);
        },
        removeFromArray = function(obj, arr) {
            return arr.splice(arr.indexOf(obj), 1);
        },
        mouseDown = function() {
            if (gamePaused) {
                gamePaused = false;
                initMyGame();
            } else {
                moueDownVal = true;
            }
        },
        mouseUp = function() {
            longpress = 1.0;
            longJump = false;
            moueDownVal = false;
        };
    window.addEventListener('touchend', mouseUp);
    window.addEventListener('touchstart', mouseDown);
    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mouseup', mouseUp);
    window.addEventListener('keydown', function(e) {
        if (gamePaused && (e.keyCode === 32)) {
            gamePaused = false;
            initMyGame();
        } else {
            keysDown[e.keyCode] = true;
        }
    });
    window.addEventListener('keyup', function(e) {
        longpress = 1.0;
        longJump = false;
        delete keysDown[e.keyCode];
    });
    initMyGame();
})();
