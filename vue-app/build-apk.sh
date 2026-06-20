#!/usr/bin/env bash
#
# build-apk.sh — Build the "Lucu yang Menyeramkan" Capacitor + Vue Android app.
#
# Pipeline: npm install -> vite build (dist/) -> capacitor sync android -> gradle assemble.
# Produces installable APKs under ./build-output/.
#
# Usage:
#   ./build-apk.sh                # build both debug and release (default)
#   ./build-apk.sh debug          # debug APK only
#   ./build-apk.sh release        # release APK only (signed)
#   ./build-apk.sh both           # explicit: both
#   ./build-apk.sh --clean        # gradle clean before building (can combine: --clean release)
#   ./build-apk.sh --skip-web     # skip npm install + vite build + cap sync (reuse existing dist/)
#   ./build-apk.sh --help
#
# Release signing:
#   On first release build, if no keystore exists, one is auto-generated at
#   android/release.jks and credentials are written to android/keystore.properties.
#   Override any of these via environment before running:
#     KEYSTORE_PATH   (default: android/release.jks)
#     KEYSTORE_PASS   (default: lucumenyeramkan)
#     KEY_ALIAS       (default: lucumenyeramkan)
#     KEY_PASS        (default: same as KEYSTORE_PASS)
#     KEY_DNAME       (default: CN=Lucu yang Menyeramkan, OU=SDN Tukharjo, O=SDN Tukharjo, C=ID)
#
# Requirements: node, npm, java (JDK 17+), Android SDK.
#
set -euo pipefail

# ---- locate ourselves -------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
ANDROID_DIR="$SCRIPT_DIR/android"
OUT_DIR="$SCRIPT_DIR/build-output"

# ---- pretty logging ---------------------------------------------------------
c_reset='\033[0m'; c_blue='\033[1;34m'; c_green='\033[1;32m'; c_yellow='\033[1;33m'; c_red='\033[1;31m'
step()  { printf "${c_blue}==>${c_reset} %s\n" "$*"; }
ok()    { printf "${c_green}  ✓${c_reset} %s\n" "$*"; }
warn()  { printf "${c_yellow}  ! ${c_reset}%s\n" "$*"; }
die()   { printf "${c_red}ERROR:${c_reset} %s\n" "$*" >&2; exit 1; }

# ---- parse args -------------------------------------------------------------
DO_DEBUG=0
DO_RELEASE=0
DO_CLEAN=0
SKIP_WEB=0
TARGET_SET=0

usage() { sed -n '2,40p' "$0" | sed 's/^# \{0,1\}//'; exit 0; }

for arg in "$@"; do
  case "$arg" in
    debug)     DO_DEBUG=1; TARGET_SET=1 ;;
    release)   DO_RELEASE=1; TARGET_SET=1 ;;
    both|all)  DO_DEBUG=1; DO_RELEASE=1; TARGET_SET=1 ;;
    --clean)   DO_CLEAN=1 ;;
    --skip-web) SKIP_WEB=1 ;;
    -h|--help) usage ;;
    *) die "Unknown argument: '$arg' (try --help)" ;;
  esac
done
# Default target: build both.
if [[ $TARGET_SET -eq 0 ]]; then DO_DEBUG=1; DO_RELEASE=1; fi

# ---- environment / tool checks ---------------------------------------------
step "Checking environment"

command -v node >/dev/null 2>&1 || die "node not found on PATH"
command -v npm  >/dev/null 2>&1 || die "npm not found on PATH"
command -v java >/dev/null 2>&1 || die "java (JDK) not found on PATH"
ok "node $(node --version), npm $(npm --version)"
ok "java $(java -version 2>&1 | head -1 | sed 's/.*version //; s/"//g')"

# Resolve the Android SDK. Prefer existing env, then local.properties, then common defaults.
resolve_sdk() {
  if [[ -n "${ANDROID_HOME:-}" && -d "${ANDROID_HOME}" ]]; then echo "$ANDROID_HOME"; return; fi
  if [[ -n "${ANDROID_SDK_ROOT:-}" && -d "${ANDROID_SDK_ROOT}" ]]; then echo "$ANDROID_SDK_ROOT"; return; fi
  if [[ -f "$ANDROID_DIR/local.properties" ]]; then
    local d; d="$(grep -E '^sdk\.dir=' "$ANDROID_DIR/local.properties" | head -1 | cut -d= -f2-)"
    if [[ -n "$d" && -d "$d" ]]; then echo "$d"; return; fi
  fi
  for d in "$HOME/Android/Sdk" "$HOME/Library/Android/sdk" "/usr/lib/android-sdk"; do
    [[ -d "$d" ]] && { echo "$d"; return; }
  done
  echo ""
}

SDK_DIR="$(resolve_sdk)"
[[ -n "$SDK_DIR" ]] || die "Android SDK not found. Set ANDROID_HOME or android/local.properties (sdk.dir=...)."
export ANDROID_HOME="$SDK_DIR"
export ANDROID_SDK_ROOT="$SDK_DIR"
ok "Android SDK: $SDK_DIR"

# Ensure android/local.properties points at the resolved SDK (gradle reads this).
if [[ ! -f "$ANDROID_DIR/local.properties" ]] || ! grep -q "^sdk.dir=$SDK_DIR$" "$ANDROID_DIR/local.properties" 2>/dev/null; then
  echo "sdk.dir=$SDK_DIR" > "$ANDROID_DIR/local.properties"
  ok "Wrote android/local.properties"
