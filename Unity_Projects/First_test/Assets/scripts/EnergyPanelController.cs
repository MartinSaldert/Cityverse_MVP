using TMPro;
using UnityEngine;

namespace Cityverse.Receiver
{
    /// <summary>
    /// Updates a simple Unity UI energy dashboard from the shared EnergyApiClient.
    /// Attach this to your EnergyPanel and wire the TMP text fields in the Inspector.
    /// </summary>
    public class EnergyPanelController : MonoBehaviour
    {
        [Header("Data Source")]
        [Tooltip("Shared EnergyApiClient in the scene")]
        public EnergyApiClient energyClient;

        [Header("UI Fields")]
        public TMP_Text solarValueText;
        public TMP_Text windValueText;
        public TMP_Text renewableTotalValueText;
        public TMP_Text oilPlantValueText;
        public TMP_Text statusText;

        [Header("Display Settings")]
        [Tooltip("Placeholder text for plant types not connected yet")]
        public string unavailableText = "Not connected";

        private void OnEnable()
        {
            if (energyClient != null)
            {
                energyClient.OnEnergyUpdated += HandleEnergyUpdated;
                energyClient.OnEnergyError += HandleEnergyError;
            }
            else
            {
                SetStatus("Energy client missing");
            }

            SetDefaults();
        }

        private void OnDisable()
        {
            if (energyClient != null)
            {
                energyClient.OnEnergyUpdated -= HandleEnergyUpdated;
                energyClient.OnEnergyError -= HandleEnergyError;
            }
        }

        private void SetDefaults()
        {
            SetText(solarValueText, "Solar: --");
            SetText(windValueText, "Wind: --");
            SetText(renewableTotalValueText, "Renewables: --");
            SetText(oilPlantValueText, $"Oil Plant: {unavailableText}");
            SetStatus("Waiting for energy data...");
        }

        private void HandleEnergyUpdated(EnergyStateDto dto)
        {
            SetText(solarValueText, $"Solar: {dto.solarOutputKw:F1} kW");
            SetText(windValueText, $"Wind: {dto.windOutputKw:F1} kW");
            SetText(renewableTotalValueText, $"Renewables: {dto.totalRenewableKw:F1} kW");
            SetText(oilPlantValueText, $"Oil Plant: {unavailableText}");
            SetStatus($"Updated: {dto.updatedAt}");
        }

        private void HandleEnergyError(string message)
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
