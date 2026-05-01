using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Cityverse.Receiver
{
    /// <summary>
    /// Installs/re-installs building UI automatically and retries until scene objects exist.
    /// Prevents hover/rollover from depending on manual Tools menu execution.
    /// </summary>
    public static class CityverseBuildingUIAutoInstaller
    {
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void Bootstrap()
        {
            if (Object.FindFirstObjectByType<Runner>() != null)
                return;

            var go = new GameObject("CityverseBuildingUIAutoInstallerRunner");
            Object.DontDestroyOnLoad(go);
            go.hideFlags = HideFlags.HideAndDontSave;
            go.AddComponent<Runner>();
        }

        private class Runner : MonoBehaviour
        {
            private bool _installedForScene;

            private void OnEnable()
            {
                SceneManager.sceneLoaded += OnSceneLoaded;
                StartCoroutine(EnsureInstalled());
            }

            private void OnDisable()
            {
                SceneManager.sceneLoaded -= OnSceneLoaded;
            }

            private void OnSceneLoaded(Scene scene, LoadSceneMode mode)
            {
                _installedForScene = false;
                StartCoroutine(EnsureInstalled());
            }

            private IEnumerator EnsureInstalled()
            {
                if (_installedForScene)
                    yield break;

                // Retry for a short window because receivers/buildings may spawn after scene load.
                for (int i = 0; i < 20; i++)
                {
                    CityverseBuildingUIInstaller.InstallOrUpdateInScene();

                    var manager = Object.FindFirstObjectByType<BuildingCardsManager>();
                    if (manager != null && manager.buildingCards != null && manager.buildingCards.Count > 0)
                    {
                        _installedForScene = true;
                        yield break;
                    }

                    yield return new WaitForSeconds(0.25f);
                }

                Debug.LogWarning("[CityverseBuildingUIAutoInstaller] Auto-install retries finished before building anchors were detected.");
            }
        }
    }
}
