const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

const mouse = {
    _x: null,
    _y: null
};
const menu = document.getElementById("menu");
const music = new Audio("so-long-syndrome.ogg");
music.volume = 0.38;
music.setAttribute("loop", "");
const playerSize = 15;
let a = false;
let w = false;
let s = false;
let d = false;
const speed = 4;
let enemiesKilled = 0;
let enemies = [];
const weps = {
    pistol: {damage: 50},
    drone: {damage: 50}
};
let bullets = [];
let particles = [];

window.addEventListener("keydown", e => {
    if(e.key.toLowerCase() == "a") a = true;
    if(e.key.toLowerCase() == "w") w = true;
    if(e.key.toLowerCase() == "s") s = true;
    if(e.key.toLowerCase() == "d") d = true;
});

window.addEventListener("keyup", e => {
    if(e.key.toLowerCase() == "a") a = false;
    if(e.key.toLowerCase() == "w") w = false;
    if(e.key.toLowerCase() == "s") s = false;
    if(e.key.toLowerCase() == "d") d = false;
});

window.addEventListener("mousemove", e => {
    mouse._x = e.clientX;
    mouse._y = e.clientY;
});

function openFullscreen() {
    if(document.getElementsByTagName("html")[0].requestFullscreen) document.getElementsByTagName("html")[0].requestFullscreen();
    else if(document.getElementsByTagName("html")[0].webkitRequestFullscreen) document.getElementsByTagName("html")[0].webkitRequestFullscreen();
    else if(document.getElementsByTagName("html")[0].msRequestFullscreen) document.getElementsByTagName("html")[0].msRequestFullscreen();
}
function tryAgain(){
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    document.getElementById("youLose").style.visibility = "hidden";
    canvas.style.pointerEvents = "auto";
    bullets = [];
    particles = [];
    enemies = [];
    enemiesKilled = 0;
    player._hp = 100;
    player._x = innerWidth/2 - playerSize/2;
    player._y = innerHeight/2 - playerSize/2;
    enemiesInterval = setInterval(newEnemy, 1500);
    animate();
}
function newEnemy(){
    if(enemiesKilled < 5){
        if(Math.random() < 0.5) enemies.push(new BasicEnemy(Math.random() < 0.5 ? 0 - playerSize : canvas.width, Math.random() * canvas.height));
        else enemies.push(new BasicEnemy(Math.random() * canvas.width, Math.random() < 0.5 ? 0 - playerSize : canvas.height));
    } else if(enemiesKilled < 10){
        let randomNum = Math.floor(Math.random() * 2) + 1;
        if(randomNum == 1){
            if(Math.random() < 0.5) enemies.push(new BasicEnemy(Math.random() < 0.5 ? 0 - playerSize : canvas.width, Math.random() * canvas.height));
            else enemies.push(new BasicEnemy(Math.random() * canvas.width, Math.random() < 0.5 ? 0 - playerSize : canvas.height));
        } else{
            if(Math.random() < 0.5) enemies.push(new ShotgunEnemy(Math.random() < 0.5 ? 0 - playerSize : canvas.width, Math.random() * canvas.height));
            else enemies.push(new ShotgunEnemy(Math.random() * canvas.width, Math.random() < 0.5 ? 0 - playerSize : canvas.height));
        }
    } else{
        let randomNum = Math.floor(Math.random() * 3) + 1;
        if(randomNum == 1){
            if(Math.random() < 0.5) enemies.push(new BasicEnemy(Math.random() < 0.5 ? 0 - playerSize : canvas.width, Math.random() * canvas.height));
            else enemies.push(new BasicEnemy(Math.random() * canvas.width, Math.random() < 0.5 ? 0 - playerSize : canvas.height));
        } else if(randomNum == 2){
            if(Math.random() < 0.5) enemies.push(new ShotgunEnemy(Math.random() < 0.5 ? 0 - playerSize : canvas.width, Math.random() * canvas.height));
            else enemies.push(new ShotgunEnemy(Math.random() * canvas.width, Math.random() < 0.5 ? 0 - playerSize : canvas.height));
        } else{
            if(Math.random() < 0.5) enemies.push(new DroneEnemy(Math.random() < 0.5 ? 0 - playerSize : canvas.width, Math.random() * canvas.height));
            else enemies.push(new DroneEnemy(Math.random() * canvas.width, Math.random() < 0.5 ? 0 - playerSize : canvas.height));
        }
    }
}

