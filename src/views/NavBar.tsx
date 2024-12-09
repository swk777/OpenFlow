import { Divider, Stack, Tooltip, UnstyledButton, rem } from '@mantine/core';
import {
	IconAdjustments,
	IconArrowLeft,
	IconDatabase,
	IconDeviceDesktopAnalytics,
	IconHome2,
	IconMessage,
	IconPuzzle,
	IconRocket,
	IconTemplate,
} from '@tabler/icons-react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import classes from './NavBar.module.css';

interface NavbarLinkProps {
	icon: typeof IconHome2;
	label: string;
	active?: boolean;
	disabled?: boolean;
	onClick?(): void;
}

function NavbarLink({ icon: Icon, label, active, disabled, onClick }: NavbarLinkProps) {
	return (
		<Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
			<UnstyledButton
				onClick={onClick}
				className={classes.link}
				data-active={active || undefined}
				disabled={disabled}
				style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
			>
				<Icon style={{ width: rem(24), height: rem(24) }} stroke={1.5} />
			</UnstyledButton>
		</Tooltip>
	);
}

const Links = [
	{ icon: IconRocket, label: 'Playground', link: '/' },
	{ icon: IconDeviceDesktopAnalytics, label: 'Workflow', link: '/workflows' },
	{ icon: IconMessage, label: 'Conversation', link: '/chat/new' },
	{
		icon: IconDatabase,
		label: 'Knowledge Base',
		link: '/knowledgeBaseBoard',
	},
	{ icon: IconTemplate, label: 'Templates', link: '/templates' },
	{ icon: IconAdjustments, label: 'Integration', link: '/integration' },
	{ icon: IconPuzzle, label: 'Extensions', link: '/extensions' },
];

export default function NavBar() {
	const navigate = useNavigate();
	const location = useLocation();
	const navigationType = useNavigationType();

	const canGoBack = navigationType !== 'POP' || location.key !== 'default';

	const handleBack = () => {
		if (canGoBack) {
			navigate(-1);
		}
	};

	return (
		<nav className={classes.navbar}>
			<div className={classes.navbarMain}>
				<Stack justify="center" gap={0}>
					<NavbarLink icon={IconArrowLeft} label="Go Back" onClick={handleBack} disabled={!canGoBack} />
					<Divider my="sm" />
					{Links.map((link) => (
						<NavbarLink {...link} key={link.label} active={location.pathname === link.link} onClick={() => navigate(link.link)} />
					))}
				</Stack>
			</div>
		</nav>
	);
}
