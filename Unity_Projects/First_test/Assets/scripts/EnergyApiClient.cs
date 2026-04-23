using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

namespace Cityverse.Receiver
{
    public class EnergyApiClient : MonoBehaviour
    {
        [Tooltip("Base URL of the cityverse-iot service, e.g. http://localhost:3002")]
        public string baseUrl = "http://localhost:3002";

        [Tooltip("How often (seconds) to poll for new energy data")]
        public float pollIntervalSeconds = 5f;

        public event Action<EnergyStateDto> OnEnergyUpdated;
        public event Action<string> OnEnergyError;

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
                yield return FetchCurrentEnergy();
                yield return new WaitForSeconds(pollIntervalSeconds);
            }
        }

        private IEnumerator FetchCurrentEnergy()
        {
            string url = baseUrl.TrimEnd('/') + "/energy/current";

            using var req = UnityWebRequest.Get(url);
            req.timeout = 10;

            yield return req.SendWebRequest();

            if (req.result != UnityWebRequest.Result.Success)
            {
                OnEnergyError?.Invoke($"[EnergyApiClient] request failed: {req.error}");
                yield break;
            }

            string json = req.downloadHandler.text;

            EnergyApiResponse envelope;
            try
            {
                envelope = JsonUtility.FromJson<EnergyApiResponse>(json);
            }
            catch (Exception ex)
            {
                OnEnergyError?.Invoke($"[EnergyApiClient] JSON parse error: {ex.Message}\nRaw: {json}");
                yield break;
            }

            if (envelope == null || !envelope.ok || envelope.data == null)
            {
                OnEnergyError?.Invoke($"[EnergyApiClient] service returned ok:false or empty data. Raw: {json}");
                yield break;
            }

            OnEnergyUpdated?.Invoke(envelope.data);
        }
    }
}
