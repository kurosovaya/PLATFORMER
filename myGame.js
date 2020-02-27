
class Player {

    constructor(image, x, y) {
        this.image = new Image()
        this.image.src = image
        this.x = x
        this.y = y
        this.speed = 50
        this.Gravity = 7
        this.speedOfGravity = this.Gravity
        this.jumpSpeedConst = 70
        this.jumpSpeed = this.jumpSpeedConst
        this.jumpContMax = 2
        this.JumpCount = 0
        this.jumping = false
        this.height = 128
        this.wigth = 128
        this.maxHeightConst = 2000
        this.maxHeight = this.maxHeightConst
    }

    //метод отрисовки игрока
    Redraw() {
        ctx.drawImage(this.image, this.x, this.y, this.height, this.wigth)
    }

    //метод просчета движения
    UpdateCharacter() {
        /*прыжок        
        лучше переписать в менее упоротый вид*/
        if (this.jumping == true)
        {
            if (this.jumpSpeed > 0)
            {
                this.Teleport(0, this.jumpSpeed)
                this.jumpSpeed -= this.Gravity
            }
            else
            {
                this.jumping = false
                this.jumpSpeed = this.jumpSpeedConst
            }
        }
        //падение
        else if (this.jumping == false)
        {
            if (this.y >= this.maxHeight)
            {
                this.speedOfGravity = this.Gravity
                this.y = this.maxHeight
                this.JumpCount = 0
            }
            else
            {
                this.Teleport(0, -this.speedOfGravity)
                this.speedOfGravity += this.Gravity
            }
        }
        if (held.right == true)
        {
            this.Move(1, 0)
            this.image.src = "images/cover-256.png"
        }
        if (held.left == true)
        {
            this.Move(-1, 0)
            this.image.src = "images/cover-256_2.png"
        }
    }

    //метод просчета коллизии
    Collision() {
        let collisionSet = false

        currentObjects.forEach(obj => {
            if (obj.constructor.name == "Enemy")
            {
                if (this.y + this.height > obj.y && this.y < obj.y + obj.h)                
                {
                    if (this.x + this.wigth > obj.x && this.x < obj.x + obj.w)
                    {
                        //alert("Fuck you")
                        restart()
                    }
                }
            }
            else if (obj.constructor.name == "Collider" && collisionSet == false)
            {
                //игрок над объектом
                if (this.x + this.wigth > obj.x && this.x < obj.x + obj.w)
                {
                    if (this.y + this.height >= obj.y && this.y + this.height <= obj.y + obj.h / 2)
                    {
                        this.maxHeight = obj.y - this.height
                        this.y = obj.y - this.height
                        collisionSet = true
                    }
                }
                //быдлокод
                else if (this.maxHeight != this.maxHeightConst)
                {
                    this.maxHeight = this.maxHeightConst
                }

                //игрок под объектом
                if (this.x + this.wigth > obj.x && this.x < obj.x + obj.w)
                {
                    if (this.y > obj.y + obj.h / 2 && this.y < obj.y + obj.h)
                    {
                        this.y = obj.y + obj.h
                        this.jumping = false
                        this.jumpSpeed = this.jumpSpeedConst
                    }
                }

                //игрок слева
                if (this.x + this.wigth > obj.x && this.x + this.wigth < obj.x + obj.w / 2)
                {
                    if (this.y + this.height > obj.y && this.y < obj.y + obj.h)
                    {
                        //held.right = false
                        this.x = obj.x - this.wigth
                    }
                }

                //игрок справа
                if (this.x < obj.x + obj.w && this.x > obj.x + obj.w / 2)
                {
                    if (this.y + this.height > obj.y && this.y < obj.y + obj.h)
                    {
                        //held.left = false
                        this.x = obj.x + obj.w
                    }
                }
            }
            else if (obj.constructor.name == 'LevelEndTarget')
            {
                if (this.y + this.height > obj.y && this.y < obj.y + obj.h)                
                {
                    if (this.x + this.wigth > obj.x && this.x < obj.x + obj.w)
                    {
                        obj.nextLevel()
                    }
                }
            }

            //границы экрана
            if (true)
            {
                if (this.x < 0)
                {
                    this.x = 0
                }
                if (this.x + this.wigth > canvals.width)
                {
                    this.x = canvals.width - this.wigth
                }
                if (this.y < 0)
                {
                    this.y = 0
                    this.jumping = false
                    this.jumpSpeed = this.jumpSpeedConst
                }
                if (this.y > canvals.height)
                {
                    this.y = canvals.height - this.height
                }
            }
        });
    }

