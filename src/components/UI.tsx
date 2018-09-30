import * as React from "react";
import Character from "entities/Character";
import CharacterBar from "./CharacterBar";
import styled from 'styled-components'

interface Props {
	characters: Character[]
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
					<CharacterBar name={character.name} icon={character.icon} />
				))}
			</FloatingContainer>
		)
	}
}