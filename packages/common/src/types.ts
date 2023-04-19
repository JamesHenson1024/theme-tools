import { URI } from 'vscode-languageserver';
import {
  Config,
  Dependencies as ThemeCheckDependencies,
} from '@shopify/theme-check-common';

import { WithOptional } from './utils';

export type Dependencies = WithOptional<RequiredDependencies, 'log'>;

export interface RequiredDependencies {
  /**
   * A basic logging function.
   *
   * You might want console.log in development, and bugsnag in production.
   */
  log(message: string): void;

  /**
   * loadConfig(uri)
   *
   * In local environments, it's possible for one Language Server to deal
   * with a workspace that contains many different configurations. In the
   * browser, it isn't.
   *
   * loadConfig is the runtime-agnostic solution.
   *
   * @example
   *
   * Here's an example VS Code workspace a partner could run
   * ```
   * theme1/
   *   src/
   *     locales/
   *     sections/
   *     snippets/
   *   dist/
   *     locales/
   *     sections/
   *       foo.liquud
   *     snippets/
   * theme2/
   *   locales/
   *   sections/
   *   snippets/
   * ```
   *
   * In this situation, we have 3 different "roots."
   *
   * @param uri - a file path
   * @returns {Promise<Config>}
   */
  loadConfig(uri: URI): Promise<Config>;

  /**
   * findRootURI(uri: URI)
   *
   * A function that asynchronously returns the "root" of a theme.
   *
   * Injected because it's different in browser vs in Node.js
   * - In Node.js, we might do a .theme-check.yml algorithm with fs.exists
   * - In browser, we might statically return 'browser:///'
   */
  findRootURI(uri: URI): Promise<URI>;

  /**
   * getDefaultTranslationsFactory(root: URI)
   *
   * Returns the theme-check-js getDefaultTranslations() dependency.
   *
   * A factory because different repos have different default translations.
   */
  getDefaultTranslationsFactory(
    rootURI: URI,
  ): ThemeCheckDependencies['getDefaultTranslations'];

  /**
   * getDefaultLocale(root: URI)
   *
   * Returns the theme-check-js getDefaultLocale() dependency.
   *
   * A factory because different repos have different default locales.
   */
  getDefaultLocaleFactory(
    rootURI: URI,
  ): ThemeCheckDependencies['getDefaultLocale'];

  fileExists: ThemeCheckDependencies['fileExists'];
}
