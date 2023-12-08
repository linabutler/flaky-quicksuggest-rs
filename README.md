A flaky Remote Settings-ish server that serves up Suggest records and attachments, for debugging Fenix ingestion issues.

## Running the server

```bash
# Forward the device's port 8081 to the host's port 8080.
adb reverse tcp:8081 tcp:8080

# Stop forwarding.
adb reverse --remove tcp:8081

# Run the server, on the host's port 8080.
node .
```

## Patching Fenix to talk to the server

```diff
diff --git a/android-components/components/feature/fxsuggest/src/main/java/mozilla/components/feature/fxsuggest/FxSuggestStorage.kt b/android-components/components/feature/fxsuggest/src/main/java/mozilla/components/feature/fxsuggest/FxSuggestStorage.kt
index d96db3aab1..96d8da9271 100644
--- a/android-components/components/feature/fxsuggest/src/main/java/mozilla/components/feature/fxsuggest/FxSuggestStorage.kt
+++ b/android-components/components/feature/fxsuggest/src/main/java/mozilla/components/feature/fxsuggest/FxSuggestStorage.kt
@@ -9,6 +9,7 @@ import kotlinx.coroutines.CoroutineScope
 import kotlinx.coroutines.Dispatchers
 import kotlinx.coroutines.cancelChildren
 import kotlinx.coroutines.withContext
+import mozilla.appservices.remotesettings.RemoteSettingsConfig
 import mozilla.appservices.suggest.SuggestIngestionConstraints
 import mozilla.appservices.suggest.SuggestStore
 import mozilla.appservices.suggest.Suggestion
@@ -26,7 +27,14 @@ class FxSuggestStorage(
     // Lazily initializes the store on first use. `cacheDir` and using the `File` constructor
     // does I/O, so `store.value` should only be accessed from the read or write scope.
     private val store: Lazy<SuggestStore> = lazy {
-        SuggestStore(File(context.cacheDir, DATABASE_NAME).absolutePath)
+        SuggestStore(
+            File(context.cacheDir, DATABASE_NAME).absolutePath,
+            RemoteSettingsConfig(
+                serverUrl = "http://localhost:8081",
+                bucketName = "main",
+                collectionName = "quicksuggest",
+            ),
+        )
     }

     // We expect almost all Suggest storage operations to be reads, with infrequent writes. The

```
