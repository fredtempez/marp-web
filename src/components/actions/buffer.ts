import { AnyComponent, ComponentConstructor } from 'preact'
import { connect as unistoreConnect } from 'unistore/preact'
import { GlobalStore } from '../app'
import { ConnectedActions } from './utils'

export interface BufferActions {
  newCommand: () => void
  openCommand: () => void
  saveCommand: () => void
  updateBuffer: (buffer: string) => void
}

const confirmBuffer = (bufferChanged?: boolean) =>
  bufferChanged
    ? window.confirm('Are you sure? Your changed buffer will be lost.')
    : true

const actions: ConnectedActions<GlobalStore, BufferActions> = store => ({
  newCommand: ({ bufferChanged }) => {
    if (!confirmBuffer(bufferChanged)) return
    return { buffer: '', bufferChanged: false }
  },
  openCommand: ({ bufferChanged }) => {
    if (!confirmBuffer(bufferChanged)) return

    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute(
      'accept',
      '.md,.mdown,.markdown,.markdn,text/markdown,text/x-markdown,text/plain'
    )
    input.addEventListener('change', () => {
      const file = input.files![0]
      const reader = new FileReader()

      reader.onload = () =>
        store.setState({
          buffer: <string>reader.result,
          bufferChanged: false,
        })

      reader.readAsText(file)
    })
    input.click()
  },
  saveCommand: ({ buffer }) => {
    const bufferURL = URL.createObjectURL(
      new Blob([buffer], { type: 'text/markdown' })
    )
    const link = document.createElement('a')

    link.href = bufferURL
    link.download = 'untitled.md'
    link.style.display = 'none'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => URL.revokeObjectURL(bufferURL), 3000)
  },
  updateBuffer: (_, buffer) => ({ buffer, bufferChanged: true }),
})

export type ConnectableChild<
  P extends keyof GlobalStore = never,
  S = any
> = AnyComponent<
  JSX.ElementChildrenAttribute & Pick<GlobalStore, P> & BufferActions,
  S
>

export default function connect<P extends keyof GlobalStore = never, S = any>(
  ...props: P[]
): (Child: ConnectableChild<P, S>) => ComponentConstructor<any, S> {
  return unistoreConnect(props, actions)
}
