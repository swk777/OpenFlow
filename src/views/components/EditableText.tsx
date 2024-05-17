import { FocusTrap, Group, TextInput } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';
import { useState } from 'react';

type Props = {
	showElement: JSX.Element;
	initialName: string;
	onChange: (v: string) => void;
};

export default function EditableText({ showElement, initialName, onChange }: Props) {
	const [isEditingName, setIsEditingName] = useState(false);
	const [name, setName] = useState(initialName);
	return (
		<Group gap={0} className="flex-1">
			{isEditingName ? (
				<FocusTrap active={isEditingName}>
					<TextInput
						size="xs"
						w={144}
						value={name}
						onChange={(e) => setName(e.target.value)}
						onBlur={() => {
							setIsEditingName(false);
							onChange(name);
						}}
					></TextInput>
				</FocusTrap>
			) : (
				showElement
			)}
			<IconPencil
				className="text-primary h-4 cursor-pointer"
				onClick={() => {
					setIsEditingName(true);
				}}
			/>
		</Group>
	);
}
