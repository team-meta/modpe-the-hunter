/**
 * @author Team Meta
 * @since 2016-02-17
 * @version v1.0
 */
const CONTEXT = com.mojang.minecraftpe.MainActivity.currentMainActivity.get(),
    DP = CONTEXT.getResources().getDisplayMetrics().density,
    PATH = "/sdcard/games/team.meta/the_hunter/";

let theme = new me.astro.design.Theme({
        primary: android.graphics.Color.parseColor("#4ecdc4"),
        primaryDark: android.graphics.Color.parseColor("#44c3b9"),
        accent: android.graphics.Color.parseColor("#B8D5F2")
    }),
    user,
    rank = [],
    playerEntity,
    playerList;



function PlayerList() {}

PlayerList.HUNTER = 0;
PlayerList.PREY = 1;
PlayerList.SCORE_BONUS = 20;
PlayerList.SCORE_UP = 20;

PlayerList.prototype = {
    constructor: PlayerList,
    add(entity) {
        if (Player.isPlayer(entity)) {
            let players = this._players,
                name = Player.getName(entity);
            if (!(name in players)) {
                players[name] = {
                    entity: entity,
                    name: name,
                    type: PlayerList.PREY,
                    score: 0,
                    huntHunter: 0,
                    huntedCnt: 0
                };
            }
        }
    },
    findByEntity(entity) {
        let players = this._players;
        for (let i in players) {
            let player = players[i];
            if (player.entity === entity) {
                return player;
            }
        }
        return null;
    },
    findByName(name) {
        let players = this._players;
        for (let i in players) {
            if (i === name) {
                return players[i];
            }
        }
        return null;
    },
    finish() {
        if (this._thread !== null) {
            this._thread.interrupt();
            this._thread = null;
        }
        if (this._isRunning) {
            let thiz = this,
                players = this._players,
                scoreArr = [];
            for (let i in players) {
                let player = players[i];
                scoreArr.push([player.name, player.score, player.huntHunter, player.huntedCnt]);
            }
            new java.lang.Thread({
                run() {
                    clientMessage("§a::§e 결과 발표 §a::");
                    java.lang.Thread.sleep(1000);
                    clientMessage("§a::§e 생존 점수 §a::");
                    scoreArr.sort((a, b) => b[1] - a[1]);
                    for (let i = 0, len = scoreArr.length; i < len; i++) {
                        let player = scoreArr[i];
                        clientMessage((i + 1) + "위 " + player[0] + " : " + player[1] + "점");
                    }
                    java.lang.Thread.sleep(3000);
                    clientMessage("§a::§e 술래 사냥꾼 §a::");
                    scoreArr.sort((a, b) => b[2] - a[2]);
                    for (let i = 0, len = scoreArr.length; i < len; i++) {
                        let player = scoreArr[i];
                        clientMessage((i + 1) + "위 " + player[0] + " : " + player[2] + "번");
                    }
                    java.lang.Thread.sleep(3000);
                    clientMessage("§a::§e 아슬아슬 §a::");
                    scoreArr.filter(element => element[3] === 0);
                    if (scoreArr.length === 0) {
                        clientMessage("없음");
                    } else {
                        let arr = [];
                        for (let i = scoreArr.length; i--;) {
                            arr.push(scoreArr[i][0]);
                        }
                        clientMessage(arr.join(", "));
                    }
                    java.lang.Thread.sleep(3000);
                    clientMessage("§a::§e 최종 순위 §a::");
                    scoreArr = [];
                    for (let i in players) {
                        let player = players[i];
                        scoreArr.push([player, player.score + player.huntHunter * 100 - player.huntedCnt * 500]);
                    }
                    scoreArr.sort((a, b) => b[1] - a[1]);
                    for (let i = 0, len = scoreArr.length; i < len; i++) {
                        let player = scoreArr[i];
                        clientMessage((i + 1) + "위 " + player[0] + " : " + player[1] + "점");
                    }
                    java.lang.Thread.sleep(3000);
                    clientMessage("§a::§e 발표 종료 §a::");
                    thiz._isRunning = false;
                }
            }).start();
        }
    },
    forceFinish() {
        if (this._thread !== null) {
            this._thread.interrupt();
            this._thread = null;
        }
        this._isRunning = false;
        me.astro.widget.Toast.show("Error: 비정상적으로 게임이 종료되었습니다.", theme);
    },
    getHunter() {
        return this._hunter;
    },
    getPreys() {
        return this._players.filter(element => element.type === PlayerList.PREY);
    },
    hunt(hunterEntity, preyEntity) {
        let hunter = playerList.findByEntity(hunterEntity),
            prey = playerList.findByEntity(preyEntity);
        if (hunter.type === PlayerList.HUNTER && prey.type === PlayerList.PREY) {
            hunter.type = PlayerList.PREY;
            hunter.score += 100;
            prey.type = PlayerList.HUNTER;
            prey.huntedCnt++;
            this._hunter = preyEntity;
        } else if (hunter.type === PlayerList.PREY && prey.type === PlayerList.HUNTER) {
            hunter.huntHunter++;
        }
    },
    indicatePrey() {
        let players = this._players,
            hunter = this._hunter;
        for (let i in players) {
            let entity = players[i].entity;
            if (entity !== hunter) {
                Entity.connectParticle(ParticleType.crit, entity, hunter, [0, 0, 0, 3]);
            }
        }
    },
    init(players) {
        this._players = {};
        for (let i in players) {
            let player = players[i];
            if (Player.isPlayer(player)) {
                this._players[Player.getName(player)] = {
                    entity: player,
                    type: PlayerList.PREY,
                    name: Player.getName(player),
                    score: 0,
                    huntHunter: 0,
                    huntedCnt: 0
                };
            }
        }
        this._hunter = null;
        this._time = 5;
        this._isReady = true;
        this._isRunning = false;
    },
    isRunning() {
        return this._isRunning;
    },
    remove(entity) {
        if (Player.isPlayer(entity)) {
            let players = this._players,
                name = Player.getName(entity);
            if (name in players) {
                delete players[name];
            }
        }
    },
    scoreBonus() {
        let player = this.findByEntity(Entity.getNearestPlayer(this._hunter));
        if (player !== null) {
            player.score += PlayerList.SCORE_BONUS;
        }
    },
    scoreUp() {
        let players = this._players;
        for (let i in players) {
            let player = players[i];
            if (player.type === PlayerList.PREY) {
                player.score += PlayerList.SCORE_UP;
            }
        }
    },
    setPlayTime(time) {
        this._time = time;
    },
    start() {
        if (this._isReady && !this._isRunning) {
            let players = this._players;
            if (players.length === 0) {
                me.astro.widget.Toast.show("Error: 인원이 부족하여 게임을 시작할 수 없습니다.", theme);
            } else {
                let thiz = this,
                    index = Object.keys(players)[Math.floor(Math.random() * Object.keys(players).length)],
                    hunter = thiz._hunter = players[index].entity;
                players[index].type = PlayerList.HUNTER;
                this._isReady = false;
                this._isRunning = true;
                clientMessage("§a:: §eThe Hunter §a::");
                clientMessage("§eCopyright 2016 Team Meta. All rights reserved.");
                clientMessage("§e술래는 §a[" + Player.getName(hunter) + "]§e님 입니다.");
                Entity.addEffect(hunter, MobEffect.movementSlowdown, 220, 100, true, false);
                Entity.addEffect(hunter, MobEffect.blindness, 220, 100, true, false);
                thiz._thread = new java.lang.Thread({
                    run() {
                        for (let t = 10; t--;) {
                            java.lang.Thread.sleep(1000);
                            clientMessage("§e" + t + "초 뒤에 시작");
                        }
                        clientMessage("§a::§e 게임 시작 §a::");
                        for (let t = (thiz._time - 1) * 60; t--;) {
                            java.lang.Thread.sleep(1000);
                            thiz.scoreUp();
                            if (t % 3 === 0) {
                                thiz.indicatePrey();
                                thiz.scoreBonus();
                            }
                        }
                        clientMessage("§eFever Time!");
                        for (let i in players) {
                            let player = players[i];
                            Entity.addEffect(player, MobEffect.movementSpeed, 1200, 0, true, false);
                            Entity.addEffect(player, MobEffect.jump, 1200, 0, true, false);
                        }
                        for (let t = 60; t--;) {
                            java.lang.Thread.sleep(1000);
                            clientMessage("§e" + t + "초 후 게임 종료.");
                            thiz.scoreUp();
                            thiz.indicatePrey();
                            thiz.scoreBonus();
                        }
                        thiz.finish();
                    }
                });
                thiz._thread.start();
            }
        }
    }
};

