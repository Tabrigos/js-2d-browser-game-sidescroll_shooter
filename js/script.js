window.addEventListener('load', function () {
    //canvas setup
    const canvas = this.document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');

    canvas.width = 700;
    canvas.height = 700;

    const up = 'w'
    const down = 's'

    class InputHandler {
        constructor(game) {
            this.game = game;
            window.addEventListener('keydown', e => {
                if (((e.key === up) ||
                    (e.key === down) ||
                    (e.key === ' ')
                ) && this.game.keys.indexOf(e.key) === -1) {
                    this.game.keys.push(e.key);
                }
            });
            window.addEventListener('keyup', e => {
                if (this.game.keys.indexOf(e.key) > -1) {
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
            });
        }
    }

    class Projectile {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 3;
            this.markedForDeletion = false;
        }
        update() {
            this.x += this.speed;
            if (this.x > game.width * 0.8) {
                this.markedForDeletion = true;
            }
        }
        draw(context) {
            context.fillStyle = 'yellow';
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    class Particle {

    }

    class Player {
        constructor(game) {
            this.game = game;
            this.width = 61;
            this.height = 67;
            this.x = 50;
            this.y = 350;
            this.speedY = 0;
            this.maxSpeed = 4;
            this.projectiles = [];
            this.fireTimer = 0;
            this.fireRate = 150;
            this.image = document.getElementById("player");
            this.shootFrom = true
        }
        update(deltaTime) {
            if (this.game.keys.includes(up) && this.y > 0) {
                this.speedY = -this.maxSpeed;
            } else if (this.game.keys.includes(down) && this.y < canvas.height - this.height) {
                this.speedY = this.maxSpeed;
            } else this.speedY = 0;
            this.y += this.speedY;
            if (this.game.keys.includes(' ')) {
                if (this.fireTimer > this.fireRate) {
                    this.game.player.shoot();
                    this.fireTimer = 0;
                } else {
                    this.fireTimer += deltaTime;
                }
            }
            // handle projetiles
            this.projectiles.forEach(projectile => {
                projectile.update();
            });
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
        }
        draw(context) {

            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
        }
        shoot() {
            if (this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + this.width, this.y - 1.5 + (this.shootFrom ? this.height / 6 * 1.8 : this.height / 6 * 4.2)));
                this.shootFrom = this.shootFrom ? false : true
                this.game.ammo--;
            }
        }
    }

    class Enemy {
        constructor(game) {
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 - 0.5;
            this.markedForDeletion = false;
            this.lives = 5;
            this.score = this.lives;
            this.image = document.getElementById("enemy");
        }
        update() {
            this.x += this.speedX;
            if (this.x + this.width < 0) {
                this.markedForDeletion = true;
            }
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.fillStyle = 'black';
            context.font = '20px Segoe Script';
            context.fillText(this.lives, this.x, this.y);
        }
    }

    class Angler1 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 300 * 0.2;
            this.height = 220 * 0.2;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
        }
    }

    class Layer {

    }

    class Background {

    }

    class UI {
        constructor(game) {
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Segoe Script';
            this.color = 'white';
        }
        draw(context) {
            context.save();
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            context.font = this.fontSize + 'px ' + this.fontFamily;
            //score
            context.fillText('Score: ' + this.game.score, 20, 40);
            //ammo
            for (let i = 0; i < this.game.ammo; i++) {
                context.fillRect(20 + 5 * i, 50, 3, 20);
            }
            //timer on screen
            const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
            context.fillText('Timer: ' + formattedTime, 20, 100);
            //game over messages
            if (this.game.gameOver) {
                context.textAlign = 'center';
                let message1;
                let message2;
                if (this.game.score >= this.game.winningScore) {
                    message1 = 'Hai Vinto!';
                    message2 = 'Ben fatto!';
                } else {
                    message1 = 'Hai Perso!';
                    message2 = 'Riprova';
                }
                context.font = '50px ' + this.fontFamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 40);
                context.font = '25px ' + this.fontFamily;
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 40);

            }
            context.restore();
        }

    }

    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = [];
            this.enemies = [];
            this.gameOver = false;
            this.ammo = 40;
            this.maxAmmo = 70;
            this.ammoTimer = 0;
            this.ammoInterval = 450;
            this.enemyTimer = 0;
            this.enemyInterval = 1500;
            this.score = 0;
            this.winningScore = 50;
            this.gameTime = 0;
            this.timeLimit = 60000;
        }
        update(deltaTime) {
            if (!this.gameOver) {
                this.gameTime += deltaTime;
            }
            if (this.gameTime > this.timeLimit) {
                this.gameOver = true;
            }
            this.player.update(deltaTime);
            if (this.ammoTimer > this.ammoInterval) {
                if (this.ammo < this.maxAmmo) {
                    this.ammo++;
                    this.ammoTimer = 0;
                }
            } else {

                this.ammoTimer += deltaTime;
            }
            this.enemies.forEach(enemy => {
                enemy.update();
                if (this.checkCollision(this.player, enemy)) {
                    enemy.markedForDeletion = true;
                }
                this.player.projectiles.forEach(projectile => {
                    if (this.checkCollision(projectile, enemy)) {
                        enemy.lives--;
                        projectile.markedForDeletion = true;
                        if (enemy.lives <= 0) {
                            enemy.markedForDeletion = true;
                            if (!this.gameOver) {
                                this.score += enemy.score;
                            }
                            if (this.score >= this.winningScore) {
                                this.gameOver = true;
                            }
                        }
                    }
                });
            });
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }
        }
        draw(context) {
            this.player.draw(context);
            this.ui.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
        }
        addEnemy() {
            this.enemies.push(new Angler1(this));
        }
        checkCollision(rect1, rect2) {
            return (rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.height + rect1.y > rect2.y
            );
        }
    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;
    //animation loop
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }

    animate(0);

});