    //прыжок
    Jump() {
        if (this.JumpCount < this.jumpContMax && this.jumping == false)
        {
            this.JumpCount++
            this.jumping = true
        }
    }

    Move(x, y) {
        this.x += x * this.speed
        this.y -= y * this.speed
        console.log(this.x, this.y)
    }

    Teleport(x, y) {
        this.x += x
        this.y -= y
        console.log(this.x, this.y)
    }
}


//конструктор уровня
class LevelConstructor {

    constructor(levelObjects, background, player, customLoadFunction) {
        this.levelObjects = levelObjects
        this.background = background
        this.player = player
        this.customLoadFunction = customLoadFunction
    }
    //метод загрузки уровня
    loadLevel() {
        player = new Player(...this.player)
        background.src = this.background

        currentObjects = []

        if (this.levelObjects.enemies)
            this.levelObjects.enemies.forEach(element => {
                currentObjects.push(new Enemy(...element))
            })

        if (this.levelObjects.colliders)
            this.levelObjects.colliders.forEach(element => {
                currentObjects.push(new Collider(...element))
            })

        if (this.levelObjects.endTargets)
            this.levelObjects.endTargets.forEach(element => {
                currentObjects.push(new LevelEndTarget(...element))
            })

        //чистка эвентов при загрузке
        timeEvents.forEach(obj => {
            if (typeof (obj) !== "undefined")
            {
                clearTimeout(obj)
            }

        })

        timeEvents = []
        //вызов кастомной функции
        if (this.customLoadFunction)
        {
            this.customLoadFunction()
        }
    }
}


class Collider {

    constructor(image, x, y, width, height) {
        this.image = new Image()
        this.image.src = image
        this.x = x
        this.y = y
        this.w = width
        this.h = height
    }

    Redraw() {
        ctx.drawImage(this.image, this.x, this.y, this.w, this.h)
    }
}

//класс объекта для завершения уровня
class LevelEndTarget {

    constructor(image, x, y, width, height, next_level) {
        this.image = new Image()
        this.image.src = image
        this.x = x
        this.y = y
        this.w = width
        this.h = height
        this.nextLevel = next_level //метод при активации таргета игроком
    }

    Redraw() {
        ctx.drawImage(this.image, this.x, this.y, this.w, this.h)
    }
}


class Enemy {
    constructor(image, x, y, width, height, degree = 0, startxy = { x: 200, y: 0 }, endxy = { x: 1200, y: 0 }, speed = 10) {
        this.image = new Image()
        this.image.src = image
        this.x = x
        this.y = y
        this.w = width
        this.h = height
        this.toend = true
        this.startxy = startxy
        this.endxy = endxy
        this.speed = speed
        this.degree = degree
    }

    Move() {
        if (this.toend)
        {
            if (this.x < this.endxy.x)
            {
                this.x += Math.sign(this.endxy.x - this.x) * this.speed
            }
            else if (this.y < this.endxy.y)
            {
                this.y += Math.sign(this.endxy.y - this.y) * this.speed
            }
            else
            {
                this.toend = false
            }
        }
        else
        {
            if (this.x > this.startxy.x)
            {
                this.x -= Math.sign(this.x - this.startxy.x) * this.speed
            }
            else if (this.y > this.startxy.y)
            {
                this.y -= Math.sign(this.y - this.startxy.y) * this.speed
            }
            else
            {
                this.toend = true
            }
        }
    }

    Redraw() {
        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.rotate(this.degree * Math.PI / 180);
        ctx.translate(-this.x - this.w / 2, -this.y - this.h / 2);
        ctx.drawImage(this.image, this.x, this.y, this.w, this.h)
        ctx.restore()
    }
}




function RedrawScene() {
    ctx.drawImage(background, 0, 0, 3840, 2096);
    player.Redraw()
    currentObjects.forEach(obj => {
        obj.Redraw()
    });
}


//при вызова метода рестарт, вызывается метод из текущего класса-конструктора
function restart() {
    currentConstructor.loadLevel()
}


//передается имя уровня в формате string, уровень загружается из словаря
function nextLevel(nextLevelStr) {
    currentConstructor = levels[nextLevelStr]
    currentConstructor.loadLevel()
}


function start() {
    //запуск методов для отрисовки и просчета колизии, движения врагов и движения игрока
    gameInterval = setInterval(gameLoop, 1000 / 30);
    redrawInterval = setInterval(redrawLoop, 1000 / 30);
    currentConstructor.loadLevel()
}


function redrawLoop() {
    RedrawScene()
}