Entity.connectParticle = (type, entity1, entity2, data) => {
    let x1 = Entity.getX(entity1),
        y1 = Entity.getY(entity1),
        z1 = Entity.getZ(entity1),
        x2 = Entity.getX(entity2),
        y2 = Entity.getY(entity2),
        z2 = Entity.getZ(entity2),
        distance = Entity.getDst(entity1, entity2);
    data = typeof data === "object" ? data : [0, 0, 0, 0];
    for (let m = 0; m <= distance; m += 0.25) {
        let n = distance - m;
        Level.addParticle(type, (m * x2 + n * x1) / distance, (m * y2 + n * y1) / distance, (m * z2 + n * z1) / distance, data[0], data[1], data[2], data[3]);
    }
};

Entity.getDst = (ent, ent2) => {
    return Math.sqrt(Math.pow(Entity.getX(ent) - Entity.getX(ent2), 2) + Math.pow(Entity.getZ(ent) - Entity.getZ(ent2), 2) + Math.pow(Entity.getY(ent) - Entity.getY(ent2), 2));
};

Entity.getNearestPlayer = (entity) => {
    return Entity.getAll().filter(element => Player.isPlayer(element) && element !== entity).sort((target1, target2) => Entity.getDst(target1, entity) - Entity.getDst(target2, entity))[0];
};



