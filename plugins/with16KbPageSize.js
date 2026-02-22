// Config Plugin: Adds 16 KB page size alignment flags to native libraries
// Required for Android 15+ (API 35+) devices with 16 KB page size support
// Affects: libVisionCameraResizePlugin.so, libyuv.so
// Note: react-native-fast-tflite@2.0.0 already has these flags built-in

const { withDangerousMod, withAppBuildGradle } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

/**
 * Adds target_link_options with 16 KB page size flags to a CMakeLists.txt file.
 * Also sets CMAKE_SHARED_LINKER_FLAGS so subdirectories (like libyuv) inherit the flags.
 * Only adds if not already present to be idempotent.
 */
function patch16KbFlags(cmakePath, targetName) {
  if (!fs.existsSync(cmakePath)) {
    console.warn(`[with16KbPageSize] CMakeLists.txt not found at: ${cmakePath}`);
    return;
  }

  let content = fs.readFileSync(cmakePath, 'utf8');

  if (content.includes('max-page-size=16384')) {
    console.log(`[with16KbPageSize] Already patched: ${cmakePath}`);
    return;
  }

  // Set CMAKE_SHARED_LINKER_FLAGS early so subdirectories (libyuv) inherit it,
  // then also add target_link_options for this specific target.
  const patch = `
# 16 KB page size support for Android 15+ - applies to all shared libs incl. subdirs
string(APPEND CMAKE_SHARED_LINKER_FLAGS " -Wl,-z,max-page-size=16384 -Wl,-z,common-page-size=16384")

`;

  const linkOptions = `
target_link_options(${targetName}
    PRIVATE
    "-Wl,-z,max-page-size=16384"
    "-Wl,-z,common-page-size=16384"
)
`;

  // Insert CMAKE_SHARED_LINKER_FLAGS at top (after cmake_minimum_required if present, else at top)
  if (/cmake_minimum_required/i.test(content)) {
    content = content.replace(
      /(cmake_minimum_required[^\n]*\n)/i,
      `$1${patch}`
    );
  } else {
    content = patch + content;
  }

  // Append target_link_options at end
  content = content.trimEnd() + '\n' + linkOptions;
  fs.writeFileSync(cmakePath, content, 'utf8');
  console.log(`[with16KbPageSize] Patched 16 KB flags into: ${cmakePath}`);
}

/**
 * Patches libyuv CMakeLists.txt using CMAKE_SHARED_LINKER_FLAGS.
 * libyuv uses CMake 2.8.12 which doesn't support target_link_options,
 * so we use CMAKE_SHARED_LINKER_FLAGS which works with old CMake.
 * The shared target name is stored in variable ${ly_lib_shared}.
 */
function patchLibyuv16KbFlags(cmakePath) {
  if (!fs.existsSync(cmakePath)) {
    console.warn(`[with16KbPageSize] libyuv CMakeLists.txt not found at: ${cmakePath}`);
    return;
  }

  let content = fs.readFileSync(cmakePath, 'utf8');

  if (content.includes('max-page-size=16384')) {
    console.log(`[with16KbPageSize] libyuv already patched: ${cmakePath}`);
    return;
  }

  // Use CMAKE_SHARED_LINKER_FLAGS - works with CMake 2.8.12+
  // Also add SET_TARGET_PROPERTIES as fallback for the shared target
  const patch = `
# 16 KB page size support for Android 15+
string(APPEND CMAKE_SHARED_LINKER_FLAGS " -Wl,-z,max-page-size=16384 -Wl,-z,common-page-size=16384")
`;

  // Insert right after cmake_minimum_required line
  content = content.replace(
    /(CMAKE_MINIMUM_REQUIRED[^\n]*\n)/i,
    `$1${patch}`
  );

  fs.writeFileSync(cmakePath, content, 'utf8');
  console.log(`[with16KbPageSize] Patched libyuv 16 KB flags into: ${cmakePath}`);
}

/**
 * Patches vision-camera-resize-plugin CMakeLists.txt
 */
const withResizePlugin16Kb = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const nodeModulesDir = path.join(config.modRequest.projectRoot, 'node_modules');

      // vision-camera-resize-plugin main library
      const resizePluginCMake = path.join(
        nodeModulesDir,
        'vision-camera-resize-plugin',
        'android',
        'CMakeLists.txt'
      );
      patch16KbFlags(resizePluginCMake, 'VisionCameraResizePlugin');

      // libyuv (bundled inside vision-camera-resize-plugin at root level, not android/libyuv)
      // Uses CMAKE_SHARED_LINKER_FLAGS because libyuv requires CMake 2.8.12
      // which doesn't support target_link_options
      const libyuvCMake = path.join(
        nodeModulesDir,
        'vision-camera-resize-plugin',
        'libyuv',
        'CMakeLists.txt'
      );
      patchLibyuv16KbFlags(libyuvCMake);

      return config;
    },
  ]);
};

/**
 * Sets useLegacyPackaging = false in app/build.gradle
 * This ensures .so files are stored uncompressed and aligned in the APK,
 * which is required for 16 KB page size support.
 */
const withUncompressedNativeLibs = (config) => {
  return withAppBuildGradle(config, (config) => {
    const gradle = config.modResults;

    if (gradle.contents.includes('useLegacyPackaging')) {
      console.log('[with16KbPageSize] useLegacyPackaging already set in build.gradle');
      return config;
    }

    // Insert packaging block inside android { ... }
    const packagingBlock = `
    packaging {
        jniLibs {
            useLegacyPackaging = false
        }
    }`;

    // Find the android { block and add packaging after buildTypes
    if (gradle.contents.includes('buildTypes {')) {
      gradle.contents = gradle.contents.replace(
        /buildTypes\s*\{[^}]*\}/s,
        (match) => match + packagingBlock
      );
    } else {
      // Fallback: add before the last closing brace of android block
      gradle.contents = gradle.contents.replace(
        /android\s*\{([\s\S]*)\}/,
        (match, inner) => `android {${inner}${packagingBlock}\n}`
      );
    }

    console.log('[with16KbPageSize] Added useLegacyPackaging = false to build.gradle');
    return config;
  });
};

module.exports = (config) => {
  config = withResizePlugin16Kb(config);
  config = withUncompressedNativeLibs(config);
  return config;
};



