class Projectile {
    constructor(startX, startY, direction, projectileFrames, effect, speed, animationSpeed, damage) {
        this.x= startX;
        this.y= startY;
        this.direction= direction;
        this.frames= projectileFrames;
        this.speed= speed;
        this.animationSpeed= animationSpeed;
        this.animationTimer= 0;
        this.frameIndex= 0;
        this.effect= effect;
        this.damage= damage;
    }
}

export { Projectile };