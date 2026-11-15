import type {
  BibleChapterData,
  BibleVersionKey,
  CuratedVerse,
} from '../types/ministry.ts';

export const BIBLE_VERSIONS: { key: BibleVersionKey; label: string; fullName: string }[] = [
  { key: 'KJV', label: 'KJV', fullName: 'King James Version' },
  { key: 'ASV', label: 'ASV', fullName: 'American Standard Version' },
  { key: 'WEB', label: 'WEB', fullName: 'World English Bible' },
  { key: 'BBE', label: 'BBE', fullName: 'Bible in Basic English' },
];

export interface TranslationLanguage {
  code: string;
  name: string;
  nativeName: string;
}

export const TRANSLATION_LANGUAGES: TranslationLanguage[] = [
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'iw', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
];

export const BIBLE_CHAPTERS: BibleChapterData[] = [
  {
    id: 'jeremiah-23',
    book: 'Jeremiah',
    chapter: 23,
    title: 'The Righteous Branch of David',
    verses: [
      {
        verse: 5,
        versions: {
          KJV: 'Behold, the days come, saith the LORD, that I will raise unto David a righteous Branch, and a King shall reign and prosper, and shall execute judgment and justice in the earth.',
          ASV: 'Behold, the days come, saith Jehovah, that I will raise unto David a righteous Branch, and he shall reign as king and deal wisely, and shall execute justice and righteousness in the land.',
          WEB: 'Behold, the days come, says Yahweh, that I will raise to David a righteous Branch, and he will reign as king and deal wisely, and will execute justice and righteousness in the land.',
          BBE: 'See, the days are coming, says the Lord, when I will raise up for David a righteous Branch, and he will be a King, acting wisely, and doing what is right and just in the land.',
        },
      },
      {
        verse: 6,
        versions: {
          KJV: 'In his days Judah shall be saved, and Israel shall dwell safely: and this is his name whereby he shall be called, THE LORD OUR RIGHTEOUSNESS.',
          ASV: 'In his days Judah shall be saved, and Israel shall dwell safely; and this is his name whereby he shall be called: Jehovah our righteousness.',
          WEB: 'In his days Judah will be saved, and Israel will dwell safely. This is his name by which he will be called: Yahweh our righteousness.',
          BBE: 'In his days Judah will have salvation and Israel will be living without fear: and this is the name by which he will be named, The Lord is our righteousness.',
        },
      },
    ],
  },
  {
    id: 'john-15',
    book: 'John',
    chapter: 15,
    title: 'The True Vine and the Branches',
    verses: [
      {
        verse: 1,
        versions: {
          KJV: 'I am the true vine, and my Father is the husbandman.',
          ASV: 'I am the true vine, and my Father is the husbandman.',
          WEB: 'I am the true vine, and my Father is the farmer.',
          BBE: 'I am the true vine and my Father is the gardener.',
        },
      },
      {
        verse: 4,
        versions: {
          KJV: 'Abide in me, and I in you. As the branch cannot bear fruit of itself, except it abide in the vine; no more can ye, except ye abide in me.',
          ASV: 'Abide in me, and I in you. As the branch cannot bear fruit of itself, except it abide in the vine; so neither can ye, except ye abide in me.',
          WEB: 'Remain in me, and I in you. As the branch cannot bear fruit by itself unless it remains in the vine, so neither can you, unless you remain in me.',
          BBE: 'Be in me at all times as I am in you. As the branch is not able to give fruit of itself, if it is not on the vine, so you are not able to do so if you are not in me.',
        },
      },
      {
        verse: 5,
        versions: {
          KJV: 'I am the vine, ye are the branches: He that abideth in me, and I in him, the same bringeth forth much fruit: for without me ye can do nothing.',
          ASV: 'I am the vine, ye are the branches: He that abideth in me, and I in him, the same beareth much fruit: for apart from me ye can do nothing.',
          WEB: 'I am the vine. You are the branches. He who remains in me, and I in him, the same bears much fruit, for apart from me you can do nothing.',
          BBE: 'I am the vine, you are the branches: he who is in me at all times as I am in him, gives much fruit, because without me you are able to do nothing.',
        },
      },
      {
        verse: 7,
        versions: {
          KJV: 'If ye abide in me, and my words abide in you, ye shall ask what ye will, and it shall be done unto you.',
          ASV: 'If ye abide in me, and my words abide in you, ask whatsoever ye will, and it shall be done unto you.',
          WEB: 'If you remain in me, and my words remain in you, you will ask whatever you desire, and it will be done for you.',
          BBE: 'If you are in me at all times, and my words are in you, make request for whatever you have a desire for, and it will be done for you.',
        },
      },
      {
        verse: 8,
        versions: {
          KJV: 'Herein is my Father glorified, that ye bear much fruit; so shall ye be my disciples.',
          ASV: 'Herein is my Father glorified, that ye bear much fruit; and so shall ye be my disciples.',
          WEB: 'In this is my Father glorified, that you bear much fruit; and so you will be my disciples.',
          BBE: 'In this is my Father given glory, that you give much fruit; and so you will be my disciples.',
        },
      },
    ],
  },
  {
    id: 'john-1',
    book: 'John',
    chapter: 1,
    title: 'The Word Became Flesh',
    verses: [
      {
        verse: 1,
        versions: {
          KJV: 'In the beginning was the Word, and the Word was with God, and the Word was God.',
          ASV: 'In the beginning was the Word, and the Word was with God, and the Word was God.',
          WEB: 'In the beginning was the Word, and the Word was with God, and the Word was God.',
          BBE: 'From the first he was the Word, and the Word was in relation with God and was God.',
        },
      },
      {
        verse: 4,
        versions: {
          KJV: 'In him was life; and the life was the light of men.',
          ASV: 'In him was life; and the life was the light of men.',
          WEB: 'In him was life, and the life was the light of men.',
          BBE: 'In him was life; and that life was the light of men.',
        },
      },
      {
        verse: 5,
        versions: {
          KJV: 'And the light shineth in darkness; and the darkness comprehended it not.',
          ASV: 'And the light shineth in the darkness; and the darkness apprehended it not.',
          WEB: 'The light shines in the darkness, and the darkness has not overcome it.',
          BBE: 'And the light goes on shining in the dark; it is not overcome by the dark.',
        },
      },
      {
        verse: 14,
        versions: {
          KJV: 'And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.',
          ASV: 'And the Word became flesh, and dwelt among us (and we beheld his glory, glory as of the only begotten from the Father), full of grace and truth.',
          WEB: 'The Word became flesh, and lived among us. We saw his glory, such glory as of the one and only Son of the Father, full of grace and truth.',
          BBE: 'And so the Word became flesh and took a place among us for a time; and we saw his glory, such glory as is given to an only son by his father, saw it to be true and full of grace.',
        },
      },
    ],
  },
  {
    id: 'john-3',
    book: 'John',
    chapter: 3,
    title: 'Born Again & God So Loved the World',
    verses: [
      {
        verse: 3,
        versions: {
          KJV: 'Jesus answered and said unto him, Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of God.',
          ASV: 'Jesus answered and said unto him, Verily, verily, I say unto thee, Except one be born anew, he cannot see the kingdom of God.',
          WEB: 'Jesus answered him, "Most certainly, I tell you, unless one is born anew, he cannot see the Kingdom of God."',
          BBE: 'Jesus said to him, Truly, I say to you, Without a new birth no man is able to see the kingdom of God.',
        },
      },
      {
        verse: 16,
        versions: {
          KJV: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
          ASV: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth on him should not perish, but have eternal life.',
          WEB: 'For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.',
          BBE: 'For God had such love for the world that he gave his only Son, so that whoever has faith in him may not come to destruction but have eternal life.',
        },
      },
      {
        verse: 17,
        versions: {
          KJV: 'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.',
          ASV: 'For God sent not the Son into the world to judge the world; but that the world should be saved through him.',
          WEB: 'For God did not send his Son into the world to judge the world, but that the world should be saved through him.',
          BBE: 'God did not send his Son into the world to be judge of the world; he sent him so that the world might have salvation through him.',
        },
      },
    ],
  },
  {
    id: 'psalms-23',
    book: 'Psalms',
    chapter: 23,
    title: 'The Lord Is My Shepherd',
    verses: [
      {
        verse: 1,
        versions: {
          KJV: 'The LORD is my shepherd; I shall not want.',
          ASV: 'Jehovah is my shepherd; I shall not want.',
          WEB: 'Yahweh is my shepherd: I shall lack nothing.',
          BBE: 'The Lord takes care of me as his sheep; I will not be without any good thing.',
        },
      },
      {
        verse: 2,
        versions: {
          KJV: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.',
          ASV: 'He maketh me to lie down in green pastures; he leadeth me beside still waters.',
          WEB: 'He makes me lie down in green pastures. He leads me beside still waters.',
          BBE: 'He makes a resting-place for me in the green fields: he is my guide by the quiet waters.',
        },
      },
      {
        verse: 3,
        versions: {
          KJV: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name’s sake.',
          ASV: 'He restoreth my soul: he guideth me in the paths of righteousness for his name’s sake.',
          WEB: 'He restores my soul. He guides me in the paths of righteousness for his name’s sake.',
          BBE: 'He gives new life to my soul: he is my guide in the ways of righteousness because of his name.',
        },
      },
      {
        verse: 4,
        versions: {
          KJV: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.',
          ASV: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil; for thou art with me; thy rod and thy staff, they comfort me.',
          WEB: 'Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me. Your rod and your staff, they comfort me.',
          BBE: 'Yes, though I go through the valley of deep shade, I will have no fear of evil; for you are with me, your rod and your support are my comfort.',
        },
      },
      {
        verse: 6,
        versions: {
          KJV: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.',
          ASV: 'Surely goodness and lovingkindness shall follow me all the days of my life; and I shall dwell in the house of Jehovah for ever.',
          WEB: 'Surely goodness and loving kindness shall follow me all the days of my life, and I will dwell in Yahweh’s house forever.',
          BBE: 'Truly, blessing and mercy will be with me all the days of my life; and I will have a place in the house of the Lord all my days.',
        },
      },
    ],
  },
  {
    id: 'psalms-91',
    book: 'Psalms',
    chapter: 91,
    title: 'Dwelling in the Secret Place of the Most High',
    verses: [
      {
        verse: 1,
        versions: {
          KJV: 'He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty.',
          ASV: 'He that dwelleth in the secret place of the Most High shall abide under the shadow of the Almighty.',
          WEB: 'He who dwells in the secret place of the Most High will rest in the shadow of the Almighty.',
          BBE: 'Happy is he whose resting-place is in the secret of the Lord, and under the shade of the wings of the Most High;',
        },
      },
      {
        verse: 2,
        versions: {
          KJV: 'I will say of the LORD, He is my refuge and my fortress: my God; in him will I trust.',
          ASV: 'I will say of Jehovah, He is my refuge and my fortress; my God, in whom I trust.',
          WEB: 'I will say of Yahweh, "He is my refuge and my fortress; my God, in whom I trust."',
          BBE: 'Who says of the Lord, He is my safe place and my tower of strength: he is my God, in whom is my hope.',
        },
      },
      {
        verse: 11,
        versions: {
          KJV: 'For he shall give his angels charge over thee, to keep thee in all thy ways.',
          ASV: 'For he will give his angels charge over thee, to keep thee in all thy ways.',
          WEB: 'For he will put his angels in charge of you, to guard you in all your ways.',
          BBE: 'For he will give his angels orders to take care of you in all your ways.',
        },
      },
    ],
  },
  {
    id: 'isaiah-11',
    book: 'Isaiah',
    chapter: 11,
    title: 'The Branch from the Root of Jesse',
    verses: [
      {
        verse: 1,
        versions: {
          KJV: 'And there shall come forth a rod out of the stem of Jesse, and a Branch shall grow out of his roots:',
          ASV: 'And there shall come forth a shoot out of the stock of Jesse, and a branch out of his roots shall bear fruit.',
          WEB: 'A shoot will come out of the stock of Jesse, and a branch out of his roots will bear fruit.',
          BBE: 'And there will come a rod out of the broken tree of Jesse, and a branch out of his roots will give fruit.',
        },
      },
      {
        verse: 2,
        versions: {
          KJV: 'And the spirit of the LORD shall rest upon him, the spirit of wisdom and understanding, the spirit of counsel and might, the spirit of knowledge and of the fear of the LORD;',
          ASV: 'And the Spirit of Jehovah shall rest upon him, the spirit of wisdom and understanding, the spirit of counsel and might, the spirit of knowledge and of the fear of Jehovah.',
          WEB: 'Yahweh’s Spirit will rest on him: the spirit of wisdom and understanding, the spirit of counsel and might, the spirit of knowledge and of the fear of Yahweh.',
          BBE: 'And the spirit of the Lord will be resting on him, the spirit of wisdom and of good sense, the spirit of wise guiding and of strength, the spirit of knowledge and of the fear of the Lord;',
        },
      },
    ],
  },
  {
    id: 'isaiah-53',
    book: 'Isaiah',
    chapter: 53,
    title: 'The Suffering Servant & Our Peace',
    verses: [
      {
        verse: 5,
        versions: {
          KJV: 'But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.',
          ASV: 'But he was wounded for our transgressions, he was bruised for our iniquities; the chastisement of our peace was upon him; and with his stripes we are healed.',
          WEB: 'But he was pierced for our transgressions. He was crushed for our iniquities. The punishment that brought our peace was on him; and by his wounds we are healed.',
          BBE: 'But it was for our sins he was wounded, and for our evil doings he was crushed: he took the punishment by which we have peace, and by his wounds we are made well.',
        },
      },
      {
        verse: 6,
        versions: {
          KJV: 'All we like sheep have gone astray; we have turned every one to his own way; and the LORD hath laid on him the iniquity of us all.',
          ASV: 'All we like sheep have gone astray; we have turned every one to his own way; and Jehovah hath laid on him the iniquity of us all.',
          WEB: 'All we like sheep have gone astray. Everyone has turned to his own way; and Yahweh has laid on him the iniquity of us all.',
          BBE: 'We all went out of the way like sheep; everyone took his own way; and the Lord put on him the punishment of us all.',
        },
      },
    ],
  },
  {
    id: 'romans-8',
    book: 'Romans',
    chapter: 8,
    title: 'More Than Conquerors in Christ',
    verses: [
      {
        verse: 1,
        versions: {
          KJV: 'There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit.',
          ASV: 'There is therefore now no condemnation to them that are in Christ Jesus.',
          WEB: 'There is therefore now no condemnation to those who are in Christ Jesus, who don’t walk according to the flesh, but according to the Spirit.',
          BBE: 'For this cause those who are in Christ Jesus will not be judged as sinners.',
        },
      },
      {
        verse: 28,
        versions: {
          KJV: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
          ASV: 'And we know that to them that love God all things work together for good, even to them that are called according to his purpose.',
          WEB: 'We know that all things work together for good for those who love God, for those who are called according to his purpose.',
          BBE: 'And we are conscious that all things are working together for good to those who have love for God, and have been marked out by his purpose.',
        },
      },
      {
        verse: 38,
        versions: {
          KJV: 'For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come,',
          ASV: 'For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor things present, nor things to come, nor powers,',
          WEB: 'For I am persuaded that neither death, nor life, nor angels, nor principalities, nor things present, nor things to come, nor powers,',
          BBE: 'For I am certain that not death, or life, or angels, or rulers, or things present, or things to come, or powers,',
        },
      },
      {
        verse: 39,
        versions: {
          KJV: 'Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.',
          ASV: 'nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.',
          WEB: 'nor height, nor depth, nor any other created thing will be able to separate us from the love of God which is in Christ Jesus our Lord.',
          BBE: 'Or things on high, or things under the earth, or any other made thing, will be able to come between us and the love of God which is in Christ Jesus our Lord.',
        },
      },
    ],
  },
  {
    id: 'ephesians-2',
    book: 'Ephesians',
    chapter: 2,
    title: 'The Temple of the Living God',
    verses: [
      {
        verse: 8,
        versions: {
          KJV: 'For by grace are ye saved through faith; and that not of yourselves: it is the gift of God:',
          ASV: 'for by grace have ye been saved through faith; and that not of yourselves, it is the gift of God;',
          WEB: 'for by grace you have been saved through faith, and that not of yourselves; it is the gift of God,',
          BBE: 'Because by grace you have salvation through faith; and that not of yourselves: it is given by God:',
        },
      },
      {
        verse: 19,
        versions: {
          KJV: 'Now therefore ye are no more strangers and foreigners, but fellowcitizens with the saints, and of the household of God;',
          ASV: 'So then ye are no more strangers and sojourners, but ye are fellow-citizens with the saints, and of the household of God,',
          WEB: 'So then you are no longer strangers and foreigners, but you are fellow citizens with the saints and of the household of God,',
          BBE: 'So then you are no longer strange people and living in a strange land, but you are of the same country as the saints, and of the family of God,',
        },
      },
      {
        verse: 20,
        versions: {
          KJV: 'And are built upon the foundation of the apostles and prophets, Jesus Christ himself being the chief corner stone;',
          ASV: 'being built upon the foundation of the apostles and prophets, Christ Jesus himself being the chief corner stone;',
          WEB: 'being built on the foundation of the apostles and prophets, Christ Jesus himself being the chief cornerstone;',
          BBE: 'Resting on the base of the Apostles and prophets, Christ Jesus himself being the chief keystone,',
        },
      },
      {
        verse: 21,
        versions: {
          KJV: 'In whom all the building fitly framed together groweth unto an holy temple in the Lord:',
          ASV: 'in whom each several building, fitly framed together, groweth into a holy temple in the Lord;',
          WEB: 'in whom the whole building, fitted together, grows into a holy temple in the Lord;',
          BBE: 'In whom all the building, rightly joined together, is growing into a holy temple in the Lord;',
        },
      },
    ],
  },
  {
    id: 'revelation-21',
    book: 'Revelation',
    chapter: 21,
    title: 'New Jerusalem — The Tabernacle of God',
    verses: [
      {
        verse: 3,
        versions: {
          KJV: 'And I heard a great voice out of heaven saying, Behold, the tabernacle of God is with men, and he will dwell with them, and they shall be his people, and God himself shall be with them, and be their God.',
          ASV: 'And I heard a great voice out of the throne saying, Behold, the tabernacle of God is with men, and he shall dwell with them, and they shall be his peoples, and God himself shall be with them, and be their God:',
          WEB: 'I heard a loud voice out of heaven saying, "Behold, God’s dwelling is with people, and he will dwell with them, and they will be his people, and God himself will be with them as their God.',
          BBE: 'And a great voice came to my ears out of the high seat, saying, See, the Tent of God is with men, and he will make his living-place with them, and they will be his people, and God himself will be with them, and be their God.',
        },
      },
      {
        verse: 4,
        versions: {
          KJV: 'And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.',
          ASV: 'and he shall wipe away every tear from their eyes; and death shall be no more; neither shall there be mourning, nor crying, nor pain, any more: the first things are passed away.',
          WEB: 'He will wipe away every tear from their eyes. Death will be no more; neither will there be mourning, nor crying, nor pain any more. The first things have passed away."',
          BBE: 'And he will put an end to all their weeping; and there will be no more death, or sorrow, or crying, or pain; for the first things have come to an end.',
        },
      },
      {
        verse: 5,
        versions: {
          KJV: 'And he that sat upon the throne said, Behold, I make all things new. And he said unto me, Write: for these words are true and faithful.',
          ASV: 'And he that sitteth on the throne said, Behold, I make all things new. And he saith, Write: for these words are faithful and true.',
          WEB: 'He who sits on the throne said, "Behold, I am making all things new." He said, "Write, for these words of God are faithful and true."',
          BBE: 'And he who is seated on the high seat said, See, I make all things new. And he said, Put it in the book; for these words are certain and true.',
        },
      },
    ],
  },
];

