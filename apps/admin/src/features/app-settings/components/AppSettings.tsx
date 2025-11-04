import type { AppSettingsUpdate } from "@opencircle/core";
import { Button, Input } from "@opencircle/ui";
import { Save, Settings, Upload, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../../utils/api";
import { useAppSettings } from "../hooks/useAppSettings";
import type { AppSettingsFormData } from "../utils/types";

export function AppSettings() {
	const {
		appSettings,
		isAppSettingsLoading,
		updateAppSettings,
		isUpdatingAppSettings,
	} = useAppSettings();
	const [formData, setFormData] = useState<AppSettingsFormData>({
		app_name: "",
		app_logo_url: "",
		enable_sign_up: true,
	});
	const [isUploadingLogo, setIsUploadingLogo] = useState(false);

	// Generate unique IDs for form elements
	const appNameId = useId();
	const logoUploadId = useId();
	const enableSignUpId = useId();
	const appLogoId = useId();

	useEffect(() => {
		if (appSettings) {
			setFormData({
				app_name: appSettings.app_name,
				app_logo_url: appSettings.app_logo_url || "",
				enable_sign_up: appSettings.enable_sign_up,
			});
		}
	}, [appSettings]);

	const handleInputChange = (
		field: keyof AppSettingsFormData,
		value: string | boolean,
	) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSave = async () => {
		try {
			const updateData: AppSettingsUpdate = {
				app_name: formData.app_name,
				app_logo_url: formData.app_logo_url || null,
				enable_sign_up: formData.enable_sign_up,
			};

			updateAppSettings(updateData, {
				onSuccess: () => {
					toast.success("App settings updated successfully");
				},
				onError: () => {
					toast.error("Failed to update app settings");
				},
			});
		} catch {
			toast.error("Failed to update app settings");
		}
	};

	const handleLogoUpload = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (file) {
			setIsUploadingLogo(true);
			try {
				const response = await api.appSettings.uploadLogo(file);
				handleInputChange("app_logo_url", response.app_logo_url || "");
				toast.success("Logo uploaded successfully");
			} catch {
				toast.error("Failed to upload logo");
			} finally {
				setIsUploadingLogo(false);
			}
		}
	};

	const handleDeleteLogo = () => {
		handleInputChange("app_logo_url", "");
	};

	if (isAppSettingsLoading) {
		return (
			<main className="p-6">
				<div className="flex h-64 items-center justify-center">
					<div className="animate-pulse text-muted-foreground">
						Loading settings...
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="max-w-4xl p-6">
			<div className="mb-6">
				<h1 className="flex items-center gap-2 font-medium text-2xl">
					<Settings className="h-6 w-6" />
					App Settings
				</h1>
				<p className="mt-1 text-muted-foreground">
					Manage your application settings and preferences
				</p>
			</div>

			<div className="rounded-lg border border-border shadow-sm">
				<div className="border-border border-b p-6">
					<h2 className="font-semibold text-lg">General Settings</h2>
					<p className="mt-1 text-gray-600 text-sm">
						Configure your application name, logo, and user registration
						settings
					</p>
				</div>
				<div className="space-y-6 p-6">
					<div className="space-y-2">
						<label htmlFor={appNameId} className="block font-medium text-sm">
							Application Name
						</label>
						<Input
							id={appNameId}
							value={formData.app_name}
							onChange={(e) => handleInputChange("app_name", e.target.value)}
							placeholder="Enter your application name"
						/>
					</div>

					<div className="space-y-2">
						<label htmlFor={appLogoId} className="block font-medium text-sm">
							Application Logo
						</label>
						<div className="flex gap-2">
							<Button
								type="button"
								variant="secondary"
								size="md"
								onClick={() => document.getElementById(logoUploadId)?.click()}
								disabled={isUploadingLogo}
							>
								{isUploadingLogo ? (
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
								) : (
									<Upload className="h-4 w-4" />
								)}
								{isUploadingLogo ? "Uploading..." : "Upload Logo"}
							</Button>
						</div>
						<input
							id={logoUploadId}
							type="file"
							accept="image/*"
							onChange={handleLogoUpload}
							className="hidden"
						/>
						{formData.app_logo_url && (
							<div className="mt-2 flex items-center gap-3">
								<img
									src={formData.app_logo_url}
									alt="Logo preview"
									className="h-16 w-16 rounded border object-contain"
								/>
								<Button type="button" size="sm" onClick={handleDeleteLogo}>
									<X className="h-4 w-4" />
								</Button>
							</div>
						)}
					</div>

					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							id={enableSignUpId}
							checked={formData.enable_sign_up}
							onChange={(e) =>
								handleInputChange("enable_sign_up", e.target.checked)
							}
							className="rounded"
						/>
						<label htmlFor="enable_sign_up" className="font-medium text-sm">
							Enable user registration
						</label>
					</div>

					<div className="flex justify-end pt-4">
						<Button onClick={handleSave} disabled={isUpdatingAppSettings}>
							{isUpdatingAppSettings ? (
								<>
									<div className="mr-2 h-4 w-4 animate-spin rounded-full border-white border-b-2" />
									Saving...
								</>
							) : (
								<>
									<Save className="mr-2 h-4 w-4" />
									Save Changes
								</>
							)}
						</Button>
					</div>
				</div>
			</div>
		</main>
	);
}
