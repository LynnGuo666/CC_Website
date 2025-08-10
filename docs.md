# 游戏核心事件类型 (Game Core Event Types)



**宾果时速 (Bingo Rush)**

- 中文: 找到物品, 完成线路, 队伍领先, 游戏胜利
- English: Item Found, Line Complete, Team Leading, Game Win

**跑酷追击 (Parkour Chase)**

- 中文: 追击者选定, 回合开始, 成功闪避, 玩家被抓, 回合结束
- English: Chaser Selected, Round Start, Successful Dodge, Player Tagged, Round Over

**斗战方框 (Battle Box)**

- 中文: 选择工具包, 首次击杀, 中央交战, 放置/破坏羊毛, 游戏胜利
- English: Kit Selection, First Kill, Center Fight, Place/Break Wool, Game Win

**TNT飞跃 (TNT Leap)**

- 中文: 玩家跌落, 游戏开始, 玩家淘汰, 最终胜利
- English: Player Fall, Game Start, Clutch Jump, Player Eliminated, Final Win

**空岛乱斗 (Sky Island Brawl)**

- 中文: 玩家铺路, 远程击杀, 玩家被击落, 队伍淘汰, 游戏胜利
- English: Player Bridging, Ranged Kill, Player Knocked Off, Team Eliminated, Game Win

**烫手鳕鱼 (Hot Cod)**

- 中文: 鳕鱼传递, 玩家追逐, 玩家被淘汰, 最终胜利
- English: Cod Passed, Player Chase, Player Eliminated, Final Win

**跑路战士 (Road Warriors)**

- 中文: 比赛开始, 玩家领先, 玩家失误, 终点冲刺, 游戏胜利
- English: Race Start, Player in Lead, Player Mistake, Final Sprint, Game Win



| 游戏 | Event | Lore | Player |
| -------- | --------------- | -------- | -------- |
| 宾果时速 | Item_Found      | 物品ID |  |
| 跑酷追击 | Chaser_Selected | |  |
| 跑酷追击 | Round_Start     | |  |
| 跑酷追击 | Player_Tagged   | |  |
| 跑酷追击 | Round_Over      | |  |
| 斗战方框 | Round_Start     | |  |
| 斗战方框 | Kill            | 被杀的人ID | 谁杀的ID |
| 斗战方框 | Wool_Win        | | 最后一个羊毛谁填的 |
| 斗战方框 | Round_Over      | |  |
| TNTRUN   | Round_Start     | |  |
| TNTRUN   | Player_Fall     | |  |
| TNTRUN   | Round_Over      | |  |
| 空岛战争 | Round_Start     | |  |
| 空岛战争 | Kill            | 被杀的人ID | 谁杀的ID（包括把谁丢虚空了） |
| 空岛战争 | Fall            |                         | 谁掉下去了                   |
| 空岛战争 | Border_Start    | 收缩到多少格（eg:"100") |                              |
| 空岛战争 | Border_End      | 收缩到多少格（eg:"100") |  |
| 空岛战争 | Round_Over      |                         |                              |
| 烫手鳕鱼 | Round_Start     |                         |                              |
| 烫手鳕鱼 | Cod_Passed      | 被传递的人ID            | 谁传递的ID                   |
| 烫手鳕鱼 | Death           |                         |                              |
| 烫手鳕鱼 | Round_Over      |                         |                              |
| 跑路战士 | Checkpoint      | ID("main1","sub1")      |                              |
| 跑路战士 | Player_Mistake  |  | 掉下去的ID |
| 跑路战士 | Player_Finish | |  |
|          |                 | |  |
|          |                 | |  |
|          |                 | |  |
|          |                 | |  |
|          |                 | |  |
|          |                 | |  |
|          |                 | |  |
|          |                 | |  |
|          |                 | |  |
|          |                 | |  |
|          |                 | |  |
|          |                 | |  |
|          |                 | |  |
|          |                 | |  |

