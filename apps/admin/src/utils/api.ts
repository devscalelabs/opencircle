import { createApi } from "@opencircle/core";
import ky, { HTTPError } from "ky";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const MAX_REFRESH_RETRIES = 2;

async function refreshAccessToken(retryCount = 0): Promise<string | null> {
	const refreshToken = localStorage.getItem("refreshToken");
	if (!refreshToken) {
		return null;
	}

	try {
		const response = await ky
			.post(`${API_URL}/auth/refresh`, {
				json: { refresh_token: refreshToken },
			})
			.json<{ access_token: string; token_type: string }>();

		localStorage.setItem("token", response.access_token);
		return response.access_token;
	} catch (error) {
		if (error instanceof HTTPError && error.response.status === 401) {
			localStorage.removeItem("token");
			localStorage.removeItem("refreshToken");
			return null;
		}

		if (retryCount < MAX_REFRESH_RETRIES) {
			await new Promise((resolve) =>
				setTimeout(resolve, 1000 * (retryCount + 1)),
			);
			return refreshAccessToken(retryCount + 1);
		}

		localStorage.removeItem("token");
		return null;
	}
}

async function getValidAccessToken(): Promise<string | null> {
	if (isRefreshing) {
		return refreshPromise;
	}

	isRefreshing = true;
	refreshPromise = refreshAccessToken();
	const token = await refreshPromise;
	isRefreshing = false;
	refreshPromise = null;
	return token;
}

export const api = createApi(API_URL, {
	beforeRequest: [
		(request) => {
			const token = localStorage.getItem("token");
			if (token) {
				request.headers.set("Authorization", `Bearer ${token}`);
			}
			return request;
		},
	],
	afterResponse: [
		async (request, _options, response) => {
			if (response.status === 401 && !request.url.includes("/auth/refresh")) {
				const newToken = await getValidAccessToken();
				if (newToken) {
					request.headers.set("Authorization", `Bearer ${newToken}`);
					return ky(request);
				}
				window.location.href = "/";
			}
			return response;
		},
	],
});

export function setTokens(accessToken: string, refreshToken: string) {
	localStorage.setItem("token", accessToken);
	localStorage.setItem("refreshToken", refreshToken);
}

export function clearTokens() {
	localStorage.removeItem("token");
	localStorage.removeItem("refreshToken");
}
