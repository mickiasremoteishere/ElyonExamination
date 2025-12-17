export interface Question {
  id: number | string;
  text: string;
  options: string[];
  correctAnswer: number;
  type?: string;
  section?: string;
  passage?: string;
  explanation?: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  duration: number; // in minutes
  totalQuestions: number;
  description: string;
  scheduledDate: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  questions: Question[];
}

import { verbalReasoningQuestions } from './verbalReasoningQuestions';
import { eueeVerbal2021Questions } from './eueeVerbalReasoning2021';

export const exams: Exam[] = [
  {
    id: 'euee-2021-verbal',
    title: '2021 EUEE Verbal Reasoning',
    subject: 'Verbal Reasoning',
    duration: 60,
    totalQuestions: 35,
    description: '2013 EC Ethiopian University Entrance Examination (EUEE) - Verbal Reasoning Section',
    scheduledDate: '2021-11-01',
    status: 'completed',
    questions: [...eueeVerbal2021Questions]
      .sort((a, b) => parseInt(a.id.replace('v', '')) - parseInt(b.id.replace('v', '')))
      .map((q, index) => ({
        id: index + 1, // Sequential IDs starting from 1
        text: q.question_text,
        options: q.options,
        correctAnswer: q.correct_answer,
      })),
  },
  {
    id: 'exam-1',
    title: 'Aptitude 2025 Online Exam',
    subject: 'Verbal Reasoning',
    duration: 60,
    totalQuestions: 40,
    description: 'Verbal Reasoning Assessment with various question types',
    scheduledDate: '2025-12-17',
    status: 'ongoing',
    questions: [...eueeVerbal2021Questions]
      .sort((a, b) => parseInt(a.id.replace('v', '')) - parseInt(b.id.replace('v', '')))
      .map((q, index) => ({
        id: index + 1, // Sequential IDs starting from 1
        text: q.question_text,
        options: q.options,
        correctAnswer: q.correct_answer,
      }))
  },
  {
    id: 'exam-2',
    title: 'Science Quarterly Test',
    subject: 'Science',
    duration: 45,
    totalQuestions: 8,
    description: 'Quarterly assessment on Physics and Chemistry basics',
    scheduledDate: '2024-12-22',
    status: 'upcoming',
    questions: [
      {
        id: 1,
        text: 'What is the chemical symbol for water?',
        options: ['H2O', 'CO2', 'NaCl', 'O2'],
        correctAnswer: 0,
      },
      {
        id: 2,
        text: 'The SI unit of force is:',
        options: ['Joule', 'Watt', 'Newton', 'Pascal'],
        correctAnswer: 2,
      },
      {
        id: 3,
        text: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
        correctAnswer: 1,
      },
      {
        id: 4,
        text: 'The process by which plants make food is called:',
        options: ['Respiration', 'Photosynthesis', 'Digestion', 'Transpiration'],
        correctAnswer: 1,
      },
      {
        id: 5,
        text: 'What is the atomic number of Carbon?',
        options: ['4', '6', '8', '12'],
        correctAnswer: 1,
      },
      {
        id: 6,
        text: 'Sound travels fastest in:',
        options: ['Air', 'Water', 'Vacuum', 'Steel'],
        correctAnswer: 3,
      },
      {
        id: 7,
        text: 'The chemical formula for table salt is:',
        options: ['NaCl', 'KCl', 'CaCl2', 'MgCl2'],
        correctAnswer: 0,
      },
      {
        id: 8,
        text: 'What is the speed of light in vacuum?',
        options: ['3 × 10⁶ m/s', '3 × 10⁷ m/s', '3 × 10⁸ m/s', '3 × 10⁹ m/s'],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: 'exam-3',
    title: 'English Literature Final',
    subject: 'English',
    duration: 90,
    totalQuestions: 6,
    description: 'Final examination on poetry and prose analysis',
    scheduledDate: '2024-12-25',
    status: 'upcoming',
    questions: [
      {
        id: 1,
        text: 'Who wrote "Romeo and Juliet"?',
        options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
        correctAnswer: 1,
      },
      {
        id: 2,
        text: 'A sonnet traditionally has how many lines?',
        options: ['10', '12', '14', '16'],
        correctAnswer: 2,
      },
      {
        id: 3,
        text: 'What is a metaphor?',
        options: [
          'A direct comparison using like or as',
          'An implied comparison without like or as',
          'Exaggeration for effect',
          'Giving human qualities to non-human things',
        ],
        correctAnswer: 1,
      },
      {
        id: 4,
        text: 'The main character in a story is called the:',
        options: ['Antagonist', 'Protagonist', 'Narrator', 'Author'],
        correctAnswer: 1,
      },
      {
        id: 5,
        text: 'Which literary device involves giving human characteristics to non-human things?',
        options: ['Simile', 'Hyperbole', 'Personification', 'Alliteration'],
        correctAnswer: 2,
      },
      {
        id: 6,
        text: '"To be or not to be" is from which play?',
        options: ['Macbeth', 'Hamlet', 'Othello', 'King Lear'],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: 'mock-2023-12',
    title: 'Mock Entrance Exam - December 2023',
    subject: 'General Knowledge',
    duration: 60,
    totalQuestions: 10,
    description: 'Practice test covering various subjects including science, history, and language',
    scheduledDate: '2023-12-16',
    status: 'ongoing',
    questions: [
      {
        id: 1,
        text: "In our solar system, which planet maintains the closest average distance to the sun throughout its orbital period, despite having a highly elliptical orbit that brings it closer to the sun than Venus at certain points?",
        options: ['Venus', 'Mercury', 'Earth', 'Mars'],
        correctAnswer: 1,
        type: 'science',
        explanation: 'Mercury is the closest planet to the sun in our solar system.'
      },
      {
        id: 2,
        text: "Considering Japan's unique blend of traditional culture and modern technology, which of the following is the capital city of Japan, a metropolis that serves as the political, economic, and cultural center of the country, known for its advanced infrastructure, historical temples, and as the seat of the Japanese government and the Imperial Palace?",
        options: ['Beijing', 'Seoul', 'Tokyo', 'Bangkok'],
        correctAnswer: 2,
        type: 'geography',
        explanation: 'Tokyo is the capital and most populous city of Japan.'
      },
      {
        id: 3,
        text: "In the realm of number theory, a prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself. Considering this definition, which of the following numbers is a prime number that also happens to be the sum of the first four prime numbers?",
        options: ['9', '15', '17', '21'],
        correctAnswer: 2,
        type: 'Mathematics (prime numbers)',
        explanation: '17 is a prime number as it has no positive divisors other than 1 and itself.'
      },
      {
        id: 4,
        text: "The Mona Lisa, also known as La Gioconda, is one of the most famous and valuable paintings in the world, currently housed in the Louvre Museum in Paris. This iconic portrait, created during the Italian Renaissance, is particularly famous for the subject's enigmatic expression. Which of the following renowned artists from the High Renaissance period is credited with painting this masterpiece between 1503 and 1519?",
        options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Michelangelo'],
        correctAnswer: 2,
        type: 'Art (famous paintings)',
        explanation: 'Leonardo da Vinci painted the Mona Lisa in the early 16th century.'
      },
      {
        id: 5,
        text: 'In the periodic table of elements, each element is represented by a unique chemical symbol derived from its Latin name. Gold, a highly sought-after precious metal that has been used for coinage, jewelry, and other arts throughout recorded history, has a chemical symbol that originates from its Latin name \"aurum.\" What is this chemical symbol that represents gold in the periodic table?',
        options: ['Ag', 'Fe', 'Au', 'Pb'],
        correctAnswer: 2,
        type: 'science',
        explanation: 'The chemical symbol for gold is Au, from the Latin word "aurum".'
      },
      {
        id: 6,
        text: "In the field of computer science, programming languages are used to create software, websites, and applications. While many technologies are commonly referred to as programming languages, some are actually frameworks, libraries, or markup languages. Considering this distinction, which of the following options is NOT a general-purpose programming language but rather a framework used for building responsive web applications with a single codebase that can target multiple platforms including web, mobile, and desktop?",
        options: ['Python', 'Java', 'HTML', 'Quasar'],
        correctAnswer: 3,
        type: 'Technology (programming languages)',
        explanation: 'Quasar is a framework for building responsive websites, not a programming language.'
      },
      {
        id: 7,
        text: "In the animal kingdom, mammals are distinguished by several characteristics including the presence of mammary glands, hair or fur, and the ability to regulate their body temperature. Among these diverse creatures, which marine mammal holds the title of being the largest known animal to have ever existed on Earth, with some specimens reaching lengths of up to 100 feet (30 meters) and weights of up to 200 tons, primarily feeding on tiny shrimp-like animals called krill?",
        options: ['African Elephant', 'Blue Whale', 'Giraffe', 'Polar Bear'],
        correctAnswer: 1,
        type: 'Biology (largest mammal)',
        explanation: 'The Blue Whale is the largest mammal, reaching lengths of up to 100 feet.'
      },
      {
        id: 8,
        text: "The Great Barrier Reef, the world's largest coral reef system, is a UNESCO World Heritage site that stretches for over 2,300 kilometers (1,400 miles) and is visible from outer space. This natural wonder is home to an incredible diversity of marine life, including over 1,500 species of fish, 400 types of coral, and numerous endangered species. Off the coast of which country is this magnificent marine park located, a country that is also the world's sixth-largest by total area and is famous for its unique wildlife and diverse ecosystems?",
        options: ['Brazil', 'Australia', 'Thailand', 'Mexico'],
        correctAnswer: 1,
        type: 'geography',
        explanation: 'The Great Barrier Reef is located off the coast of Queensland, Australia.'
      },
      {
        id: 9,
        text: "The Sun, the star at the center of our solar system, is a nearly perfect sphere of hot plasma that generates energy through nuclear fusion in its core. This process converts hydrogen atoms into helium, releasing enormous amounts of energy in the form of electromagnetic radiation. By mass, what element constitutes approximately three-quarters of the Sun's composition, making it the primary fuel for the nuclear fusion reactions that have been powering our solar system for about 4.6 billion years?",
        options: ['Liquid Lava', 'Hydrogen', 'Oxygen', 'Carbon Dioxide'],
        correctAnswer: 1,
        type: 'Science (planets, chemistry, astronomy)',
        explanation: 'The Sun is primarily composed of hydrogen (about 74%) and helium (about 24%).'
      },
      {
        id: 10,
        text: "As the world seeks to transition to more sustainable energy sources to combat climate change, renewable energy has become increasingly important. These energy sources are naturally replenished on a human timescale and typically have a much lower environmental impact than fossil fuels. Among the following options, which one represents a clean, renewable source of energy that harnesses the power of the sun's radiation to generate electricity through photovoltaic cells or concentrated solar power systems, without producing greenhouse gas emissions during operation?",
        options: ['Coal', 'Natural Gas', 'Solar Power', 'Petroleum'],
        correctAnswer: 2,
        type: 'Environmental Science (renewable energy)',
        explanation: 'Solar power is a renewable energy source as it comes from the sun, which is virtually inexhaustible.'
      }
    ]
  }
];
