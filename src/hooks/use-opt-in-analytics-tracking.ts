import { useRouter } from 'next/router'
import {
  OptInPlatformOption,
  PlatformOptionTitles,
} from 'components/opt-in-out/types'
import { useEffect } from 'react'

export function useOptInAnalyticsTracking() {
  const { query } = useRouter()

  useEffect(() => {
    handleOptInAnalytics(query['optInFrom'] as OptInPlatformOption)
  }, [query])
}

/**
 * Fires beta opt in analytics event if the `optInFrom`
 * query param is present.
 */
export function handleOptInAnalytics(platform: OptInPlatformOption) {
  // @TODO use zach's helper function for this from the video embed
  // Ensures we don't send analytics data if the user hasn't consented
  const hasConsentedAnalyticsTracking =
    window && window.analytics && typeof window.analytics.track == 'function'
  const isValidPlatformOption =
    typeof platform === 'string' &&
    Object.keys(PlatformOptionTitles).indexOf(platform) !== -1

  if (hasConsentedAnalyticsTracking && isValidPlatformOption) {
    if (isValidPlatformOption && hasConsentedAnalyticsTracking) {
      console.log({ platform }, 'opted in')
      analytics.track('Beta Opted In', {
        bucket: platform,
      })
    }
  }
}