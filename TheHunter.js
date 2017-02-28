const Thread_ = java.lang.Thread,
    NAME = "The Hunter",
    NAME_CODE = "the_hunter",
    VERSION = "1.0",
    DEVELOPER = "Astro",
    LICENSE_TEXT = "The Hunter is licensed under the Apache License, Version 2 (Apache-2.0).";

let CONTEXT,
    DP,
    PATH,
    user,
    theme,
    icAppsBitmap,
    icBuildBitmap,
    icSortBitmap,
    playerEntity,
    game;



function PlayerData(playerEntity) {
    this._entity = playerEntity;
    this._type = PlayerData.PREY;
    this._score = 0;
    this._huntingCount = 0;
    this._huntedCount = 0;
}

PlayerData.PREY = 0;
PlayerData.HUNTER = 1;

PlayerData.prototype.getEntity = function () {
    return this._entity;
};

PlayerData.prototype.getHuntedCount = function () {
    return this._huntedCount;
};

PlayerData.prototype.getHuntingCount = function () {
    return this._huntingCount;
};

PlayerData.prototype.getScore = function () {
    return this._score;
};

PlayerData.prototype.getType = function () {
    return this._type;
};

PlayerData.prototype.setEntity = function (entity) {
    this._entity = entity;
};

PlayerData.prototype.setHuntedCount = function (huntedCount) {
    this._huntedCount = huntedCount;
};

PlayerData.prototype.setHuntingCount = function (huntingCount) {
    this._huntingCount = huntingCount;
};

PlayerData.prototype.setScore = function (score) {
    this._score = score;
};

PlayerData.prototype.setType = function (type) {
    this._type = type;
};

PlayerData.prototype.updateHuntedCount = function () {
    this._huntedCount++;
};

PlayerData.prototype.updateHuntingCount = function () {
    this._huntingCount++;
};



function PlayerList() {
    this._players = [];
}

PlayerList.prototype.addPlayer = function (playerEntity) {
    this._players.push(new PlayerData(playerEntity));
};

PlayerList.prototype.findByEntity = function (entity) {
    let players = this._players;
    for (let i = players.length; i--;) {
        if (players[i].getEntity() === entity) {
            return players[i];
        }
    }
    return null;
};

PlayerList.prototype.findByName = function (playerName) {
    let players = this._players;
    for (let i = players.length; i--;) {
        if (Player.getName(players[i]) === playerName) {
            return players[i];
        }
    }
    return null;
};

PlayerList.prototype.getAllPlayers = function () {
    return this._players;
};

PlayerList.prototype.setPlayers = function (playerEntities) {
    let players = this._players = [];
    for (let i = playerEntities.length; i--;) {
        players.push(new PlayerData(playerEntities[i]));
    }
};



function Timer(time) {
    this._isRunning = false;
    this._time = time || 120;
}

Timer.prototype.getTime = function () {
    return this._time;
};

Timer.prototype.setOnSecListener = function (func) {
    this._onSec = func;
};

Timer.prototype.setOnStartListener = function (func) {
    this._onStart = func;
};

Timer.prototype.setOnStopListener = function (func) {
    this._onStop = func;
};

Timer.prototype.start = function () {
    let thiz = this;
    new Thread_({
        run() {
            if (typeof thiz._onStart === "function") {
                thiz._onStart();
            }
            thiz._isRunning = true;
            while (thiz._isRunning && thiz._time > 0) {
                if (typeof thiz._onSec === "function") {
                    thiz._onSec(thiz._time);
                }
                Thread_.sleep(1000);
                thiz._time--;
            }
            if (typeof thiz._onStop === "function") {
                thiz._onStop();
            }
            thiz._isRunning = false;
        }
    }).start();
};

Timer.prototype.stop = function () {
    this._isRunning = false;
};



function Game() {
    this._isRunning = false;
    this._playerList = new PlayerList();
}

Game.prototype.forceStop = function () {
    if (this._isRunning) {
        if (this._timer instanceof Timer) {
            this._setOnStopListener(null);
            this._timer.stop();
            this._isRunning = false;
            me.astro.widget.Toast.show("Error: 비정상적으로 게임이 종료되었습니다.", theme);
        }
    }
};

Game.prototype.getPlayerList = function () {
    return this._playerList;
};

