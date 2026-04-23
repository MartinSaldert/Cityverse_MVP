using TMPro;
using UnityEngine;

namespace Cityverse.Receiver
{
    /// <summary>
    /// Combined lightweight HUD controller for Cityverse weather + energy.
    /// Attach to a top-level HUD object and wire the shared clients plus TMP text fields.
    /// </summary>
    public class CityverseHUDController : MonoBehaviour
    {
        [Header("Data Sources")]
        public WeatherApiClient weatherClient;
        public EnergyApiClient energyClient;

        [Header("Weather UI")]
        public TMP_Text conditionText;
        public TMP_Text temperatureText;
        public TMP_Text weatherStatusText;

        [Header("Energy UI")]
        public TMP_Text solarText;
        public TMP_Text windText;
        public TMP_Text renewablesText;
        public TMP_Text oilPlantText;
        public TMP_Text energyStatusText;

        [Header("Display Settings")]
        public string unavailableText = "Not connected";

        private void OnEnable()
        {
            if (weatherClient != null)
            {
                weatherClient.OnWeatherUpdated += HandleWeatherUpdated;
                weatherClient.OnWeatherError += HandleWeatherError;
            }
            else
            {
                SetText(weatherStatusText, "Weather client missing");
            }

            if (energyClient != null)
            {
                energyClient.OnEnergyUpdated += HandleEnergyUpdated;
                energyClient.OnEnergyError += HandleEnergyError;
            }
            else
            {
                SetText(energyStatusText, "Energy client missing");
            }

            SetDefaults();
        }

        private void OnDisable()
        {
            if (weatherClient != null)
            {
                weatherClient.OnWeatherUpdated -= HandleWeatherUpdated;
                weatherClient.OnWeatherError -= HandleWeatherError;
            }

            if (energyClient != null)
            {
                energyClient.OnEnergyUpdated -= HandleEnergyUpdated;
                energyClient.OnEnergyError -= HandleEnergyError;
            }
        }

        private void SetDefaults()
        {
            SetText(conditionText, "Condition: --");
            SetText(temperatureText, "Temperature: --");
            SetText(weatherStatusText, "Waiting for weather data...");

            SetText(solarText, "Solar: --");
            SetText(windText, "Wind: --");
            SetText(renewablesText, "Renewables: --");
            SetText(oilPlantText, $"Oil Plant: {unavailableText}");
            SetText(energyStatusText, "Waiting for energy data...");
        }

        private void HandleWeatherUpdated(WeatherStateDto dto)
        {
            SetText(conditionText, $"Condition: {dto.condition}");
            SetText(temperatureText, $"Temperature: {dto.temperatureC:F1}°C");
            SetText(weatherStatusText, $"Weather updated: {dto.updatedAt}");
        }

        private void HandleWeatherError(string message)
        {
            SetText(weatherStatusText, message);
        }

        private void HandleEnergyUpdated(EnergyStateDto dto)
        {
            SetText(solarText, $"Solar: {dto.solarOutputKw:F1} kW");
            SetText(windText, $"Wind: {dto.windOutputKw:F1} kW");
            SetText(renewablesText, $"Renewables: {dto.totalRenewableKw:F1} kW");
            SetText(oilPlantText, $"Oil Plant: {unavailableText}");
            SetText(energyStatusText, $"Energy updated: {dto.updatedAt}");
        }

        private void HandleEnergyError(string message)
        {
            SetText(energyStatusText, message);
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