export const CURATED_VERSES: CuratedVerse[] = [
  {
    id: 'jer-23-5',
    reference: 'Jeremiah 23:5',
    book: 'Jeremiah',
    chapter: 23,
    verse: 5,
    topic: 'Prophecy',
    text: 'Behold, the days come, saith the LORD, that I will raise unto David a righteous Branch, and a King shall reign and prosper, and shall execute judgment and justice in the earth.',
  },
  {
    id: 'john-15-5',
    reference: 'John 15:5',
    book: 'John',
    chapter: 15,
    verse: 5,
    topic: 'Promises',
    text: 'I am the vine, ye are the branches: He that abideth in me, and I in him, the same bringeth forth much fruit: for without me ye can do nothing.',
  },
  {
    id: 'isa-11-1',
    reference: 'Isaiah 11:1',
    book: 'Isaiah',
    chapter: 11,
    verse: 1,
    topic: 'Prophecy',
    text: 'And there shall come forth a rod out of the stem of Jesse, and a Branch shall grow out of his roots.',
  },
  {
    id: 'col-1-27',
    reference: 'Colossians 1:27',
    book: 'Colossians',
    chapter: 1,
    verse: 27,
    topic: 'Grace',
    text: 'To whom God would make known what is the riches of the glory of this mystery among the Gentiles; which is Christ in you, the hope of glory.',
  },
  {
    id: 'eph-2-21',
    reference: 'Ephesians 2:21',
    book: 'Ephesians',
    chapter: 2,
    verse: 21,
    topic: 'Worship',
    text: 'In whom all the building fitly framed together groweth unto an holy temple in the Lord.',
  },
  {
    id: 'ps-23-1',
    reference: 'Psalm 23:1–2',
    book: 'Psalms',
    chapter: 23,
    verse: 1,
    topic: 'Promises',
    text: 'The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters.',
  },
  {
    id: 'ps-91-1',
    reference: 'Psalm 91:1',
    book: 'Psalms',
    chapter: 91,
    verse: 1,
    topic: 'Promises',
    text: 'He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty.',
  },
  {
    id: 'prov-3-5',
    reference: 'Proverbs 3:5–6',
    book: 'Proverbs',
    chapter: 3,
    verse: 5,
    topic: 'Wisdom',
    text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.',
  },
  {
    id: 'isa-53-5',
    reference: 'Isaiah 53:5',
    book: 'Isaiah',
    chapter: 53,
    verse: 5,
    topic: 'Grace',
    text: 'But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.',
  },
  {
    id: 'john-3-16',
    reference: 'John 3:16',
    book: 'John',
    chapter: 3,
    verse: 16,
    topic: 'Grace',
    text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
  },
  {
    id: 'rom-8-38',
    reference: 'Romans 8:38–39',
    book: 'Romans',
    chapter: 8,
    verse: 38,
    topic: 'Promises',
    text: 'For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.',
  },
  {
    id: 'rev-21-5',
    reference: 'Revelation 21:5',
    book: 'Revelation',
    chapter: 21,
    verse: 5,
    topic: 'Prophecy',
    text: 'And he that sat upon the throne said, Behold, I make all things new. And he said unto me, Write: for these words are true and faithful.',
  },
  {
    id: 'zech-6-12',
    reference: 'Zechariah 6:12',
    book: 'Zechariah',
    chapter: 6,
    verse: 12,
    topic: 'Prophecy',
    text: 'Behold the man whose name is The BRANCH; and he shall grow up out of his place, and he shall build the temple of the LORD.',
  },
  {
    id: 'ps-119-105',
    reference: 'Psalm 119:105',
    book: 'Psalms',
    chapter: 119,
    verse: 105,
    topic: 'Wisdom',
    text: 'Thy word is a lamp unto my feet, and a light unto my path.',
  },
  {
    id: '2cor-5-17',
    reference: '2 Corinthians 5:17',
    book: '2 Corinthians',
    chapter: 5,
    verse: 17,
    topic: 'Grace',
    text: 'Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.',
  },
  {
    id: 'heb-12-2',
    reference: 'Hebrews 12:2',
    book: 'Hebrews',
    chapter: 12,
    verse: 2,
    topic: 'Worship',
    text: 'Looking unto Jesus the author and finisher of our faith; who for the joy that was set before him endured the cross, despising the shame.',
  },
  {
    id: 'ps-100-4',
    reference: 'Psalm 100:4',
    book: 'Psalms',
    chapter: 100,
    verse: 4,
    topic: 'Worship',
    text: 'Enter into his gates with thanksgiving, and into his courts with praise: be thankful unto him, and bless his name.',
  },
  {
    id: 'isa-40-31',
    reference: 'Isaiah 40:31',
    book: 'Isaiah',
    chapter: 40,
    verse: 31,
    topic: 'Promises',
    text: 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.',
  },
  {
    id: 'matt-11-28',
    reference: 'Matthew 11:28',
    book: 'Matthew',
    chapter: 11,
    verse: 28,
    topic: 'Grace',
    text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
  },
  {
    id: 'jas-1-5',
    reference: 'James 1:5',
    book: 'James',
    chapter: 1,
    verse: 5,
    topic: 'Wisdom',
    text: 'If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.',
  },
];

