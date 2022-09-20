/* eslint-disable @typescript-eslint/no-empty-function */
import { ProductSlug } from 'types/products'
import * as utils from '../utils'
import { rewriteTutorialsLink } from '../'

jest.mock('../utils')

jest.mock('lib/get-is-beta-product', () => (productSlug: ProductSlug) => {
	return ['vault', 'waypoint'].includes(productSlug)
})

describe('rewriteTutorialsLink', () => {
	jest.spyOn(console, 'error').mockImplementation(jest.fn())
	jest.spyOn(utils, 'getIsRewriteableDocsLink').mockImplementation(jest.fn())
	jest.spyOn(utils, 'getIsRewriteableLearnLink').mockImplementation(jest.fn())
	jest.spyOn(utils, 'rewriteExternalDocsLink').mockImplementation(jest.fn())
	jest.spyOn(utils, 'rewriteExternalLearnLink').mockImplementation(jest.fn())

	const mockConsoleError = console.error as jest.Mock
	const mockGetIsRewriteableDocsLink =
		utils.getIsRewriteableDocsLink as jest.Mock
	const mockGetIsRewriteableLearnLink =
		utils.getIsRewriteableLearnLink as jest.Mock
	const mockRewriteExternalLearnLink =
		utils.rewriteExternalLearnLink as jest.Mock
	const mockRewriteExternalDocsLink = utils.rewriteExternalDocsLink as jest.Mock

	afterEach(() => {
		mockConsoleError.mockClear()
		mockGetIsRewriteableDocsLink.mockClear()
		mockGetIsRewriteableLearnLink.mockClear()
		mockRewriteExternalDocsLink.mockClear()
		mockRewriteExternalLearnLink.mockClear()
	})

	afterAll(() => {
		jest.restoreAllMocks()
	})

	test('when link is neither learn nor docs link', () => {
		mockGetIsRewriteableDocsLink.mockReturnValueOnce(false)
		mockGetIsRewriteableLearnLink.mockReturnValueOnce(false)

		expect(rewriteTutorialsLink('test-link', {})).toEqual('test-link')

		expect(mockGetIsRewriteableDocsLink).toHaveBeenCalledTimes(1)
		expect(mockGetIsRewriteableLearnLink).toHaveBeenCalledTimes(1)
		expect(mockRewriteExternalDocsLink).toHaveBeenCalledTimes(0)
		expect(mockRewriteExternalLearnLink).toHaveBeenCalledTimes(0)
		expect(mockConsoleError).toHaveBeenCalledTimes(1)
	})

	test('when link is a learn link, not a docs link', () => {
		mockGetIsRewriteableDocsLink.mockReturnValueOnce(false)
		mockGetIsRewriteableLearnLink.mockReturnValueOnce(true)
		mockRewriteExternalLearnLink.mockReturnValueOnce('mocked-return-value')

		expect(rewriteTutorialsLink('test-link', {})).toEqual('mocked-return-value')

		expect(mockGetIsRewriteableDocsLink).toHaveBeenCalledTimes(1)
		expect(mockGetIsRewriteableLearnLink).toHaveBeenCalledTimes(1)
		expect(mockRewriteExternalDocsLink).toHaveBeenCalledTimes(0)
		expect(mockRewriteExternalLearnLink).toHaveBeenCalledTimes(1)
		expect(mockConsoleError).toHaveBeenCalledTimes(0)
	})

	test('when link is a docs link, not a learn link', () => {
		mockGetIsRewriteableDocsLink.mockReturnValueOnce(true)
		mockGetIsRewriteableLearnLink.mockReturnValueOnce(false)
		mockRewriteExternalDocsLink.mockReturnValueOnce('mocked-return-value')

		expect(rewriteTutorialsLink('test-link', {})).toEqual('mocked-return-value')

		expect(mockGetIsRewriteableDocsLink).toHaveBeenCalledTimes(1)
		expect(mockGetIsRewriteableLearnLink).toHaveBeenCalledTimes(1)
		expect(mockRewriteExternalDocsLink).toHaveBeenCalledTimes(1)
		expect(mockRewriteExternalLearnLink).toHaveBeenCalledTimes(0)
		expect(mockConsoleError).toHaveBeenCalledTimes(0)
	})

	test('when the link is both a learn and a docs link', () => {
		mockGetIsRewriteableDocsLink.mockReturnValueOnce(true)
		mockGetIsRewriteableLearnLink.mockReturnValueOnce(true)
		mockRewriteExternalDocsLink.mockReturnValueOnce('mocked-docs-link')
		mockRewriteExternalLearnLink.mockReturnValueOnce('mocked-learn-link')

		expect(rewriteTutorialsLink('test-link', {})).toEqual('test-link')

		expect(mockGetIsRewriteableDocsLink).toHaveBeenCalledTimes(1)
		expect(mockGetIsRewriteableLearnLink).toHaveBeenCalledTimes(1)
		expect(mockRewriteExternalDocsLink).toHaveBeenCalledTimes(0)
		expect(mockRewriteExternalLearnLink).toHaveBeenCalledTimes(0)
		expect(mockConsoleError).toHaveBeenCalledTimes(1)
	})
})