Game.prototype.huntPrey = function (hunterEntity, preyEntity) {
    let hunterData = this._playerList.findByEntity(hunterEntity),
        preyData = this._playerList.findByEntity(preyEntity);
    if (hunterData !== null && hunterData.getType() === PlayerData.HUNTER && preyData !== null && preyData.getType() === PlayerData.PREY) {
        R_Server.sendChat("§e술래는 §a[" + Player.getName(hunterEntity) + "]§e님 입니다.", false);
        hunterData.setType(PlayerData.PREY);
        preyData.setType(PlayerData.HUNTER);
        preyData.updateHuntedCount();
    }
};

Game.prototype.isRunning = function () {
    return this._isRunning;
};

Game.prototype.setPlayers = function (players) {
    if (!this._isRunning) {
        this._playerList.setPlayers(players);
    }
};

Game.prototype.setPlayTime = function (time) {
    if (!this._isRunning) {
        this._timer = new Timer(time);
        this._playtime = Math.floor(time / 6) / 10;
    }
};

Game.prototype.start = function () {
    if (!this._isRunning) {
        if (this._timer instanceof Timer) {
            let thiz = this,
                playerList = thiz._playerList,
                timer = thiz._timer,
                playtime = thiz._playtime;
            if (playerList.getAllPlayers().length < 2) {
                R_Server.sendChat("Error: 인원이 부족하여 게임을 시작할 수 없습니다.", false);
                return;
            }
            thiz._isRunning = true;
            timer.setOnStartListener(() => {
                let players = playerList.getAllPlayers(),
                    hunterData = players[Math.floor(Math.random() * players.length)],
                    hunterEntity = hunterData.getEntity();
                thiz._hunterData = hunterData;
                R_Server.sendChat("§a:: §eThe Hunter §a::", false);
                R_Server.sendChat("§eCopyright 2016 Team Meta. All rights reserved.", false);
                R_Server.sendChat("§e술래는 §a[" + Player.getName(hunterEntity) + "]§e님 입니다.", false);
                Entity.addEffect(hunterEntity, MobEffect.movementSlowdown, 220, 100, true, false);
                Entity.addEffect(hunterEntity, MobEffect.blindness, 220, 100, true, false);
            });
            timer.setOnSecListener(time => {
                let players = playerList.getAllPlayers(),
                    hunterEntity = thiz._hunterData.getEntity(),
                    hunterLocX = Entity.getX(hunterEntity),
                    hunterLocY = Entity.getY(hunterEntity),
                    hunterLocZ = Entity.getZ(hunterEntity);

                if (time < 60) {
                    R_Server.sendChat("§e" + time + "초 후 게임 종료.", false);
                } else if (time === 60) {
                    for (let i = players.length; i--;) {
                        let playerEntity = players[i].getEntity();
                        Entity.addEffect(playerEntity, MobEffect.movementSpeed, 1200, 0, true, false);
                        Entity.addEffect(playerEntity, MobEffect.jump, 1200, 0, true, false);
                    }
                    R_Server.sendChat("§eFever Time!", false);
                }
                for (let i = players.length; i--;) {
                    let player = players[i];
                    if (player.getType() === PlayerData.PREY) {
                        let playerEntity = player.getEntity(),
                            score = Math.floor(1600 / (Math.pow(hunterLocX - Entity.getX(playerEntity)) + Math.pow(hunterLocY - Entity.getY(playerEntity)) + Math.pow(hunterLocZ - Entity.getZ(playerEntity))));
                        if (score > 0) {
                            player.setScore(player.getScore() + score / 10);
                        } else {
                            R_Server.sendPrivatePopup(Player.getName(playerEntity), "주의: 술래와 너무 멀리 떨어져 있습니다.");
                        }
                    }
                }
            });
            timer.setOnStopListener(() => {
                let thiz = this,
                    players = this._playerList.getAllPlayers(),
                    scoreArr = [];
                for (let i = players.length; i--;) {
                    let player = players[i];
                    scoreArr.push([Player.getName(player), player.getScore(), player.getHuntingCount(), player.getHuntedCount()]);
                }
                new Thread_({
                    run() {
                        R_Server.sendChat("§a::§e 결과 발표 §a::", false);
                        Thread_.sleep(1000);
                        R_Server.sendChat("§a::§e 생존 점수 §a::", false);
                        scoreArr.sort((a, b) => b[1] - a[1]);
                        for (let i = 0, len = scoreArr.length; i < len; i++) {
                            let player = scoreArr[i];
                            R_Server.sendChat((i + 1) + "위 " + player[0] + " : " + player[1] + "점", false);
                        }
                        Thread_.sleep(3000);
                        R_Server.sendChat("§a::§e 술래 사냥꾼 §a::", false);
                        scoreArr.sort((a, b) => b[2] - a[2]);
                        for (let i = 0, len = scoreArr.length; i < len; i++) {
                            let player = scoreArr[i];
                            R_Server.sendChat((i + 1) + "위 " + player[0] + " : " + player[2] + "번", false);
                        }
                        java.lang.Thread.sleep(3000);
                        R_Server.sendChat("§a::§e 아슬아슬 §a::", false);
                        scoreArr.filter(element => element[3] === 0);
                        if (scoreArr.length === 0) {
                            R_Server.sendChat("없음", false);
                        } else {
                            let arr = [];
                            for (let i = scoreArr.length; i--;) {
                                arr.push(scoreArr[i][0]);
                            }
                            R_Server.sendChat(arr.join(", "), false);
                        }
                        java.lang.Thread.sleep(3000);
                        R_Server.sendChat("§a::§e 최종 순위 §a::", false);
                        scoreArr = [];
                        for (let i = players.length; i--;) {
                            let player = players[i];
                            scoreArr.push([Player.getName(player), player.getScore() + player.getHuntingCount() * 400 - player.getHuntedCount() * 100]);
                        }
                        scoreArr.sort((a, b) => b[1] - a[1]);
                        for (let i = 0, len = scoreArr.length; i < len; i++) {
                            let player = scoreArr[i];
                            R_Server.sendChat((i + 1) + "위 " + player[0] + " : " + player[1] + "점", false);
                        }
                        java.lang.Thread.sleep(3000);
                        if (this._isRunning) {
                            R_Server.sendChat("§a::§e 발표 종료 §a::", false);
                        }
                        thiz._isRunning = false;
                        if (user instanceof me.astro.security.Account) {
                            user.getDataFromServer("the_hunter___playtime", (code, value) => {
                                if (code === me.astro.security.Account.GET_SUCCESS) {
                                    user.modifyData("the_hunter___playtime", Number(value || 0) + playtime);
                                }
                            });
                        }
                    }
                }).start();
            });
            new Thread_({
                run() {
                    for (let t = 10; t--;) {
                        Thread_.sleep(1000);
                        if (this._isRunning) {
                            R_Server.sendChat("§e" + t + "초 뒤에 시작", false);
                        } else {
                            break;
                        }
                    }
                    if (this._isRunning) {
                        R_Server.sendChat("§a::§e 게임 시작 §a::", false);
                    }
                }
            }).start();
            timer.start();
        }
    }
};

