import { Flex, ScrollArea } from '@mantine/core';
import { IconNotes } from '@tabler/icons-react';
// import { UserButton } from '../UserButton/UserButton';
// import { LinksGroup } from '../NavbarLinksGroup/NavbarLinksGroup';
// import { Logo } from './Logo';
import { AppContext } from '@/context/AppContext';
import { IIntegration } from '@/type/integration';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import classes from './Integration.module.css';
import IntegrationConfig from './IntegrationConfig';
import { LinksGroup } from './components/LinksGroup';

const getIntegrationsLinksData = (integrations: IIntegration[]) => [
	{
		label: 'AI Models',
		icon: IconNotes,
		initiallyOpened: true,
		links: integrations.map((integration) => ({
			label: integration.label,
			link: `/integration/${integration.id}`,
		})),
	},
];

export function Integration({ id }: { id?: string }) {
	const { integrationId } = useParams();
	const { integrations } = useContext(AppContext);
	const links = getIntegrationsLinksData(integrations).map((item) => <LinksGroup {...item} key={item.label} />);
	return (
		<Flex direction={'row'}>
			{!id && (
				<nav className="w-44 border-r px-3 h-screen">
					<ScrollArea className={classes.links}>
						<div className={classes.linksInner}>{links}</div>
					</ScrollArea>
				</nav>
			)}
			<Flex className="flex-1">
				<IntegrationConfig id={id ?? integrationId} />
			</Flex>
		</Flex>
	);
}
