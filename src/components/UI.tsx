import * as React from "react";
import Character from "entities/Character";
import CharacterBar from "./CharacterBar";
import styled from 'styled-components'

interface Props {
	characters: Character[],
	activeCharacter: Character
}

const FloatingContainer = styled.ul`
	position: absolute;
	top: 25px;
	left: 25px;
	list-style-type: none;
	padding: 0;
	margin: 0;
`

export default class UI extends React.Component<Props> {
	public render() {
		return (
			<FloatingContainer>
				{this.props.characters.map(character => (
					<CharacterBar
						key={character.collider.uuid}
						name={character.name}
						icon={character.icon}
						active={this.props.activeCharacter === character}
					/>
				))}
			</FloatingContainer>
		)
	}
}