using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

namespace Cityverse.Receiver
{
    /// <summary>
    /// Polls GET /buildings/current on the cityverse-iot service and fires
    /// OnBuildingsUpdated with the full building list each cycle.
    ///
    /// Place one instance in the scene and wire many BuildingOverlayBehaviour
    /// components to it — this way all overlays share a single HTTP request.
    /// </summary>
    public class BuildingsApiClient : MonoBehaviour
    {
        [Tooltip("Base URL of the cityverse-iot service, e.g. http://localhost:3002")]
        public string baseUrl = "http://localhost:3002";

        [Tooltip("How often (seconds) to poll for new building state")]
        public float pollIntervalSeconds = 5f;

        [Header("Global Overlay Settings")]
        [Range(0.01f, 1f)]
        [Tooltip("Master world-space scale for all building overlay labels")]
        public float overlayTextScale = 0.1f;

        public event Action<BuildingStateDto[]> OnBuildingsUpdated;
        public event Action<string> OnBuildingsError;

        /// <summary>Most recent building list, or null before the first successful poll.</summary>
        public BuildingStateDto[] LatestBuildings { get; private set; }

        private Coroutine _pollCoroutine;

        private void OnEnable()
        {
            _pollCoroutine = StartCoroutine(PollLoop());
        }

        private void OnDisable()
        {
            if (_pollCoroutine != null)
                StopCoroutine(_pollCoroutine);
        }

        private IEnumerator PollLoop()
        {
            while (true)
            {
                yield return FetchCurrentBuildings();
                yield return new WaitForSeconds(pollIntervalSeconds);
            }
        }

        private IEnumerator FetchCurrentBuildings()
        {
            string url = baseUrl.TrimEnd('/') + "/buildings/current";

            using var req = UnityWebRequest.Get(url);
            req.timeout = 10;

            yield return req.SendWebRequest();

            if (req.result != UnityWebRequest.Result.Success)
            {
                OnBuildingsError?.Invoke($"[BuildingsApiClient] request failed: {req.error}");
                yield break;
            }

            string json = req.downloadHandler.text;

            BuildingListApiResponse envelope;
            try
            {
                envelope = JsonUtility.FromJson<BuildingListApiResponse>(json);
            }
            catch (Exception ex)
            {
                OnBuildingsError?.Invoke($"[BuildingsApiClient] JSON parse error: {ex.Message}\nRaw: {json}");
                yield break;
            }

            if (envelope == null || !envelope.ok || envelope.data == null)
            {
                OnBuildingsError?.Invoke($"[BuildingsApiClient] service returned ok:false or empty data. Raw: {json}");
                yield break;
            }

            LatestBuildings = envelope.data;
            OnBuildingsUpdated?.Invoke(envelope.data);
        }
    }
}