function gameLoop() {
    player.UpdateCharacter()
    player.Collision()
    currentObjects.forEach(obj => {
        if (obj.constructor.name == 'Enemy')
        {
            obj.Move()
        }
    });
}


function deleteObject(obj) {
    currentObjects.indexOf(obj)

    const index = currentObjects.indexOf(obj);
    if (index > -1)
    {
        currentObjects.splice(index, 1);
    }
}


function KeyDown(e) {
    switch (e.keyCode)
    {
        case 37:
        case 65: //Лево
            held.left = true
            break;

        case 39:
        case 68: //Право
            held.right = true
            break;

        case 38:
        case 87: //Вверх
            player.Jump()
            break;

        case 40:
        case 83: //Вниз       
            break;

        case 82: //R
            restart()
            break;
    }
}


function KeyUp(e) {
    switch (e.keyCode)
    {
        case 37:
        case 65: //Лево
            held.left = false
            break;

        case 39:
        case 68: //Право
            held.right = false
            break;

        case 38:
        case 87: //Вверх            
            break;

        case 40:
        case 83: //Вниз            
            break;
    }
}


let held = { left: false, right: false, up: false, down: false };
let canvals = document.getElementById("canvas")
let ctx = canvals.getContext('2d')
let gameInterval
let background = new Image()
let levels = {
    'level1':
        new LevelConstructor(
            {   //быдлокод 2.0 массив параметров для классов, которые инициализируются в классе LevelConstructor
                enemies:
                    [
                        ["images/ear-rape-spinder1.png", 1600, 1400, 600, 320,
                            startxy = { x: 1600, y: 1400 },
                            endxy = { x: 200, y: 1400 }
                        ],
                        ["images/ear-rape-spinder1.png", 2400, 800, 400, 200,
                            startxy = { x: 2400, y: 800 },
                            endxy = { x: 200, y: 800 },
                        ],
                    ],
                colliders:
                    [
                        ["images/GrassTitle2.png", 2000, 1400, 200, 200],
                        ["images/GrassTitle2.png", 2200, 1400, 200, 200],
                        ["images/GrassTitle2.png", 2400, 1600, 200, 200],
                    ],
                endTargets:
                    [
                        ["images/AhmadTea.png", 3400, 1500, 250, 250,
                            funct = function () {
                                nextLevel("level2")
                            }
                        ]
                    ]
            },

            "images/trees_palms_jungle_127762_3840x2096.jpg",

            ["images/cover-256.png", 0, 1600],

            funct = function () {
                for (var i = 0; i < 3840; i += 200)
                {
                    currentObjects.push(new Collider("images/GrassTitle.png", i, 1600 + 200, 200, 296))
                }
            }
        ),

    'level2':
        new LevelConstructor(
            {
                enemies:
                    [
                        ["images/ear-rape-spinder1.png", 1600, 1000, 460, 200, 270, { x: 200, y: 1000 }, { x: 1600, y: 1000 }, 20],
                    ],
                colliders:
                    [
                        ["images/RockTitle.png", 1600, 1400, 200, 200],
                        ["images/RockTitle.png", 1800, 1600, 200, 200],
                        ["images/RockTitle.png", 1400, 1200, 200, 200],
                        ["images/RockTitle.png", 1200, 1000, 200, 200],
                        ["images/RockTitle.png", 200, 1600, 200, 200],
                        ["images/RockTitle.png", 400, 1400, 200, 200],
                        ["images/RockTitle.png", 600, 1200, 200, 200],
                        ["images/RockTitle.png", 800, 1000, 200, 200],
                    ],
                endTargets:
                    [
                        ["images/AhmadTea.png", 1000, 1400, 250, 250,
                            funct = function () {
                                nextLevel("level3")
                            }
                        ]
                    ]
            },

            "images/c_bg_0002.png",

            ["images/cover-256.png", 3400, 1600],

            funct = function () {
                for (var i = 0; i < 3840; i += 200)
                {
                    currentObjects.push(new Collider("images/GrassTitle.png", i, 1600 + 200, 200, 296))
                }
            }
        ),

    'level3': new LevelConstructor(
        {
            endTargets:
                [
                    ["images/AhmadTea.png", 1750, 1400, 200, 200,

                        funct = function () {
                            //kek
                            currentObjects.shift()
                            //endkek
                            currentObjects.push(new Collider("images/RockTItle.png", 1850, 1300, 150, 150))
                            currentObjects.push(new Collider("images/RockTItle.png", 2000, 1300, 150, 150))
                            currentObjects.push(new Collider("images/RockTItle.png", 2150, 1300, 150, 150))
                            currentObjects.push(new Enemy("images/uh1.png", -800, 1200, 1200, 350, 10,
                                { x: -1200, y: 1200 },
                                { x: 3840, y: 1200 }, 50))
                            currentObjects.push(new Enemy("images/uh1.png", -1600, 1450, 1200, 350, 10,
                                { x: -1600, y: 1450 },
                                { x: 4000, y: 1450 }, 50))


                            endTirgetSpawn = function () {
                                currentObjects.push(new Collider("images/RockTItle.png", 1700, 800, 150, 150))
                                currentObjects.push(new Collider("images/RockTItle.png", 1550, 800, 150, 150))
                                currentObjects.push(new Collider("images/RockTItle.png", 1400, 800, 150, 150))

                                currentObjects.push(new Enemy("images/ear-rape-spinder1.png", 0, -400, 3680, 400, 0,
                                    { x: 0, y: -400 },
                                    { x: 0, y: 2096 }, 5))

                                currentObjects.push(new LevelEndTarget("images/AhmadTea.png", 1550, 650, 150, 150,
                                    function () {
                                        while (true)
                                        {
                                            if (count < 1)
                                            {
                                                let endTime = new Date().getTime();
                                                let playingTIme = endTime - startTime
                                                playingTIme = new Date(playingTIme)
                                                let m = playingTIme.getMinutes();
                                                let s = playingTIme.getSeconds();
                                                alert('You won')

                                                alert('Your time: ' + m + ":" + (s < 10 ? '0' : '') + s)
                                            }
                                            else if (count < 20)
                                            {
                                                alert('Press f5 to restart')
                                            }
                                            else
                                            {
                                                alert("228")
                                                alert("All the other kids with the pumped up kicks")
                                                alert("You'd better run, better run, out run sharaga")
                                                alert("nonickk9@gmail.com")
                                            }
                                            count += 1
                                        }
                                    }))
                            }
                            //добавление функции в общий массив эвентов с таймером в 15 секунд. Массив нужен что бы удалить эти функции при перезагрузке уровня
                            timeEvents.push(setTimeout(endTirgetSpawn, 15000))

                            let wolfVar

                            wolf = function () {
                                wolfVar = new Enemy("images/PositivePersonalElephant-small.gif", 1850, -400, 450, 220, 0,
                                    { x: 1850, y: -400 },
                                    { x: 1850, y: 1300 }, 50)
                                currentObjects.push(wolfVar)

                                timeEvents.push(setTimeout(wolf_delete, 3000))
                            }
                            wolf_delete = function () {
                                deleteObject(wolfVar)
                                wolfVar = null
                            }

                            timeEvents.push(setTimeout(wolf, 4000))

                            let pizzaVar

                            pizza = function () {
                                pizzaVar = new Enemy("images/1088px-Pizza_Hut_logo.svg.png", -400, 1000, 500, 500, 0,
                                    { x: -400, y: 1000 },
                                    { x: 4000, y: 1300 }, 50)
                                currentObjects.push(pizzaVar)

                                timeEvents.push(setTimeout(pizza_delete, 5000))
                            }

                            //удаление ссылки на объект из локальной переменной и массива объектов для отрисовки
                            pizza_delete = function () {
                                deleteObject(pizzaVar)
                                pizzaVar = null
                            }

                            timeEvents.push(setTimeout(pizza, 8000))

                            let pizzaVar2

                            pizza_2 = function () {
                                pizzaVar2 = new Enemy("images/1088px-Pizza_Hut_logo.svg.png", 1450, 300, 500, 500, 0,
                                    { x: 1450, y: 300 },
                                    { x: 1450, y: 2000 }, 50)
                                currentObjects.push(pizzaVar2)
                            }

                            timeEvents.push(setTimeout(pizza_2, 15000))
                        }
                    ],
                ]
        },

        "images/pzapwisrt5dy.png",

        ["images/cover-256.png", 3400, 1600],

        funct = function () {
            for (var i = 0; i < 3840; i += 200)
            {
                currentObjects.push(new Collider("images/GrassTitle.png", i, 1600 + 200, 200, 296))
            }
        }
    ),
}

//текущий конструктор уровня
let currentConstructor = levels["level1"]
//список объектов для отрисовки
let currentObjects = []
let player
let timeEvents = []
let count = 0
window.addEventListener("keydown", function (e) { KeyDown(e); });
window.addEventListener("keyup", function (e) { KeyUp(e); });


background.onload = function () {
    //разрешение холста
    //почему не 1920 на 1080?
    //не знаю
    canvals.width = 3840
    canvals.height = 2096
}

start()
let startTime = new Date().getTime();