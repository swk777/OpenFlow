import { IConfigBaseExtend } from '@/type/configDefinition';
import { CssVarsProp, Flex } from '@mantine/core';
import { useContext } from 'react';
import ConfigContext from './ConfigContext';
import { getTargetConfigClass } from './types';

type Props = {
	definitions: IConfigBaseExtend<any>[];
	style?: CssVarsProp;
};

export default function ConfigureContent({ definitions, style }: Props) {
	const { isFieldVisible } = useContext(ConfigContext);
	return (
		<Flex style={style} gap="xs" direction={'column'}>
			{definitions &&
				definitions.map((definition) => {
					const TargetDef = getTargetConfigClass(definition);
					if (TargetDef && isFieldVisible(definition)) {
						const rowStyle = { marginTop: 10 };
						return <TargetDef key={definition.name || definition.label} definition={definition} style={rowStyle} />;
					}
					return null;
				})}
		</Flex>
	);
}
