/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Witty Silicon Valley & Stanford Campus Tea Dialogue Library

export const CAMPUS_TEA_DIALOGUE = {
    // Berkeley Digs
    berkeley: [
        "Did you hear? Berkeley students think they're better than us. LOL.",
        "Someone said 'Go Bears' in the dining hall. Security was called.",
        "Berkeley kids are just Stanford rejects who couldn't afford the tuition 💅",
        "My Cal friend asked if we have a football team. I said 'do you have a tech company?'",
        "Berkeley: where dreams go to protest instead of IPO",
        "Imagine going to a school where the mascot is literally a bear. So 2010.",
    ],

    // Silicon Valley Culture
    valley: [
        "Just saw someone pitch their startup idea in the bathroom. Classic.",
        "Overheard: 'My pre-seed round is bigger than your Series A'",
        "Someone's wearing Patagonia AND Allbirds. Peak SV achieved.",
        "This guy said he's 'between unicorns' like it's a normal thing",
        "Everyone's a 'founder' until it's time to actually code",
        "Saw someone networking at the gym. That's dedication or desperation.",
        "Three VCs just walked by. I can smell the term sheets.",
        "Someone unironically said 'let's circle back on that synergy'",
        "Dude's LinkedIn says 'Serial Entrepreneur.' Translation: unemployed.",
        "Just witnessed a pitch deck presentation during lunch. I'm not even surprised.",
    ],

    // Valley Girl Gossip
    gossip: [
        "OMG did you see her pitch deck? The fonts were literally Comic Sans 💀",
        "He said his startup is 'Uber for X' ...in 2025. Embarrassing.",
        "She's wearing last season's Allbirds. How does she even show her face?",
        "I heard his YC application got rejected. Twice. Yikes.",
        "Literally everyone at this party works at Meta. So awkward.",
        "Did you see his GitHub? 3 commits total. What a poser.",
        "She said she doesn't use Notion. Red flag energy tbh.",
        "His startup failed and now he's doing... consulting. The horror.",
        "Imagine not having a side project in 2025. Couldn't be me.",
        "Someone asked what my burn rate is. Sir, this is a Coupa Café.",
    ],

    // Tech Bro Culture
    techBro: [
        "Bro just told me he's 'optimizing his sleep stack.' Go to bed, dude.",
        "This guy microdoses and won't shut up about it. We get it.",
        "Overheard: 'I'm basically a thought leader.' No you're not.",
        "Someone's doing a standing desk meeting. In the library. Why.",
        "Dude said he's 'hacking his biology.' Bro, eat a vegetable.",
        "Just saw someone take a call on their AirPods Max. The flex is real.",
        "This man said 'I don't do email.' Then how do you function???",
        "Bro's entire personality is that he got into YC. That's it.",
    ],

    // Stanford Specific
    stanford: [
        "Just saw someone studying in the Oval. Touching grass? Revolutionary.",
        "The d.school kids are 'ideating' again. Hide your post-its.",
        "CS majors complaining about humanities requirements. Tale as old as time.",
        "Someone's parents donated a building. Must be nice.",
        "Hoover Tower is literally just a flex. We all know it.",
        "Saw someone bike from Wilbur to Main Quad. That's like 2 minutes. Walk.",
        "The engineering kids haven't seen sunlight in weeks. Send help.",
        "Full Moon on the Quad is coming up. Time to avoid Main Quad.",
        "Someone said they're 'pre-med AND CS.' Sleep is for the weak I guess.",
        "Fountain hopping season is here. RIP to anyone's dignity.",
    ],

    // Startup Culture
    startup: [
        "His startup is 'AI-powered.' Bro it's a chatbot with extra steps.",
        "She raised $2M for an app that already exists. Respect the hustle.",
        "Dude's startup is 'stealth mode.' Translation: no product yet.",
        "Someone's company got acqui-hired. That's a fancy word for failed.",
        "This startup's only revenue is their founder's trust fund.",
        "Overheard: 'We're pivoting.' Again? That's the third time this month.",
        "His pitch: 'It's like Uber meets Airbnb meets...' STOP.",
        "She said 'we're pre-revenue.' So... you have nothing?",
        "Bro's startup is his LinkedIn profile. That's it. That's the company.",
    ],

    // Academic Flex
    academic: [
        "Someone's taking 25 units. That's not impressive, that's concerning.",
        "Overheard: 'I haven't slept in 3 days.' That's not a flex, see a doctor.",
        "This person said they're 'just auditing' 5 classes. Casual.",
        "Someone's doing research with 3 different professors. Overachiever much?",
        "Dude said he's 'coasting' with a 3.9 GPA. I hate it here.",
        "She's in 4 clubs, 2 startups, and still has straight A's. How.",
        "This guy's resume is 3 pages. You're 20. Relax.",
    ],

    // Random Campus Life
    campus: [
        "The dining hall ran out of açai bowls. Actual crisis.",
        "Someone's blasting lo-fi beats in the library. Read the room.",
        "Saw a duck steal someone's sandwich. Nature is healing.",
        "The Wi-Fi is down. Civilization has collapsed.",
        "Someone brought their emotional support laptop to the gym.",
        "It's 75 degrees and people are wearing Canada Goose. Why.",
        "Just saw someone take a business call on a Bird scooter. Multitasking king.",
        "The coffee shop line is 30 people deep. I'll just fail my midterm.",
    ],

    // Investor/VC Culture
    vc: [
        "Some VC just asked 'what's your moat?' Sir, it's a lemonade stand.",
        "Overheard: 'I only invest in pre-seed.' Cool story bro.",
        "This investor said 'I'll write you a check right now.' Narrator: He didn't.",
        "VC asked for my CAC/LTV ratio. I'm a student. I have $47.",
        "Someone's dad is a VC. That explains the confidence.",
    ]
};

// Random selector helper
export const getRandomTeaMessage = (): { text: string; sender: string } => {
    const categories = Object.keys(CAMPUS_TEA_DIALOGUE);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const messages = CAMPUS_TEA_DIALOGUE[randomCategory as keyof typeof CAMPUS_TEA_DIALOGUE];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    const senders = [
        "CS Major", "Econ Bro", "Valley Girl", "Startup Founder", "Frosh",
        "Senior", "RA", "GSB Student", "Engineer", "Pre-Med",
        "Humanities Kid", "d.school Student", "Athlete", "TA", "Intern",
        "Coterm", "PhD Candidate", "Visiting Student", "Transfer", "Legacy Kid"
    ];

    return {
        text: randomMessage,
        sender: senders[Math.floor(Math.random() * senders.length)]
    };
};
