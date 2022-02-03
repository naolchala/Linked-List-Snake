const $ = (selector: string) => document.querySelector(selector);
const $$ = (selector: string) => [...document.querySelectorAll(selector)];

const get_random_dirn = () => {
    const x = Math.random() > 0.5 ? 1 : -1;
    return [0, x];
};

const randInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min)) + min;
};

const random_position = () => [randInt(0, 30), randInt(10, 20)];

const game_display = $(".game");
const start_btn = $("#start");
const restart_btn = $("#restart") as HTMLButtonElement;
const settings_btn = $("#setting");
const speed_selecor = $("#speed") as HTMLSelectElement;
const intro = $(".intro") as HTMLDivElement;
const game_over_page = $(".gameover") as HTMLDivElement;
const settings_page = $(".settings") as HTMLDivElement;

const snake_color = "#4caf50";
const snake_head = "#2e7d32";

class SnakeNode {
    position: number[];
    next?: SnakeNode;
    fill: string;
    food: boolean;
    constructor(pos: number[], fill = snake_color, food = false) {
        this.position = pos;
        this.next = undefined;
        this.fill = fill;
        this.food = food;
    }

    draw() {
        const game_rows = $$(".game-row");
        const current = game_rows[this.position[0]];
        const current_col = current.children[
            this.position[1]
        ] as HTMLDivElement;
        current_col.style.background = this.fill;
        if (this.food) {
            current_col.style.borderRadius = "50%";
        } else {
            current_col.style.borderRadius = "0%";
        }
    }

    clear() {
        const game_rows = $$(".game-row");
        const current = game_rows[this.position[0]];
        const current_col = current.children[
            this.position[1]
        ] as HTMLDivElement;
        current_col.style.background = "transparent";
    }
}

class LinkedList {
    head: SnakeNode;
    direction: number[];

    constructor(head: SnakeNode) {
        this.head = head;
        this.direction = get_random_dirn();
    }

    draw() {
        let temp = this.head;
        while (temp) {
            temp.draw();
            temp = temp.next;
        }
    }
    push() {
        let temp = this.head;
        while (temp.next) {
            temp = temp.next;
        }

        let newNode = new SnakeNode([
            temp.position[0] - this.direction[0],
            temp.position[1] - this.direction[1],
        ]);
        temp.next = newNode;
    }
    reverse() {
        this.head.fill = snake_color;
        let temp = this.head;
        if (this.head.next == undefined) {
            return;
        }
        let next,
            prev: SnakeNode = undefined;

        while (temp) {
            next = temp.next;
            temp.next = prev;
            prev = temp;
            temp = next;
        }

        this.head = prev;
        this.head.fill = snake_head;
    }
    print() {
        let temp = this.head;
        while (temp) {
            console.log(temp.position);
            temp = temp.next;
        }
    }
}

const check_intersection = (position: number[], ll: LinkedList): boolean => {
    let temp = ll.head.next;
    while (temp) {
        if (
            temp.position[0] == position[0] &&
            temp.position[1] == position[1]
        ) {
            return true;
        }
        temp = temp.next;
    }
    return false;
};

class Snakegame {
    started: boolean;
    game_page: boolean;
    score: number;
    speed: number;
    linkedList: LinkedList;
    foodNode: SnakeNode;
    interval: any;
    that: Snakegame;
    constructor() {
        this.init();
        this.that = this;
    }

    make_enviroment() {
        game_display.innerHTML = "";
        for (let i = 0; i < 30; i++) {
            let row = document.createElement("div");
            row.className = "game-row";
            for (let j = 0; j < 30; j++) {
                let col = document.createElement("div");
                col.className = "game-col";
                row.appendChild(col);
            }
            game_display.appendChild(row);
        }
    }