Game.prototype.stop = function () {
    if (this._isRunning) {
        if (this._timer instanceof Timer) {
            this._timer.stop();
        }
    }
};



function tpAll() {
    let snowballs = [],
        players = Server.getAllPlayers(),
        x = Entity.getX(playerEntity),
        y = Entity.getY(playerEntity),
        z = Entity.getZ(playerEntity);
    for (let i = players.length; i--;) {
        let snowball = snowballs[i] = Level.spawnMob(x, y, z, 81);
        Entity.rideAnimal(players[i], snowball);
    }
    new Thread_({
        run() {
            Thread_.sleep(100);
            for (let i = snowballs.length; i--;) {
                Entity.remove(snowballs[i]);
            }
        }
    }).start();
}

function gui() {
    CONTEXT.runOnUiThread({
        run() {
            try {
                if (typeof R_Player === "undefined") {
                    let window = new me.astro.window.PopupWindow(theme);
                    window.addLayout(me.astro.design.Bitmap.createBitmap(PATH + "ic_info_outline.png"), new me.astro.widget.Layout(theme)
                            .addView(new me.astro.widget.TextView()
                                .setPadding(DP * 8, DP * 16, DP * 8, DP * 4)
                                .setText("Error")
                                .setTextSize(24)
                                .show())
                            .addView(new me.astro.widget.TextView()
                                .setText("Enable RethodPE addon")
                                .setTextSize(14)
                                .show())
                            .addView(new me.astro.widget.TextView()
                                .setPadding(DP * 8, DP * 16, DP * 8, DP * 4)
                                .setText("Script Info")
                                .setTextSize(24)
                                .show())
                            .addView(new me.astro.widget.TextView()
                                .setText(NAME + " " + VERSION + "\n\nName Code: " + NAME_CODE + "\nDeveleoper: " + DEVELOPER + "\n\n")
                                .setTextColor(me.astro.design.Color.GREY_DARK)
                                .show())
                            .addView(new me.astro.widget.TextView()
                                .setPadding(DP * 8, DP * 16, DP * 8, DP * 4)
                                .setText("License")
                                .setTextSize(24)
                                .show())
                            .addView(new me.astro.widget.TextView()
                                .setText(LICENSE_TEXT)
                                .setTextColor(me.astro.design.Color.GREY_DARK)
                                .show())
                            .addView(new me.astro.widget.Button(theme)
                                .setText("Close")
                                .setEffect(() => window.dismiss())
                                .show())
                            .show())
                        .setFocusable(true)
                        .show();

                } else if (typeof playerEntity === "undefined") {
                    let window = new me.astro.window.PopupWindow(theme);
                    window.addLayout(me.astro.design.Bitmap.createBitmap(PATH + "ic_info_outline.png"), new me.astro.widget.Layout(theme)
                            .addView(new me.astro.widget.TextView()
                                .setPadding(DP * 8, DP * 16, DP * 8, DP * 4)
                                .setText("Error")
                                .setTextSize(24)
                                .show())
                            .addView(new me.astro.widget.TextView()
                                .setText("Start a game in the world.")
                                .setTextSize(14)
                                .show())
                            .addView(new me.astro.widget.TextView()
                                .setPadding(DP * 8, DP * 16, DP * 8, DP * 4)
                                .setText("Script Info")
                                .setTextSize(24)
                                .show())
                            .addView(new me.astro.widget.TextView()
                                .setText(NAME + " " + VERSION + "\n\nName Code: " + NAME_CODE + "\nDeveleoper: " + DEVELOPER + "\n\n")
                                .setTextColor(me.astro.design.Color.GREY_DARK)
                                .show())
                            .addView(new me.astro.widget.TextView()
                                .setPadding(DP * 8, DP * 16, DP * 8, DP * 4)
                                .setText("License")
                                .setTextSize(24)
                                .show())
                            .addView(new me.astro.widget.TextView()
                                .setText(LICENSE_TEXT)
                                .setTextColor(me.astro.design.Color.GREY_DARK)
                                .show())
                            .addView(new me.astro.widget.Button(theme)
                                .setText("Close")
                                .setEffect(() => window.dismiss())
                                .show())
                            .show())
                        .setFocusable(true)
                        .show();
                } else {
                    let layout = new me.astro.widget.Layout(theme),
                        window = new me.astro.window.PopupWindow(theme),
                        inputTime = new me.astro.widget.EditText(theme),
                        isRunning = game.isRunning();
                    layout.addView(new me.astro.widget.TextView(theme)
                            .setPadding(DP * 8, DP * 16, DP * 8, DP * 4)
                            .setText("Rank")
                            .setTextSize(24)
                            .show())
                        .addView(new me.astro.widget.TextView(theme)
                            .setPadding(DP * 12, 0, DP * 8, DP * 4)
                            .setText("Playtime")
                            .setTextSize(14)
                            .show());
                    if (user instanceof me.astro.security.Account) {
                        user.getRank("the_hunter___playtime", (code, rank) => {
                            if (code === me.astro.security.Account.GET_SUCCESS) {
                                for (let i = 0, len = rank.length; i < len; i++) {
                                    layout.addView(new me.astro.widget.TextView(theme)
                                            .setPadding(DP * 8, DP * 16, DP * 8, DP * 4)
                                            .setText((i + 1) + (i > 2 ? "th" : (i > 1 ? "rd" : (i === 1 ? "nd" : "st"))) + ". " + rank[i][0])
                                            .setTextSize(18)
                                            .show())
                                        .addView(new me.astro.widget.TextView(theme)
                                            .setText("     " + rank[i][1] + "분")
                                            .show());
                                }
                            } else {
                                layout.addView(new me.astro.widget.TextView(theme)
                                    .setText("데이터를 불러오는데 실패했습니다.")
                                    .show());
                            }
                            layout.addView(new me.astro.widget.Button(theme)
                                .setText("Close")
                                .setEffect(() => window.dismiss())
                                .show());
                        });
                    } else {
                        layout.addView(new me.astro.widget.TextView(theme)
                                .setText("로그인한 사용자만 이용가능합니다.")
                                .show())
                            .addView(new me.astro.widget.Button(theme)
                                .setText("Close")
                                .setEffect(() => window.dismiss())
                                .show());
                    }
                    window.addLayout(icAppsBitmap, new me.astro.widget.Layout(theme)
                            .addView(new me.astro.widget.TextView()
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
                                    if (isRunning) {
                                        game.stop();
                                    } else {
                                        game.setPlayers(Entity.getAll().filter(element => Player.isPlayer(element)));
                                        game.setPlayTime(Number(inputTime.getText()) * 60 || 300);
                                        game.start();
                                    }
                                    window.dismiss();
                                })
                                .setText(isRunning ? "Finish" : "Start")
                                .show())
                            .addView(new me.astro.widget.Button(theme)
                                .setText("Close")
                                .setEffect(() => window.dismiss())
                                .show())
                            .show())
                        .addLayout(icBuildBitmap, new me.astro.widget.Layout(theme)
                            .addView(new me.astro.widget.TextView()
                                .setPadding(DP * 8, DP * 16, DP * 8, DP * 4)
                                .setText("Utils")
                                .setTextSize(24)
                                .show())
                            .addView(new me.astro.widget.TextView()
                                .setText("게임 진행에 유용한 도구 모음입니다.")
                                .setTextSize(14)
                                .show())
                            .addView(new me.astro.widget.TextView()
                                .setText("Set the time to day")
                                .setTextSize(14)
                                .show())
                            .addView(new me.astro.widget.Button(theme)
                                .setEffect(() => {
                                    Level.setTime(0);
                                    window.dismiss();
                                    R_Server.sendChat("§e시간이 낮으로 변경되었습니다.", false);
                                })
                                .setText("Change the Day")
                                .setWH(DP * 144, DP * 36)
                                .show())
                            .addView(new me.astro.widget.TextView()
                                .setText("Tp all players to the admin")
                                .setTextSize(14)
                                .show())
                            .addView(new me.astro.widget.Button(theme)
                                .setEffect(() => {
                                    tpAll();
                                    window.dismiss();
                                    R_Server.sendChat("§e관리자가 플레이어를 소집했습니다.", false);
                                })
                                .setText("TP All")
                                .setWH(DP * 144, DP * 36)
                                .show())
                            .addView(new me.astro.widget.TextView()
                                .setText("Prevent block destruction")
                                .setTextSize(14)
                                .show())
                            .addView(new me.astro.widget.Layout(theme)
                                .addView(new me.astro.widget.Button(theme)
                                    .setText("On")
                                    .setEffect(() => {
                                        R_Server.protectBlock(true);
                                        window.dismiss();
                                        R_Server.sendChat("§e블록 파괴 방지가 설정되었습니다.", false);
                                    })
                                    .show())
                                .addView(new me.astro.widget.Button(theme)
                                    .setText("Off")
                                    .setEffect(() => {
                                        R_Server.protectBlock(false);
                                        window.dismiss();
                                        R_Server.sendChat("§e블록 파괴 방지가 해제되었습니다.", false);
                                    })
                                    .show())
                                .setOrientation(0)
                                .show())
                            .addView(new me.astro.widget.TextView()
                                .setText("Disable join to the server")
                                .setTextSize(14)
                                .show())
                            .addView(new me.astro.widget.Layout(theme)
                                .addView(new me.astro.widget.Button(theme)
                                    .setText("On")
                                    .setEffect(() => {
                                        R_Server.enableJoin(false);
                                        window.dismiss();
                                        R_Server.sendChat("§e서버 접속 차단이 설정되었습니다.", false);
                                    })
                                    .show())
                                .addView(new me.astro.widget.Button(theme)
                                    .setText("Off")
                                    .setEffect(() => {
                                        R_Server.enableJoin(true);
                                        window.dismiss();
                                        R_Server.sendChat("§e서버 접속 차단이 해제되었습니다.", false);
                                    })
                                    .show())
                                .setOrientation(0)
                                .show())
                            .addView(new me.astro.widget.Button(theme)
                                .setText("Close")
                                .setEffect(() => window.dismiss())
                                .show())
                            .show())
                        .addLayout(icSortBitmap, layout.show())
                        .addLayout(me.astro.design.Bitmap.createBitmap(PATH + "ic_info_outline.png"), new me.astro.widget.Layout(theme)
                            .addView(new me.astro.widget.TextView()
                                .setPadding(DP * 8, DP * 16, DP * 8, DP * 4)
                                .setText("Script Info")
                                .setTextSize(24)
                                .show())
                            .addView(new me.astro.widget.TextView()
                                .setText(NAME + " " + VERSION + "\n\nName Code: " + NAME_CODE + "\nDeveleoper: " + DEVELOPER + "\n\n")
                                .setTextColor(me.astro.design.Color.GREY_DARK)
                                .show())
                            .addView(new me.astro.widget.TextView()
                                .setPadding(DP * 8, DP * 16, DP * 8, DP * 4)
                                .setText("License")
                                .setTextSize(24)
                                .show())
                            .addView(new me.astro.widget.TextView()
                                .setText(LICENSE_TEXT)
                                .setTextColor(me.astro.design.Color.GREY_DARK)
                                .show())
                            .addView(new me.astro.widget.Button(theme)
                                .setText("Close")
                                .setEffect(() => window.dismiss())
                                .show())
                            .show())
                        .setFocusable(true)
                        .show();
                }
            } catch (e) {
                print(e);
            }
        }
    });
}