class Player{
    constructor(x, y){
        this._x = x;
        this._y = y;
        this._angle = 0;
        this._hp = 100;
        this._damage = 50;
        this._color = "white";
        this._target = mouse;
        this._shootSound = new Audio("shoot.wav");
    }

    update(){
        if(a && this._x > speed) this._x -= speed;
        if(w && this._y > speed) this._y -= speed;
        if(s && this._y + playerSize + speed < canvas.height) this._y += speed;
        if(d && this._x + playerSize + speed < canvas.width) this._x += speed;
    }

    draw(){
        this._angle = Math.atan2(this._y + playerSize/2 - this._target._y, this._x + playerSize/2 - this._target._x);
        ctx.save();
        ctx.translate(this._x + playerSize/2, this._y + playerSize/2);
        ctx.rotate(this._angle);
        ctx.fillStyle = this._color;
        ctx.fillRect(-playerSize/2, -playerSize/2, playerSize, playerSize);
        ctx.restore();
    }
}
class Bullet{
    constructor(x, y, angle, teamPlayer, type, color){
        this._x = x;
        this._y = y;
        this._teamPlayer = teamPlayer;
        this._color = color;
        this._type = type;
        this._angle = angle;
        this._bulletSize = 8;
        this._cooldown = 40;
        this._hitSound = new Audio("hit.wav");
        this._hitSound.volume = 0.7;
    }
    update(){
        this._x -= Math.cos(this._angle) * speed * 1.5;
        this._y -= Math.sin(this._angle) * speed * 1.5;
    }
    draw(){
        let _enemy = enemies.filter((item, index) => this._x + this._bulletSize >= item._x && this._x <= item._x + playerSize && this._y + this._bulletSize >= item._y && this._y <= item._y + playerSize)[0];
        if(_enemy != undefined && this._teamPlayer){
            _enemy._hp -= weps[this._type].damage;
            this._hitSound.play();
            bullets.splice(bullets.indexOf(this), 1);
        } else if(this._x + this._bulletSize >= player._x && this._x <= player._x + playerSize && this._y + this._bulletSize >= player._y && this._y <= player._y + playerSize && !this._teamPlayer){
            player._hp -= 20;
            this._hitSound.play();
            bullets.splice(bullets.indexOf(this), 1);
        } else if(this._x > canvas.width || this._y > canvas.height || this._x < 0 || this._y < 0){
            bullets.splice(bullets.indexOf(this), 1);
        } else{
            ctx.save();
            ctx.translate(this._x + this._bulletSize/2, this._y + this._bulletSize/2);
            ctx.rotate(this._angle);
            ctx.fillStyle = this._color;
            ctx.fillRect(-this._bulletSize/2, -this._bulletSize/2, this._bulletSize, this._bulletSize);
            if(this._type == "drone"){
                if(this._cooldown == 0) {
                    bullets.push(new Bullet(this._x, this._y, Math.atan2(this._y + this._bulletSize/2 - player._y, this._x + this._bulletSize/2 - player._x), false, "pistol", "blue"));
                    this._cooldown = 40;
                }
            }
            ctx.restore();
            if(this._cooldown != 0) this._cooldown--;
        }
    }
}
class Enemy extends Player{
    constructor(x, y){
        super(x, y);
        this._target = player;
        this._shootCooldown = 50;
        this._damage = 20;
        this._dieSound = new Audio("die.wav");;
    }
    update(){
        let _randomNum = Math.random() - .5;
        this._x -= Math.cos(this._angle + _randomNum) * speed * .7;
        this._y -= Math.sin(this._angle + _randomNum) * speed * .7;
        this._shootCooldown--;
        if(this._shootCooldown == 0){
            this.shoot();
            this._shootCooldown = 50;
        }
        if(this._hp <= 0) {
            this._dieSound.play();
            for(var i = 0; i < 12; i++) particles.push(new Explosion(this._x + playerSize/2, this._y + playerSize/2, this._color));
            enemiesKilled++;
            enemies.splice(enemies.indexOf(this), 1);
        }
    }
}
class BasicEnemy extends Enemy{
    constructor(x, y){
        super(x, y);
        this._color = "red";
    }
    shoot(){
        this._shootSound.currentTime = 0;
        this._shootSound.play();
        bullets.push(new Bullet(this._x + 3.5, this._y + 3.5, Math.atan2(this._y + playerSize/2 - player._y, this._x + playerSize/2 - player._x), false, "pistol", this._color));
    }
}
class ShotgunEnemy extends Enemy{
    constructor(x, y){
        super(x, y);
        this._color = "yellow";
    }
    shoot(){
        this._shootSound.currentTime = 0;
        this._shootSound.play();
        for(var i = 0; i < 4; i++){
            let randomNum = Math.random() * 56 - 28;
            bullets.push(new Bullet(this._x + 3.5, this._y + 3.5, Math.atan2(this._y + playerSize/2 - player._y - randomNum, this._x + playerSize/2 - player._x - randomNum), false, "pistol", this._color));
        }
    }
}
class DroneEnemy extends Enemy{
    constructor(x, y){
        super(x, y);
        this._color = "blue";
    }
    shoot(){
        this._shootSound.currentTime = 0;
        this._shootSound.play();
        bullets.push(new Bullet(this._x + 3.5, this._y + 3.5, Math.atan2(this._y + playerSize/2 - player._y, this._x + playerSize/2 - player._x), false, "drone", this._color));
    }
}
class Explosion{
    constructor(x, y, color){
        this._x = x;
        this._y = y;
        this._color = color;
        this._speed = Math.random() * speed;
        this._angle = Math.random() * Math.PI * 2;
        this._size = Math.random() * 5 + 2;
        this._edge = 20;
    }
    update(){
        this._x -= Math.cos(this._angle) * this._speed;
        this._y -= Math.sin(this._angle) * this._speed;
    }
    draw(){
        ctx.save();
        ctx.translate(this._x + this._size/2, this._y + this._size/2);
        ctx.rotate(this._angle);
        ctx.fillStyle = this._color;
        ctx.fillRect(-this._size/2, -this._size/2, this._size, this._size);
        ctx.restore();
        this._edge--;
        if(this._edge == 0) particles.splice(particles.indexOf(this), 1);
    }
}

