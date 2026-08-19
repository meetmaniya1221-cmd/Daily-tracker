export interface Quote {
  text: string
  author: string
}

/**
 * Curated, static collection — one is shown per day, picked
 * deterministically from the date so it stays stable all day and changes
 * tomorrow. No AI, no network: just timeless words.
 */
export const QUOTES: Quote[] = [
  { text: 'You have power over your mind — not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius' },
  { text: 'Waste no more time arguing about what a good man should be. Be one.', author: 'Marcus Aurelius' },
  { text: 'Very little is needed to make a happy life; it is all within yourself, in your way of thinking.', author: 'Marcus Aurelius' },
  { text: 'The impediment to action advances action. What stands in the way becomes the way.', author: 'Marcus Aurelius' },
  { text: 'We suffer more often in imagination than in reality.', author: 'Seneca' },
  { text: 'Luck is what happens when preparation meets opportunity.', author: 'Seneca' },
  { text: 'It is not that we have a short time to live, but that we waste a lot of it.', author: 'Seneca' },
  { text: 'No man is free who is not master of himself.', author: 'Epictetus' },
  { text: 'First say to yourself what you would be; and then do what you have to do.', author: 'Epictetus' },
  { text: 'The journey of a thousand miles begins with a single step.', author: 'Lao Tzu' },
  { text: 'When I let go of what I am, I become what I might be.', author: 'Lao Tzu' },
  { text: 'Nature does not hurry, yet everything is accomplished.', author: 'Lao Tzu' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'The man who moves a mountain begins by carrying away small stones.', author: 'Confucius' },
  { text: 'Our greatest glory is not in never falling, but in rising every time we fall.', author: 'Confucius' },
  { text: 'Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.', author: 'Rumi' },
  { text: 'The wound is the place where the Light enters you.', author: 'Rumi' },
  { text: 'What you seek is seeking you.', author: 'Rumi' },
  { text: 'Raise your words, not your voice. It is rain that grows flowers, not thunder.', author: 'Rumi' },
  { text: 'Wherever you stand, be the soul of that place.', author: 'Rumi' },
  { text: 'Kal kare so aaj kar, aaj kare so ab — do today what you would do tomorrow, do now what you would do today.', author: 'Kabir' },
  { text: 'The river that flows in you also flows in me.', author: 'Kabir' },
  { text: 'Wherever you are is the entry point.', author: 'Kabir' },
  { text: 'You cannot cross the sea merely by standing and staring at the water.', author: 'Rabindranath Tagore' },
  { text: 'Faith is the bird that feels the light when the dawn is still dark.', author: 'Rabindranath Tagore' },
  { text: 'Clouds come floating into my life, no longer to carry rain or usher storm, but to add color to my sunset sky.', author: 'Rabindranath Tagore' },
  { text: 'Live as if you were to die tomorrow. Learn as if you were to live forever.', author: 'Mahatma Gandhi' },
  { text: 'Strength does not come from physical capacity. It comes from an indomitable will.', author: 'Mahatma Gandhi' },
  { text: 'In a gentle way, you can shake the world.', author: 'Mahatma Gandhi' },
  { text: 'The future depends on what you do today.', author: 'Mahatma Gandhi' },
  { text: 'Arise, awake, and stop not till the goal is reached.', author: 'Swami Vivekananda' },
  { text: 'Take up one idea. Make that one idea your life; dream of it; think of it; live on that idea.', author: 'Swami Vivekananda' },
  { text: 'All the powers in the universe are already ours. It is we who have put our hands before our eyes.', author: 'Swami Vivekananda' },
  { text: 'You cannot believe in God until you believe in yourself.', author: 'Swami Vivekananda' },
  { text: 'Dream is not that which you see while sleeping; it is something that does not let you sleep.', author: 'A. P. J. Abdul Kalam' },
  { text: 'If you want to shine like a sun, first burn like a sun.', author: 'A. P. J. Abdul Kalam' },
  { text: 'Excellence is a continuous process and not an accident.', author: 'A. P. J. Abdul Kalam' },
  { text: 'All of humanity’s problems stem from man’s inability to sit quietly in a room alone.', author: 'Blaise Pascal' },
  { text: 'He who has a why to live can bear almost any how.', author: 'Friedrich Nietzsche' },
  { text: 'That which does not kill us makes us stronger.', author: 'Friedrich Nietzsche' },
  { text: 'What lies behind us and what lies before us are tiny matters compared to what lies within us.', author: 'Ralph Waldo Emerson' },
  { text: 'Do not go where the path may lead; go instead where there is no path and leave a trail.', author: 'Ralph Waldo Emerson' },
  { text: 'The only way to make sense out of change is to plunge into it, move with it, and join the dance.', author: 'Alan Watts' },
  { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { text: 'It is never too late to be what you might have been.', author: 'George Eliot' },
  { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Will Durant' },
  { text: 'Knowing yourself is the beginning of all wisdom.', author: 'Aristotle' },
  { text: 'The unexamined life is not worth living.', author: 'Socrates' },
  { text: 'Turn your wounds into wisdom.', author: 'Oprah Winfrey' },
  { text: 'How we spend our days is, of course, how we spend our lives.', author: 'Annie Dillard' },
  { text: 'The best time to plant a tree was twenty years ago. The second best time is now.', author: 'Chinese proverb' },
  { text: 'Fall seven times, stand up eight.', author: 'Japanese proverb' },
  { text: 'A river cuts through rock not because of its power, but because of its persistence.', author: 'James N. Watkins' },
  { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln (attributed)' },
  { text: 'Whether you think you can, or you think you can’t — you’re right.', author: 'Henry Ford' },
  { text: 'Do what you can, with what you have, where you are.', author: 'Theodore Roosevelt' },
  { text: 'Comparison is the thief of joy.', author: 'Theodore Roosevelt' },
  { text: 'Go confidently in the direction of your dreams. Live the life you have imagined.', author: 'Henry David Thoreau' },
  { text: 'It is not the mountain we conquer, but ourselves.', author: 'Edmund Hillary' },
  { text: 'Peace comes from within. Do not seek it without.', author: 'Buddhist teaching' },
  { text: 'Each morning we are born again. What we do today is what matters most.', author: 'Buddhist teaching' },
  { text: 'Drop by drop is the water pot filled.', author: 'The Dhammapada' },
]

function hashKey(key: string): number {
  let h = 0
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0
  }
  return h
}

/** The day's quote — same all day, different tomorrow. */
export function quoteForDate(dateKey: string): Quote {
  return QUOTES[hashKey(dateKey) % QUOTES.length]
}

/** A different quote from the day's one, for the shuffle button. */
export function anotherQuote(current: Quote): Quote {
  if (QUOTES.length < 2) return current
  let next = current
  let guard = 0
  while (next.text === current.text && guard < 10) {
    next = QUOTES[Math.floor(Math.random() * QUOTES.length)]
    guard++
  }
  return next
}