export function pickRandomVerse(
  topic?: CuratedVerse['topic'] | 'All',
  excludeId?: string,
  rng: () => number = Math.random
): CuratedVerse {
  const pool =
    topic && topic !== 'All'
      ? CURATED_VERSES.filter((v) => v.topic === topic)
      : CURATED_VERSES;
  const filtered = pool.length > 1 && excludeId ? pool.filter((v) => v.id !== excludeId) : pool;
  const index = Math.min(filtered.length - 1, Math.max(0, Math.floor(rng() * filtered.length)));
  return filtered[index] ?? CURATED_VERSES[0];
}

export function buildDefaultImagePrompt(verse: CuratedVerse, artStyle = 'Sacred Botanical Light'): string {
  const styleDescriptions: Record<string, string> = {
    'Sacred Botanical Light':
      'Warm golden sunlight radiating behind a carved wooden cross entwined with living green vine leaves and deep purple grapes, painterly sacred realism, rich amber and crimson highlights, serene devotional atmosphere, no text.',
    'Stained Glass Cathedral':
      'Luminous stained-glass sanctuary window depicting a living branch bearing radiant fruit in sapphire blue, burnished gold, and ruby glass, soft dust motes in cathedral shafts of light, fine detail, no text.',
    'Ancient Illuminated Parchment':
      'Hand-crafted museum parchment manuscript border with delicate botanical gold-leaf vine filigree, olive branches, warm candlelight glow, archival editorial art style, no text.',
    'Dawn Over Mount Zion':
      'Golden sunrise breaking over tranquil Judean hills and ancient olive groves, soft morning mist, warm rays of divine light descending through clouds, fine landscape painting, no text.',
  };

  const styleClause = styleDescriptions[artStyle] ?? styleDescriptions['Sacred Botanical Light'];
  return `Devotional sacred artwork inspired by ${verse.reference} ("${verse.text.slice(0, 110)}${verse.text.length > 110 ? '...' : ''}"). ${styleClause}`;
}

export interface ParallelVerseRow {
  verseNumber: number;
  leftText: string;
  rightText: string;
  thirdText?: string;
}

export function alignParallelVerses(
  chapter: BibleChapterData,
  leftVersion: BibleVersionKey,
  rightVersion: BibleVersionKey,
  translatedRight?: Record<number, string>,
  translatedThird?: Record<number, string>
): ParallelVerseRow[] {
  return chapter.verses.map((entry) => ({
    verseNumber: entry.verse,
    leftText: entry.versions[leftVersion],
    rightText: translatedRight?.[entry.verse] ?? entry.versions[rightVersion],
    thirdText: translatedThird ? translatedThird[entry.verse] ?? '' : undefined,
  }));
}
