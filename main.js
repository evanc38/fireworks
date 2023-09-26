const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const fireworkArray = [];
let radius;
let hue = 0;
let grav = 0.02;
let explodeTime = 0.1;
let dispersionTime = 0.005;
let backgroundTransparency = 0.15;


class Particle {
    constructor(x, y, xdir, ydir, hue, darkness, explodeSpeed, isShoot) {
        this.isShoot = isShoot;
        this.x = x;
        this.y = y;

        if (this.isShoot){
            this.radius = 1.5;
            this.y = canvas.height

            let maximum = 300
            let minimum = -300
            let offset = (Math.floor(Math.random() * (maximum - minimum + 1)) + minimum)
            this.x = x + offset

            this.goalY = y;
            this.goalX = x;
            this.speedY = Math.sqrt(grav * 2 * (canvas.height - y))
            let time = (this.speedY) / (grav)

            this.speedX = (offset / time) * (-1);
            
            
        }else{
            this.radius = (0.1 + Math.random()) * 2;
            this.speedX = xdir;
            this.speedY = ydir;
        }
        
        this.darkness = darkness;
        this.myHue = hue;
        this.color = `hsl(${this.myHue}, 100%, ${this.darkness}%)`;
        this.explodeSpeed = explodeSpeed;
        
    }

    getDarkness(){
        return this.darkness;
    }

    draw() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);

        context.fillStyle = this.color;
        context.fill();
    }

    update() {
        if (this.isShoot){
            if (this.y < this.goalY){
                this.darkness = 0;
                this.isShoot = false;
                return [1, this.goalX, this.goalY];
            }
        }


        this.x += (this.speedX * this.explodeSpeed);
        this.y += -1 * (this.speedY * this.explodeSpeed);

        //Darkness
        if (this.darkness > 0 && this.isShoot == false)
            this.darkness -= 0.5;
            this.color = `hsl(${this.myHue}, 100%, ${this.darkness}%)`;


        //Gravity
        if (this.speedY > -2)
            this.speedY -= grav;

        //x Dispersion
        if (this.isShoot == false){
            if (this.speedX > 0.1)
                this.speedX -= dispersionTime;
            if (this.speedX < -0.1)
                this.speedX += dispersionTime;
        }

        //Explode
        if (this.explodeSpeed > 1)
            this.explodeSpeed -= explodeTime;

        return [0, 0, 0];
    }
}

class Firework{
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.particlesArray = [];
    }

    getParticle(){
        if (this.particlesArray.length > 1) {
            return this.particlesArray[1].getDarkness();
        }else{
            return -1;
        }
            
        
    }

    drawParticles = () => {
        this.particlesArray.forEach((particle) => {
            particle.draw();
        });
    };

    updateParticles = () => {
        hue++;
        this.particlesArray.forEach((particle) => {
            let toDo = particle.update()
            if (toDo[0] == 1){
                switch(Math.floor(Math.random() * (7 - 1 + 1)) + 1){
                    case 1:
                        this.tripletBall(toDo[1], toDo[2])
                        break;
                    case 2:
                        this.doubleBall(toDo[1], toDo[2])
                        break;
                    default:
                        this.regularBall(toDo[1], toDo[2])
                        break;
                }
            };
        });
    };

    regularBall = (x, y) => {
        for (let i = 0; i < 6.28; i += 0.2){
            var variability = 0
            const particle = new Particle(x, y, Math.sin(i + variability), Math.cos(i + variability), hue, 50, 5, false);
            this.particlesArray.push(particle);
        }
    }

    doubleBall = (x, y) => {
        let j = 0;
        for (let i = 0; i < 6.28; i += 0.2){
            j++;
            var variability = 0
            const particle = new Particle(x, y, Math.sin(i + variability), Math.cos(i + variability), (hue + (j * 180)), 50, 5, false);
            this.particlesArray.push(particle);
        }
    }

    tripletBall = (x, y) => {
        let j = 0;
        for (let i = 0; i < 6.28; i += 0.2){
            j++;
            var variability = 0
            const particle = new Particle(x, y, Math.sin(i + variability), Math.cos(i + variability), (hue + (j * 120)), 50, 5, false);
            this.particlesArray.push(particle);
        }
    }


    shoot = (x, y) => {
        const particle = new Particle(x, y, 0, 0, hue, 100, 1, true)
        this.particlesArray.push(particle);
    }
}



const createFirework = (x, y) => {
    const firework = new Firework(x, y);
    fireworkArray.push(firework);
    firework.shoot(x, y)
    
}

const handleDrawing = (event) => {
    a = event.pageX;
    b = event.pageY;
    createFirework(a, b);
};

const startShow = (event) => {
    let xlen = canvas.width;
    let ylen = canvas.height;
    createFirework((1 * (xlen))/(6), (ylen)/(3));
    hue++;
    createFirework((2 * (xlen))/(6), (ylen)/(3));
    hue++;
    createFirework((3 * (xlen))/(6), (ylen)/(3));
    hue++;
    createFirework((4 * (xlen))/(6), (ylen)/(3));
    hue++;
    createFirework((5 * (xlen))/(6), (ylen)/(3));
    hue++;
}

const animate = () => {
    requestAnimationFrame(animate);

    hue++
    //Fade away background when fireworks are done
    if (fireworkArray.length == 0){
        if (backgroundTransparency < 1)
                backgroundTransparency += 0.001
    }else{
        backgroundTransparency = 0.1
    }

    context.fillStyle = `rgba(0, 0, 0, ${backgroundTransparency})`;
    context.fillRect(0, 0, canvas.width, canvas.height);


    //Delete old fireworks
    fireworkArray.forEach((firework, index) => {
        if (firework.getParticle() == 0){
            fireworkArray.splice(index, 1)
            delete firework
        }
        firework.drawParticles();
        firework.updateParticles();
        
    });
};


// MAIN

animate();

canvas.addEventListener("click", handleDrawing);

addEventListener("mousedown", event => {
    if (event.button == 1) { // wheel click for mouse
        startShow()
    }});

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
