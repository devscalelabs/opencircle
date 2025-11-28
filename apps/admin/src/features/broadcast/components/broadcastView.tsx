import { Badge, Button, Input } from "@opencircle/ui";
import MDEditor from "@uiw/react-md-editor";
import { format } from "date-fns";
import { Hash, Mail, Send, Users } from "lucide-react";
import { useState } from "react";
import type { Broadcast, BroadcastStatus } from "../utils/types";

interface BroadcastViewProps {
	broadcast: Broadcast;
	onSendTest: (testEmail: string) => Promise<void>;
	onSend: () => Promise<void>;
	isSendingTest?: boolean;
	isSending?: boolean;
}

const statusColors: Record<BroadcastStatus, string> = {
	draft: "bg-yellow-500/20 text-yellow-500",
	sending: "bg-blue-500/20 text-blue-500",
	sent: "bg-green-500/20 text-green-500",
	failed: "bg-red-500/20 text-red-500",
};

export const BroadcastView = ({
	broadcast,
	onSendTest,
	onSend,
	isSendingTest,
	isSending,
}: BroadcastViewProps) => {
	const [testEmail, setTestEmail] = useState("");

	const handleSendTest = async () => {
		if (!testEmail.trim()) return;
		await onSendTest(testEmail.trim());
		setTestEmail("");
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">{broadcast.subject}</h1>
					<div className="mt-2 flex items-center gap-4">
						<Badge className={statusColors[broadcast.status]}>
							{broadcast.status.charAt(0).toUpperCase() +
								broadcast.status.slice(1)}
						</Badge>
						<span className="text-foreground/60 text-sm">
							Created {format(new Date(broadcast.created_at), "MMM dd, yyyy")}
						</span>
						{broadcast.sent_at && (
							<span className="text-foreground/60 text-sm">
								Sent {format(new Date(broadcast.sent_at), "MMM dd, yyyy HH:mm")}
							</span>
						)}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="space-y-6 lg:col-span-2">
					<div className="rounded-lg border border-border bg-background p-6">
						<h2 className="mb-4 font-semibold text-lg">Email Content</h2>
						<div className="prose prose-invert max-w-none">
							<MDEditor.Markdown source={broadcast.content} />
						</div>
					</div>
				</div>

				<div className="space-y-4">
					{broadcast.status === "draft" && (
						<>
							<div className="rounded-lg border border-border bg-background p-4">
								<h3 className="mb-3 flex items-center gap-2 font-semibold text-sm">
									<Mail size={16} />
									Send Test Email
								</h3>
								<div className="space-y-3">
									<Input
										type="email"
										placeholder="test@example.com"
										value={testEmail}
										onChange={(e) => setTestEmail(e.target.value)}
									/>
									<Button
										className="w-full"
										onClick={handleSendTest}
										disabled={!testEmail.trim() || isSendingTest}
									>
										<Send size={14} className="mr-2" />
										{isSendingTest ? "Sending..." : "Send Test"}
									</Button>
								</div>
							</div>

							<div className="rounded-lg border border-border bg-background p-4">
								<h3 className="mb-3 flex items-center gap-2 font-semibold text-sm">
									{broadcast.recipient_type === "channel_members" ? (
										<Hash size={16} />
									) : (
										<Users size={16} />
									)}
									{broadcast.recipient_type === "channel_members"
										? `Send to ${broadcast.channel?.name || "Channel"} Members`
										: "Send to All Users"}
								</h3>
								<Button
									className="w-full"
									variant="destructive"
									onClick={onSend}
									disabled={isSending}
								>
									<Send size={14} className="mr-2" />
									{isSending ? "Sending..." : "Send Broadcast"}
								</Button>
								<p className="mt-2 text-foreground/60 text-xs">
									{broadcast.recipient_type === "channel_members"
										? `This will send the broadcast to all members of ${broadcast.channel?.emoji || ""} ${broadcast.channel?.name || "the selected channel"}.`
										: "This will send the broadcast to all active users."}
								</p>
							</div>
						</>
					)}

					{(broadcast.sent_count > 0 || broadcast.failed_count > 0) && (
						<div className="rounded-lg border border-border bg-background p-4">
							<h3 className="mb-3 font-semibold text-sm">Delivery Stats</h3>
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="text-foreground/60 text-sm">Sent</span>
									<span className="font-medium text-green-500">
										{broadcast.sent_count}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-foreground/60 text-sm">Failed</span>
									<span className="font-medium text-red-500">
										{broadcast.failed_count}
									</span>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
