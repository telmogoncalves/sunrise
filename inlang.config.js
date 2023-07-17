export async function defineConfig(env) {
  // importing the po plugin
  const plugin = await env.$import('https://cdn.jsdelivr.net/gh/jannesblobel/inlang-plugin-po@1/dist/index.js')

  const pluginConfig = {
    // Replace pathPattern with the path where your languages are stored.
    pathPattern: './locales/{language}.po',
    referenceResourcePath: './locales/en.po',
  }

  return {
    referenceLanguage: 'en',
    languages: await plugin.getLanguages({
      referenceLanguage: 'en',
      ...env,
      pluginConfig,
    }),
    readResources: args => plugin.readResources({ ...args, ...env, pluginConfig }),
    writeResources: args => plugin.writeResources({ ...args, ...env, pluginConfig }),
  }
}
