import { Component, onMount } from 'solid-js'
import styles from '../assets/css/Games.module.css'

interface GameProps {
  name: string
  root: string
  file: string
  img: string
}
const Game: Component<GameProps> = (props) => {
  const href = `books/files/${props.root}/${props.file}`
  const imgSrc = `http://phantom.lol/books/files/${props.root}/${props.img}`

  return (
    <a href={href} class={styles.game} rel="noopener noreferrer">
      <img src={imgSrc} alt={props.name} class={styles.gameImg} />
      <div class={styles.gameTitle}>{props.name}</div>
    </a>
  )
}

export default Game
