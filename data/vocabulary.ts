export interface Vocabulary {
  word: string;
  definition: string;
  meaning: string;
}

export interface Lesson {
  lesson: number;
  vocabulary: Vocabulary[];
}

export interface Unit {
  unit: number;
  lessons: Lesson[];
}

export interface BookData {
  book_title: string;
  units: Unit[];
}

export const VOCABULARY_DATA: BookData = {
  "book_title": "Pre-Build Up",
  "units": [
    {
      "unit": 1,
      "lessons": [
        {
          "lesson": 1,
          "vocabulary": [
            { "word": "feel/felt (v.)", "definition": "to sense or be aware of", "meaning": "느끼다" },
            { "word": "bored (adj.)", "definition": "feeling tired because you have to do something that is not interesting", "meaning": "지루한" },
            { "word": "unhappy (adj.)", "definition": "sad or not glad", "meaning": "행복하지 않은" },
            { "word": "terrible (adj.)", "definition": "very bad", "meaning": "지독한, 끔찍한" },
            { "word": "worried (adj.)", "definition": "feeling unhappy because you think about something bad that has happened or might happen", "meaning": "걱정스러운" },
            { "word": "afraid (adj.)", "definition": "feeling fear", "meaning": "두려운" },
            { "word": "strange (adj.)", "definition": "unusual or surprising", "meaning": "이상한" },
            { "word": "happen/happened (v.)", "definition": "to take place, usually without being planned", "meaning": "일어나다" },
            { "word": "break/broke (v.)", "definition": "to make something go into smaller pieces by dropping it or hitting it", "meaning": "깨다, 부수다" },
            { "word": "visit/visited (v.)", "definition": "to go to see a person or a place for a period of time", "meaning": "방문하다" },
            { "word": "hit/hit (v.)", "definition": "to touch somebody or something in a forceful way", "meaning": "치다" },
            { "word": "presentation (n.)", "definition": "an act of presenting", "meaning": "발표" }
          ]
        },
        {
          "lesson": 2,
          "vocabulary": [
            { "word": "excited (adj.)", "definition": "feeling happy", "meaning": "신이 난, 흥분한" },
            { "word": "great (adj.)", "definition": "very good or nice", "meaning": "대단한, 정말 좋은" },
            { "word": "nervous (adj.)", "definition": "worried or afraid", "meaning": "불안해하는" },
            { "word": "upset (adj.)", "definition": "feeling unhappy or worried", "meaning": "마음이 상한" },
            { "word": "disappointed (adj.)", "definition": "feeling sad because what you wanted did not happen", "meaning": "실망한" },
            { "word": "win/won (v.)", "definition": "to be the best or the first in a game, race, or competition", "meaning": "이기다, 획득하다" },
            { "word": "go on a picnic", "definition": "when people take a meal to eat outdoors", "meaning": "소풍 가다" },
            { "word": "free time", "definition": "time when people do not have to work or study", "meaning": "자유 시간" },
            { "word": "present (n.)", "definition": "something that you give to someone", "meaning": "선물" },
            { "word": "take a test", "definition": "to write a test in order to show what you know", "meaning": "시험을 보다" },
            { "word": "swim/swam (v.)", "definition": "to move your body through water", "meaning": "수영하다" },
            { "word": "vacation (n.)", "definition": "a period of time when you rest from school, work, or other activities", "meaning": "방학, 휴가" }
          ]
        },
        {
          "lesson": 3,
          "vocabulary": [
            { "word": "surprised (adj.)", "definition": "shocked or amazed by something unexpected", "meaning": "놀란" },
            { "word": "pleased (adj.)", "definition": "feeling happy", "meaning": "기쁜" },
            { "word": "confused (adj.)", "definition": "not able to think clearly", "meaning": "혼란스러운" },
            { "word": "tired (adj.)", "definition": "needing to rest or sleep", "meaning": "피곤한" },
            { "word": "sore (adj.)", "definition": "painful, hurting", "meaning": "아픈 (따가운)" },
            { "word": "go hiking", "definition": "to take a long walk in the country", "meaning": "등산하다, 하이킹하러 가다" },
            { "word": "finish/finished (v.)", "definition": "to complete", "meaning": "끝내다" },
            { "word": "do homework", "definition": "to do work that a teacher gives to you to do at home", "meaning": "숙제를 하다" },
            { "word": "by the way", "definition": "used to add something into a conversation that is on a different subject", "meaning": "그런데" },
            { "word": "math (n.)", "definition": "the study of numbers, measurements and shapes", "meaning": "수학" },
            { "word": "street market", "definition": "a market often held only on certain days of the week, often in a street", "meaning": "길거리 시장" },
            { "word": "taste (n.)", "definition": "the feeling that a certain food or drink gives in your mouth", "meaning": "맛" }
          ]
        },
        {
          "lesson": 4,
          "vocabulary": [
            { "word": "proud (adj.)", "definition": "feeling pleased about something that you have done or something you have", "meaning": "자랑스러운" },
            { "word": "glad (adj.)", "definition": "happy", "meaning": "기쁜" },
            { "word": "scared (adj.)", "definition": "feeling fear", "meaning": "무서운" },
            { "word": "embarrassed (adj.)", "definition": "feeling shy or worried about what other people think of you", "meaning": "당황스러운" },
            { "word": "slip/slipped (v.)", "definition": "to slide by accident and fall or almost fall", "meaning": "미끄러지다" },
            { "word": "contest (n.)", "definition": "a game that people try to win", "meaning": "대회" },
            { "word": "practice/practiced (v.)", "definition": "to do something many times so that you will do it well", "meaning": "연습하다" },
            { "word": "ice (n.)", "definition": "water that has frozen hard", "meaning": "얼음" },
            { "word": "in front of", "definition": "directly ahead of in place or position", "meaning": "-앞에" },
            { "word": "party (n.)", "definition": "a time when people get together to have fun and celebrate something", "meaning": "파티" },
            { "word": "presentation (n.)", "definition": "an act of presenting", "meaning": "발표" },
            { "word": "ghost (n.)", "definition": "the shape of a dead person that some people think they can see", "meaning": "귀신" }
          ]
        },
        {
          "lesson": 5,
          "vocabulary": [
            { "word": "housework (n.)", "definition": "the work that you do in your house, for example cleaning and washing", "meaning": "집안일" },
            { "word": "vacuum the floor", "definition": "to clean the floor using a vacuum cleaner", "meaning": "바닥을 진공청소기로 청소하다" },
            { "word": "put away books", "definition": "to put books back in their usual place", "meaning": "책을 정리하다" },
            { "word": "clean the bookcase", "definition": "to remove dirt from the bookcase", "meaning": "책장을 청소하다" },
            { "word": "make the bed", "definition": "to nicely arrange the covers on the bed", "meaning": "잠자리(침대)를 정리하다" },
            { "word": "put the dry clothes in the drawers", "definition": "to put the dry clothes in the drawers", "meaning": "마른 옷을 서랍에 넣다" },
            { "word": "bookcase (n.)", "definition": "a piece of furniture with shelves for keeping books on", "meaning": "책장" },
            { "word": "drawer (n.)", "definition": "a part of a piece of furniture that you use for keeping things in", "meaning": "서랍" },
            { "word": "everyone (pron.)", "definition": "every person; all people", "meaning": "모두" },
            { "word": "floor (n.)", "definition": "a level of a building", "meaning": "바닥, 층" },
            { "word": "proud (adj.)", "definition": "feeling pleased about something that you have", "meaning": "자랑스러운" },
            { "word": "disappointed (adj.)", "definition": "feeling sad because what you wanted did not happen", "meaning": "실망한" }
          ]
        },
        {
          "lesson": 6,
          "vocabulary": [
            { "word": "recycle paper and bottles", "definition": "to put through a process that allows used paper and bottles to be used again", "meaning": "종이와 병을 재활용하다" },
            { "word": "mop the floor", "definition": "to wipe or rub the floor", "meaning": "바닥을 걸레질하다" },
            { "word": "change light bulbs", "definition": "to replace light bulbs", "meaning": "전구를 갈아 끼우다" },
            { "word": "do the laundry", "definition": "to wash clothes and other things that are dirty", "meaning": "빨래를 하다" },
            { "word": "fold the clothes", "definition": "to bend clothes in order to be stored easily", "meaning": "옷을 개다" },
            { "word": "recycle/recycled (v.)", "definition": "to put through a process that allows used things to be used again", "meaning": "재활용하다" },
            { "word": "bottle (n.)", "definition": "a glass or plastic container for liquids", "meaning": "병" },
            { "word": "mop/mopped (v.)", "definition": "to wipe or rub", "meaning": "걸레질하다" },
            { "word": "change/changed (v.)", "definition": "to make different", "meaning": "바꾸다" },
            { "word": "light bulb (n.)", "definition": "the glass part of an electric lamp that gives light", "meaning": "전구" },
            { "word": "housework (n.)", "definition": "the work that you do in your house, for example cleaning and washing", "meaning": "집안일" },
            { "word": "put away books", "definition": "to put books back in their usual place", "meaning": "책을 정리하다" },
            { "word": "make the bed", "definition": "to nicely arrange the covers on the bed", "meaning": "잠자리(침대)를 정리하다" }
          ]
        },
        {
          "lesson": 7,
          "vocabulary": [
            { "word": "prepare a meal", "definition": "to make a meal ready to be eaten", "meaning": "식사를 준비하다" },
            { "word": "set the table", "definition": "to prepare a table for a meal", "meaning": "식탁을 차리다" },
            { "word": "wash the dishes", "definition": "to clean the dishes using water or soap", "meaning": "설거지를 하다" },
            { "word": "clean the fridge", "definition": "to remove stains from the fridge", "meaning": "냉장고를 청소하다" },
            { "word": "fridge (n.)", "definition": "a piece of electrical equipment that you keep food in so that it stays fresh", "meaning": "냉장고" },
            { "word": "meal (n.)", "definition": "food that you eat at a certain time of the day", "meaning": "식사" },
            { "word": "wash/washed (n.)", "definition": "to make clean by using water or soap", "meaning": "씻다, 닦다" },
            { "word": "always (adv.)", "definition": "at all times; every time", "meaning": "항상" },
            { "word": "usually (adv.)", "definition": "most often", "meaning": "보통" },
            { "word": "aunt (n.)", "definition": "the sister of your mother or father, or the wife of your uncle", "meaning": "고모, 이모" },
            { "word": "pleased (adj.)", "definition": "feeling happy", "meaning": "기쁜" },
            { "word": "together (adv.)", "definition": "with each other or close to each other", "meaning": "함께" },
            { "word": "these days", "definition": "used to talk about the present", "meaning": "요즘에" }
          ]
        },
        {
          "lesson": 8,
          "vocabulary": [
            { "word": "water the plants", "definition": "to pour or to put water on the plants", "meaning": "식물에 물을 주다" },
            { "word": "clean the bathroom", "definition": "to remove stains in the bathroom", "meaning": "화장실을 청소하다" },
            { "word": "iron the clothes", "definition": "to make clothes smooth using an iron", "meaning": "옷을 다림질하다" },
            { "word": "take out the garbage", "definition": "to move the garbage from indoors to outdoors", "meaning": "쓰레기를 내놓다" },
            { "word": "feed the dog", "definition": "to give food to a dog", "meaning": "개에게 먹이를 주다" },
            { "word": "wipe the windows", "definition": "to make windows clean with a cloth", "meaning": "창문을 닦다" },
            { "word": "water/watered (v.)", "definition": "to pour or to put water on", "meaning": "물을 주다" },
            { "word": "water (n.)", "definition": "a liquid without color, smell or taste", "meaning": "물" },
            { "word": "plant (n.)", "definition": "a living thing that grows in the soil", "meaning": "식물" },
            { "word": "iron/ironed (v.)", "definition": "to make clothes smooth using an iron", "meaning": "다림질하다" },
            { "word": "garbage (n.)", "definition": "food or other things that you have thrown away", "meaning": "쓰레기" },
            { "word": "feed/fed (v.)", "definition": "to give food to a person or an animal", "meaning": "먹이를 주다" },
            { "word": "wipe/wiped (v.)", "definition": "to make something clean with a cloth", "meaning": "닦다" },
            { "word": "weekend (n.)", "definition": "Saturday and Sunday", "meaning": "주말" }
          ]
        }
      ]
    },
    {
      "unit": 2,
      "lessons": [
        {
          "lesson": 1,
          "vocabulary": [
            { "word": "build model planes", "definition": "to make a small sized airplane", "meaning": "모형 비행기를 만들다" },
            { "word": "do jigsaw puzzles", "definition": "to put a set of small pieces of a picture together", "meaning": "조각 그림(퍼즐)을 맞추다" },
            { "word": "play baduk", "definition": "to play a Korean board game Go", "meaning": "바둑을 두다" },
            { "word": "draw cartoons", "definition": "to make a funny drawing that makes people laugh", "meaning": "만화를 그리다" },
            { "word": "write stories", "definition": "to write something that happened, either true or not", "meaning": "이야기를 쓰다" },
            { "word": "play board games", "definition": "to play any game played on a board, often using dice", "meaning": "보드 게임을 하다" },
            { "word": "do ballet", "definition": "to do a type of dancing in which dancers dance on the very tips of their toes", "meaning": "발레를 하다" },
            { "word": "hobby (n.)", "definition": "something that you like doing in your free time", "meaning": "취미" },
            { "word": "walk the dog", "definition": "to take a dog for a walk so that it gets exercise", "meaning": "개를 산책 시키다" },
            { "word": "ride a bike", "definition": "to sit on a bike while it moves along", "meaning": "자전거를 타다" },
            { "word": "swim/swam (v.)", "definition": "to move your body through water", "meaning": "수영하다" },
            { "word": "interesting (adj.)", "definition": "feeling excited and you want to see it or learn about it", "meaning": "재미있는, 흥미로운" }
          ]
        },
        {
          "lesson": 2,
          "vocabulary": [
            { "word": "do origami", "definition": "to fold paper for the art", "meaning": "종이 접기를 하다" },
            { "word": "take photos", "definition": "to take a picture using a camera", "meaning": "사진을 찍다" },
            { "word": "release (my) stress", "definition": "to get rid of the stress", "meaning": "스트레스를 풀다" },
            { "word": "refresh myself", "definition": "to make oneself less tired", "meaning": "기분 전환을 하다" },
            { "word": "get a high score", "definition": "to receive a score that is greater or better than normal", "meaning": "높은 점수를 받다" },
            { "word": "strong (adj.)", "definition": "having or showing great physical power or strength", "meaning": "강한" },
            { "word": "feel better", "definition": "less sick or unhappy", "meaning": "기분이 나아지다" },
            { "word": "teach/taught (v.)", "definition": "to show somebody how to do something", "meaning": "가르치다" },
            { "word": "get (some) fresh air", "definition": "to get fresh and cool air", "meaning": "맑은 공기를 마시다" },
            { "word": "get close", "definition": "knowing somebody very well", "meaning": "가까워지다" },
            { "word": "have a fight", "definition": "hitting or attacking each other", "meaning": "싸움을 하다" },
            { "word": "remember/remembered (v.)", "definition": "to bring something back into your mind", "meaning": "기억하다" },
            { "word": "creative (adj.)", "definition": "being able to make something new using imagination", "meaning": "창의적인" }
          ]
        },
        {
          "lesson": 3,
          "vocabulary": [
            { "word": "often (adv.)", "definition": "many times", "meaning": "종종" },
            { "word": "once (adv.)", "definition": "one time", "meaning": "한 번" },
            { "word": "twice (adv.)", "definition": "two times", "meaning": "두 번" },
            { "word": "knit/knitted (v.)", "definition": "to make clothes from wool using two long needles", "meaning": "뜨개질을 하다" },
            { "word": "grow plants", "definition": "to plant something in the ground and look after it", "meaning": "식물을 기르다" },
            { "word": "sometimes (adv.)", "definition": "not very often", "meaning": "때때로" },
            { "word": "play the violin", "definition": "to make music with the violin", "meaning": "바이올린을 연주하다" },
            { "word": "go camping", "definition": "to sleep in a tent", "meaning": "캠핑하러 가다" },
            { "word": "go fishing", "definition": "to try to catch fish", "meaning": "낚시하러 가다" },
            { "word": "go swimming", "definition": "to move your body through water", "meaning": "수영하러 가다" },
            { "word": "do taekwondo", "definition": "to do a modern martial art from Korea", "meaning": "태권도를 하다" },
            { "word": "walk her dog", "definition": "to take a dog for a walk so that it gets exercise", "meaning": "개를 산책시키다" },
            { "word": "ballerina (n.)", "definition": "a woman who is a ballet dancer", "meaning": "발레리나" }
          ]
        },
        {
          "lesson": 4,
          "vocabulary": [
            { "word": "inline skates (n.)", "definition": "a type of boot with a line of small wheels attached to the bottom", "meaning": "인라인 스케이트" },
            { "word": "helmet (n.)", "definition": "a hard hat that keeps your head safe", "meaning": "헬멧" },
            { "word": "elbow pads", "definition": "a piece of thick, soft material that is used for protecting your elbow", "meaning": "팔꿈치 보호대" },
            { "word": "wrist guards", "definition": "a thing that covers a wrist to prevent getting hurt", "meaning": "손목 보호대" },
            { "word": "knee pads", "definition": "a piece of thick, soft material that is used for protecting your knee", "meaning": "무릎 보호대" },
            { "word": "snowboard (n.)", "definition": "a board that you stand on to move over snow", "meaning": "스노보드" },
            { "word": "goggles (n.)", "definition": "special glasses that you wear so that water, dust, or wind cannot get in your eyes", "meaning": "고글" },
            { "word": "glove (n.)", "definition": "a thing that you wear to keep your hand warm or safe", "meaning": "장갑, 글로브" },
            { "word": "racket (n.)", "definition": "a thing that you use for hitting the ball in sports", "meaning": "라켓" },
            { "word": "shuttlecock (n.)", "definition": "an object that players hit in badminton", "meaning": "셔틀콕" },
            { "word": "stick (n.)", "definition": "a long thin piece of wood or object", "meaning": "막대기" },
            { "word": "paddle (n.)", "definition": "a bat used for playing table tennis", "meaning": "탁구의 라켓" },
            { "word": "uniform (n.)", "definition": "a special set of clothes that everyone in a school, job, or club wears", "meaning": "유니폼" }
          ]
        },
        {
          "lesson": 5,
          "vocabulary": [
            { "word": "figure skating (n.)", "definition": "a type of ice skating in which you do jumps and spins on the ice", "meaning": "피겨 스케이팅" },
            { "word": "boxing (n.)", "definition": "a sport in which two people fight each other with their hands, wearing thick gloves", "meaning": "복싱" },
            { "word": "block/blocked (v.)", "definition": "to stop somebody or something from moving forward", "meaning": "막다" },
            { "word": "spin/spun (v.)", "definition": "to turn round quickly", "meaning": "회전하다" },
            { "word": "punch/punched (v.)", "definition": "to hit somebody or something hard with your fist", "meaning": "주먹으로 치다" },
            { "word": "shoot/shot (v.)", "definition": "to try to kick, hit or throw the ball to score a goal", "meaning": "(볼을) 넣다" },
            { "word": "kick/kicked (v.)", "definition": "to hit somebody or something with your foot", "meaning": "(발로) 차다" },
            { "word": "turn/turned (v.)", "definition": "to move round, or to move something round", "meaning": "돌다, 돌리다" },
            { "word": "goal (n.)", "definition": "the place where the ball must go to win a point in a game", "meaning": "골, 골문" },
            { "word": "hit/hit (v.)", "definition": "to touch somebody or something in a forceful way", "meaning": "치다" },
            { "word": "catch/caught (v.)", "definition": "to take and hold something that is moving", "meaning": "잡다" },
            { "word": "run/ran (v.)", "definition": "to move very quickly using your legs", "meaning": "달리다" },
            { "word": "jump/jumped (v.)", "definition": "to move quickly off the ground", "meaning": "점프하다" }
          ]
        },
        {
          "lesson": 6,
          "vocabulary": [
            { "word": "dodgeball (n.)", "definition": "a game in which teams of players try to hit other teams with a ball", "meaning": "피구" },
            { "word": "inside (adv.)", "definition": "in something", "meaning": "안에서" },
            { "word": "outside (adv.)", "definition": "not inside a building", "meaning": "밖에서" },
            { "word": "during (prep.)", "definition": "while something else is going on, at some point in a period of time", "meaning": "-동안에" },
            { "word": "throw/threw (v.)", "definition": "to move your arm quickly to send something through the air", "meaning": "던지다" },
            { "word": "cross/crossed (v.)", "definition": "to go from one side of something to the other", "meaning": "건너다, 넘다" },
            { "word": "step on the center line", "definition": "to put the foot on the line in the middle", "meaning": "중앙선을 밟다" },
            { "word": "take turns", "definition": "if people need to do something, each of them will do it one after the other", "meaning": "순서를 정해서 돌아가다" },
            { "word": "base (n.)", "definition": "one of the four positions that a player must reach in order to score points in baseball", "meaning": "베이스" },
            { "word": "bounce/bounced (v.)", "definition": "to move away quickly after hitting something hard", "meaning": "(공을) 튀기다" },
            { "word": "score/scored (v.)", "definition": "to win points or goals in a game", "meaning": "득점하다" },
            { "word": "court (n.)", "definition": "a place where you can play certain sports", "meaning": "(스포츠 경기) 코트" },
            { "word": "switch/switched (v.)", "definition": "to change", "meaning": "교환하다" }
          ]
        },
        {
          "lesson": 7,
          "vocabulary": [
            { "word": "exercise/exercised (v.)", "definition": "to move your body to keep it strong and well", "meaning": "운동하다" },
            { "word": "heart (n.)", "definition": "the body part that makes the blood go around inside", "meaning": "심장" },
            { "word": "muscle (n.)", "definition": "strong parts of your body that you use to make your body move", "meaning": "근육" },
            { "word": "regularly (adv.)", "definition": "happening again and again with the same amount of time", "meaning": "정기적으로, 규칙적으로" },
            { "word": "follow/followed (v.)", "definition": "1) to do what someone tells you to do 2) to come or go after somebody or something", "meaning": "따르다" },
            { "word": "take a rest", "definition": "to have a break", "meaning": "휴식을 취하다" },
            { "word": "set the time", "definition": "to arrange a time in advance", "meaning": "시간을 정하다" },
            { "word": "weak (adj.)", "definition": "not strong", "meaning": "약한" },
            { "word": "tired (adj.)", "definition": "needing to rest or sleep", "meaning": "피곤한" },
            { "word": "thirsty (adj.)", "definition": "needing or wanting to drink", "meaning": "목이 마른" },
            { "word": "go jogging", "definition": "to run slowly for exercise", "meaning": "조깅하러 가다" },
            { "word": "stay in bed", "definition": "to be in bed", "meaning": "침대에 누워 있다" },
            { "word": "boring (adj.)", "definition": "not interesting", "meaning": "지겨운" }
          ]
        },
        {
          "lesson": 8,
          "vocabulary": [
            { "word": "warm-up exercise", "definition": "to prepare for physical exercise", "meaning": "준비 운동" },
            { "word": "main exercise", "definition": "the most important exercise", "meaning": "본 운동" },
            { "word": "cool-down exercise", "definition": "an easy or slower exercise after the main exercise", "meaning": "정리 운동" },
            { "word": "get ready", "definition": "to prepare", "meaning": "준비하다" },
            { "word": "stretch/stretched (v.)", "definition": "to spread out your body parts to the full length", "meaning": "(신체의 부분을) 쭉 펴다" },
            { "word": "hurt/hurt (v.)", "definition": "1) to make somebody or something feel pain 2) to feel pain", "meaning": "다치게 하다, 다치다" },
            { "word": "wrist (n.)", "definition": "the part of your arm where it joins your hand", "meaning": "손목" },
            { "word": "ankle (n.)", "definition": "the part of your leg where it joins your foot", "meaning": "발목" },
            { "word": "without (prep.)", "definition": "not having", "meaning": "-없이" },
            { "word": "during (prep.)", "definition": "while something else is going on, at some point in a period of time", "meaning": "-동안에" },
            { "word": "relax/relaxed (v.)", "definition": "to rest", "meaning": "휴식을 취하다" },
            { "word": "important (adj.)", "definition": "something you must do, have, or think about", "meaning": "중요한" },
            { "word": "safely (adv.)", "definition": "not dangerous", "meaning": "안전하게" }
          ]
        },
        {
          "lesson": 9,
          "vocabulary": [
            { "word": "safety rules", "definition": "rules that people should know to be safe", "meaning": "안전 규칙" },
            { "word": "bike lane", "definition": "a part of road that only bikes are allowed to use", "meaning": "자전거 도로" },
            { "word": "push/pushed (v.)", "definition": "to use your hands, arms or body to move somebody or something forward or away from you", "meaning": "밀다" },
            { "word": "cross the street", "definition": "to go across the street", "meaning": "길을 건너다" },
            { "word": "crosswalk (n.)", "definition": "a lane in a road where cars must stop so that people can cross the road", "meaning": "건널목" },
            { "word": "mountain clothes", "definition": "clothes you wear when you go to mountains", "meaning": "산에 갈 때 입는 옷" },
            { "word": "hiking boots", "definition": "boots protecting the feet and ankles for outdoor walking activities", "meaning": "등산화" },
            { "word": "water bottle", "definition": "a plastic container for carrying drinking water", "meaning": "물병" },
            { "word": "flashlight (n.)", "definition": "a small electric light that you can carry", "meaning": "손전등" },
            { "word": "upset (adj.)", "definition": "feeling unhappy or worried", "meaning": "기분이 상한" },
            { "word": "dangerous (adj.)", "definition": "likely to hurt somebody or to damage something", "meaning": "위험한" },
            { "word": "stand in line", "definition": "to wait in a line of people to do something", "meaning": "줄을 서다" },
            { "word": "stadium (n.)", "definition": "a place with seats around it where you can watch sports", "meaning": "경기장" }
          ]
        }
      ]
    }
  ]
};
