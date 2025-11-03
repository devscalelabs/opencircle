import { Avatar, Button, Input } from "@opencircle/ui";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "../../components/header";
import { useEditProfile } from "../../features/user/hooks/useEditProfile";

export const Route = createFileRoute("/_socialLayout/edit-profile")({
	component: EditProfile,
});

function EditProfile() {
	const {
		account,
		isAccountLoading,
		isAccountError,
		accountError,
		formData,
		updateMutation,
		fileInputRef,
		handleSubmit,
		handleChange,
		handleSocialChange,
		handleUpload,
		handleFileChange,
	} = useEditProfile();

	if (isAccountLoading) {
		return <div>Loading...</div>;
	}

	if (isAccountError || !account) {
		return (
			<div>
				Error loading account: {accountError?.message || "Account not found"}
			</div>
		);
	}

	return (
		<main>
			<Header label="Back" />
			<section className="flex flex-col items-center space-y-4 py-12">
				<div className="flex flex-col items-center space-y-2">
					<Avatar
						size="xl"
						initials={account.name?.charAt(0).toUpperCase() || ""}
						image_url={formData.avatar_url || ""}
					/>
					<Button onClick={handleUpload} variant="secondary" size="sm">
						{updateMutation.isPending ? "Uploading..." : "Change Avatar"}
					</Button>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						onChange={handleFileChange}
						className="hidden"
					/>
				</div>
				<h1 className="font-semibold text-xl">Edit Profile</h1>
				<form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
					<Input
						value={formData.name}
						onChange={(e) => handleChange("name", e.target.value)}
						placeholder="Name"
					/>
					<textarea
						value={formData.bio}
						onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
							handleChange("bio", e.target.value)
						}
						placeholder="Bio"
						className="w-full rounded-md border border-border bg-background p-2 text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
						rows={4}
					/>

					<div className="space-y-3">
						<h3 className="font-medium text-foreground/80 text-sm">
							Social Media
						</h3>
						<Input
							value={formData.user_social?.twitter_url || ""}
							onChange={(e) =>
								handleSocialChange("twitter_url", e.target.value)
							}
							placeholder="Twitter/X URL"
						/>
						<Input
							value={formData.user_social?.linkedin_url || ""}
							onChange={(e) =>
								handleSocialChange("linkedin_url", e.target.value)
							}
							placeholder="LinkedIn URL"
						/>
						<Input
							value={formData.user_social?.github_url || ""}
							onChange={(e) => handleSocialChange("github_url", e.target.value)}
							placeholder="GitHub URL"
						/>
						<Input
							value={formData.user_social?.website_url || ""}
							onChange={(e) =>
								handleSocialChange("website_url", e.target.value)
							}
							placeholder="Website URL"
						/>
					</div>

					<Button type="submit" disabled={updateMutation.isPending}>
						{updateMutation.isPending ? "Saving..." : "Save"}
					</Button>
				</form>
			</section>
		</main>
	);
}
