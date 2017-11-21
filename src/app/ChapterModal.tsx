import * as React from 'react'
import {observer} from 'mobx-react'
import {jss, colors, layout, fonts} from '../styles'
import {Modal, Tappable, LevelButton, Markdown} from '../components'
import {levelStore} from '../stores'
import {Chapter, Level} from '../program'

export interface Props {
  isOpen:         boolean,
  onRequestClose: () => void
}

interface State {
  selectedChapter: Chapter | null
}

@observer
export default class ChapterModal extends React.Component<Props, State> {

  state: State = {
    selectedChapter: null
  }

  selectCurrentChapter() {
    let chapter = levelStore.currentChapter as Chapter
    if (chapter == null) { return }

    const chapters = levelStore.chapters
    if (levelStore.isChapterComplete(chapter)) {
      const index = chapters.findIndex(c => c.id === chapter.id)
      chapter = chapters[index + 1] || chapter
    }

    this.setState({selectedChapter: chapter})
  }

  render() {
    const {isOpen, onRequestClose} = this.props

    return (
      <Modal
        classNames={$.modal}
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        onAfterOpen={this.onAfterOpen}
        contentLabel="Chapters"
      >
        {this.renderHeader()}
        {this.renderBody()}
      </Modal>
    )
  }

  renderHeader() {
    return (
      <div classNames={$.header}>
        <h1>Chapters</h1>
      </div>
    )
  }

  renderBody() {
    return (
      <div classNames={$.body}>
        {this.renderChapterList()}
        {this.renderChapter()}
      </div>
    )
  }

  renderChapterList() {
    const {selectedChapter} = this.state
    const isSelectedChapter = (chapter: Chapter) => {
      if (selectedChapter == null) { return false }
      return chapter.id === selectedChapter.id
    }

    return (
      <div classNames={$.chapterList}>
        {levelStore.chapters.map((chapter, i) => (
          <Tappable
            key={chapter.id}
            classNames={[$.chapterButton, isSelectedChapter(chapter) && $.selectedChapterButton]}
            onTap={this.onChapterTap.bind(this, chapter)}
          >
            {i + 1}. {chapter.name}
          </Tappable>
        ))}
      </div>
    )
  }

  renderChapter() {
    const {selectedChapter} = this.state
    if (selectedChapter == null) { return null }

    return (
      <div classNames={$.chapter}>
        {this.renderChapterHeader(selectedChapter)}
        {this.renderLevelSelector(selectedChapter.levels)}
      </div>
    )
  }

  renderChapterHeader(chapter: Chapter) {
    return (
      <div classNames={$.chapterHeader}>
        <div classNames={$.chapterName}>
          {chapter.name}
        </div>
        <Markdown key={chapter.id} classNames={$.chapterDescription}>
          {chapter.description}
        </Markdown>
      </div>
    )
  }

  renderLevelSelector(levels: Level[]) {
    return (
      <div classNames={$.levelSelector}>
        {levels.map((level, i) => <LevelButton key={level.id} level={level} number={i + 1} color={colors.blue}/>)}
      </div>
    )
  }

  onChapterTap = (chapter: Chapter) => {
    this.setState({selectedChapter: chapter})
  }

  onAfterOpen = () => {
    this.selectCurrentChapter()
  }

}

const $ = jss({
  modal: {
    width:  640,
    height: 480,

    ...layout.flex.column
  },

  header: {
    ...layout.flex.center,
    padding: layout.padding.s,

    background: colors.secondary,
    color:      colors.fg.inverted,

    font:          fonts.digitalLarge,
    textTransform: 'uppercase',
  },

  body: {
    flex: [1, 0, 'auto'],

    ...layout.flex.row,
    padding:    layout.padding.m
  },

  chapterList: {
    font:        fonts.digital,
    marginRight: layout.padding.m
  },

  chapterButton: {
    padding: layout.padding.s,
    cursor:  'pointer',

    '&:hover': {
      color: colors.green
    }
  },

  selectedChapterButton: {
    color: colors.green
  },

  chapter: {
    flex: [1, 0, 0],
    ...layout.flex.column,

    borderRadius: layout.radius.l,
    padding:      layout.padding.m,
  },

  chapterHeader: {
    ...layout.flex.column
  },

  chapterName: {
    font:          fonts.digitalLarge,
    textTransform: 'uppercase',
    color:         colors.green,

    marginBottom: layout.padding.s
  },

  chapterDescription: {
    font:          fonts.small,
    paddingBottom: layout.padding.m,
    borderBottom:  [1, 'solid', colors.border.medium],
  },

  levelSelector: {
    marginTop:   layout.padding.m,
    marginRight: -layout.padding.m,

    ...layout.flex.row,
    flexWrap: 'wrap',

    '& > *': {
      marginRight:  layout.padding.m,
      marginBottom: layout.padding.m
    }
  }

})