```
import requests
import json
import time
from datetime import datetime, timedelta

# --- 配置 ---
# 请将 'http://your-api-server.com' 替换为您的API服务器地址
API_BASE_URL = "http://127.0.0.1:8000/api"
# 请将 'YOUR_SECRET_API_KEY' 替换为您有效的API密钥
API_KEY = "YOUR_SECRET_API_KEY"
# --- 配置结束 ---

# 设置请求头
HEADERS = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
}

# --- W²CC冬季联动锦标赛真实数据 ---
GAME_NAMES = [
    {"name": "空岛战争", "description": "空中岛屿PVP对战", "multiplier": 1.0, "code": "SkyWars"},
    {"name": "宾果时速", "description": "快速完成任务收集", "multiplier": 1.0, "code": "Bingo"},
    {"name": "斗战方框", "description": "狭小空间内的激烈对战", "multiplier": 1.5, "code": "BattleBox"},
    {"name": "雪球乱斗", "description": "使用雪球进行团队战斗", "multiplier": 1.5, "code": "SnowballShowdown"},
    {"name": "TNT快跑", "description": "在TNT爆炸前快速逃生", "multiplier": 1.5, "code": "TNTRun"},
    {"name": "去到那一边", "description": "竞速到达终点的游戏", "multiplier": 2.0, "code": "TGTTOS"}
]

# 基于完整的Excel数据重建的队伍和玩家数据
TEAMS_DATA = [
    {
        "name": "落地水队", "color": "#f8f636", "team_rank": 3,
        "main_players": ["sh1onari", "Flowerfruit", "Discord_wuxu", "OlivaFute"],
        "substitutes": ["ChanceLetHay"],  # 替补队员
    },
    {
        "name": "曲奇白巧", "color": "#0043d9", "team_rank": 5,
        "main_players": ["gdgfty", "Aut_moon_white", "cangqian", "sXKYYYY"],
        "substitutes": []
    },
    {
        "name": "绿队", "color": "#00ce03", "team_rank": 6,
        "main_players": ["zRenox", "Forest_Silence"],
        "substitutes": ["Wind_Forest", "ChanceLetHay", "goob233", "chara12121"]
    },
    {
        "name": "红队", "color": "#ff0000", "team_rank": 7,
        "main_players": ["Level_D", "K4ver", "NarciGD", "xiaoyuanxyz"],
        "substitutes": ["BCMonomial"]
    },
    {
        "name": "锤神再起", "color": "#c241ff", "team_rank": 1,
        "main_players": ["xiaoheng66666", "Zoromtff", "Ning_meng_Cat", "Se_fletrir"],
        "substitutes": []
    },
    {
        "name": "魔芋爽", "color": "#ff79c1", "team_rank": 4,
        "main_players": ["Lova_Eathtar", "hao145245", "_S0uvenir", "Sakura_Fu"],
        "substitutes": []
    },
    {
        "name": "维多利亚", "color": "#ffffff", "team_rank": 9,
        "main_players": ["wsouls", "CivilightEterna"],
        "substitutes": ["MomeyuKa", "ChanceLetHay", "xici68"]
    },
    {
        "name": "新春大吉队", "color": "#32feff", "team_rank": 2,
        "main_players": ["MingMo777", "an_yue233", "Frozen_Rinn", "savagetricycle"],
        "substitutes": [],
        "is_champion": True  # 冠军
    },
    {
        "name": "hunter队", "color": "#ff9d00", "team_rank": 8,
        "main_players": ["Needle_Python", "lao_dan", "Venti_Lynn", "songziqi0927"],
        "substitutes": []
    },
    {
        "name": "青队", "color": "#00f99d", "team_rank": 10,
        "main_players": ["VicFighter", "XieRiser", "MCmuzixuange", "ToastBreadMc"],
        "substitutes": []
    }
]

# 基于Excel数据的完整分数记录
GAME_SCORES = {
    "空岛战争": {  # 项目1
        "Flowerfruit": 406.2087186, "Discord_wuxu": 677.014531, "sh1onari": 954.4253633,
        "OlivaFute": 158.5204756, "sXKYYYY": 132.1003963, "Aut_moon_white": 267.5033025,
        "gdgfty": 369.8811096, "cangqian": 201.4531044, "zRenox": 429.326288,
        "Forest_Silence": 406.2087186, "Wind_Forest": 168.4280053, "K4ver": 442.5363276,
        "NarciGD": 145.3104359, "xiaoyuanxyz": 191.5455746, "Level_D": 660.5019815,
        "Se_fletrir": 620.8718626, "xiaoheng66666": 369.8811096, "Ning_meng_Cat": 475.5614267,
        "Zoromtff": 630.7793923, "Sakura_Fu": 409.5112285, "hao145245": 422.7212682,
        "_S0uvenir": 135.4029062, "Lova_Eathtar": 445.8388375, "CivilightEterna": 287.318362,
        "wsouls": 409.5112285, "xici68": 198.1505945, "MingMo777": 422.7212682,
        "an_yue233": 416.1162483, "Frozen_Rinn": 419.4187583, "savagetricycle": 231.1756935,
        "lao_dan": 792.6023778, "songziqi0927": 287.318362, "Venti_Lynn": 591.1492734,
        "Needle_Python": 640.6869221, "VicFighter": 155.2179657, "XieRiser": 254.2932629,
        "MCmuzixuange": 284.015852, "ToastBreadMc": 85.8652576
    },
    "宾果时速": {  # 项目2
        "Flowerfruit": 529.1576674, "Discord_wuxu": 507.5593952, "sh1onari": 529.1576674,
        "OlivaFute": 464.362851, "sXKYYYY": 518.3585313, "Aut_moon_white": 518.3585313,
        "gdgfty": 561.5550756, "cangqian": 475.161987, "zRenox": 129.5896328,
        "Forest_Silence": 64.79481641, "Wind_Forest": 64.79481641, "chara12121": 129.5896328,
        "K4ver": 280.7775378, "NarciGD": 172.7861771, "xiaoyuanxyz": 194.3844492,
        "BCMonomial": 226.7818575, "Se_fletrir": 604.7516199, "xiaoheng66666": 604.7516199,
        "Ning_meng_Cat": 539.9568035, "Zoromtff": 583.1533477, "Sakura_Fu": 518.3585313,
        "hao145245": 496.7602592, "_S0uvenir": 431.9654428, "Lova_Eathtar": 496.7602592,
        "MomeyuKa": 269.9784017, "CivilightEterna": 377.9697624, "wsouls": 291.5766739,
        "xici68": 248.3801296, "MingMo777": 518.3585313, "an_yue233": 475.161987,
        "Frozen_Rinn": 518.3585313, "savagetricycle": 539.9568035, "lao_dan": 313.174946,
        "songziqi0927": 291.5766739, "Venti_Lynn": 291.5766739, "Needle_Python": 356.3714903,
        "VicFighter": 205.1835853, "XieRiser": 205.1835853, "MCmuzixuange": 226.7818575,
        "ToastBreadMc": 226.7818575
    },
    "斗战方框": {  # 项目3  
        "Flowerfruit": 281.3852814, "sh1onari": 303.030303, "OlivaFute": 238.0952381,
        "sXKYYYY": 331.8903319, "Aut_moon_white": 353.5353535, "gdgfty": 505.0505051,
        "cangqian": 310.2453102, "zRenox": 526.6955267, "Forest_Silence": 396.8253968,
        "chara12121": 331.8903319, "K4ver": 411.2554113, "NarciGD": 497.8354978,
        "xiaoyuanxyz": 432.9004329, "Level_D": 670.995671, "Se_fletrir": 670.995671,
        "xiaoheng66666": 649.3506494, "Ning_meng_Cat": 757.5757576, "Zoromtff": 735.9307359,
        "Sakura_Fu": 476.1904762, "hao145245": 432.9004329, "_S0uvenir": 541.1255411,
        "Lova_Eathtar": 584.4155844, "MomeyuKa": 230.8802309, "CivilightEterna": 252.5252525,
        "wsouls": 382.3953824, "xici68": 274.1702742, "MingMo777": 505.0505051,
        "an_yue233": 461.7604618, "Frozen_Rinn": 331.8903319, "savagetricycle": 353.5353535,
        "lao_dan": 86.58008658, "Venti_Lynn": 0, "Needle_Python": 43.29004329,
        "songziqi0927": 21.64502165, "VicFighter": 266.955267, "XieRiser": 223.6652237,
        "MCmuzixuange": 158.7301587, "ToastBreadMc": 158.7301587
    },
    "雪球乱斗": {  # 项目4
        "Flowerfruit": 334.063914, "Discord_wuxu": 261.9485294, "sh1onari": 317.0955882,
        "OlivaFute": 274.6747738, "sXKYYYY": 434.8133484, "Aut_moon_white": 443.2975113,
        "gdgfty": 468.75, "cangqian": 422.0871041, "zRenox": 369.061086,
        "Forest_Silence": 449.6606335, "goob233": 373.3031674, "ChanceLetHay": 330.8823529,
        "K4ver": 386.0294118, "NarciGD": 271.4932127, "xiaoyuanxyz": 203.6199095,
        "Level_D": 356.3348416, "Se_fletrir": 440.1159502, "xiaoheng66666": 580.104638,
        "Ning_meng_Cat": 469.8105204, "Zoromtff": 474.0526018, "Sakura_Fu": 502.6866516,
        "hao145245": 379.6662896, "_S0uvenir": 439.0554299, "Lova_Eathtar": 417.8450226,
        "MomeyuKa": 361.6374434, "CivilightEterna": 433.7528281, "wsouls": 370.1216063,
        "xici68": 357.395362, "MingMo777": 362.6979638, "an_yue233": 392.3925339,
        "Frozen_Rinn": 417.8450226, "savagetricycle": 396.6346154, "lao_dan": 338.3059955,
        "songziqi0927": 380.72681, "Venti_Lynn": 389.2109729, "Needle_Python": 321.3376697,
        "VicFighter": 282.0984163, "XieRiser": 277.8563348, "MCmuzixuange": 256.6459276,
        "ToastBreadMc": 260.888009
    },
    "TNT快跑": {  # 项目5
        "Flowerfruit": 213.1691142, "Discord_wuxu": 355.2818569, "sh1onari": 1132.164851,
        "OlivaFute": 130.2700142, "sXKYYYY": 194.2207485, "Aut_moon_white": 208.4320227,
        "gdgfty": 686.8782568, "cangqian": 459.4978683, "zRenox": 866.8877309,
        "Forest_Silence": 644.2444339, "goob233": 222.643297, "ChanceLetHay": 203.6949313,
        "K4ver": 743.7233539, "NarciGD": 246.3287541, "xiaoyuanxyz": 113.6901942,
        "Level_D": 521.0800568, "Se_fletrir": 132.6385599, "xiaoheng66666": 497.3945997,
        "Ning_meng_Cat": 544.765514, "Zoromtff": 630.0331596, "Sakura_Fu": 255.802937,
        "hao145245": 71.05637139, "_S0uvenir": 317.3851255, "Lova_Eathtar": 326.8593084,
        "MomeyuKa": 71.05637139, "CivilightEterna": 369.4931312, "wsouls": 322.122217,
        "xici68": 137.3756514, "MingMo777": 658.4557082, "an_yue233": 558.9767883,
        "Frozen_Rinn": 478.446234, "savagetricycle": 369.4931312, "lao_dan": 274.7513027,
        "songziqi0927": 180.0094742, "Venti_Lynn": 123.1643771, "Needle_Python": 937.9441023,
        "VicFighter": 222.643297, "XieRiser": 255.802937, "MCmuzixuange": 118.4272856,
        "ToastBreadMc": 203.6949313
    },
    "去到那一边": {  # 项目6
        "Flowerfruit": 450.3291442, "Discord_wuxu": 338.1208857, "sh1onari": 890.1855177,
        "OlivaFute": 125.6732496, "sXKYYYY": 377.0197487, "Aut_moon_white": 655.2962298,
        "gdgfty": 366.5469779, "cangqian": 339.6169958, "zRenox": 628.3662478,
        "Forest_Silence": 405.4458408, "goob233": 465.2902454, "ChanceLetHay": 453.3213645,
        "K4ver": 335.1286655, "NarciGD": 200.4787552, "xiaoyuanxyz": 130.1615799,
        "Level_D": 465.2902454, "Se_fletrir": 547.5763016, "xiaoheng66666": 583.4829443,
        "Ning_meng_Cat": 498.2046679, "Zoromtff": 360.5625374, "Sakura_Fu": 296.2298025,
        "hao145245": 670.2573309, "_S0uvenir": 454.8174746, "Lova_Eathtar": 254.3387193,
        "MomeyuKa": 195.9904249, "CivilightEterna": 429.3836026, "wsouls": 568.5218432,
        "xici68": 252.8426092, "MingMo777": 484.7396768, "an_yue233": 450.3291442,
        "Frozen_Rinn": 218.4320766, "savagetricycle": 173.5487732, "lao_dan": 357.5703172,
        "songziqi0927": 82.28605625, "Venti_Lynn": 233.3931777, "Needle_Python": 495.2124476,
        "VicFighter": 130.1615799, "XieRiser": 459.3058049, "MCmuzixuange": 86.77438659,
        "ToastBreadMc": 89.76660682
    }
}

# 每个游戏的实际出战阵容（基于Excel数据中有分数的玩家）
GAME_LINEUPS = {
    "空岛战争": {
        "落地水队": ["sh1onari", "Discord_wuxu", "Flowerfruit", "OlivaFute"],
        "曲奇白巧": ["gdgfty", "Aut_moon_white", "cangqian", "sXKYYYY"],
        "绿队": ["zRenox", "Forest_Silence", "Wind_Forest"],
        "红队": ["Level_D", "K4ver", "NarciGD", "xiaoyuanxyz"],
        "锤神再起": ["xiaoheng66666", "Zoromtff", "Ning_meng_Cat", "Se_fletrir"],
        "魔芋爽": ["Lova_Eathtar", "hao145245", "_S0uvenir", "Sakura_Fu"],
        "维多利亚": ["CivilightEterna", "wsouls", "xici68"],
        "新春大吉队": ["MingMo777", "an_yue233", "Frozen_Rinn", "savagetricycle"],
        "hunter队": ["Needle_Python", "lao_dan", "Venti_Lynn", "songziqi0927"],
        "青队": ["VicFighter", "XieRiser", "MCmuzixuange", "ToastBreadMc"]
    },
    "宾果时速": {
        "落地水队": ["sh1onari", "Discord_wuxu", "Flowerfruit", "OlivaFute"],
        "曲奇白巧": ["gdgfty", "Aut_moon_white", "cangqian", "sXKYYYY"],
        "绿队": ["zRenox", "Forest_Silence", "Wind_Forest", "chara12121"],
        "红队": ["K4ver", "NarciGD", "xiaoyuanxyz", "BCMonomial"],
        "锤神再起": ["xiaoheng66666", "Zoromtff", "Ning_meng_Cat", "Se_fletrir"],
        "魔芋爽": ["Lova_Eathtar", "hao145245", "_S0uvenir", "Sakura_Fu"],
        "维多利亚": ["CivilightEterna", "wsouls", "xici68", "MomeyuKa"],
        "新春大吉队": ["MingMo777", "an_yue233", "Frozen_Rinn", "savagetricycle"],
        "hunter队": ["Needle_Python", "lao_dan", "Venti_Lynn", "songziqi0927"],
        "青队": ["VicFighter", "XieRiser", "MCmuzixuange", "ToastBreadMc"]
    },
    "斗战方框": {
        "落地水队": ["sh1onari", "Flowerfruit", "OlivaFute"],  # Discord_wuxu没有分数
        "曲奇白巧": ["gdgfty", "Aut_moon_white", "cangqian", "sXKYYYY"],
        "绿队": ["zRenox", "Forest_Silence", "chara12121"],  # Wind_Forest没有分数
        "红队": ["Level_D", "K4ver", "NarciGD", "xiaoyuanxyz"],
        "锤神再起": ["xiaoheng66666", "Zoromtff", "Ning_meng_Cat", "Se_fletrir"],
        "魔芋爽": ["Lova_Eathtar", "hao145245", "_S0uvenir", "Sakura_Fu"],
        "维多利亚": ["CivilightEterna", "wsouls", "xici68", "MomeyuKa"],
        "新春大吉队": ["MingMo777", "an_yue233", "Frozen_Rinn", "savagetricycle"],
        "hunter队": ["lao_dan", "songziqi0927", "Needle_Python"],  # Venti_Lynn没有分数
        "青队": ["VicFighter", "XieRiser", "MCmuzixuange", "ToastBreadMc"]
    },
    "雪球乱斗": {
        "落地水队": ["sh1onari", "Discord_wuxu", "Flowerfruit", "OlivaFute"],
        "曲奇白巧": ["gdgfty", "Aut_moon_white", "cangqian", "sXKYYYY"],
        "绿队": ["zRenox", "Forest_Silence", "goob233", "ChanceLetHay"],
        "红队": ["Level_D", "K4ver", "NarciGD", "xiaoyuanxyz"],
        "锤神再起": ["xiaoheng66666", "Zoromtff", "Ning_meng_Cat", "Se_fletrir"],
        "魔芋爽": ["Lova_Eathtar", "hao145245", "_S0uvenir", "Sakura_Fu"],
        "维多利亚": ["CivilightEterna", "wsouls", "xici68", "MomeyuKa"],
        "新春大吉队": ["MingMo777", "an_yue233", "Frozen_Rinn", "savagetricycle"],
        "hunter队": ["Needle_Python", "lao_dan", "Venti_Lynn", "songziqi0927"],
        "青队": ["VicFighter", "XieRiser", "MCmuzixuange", "ToastBreadMc"]
    },
    "TNT快跑": {
        "落地水队": ["sh1onari", "Discord_wuxu", "Flowerfruit", "OlivaFute"],
        "曲奇白巧": ["gdgfty", "Aut_moon_white", "cangqian", "sXKYYYY"],
        "绿队": ["zRenox", "Forest_Silence", "goob233", "ChanceLetHay"],
        "红队": ["Level_D", "K4ver", "NarciGD", "xiaoyuanxyz"],
        "锤神再起": ["xiaoheng66666", "Zoromtff", "Ning_meng_Cat", "Se_fletrir"],
        "魔芋爽": ["Lova_Eathtar", "hao145245", "_S0uvenir", "Sakura_Fu"],
        "维多利亚": ["CivilightEterna", "wsouls", "xici68", "MomeyuKa"],
        "新春大吉队": ["MingMo777", "an_yue233", "Frozen_Rinn", "savagetricycle"],
        "hunter队": ["Needle_Python", "lao_dan", "Venti_Lynn", "songziqi0927"],
        "青队": ["VicFighter", "XieRiser", "MCmuzixuange", "ToastBreadMc"]
    },
    "去到那一边": {
        "落地水队": ["sh1onari", "Discord_wuxu", "Flowerfruit", "OlivaFute"],
        "曲奇白巧": ["gdgfty", "Aut_moon_white", "cangqian", "sXKYYYY"],
        "绿队": ["zRenox", "Forest_Silence", "goob233", "ChanceLetHay"],
        "红队": ["Level_D", "K4ver", "NarciGD", "xiaoyuanxyz"],
        "锤神再起": ["xiaoheng66666", "Zoromtff", "Ning_meng_Cat", "Se_fletrir"],
        "魔芋爽": ["Lova_Eathtar", "hao145245", "_S0uvenir", "Sakura_Fu"],
        "维多利亚": ["CivilightEterna", "wsouls", "xici68", "MomeyuKa"],
        "新春大吉队": ["MingMo777", "an_yue233", "Frozen_Rinn", "savagetricycle"],
        "hunter队": ["Needle_Python", "lao_dan", "Venti_Lynn", "songziqi0927"],
        "青队": ["VicFighter", "XieRiser", "MCmuzixuange", "ToastBreadMc"]
    }
}

def handle_api_error(response: requests.Response, context: str):
    """统一处理API请求错误"""
    print(f"错误: {context} 失败，状态码: {response.status_code}")
    try:
        print("API响应: ", response.json())
    except json.JSONDecodeError:
        print("API响应: ", response.text)
    raise SystemExit(f"脚本因API错误而终止: {context}")

def import_data():
    """主函数，执行整个导入流程"""
    print("开始导入W²CC冬季联动锦标赛数据...")
    print("使用新的比赛专属队伍系统...")

    # 用于存储API返回的ID，避免重复创建
    user_name_to_id = {}
    game_name_to_id = {}

    # --- 步骤 1: 创建独立实体 (Users, Games) ---

    print("\n步骤 1.1: 创建玩家 (Users)...")
    all_players = set()
    for team in TEAMS_DATA:
        all_players.update(team['main_players'])
        all_players.update(team['substitutes'])
    
    for player_name in sorted(list(all_players)):
        if player_name not in user_name_to_id:
            payload = {
                "nickname": player_name,
                "display_name": player_name,
                "source": ""
            }
            response = requests.post(f"{API_BASE_URL}/users/", json=payload, headers=HEADERS)
            if response.status_code in [200, 201]:  # 接受200和201状态码
                user_id = response.json()['id']
                user_name_to_id[player_name] = user_id
                print(f"  - 成功创建玩家: {player_name} (ID: {user_id})")
            else:
                handle_api_error(response, f"创建玩家 {player_name}")

    print("\n步骤 1.2: 创建比赛项目 (Games)...")
    for game in GAME_NAMES:
        game_name = game['name']
        if game_name not in game_name_to_id:
            payload = {
                "name": game_name, 
                "code": game['code'],  # 添加code字段
                "description": game['description']
            }
            response = requests.post(f"{API_BASE_URL}/games/", json=payload, headers=HEADERS)
            if response.status_code in [200, 201]:  # 接受200和201状态码
                game_id = response.json()['id']
                game_name_to_id[game_name] = game_id
                print(f"  - 成功创建项目: {game_name} (ID: {game_id})")
            else:
                handle_api_error(response, f"创建项目 {game_name}")

    # --- 步骤 2: 创建比赛 ---
    print("\n步骤 2: 创建W²CC冬季联动锦标赛...")
    
    # 创建赛程
    match_games_payload = []
    for i, game in enumerate(GAME_NAMES):
        game_id = game_name_to_id[game['name']]
        match_games_payload.append({
            "game_id": game_id,
            "game_order": i + 1,
            "structure_type": f"积分赛",
            "structure_details": {
                "description": game['description'],
                "multiplier": game['multiplier'],
                "round": i + 1,
                "code": game['code']
            }
        })
    
    # 设置比赛时间（2025年2月2日）
    match_start_time = "2025-02-02T19:00:00"
    match_end_time = "2025-02-02T22:30:00"
    
    match_payload = {
        "name": "W²CC冬季联动锦标赛",
        "description": "所以游目骋怀，足以极视听之娱，信可乐也。",
        "start_time": match_start_time,
        "end_time": match_end_time,
        "status": "finished",
        "max_teams": 12,
        "max_players_per_team": 6,
        "allow_substitutes": True,
        "match_games": match_games_payload
    }
    
    response = requests.post(f"{API_BASE_URL}/matches/", json=match_payload, headers=HEADERS)
    if response.status_code in [200, 201]:  # 接受200和201状态码
        match_response_data = response.json()
        match_id = match_response_data['id']
        print(f"  - 成功创建比赛: {match_response_data['name']} (ID: {match_id})")
    else:
        handle_api_error(response, "创建W²CC比赛")

    # --- 步骤 3: 创建比赛专属队伍 ---
    print("\n步骤 3: 创建比赛专属队伍...")
    
    match_team_name_to_id = {}
    
    for team in TEAMS_DATA:
        # 准备队员数据
        members_data = []
        
        # 添加主力队员
        for player_name in team['main_players']:
            user_id = user_name_to_id[player_name]
            members_data.append({
                "user_id": user_id,
                "role": "captain" if player_name == team['main_players'][0] else "main"
            })
        
        # 添加替补队员
        for player_name in team['substitutes']:
            user_id = user_name_to_id[player_name]
            members_data.append({
                "user_id": user_id,
                "role": "substitute"
            })
        
        team_payload = {
            "name": team['name'],
            "color": team['color'],
            "members": members_data
        }
        
        response = requests.post(f"{API_BASE_URL}/matches/{match_id}/teams", json=team_payload, headers=HEADERS)
        if response.status_code in [200, 201]:  # 接受200和201状态码
            team_data = response.json()
            team_id = team_data['id']
            match_team_name_to_id[team['name']] = team_id
            print(f"  - 成功创建队伍: {team['name']} (ID: {team_id}), 队员: {len(members_data)}名")
        else:
            handle_api_error(response, f"创建队伍 {team['name']}")

    # --- 步骤 4: 获取赛程ID映射 ---
    print("\n步骤 4: 获取赛程ID映射...")
    
    # 获取比赛的所有赛程
    response = requests.get(f"{API_BASE_URL}/matches/{match_id}/games")
    if response.status_code == 200:
        match_games = response.json()
        print(f"  - 获取到 {len(match_games)} 个赛程")
        
        game_id_to_match_game_id = {}
        for mg in match_games:
            game_id_to_match_game_id[mg['game_id']] = mg['id']
            # 找到对应的游戏名称
            game_name = next((g['name'] for g in GAME_NAMES if game_name_to_id[g['name']] == mg['game_id']), 'Unknown')
            print(f"    映射: {game_name} (game_id {mg['game_id']}) -> match_game_id {mg['id']}")
    else:
        handle_api_error(response, "获取比赛赛程")

    # --- 步骤 5: 设置每个游戏的出战阵容 ---
    print("\n步骤 5: 设置每个游戏的出战阵容...")
    
    for game_name, lineups in GAME_LINEUPS.items():
        game_id = game_name_to_id[game_name]
        match_game_id = game_id_to_match_game_id.get(game_id)
        
        if not match_game_id:
            print(f"  - 警告: 找不到 {game_name} 的赛程ID，跳过阵容设置")
            continue
            
        print(f"  设置 {game_name} 出战阵容...")
        
        # 准备阵容数据
        team_lineups = {}
        substitute_info = {}
        
        for team_name, players in lineups.items():
            if team_name not in match_team_name_to_id:
                continue
                
            team_id = match_team_name_to_id[team_name]
            player_ids = []
            
            for player_name in players:
                if player_name in user_name_to_id:
                    user_id = user_name_to_id[player_name]
                    player_ids.append(user_id)
                    
                    # 检查是否为替补上场
                    team_data = next(t for t in TEAMS_DATA if t['name'] == team_name)
                    if player_name in team_data['substitutes']:
                        substitute_info[str(user_id)] = "替补队员临时上场"
            
            if player_ids:
                team_lineups[team_id] = player_ids
        
        # 设置阵容
        lineup_payload = {
            "team_lineups": team_lineups,
            "substitute_info": substitute_info
        }
        
        response = requests.post(f"{API_BASE_URL}/matches/games/{match_game_id}/lineups", 
                               json=lineup_payload, headers=HEADERS)
        if response.status_code == 200:
            total_players = sum(len(players) for players in team_lineups.values())
            print(f"    ✓ 成功设置阵容，共 {total_players} 名出战队员")
        else:
            print(f"    ✗ 设置阵容失败: {response.status_code}")

    # --- 步骤 6: 录入分数 ---
    print("\n步骤 6: 录入比赛分数...")
    
    total_scores = sum(len(scores) for scores in GAME_SCORES.values())
    posted_scores_count = 0
    
    for game_name, scores in GAME_SCORES.items():
        game_id = game_name_to_id[game_name]
        match_game_id = game_id_to_match_game_id.get(game_id)
        
        if not match_game_id:
            print(f"  - 警告: 找不到 {game_name} 的赛程ID，跳过分数录入")
            continue
            
        print(f"\n  录入 {game_name} 分数...")
        
        for player_name, score_value in scores.items():
            # 跳过分数为0的玩家（表示未参赛）
            if score_value <= 0:
                continue
                
            if player_name not in user_name_to_id:
                print(f"    警告: 找不到玩家 {player_name}，跳过")
                continue
                
            user_id = user_name_to_id[player_name]
            
            # 找到该玩家所属的队伍
            player_team = None
            for team in TEAMS_DATA:
                if player_name in team['main_players'] or player_name in team['substitutes']:
                    player_team = team
                    break
                    
            if not player_team:
                print(f"    警告: 找不到玩家 {player_name} 的队伍，跳过")
                continue
                
            team_id = match_team_name_to_id[player_team['name']]
            
            score_payload = {
                "points": int(round(score_value)),  # 取整处理
                "user_id": user_id,
                "team_id": team_id,  # 现在使用match_team_id
                "event_data": {
                    "game_name": game_name,
                    "player_name": player_name,
                    "team_name": player_team['name'],
                    "raw_score": score_value  # 保留原始小数
                }
            }
            
            url = f"{API_BASE_URL}/matches/games/{match_game_id}/scores"
            response = requests.post(url, json=score_payload, headers=HEADERS)
            
            if response.status_code in [200, 201]:  # 接受200和201状态码
                posted_scores_count += 1
                print(f"    ✓ ({posted_scores_count}/{total_scores}) {player_name}: {score_value:.2f}分 (取整: {int(round(score_value))})")
            else:
                print(f"    ✗ 录入失败: {player_name} - {response.status_code}")
            
            time.sleep(0.01)  # 避免请求过快

    # --- 步骤 7: 设置冠军 ---
    print("\n步骤 7: 设置比赛结果...")
    champion_team = next((team for team in TEAMS_DATA if team.get('is_champion')), None)
    if champion_team:
        champion_team_id = match_team_name_to_id[champion_team['name']]
        
        update_payload = {
            "status": "finished",
            "winning_team_id": champion_team_id  # 设置冠军队伍ID
        }
        response = requests.put(f"{API_BASE_URL}/matches/{match_id}", json=update_payload, headers=HEADERS)
        if response.status_code == 200:
            print(f"  - 成功设置比赛状态为已完成")
            print(f"  - 霜冻狂潮冠军: {champion_team['name']} (队伍ID: {champion_team_id})")
        else:
            print(f"  - 设置比赛结果失败: {response.status_code}")
            try:
                print(f"  - 错误详情: {response.json()}")
            except:
                print(f"  - 错误详情: {response.text}")
    else:
        print("  - 未找到冠军队伍标记")

    # --- 步骤 8: 触发最终分数计算 ---
    print("\n步骤 8: 触发最终分数与排名计算...")
    recalculate_url = f"{API_BASE_URL}/matches/{match_id}/standard-scores/recalculate"
    response = requests.post(recalculate_url, headers=HEADERS)
    if response.status_code == 200:
        print("  - ✓ 成功触发全比赛分数重算。")
    else:
        handle_api_error(response, "触发全比赛分数重算")

    print(f"\n🎉 W²CC冬季联动锦标赛数据导入完成！")
    print(f"   - 创建了 {len(user_name_to_id)} 位玩家")
    print(f"   - 创建了 {len(match_team_name_to_id)} 支比赛队伍")
    print(f"   - 创建了 {len(game_name_to_id)} 个游戏项目")
    print(f"   - 设置了 {len(GAME_LINEUPS)} 个游戏的出战阵容")
    print(f"   - 录入了 {posted_scores_count} 条分数记录")
    print(f"   - 霜冻狂潮冠军队伍: {champion_team['name'] if champion_team else '未设置'}")
    print(f"   - 支持替补机制和多队伍参与")

if __name__ == "__main__":
    import_data()
```