function attackHook(attacker, victim) {
    if (playerList.isRunning() && Player.isPlayer(attacker) && Player.isPlayer(victim)) {
        playerList.hunt(attacker, victim);
    }
}

function entityAddedHook(entity) {
    if (playerList.isRunning() && Player.isPlayer(entity)) {
        playerList.add(entity);
    }
}

function entityRemovedHook(entity) {
    if (playerList.isRunning() && Player.isPlayer(entity)) {
        playerList.remove(entity);
    }
}

function leaveGame() {
    if (playerList.isRunning()) {
        playerList.forceFinish();
    }
}

function newLevel() {
    playerEntity = Player.getEntity();
}

function useItem(x, y, z, itmeid, blockid) {
    if (playerList.isRunning() && blockid === 19) {
        let player = Player.getEntity();
        switch (Math.floor(Math.random() * 3)) {
        case 0:
            Entity.addEffect(player, MobEffect.movementSpeed, 200, 0, true, false);
            break;
        case 1:
            playerList.findByEntity(player).score += 300;
            break;
        case 2:
            Entity.addEffect(player, MobEffect.invisibility, 200, 0, true, false);
        }
        Level.setTile(x, y, z, 0);
    }
}

function onLoginListener(code) {
    if (typeof me.astro === "object" && code === me.astro.security.Account.LOGIN_SUCCESS) {
        user = me.astro.getUser();
        user.getRank("the_hunter_score", (code, rank_) => {
            if (code === me.astro.security.Account.GET_SUCCESS) {
                rank = rank_;
            }
        });
    }
}



function init() {
    let res = {
            "ic_apps.png": "https://docs.google.com/uc?id=0B4PGJt_Y53CFX2xyU1ExS1AzOHc&export=download",
            "ic_bulid.png": "https://docs.google.com/uc?id=0B4PGJt_Y53CFcVJuQjBQWTRjRFU&export=download"
        },
        isExists = true;
    for (let i in res) {
        if (!new java.io.File(PATH, i).exists()) {
            me.astro.utils.File.download(PATH + i, res[i]);
            isExists = false;
        }
    }
    if (isExists) {
        playerList = new PlayerList();
        CONTEXT.runOnUiThread({
            run() {
                me.astro.getWindow().addView(new me.astro.widget.ImageButton(me.astro.design.Shape.CIRCLE, theme)
                    .setEffect(showWindow)
                    .setEffectImage(me.astro.design.Bitmap.createBitmap(PATH + "ic_apps.png", DP * 24, DP * 24), android.graphics.Color.parseColor("#44c3b9"))
                    .setImage(me.astro.design.Bitmap.createBitmap(PATH + "ic_apps.png", DP * 24, DP * 24), android.graphics.Color.parseColor("#4ecdc4"))
                    .show());
            }
        });
    } else {
        if (new me.astro.internet.NetworkChecker().isConnected()) {
            let progressWindow;
            CONTEXT.runOnUiThread({
                run() {
                    progressWindow = new me.astro.widget.ProgressWindow(theme);
                    progressWindow.setText("Downloading...");
                    progressWindow.show();
                }
            });
            new java.lang.Thread({
                run() {
                    while (!isExists) {
                        java.lang.Thread.sleep(1000);
                        for (let i in res) {
                            if (!new java.io.File(PATH, i).exists()) {
                                isExists = false;
                                break;
                            } else {
                                isExists = true;
                            }
                        }
                    }
                    progressWindow.dismiss();
                    init();
                }
            }).start();
        } else {
            me.astro.widget.Toast.show("Error: No Internet.");
        }
    }
}