    init() {
        this.make_enviroment();
        this.linkedList = new LinkedList(
            new SnakeNode(random_position(), snake_head)
        );
        this.foodNode = new SnakeNode(random_position(), "yellow", true);
        this.linkedList.draw();
        this.foodNode.draw();
        this.started = false;
        this.score = 0;
        this.speed = 60;
        this.intitailize_controlls();
        const that = this;

        speed_selecor.addEventListener("change", function (event) {
            const ev: any = event;
            let val = ev.target.value;
            let factor = 6 - parseInt(val);
            that.speed = 50 + 20 * factor;
        });
    }

    intitailize_controlls() {
        window.addEventListener("keypress", (event) => {
            if (event.key == "w" || event.key == "W") {
                if (this.linkedList.direction[0] == 1) {
                    this.linkedList.reverse();
                }
                this.linkedList.direction = [-1, 0];
            } else if (event.key == "a" || event.key == "A") {
                if (this.linkedList.direction[1] == 1) {
                    this.linkedList.reverse();
                }

                this.linkedList.direction = [0, -1];
            } else if (event.key == "d" || event.key == "D") {
                if (this.linkedList.direction[1] == -1) {
                    this.linkedList.reverse();
                }
                this.linkedList.direction = [0, 1];
            } else if (event.key == "s" || event.key == "S") {
                if (this.linkedList.direction[0] == -1) {
                    this.linkedList.reverse();
                }
                this.linkedList.direction = [1, 0];
            }

            if (!this.started && this.game_page) {
                this.started = true;
                this.start();
            }
        });
    }

    start() {
        this.interval = setInterval(
            this.single_movement.bind(this),
            this.speed
        );
    }

    single_movement() {
        this.linkedList.head.clear();
        let oldPos = this.linkedList.head.position;
        this.linkedList.head.position = [
            this.linkedList.head.position[0] + this.linkedList.direction[0],
            this.linkedList.head.position[1] + this.linkedList.direction[1],
        ];

        if (
            this.linkedList.head.position[0] < 0 ||
            this.linkedList.head.position[0] >= 30 ||
            this.linkedList.head.position[1] < 0 ||
            this.linkedList.head.position[1] >= 30 ||
            check_intersection(this.linkedList.head.position, this.linkedList)
        ) {
            clearInterval(this.interval);
            gameover();
        } else {
            this.linkedList.head.draw();
            let temp = this.linkedList.head.next;
            while (temp) {
                temp.clear();
                let old = temp.position;
                temp.position = oldPos;
                oldPos = old;
                temp.draw();
                temp = temp.next;
            }

            if (
                this.linkedList.head.position[0] == this.foodNode.position[0] &&
                this.linkedList.head.position[1] == this.foodNode.position[1]
            ) {
                do {
                    this.foodNode.position = random_position();
                } while (
                    check_intersection(this.foodNode.position, this.linkedList)
                );
                this.foodNode.draw();
                this.linkedList.push();
                this.score++;
                this.updateScoreUI();
            }
        }
    }
    updateScoreUI() {
        $(".end-score").innerHTML = this.score.toString();
        $(".score").innerHTML = this.score.toString();
    }

    restart() {
        exitPage(game_over_page);
        this.game_page = true;
        this.init();
    }
}

function gotoPage(page: HTMLDivElement) {
    page.style.display = "flex";
    setTimeout(() => {
        page.style.opacity = "1";
        page.style.transform = "scale(1)";
    }, 100);
}

function exitPage(page: HTMLDivElement) {
    page.style.opacity = "0";
    page.style.transform = "scale(5)";

    setTimeout(() => {
        page.style.display = "none";
    }, 300);
}

let GAME = new Snakegame();

start_btn.addEventListener("click", function () {
    exitPage(intro);
    GAME.game_page = true;
});

const gameover = () => {
    GAME.game_page = false;
    gotoPage(game_over_page);
};

settings_btn.addEventListener("click", () => gotoPage(settings_page));
$("#exit_setting").addEventListener("click", () => exitPage(settings_page));

restart_btn.addEventListener("click", GAME.restart.bind(GAME));
