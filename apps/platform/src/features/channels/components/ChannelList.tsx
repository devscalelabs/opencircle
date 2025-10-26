import { ChannelItem } from "../../../components/channelItem";
import { useChannels } from "../hooks/useChannels";

export const ChannelList = () => {
	const { channels, isChannelsLoading } = useChannels();

	if (isChannelsLoading) {
		return <div>Loading channels...</div>;
	}

	return (
		<div className="space-y-3">
			{channels.map((channel) => (
				<ChannelItem
					key={channel.id}
					emoji={channel.emoji}
					title={channel.name}
					to={`/?channel=${channel.slug}`}
				/>
			))}
		</div>
	);
};