fi

# Find keytool (needed for release keystore generation), from JAVA_HOME or PATH.
find_keytool() {
  if [[ -n "${JAVA_HOME:-}" && -x "$JAVA_HOME/bin/keytool" ]]; then echo "$JAVA_HOME/bin/keytool"; return; fi
  command -v keytool >/dev/null 2>&1 && { command -v keytool; return; }
  echo ""
}

mkdir -p "$OUT_DIR"

# ---- web build (vite) + capacitor sync -------------------------------------
build_web() {
  if [[ $SKIP_WEB -eq 1 ]]; then
    warn "Skipping web build (--skip-web); reusing existing dist/"
    [[ -d "$SCRIPT_DIR/dist" ]] || die "--skip-web set but dist/ does not exist. Run a full build first."
    return
  fi

  step "Installing npm dependencies"
  if [[ -f package-lock.json ]]; then
    npm ci || npm install
  else
    npm install
  fi
  ok "Dependencies installed"

  step "Building web assets (vite)"
  npm run build
  [[ -d "$SCRIPT_DIR/dist" ]] || die "vite build did not produce dist/"
  ok "Web assets built -> dist/"

  step "Syncing web assets into Android (capacitor)"
  npx cap sync android
  ok "Capacitor sync complete"
}

# ---- release keystore (auto-generate if missing) ---------------------------
ensure_keystore() {
  local keystore_path="${KEYSTORE_PATH:-$ANDROID_DIR/release.jks}"
  local store_pass="${KEYSTORE_PASS:-lucumenyeramkan}"
  local key_alias="${KEY_ALIAS:-lucumenyeramkan}"
  local key_pass="${KEY_PASS:-$store_pass}"
  local dname="${KEY_DNAME:-CN=Lucu yang Menyeramkan, OU=SDN Tukharjo, O=SDN Tukharjo, C=ID}"

  if [[ ! -f "$keystore_path" ]]; then
    step "No keystore found — generating release keystore"
    local keytool; keytool="$(find_keytool)"
    [[ -n "$keytool" ]] || die "keytool not found (needed to create keystore). Ensure a JDK is installed."
    "$keytool" -genkeypair -v \
      -keystore "$keystore_path" \
      -alias "$key_alias" \
      -keyalg RSA -keysize 2048 -validity 10950 \
      -storepass "$store_pass" -keypass "$key_pass" \
      -dname "$dname"
    ok "Created keystore: $keystore_path"
    warn "Keep this keystore + passwords safe. You need the SAME keystore to update the app on a device."
  else
    ok "Using existing keystore: $keystore_path"
  fi

  # Write keystore.properties (consumed by android/app/build.gradle).
  # storeFile is resolved relative to the android/ root project dir.
  local rel_store
  case "$keystore_path" in
    "$ANDROID_DIR"/*) rel_store="${keystore_path#"$ANDROID_DIR"/}" ;;
    *)                rel_store="$keystore_path" ;;
  esac
  cat > "$ANDROID_DIR/keystore.properties" <<EOF
storeFile=$rel_store
storePassword=$store_pass
keyAlias=$key_alias
keyPassword=$key_pass
EOF
  ok "Wrote android/keystore.properties"
}

# ---- gradle build helpers ---------------------------------------------------
GRADLEW="./gradlew"
gradle_run() {
  ( cd "$ANDROID_DIR" && "$GRADLEW" "$@" )
}

collect_apk() {
  # $1 = build type label (debug|release), $2 = source apk path, $3 = output name
  local label="$1" src="$2" name="$3"
  [[ -f "$src" ]] || die "Expected $label APK not found at: $src"
  cp -f "$src" "$OUT_DIR/$name"
  local size; size="$(du -h "$OUT_DIR/$name" | cut -f1)"
  ok "$label APK -> build-output/$name ($size)"
}

# ---- run --------------------------------------------------------------------
[[ -x "$ANDROID_DIR/gradlew" ]] || die "android/gradlew not found or not executable"

build_web

if [[ $DO_CLEAN -eq 1 ]]; then
  step "Gradle clean"
  gradle_run clean
  ok "Clean complete"
fi

BUILT=()

if [[ $DO_DEBUG -eq 1 ]]; then
  step "Building DEBUG APK (assembleDebug)"
  gradle_run assembleDebug
  collect_apk "DEBUG" \
    "$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk" \
    "Lucu-yang-Menyeramkan-debug.apk"
  BUILT+=("debug")
fi

if [[ $DO_RELEASE -eq 1 ]]; then
  ensure_keystore
  step "Building RELEASE APK (assembleRelease)"
  gradle_run assembleRelease
  # With signing config present, gradle outputs app-release.apk (signed).
  rel_signed="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"
  rel_unsigned="$ANDROID_DIR/app/build/outputs/apk/release/app-release-unsigned.apk"
  if [[ -f "$rel_signed" ]]; then
    collect_apk "RELEASE (signed)" "$rel_signed" "Lucu-yang-Menyeramkan-release.apk"
  else
    collect_apk "RELEASE (UNSIGNED)" "$rel_unsigned" "Lucu-yang-Menyeramkan-release-unsigned.apk"
    warn "Release APK is unsigned — signing config did not apply."
  fi
  BUILT+=("release")
fi

step "Done"
ok "Built: ${BUILT[*]}"
ok "Output directory: $OUT_DIR"
ls -lh "$OUT_DIR"
