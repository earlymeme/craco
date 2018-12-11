const args = require("./args");

const { projectRoot } = require("./paths");
const { isFunction, isArray, deepMergeWithArray } = require("./utils");
const { log } = require("./logger");
const { applyCracoConfigPlugins } = require("./features/plugins");
const { POSTCSS_MODES } = require("./features/style/postcss");
const { ESLINT_MODES } = require("./features/eslint");

const DEFAULT_CONFIG = {
    style: {
        postcss: {
            mode: POSTCSS_MODES.extends
        }
    },
    eslint: {
        mode: ESLINT_MODES.extends
    },
    jest: {
        babel: {
            addPresets: true,
            addPlugins: true
        }
    }
};

function ensureConfigSanity(cracoConfig) {
    if (isArray(cracoConfig.plugins)) {
        cracoConfig.plugins.forEach((x, index) => {
            if (!x.plugin) {
                throw new Error(`craco: Malformed plugin at index: ${index} of 'plugins'.`);
            }
        });
    }
}

function loadCracoConfig(context) {
    let configFilePath = "";

    if (args.config.isProvided) {
        configFilePath = require.resolve(`${projectRoot}/${args.config.value}`);
    } else {
        configFilePath = require.resolve(`${projectRoot}/craco.config.js`);
    }

    log("Found craco config file at: ", configFilePath);

    const userConfig = require(configFilePath);
    const userConfigAsObject = isFunction(userConfig) ? userConfig(context) : userConfig;

    const config = deepMergeWithArray({}, DEFAULT_CONFIG, userConfigAsObject);

    let resultingConfig = isFunction(config) ? config(context) : config;
    ensureConfigSanity(resultingConfig);
    resultingConfig = applyCracoConfigPlugins(resultingConfig, context);

    return resultingConfig;
}

module.exports = {
    loadCracoConfig
};
