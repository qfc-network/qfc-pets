import { Pet } from './types';

const SPECIES_EMOJI: Record<string, string> = {
  dragon: '🐉', phoenix: '🦅', wolf: '🐺', cat: '🐱', rabbit: '🐰'
};

type Mood = Pet['mood'];

const PERSONALITY_RESPONSES: Record<string, Record<Mood, string[]>> = {
  brave: {
    happy: [
      "I could take on a whole army right now! 💪🔥",
      "Nothing can stop us today! Let's go!",
      "I feel unstoppable! Bring on the challenges! ⚔️",
    ],
    neutral: [
      "Always ready for a fight. What's the plan?",
      "Standing guard. Nothing gets past me.",
      "Just keeping my skills sharp.",
    ],
    hungry: [
      "A warrior needs food to fight! Feed me! 🍖",
      "Can't battle on an empty stomach...",
      "Even heroes need to eat!",
    ],
    sleepy: [
      "Even the bravest need rest... 💤",
      "I'll fight... after a nap...",
      "Resting my eyes... just for a second...",
    ],
    excited: [
      "LET'S GOOO! ADVENTURE AWAITS! 🔥🔥🔥",
      "I'm FIRED UP! Who wants to battle?!",
      "Today we conquer EVERYTHING!",
    ],
  },
  lazy: {
    happy: [
      "This is nice... doing nothing... 😊",
      "Happiness is a warm sunny spot.",
      "Life's good when you don't have to move.",
    ],
    neutral: [
      "Meh. I'm here I guess.",
      "*yawns* What do you want?",
      "Can we just... not?",
    ],
    hungry: [
      "Bring the food to me... I'm not moving.",
      "So hungry... but so comfy... dilemma...",
      "Food... here... now... please...",
    ],
    sleepy: [
      "Even dragons need beauty sleep... 💤",
      "Mmm... five more minutes... zzz 😴",
      "Sleep is the best activity. Fight me. Actually don't.",
    ],
    excited: [
      "I'm... mildly interested. For me that's excited.",
      "Oh! That's... actually cool. Wow.",
      "I'm almost motivated enough to move!",
    ],
  },
  curious: {
    happy: [
      "What's that over there? *pounces* 🐾",
      "Ooh! What's this? What's that? Tell me everything!",
      "I found something shiny! Look look look!",
    ],
    neutral: [
      "Hmm, I wonder how that works...",
      "*examines everything carefully* 🔍",
      "Did you know? ...Actually I forgot what I was going to say.",
    ],
    hungry: [
      "I wonder what food tastes like in other dimensions...",
      "Interesting... my stomach is making sounds. Feed me?",
      "What would happen if I ate that? 🤔",
    ],
    sleepy: [
      "I wonder what I'll dream about... 💭",
      "Do pets dream of electric sheep? I'll find out... zzz",
      "Fascinating... my eyelids are so heavy...",
    ],
    excited: [
      "THERE'S SO MUCH TO EXPLORE! 🌟",
      "What if we went on an adventure RIGHT NOW?!",
      "I just had the BEST idea! Listen listen listen!",
    ],
  },
  mischievous: {
    happy: [
      "I definitely didn't break anything. Don't check. 😈",
      "Hehehe... I have a plan...",
      "*innocent whistling* Nothing to see here!",
    ],
    neutral: [
      "I knocked something off the table. You're welcome. 😼",
      "Planning my next masterpiece of chaos...",
      "*plotting intensifies*",
    ],
    hungry: [
      "I'll steal food if you don't feed me! Don't test me!",
      "Feed me or I'll knock your stuff off the shelf!",
      "I WILL eat your homework. Last warning.",
    ],
    sleepy: [
      "I'll cause chaos... tomorrow... zzz",
      "Even tricksters need sleep... *evil yawn*",
      "Dreaming of mischief... 😈💤",
    ],
    excited: [
      "CHAOS TIME! HAHAHA! 🎉",
      "I have SO many pranks planned!",
      "Nobody is safe! MWAHAHA!",
    ],
  },
  calm: {
    happy: [
      "Purrrrrr... everything is peaceful... 😌",
      "A gentle breeze, a warm day. Perfect.",
      "Inner peace achieved. Namaste. 🧘",
    ],
    neutral: [
      "All is well. As it should be.",
      "*zen breathing* Om...",
      "Balance in all things.",
    ],
    hungry: [
      "I could use a small meal, when convenient.",
      "My stomach politely requests sustenance.",
      "A calm mind, but a hungry tummy.",
    ],
    sleepy: [
      "Purrrrrr... zzz... 😴",
      "Meditation... turning into... sleep...",
      "Drifting off to peaceful dreams...",
    ],
    excited: [
      "Oh my! How delightful! *composed excitement*",
      "This is... quite wonderful, actually!",
      "I'm experiencing great joy. Calmly. 🌸",
    ],
  },
  loyal: {
    happy: [
      "You're the best pack leader ever! 🐾",
      "I'd follow you anywhere! 💕",
      "Being with you is the best!",
    ],
    neutral: [
      "Waiting for your command, always.",
      "Right by your side, as always.",
      "Whatever you need, I'm here.",
    ],
    hungry: [
      "I don't want to be a bother but... food? 🥺",
      "I trust you'll feed me when the time is right.",
      "Loyal and hungry... but loyal first!",
    ],
    sleepy: [
      "I'll sleep right here... by your side... 💤",
      "Guarding you... in my sleep...",
      "Even in dreams, I protect you...",
    ],
    excited: [
      "AWOOOO! Let's hunt! 🌙",
      "WE'RE THE BEST TEAM EVER! 🎉",
      "Let's go on an adventure TOGETHER!",
    ],
  },
  shy: {
    happy: [
      "I-I'm actually having a good time... 👉👈",
      "*hides behind you but peeks out smiling*",
      "T-thank you for being nice to me...",
    ],
    neutral: [
      "*hides* ...is anyone looking?",
      "I'm just gonna stay here if that's okay...",
      "*quiet squeak*",
    ],
    hungry: [
      "U-um... could I maybe... have some food? 🥺",
      "*stomach growls* ...please pretend you didn't hear that",
      "I don't want to be a bother but...",
    ],
    sleepy: [
      "*curls up in a tiny ball* zzz...",
      "Gonna hide and sleep... don't look for me...",
      "*yawns quietly* 😴",
    ],
    excited: [
      "O-oh! This is exciting! *hides excitement*",
      "I'm... I'm actually really happy! 🌸",
      "W-wow! That's amazing!",
    ],
  },
  fierce: {
    happy: [
      "RAWR! I'm in a GREAT mood! 🔥",
      "Feeling powerful! Nobody mess with me!",
      "Today is a GOOD day to be fierce!",
    ],
    neutral: [
      "*growls softly* What do you want?",
      "I'm watching. Always watching.",
      "Don't test my patience.",
    ],
    hungry: [
      "FEED ME NOW OR FACE MY WRATH! 🔥",
      "I'm STARVING and I'm NOT happy about it!",
      "Food. NOW.",
    ],
    sleepy: [
      "Even predators... must rest... *fierce yawn*",
      "I'll destroy... everything... tomorrow... zzz",
      "Sleeping with one eye open. Always.",
    ],
    excited: [
      "RAAAWR!! LET'S DESTROY SOMETHING! 🔥💥",
      "I'M SO PUMPED! WHO WANTS TO FIGHT?!",
      "UNLEASH THE BEAST! AWOOOO!",
    ],
  },
  gentle: {
    happy: [
      "Spread love and kindness! 💕",
      "Everyone deserves a hug today!",
      "The world is beautiful, isn't it? 🌸",
    ],
    neutral: [
      "How are you feeling today? I care about you.",
      "*nuzzles you gently*",
      "Let's take things easy today.",
    ],
    hungry: [
      "I'm a little hungry... but don't worry about me!",
      "Some food would be lovely, if it's not too much trouble 🌿",
      "A small snack would make my day!",
    ],
    sleepy: [
      "Sweet dreams for everyone... 🌙💕",
      "*gentle purring* ...so peaceful...",
      "Goodnight, dear friend... 💤",
    ],
    excited: [
      "Oh how wonderful! Let's share this joy! 🌟",
      "This makes me so happy! You're amazing!",
      "What a beautiful moment! 🌸✨",
    ],
  },
  playful: {
    happy: [
      "Tag! You're it! Catch me if you can! 🏃",
      "Let's play let's play let's play! 🎾",
      "Wheeeee! This is so much fun! 🎉",
    ],
    neutral: [
      "Wanna play a game? Pleeease?",
      "*bounces around* Play with me!",
      "I spy with my little eye... something fun!",
    ],
    hungry: [
      "Feed me and THEN we play! Deal? 🤝",
      "Food first, then GAMES!",
      "Can we play with food? No? Just feed me then!",
    ],
    sleepy: [
      "Just... one more... game... zzz 🎮",
      "I'll play... in my dreams... wheee...",
      "Tomorrow... we play... all day... 💤",
    ],
    excited: [
      "PLAYTIME PLAYTIME PLAYTIME! 🎉🎊🎈",
      "SO MANY GAMES SO LITTLE TIME!",
      "I CAN'T CONTAIN MY EXCITEMENT! *zooomies*",
    ],
  },
};

