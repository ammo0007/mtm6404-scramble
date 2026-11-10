/**********************************************
 * STARTER CODE
 **********************************************/

/**
 * shuffle()
 * Shuffle the contents of an array
 *   depending the datatype of the source
 * Makes a copy. Does NOT shuffle the original.
 * Based on Steve Griffith's array shuffle prototype
 * @Parameters: Array or string
 * @Return: Scrambled Array or string, based on the provided parameter
 */
function shuffle (src) {
  const copy = [...src]

  const length = copy.length
  for (let i = 0; i < length; i++) {
    const x = copy[i]
    const y = Math.floor(Math.random() * length)
    const z = copy[y]
    copy[i] = z
    copy[y] = x
  }

  if (typeof src === 'string') {
    return copy.join('')
  }

  return copy
}

/**********************************************
 * YOUR CODE BELOW
 **********************************************/

// Words for the game
const words = [
  'banana',
  'computer',
  'pencil',
  'library',
  'garden',
  'orange',
  'planet',
  'camera',
  'window',
  'school',
  'rocket',
  'flower'
]

const maxStrikes = 5
const maxPasses = 3
const storageKey = 'mtm6404-scramble-progress'

// Scramble a word
function scrambleWord(word) {
  let scrambled = shuffle(word)
  let attempts = 0

  while (scrambled === word && attempts < 20) {
    scrambled = shuffle(word)
    attempts++
  }

  return scrambled
}

// Start a new game
function newGame() {
  const order = shuffle(words)

  return {
    remaining: order,
    scrambled: scrambleWord(order[0]),
    points: 0,
    strikes: 0,
    passes: 0,
    message: 'Unscramble the word to earn a point!'
  }
}

// Load saved progress
function savedGame() {
  const saved = localStorage.getItem(storageKey)

  if (saved) {
    try {
      const game = JSON.parse(saved)

      if (
        Array.isArray(game.remaining) &&
        typeof game.points === 'number' &&
        typeof game.strikes === 'number' &&
        typeof game.passes === 'number' &&
        typeof game.scrambled === 'string'
      ) {
        return game
      }
    } catch (error) {
      // Start a new game if saved data is invalid
    }
  }

  return newGame()
}

// React component
function App() {
  const [game, setGame] = React.useState(savedGame)
  const [guess, setGuess] = React.useState('')

  const isOver =
    game.strikes >= maxStrikes ||
    game.remaining.length === 0

  const currentWord = game.remaining[0]

  // Save progress
  React.useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(game))
  }, [game])

  // Move to the next word
  function nextWord(remaining, points, strikes, passes, message) {
    setGame({
      remaining: remaining,
      scrambled:
        remaining.length > 0
          ? scrambleWord(remaining[0])
          : '',
      points: points,
      strikes: strikes,
      passes: passes,
      message: message
    })
  }

  // Check the player's answer
  function handleGuess(event) {
    event.preventDefault()

    if (isOver) return

    const answer = guess.trim().toLowerCase()

    if (answer === '') return

    setGuess('')

    if (answer === currentWord) {
      nextWord(
        game.remaining.slice(1),
        game.points + 1,
        game.strikes,
        game.passes,
        'Correct! You earned one point.'
      )
    } else {
      setGame({
        ...game,
        strikes: game.strikes + 1,
        message: 'Incorrect! Try again.'
      })
    }
  }

  // Skip a word
  function handlePass() {
    if (isOver || game.passes >= maxPasses) return

    setGuess('')

    nextWord(
      game.remaining.slice(1),
      game.points,
      game.strikes,
      game.passes + 1,
      'Word skipped! Here is the next word.'
    )
  }

  // Restart the game
  function handleRestart() {
    setGuess('')
    setGame(newGame())
  }

  return (
    <main className="game">

      <p className="eyebrow">
        MTM6404 - React Word Game
      </p>

      <h1>Scramble</h1>

      <p className="intro">
        Put the letters back in the correct order.
      </p>

      <div className="stats">

        <div>
          <span>Points</span>
          <strong>{game.points}</strong>
        </div>

        <div>
          <span>Strikes</span>
          <strong>
            {game.strikes} / {maxStrikes}
          </strong>
        </div>

        <div>
          <span>Passes left</span>
          <strong>
            {maxPasses - game.passes}
          </strong>
        </div>

        <div>
          <span>Words left</span>
          <strong>
            {game.remaining.length}
          </strong>
        </div>

      </div>

      {isOver ? (

        <section className="play-area">

          <h2>Game Over</h2>

          <p>
            {game.remaining.length === 0
              ? 'You finished every word!'
              : 'You reached the strike limit.'}
          </p>

          <p>
            Your final score is
            <strong> {game.points} </strong>
            out of {words.length}.
          </p>

          <button onClick={handleRestart}>
            Play Again
          </button>

        </section>

      ) : (

        <section className="play-area">

          <p className="hint">
            Unscramble this word
          </p>

          <div className="scrambled">
            {game.scrambled.toUpperCase()}
          </div>

          <form onSubmit={handleGuess}>

            <label htmlFor="guess">
              Your guess
            </label>

            <input
              id="guess"
              type="text"
              value={guess}
              onChange={(event) =>
                setGuess(event.target.value)
              }
              placeholder="Type a word and press Enter"
              autoComplete="off"
            />

            <div className="actions">

              <button type="submit">
                Submit Guess
              </button>

              <button
                type="button"
                className="secondary"
                onClick={handlePass}
                disabled={game.passes >= maxPasses}
              >
                Pass ({maxPasses - game.passes} left)
              </button>

            </div>

          </form>

          <p className="message" role="status">
            {game.message}
          </p>

        </section>

      )}

      <p className="save-note">
        Your progress is saved automatically on this device.
      </p>

    </main>
  )
}

// Render the React application
const root = ReactDOM.createRoot(
  document.getElementById('root')
)

root.render(<App />)
