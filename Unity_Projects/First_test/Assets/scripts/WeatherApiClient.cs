using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

namespace Cityverse.Receiver
{
    /// <summary>
    /// Thin HTTP client that polls GET /weather/current and invokes a callback
    /// with the deserialised payload.  Drop this onto any GameObject alongside
    /// WeatherReceiverBehaviour, or use it standalone.
    /// </summary>
    public class WeatherApiClient : MonoBehaviour
    {
        [Tooltip("Base URL of the cityverse-iot service, e.g. http://localhost:3002")]
        public string baseUrl = "http://localhost:3002";

        [Tooltip("How often (seconds) to poll for new weather data")]
        public float pollIntervalSeconds = 5f;

        /// <summary>Fires each time a successful response arrives.</summary>
        public event Action<WeatherStateDto> OnWeatherUpdated;

        /// <summary>Fires when the request fails or the service returns ok:false.</summary>
        public event Action<string> OnWeatherError;

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
                yield return FetchCurrentWeather();
                yield return new WaitForSeconds(pollIntervalSeconds);
            }
        }

        private IEnumerator FetchCurrentWeather()
        {
            string url = baseUrl.TrimEnd('/') + "/weather/current";

            using var req = UnityWebRequest.Get(url);
            req.timeout = 10;

            yield return req.SendWebRequest();

            if (req.result != UnityWebRequest.Result.Success)
            {
                OnWeatherError?.Invoke($"[WeatherApiClient] request failed: {req.error}");
                yield break;
            }

            string json = req.downloadHandler.text;

            WeatherApiResponse envelope;
            try
            {
                envelope = JsonUtility.FromJson<WeatherApiResponse>(json);
            }
            catch (Exception ex)
            {
                OnWeatherError?.Invoke($"[WeatherApiClient] JSON parse error: {ex.Message}\nRaw: {json}");
                yield break;
            }

            if (envelope == null || !envelope.ok || envelope.data == null)
            {
                OnWeatherError?.Invoke($"[WeatherApiClient] service returned ok:false or empty data. Raw: {json}");
                yield break;
            }

            OnWeatherUpdated?.Invoke(envelope.data);
        }
    }
}