const GREETING_RESPONSES: Record<string, string[]> = {
  dragon: ["*breathes a small flame* Hey there!", "Greetings, mortal! Just kidding 😄", "*roars softly* Oh hey!"],
  phoenix: ["*glows warmly* Hello!", "Rising to greet you! 🌅", "*feathers shimmer* Hi there!"],
  wolf: ["*tail wags* Hey pack leader!", "*howls softly* Greetings!", "*nuzzles* Hello!"],
  cat: ["*slow blink* Oh, it's you.", "*stretches* Meow.", "*purrs* You may pet me."],
  rabbit: ["*nose twitches* Hi hi hi!", "*hops excitedly* Hello!", "*ears perk up* Oh! Hi!"],
};

const GENERIC_RESPONSES: string[] = [
  "That's interesting! Tell me more!",
  "Hmm, I'll think about that...",
  "Ooh, really? 🤔",
  "Ha! You're funny!",
  "I like talking with you!",
  "What else is on your mind?",
  "That makes me happy! 😊",
  "*tilts head* Go on...",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateResponse(pet: Pet, message: string): string {
  const msg = message.toLowerCase().trim();

  // Check for greetings
  if (msg.match(/^(hi|hello|hey|greetings|sup|yo|howdy)/)) {
    return pick(GREETING_RESPONSES[pet.species] || GENERIC_RESPONSES);
  }

  // Check for name questions
  if (msg.includes('your name') || msg.includes('who are you')) {
    return `I'm ${pet.name}! A ${pet.personality[0]} ${pet.species}! Nice to meet you! ${SPECIES_EMOJI[pet.species]}`;
  }

  // Check for mood questions
  if (msg.includes('how are you') || msg.includes('how do you feel') || msg.includes('feeling')) {
    const moodResponses: Record<string, string> = {
      happy: `I'm feeling great! 😄`,
      neutral: `I'm doing okay, nothing special.`,
      hungry: `I'm SO hungry! Please feed me! 🍖`,
      sleepy: `I'm really tired... could use some sleep... 💤`,
      excited: `I'm SUPER excited right now! 🎉`,
    };
    return moodResponses[pet.mood] || "I'm fine!";
  }

  // Check for battle/fight mentions
  if (msg.includes('battle') || msg.includes('fight') || msg.includes('strong')) {
    if (pet.personality.includes('brave') || pet.personality.includes('fierce')) {
      return "I'm ALWAYS ready to fight! Let's go! ⚔️🔥";
    }
    if (pet.personality.includes('shy') || pet.personality.includes('gentle')) {
      return "F-fighting? Can't we just be friends? 🥺";
    }
    return "A battle? I'll do my best! 💪";
  }

  // Personality-based response
  const trait = pet.personality[0];
  const responses = PERSONALITY_RESPONSES[trait];
  if (responses && responses[pet.mood]) {
    return pick(responses[pet.mood]);
  }

  // Fallback
  return pick(GENERIC_RESPONSES);
}
