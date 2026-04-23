using UnityEngine;

namespace Cityverse.Receiver
{
    /// <summary>
    /// Main entry point for the weather receiver slice.
    ///
    /// Setup:
    ///   1. Add this component to a GameObject (e.g. "WeatherReceiver").
    ///   2. Add WeatherApiClient to the same GameObject (or assign it via inspector).
    ///   3. Hit Play – values are logged each poll cycle.
    ///   4. Optionally wire the public Light reference to drive ambient intensity.
    /// </summary>
    [RequireComponent(typeof(WeatherApiClient))]
    public class WeatherReceiverBehaviour : MonoBehaviour
    {
        [Header("Live State (read-only in Play mode)")]
        [SerializeField] private string  condition;
        [SerializeField] private float   temperatureC;
        [SerializeField] private float   feelsLikeC;
        [SerializeField] private float   humidity;
        [SerializeField] private float   pressureHpa;
        [SerializeField] private float   windSpeedMs;
        [SerializeField] private float   windDirectionDeg;
        [SerializeField] private float   cloudCover;
        [SerializeField] private float   precipitationMmH;
        [SerializeField] private bool    isDaytime;
        [SerializeField] private string  season;
        [SerializeField] private string  updatedAt;

        [Header("Optional – Light Reaction")]
        [Tooltip("Assign a Directional Light to have its intensity driven by day/cloud values")]
        public Light sunLight;

        [Tooltip("Maximum light intensity used on a clear daytime")]
        public float maxSunIntensity = 1.2f;

        // Cached reference
        private WeatherApiClient _client;

        private void Awake()
        {
            _client = GetComponent<WeatherApiClient>();
        }

        private void OnEnable()
        {
            _client.OnWeatherUpdated += HandleWeatherUpdate;
            _client.OnWeatherError   += HandleWeatherError;
        }

        private void OnDisable()
        {
            _client.OnWeatherUpdated -= HandleWeatherUpdate;
            _client.OnWeatherError   -= HandleWeatherError;
        }

        private void HandleWeatherUpdate(WeatherStateDto dto)
        {
            // Cache into serialised fields so values are visible in the Inspector
            condition        = dto.condition;
            temperatureC     = dto.temperatureC;
            feelsLikeC       = dto.feelsLikeC;
            humidity         = dto.humidity;
            pressureHpa      = dto.pressureHpa;
            windSpeedMs      = dto.windSpeedMs;
            windDirectionDeg = dto.windDirectionDeg;
            cloudCover       = dto.cloudCover;
            precipitationMmH = dto.precipitationMmH;
            isDaytime        = dto.isDaytime;
            season           = dto.season;
            updatedAt        = dto.updatedAt;

            Debug.Log(
                $"[Weather] {dto.updatedAt} | {dto.condition} | " +
                $"{dto.temperatureC:F1}°C (feels {dto.feelsLikeC:F1}°C) | " +
                $"Humidity {dto.humidity:F0}% | Pressure {dto.pressureHpa:F0} hPa | " +
                $"Wind {dto.windSpeedMs:F1} m/s @ {dto.windDirectionDeg:F0}° | " +
                $"Cloud {dto.cloudCover * 100:F0}% | Precip {dto.precipitationMmH:F2} mm/h | " +
                $"Daytime: {dto.isDaytime} | Season: {dto.season}"
            );

            ApplyLightReaction(dto);
        }

        private void HandleWeatherError(string message)
        {
            Debug.LogWarning(message);
        }

        /// <summary>
        /// Simple ambient light reaction:
        ///   intensity = maxSunIntensity * (isDaytime ? 1 : 0.05) * (1 - cloudCover * 0.7)
        /// No extra packages needed – just a Directional Light reference.
        /// </summary>
        private void ApplyLightReaction(WeatherStateDto dto)
        {
            if (sunLight == null) return;

            float dayFactor   = dto.isDaytime ? 1f : 0.05f;
            float cloudFactor = 1f - dto.cloudCover * 0.7f;   // full overcast → 30 % of day value
            sunLight.intensity = maxSunIntensity * dayFactor * cloudFactor;
        }
    }
}
