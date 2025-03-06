import * as preact from 'preact'
import style from './style/editor.module.scss'
import { combineClass } from './utils'

const { h } = preact

export interface EditorProps {
  value: string
  onInput?: JSX.EventHandler<Event>
  [key: string]: any
}

// Fonction de nettoyage pour supprimer les balises <script> et <iframe>
const sanitizeInput = (input: string): string => {
  return input.replace(/<script[^>]*>([\S\s]*?)<\/script>/gim, '')
              .replace(/<iframe[^>]*>([\S\s]*?)<\/iframe>/gim, '')
}

const Editor: preact.FunctionalComponent<EditorProps> = props => {
  const handleInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement
    const sanitizedValue = sanitizeInput(target.value)
    
    // Crée un nouvel événement d'entrée avec la valeur nettoyée
    const newEvent = new Event('input', { bubbles: true })
    Object.defineProperty(newEvent, 'target', { value: { value: sanitizedValue }, writable: false })

    if (props.onInput) {
      props.onInput(newEvent)
    }
  }

  return (
    <textarea
      {...combineClass(props, style.editor)}
      aria-label="Editor"
      onInput={handleInput}
    >
      {props.value}
    </textarea>
  )
}

export const MarpEditor: preact.FunctionalComponent<EditorProps> = props => (
  <div class={style.marpEditorContainer}>
    <Editor {...combineClass(props, style.marpEditor)} />
  </div>
)

export default Editor