function showWindow() {
    CONTEXT.runOnUiThread({
        run() {
            try {
                let window = new me.astro.widget.Window(theme),
                    inputTime = new me.astro.widget.EditText(theme),
                    layout = new android.widget.LinearLayout(CONTEXT),
                    isRunning = playerList.isRunning();
                if (user instanceof me.astro.security.Account) {
                    user.getRank("the_hunter_score", (code, rank_) => {
                        if (code === me.astro.security.Account.GET_SUCCESS) {
                            rank = rank_;
                        }
                    });
                    for (let i = 0, len = rank.length; i < len; i++) {
                        layout.addView(new me.astro.widget.TextView(theme)
                            .setText((i + 1) + (i > 2 ? "th" : (i > 1 ? "rd" : (i === 1 ? "nd" : "st"))) + ". " + rank[i][0] + "\n" + rank[i][1])
                            .show());
                    }
                    layout.setOrientation(1);
                } else {
                    layout.addView(new me.astro.widget.TextView(theme)
                        .setText("로그인한 사용자만 이용가능합니다.")
                        .show());
                }
                window.addLayout(me.astro.design.Bitmap.createBitmap(PATH + "ic_apps.png"), new me.astro.widget.Layout()
                        .addView(new me.astro.widget.TextView(theme)
                            .setPadding(DP * 8, DP * 16, DP * 8, DP * 4)
                            .setText("The Hunter")
                            .setTextSize(24)
                            .show())
                        .addView(isRunning ? new android.widget.TextView(CONTEXT) : new me.astro.widget.TextView(theme)
                            .setPadding(DP * 12, 0, DP * 8, DP * 12)
                            .setText("플레이 타임을 설정해 주세요.")
                            .setTextSize(14)
                            .show())
                        .addView(isRunning ? new android.widget.TextView(CONTEXT) : inputTime.setHint("시간 (분)")
                            .show())
                        .addView(new me.astro.widget.Button(theme)
                            .setEffect(() => {
                                if (playerList.isRunning()) {
                                    playerList.finish();
                                } else {
                                    playerList.init(Entity.getAll().filter(element => Player.isPlayer(element)));
                                    playerList.setPlayTime(Number(inputTime.getText()) || 5);
                                    playerList.start();
                                }
                                window.dismiss();
                            })
                            .setText(isRunning ? "Finish" : "Start")
                            .show())
                        .addView(new me.astro.widget.Button(theme)
                            .setEffect(() => {
                                window.dismiss();
                            })
                            .setText("Close")
                            .show())
                        .addView(new me.astro.widget.TextView(theme)
                            .setPadding(DP * 12, 0, DP * 8, DP * 12)
                            .setText("Copyright 2016 Team Meta. All rights reserved.")
                            .setTextSize(12)
                            .show())
                        .show())
                    .addLayout(me.astro.design.Bitmap.createBitmap(PATH + "ic_bulid.png"), new me.astro.widget.Layout()
                        .addView(new me.astro.widget.TextView(theme)
                            .setPadding(DP * 8, DP * 16, DP * 8, DP * 4)
                            .setText("Utils")
                            .setTextSize(24)
                            .show())
                        .addView(new me.astro.widget.TextView(theme)
                            .setPadding(DP * 12, 0, DP * 8, DP * 12)
                            .setText("게임 진행에 유용한 도구 모음입니다.")
                            .setTextSize(14)
                            .show())
                        .addView(new me.astro.widget.Button(theme)
                            .setEffect(() => {
                                Level.setTime(0);
                                window.dismiss();
                                clientMessage("§e시간이 낮으로 변경되었습니다.");
                            })
                            .setText("Change the Day")
                            .setWH(DP * 144, DP * 36)
                            .show())
                        .addView(new me.astro.widget.Button(theme)
                            .setEffect(() => {
                                let players = Entity.getAll().filter(function (element) {
                                        return Player.isPlayer(element);
                                    }),
                                    x = Entity.getX(playerEntity),
                                    y = Entity.getY(playerEntity),
                                    z = Entity.getZ(playerEntity);
                                for (let i = players.length; i--;) {
                                    let cow = Level.spawnMob(x, y, z, 11);
                                    Entity.rideAnimal(players[i], cow);
                                    Entity.setHealth(cow, 0);
                                }
                                window.dismiss();
                                clientMessage("§e관리자가 플레이어를 소집했습니다.");
                            })
                            .setText("TP All")
                            .setWH(DP * 144, DP * 36)
                            .show())
                        .addView(new me.astro.widget.Button(theme)
                            .setEffect(() => {
                                window.dismiss();
                            })
                            .setText("Close")
                            .show())
                        .show())
                    .addLayout(me.astro.design.Bitmap.createBitmap(PATH + "ic_sort.png"), new me.astro.widget.Layout()
                        .addView(new me.astro.widget.TextView(theme)
                            .setPadding(DP * 8, DP * 16, DP * 8, DP * 4)
                            .setText("Deneb DB")
                            .setTextSize(24)
                            .show())
                        .addView(new me.astro.widget.TextView(theme)
                            .setPadding(DP * 12, 0, DP * 8, DP * 12)
                            .setText("The Hunter 점수 랭킹시스템입니다.")
                            .setTextSize(14)
                            .show())
                        .addView(layout)
                        .addView(new me.astro.widget.Button(theme)
                            .setEffect(() => {
                                window.dismiss();
                            })
                            .setText("Close")
                            .show())
                        .show())
                    .setFocusable(true)
                    .show();
            } catch (e) {
                print(e);
            }
        }
    });
}



init();