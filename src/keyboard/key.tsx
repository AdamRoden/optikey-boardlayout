import { FormStore, memo } from "@xpfw/form"
import { findIndex, get } from "lodash"
import { action } from "mobx"
import { observer } from "mobx-react-lite"
import * as React from "react"
import { activeKey, dragKey, hoverKey, keyboardPrefix } from "../form/def"

const switchKeys = action((row1: number, col1: number, row2: number, col2: number) => {
  const keys = FormStore.getValue("Keys", keyboardPrefix, [])
  const v1 = findIndex(keys, {Row: row1, Col: col1})
  const v2 = findIndex(keys, {Row: row2, Col: col2})
  if (v1 === -1) {
    keys.push({Row: row2, Col: col2})
  } else {
    keys[v1].Row = row2
    keys[v1].Col = col2
  }
  if (v2 === -1) {
    keys.push({Row: row1, Col: col1})
  } else {
    keys[v2].Row = row1
    keys[v2].Col = col1
  }
})
const keyMaker = (index: number, row: number, col: number) => `x${index}X${row}X${col}`

const clickHandler = (index: number) => memo(() => () => FormStore.setValue(activeKey, index), [activeKey, index])
const dragStartHandler = (index: number, row: number, col: number) => memo(() => (e: any) => {
  e.dataTransfer.dropEffect = "copy"
  e.dataTransfer.setData("row", String(row))
  e.dataTransfer.setData("col", String(col))
  FormStore.setValue(keyMaker(index, row, col), true, dragKey)
}, [dragKey + "start", index, row, col])
const dragEndHandler = (index: number, row: number, col: number) => memo(() => (e: any) => {
  FormStore.setValue(keyMaker(index, row, col), false, dragKey)
}, [dragKey + "end", index, row, col])
const dropHandler = (index: number, row: number, col: number) => memo(() => (e: any) => {
  FormStore.setValue(keyMaker(index, row, col), false, hoverKey)
  switchKeys(row, col, Number(e.dataTransfer.getData("row")), Number(e.dataTransfer.getData("col")))
}, [dragKey + "drop", index, row, col])
const dragOverHandler = (index: number, row: number, col: number) => memo(() => (e: any) => {
  e.dataTransfer.dropEffect = "move"
  FormStore.setValue(keyMaker(index, row, col), true, hoverKey)
}, [hoverKey + "start", index, row, col])
const dragLeaveHandler = (index: number, row: number, col: number) => memo(() => (e: any) => {
  FormStore.setValue(keyMaker(index, row, col), false, hoverKey)
}, [hoverKey + "enbd", index, row, col])

const KeyDisplay: React.FunctionComponent<{
  row: number, col: number
  index: number
  entry: any
}> = observer((props) => {
  const k = `x${props.index}X${props.row}X${props.col}`
  const isOver = FormStore.getValue(k, hoverKey, false)
  const isDragged = FormStore.getValue(k, dragKey, false)
  return (
    <div
      className={`key ${isOver ? "isHovered" : ""} ${isDragged ? "isDragged" : ""}`}
      draggable
      onClick={clickHandler(props.index)}
      onDragStart={dragStartHandler(props.index, props.row, props.col)}
      onDragEnd={dragEndHandler(props.index, props.row, props.col)}
      onDrop={dropHandler(props.index, props.row, props.col)}
      onDragOver={dragOverHandler(props.index, props.row, props.col)}
      onDragLeave={dragLeaveHandler(props.index, props.row, props.col)}
    >
      {props.row} {props.col} {props.index}
      {get(props, "entry.Label")}
    </div>
  )
})

export default KeyDisplay
export {
  clickHandler, dragStartHandler, dragEndHandler, dropHandler, dragOverHandler, dragLeaveHandler, switchKeys
}
