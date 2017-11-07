// @flow

import React from 'react'
import {observer} from 'mobx-react'
import {jss, colors, layout, fonts} from '../styles'
import {Modal, Tappable, LevelButton, Markdown} from '../components'
// import {chapters} from '../levels'
import {levelStore} from '../stores'
import type {Chapter, Level} from '../stores'

export type Props = {
	isOpen:         boolean,
	onRequestClose: () => void
}

type State = {
	selectedChapter: ?Chapter
}

@observer
export default class ChapterModal extends React.Component<*, Props, *> {

	props: Props
	state: State = {
		selectedChapter: null
	}

	selectCurrentChapter() {
		let chapter = levelStore.currentChapter
		const chapters = levelStore.chapters
		if (levelStore.chapterComplete(chapter)) {
			const index = chapters.findIndex(c => c.id === chapter.id)
			chapter = chapters[index + 1] || chapter
		}

		this.setState({selectedChapter: chapter})
	}

	render() {
		const {isOpen, onRequestClose} = this.props

		return (
			<Modal className={$.modal} isOpen={isOpen} onRequestClose={onRequestClose} onAfterOpen={this.onAfterOpen}>
				{this.renderHeader()}
				{this.renderBody()}
			</Modal>
		)
	}

	renderHeader() {
		return (
			<div className={$.header}>
				<h1>Chapters</h1>
			</div>
		)
	}

	renderBody() {
		return (
			<div className={$.body}>
				{this.renderChapterList()}
				{this.renderChapter()}
			</div>
		)
	}

	renderChapterList() {
		const {selectedChapter} = this.state
		const isSelectedChapter = chapter => {
			return selectedChapter != null && chapter.id === selectedChapter.id
		}

		return (
			<div className={$.chapterList}>
				{levelStore.chapters.map((chapter, i) => (
					<Tappable
						key={chapter.id}
						className={[$.chapterButton, isSelectedChapter(chapter) && $.selectedChapterButton]}
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
			<div className={$.chapter}>
				{this.renderChapterHeader(selectedChapter)}
				{this.renderLevelSelector(selectedChapter.levels)}
			</div>
		)
	}

	renderChapterHeader(chapter: Chapter) {
		return (
			<div className={$.chapterHeader}>
				<div className={$.chapterName}>
					{chapter.name}
				</div>
				<Markdown key={chapter.id} className={$.chapterDescription}>
					{chapter.description}
				</Markdown>
			</div>
		)
	}

	renderLevelSelector(levels: Level[]) {
		return (
			<div className={$.levelSelector}>
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