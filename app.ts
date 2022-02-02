const $ = (selector: string) => document.querySelector(selector);
const $$ = (selector: string) => [...document.querySelectorAll(selector)];

const get_random_dirn = () => {
    const x = Math.random() > 0.5 ? 1 : -1;
    const y = Math.random() > 0.5 ? 1 : -1;
    return [0, x];
};

const randInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min)) + min;
};

const random_position = () => [randInt(0, 30), randInt(10, 20)];

const game_display = $(".game");
let started = false;
let game_page = false;
const snake_color = "#4caf50";
const snake_head = "#2e7d32";

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

const game_rows = $$(".game-row");
const score = {
    point: 0,
    updateUI: function () {
        $(".score").innerHTML = this.point;
        $(".end-score").innerHTML = this.point;
    },
};

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
            temp.position[0] - ll.direction[0],
            temp.position[1] - ll.direction[1],
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

const ll = new LinkedList(new SnakeNode(random_position(), snake_head));
ll.draw();

const food = new SnakeNode(random_position(), "yellow", true);
food.draw();
let init: NodeJS.Timeout;
let speed = 50;

const single_movement = () => {
    ll.head.clear();
    let oldPos = ll.head.position;
    ll.head.position = [
        ll.head.position[0] + ll.direction[0],
        ll.head.position[1] + ll.direction[1],
    ];

    if (
        ll.head.position[0] < 0 ||
        ll.head.position[0] >= 30 ||
        ll.head.position[1] < 0 ||
        ll.head.position[1] >= 30
    ) {
        clearInterval(init);
        gameover();
    } else if (check_intersection(ll.head.position, ll)) {
        clearInterval(init);
        gameover();
    } else {
        ll.head.draw();
        let temp = ll.head.next;
        while (temp) {
            temp.clear();
            let old = temp.position;
            temp.position = oldPos;
            oldPos = old;
            temp.draw();
            temp = temp.next;
        }

        if (
            ll.head.position[0] == food.position[0] &&
            ll.head.position[1] == food.position[1]
        ) {
            do {
                food.position = random_position();
            } while (check_intersection(food.position, ll));
            food.draw();
            ll.push();
            score.point++;
            score.updateUI();
        }
    }
};

window.addEventListener("keypress", (event) => {
    if (event.key == "w" || event.key == "W") {
        if (ll.direction[0] == 1) {
            ll.reverse();
        }
        ll.direction = [-1, 0];
    } else if (event.key == "a" || event.key == "A") {
        if (ll.direction[1] == 1) {
            ll.reverse();
        }

        ll.direction = [0, -1];
    } else if (event.key == "d" || event.key == "D") {
        if (ll.direction[1] == -1) {
            ll.reverse();
        }
        ll.direction = [0, 1];
    } else if (event.key == "s" || event.key == "S") {
        if (ll.direction[0] == -1) {
            ll.reverse();
        }
        ll.direction = [1, 0];
    }

    if (!started && game_page) {
        started = true;
        init = setInterval(single_movement, speed);
    }
});

const start_btn = $("#start");
const restart_btn = $("#restart");
const settings_btn = $("#setting");
const speed_selecor = $("#speed") as HTMLSelectElement;
const intro = $(".intro") as HTMLDivElement;
const game_over_page = $(".gameover") as HTMLDivElement;
const settings_page = $(".settings") as HTMLDivElement;

start_btn.addEventListener("click", function () {
    intro.style.opacity = "0";
    intro.style.transform = "scale(5)";

    setTimeout(() => {
        intro.style.display = "none";
        game_page = true;
    }, 300);
});

const gameover = () => {
    game_page = false;
    game_over_page.style.display = "flex";
    setTimeout(() => {
        game_over_page.style.opacity = "1";
        game_over_page.style.transform = "scale(1)";
    }, 100);
};

const settings = () => {
    settings_page.style.display = "flex";
    setTimeout(() => {
        settings_page.style.opacity = "1";
        settings_page.style.transform = "scale(1)";
    }, 100);
};

const exit_settings = () => {
    settings_page.style.opacity = "0";
    settings_page.style.transform = "scale(5)";

    setTimeout(() => {
        settings_page.style.display = "none";
        game_page = true;
    }, 300);
};
settings_btn.addEventListener("click", settings);
$("#exit_setting").addEventListener("click", exit_settings);

speed_selecor.addEventListener("change", function (event) {
    let val = event.target.value;
    let factor = 6 - parseInt(val);
    speed = 50 + 20 * factor;
});

const restart = () => {};
