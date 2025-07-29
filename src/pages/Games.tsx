import { Component, createSignal, For, createMemo } from 'solid-js'
import Game from '../components/Game'
import games from '../assets/books.json'
import styles from '../assets/css/Games.module.css'
import '../assets/css/Themes.module.css';


const Games: Component = () => {
  const [search, setSearch] = createSignal('')

  const filteredGxmes = createMemo(() =>
    games.filter((game) =>
      game.name.toLowerCase().includes(search().toLowerCase())
    )
  )

  return (
    <div class={styles.gamesPage}>
      <h1 class={styles.header}>AloraGames</h1>
      <input
        type="text"
        placeholder="Search games..."
        class={styles.searchBar}
        value={search()}
        onInput={(e) => setSearch(e.currentTarget.value)}
      />
      <div class={styles.gcontainer}>
        <For each={filteredGxmes()}>
          {(game) => (
            <Game
              name={game.name}
              root={game.root}
              file={game.file}
              img={game.img}
            />
          )}
        </For>
      </div>
    </div>
  )
}

export default Games
