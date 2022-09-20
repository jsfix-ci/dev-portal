import { SectionOption } from 'lib/learn-client/types'
import { rewriteExternalTutorialLink } from '../utils'

const TEST_TUTORIAL_SLUG = 'vault/tutorial'
const MOCK_TUTORIAL_MAP = {
	'vault/tutorial': '/vault/tutorials/collection/tutorial',
	'onboarding/tutorial': '/onboarding/tutorials/collection/tutorial',
}

const testEachCase = (cases: string[][]) => {
	test.each(cases)(
		'rewriteExternalTutorialLink(%p) returns %p',
		(input: string, expectedOutput: string) => {
			expect(
				rewriteExternalTutorialLink(
					new URL(input, __config.dev_dot.canonical_base_url),
					MOCK_TUTORIAL_MAP
				)
			).toBe(expectedOutput)
		}
	)
}

describe('rewriteExternalTutorialLink', () => {
	describe('when the input is invalid', () => {
		test.each([
			'',
			'/',
			'invalid-input',
			'still/invalid',
			'also/invalid/',
			'/super/invalid',
			'another/invalid/input',
			'/almost/valid/input',
			'/one/more/invalid/input',
		])('rewriteExternalTutorialLink(%p) throws an error', (input: string) => {
			expect(() =>
				rewriteExternalTutorialLink(
					new URL(input, __config.dev_dot.canonical_base_url),
					{}
				)
			).toThrow()
		})
	})

	describe('when neither `search` nor `hash` are present', () => {
		testEachCase([
			['/tutorials/vault/tutorial', `${MOCK_TUTORIAL_MAP['vault/tutorial']}`],
			[
				'/tutorials/onboarding/tutorial',
				`${MOCK_TUTORIAL_MAP['onboarding/tutorial']}`,
			],
			['/tutorials/not-a-beta-product/tutorial', undefined],
			['/tutorials/vault/tutorial-does-not-exist', undefined],
		])
	})

	describe('when `search` is present, and `hash` is NOT present', () => {
		testEachCase([
			[
				'/tutorials/waypoint/tutorial?in=vault/collection',
				'/vault/tutorials/collection/tutorial',
			],
			[
				'/tutorials/waypoint/tutorial?paramA=valueA&in=vault/collection',
				'/vault/tutorials/collection/tutorial?paramA=valueA',
			],
			[
				'/tutorials/waypoint/tutorial?paramA=valueA&in=vault/collection&paramB=valueB',
				'/vault/tutorials/collection/tutorial?paramA=valueA&paramB=valueB',
			],
			[
				`/tutorials/${SectionOption.onboarding}/tutorial?in=vault/collection`,
				`/vault/tutorials/collection/tutorial`,
			],
			[
				`/tutorials/${SectionOption.onboarding}/tutorial?paramA=valueA&in=vault/collection`,
				`/vault/tutorials/collection/tutorial?paramA=valueA`,
			],
			[
				`/tutorials/${SectionOption.onboarding}/tutorial?paramA=valueA&in=vault/collection&paramB=valueB`,
				`/vault/tutorials/collection/tutorial?paramA=valueA&paramB=valueB`,
			],
		])
	})

	describe('when `search` is NOT present, and `hash` is present', () => {
		testEachCase([
			[
				`/tutorials/${TEST_TUTORIAL_SLUG}#test-hash`,
				`${MOCK_TUTORIAL_MAP[TEST_TUTORIAL_SLUG]}#test-hash`,
			],
			['/tutorials/vault/does-not-exist#test-hash', undefined],
		])
	})

	describe('when both `search` and `hash` are present', () => {
		testEachCase([
			[
				'/tutorials/waypoint/tutorial?in=vault/collection#test-hash',
				'/vault/tutorials/collection/tutorial#test-hash',
			],
			[
				'/tutorials/waypoint/tutorial?paramA=valueA&in=vault/collection#test-hash',
				'/vault/tutorials/collection/tutorial?paramA=valueA#test-hash',
			],
			[
				'/tutorials/waypoint/tutorial?paramA=valueA&in=vault/collection&paramB=valueB#test-hash',
				'/vault/tutorials/collection/tutorial?paramA=valueA&paramB=valueB#test-hash',
			],
		])
	})
})