window.addEventListener("resize", _ => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});
const player = new Player(innerWidth/2 - playerSize/2, innerHeight/2 - playerSize/2);
function animate(){
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.update();
    player.draw();
    for(var i = 0; i < bullets.length; i++){
        bullets[i].update();
        bullets[i].draw();
    }
    for(var i = 0; i < enemies.length; i++){
        enemies[i].update();
        if(enemies[i] != undefined) enemies[i].draw();
    }
    for(var i = 0; i < particles.length; i++){
        particles[i].update();
        particles[i].draw();
    }
    if(player._hp <= 0){
        canvas.style.pointerEvents = "none";
        document.getElementById("enemiesDestroyed").innerHTML = enemiesKilled;
        document.getElementById("youLose").style.visibility = "visible";
        clearInterval(enemiesInterval);
    } else requestAnimationFrame(animate);
}
document.getElementById("play").addEventListener("click", function(){
    animate();
    enemiesInterval = setInterval(newEnemy, 1500);
    menu.style.visibility = 'hidden';
    document.querySelector("footer").style.visibility = 'hidden';
    document.getElementById("info").style.visibility = 'hidden';
    music.play();
    openFullscreen();

    canvas.addEventListener("click", e => {
        player._shootSound.currentTime = 0;
        player._shootSound.play();
        bullets.push(new Bullet(player._x + 3.5, player._y + 3.5, Math.atan2(player._y + playerSize/2 - e.clientY, player._x + playerSize/2 - e.clientX), true, "pistol", "white"));
    });

});
document.getElementById("tryAgain").addEventListener("click", tryAgain);