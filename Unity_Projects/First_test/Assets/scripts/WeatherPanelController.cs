using TMPro;
using UnityEngine;

namespace Cityverse.Receiver
{
    /// <summary>
    /// Updates a simple Unity UI weather dashboard from the shared WeatherApiClient.
    /// Attach this to a WeatherPanel and wire the TMP text fields in the Inspector.
    /// </summary>
    public class WeatherPanelController : MonoBehaviour
    {
        [Header("Data Source")]
        [Tooltip("Shared WeatherApiClient in the scene")]
        public WeatherApiClient weatherClient;

        [Header("UI Fields")]
        public TMP_Text conditionText;
        public TMP_Text temperatureText;
        public TMP_Text windText;
        public TMP_Text cloudText;
        public TMP_Text dayNightText;
        public TMP_Text seasonText;
        public TMP_Text statusText;

        private void OnEnable()
        {
            if (weatherClient == null)
                weatherClient = FindFirstObjectByType<WeatherApiClient>();

            SetDefaults();

            if (weatherClient != null)
            {
                weatherClient.OnWeatherUpdated += HandleWeatherUpdated;
                weatherClient.OnWeatherError += HandleWeatherError;

                if (weatherClient.LatestWeather != null)
                    HandleWeatherUpdated(weatherClient.LatestWeather);
            }
            else
            {
                SetStatus("Weather client missing");
            }
        }

        private void OnDisable()
        {
            if (weatherClient != null)
            {
                weatherClient.OnWeatherUpdated -= HandleWeatherUpdated;
                weatherClient.OnWeatherError -= HandleWeatherError;
            }
        }

        private void SetDefaults()
        {
            SetText(conditionText, "Condition: --");
            SetText(temperatureText, "Temperature: --");
            SetText(windText, "Wind: --");
            SetText(cloudText, "Clouds: --");
            SetText(dayNightText, "Day/Night: --");
            SetText(seasonText, "Season: --");
            SetStatus("Waiting for weather data...");
        }

        private void HandleWeatherUpdated(WeatherStateDto dto)
        {
            SetText(conditionText, $"Condition: {dto.condition}");
            SetText(temperatureText, $"Temperature: {dto.temperatureC:F1}°C (feels {dto.feelsLikeC:F1}°C)");
            SetText(windText, $"Wind: {dto.windSpeedMs:F1} m/s @ {dto.windDirectionDeg:F0}°");
            SetText(cloudText, $"Clouds: {dto.cloudCover * 100f:F0}% | Rain: {dto.precipitationMmH:F2} mm/h");
            SetText(dayNightText, dto.isDaytime ? "Day/Night: Day" : "Day/Night: Night");
            SetText(seasonText, $"Season: {dto.season}");
            SetStatus($"Updated: {dto.updatedAt}");
        }

        private void HandleWeatherError(string message)
        {
            SetStatus(message);
        }

        private void SetStatus(string value)
        {
            SetText(statusText, value);
        }

        private static void SetText(TMP_Text field, string value)
        {
            if (field != null)
            {
                field.text = value;
            }
        }
    }
}
