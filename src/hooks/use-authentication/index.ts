import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { saveAndLoadAnalytics } from '@hashicorp/react-consent-manager'
import { preferencesSavedAndLoaded } from '@hashicorp/react-consent-manager/util/cookies'
import {
	AuthErrors,
	SessionData,
	UserData,
	ValidAuthProviderId,
} from 'types/auth'
import { UseAuthenticationOptions, UseAuthenticationResult } from './types'
import { makeSignIn, makeSignOut, signUp } from './helpers'
import { safeGetSegmentId } from 'lib/analytics'

export const DEFAULT_PROVIDER_ID = ValidAuthProviderId.CloudIdp

/**
 * Hook for consuming user, session, and authentication state. Sources all data
 * from next-auth/react's `useSession` hook.
 *
 * https://next-auth.js.org/getting-started/client#usesession
 */
const useAuthentication = (
	options: UseAuthenticationOptions = {}
): UseAuthenticationResult => {
	// Get router path for `signIn` and `signOut` `callbackUrl`s
	const router = useRouter()

	// Set up memoized `signIn` and `signOut` callbacks
	const signIn = useMemo(
		() => makeSignIn({ routerPath: router.asPath }),
		[router.asPath]
	)
	const signOut = useMemo(
		() => makeSignOut({ routerPath: router.asPath }),
		[router.asPath]
	)

	// Get option properties from `options` parameter
	const { isRequired = false, onUnauthenticated = () => signIn() } = options

	// Pull data and status from next-auth's hook, and pass options
	const { data, status } = useSession({
		required: isRequired,
		onUnauthenticated,
	})

	/**
	 * Force sign in to hopefully resolve the error. The error is automatically
	 * cleared in the process of initiating the login flow via `signIn`.
	 *
	 * Because `signOut` has to be invoked to fully log out of the provider, users
	 * _should_ be re-signed in by this action without having to use the Cloud IDP
	 * sign in screen.
	 *
	 * https://next-auth.js.org/tutorials/refresh-token-rotation#client-side
	 */
	useEffect(() => {
		if (data?.error === AuthErrors.RefreshAccessTokenError) {
			signIn()
		}
	}, [data?.error, signIn])

	// Deriving booleans about auth state
	const isLoading = status === 'loading'
	const isAuthenticated = status === 'authenticated'
	const showAuthenticatedUI = isAuthenticated
	const showUnauthenticatedUI = !isLoading && !isAuthenticated
	const preferencesLoaded = preferencesSavedAndLoaded()

	// We accept consent manager on the user's behalf. As per Legal & Compliance,
	// signing-in means a user is accepting our privacy policy and so we can
	// enable tracking. Should only be ran if not already set & loaded.
	useEffect(() => {
		if (isAuthenticated && !preferencesLoaded) {
			saveAndLoadAnalytics({ loadAll: true })
		}
	}, [isAuthenticated, preferencesLoaded])

	// Separating user and session data
	let session: SessionData, user: UserData
	if (isAuthenticated) {
		session = { ...data }
		user = data.user
		delete session.user

		const segmentUserId = safeGetSegmentId()
		if (segmentUserId !== session.accessToken) {
			// 	analytics?.accessToken(
			// 		session.accessToken,
			// 		{
			// 			email: user.email,
			// 			leadSource: 'DevPortal Sign Up',
			// 			devPortalSignUp: true,
			// 		},
			// 		{
			// 			// This limits PII flow to only Marketo as per Security and data engineering
			// 			integrations: {
			// 				All: false,
			// 				'Marketo V2': true,
			// 			},
			// 		}
			// 	)
		}
	}

	// Return everything packaged up in an object
	return {
		isAuthenticated,
		isLoading,
		session,
		showAuthenticatedUI,
		showUnauthenticatedUI,
		signIn,
		signOut,
		signUp,
		status,
		user,
	}
}

export default useAuthentication