```
import requests
import json
import time
from typing import Dict, Any

# --- 配置 ---
# 请将 'http://your-api-server.com' 替换为您的API服务器地址
API_BASE_URL = "http://127.0.0.1:8000/api"
# 请将 'YOUR_SECRET_API_KEY' 替换为您有效的API密钥
API_KEY = "YOUR_SECRET_API_KEY"
# --- 配置结束 ---

# 设置请求头
HEADERS = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
}

# --- SCC 真实数据 ---

# SCC 比赛游戏项目定义 (包含推测的系数)
GAME_NAMES_SCC = [
    {"name": "斗战方框", "description": "团队项目 - BattleBox", "multiplier": 1.0, "code": "BattleBox"},
    {"name": "空岛战争", "description": "个人项目 - SkyWars", "multiplier": 1.5, "code": "SkyWars"},
    {"name": "Bingo", "description": "团队项目 - Bingo", "multiplier": 1.5, "code": "Bingo"},
    {"name": "TNTRun", "description": "个人项目 - TNTRun", "multiplier": 2.0, "code": "TNTRun"},
    {"name": "跑酷追击", "description": "团队项目 - ParkourTag", "multiplier": 2.0, "code": "ParkourTag"},
    {"name": "跑酷战士", "description": "个人项目 - ParkourWarrior", "multiplier": 2.5, "code": "ParkourWarrior"}
]

# SCC 队伍和玩家数据
TEAMS_DATA_SCC = [
    {"name": "红队", "color": "#FF0000", "players": ["Aut_moon_white", "lao_dan", "sXKYYYY", "gdgfty"]},
    {"name": "橙队", "color": "#FFA500", "players": ["YK_yuki", "Tenacity__", "Stlinosuke", "Tamakochika"]},
    {"name": "蓝队", "color": "#0000FF", "players": ["AnTooLot_254890", "gumorsir", "ATRI_QWQ", "TianyaOVO"]},
    {"name": "绿队", "color": "#008000", "players": ["StarsYu", "wsouls", "PeaceYoooooo", "ATSmok"]},
    {"name": "黄队", "color": "#FFFF00", "players": ["AchilliesPRIDE", "Q_Official", "LgdandLgm", "Thunder50BMG"]},
    {"name": "青队", "color": "#00FFFF", "players": ["Kevin_Lestek", "laffeyDD724", "Livefaster", "Morton_y"]},
    {"name": "紫队", "color": "#800080", "players": ["gengER", "BaggyPark", "Nock_ZZC", "Wise_Starx"]},
    {"name": "白队", "color": "#FFFFFF", "players": ["goob233", "XiuRanYing", "Needle_Python", "long_zhi_zi"], "is_champion": True},
    {"name": "粉红队", "color": "#FFC0CB", "players": ["xiaoyuanxyz", "MingMo777", "Ning_meng_Cat", "GreenHandkignt1"]},
    {"name": "棕队", "color": "#964B00", "players": ["zRenox", "Forest_Silence", "wei_xin", "logicalkeys"]},
    {"name": "淡蓝队", "color": "#ADD8E6", "players": ["xiaoheng66666", "xiaoyao04", "Venti_Lynn", "K4ver"]},
    {"name": "淡灰队", "color": "#D3D3D3", "players": ["LazyOrz", "Frozen_Rinn", "ji_mo_run", "BlankChips"]},
]

# SCC 各项目原始分数 (未加权)
# 团队项目分数在队伍内个人中是相同的
GAME_SCORES_SCC = {
    "斗战方框": {
        "Aut_moon_white": 290, "lao_dan": 290, "sXKYYYY": 290, "gdgfty": 290,
        "YK_yuki": 137.5, "Tenacity__": 137.5, "Stlinosuke": 137.5, "Tamakochika": 137.5,
        "AnTooLot_254890": 152.5, "gumorsir": 152.5, "ATRI_QWQ": 152.5, "TianyaOVO": 152.5,
        "StarsYu": 228.75, "wsouls": 228.75, "PeaceYoooooo": 228.75, "ATSmok": 228.75,
        "AchilliesPRIDE": 336.25, "Q_Official": 336.25, "LgdandLgm": 336.25, "Thunder50BMG": 336.25,
        "Kevin_Lestek": 72.5, "laffeyDD724": 72.5, "Livefaster": 72.5, "Morton_y": 72.5,
        "gengER": 375, "BaggyPark": 375, "Nock_ZZC": 375, "Wise_Starx": 375,
        "goob233": 405, "XiuRanYing": 405, "Needle_Python": 405, "long_zhi_zi": 405,
        "xiaoyuanxyz": 176.25, "MingMo777": 176.25, "Ning_meng_Cat": 176.25, "GreenHandkignt1": 176.25,
        "zRenox": 386.25, "Forest_Silence": 386.25, "wei_xin": 386.25, "logicalkeys": 386.25,
        "xiaoheng66666": 371.25, "xiaoyao04": 371.25, "Venti_Lynn": 371.25, "K4ver": 371.25,
        "LazyOrz": 275, "Frozen_Rinn": 275, "ji_mo_run": 275, "BlankChips": 275,
    },
    "空岛战争": {
        "Aut_moon_white": 196, "lao_dan": 172, "sXKYYYY": 158, "gdgfty": 182,
        "YK_yuki": 302, "Tenacity__": 284, "Stlinosuke": 506, "Tamakochika": 288,
        "AnTooLot_254890": 90, "gumorsir": 88, "ATRI_QWQ": 178, "TianyaOVO": 200,
        "StarsYu": 226, "wsouls": 150, "PeaceYoooooo": 56, "ATSmok": 186,
        "AchilliesPRIDE": 330, "Q_Official": 200, "LgdandLgm": 420, "Thunder50BMG": 622,
        "Kevin_Lestek": 192, "laffeyDD724": 180, "Livefaster": 70, "Morton_y": 70,
        "gengER": 254, "BaggyPark": 516, "Nock_ZZC": 380, "Wise_Starx": 240,
        "goob233": 344, "XiuRanYing": 316, "Needle_Python": 746, "long_zhi_zi": 450,
        "xiaoyuanxyz": 106, "MingMo777": 294, "Ning_meng_Cat": 270, "GreenHandkignt1": 186,
        "zRenox": 360, "Forest_Silence": 400, "wei_xin": 152, "logicalkeys": 30,
        "xiaoheng66666": 408, "xiaoyao04": 270, "Venti_Lynn": 212, "K4ver": 506,
        "LazyOrz": 148, "Frozen_Rinn": 244, "ji_mo_run": 150, "BlankChips": 154,
    },
    "Bingo": {
        "Aut_moon_white": 355, "lao_dan": 355, "sXKYYYY": 355, "gdgfty": 355,
        "YK_yuki": 300, "Tenacity__": 300, "Stlinosuke": 300, "Tamakochika": 300,
        "AnTooLot_254890": 135, "gumorsir": 135, "ATRI_QWQ": 135, "TianyaOVO": 135,
        "StarsYu": 205, "wsouls": 205, "PeaceYoooooo": 205, "ATSmok": 205,
        "AchilliesPRIDE": 115, "Q_Official": 115, "LgdandLgm": 115, "Thunder50BMG": 115,
        "Kevin_Lestek": 170, "laffeyDD724": 170, "Livefaster": 170, "Morton_y": 170,
        "gengER": 70, "BaggyPark": 70, "Nock_ZZC": 70, "Wise_Starx": 70,
        "goob233": 160, "XiuRanYing": 160, "Needle_Python": 160, "long_zhi_zi": 160,
        "xiaoyuanxyz": 155, "MingMo777": 155, "Ning_meng_Cat": 155, "GreenHandkignt1": 155,
        "zRenox": 245, "Forest_Silence": 245, "wei_xin": 245, "logicalkeys": 245,
        "xiaoheng66666": 255, "xiaoyao04": 255, "Venti_Lynn": 255, "K4ver": 255,
        "LazyOrz": 175, "Frozen_Rinn": 175, "ji_mo_run": 175, "BlankChips": 175,
    },
    "TNTRun": {
        "Aut_moon_white": 288, "lao_dan": 252, "sXKYYYY": 444, "gdgfty": 408,
        "YK_yuki": 116, "Tenacity__": 406, "Stlinosuke": 440, "Tamakochika": 478,
        "AnTooLot_254890": 80, "gumorsir": 264, "ATRI_QWQ": 316, "TianyaOVO": 370,
        "StarsYu": 384, "wsouls": 420, "PeaceYoooooo": 280, "ATSmok": 140,
        "AchilliesPRIDE": 164, "Q_Official": 260, "LgdandLgm": 140, "Thunder50BMG": 288,
        "Kevin_Lestek": 136, "laffeyDD724": 112, "Livefaster": 100, "Morton_y": 272,
        "gengER": 112, "BaggyPark": 360, "Nock_ZZC": 450, "Wise_Starx": 344,
        "goob233": 424, "XiuRanYing": 244, "Needle_Python": 428, "long_zhi_zi": 432,
        "xiaoyuanxyz": 144, "MingMo777": 538, "Ning_meng_Cat": 504, "GreenHandkignt1": 84,
        "zRenox": 752, "Forest_Silence": 236, "wei_xin": 120, "logicalkeys": 160,
        "xiaoheng66666": 416, "xiaoyao04": 204, "Venti_Lynn": 176, "K4ver": 450,
        "LazyOrz": 244, "Frozen_Rinn": 440, "ji_mo_run": 52, "BlankChips": 264,
    },
    "跑酷追击": {
        "Aut_moon_white": 458, "lao_dan": 458, "sXKYYYY": 458, "gdgfty": 458,
        "YK_yuki": 218, "Tenacity__": 218, "Stlinosuke": 218, "Tamakochika": 218,
        "AnTooLot_254890": 88, "gumorsir": 88, "ATRI_QWQ": 88, "TianyaOVO": 88,
        "StarsYu": 297, "wsouls": 297, "PeaceYoooooo": 297, "ATSmok": 297,
        "AchilliesPRIDE": 217, "Q_Official": 217, "LgdandLgm": 217, "Thunder50BMG": 217,
        "Kevin_Lestek": 131, "laffeyDD724": 131, "Livefaster": 131, "Morton_y": 131,
        "gengER": 154.25, "BaggyPark": 154.25, "Nock_ZZC": 154.25, "Wise_Starx": 154.25,
        "goob233": 453.25, "XiuRanYing": 453.25, "Needle_Python": 453.25, "long_zhi_zi": 453.25,
        "xiaoyuanxyz": 258, "MingMo777": 258, "Ning_meng_Cat": 258, "GreenHandkignt1": 258,
        "zRenox": 297.5, "Forest_Silence": 297.5, "wei_xin": 297.5, "logicalkeys": 297.5,
        "xiaoheng66666": 217, "xiaoyao04": 217, "Venti_Lynn": 217, "K4ver": 217,
        "LazyOrz": 267.75, "Frozen_Rinn": 267.75, "ji_mo_run": 267.75, "BlankChips": 267.75,
    },
    "跑酷战士": {
        "Aut_moon_white": 455, "lao_dan": 535, "sXKYYYY": 455, "gdgfty": 455,
        "YK_yuki": 340, "Tenacity__": 535, "Stlinosuke": 535, "Tamakochika": 405,
        "AnTooLot_254890": 160, "gumorsir": 290, "ATRI_QWQ": 355, "TianyaOVO": 340,
        "StarsYu": 470, "wsouls": 405, "PeaceYoooooo": 225, "ATSmok": 390,
        "AchilliesPRIDE": 390, "Q_Official": 340, "LgdandLgm": 390, "Thunder50BMG": 470,
        "Kevin_Lestek": 405, "laffeyDD724": 455, "Livefaster": 160, "Morton_y": 325,
        "gengER": 160, "BaggyPark": 405, "Nock_ZZC": 290, "Wise_Starx": 325,
        "goob233": 455, "XiuRanYing": 420, "Needle_Python": 535, "long_zhi_zi": 550,
        "xiaoyuanxyz": 455, "MingMo777": 535, "Ning_meng_Cat": 585, "GreenHandkignt1": 30,
        "zRenox": 470, "Forest_Silence": 470, "wei_xin": 210, "logicalkeys": 290,
        "xiaoheng66666": 470, "xiaoyao04": 290, "Venti_Lynn": 225, "K4ver": 210,
        "LazyOrz": 0, "Frozen_Rinn": 470, "ji_mo_run": 290, "BlankChips": 535,
    }
}

# 自动生成每个游戏的出战阵容 (基于有分数的玩家)
GAME_LINEUPS_SCC = {}
for game_name, scores in GAME_SCORES_SCC.items():
    lineups_for_game = {}
    for team in TEAMS_DATA_SCC:
        team_lineup = []
        # 在SCC中，没有主力和替补之分
        all_team_players = team['players']
        for player in all_team_players:
            if scores.get(player, 0) > 0:
                team_lineup.append(player)
        if team_lineup:
            lineups_for_game[team['name']] = team_lineup
    GAME_LINEUPS_SCC[game_name] = lineups_for_game


def handle_api_error(response: requests.Response, context: str):
    """统一处理API请求错误"""
    print(f"错误: {context} 失败，状态码: {response.status_code}")
    try:
        print("API响应: ", response.json())
    except json.JSONDecodeError:
        print("API响应: ", response.text)
    raise SystemExit(f"脚本因API错误而终止: {context}")

def import_scc_data():
    """主函数，执行SCC比赛数据的导入流程"""
    print("开始导入SCC比赛数据...")

    user_name_to_id: Dict[str, int] = {}
    game_name_to_id: Dict[str, int] = {}

    # --- 步骤 1.1: 查询现有游戏项目 ---
    print("\n步骤 1.1: 查询现有游戏项目以避免重复...")
    try:
        response = requests.get(f"{API_BASE_URL}/games/", headers=HEADERS)
        if response.status_code == 200:
            existing_games = response.json()
            for game in existing_games:
                game_name_to_id[game['name']] = game['id']
            print(f"  - 查询到 {len(existing_games)} 个已存在的游戏项目。")
        else:
            handle_api_error(response, "查询现有游戏项目")
    except requests.exceptions.RequestException as e:
        raise SystemExit(f"无法连接到API服务器: {e}")

    # --- 步骤 1.2: 创建玩家 (Users) ---
    print("\n步骤 1.2: 创建或验证玩家 (Users)...")
    all_players = {player for team in TEAMS_DATA_SCC for player in team['players']}
    
    for player_name in sorted(list(all_players)):
        payload = {"nickname": player_name, "display_name": player_name, "source": "SCC"}
        response = requests.post(f"{API_BASE_URL}/users/", json=payload, headers=HEADERS)
        if response.status_code in [200, 201]:
            user_id = response.json()['id']
            user_name_to_id[player_name] = user_id
            print(f"  - 成功创建玩家: {player_name} (ID: {user_id})")
        elif response.status_code == 409:
            user_res = requests.get(f"{API_BASE_URL}/users/nickname/{player_name}", headers=HEADERS)
            if user_res.status_code == 200:
                user_id = user_res.json()['id']
                user_name_to_id[player_name] = user_id
                print(f"  - 玩家已存在: {player_name} (ID: {user_id})")
            else:
                handle_api_error(response, f"获取已存在玩家 {player_name} 的ID")
        else:
            handle_api_error(response, f"创建玩家 {player_name}")

    # --- 步骤 1.3: 创建或验证比赛项目 (Games) ---
    print("\n步骤 1.3: 创建或验证比赛项目 (Games)...")
    for game in GAME_NAMES_SCC:
        game_name = game['name']
        if game_name not in game_name_to_id:
            print(f"  - 游戏 '{game_name}' 不存在，正在创建...")
            payload = {"name": game_name, "code": game['code'], "description": game['description']}
            response = requests.post(f"{API_BASE_URL}/games/", json=payload, headers=HEADERS)
            if response.status_code in [200, 201]:
                game_id = response.json()['id']
                game_name_to_id[game_name] = game_id
                print(f"    ✓ 成功创建项目: {game_name} (ID: {game_id})")
            else:
                handle_api_error(response, f"创建项目 {game_name}")
        else:
            print(f"  - ✓ 游戏 '{game_name}' 已存在 (ID: {game_name_to_id[game_name]})，跳过创建。")
            # 确保我们使用的是正确的中文名作为键
            if game['name'] not in game_name_to_id:
                 game_name_to_id[game['name']] = game_name_to_id[game_name]


    # --- 步骤 2: 创建比赛 ---
    print("\n步骤 2: 创建SCC比赛...")
    match_games_payload = []
    for i, game in enumerate(GAME_NAMES_SCC):
        game_id = game_name_to_id[game['name']]
        match_games_payload.append({
            "game_id": game_id,
            "game_order": i + 1,
            "structure_type": "团队/个人混合赛",
            "structure_details": {
                "description": game['description'],
                "multiplier": game['multiplier'],
                "round": i + 1,
                "code": game['code']
            }
        })
    
    match_payload = {
        "name": "SCC夏季联合锦标赛",
        "description": "所以游目骋怀，足以极视听之娱，信可乐也。",
        "start_time": "2023-08-05T19:00:00",
        "end_time": "2023-08-05T23:00:00",
        "status": "finished",
        "max_teams": 12,
        "max_players_per_team": 4,
        "allow_substitutes": False,
        "match_games": match_games_payload
    }
    
    response = requests.post(f"{API_BASE_URL}/matches/", json=match_payload, headers=HEADERS)
    if response.status_code in [200, 201]:
        match_response_data = response.json()
        match_id = match_response_data['id']
        print(f"  - 成功创建比赛: {match_response_data['name']} (ID: {match_id})")
    else:
        handle_api_error(response, "创建SCC比赛")

    # --- 步骤 3: 创建比赛专属队伍 ---
    print("\n步骤 3: 创建比赛专属队伍...")
    match_team_name_to_id: Dict[str, int] = {}
    
    for team in TEAMS_DATA_SCC:
        members_data = [{"user_id": user_name_to_id[player_name], "role": "main"} for player_name in team['players']]
        if members_data:
            members_data[0]['role'] = "captain" # 将第一个设为队长
        
        team_payload = {"name": team['name'], "color": team['color'], "members": members_data}
        
        response = requests.post(f"{API_BASE_URL}/matches/{match_id}/teams", json=team_payload, headers=HEADERS)
        if response.status_code in [200, 201]:
            team_data = response.json()
            team_id = team_data['id']
            match_team_name_to_id[team['name']] = team_id
            print(f"  - 成功创建队伍: {team['name']} (ID: {team_id})")
        else:
            handle_api_error(response, f"创建队伍 {team['name']}")

    # --- 步骤 4: 获取赛程ID映射 ---
    print("\n步骤 4: 获取赛程ID映射...")
    response = requests.get(f"{API_BASE_URL}/matches/{match_id}/games")
    if response.status_code == 200:
        match_games = response.json()
        game_id_to_match_game_id = {mg['game_id']: mg['id'] for mg in match_games}
        # 创建一个从中文游戏名到 match_game_id 的直接映射
        game_name_to_match_game_id = {}
        for game_name, game_id in game_name_to_id.items():
            if game_id in game_id_to_match_game_id:
                game_name_to_match_game_id[game_name] = game_id_to_match_game_id[game_id]
        print(f"  - 成功获取 {len(game_name_to_match_game_id)} 个赛程的ID映射。")
    else:
        handle_api_error(response, "获取比赛赛程")

    # --- 步骤 5: 设置每个游戏的出战阵容 ---
    print("\n步骤 5: 设置每个游戏的出战阵容...")
    
    for game_name, lineups in GAME_LINEUPS_SCC.items():
        # 使用中文名找到对应的 match_game_id
        match_game_id = game_name_to_match_game_id.get(game_name)
        
        if not match_game_id:
            print(f"  - 警告: 找不到 {game_name} 的赛程ID，跳过阵容设置")
            continue
            
        print(f"  设置 {game_name} 出战阵容...")
        
        team_lineups = {}
        for team_name, players in lineups.items():
            if team_name in match_team_name_to_id:
                team_id = match_team_name_to_id[team_name]
                player_ids = [user_name_to_id[p] for p in players if p in user_name_to_id]
                team_lineups[str(team_id)] = player_ids
        
        # SCC没有替补，所以 substitute_info 为空
        lineup_payload = {"team_lineups": team_lineups, "substitute_info": {}}
        
        response = requests.post(f"{API_BASE_URL}/matches/games/{match_game_id}/lineups",
                               json=lineup_payload, headers=HEADERS)
        if response.status_code == 200:
            total_players = sum(len(p) for p in team_lineups.values())
            print(f"    ✓ 成功设置阵容，共 {len(team_lineups)} 支队伍, {total_players} 名出战队员")
        else:
            handle_api_error(response, f"为 {game_name} 设置阵容")

    # --- 步骤 6: 录入分数 ---
    print("\n步骤 6: 录入比赛分数 (使用原始分)...")
    
    total_scores = sum(1 for scores in GAME_SCORES_SCC.values() for score in scores.values() if score > 0)
    posted_scores_count = 0

    for game_name, scores in GAME_SCORES_SCC.items():
        match_game_id = game_name_to_match_game_id.get(game_name)
        if not match_game_id:
            print(f"  - 警告: 找不到 {game_name} 的赛程ID，跳过分数录入。")
            continue
            
        print(f"\n  录入 {game_name} 分数...")
        
        for player_name, score_value in scores.items():
            if score_value <= 0: continue
            
            user_id = user_name_to_id.get(player_name)
            if not user_id:
                 print(f"    警告: 找不到玩家 {player_name}，跳过")
                 continue

            player_team = next((t for t in TEAMS_DATA_SCC if player_name in t['players']), None)
            if not player_team:
                print(f"    警告: 找不到玩家 {player_name} 的队伍，跳过。")
                continue
                
            team_id = match_team_name_to_id[player_team['name']]
            
            score_payload = {
                "points": int(round(score_value)),  # 转换为整数
                "user_id": user_id,
                "team_id": team_id,
                "event_data": {"source": "SCC Table", "raw_score": score_value}  # 保留原始分数
            }
            
            url = f"{API_BASE_URL}/matches/games/{match_game_id}/scores"
            response = requests.post(url, json=score_payload, headers=HEADERS)
            
            if response.status_code in [200, 201]:
                posted_scores_count += 1
                print(f"    ✓ ({posted_scores_count}/{total_scores}) {player_name}: {score_value}分")
            else:
                 handle_api_error(response, f"录入分数 for {player_name} in {game_name}")
            time.sleep(0.01)

    # --- 步骤 7: 设置冠军 ---
    print("\n步骤 7: 设置比赛结果...")
    champion_team_data = next((team for team in TEAMS_DATA_SCC if team.get('is_champion')), None)
    if champion_team_data:
        champion_team_name = champion_team_data['name']
        champion_team_id = match_team_name_to_id.get(champion_team_name)
        
        if champion_team_id:
            print(f"  - 正在设置比赛冠军为: {champion_team_name} (ID: {champion_team_id})")
            update_payload = {"winning_team_id": champion_team_id}
            response = requests.put(f"{API_BASE_URL}/matches/{match_id}", json=update_payload, headers=HEADERS)
            if response.status_code == 200:
                print(f"    ✓ 成功设置冠军队伍。")
            else:
                handle_api_error(response, f"设置冠军队伍 {champion_team_name}")
        else:
            print(f"  - 警告: 找不到冠军队伍 '{champion_team_name}' 的ID，无法设置冠军。")
    else:
        print("  - 未在数据源中找到冠军队伍标记。")

    # --- 步骤 8: 触发最终分数计算 ---
    print("\n步骤 8: 触发最终分数与排名计算...")
    recalculate_url = f"{API_BASE_URL}/matches/{match_id}/standard-scores/recalculate"
    response = requests.post(recalculate_url, headers=HEADERS)
    if response.status_code == 200:
        print("  - ✓ 成功触发全比赛分数重算。")
    else:
        handle_api_error(response, "触发全比赛分数重算")

    print(f"\n🎉 SCC 数据导入完成！")

if __name__ == "__main__":
    import_scc_data()
```

