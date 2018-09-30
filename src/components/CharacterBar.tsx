import * as React from "react";
import styled from "styled-components"

interface Props {
	name: string,
	icon: string,
	active?: boolean
}

const Bar = styled.li`
	background: #dddddd;
	font-family: sans-serif;
	padding: 2px 15px;
	display: flex;
	align-items: center;
	margin-bottom: 5px;
	width: 200px;
	font-size: 16px;
	line-height: 16px;
	border: 3px solid #555555;
	border-radius: 2px;

	img {
		width: 16px;
		height: 24px;
		margin-right: 15px;
	}

	${(props: Props) => props.active && 'background-color: #dddd00'}
`

export default function CharacterBar(props: Props) {
	return (
		<Bar {...props}>
			<img src={props.icon} />
			{props.name}
		</Bar>
	)
}