function onLibraryLoaded(name, nameCode, version) {
    if (nameCode === "me_astro_library") {
        CONTEXT = me.astro.getContext();
        DP = CONTEXT.getResources().getDisplayMetrics().density;
        PATH = me.astro.getPath();
        theme = new me.astro.design.Theme({
            primary: me.astro.design.Color.GREEN,
            primaryDark: me.astro.design.Color.GREEN_DARK,
            accent: me.astro.design.Color.GREEN_ACCENT
        });
        icAppsBitmap = me.astro.design.Bitmap.decodeBase64("iVBORw0KGgoAAAANSUhEUgAAAMAAAADAAQAAAAB6p1GqAAAAAnRSTlMAAHaTzTgAAAAtSURBVFjD7dQhAgAACAIx/v9pzBajaQuU6yTAqW33CoKAvxIEf4W/EgR/BY8GWTh7vSiC7tgAAAAASUVORK5CYII=");
        icBuildBitmap = me.astro.design.Bitmap.decodeBase64("iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAQAAAD41aSMAAAFJElEQVR42u3dzWtUZxiG8WPix8aF/YgghRSEVjSdUxFc2eJWiwtFUGlFhKZk5U4QlEgg4EIQIStjcBdcqCtBmqxEohEhwiRYmNQPAhIISVo3QtNoe7loKG1qMl9n5p5nej//wXv9mGHOOe97Jkk8Ho/H4/F4PB6PpwZDKzs4yhn6uMUDxplkimmeM8EoQwzQzQn2sNGlsg7/MUe4wmN+o5T5gwLXOcU2l6s+fQe95PmTymaKfvbT6o6VpN/COZ6QxcxwmV0uWk783QyySLYzymFa3LaU/O3MUZt5RhdrXbg4Qa5mBFDgoAtrCWCE1I21BIv0sM6VlQQwzk5X1hIs8L0rawlggA3urCV4RJs7awkKtLvzagRpzQlest2dtQRzJtB/CvxFJCaYZLM7awkest6dtQT9rqwm6HRlLcECHa6sJRjzY5viBPM1JTjvxlqCRV+WqQmGXFhNcMCFtQST3tKlJvi2ORK1hyV4wpr4+XczSy4swaH4AIMQmOBu9PxblvZ41p7gyxoRfBYb4NzfC4lKcDE2wD83mMckmAm8p5ovli0mJsFXcQF6/7OYiASX4gLk37OceAQvouZvW+Fs11w4gq0xAY6ssgcnFsHJmABXVt0GlQsEcC0mwOMiO9FyYb6CChHzt7JQdDNgLkR+eBtwCzs7StqPmQuQHwh4poyjJW6JzQXID8fiAZwpeVdyruHzw9l4AH1lbAxPGzw/9MUDuFXW3vy0ofPDjXgAD8o8HpE2cH64Fw9gvOwTKmnD5oexeACTFRwSShs0P0zEA5iq6JxW2pD5I14LM13hUbm0AfPD03gAzys+rZg2XH7IxwOYqOLAaNpg+eF+PIDRKpZbAkFd88NwPIChqhY8vzpBnfPDYDyAgSqXvApB3fPDhXgA3VUvegUCQX7oigdwIoNlv4dAkh/2xQPYk8nClxGI8sMn8QA2VvzC4RUJZPlnk4hDIaPlLxHI8kf8EZokScL1zALMkwrzQ29MgFMZJpgX5oe9MQG20RzzOuwrbCq6Jd14cyeJOvQ3BUDc19ewvwny/84HcQFamQkPcDuJPFwOD3A1NsCuJvgS6olNMGoCLcDhpvglFJeAFp6ZQEvQ1SRXxFEJWJvZfVETVEhwEEygJRgxgRYgzfyvCU1QJkEPmEAJsK7sEwMmyJhgZ9GTwyaoMUEnmEBLMGACLcAGHplAS9DWNNfFYQnaeWkCLcH2mv8PjAmKEvhTICb4lJ9NoCXYzEMTaAnWc9UEaoQffINCTdDBmAnUDy3P+3mB/ofpkAnUCAcqeMmNCTIlaOU7fjKBFmENh7hrAjXD51zMZHP7IrdlVxuxCZKEFr7mEi8qXP5r7tD51/EK2ZaA6ARLEFs5yTUKvC1p0bMM08vefx+tM0E2z9NSjnGWPm5wjzEmKPCUPPcZZpALdLFv5ZcKmEAPaAITmMAEJjCBCUxgAhOYwAQmMIEJTGACE5jABCYwgQlMYAITmMAEJjCBCUxgAhOYwAQmMIEJTGACE5jABCYwgQlMYAITmMAEJjCBCUxgAhP8bwm63V5NcNzttQS/sMnttQSnXV5LMOLuWoJXrq4leOPmWoJpF9cS3HRvLcE3rq0k+NGllQR5PnRnHUGej9xYR+D8UgLnlxI4v5TA+aUEzi8lcH4pgfNLCZxfSuD8UgLnlxI4v5TA+aUEzi8lcH4pgfNLCZxfSuD8dSLodn41wXF+Xf6o3c9660uwidOM8Io3THPTG008Ho/H4/F4PB5PufMOnPz04SSwqfgAAAAASUVORK5CYII=");
        icSortBitmap = me.astro.design.Bitmap.decodeBase64("iVBORw0KGgoAAAANSUhEUgAAAMAAAADAAQAAAAB6p1GqAAAAAnRSTlMAAHaTzTgAAAAtSURBVHgB7dOxCQAgAANB919aB7AOIXDXfv1nCMD9NIMA6c+FfoDc50I/AOx4730931NAAwQAAAAASUVORK5CYII=");
        game = new Game();
        CONTEXT.runOnUiThread({
            run() {
                me.astro.getWindow().addView(new me.astro.widget.ImageButton(me.astro.design.Shape.CIRCLE, theme)
                    .setEffect(gui)
                    .setEffectImage(me.astro.design.Bitmap.resizeBitmap(icAppsBitmap, DP * 24, DP * 24))
                    .setImage(me.astro.design.Bitmap.resizeBitmap(icAppsBitmap, DP * 24, DP * 24))
                    .show());
            }
        });
    }
}

function onLoginListener(code) {
    switch (code) {
    case me.astro.security.Account.LOGIN_SUCCESS:
        user = me.astro.getUser();
        break;
    case me.astro.security.Account.LOGOUT:
        user = null;
        break;
    }
}

function useItem(x, y, z, itemid) {

}

function leaveGame() {
    if (game instanceof Game && game.isRunning()) {
        game.forceFinish();
    }
}

function newLevel() {
    playerEntity = Player.getEntity();
}

function attackHook(attacker, victim) {
    if (game instanceof Game && game.isRunning() && Player.isPlayer(attacker) && Player.isPlayer(victim)) {
        game.huntPrey(attacker, victim);
    }
}