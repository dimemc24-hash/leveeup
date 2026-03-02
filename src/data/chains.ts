import type { QuestionChain } from '../types';

export const questionChains: QuestionChain[] = [
  {
    id: 'CHAIN-01',
    name: 'The Lost Sighting Record',
    description: 'Decode a historical cryptid sighting using math, social studies, and reading!',
    steps: [
      {
        subject: 'math',
        questionId: 'MATH-M5-D1',
        narrativeIntro: "We found an old coded record! Solve this subtraction to reveal the year of a famous sighting.",
        narrativeSuccess: "The year is decoded! Now let's figure out what kind of record this is.",
      },
      {
        subject: 'social_studies',
        questionId: 'SS-SRC-D1',
        narrativeIntro: "Is this old document a primary source or secondary source? Investigators need to know!",
        narrativeSuccess: "Great detective work! Now read the source to find the location clue.",
      },
      {
        subject: 'ela',
        questionId: 'ELA-RL21-D1',
        narrativeIntro: "Read this eyewitness account carefully. The location of the cryptid is hidden in the details!",
        narrativeSuccess: "You cracked the case! The evidence points to a new cryptid location!",
      },
    ],
  },
  {
    id: 'CHAIN-02',
    name: 'The Habitat Analysis',
    description: 'Observe like a scientist, measure like a mathematician, and report like a writer!',
    steps: [
      {
        subject: 'science',
        questionId: 'SCI-LS2-D1',
        narrativeIntro: "A strange habitat has been found. Use your scientist skills to analyze the ecosystem!",
        narrativeSuccess: "Interesting findings! Now let's measure and graph what we found.",
      },
      {
        subject: 'math',
        questionId: 'MATH-DATA-D1',
        narrativeIntro: "We collected data about animal tracks in the area. Read the bar graph to find the pattern!",
        narrativeSuccess: "The data reveals something unusual! Time to write up our field report.",
      },
      {
        subject: 'ela',
        questionId: 'ELA-RL22-D1',
        narrativeIntro: "Write up your findings! What's the main idea of what we discovered?",
        narrativeSuccess: "Excellent field report! This evidence is going straight to headquarters!",
      },
    ],
  },
];
