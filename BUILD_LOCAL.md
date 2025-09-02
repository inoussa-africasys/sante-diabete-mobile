# Guide build Android en local (macOS & Linux) avec keystore

Ce guide explique comment générer un build Android en local avec EAS Build, sur macOS et Linux, en utilisant le keystore fourni: `@dominiquehilton75__sante-diabet-mobile.jks`.

Projet: `sante-diabet-mobile`
- Expo SDK: 53 (`expo@53.0.20`)
- React Native: 0.79.5
- EAS CLI requis: ">= 13.2.3" (cf. `eas.json`)
- Profils EAS: `development`, `preview`, `production` (cf. `eas.json`)

## 1) Pré-requis

- Node.js LTS + npm (ou Yarn)
- Git
- EAS CLI (global ou via npx)
  - Global: `npm i -g eas-cli`
  - Vérif: `eas --version`
- Expo CLI (optionnel pour le dev): `npm i -g expo`
- Keystore Android: fichier `@dominiquehilton75__sante-diabet-mobile.jks` placé à la racine du projet
- Au choix pour le build local:
  - Recommandé: Docker (isole l'environnement)
  - Alternatif sans Docker: Android Studio + SDK + JDK 17 (et variables d'env configurées)

### 1.1) Docker (recommandé)
- macOS: installez Docker Desktop
- Linux: installez Docker Engine et assurez-vous que votre utilisateur peut exécuter Docker sans sudo
- Vérif: `docker run --rm hello-world`

### 1.2) Sans Docker (toolchain natif)
- Android Studio (SDK, Platform-Tools, Build-Tools)
- Java JDK 17
- Variables d'environnement (exemples):
  - macOS (shell zsh/bash):
    ```bash
    export JAVA_HOME=$(/usr/libexec/java_home -v 17)
    export ANDROID_HOME="$HOME/Library/Android/sdk"
    export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
    ```
  - Linux (bash):
    ```bash
    export JAVA_HOME="/usr/lib/jvm/java-17-openjdk"
    export ANDROID_HOME="$HOME/Android/Sdk"
    export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
    ```

## 2) Installation des dépendances du projet

À la racine du projet:
```bash
npm install
```

## 3) Configuration du keystore pour EAS local

Le fichier `credentials.json` est DÉJÀ CRÉÉ et REMPLI à la racine du projet, pointant vers `./@dominiquehilton75__sante-diabet-mobile.jks`.

Important:
- `credentials.json` est listé dans `.gitignore` afin d'éviter tout commit de secrets.
- Conservez le `.jks` et `credentials.json` en lieu sûr.

Exemple de structure (sans les valeurs réelles):
```json
{
  "android": {
    "keystore": {
      "keystorePath": "./@dominiquehilton75__sante-diabet-mobile.jks",
      "keystorePassword": "********",
      "keyAlias": "********",
      "keyPassword": "********"
    }
  }
}
```

### 3.1) Vérifier rapidement la configuration (macOS/Linux)

- Vérifier que le fichier existe et n'est pas vide:
  ```bash
  test -s credentials.json && echo "credentials.json OK" || echo "credentials.json manquant ou vide"
  ```
- Afficher le chemin du keystore depuis le JSON (si `jq` est installé):
  ```bash
  jq -r '.android.keystore.keystorePath' credentials.json
  ```
- Vérifier l'alias dans le keystore (nécessite JDK 17 et le mot de passe du keystore):
  ```bash
  export JAVA_HOME=${JAVA_HOME:-$(/usr/libexec/java_home -v 17 2>/dev/null || echo "/usr/lib/jvm/java-17-openjdk")}
  "$JAVA_HOME/bin/keytool" -list -v -keystore "./@dominiquehilton75__sante-diabet-mobile.jks"
  ```
  Entrez le mot de passe du keystore quand demandé, puis repérez "Alias name" (doit correspondre à `keyAlias`).

Remarque: Sous Windows, utilisez `keytool.exe` (ex: `& "$env:JAVA_HOME\bin\keytool.exe" -list -v -keystore .\@dominiquehilton75__sante-diabet-mobile.jks`).

## 4) Choix du profil et type d'artifact (APK/AAB)

Profils définis dans `eas.json`:
- `development`: client de dev, distribution interne
- `preview`: distribution interne
- `production`: autoIncrement activé

Par défaut, EAS Android produit un AAB. Pour forcer une APK (installation directe sur appareil), ajoutez dans `eas.json` au niveau du profil visé:

```jsonc
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle" // AAB (par défaut déjà)
      }
    }
  }
}
```

Vous pouvez aussi créer un profil dédié (ex: `apk`) pour éviter d'impacter `production`.

## 5) Lancer un build local

Commandes génériques:
- Avec Docker (recommandé):
  ```bash
  eas build --platform android --local --profile production
  ```
- Sans Docker (toolchain natif):
  ```bash
  EAS_NO_DOCKER=1 eas build --platform android --local --profile production
  ```

Remplacez `production` par `preview` ou `development` selon votre besoin.

### 5.1) Générer un AAB (bundle Play Store)

- Rien à changer: le format par défaut est AAB.
- Commande (Docker):
  ```bash
  eas build --platform android --local --profile production
  ```
- Commande (sans Docker):
  ```bash
  EAS_NO_DOCKER=1 eas build --platform android --local --profile production
  ```
- Optionnel: Pour verrouiller explicitement le format, définissez `android.buildType: "app-bundle"` dans le profil voulu de `eas.json` (voir §4).

Avant d'exécuter la commande, vérifiez:
- `credentials.json` présent et rempli (voir §3.1)
- Docker fonctionne (si mode Docker) OU JDK/ANDROID_HOME configurés (si mode sans Docker)

À la fin, EAS affichera le chemin de l'artifact généré (`.apk` ou `.aab`) dans le répertoire de sortie (ex: `dist/` ou chemin affiché dans la console).

## 6) Tests rapides sur appareil/émulateur

- APK: transférez l'APK sur l'appareil et installez-le, ou utilisez `adb install chemin/app.apk` (Android SDK requis)
- AAB: pour la distribution Play Store; pour tester en local, préférez l'APK

## 7) Débogage courant

- Problème Docker: vérifiez que Docker tourne et que vous pouvez lancer `hello-world`
- Sans Docker:
  - Vérifiez JDK 17 (`java -version`), ANDROID_HOME, PATH
  - Ouvrez Android Studio une fois pour que les SDK/acceptations de licences soient en place
  - `sdkmanager --licenses` pour accepter les licences si nécessaire
- Problème keystore: mots de passe/alias incorrects -> régénérez le `credentials.json` avec les bonnes valeurs
- Nettoyage cache Gradle local (si build natif):
  ```bash
  rm -rf ~/.gradle/caches
  ```

## 8) Démarrer le projet en dev (optionnel)

Pour lancer l'app en développement (Metro bundler):
```bash
npm run start
```
Puis:
- Android: `npm run android` (nécessite un émulateur ou un appareil branché)
- iOS (macOS + Xcode): `npm run ios`

## 9) Références

- `eas.json`: configuration des profils EAS (`eas.json`)
- `package.json`: scripts et versions (`package.json`)
- Expo EAS Build: https://docs.expo.dev/build/introduction/
- Credentials locaux: https://docs.expo.dev/build-reference/credentials/#local-builds

---

Conseil: conservez le keystore en lieu sûr. Si vous changez de machine, copiez `@dominiquehilton75__sante-diabet-mobile.jks` et mettez à jour `credentials.json` avec un chemin valide.