```
import requests
import json
import time
from datetime import datetime, timedelta

# --- 配置 ---
# 请将 'http://your-api-server.com' 替换为您的API服务器地址
API_BASE_URL = "https://cc.ziip.space/api/api"
# 请将 'YOUR_SECRET_API_KEY' 替换为您有效的API密钥
API_KEY = "YOUR_SECRET_API_KEY"
# --- 配置结束 ---

# 设置请求头
HEADERS = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
}

# --- WCC锦标赛真实数据 ---
GAME_NAMES = [
    # code与W²CC保持一致，用于识别同类型游戏
    {"name": "SkyWars", "description": "空中岛屿PVP对战", "multiplier": 1.0, "code": "SkyWars"},
    {"name": "BattleBox", "description": "狭小空间内的激烈对战", "multiplier": 1.0, "code": "BattleBox"},
    {"name": "Bingo", "description": "快速完成任务收集", "multiplier": 1.125, "code": "Bingo"},
    {"name": "TNTRun", "description": "在TNT爆炸前快速逃生", "multiplier": 1.5, "code": "TNTRun"},
    {"name": "SnowballShowdown", "description": "使用雪球进行团队战斗", "multiplier": 1.125, "code": "SnowballShowdown"},
    {"name": "ParkourTag", "description": "跑酷追逐的团队游戏", "multiplier": 2.0, "code": "ParkourTag"} # 新增游戏
]

# WCC锦标赛队伍和玩家数据
TEAMS_DATA = [
    {
        "name": "锤神启动", "color": "#0043d9", "team_rank": 1,
        "main_players": ["Se_fletrir", "Ning_meng_Cat", "Zoromtff", "xiaoheng66666"],
        "substitutes": []
    },
    {
        "name": "雪楔石", "color": "#ff0000", "team_rank": 2,
        "main_players": ["long_zhi_zi", "Needle_Python", "XiuRanYing", "goob233"],
        "substitutes": [],
        "is_champion": True

    },
    {
        "name": "萌芽", "color": "#32feff", "team_rank": 3,
        "main_players": ["zRenox", "Sprig42", "Forest_Silence", "Fatalism"],
        "substitutes": []
    },
    {
        "name": "维多利亚", "color": "#00FF00", "team_rank": 4, # 使用了不同的颜色
        "main_players": ["MomeyuKa", "StarsYu", "wsouls", "K4ver"],
        "substitutes": ["xiaoyuanxyz"] # 根据得分情况，小院更像替补
    },
    {
        "name": "你说的队", "color": "#c241ff", "team_rank": 5,
        "main_players": ["Stlinosuke", "SmtXz", "Tamakochika", "Tenacity__"],
        "substitutes": []
    },
    {
        "name": "赭石队", "color": "#A52A2A", "team_rank": 6,
        "main_players": ["Thunder50BMG", "xtaotie233", "AkitukiYuzu", "BlankChips"],
        "substitutes": []
    },
    {
        "name": "曲奇白巧", "color": "#ffffff", "team_rank": 7, # 使用了不同的颜色
        "main_players": ["lao_dan", "gdgfty", "Aut_moon_white", "sXKYYYY"],
        "substitutes": []
    },
    {
        "name": "斯塔芙", "color": "#ADD8E6", "team_rank": 8,
        "main_players": ["ChenM0M", "Frozen_Rinn", "Shark_shadow", "MCmuzixuange"],
        "substitutes": []
    },
    {
        "name": "橘猫小六", "color": "#ff9d00", "team_rank": 9,
        "main_players": ["savagetricycle", "66_wq", "GreenHandkignt1", "MingMo777"],
        "substitutes": []
    },
    {
        "name": "落地水队", "color": "#f8f636", "team_rank": 10,
        "main_players": ["OlivaFute", "Ararylce", "WafuRei", "Discord_wuxu"],
        "substitutes": []
    },
    {
        "name": "毛线球队", "color": "#ff79c1", "team_rank": 11,
        "main_players": ["Meapuchino", "Sakura_Fu", "ppg777", "Izumi_gd"],
        "substitutes": []
    },
    {
        "name": "笨蛋队", "color": "#00ce03", "team_rank": 12,
        "main_players": ["Morton_y", "z0144154zzz", "livefaster", "Ryugakusan"],
        "substitutes": []
    }
]

# WCC锦标赛分数记录
GAME_SCORES = {
    "SkyWars": {
        "Thunder50BMG": 128, "xtaotie233": 140, "AkitukiYuzu": 224, "BlankChips": 214,
        "Se_fletrir": 442, "Ning_meng_Cat": 338, "Zoromtff": 254, "xiaoheng66666": 468,
        "Morton_y": 136, "z0144154zzz": 134, "livefaster": 78, "Ryugakusan": 146,
        "zRenox": 344, "Sprig42": 368, "Forest_Silence": 590, "Fatalism": 618,
        "lao_dan": 156, "gdgfty": 278, "Aut_moon_white": 212, "sXKYYYY": 230,
        "OlivaFute": 174, "Ararylce": 198, "WafuRei": 316, "Discord_wuxu": 246,
        "Stlinosuke": 62, "SmtXz": 446, "Tamakochika": 186, "Tenacity__": 294,
        "Meapuchino": 78, "Sakura_Fu": 464, "ppg777": 230, "Izumi_gd": 230,
        "long_zhi_zi": 358, "Needle_Python": 452, "XiuRanYing": 200, "goob233": 406,
        "ChenM0M": 198, "Frozen_Rinn": 254, "Shark_shadow": 86, "MCmuzixuange": 100,
        "MomeyuKa": 228, "xiaoyuanxyz": 0, "StarsYu": 238, "wsouls": 414, "K4ver": 152,
        "savagetricycle": 184, "66_wq": 274, "GreenHandkignt1": 140, "MingMo777": 204
    },
    "BattleBox": {
        "Thunder50BMG": 180, "xtaotie233": 165, "AkitukiYuzu": 120, "BlankChips": 195,
        "Se_fletrir": 365, "Ning_meng_Cat": 335, "Zoromtff": 275, "xiaoheng66666": 200,
        "Morton_y": 150, "z0144154zzz": 195, "livefaster": 180, "Ryugakusan": 165,
        "zRenox": 630, "Sprig42": 420, "Forest_Silence": 435, "Fatalism": 465,
        "lao_dan": 165, "gdgfty": 135, "Aut_moon_white": 120, "sXKYYYY": 120,
        "OlivaFute": 175, "Ararylce": 280, "WafuRei": 220, "Discord_wuxu": 250,
        "Stlinosuke": 220, "SmtXz": 295, "Tamakochika": 205, "Tenacity__": 220,
        "Meapuchino": 95, "Sakura_Fu": 200, "ppg777": 95, "Izumi_gd": 125,
        "long_zhi_zi": 550, "Needle_Python": 325, "XiuRanYing": 340, "goob233": 340,
        "ChenM0M": 135, "Frozen_Rinn": 240, "Shark_shadow": 195, "MCmuzixuange": 150,
        "MomeyuKa": 255, "xiaoyuanxyz": 0, "StarsYu": 360, "wsouls": 420, "K4ver": 315,
        "savagetricycle": 215, "66_wq": 200, "GreenHandkignt1": 215, "MingMo777": 230
    },
    "Bingo": {
        "Thunder50BMG": 630, "xtaotie233": 650, "AkitukiYuzu": 610, "BlankChips": 570,
        "Se_fletrir": 1040, "Ning_meng_Cat": 1080, "Zoromtff": 1000, "xiaoheng66666": 1020,
        "Morton_y": 450, "z0144154zzz": 290, "livefaster": 350, "Ryugakusan": 290,
        "zRenox": 700, "Sprig42": 540, "Forest_Silence": 680, "Fatalism": 580,
        "lao_dan": 520, "gdgfty": 540, "Aut_moon_white": 440, "sXKYYYY": 520,
        "OlivaFute": 320, "Ararylce": 340, "WafuRei": 360, "Discord_wuxu": 320,
        "Stlinosuke": 540, "SmtXz": 540, "Tamakochika": 540, "Tenacity__": 580,
        "Meapuchino": 330, "Sakura_Fu": 390, "ppg777": 290, "Izumi_gd": 330,
        "long_zhi_zi": 610, "Needle_Python": 650, "XiuRanYing": 670, "goob233": 730,
        "ChenM0M": 510, "Frozen_Rinn": 470, "Shark_shadow": 410, "MCmuzixuange": 470,
        "MomeyuKa": 360, "xiaoyuanxyz": 0, "StarsYu": 420, "wsouls": 360, "K4ver": 360,
        "savagetricycle": 440, "66_wq": 340, "GreenHandkignt1": 360, "MingMo777": 500
    },
    "TNTRun": {
        "Thunder50BMG": 106, "xtaotie233": 468, "AkitukiYuzu": 122, "BlankChips": 212,
        "Se_fletrir": 166, "Ning_meng_Cat": 166, "Zoromtff": 112, "xiaoheng66666": 316,
        "Morton_y": 40, "z0144154zzz": 30, "livefaster": 58, "Ryugakusan": 84,
        "zRenox": 158, "Sprig42": 174, "Forest_Silence": 124, "Fatalism": 164,
        "lao_dan": 198, "gdgfty": 316, "Aut_moon_white": 158, "sXKYYYY": 322,
        "OlivaFute": 62, "Ararylce": 64, "WafuRei": 74, "Discord_wuxu": 64,
        "Stlinosuke": 218, "SmtXz": 272, "Tamakochika": 126, "Tenacity__": 362,
        "Meapuchino": 120, "Sakura_Fu": 220, "ppg777": 32, "Izumi_gd": 126,
        "long_zhi_zi": 186, "Needle_Python": 170, "XiuRanYing": 132, "goob233": 304,
        "ChenM0M": 166, "Frozen_Rinn": 148, "Shark_shadow": 70, "MCmuzixuange": 48,
        "MomeyuKa": 0, "xiaoyuanxyz": 44, "StarsYu": 226, "wsouls": 314, "K4ver": 410,
        "savagetricycle": 134, "66_wq": 60, "GreenHandkignt1": 74, "MingMo777": 126
    },
    "SnowballShowdown": {
        "Thunder50BMG": 311, "xtaotie233": 263, "AkitukiYuzu": 287, "BlankChips": 311,
        "Se_fletrir": 552, "Ning_meng_Cat": 480, "Zoromtff": 412, "xiaoheng66666": 472,
        "Morton_y": 200, "z0144154zzz": 228, "livefaster": 200, "Ryugakusan": 232,
        "zRenox": 377, "Sprig42": 353, "Forest_Silence": 409, "Fatalism": 365,
        "lao_dan": 336, "gdgfty": 360, "Aut_moon_white": 384, "sXKYYYY": 360,
        "OlivaFute": 248, "Ararylce": 284, "WafuRei": 248, "Discord_wuxu": 272,
        "Stlinosuke": 405, "SmtXz": 397, "Tamakochika": 389, "Tenacity__": 429,
        "Meapuchino": 351, "Sakura_Fu": 331, "ppg777": 239, "Izumi_gd": 267,
        "long_zhi_zi": 383, "Needle_Python": 363, "XiuRanYing": 343, "goob233": 331,
        "ChenM0M": 451, "Frozen_Rinn": 487, "Shark_shadow": 351, "MCmuzixuange": 399,
        "MomeyuKa": 0, "xiaoyuanxyz": 269, "StarsYu": 317, "wsouls": 357, "K4ver": 401,
        "savagetricycle": 256, "66_wq": 276, "GreenHandkignt1": 196, "MingMo777": 320
    },
    "ParkourTag": {
        "Thunder50BMG": 361, "xtaotie233": 328, "AkitukiYuzu": 302, "BlankChips": 332,
        "Se_fletrir": 392, "Ning_meng_Cat": 428, "Zoromtff": 422, "xiaoheng66666": 374,
        "Morton_y": 48, "z0144154zzz": 82, "livefaster": 56, "Ryugakusan": 118,
        "zRenox": 299, "Sprig42": 324, "Forest_Silence": 304, "Fatalism": 284,
        "lao_dan": 320, "gdgfty": 337, "Aut_moon_white": 254, "sXKYYYY": 307,
        "OlivaFute": 158, "Ararylce": 240, "WafuRei": 172, "Discord_wuxu": 225,
        "Stlinosuke": 257, "SmtXz": 233, "Tamakochika": 220, "Tenacity__": 204,
        "Meapuchino": 100, "Sakura_Fu": 140, "ppg777": 104, "Izumi_gd": 128,
        "long_zhi_zi": 411, "Needle_Python": 343, "XiuRanYing": 388, "goob233": 380,
        "ChenM0M": 219, "Frozen_Rinn": 169, "Shark_shadow": 178, "MCmuzixuange": 180,
        "MomeyuKa": 312, "xiaoyuanxyz": 0, "StarsYu": 385, "wsouls": 401, "K4ver": 348,
        "savagetricycle": 214, "66_wq": 200, "GreenHandkignt1": 172, "MingMo777": 218
    }
}

# 自动生成每个游戏的出战阵容 (基于有分数的玩家)
GAME_LINEUPS = {}
for game_name, scores in GAME_SCORES.items():
    lineups_for_game = {}
    for team in TEAMS_DATA:
        team_lineup = []
        all_team_players = team['main_players'] + team['substitutes']
        for player in all_team_players:
            if scores.get(player, 0) > 0:
                team_lineup.append(player)
        if team_lineup:
            lineups_for_game[team['name']] = team_lineup
    GAME_LINEUPS[game_name] = lineups_for_game


def handle_api_error(response: requests.Response, context: str):
    """统一处理API请求错误"""
    print(f"错误: {context} 失败，状态码: {response.status_code}")
    try:
        print("API响应: ", response.json())
    except json.JSONDecodeError:
        print("API响应: ", response.text)
    raise SystemExit(f"脚本因API错误而终止: {context}")

def import_data():
    """主函数，执行整个导入流程"""
    print("开始导入WCC锦标赛数据...")
    print("使用比赛专属队伍系统...")

    # 用于存储API返回的ID，避免重复创建
    user_name_to_id = {}
    game_name_to_id = {}

    # --- 步骤 1: 创建独立实体 (Users, Games) ---

    print("\n步骤 1.1: 创建玩家 (Users)...")
    all_players = set()
    for team in TEAMS_DATA:
        all_players.update(team['main_players'])
        all_players.update(team['substitutes'])
    
    for player_name in sorted(list(all_players)):
        if player_name not in user_name_to_id:
            payload = {
                "nickname": player_name,
                "display_name": player_name,
                "source": ""
            }
            # 假设API能处理好重复创建的问题（例如，通过nickname返回现有用户）
            response = requests.post(f"{API_BASE_URL}/users/", json=payload, headers=HEADERS)
            if response.status_code in [200, 201]:
                user_id = response.json()['id']
                user_name_to_id[player_name] = user_id
                print(f"  - 成功创建或获取玩家: {player_name} (ID: {user_id})")
            else:
                handle_api_error(response, f"创建玩家 {player_name}")

    print("\n步骤 1.2: 创建比赛项目 (Games)...")
    for game in GAME_NAMES:
        game_name = game['name']
        if game_name not in game_name_to_id:
            payload = {
                "name": game_name, 
                "code": game['code'],  # 添加code字段
                "description": game['description']
            }
            response = requests.post(f"{API_BASE_URL}/games/", json=payload, headers=HEADERS)
            if response.status_code in [200, 201]:
                game_id = response.json()['id']
                game_name_to_id[game_name] = game_id
                print(f"  - 成功创建或获取项目: {game_name} (ID: {game_id})")
            else:
                handle_api_error(response, f"创建项目 {game_name}")

    # --- 步骤 2: 创建比赛 ---
    print("\n步骤 2: 创建WCC锦标赛...")
    
    match_games_payload = []
    for i, game in enumerate(GAME_NAMES):
        game_id = game_name_to_id[game['name']]
        match_games_payload.append({
            "game_id": game_id,
            "game_order": i + 1,
            "structure_type": "积分赛",
            "multiplier": game['multiplier'],
            "structure_details": {
                "description": game['description'],
                "round": i + 1,
                "code": game['code']
            }
        })
    
    # 设置比赛时间 (例如，2024年2月4日)
    match_start_time = "2024-02-04T19:00:00"
    match_end_time = "2024-02-04T22:30:00"
    
    match_payload = {
        "name": "WCC冬季联动锦标赛",
        "description": "所以游目骋怀，足以极视听之娱，信可乐也。",
        "start_time": match_start_time,
        "end_time": match_end_time,
        "status": "finished",
        "max_teams": 12,
        "max_players_per_team": 6,
        "allow_substitutes": True,
        "match_games": match_games_payload
    }
    
    response = requests.post(f"{API_BASE_URL}/matches/", json=match_payload, headers=HEADERS)
    if response.status_code in [200, 201]:
        match_response_data = response.json()
        match_id = match_response_data['id']
        print(f"  - 成功创建比赛: {match_response_data['name']} (ID: {match_id})")
    else:
        handle_api_error(response, "创建WCC比赛")

    # --- 步骤 3: 创建比赛专属队伍 ---
    print("\n步骤 3: 创建比赛专属队伍...")
    
    match_team_name_to_id = {}
    
    for team in TEAMS_DATA:
        members_data = []
        # 添加主力队员 (将第一个设为队长)
        for i, player_name in enumerate(team['main_players']):
            user_id = user_name_to_id[player_name]
            members_data.append({
                "user_id": user_id,
                "role": "captain" if i == 0 else "main"
            })
        
        # 添加替补队员
        for player_name in team['substitutes']:
            user_id = user_name_to_id[player_name]
            members_data.append({
                "user_id": user_id,
                "role": "substitute"
            })
        
        team_payload = {
            "name": team['name'],
            "color": team['color'],
            "members": members_data
        }
        
        response = requests.post(f"{API_BASE_URL}/matches/{match_id}/teams", json=team_payload, headers=HEADERS)
        if response.status_code in [200, 201]:
            team_data = response.json()
            team_id = team_data['id']
            match_team_name_to_id[team['name']] = team_id
            print(f"  - 成功创建队伍: {team['name']} (ID: {team_id}), 队员: {len(members_data)}名")
        else:
            handle_api_error(response, f"创建队伍 {team['name']}")

    # --- 步骤 4: 获取赛程ID映射 ---
    print("\n步骤 4: 获取赛程ID映射...")
    
    response = requests.get(f"{API_BASE_URL}/matches/{match_id}/games")
    if response.status_code == 200:
        match_games = response.json()
        print(f"  - 获取到 {len(match_games)} 个赛程")
        game_id_to_match_game_id = {mg['game_id']: mg['id'] for mg in match_games}
    else:
        handle_api_error(response, "获取比赛赛程")

    # --- 步骤 5: 设置每个游戏的出战阵容 ---
    print("\n步骤 5: 设置每个游戏的出战阵容...")
    
    for game_name, lineups in GAME_LINEUPS.items():
        game_id = game_name_to_id[game_name]
        match_game_id = game_id_to_match_game_id.get(game_id)
        
        if not match_game_id:
            print(f"  - 警告: 找不到 {game_name} 的赛程ID，跳过阵容设置")
            continue
            
        print(f"  设置 {game_name} 出战阵容...")
        
        team_lineups = {}
        substitute_info = {}
        
        for team_name, players in lineups.items():
            if team_name in match_team_name_to_id:
                team_id = match_team_name_to_id[team_name]
                player_ids = [user_name_to_id[p] for p in players if p in user_name_to_id]
                team_lineups[str(team_id)] = player_ids # API可能需要team_id为字符串key
                
                # 标记替补上场信息
                original_team_data = next(t for t in TEAMS_DATA if t['name'] == team_name)
                for player_name in players:
                    if player_name in original_team_data['substitutes']:
                        user_id = user_name_to_id[player_name]
                        substitute_info[str(user_id)] = "替补队员上场"

        lineup_payload = {"team_lineups": team_lineups, "substitute_info": substitute_info}
        
        response = requests.post(f"{API_BASE_URL}/matches/games/{match_game_id}/lineups", 
                               json=lineup_payload, headers=HEADERS)
        if response.status_code == 200:
            total_players = sum(len(p) for p in team_lineups.values())
            print(f"    ✓ 成功设置阵容，共 {len(team_lineups)} 支队伍, {total_players} 名出战队员")
        else:
            handle_api_error(response, f"为 {game_name} 设置阵容")

    # --- 步骤 6: 录入分数 ---
    print("\n步骤 6: 录入比赛分数...")
    
    # 统计总分条数，用于显示进度
    total_scores = sum(1 for scores in GAME_SCORES.values() for score in scores.values() if score > 0)
    posted_scores_count = 0
    
    for game_name, scores in GAME_SCORES.items():
        game_id = game_name_to_id[game_name]
        match_game_id = game_id_to_match_game_id.get(game_id)
        
        if not match_game_id:
            print(f"  - 警告: 找不到 {game_name} 的赛程ID，跳过分数录入")
            continue
            
        print(f"\n  录入 {game_name} 分数...")
        
        for player_name, score_value in scores.items():
            if score_value <= 0: continue # 跳过0分玩家
                
            user_id = user_name_to_id.get(player_name)
            if not user_id: continue

            # 找到玩家所属的队伍ID
            player_team_name = next((t['name'] for t in TEAMS_DATA if player_name in t['main_players'] + t['substitutes']), None)
            if not player_team_name: continue
            team_id = match_team_name_to_id[player_team_name]

            score_payload = {
                "points": score_value, # WCC分数是整数
                "user_id": user_id,
                "team_id": team_id,
                "event_data": {
                    "raw_score": score_value
                }
            }
            
            url = f"{API_BASE_URL}/matches/games/{match_game_id}/scores"
            response = requests.post(url, json=score_payload, headers=HEADERS)
            
            if response.status_code in [200, 201]:
                posted_scores_count += 1
                print(f"    ✓ ({posted_scores_count}/{total_scores}) {player_name}: {score_value}分")
            else:
                print(f"    ✗ 录入失败: {player_name} - {response.status_code}, {response.text}")
            
            time.sleep(0.01)  # 避免请求过快

    # --- 步骤 7: 设置冠军 ---
    print("\n步骤 7: 设置比赛结果...")
    champion_team_data = next((team for team in TEAMS_DATA if team.get('is_champion')), None)
    if champion_team_data:
        champion_team_name = champion_team_data['name']
        champion_team_id = match_team_name_to_id.get(champion_team_name)
        
        if champion_team_id:
            print(f"  - 正在设置比赛冠军为: {champion_team_name} (ID: {champion_team_id})")
            
            update_payload = {
                "winning_team_id": champion_team_id
            }
            
            # 使用 PUT 方法更新比赛信息
            response = requests.put(f"{API_BASE_URL}/matches/{match_id}", json=update_payload, headers=HEADERS)
            
            if response.status_code == 200:
                print(f"    ✓ 成功设置冠军队伍。")
            else:
                handle_api_error(response, f"设置冠军队伍 {champion_team_name}")
        else:
            print(f"  - 警告: 找不到冠军队伍 '{champion_team_name}' 的ID，无法设置冠军。")
    else:
        print("  - 未在数据源中找到冠军队伍标记。")

    # --- 步骤 8: 触发最终分数计算 ---
    print("\n步骤 8: 触发最终分数与排名计算...")
    recalculate_url = f"{API_BASE_URL}/matches/{match_id}/standard-scores/recalculate"
    response = requests.post(recalculate_url, headers=HEADERS)
    if response.status_code == 200:
        print("  - ✓ 成功触发全比赛分数重算。")
    else:
        handle_api_error(response, "触发全比赛分数重算")

    print(f"\n🎉 WCC锦标赛数据导入完成！")
    print(f"   - 创建/获取了 {len(user_name_to_id)} 位玩家")
    print(f"   - 创建了 {len(match_team_name_to_id)} 支比赛队伍")
    print(f"   - 创建/获取了 {len(game_name_to_id)} 个游戏项目")
    print(f"   - 为 {len(GAME_LINEUPS)} 个游戏设置了出战阵容")
    print(f"   - 录入了 {posted_scores_count} 条分数记录")
    print(f"   - 冠军队伍: {champion_team_data['name'] if champion_team_data else '未设置'}")

if __name__ == "__main__":
    import_data()
```

